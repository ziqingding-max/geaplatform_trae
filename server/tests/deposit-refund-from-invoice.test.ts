/**
 * Tests for deposit refund creation from paid deposit invoices.
 * 
 * Verifies:
 * 1. Can create deposit refund for terminated employee's paid deposit
 * 2. Cannot create deposit refund if employee is not terminated
 * 3. Cannot create deposit refund if one already exists (duplicate check)
 * 4. Mutual exclusion: cannot create refund if credit note already exists
 * 5. Proper cleanup of all test data
 */
import { describe, it, expect, afterAll } from "vitest";
import { TestCleanup } from "./test-cleanup";
import { getDb } from "./db";
import {
  customers,
  employees,
  invoices,
  invoiceItems,
  type InsertCustomer,
  type InsertEmployee,
  type InsertInvoice,
  type InsertInvoiceItem,
} from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { generateDepositRefund } from "./services/depositRefundService";

const cleanup = new TestCleanup();

// Test data prefix per skill guidelines
const PREFIX = "__TEST__DRI";

describe("Deposit Refund from Invoice", () => {
  let testCustomerId: number;
  let testEmployeeActiveId: number;
  let testEmployeeTerminatedId: number;
  let testDepositInvoiceActiveId: number;
  let testDepositInvoiceTerminatedId: number;
  let testDepositInvoiceCreditedId: number;
  let testEmployeeCreditedId: number;

  // Setup: create test customer, employees, and deposit invoices
  it("should set up test data", async () => {
    const db = await getDb();
    expect(db).toBeTruthy();

    // Create test customer
    const customerData: InsertCustomer = {
      companyName: `${PREFIX} Corp`,
      country: "SG",
      status: "active",
      billingCurrency: "USD",
      paymentTerms: "net_30",
    };
    const [custResult] = await db!.insert(customers).values(customerData);
    testCustomerId = (custResult as any).insertId;
    cleanup.trackCustomer(testCustomerId);

    // Create active employee (should NOT be able to get refund)
    const activeEmpData: InsertEmployee = {
      customerId: testCustomerId,
      firstName: `${PREFIX}Active`,
      lastName: "Employee",
      employeeCode: `${PREFIX}-ACT001`,
      email: `${PREFIX}-active@test.example.com`,
      jobTitle: "Tester",
      country: "SG",
      status: "active",
      startDate: new Date("2025-01-01"),
      baseSalary: "5000.00",
      salaryCurrency: "SGD",
    };
    const [activeEmpResult] = await db!.insert(employees).values(activeEmpData);
    testEmployeeActiveId = (activeEmpResult as any).insertId;
    cleanup.trackEmployee(testEmployeeActiveId);

    // Create terminated employee (should be able to get refund)
    const termEmpData: InsertEmployee = {
      customerId: testCustomerId,
      firstName: `${PREFIX}Term`,
      lastName: "Employee",
      employeeCode: `${PREFIX}-TRM001`,
      email: `${PREFIX}-term@test.example.com`,
      jobTitle: "Tester",
      country: "SG",
      status: "terminated",
      startDate: new Date("2025-01-01"),
      endDate: new Date("2026-02-01"),
      baseSalary: "5000.00",
      salaryCurrency: "SGD",
    };
    const [termEmpResult] = await db!.insert(employees).values(termEmpData);
    testEmployeeTerminatedId = (termEmpResult as any).insertId;
    cleanup.trackEmployee(testEmployeeTerminatedId);

    // Create terminated employee for credit note mutual exclusion test
    const creditedEmpData: InsertEmployee = {
      customerId: testCustomerId,
      firstName: `${PREFIX}Credited`,
      lastName: "Employee",
      employeeCode: `${PREFIX}-CRD001`,
      email: `${PREFIX}-credited@test.example.com`,
      jobTitle: "Tester",
      country: "SG",
      status: "terminated",
      startDate: new Date("2025-01-01"),
      endDate: new Date("2026-02-01"),
      baseSalary: "5000.00",
      salaryCurrency: "SGD",
    };
    const [creditedEmpResult] = await db!.insert(employees).values(creditedEmpData);
    testEmployeeCreditedId = (creditedEmpResult as any).insertId;
    cleanup.trackEmployee(testEmployeeCreditedId);

    // Create paid deposit invoice for active employee
    const activeDepositData: InsertInvoice = {
      customerId: testCustomerId,
      invoiceNumber: `${PREFIX}-DEP-ACT-001`,
      invoiceType: "deposit",
      currency: "USD",
      subtotal: "1000.00",
      serviceFeeTotal: "0",
      tax: "0",
      total: "1000.00",
      status: "paid",
      invoiceMonth: new Date("2025-01-01"),
    };
    const [activeDepResult] = await db!.insert(invoices).values(activeDepositData);
    testDepositInvoiceActiveId = (activeDepResult as any).insertId;
    cleanup.trackInvoice(testDepositInvoiceActiveId);

    // Create line item for active employee deposit
    const activeItemData: InsertInvoiceItem = {
      invoiceId: testDepositInvoiceActiveId,
      employeeId: testEmployeeActiveId,
      description: `Deposit - ${PREFIX}Active Employee`,
      quantity: "1",
      unitPrice: "1000.00",
      amount: "1000.00",
      itemType: "deposit",
      countryCode: "SG",
    };
    await db!.insert(invoiceItems).values(activeItemData);

    // Create paid deposit invoice for terminated employee
    const termDepositData: InsertInvoice = {
      customerId: testCustomerId,
      invoiceNumber: `${PREFIX}-DEP-TERM-001`,
      invoiceType: "deposit",
      currency: "USD",
      subtotal: "2000.00",
      serviceFeeTotal: "0",
      tax: "0",
      total: "2000.00",
      status: "paid",
      invoiceMonth: new Date("2025-01-01"),
    };
    const [termDepResult] = await db!.insert(invoices).values(termDepositData);
    testDepositInvoiceTerminatedId = (termDepResult as any).insertId;
    cleanup.trackInvoice(testDepositInvoiceTerminatedId);

    // Create line item for terminated employee deposit
    const termItemData: InsertInvoiceItem = {
      invoiceId: testDepositInvoiceTerminatedId,
      employeeId: testEmployeeTerminatedId,
      description: `Deposit - ${PREFIX}Term Employee`,
      quantity: "1",
      unitPrice: "2000.00",
      amount: "2000.00",
      itemType: "deposit",
      countryCode: "SG",
    };
    await db!.insert(invoiceItems).values(termItemData);

    // Create paid deposit invoice for credited employee (will have a credit note)
    const creditedDepositData: InsertInvoice = {
      customerId: testCustomerId,
      invoiceNumber: `${PREFIX}-DEP-CRD-001`,
      invoiceType: "deposit",
      currency: "USD",
      subtotal: "1500.00",
      serviceFeeTotal: "0",
      tax: "0",
      total: "1500.00",
      status: "paid",
      invoiceMonth: new Date("2025-01-01"),
    };
    const [creditedDepResult] = await db!.insert(invoices).values(creditedDepositData);
    testDepositInvoiceCreditedId = (creditedDepResult as any).insertId;
    cleanup.trackInvoice(testDepositInvoiceCreditedId);

    // Create line item for credited employee deposit
    const creditedItemData: InsertInvoiceItem = {
      invoiceId: testDepositInvoiceCreditedId,
      employeeId: testEmployeeCreditedId,
      description: `Deposit - ${PREFIX}Credited Employee`,
      quantity: "1",
      unitPrice: "1500.00",
      amount: "1500.00",
      itemType: "deposit",
      countryCode: "SG",
    };
    await db!.insert(invoiceItems).values(creditedItemData);

    // Create an existing credit note for the credited deposit (mutual exclusion)
    const creditNoteData: InsertInvoice = {
      customerId: testCustomerId,
      invoiceNumber: `${PREFIX}-CN-001`,
      invoiceType: "credit_note",
      currency: "USD",
      subtotal: "-1500.00",
      serviceFeeTotal: "0",
      tax: "0",
      total: "-1500.00",
      status: "draft",
      relatedInvoiceId: testDepositInvoiceCreditedId,
      invoiceMonth: new Date("2025-01-01"),
    };
    const [cnResult] = await db!.insert(invoices).values(creditNoteData);
    cleanup.trackInvoice((cnResult as any).insertId);

    expect(testCustomerId).toBeGreaterThan(0);
    expect(testEmployeeActiveId).toBeGreaterThan(0);
    expect(testEmployeeTerminatedId).toBeGreaterThan(0);
  });

  it("should NOT create deposit refund for active employee", async () => {
    const result = await generateDepositRefund(testEmployeeActiveId);
    expect(result.invoiceId).toBeNull();
    // Service returns: "Employee must be in 'terminated' status..."
    expect(result.message.toLowerCase()).toContain("terminated");
  });

  it("should create deposit refund for terminated employee", async () => {
    const result = await generateDepositRefund(testEmployeeTerminatedId);
    expect(result.invoiceId).toBeTruthy();
    expect(typeof result.invoiceId).toBe("number");
    expect(result.message.toLowerCase()).toContain("refund");
    cleanup.trackInvoice(result.invoiceId!);

    // Verify the refund invoice
    const db = await getDb();
    const [refundInvoice] = await db!
      .select()
      .from(invoices)
      .where(eq(invoices.id, result.invoiceId!));

    expect(refundInvoice.invoiceType).toBe("deposit_refund");
    expect(refundInvoice.status).toBe("draft");
    expect(parseFloat(refundInvoice.total?.toString() || "0")).toBe(-2000);
    expect(refundInvoice.relatedInvoiceId).toBe(testDepositInvoiceTerminatedId);
    expect(refundInvoice.customerId).toBe(testCustomerId);

    // Verify line item
    const refundItems = await db!
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, result.invoiceId!));
    expect(refundItems.length).toBe(1);
    expect(refundItems[0].employeeId).toBe(testEmployeeTerminatedId);
    expect(parseFloat(refundItems[0].unitPrice?.toString() || "0")).toBe(-2000);
  });

  it("should NOT create duplicate deposit refund", async () => {
    const result = await generateDepositRefund(testEmployeeTerminatedId);
    expect(result.invoiceId).toBeNull();
    expect(result.message.toLowerCase()).toContain("already exists");
  });

  it("should NOT create deposit refund when credit note already exists (mutual exclusion)", async () => {
    const result = await generateDepositRefund(testEmployeeCreditedId);
    expect(result.invoiceId).toBeNull();
    expect(result.message.toLowerCase()).toContain("credit note");
    expect(result.message.toLowerCase()).toContain("mutually exclusive");
  });

  afterAll(async () => {
    await cleanup.run();
    
    // Verify cleanup
    const db = await getDb();
    if (db) {
      const remainingCustomers = await db.select({ id: customers.id }).from(customers).where(eq(customers.id, testCustomerId));
      expect(remainingCustomers.length).toBe(0);
    }
  });
});
