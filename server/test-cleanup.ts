/**
 * Shared test cleanup utility.
 * 
 * All test files should use this to ensure test data is properly cleaned up
 * after each test run. This prevents data pollution in the database.
 * 
 * Usage:
 *   import { TestCleanup } from "./test-cleanup";
 *   const cleanup = new TestCleanup();
 *   // ... in tests, track created entities:
 *   cleanup.trackCustomer(id);
 *   cleanup.trackEmployee(id);
 *   cleanup.trackInvoice(id);
 *   cleanup.trackBillingEntity(id);
 *   cleanup.trackCountry(countryCode);
 *   // ... in afterAll:
 *   await cleanup.run();
 */

import { getDb } from "./db";
import { 
  customers, employees, invoices, invoiceItems,
  billingEntities, leaveBalances, leaveRecords,
  adjustments, employeeDocuments, employeeContracts,
  customerLeavePolicies, customerContacts, customerContracts,
  customerPricing, payrollItems, payrollRuns,
  countriesConfig, leaveTypes, users,
  vendors, vendorBills, vendorBillItems,
} from "../drizzle/schema";
import { eq, inArray } from "drizzle-orm";

export class TestCleanup {
  private customerIds: number[] = [];
  private employeeIds: number[] = [];
  private invoiceIds: number[] = [];
  private billingEntityIds: number[] = [];
  private countryCodes: string[] = [];
  private payrollRunIds: number[] = [];
  private userIds: number[] = [];
  private vendorIds: number[] = [];
  private vendorBillIds: number[] = [];

  trackCustomer(id: number) { if (id) this.customerIds.push(id); }
  trackEmployee(id: number) { if (id) this.employeeIds.push(id); }
  trackInvoice(id: number) { if (id) this.invoiceIds.push(id); }
  trackBillingEntity(id: number) { if (id) this.billingEntityIds.push(id); }
  trackCountry(code: string) { if (code) this.countryCodes.push(code); }
  trackPayrollRun(id: number) { if (id) this.payrollRunIds.push(id); }
  trackUser(id: number) { if (id) this.userIds.push(id); }
  trackVendor(id: number) { if (id) this.vendorIds.push(id); }
  trackVendorBill(id: number) { if (id) this.vendorBillIds.push(id); }

  async run() {
    const db = await getDb();
    if (!db) return;

    try {
      // 1. Delete invoice items for tracked invoices
      if (this.invoiceIds.length > 0) {
        await db.delete(invoiceItems).where(inArray(invoiceItems.invoiceId, this.invoiceIds)).catch(() => {});
      }

      // 2. Delete invoices
      if (this.invoiceIds.length > 0) {
        await db.delete(invoices).where(inArray(invoices.id, this.invoiceIds)).catch(() => {});
      }

      // 3. Delete employee-related data
      if (this.employeeIds.length > 0) {
        await db.delete(leaveRecords).where(inArray(leaveRecords.employeeId, this.employeeIds)).catch(() => {});
        await db.delete(leaveBalances).where(inArray(leaveBalances.employeeId, this.employeeIds)).catch(() => {});
        await db.delete(adjustments).where(inArray(adjustments.employeeId, this.employeeIds)).catch(() => {});
        await db.delete(employeeDocuments).where(inArray(employeeDocuments.employeeId, this.employeeIds)).catch(() => {});
        await db.delete(employeeContracts).where(inArray(employeeContracts.employeeId, this.employeeIds)).catch(() => {});
        await db.delete(payrollItems).where(inArray(payrollItems.employeeId, this.employeeIds)).catch(() => {});
      }

      // 4. Delete payroll runs
      if (this.payrollRunIds.length > 0) {
        await db.delete(payrollRuns).where(inArray(payrollRuns.id, this.payrollRunIds)).catch(() => {});
      }

      // 5. Delete employees
      if (this.employeeIds.length > 0) {
        await db.delete(employees).where(inArray(employees.id, this.employeeIds)).catch(() => {});
      }

      // 6. Delete customer-related data
      if (this.customerIds.length > 0) {
        await db.delete(customerLeavePolicies).where(inArray(customerLeavePolicies.customerId, this.customerIds)).catch(() => {});
        await db.delete(customerContacts).where(inArray(customerContacts.customerId, this.customerIds)).catch(() => {});
        await db.delete(customerContracts).where(inArray(customerContracts.customerId, this.customerIds)).catch(() => {});
        await db.delete(customerPricing).where(inArray(customerPricing.customerId, this.customerIds)).catch(() => {});
        // Also delete invoices belonging to these customers (in case they weren't tracked individually)
        const custInvoices = await db.select({ id: invoices.id }).from(invoices).where(inArray(invoices.customerId, this.customerIds));
        const custInvoiceIds = custInvoices.map(i => i.id);
        if (custInvoiceIds.length > 0) {
          await db.delete(invoiceItems).where(inArray(invoiceItems.invoiceId, custInvoiceIds)).catch(() => {});
          await db.delete(invoices).where(inArray(invoices.id, custInvoiceIds)).catch(() => {});
        }
      }

      // 7. Delete customers
      if (this.customerIds.length > 0) {
        await db.delete(customers).where(inArray(customers.id, this.customerIds)).catch(() => {});
      }

      // 8. Delete billing entities
      if (this.billingEntityIds.length > 0) {
        await db.delete(billingEntities).where(inArray(billingEntities.id, this.billingEntityIds)).catch(() => {});
      }

      // 9. Delete test countries and their leave types
      if (this.countryCodes.length > 0) {
        await db.delete(leaveTypes).where(inArray(leaveTypes.countryCode, this.countryCodes)).catch(() => {});
        await db.delete(countriesConfig).where(inArray(countriesConfig.countryCode, this.countryCodes)).catch(() => {});
      }

      // 10. Delete vendor bill items and vendor bills
      if (this.vendorBillIds.length > 0) {
        await db.delete(vendorBillItems).where(inArray(vendorBillItems.vendorBillId, this.vendorBillIds)).catch(() => {});
        await db.delete(vendorBills).where(inArray(vendorBills.id, this.vendorBillIds)).catch(() => {});
      }

      // 11. Delete vendors
      if (this.vendorIds.length > 0) {
        // Also delete vendor bills belonging to these vendors
        const vBills = await db.select({ id: vendorBills.id }).from(vendorBills).where(inArray(vendorBills.vendorId, this.vendorIds));
        const vBillIds = vBills.map(b => b.id);
        if (vBillIds.length > 0) {
          await db.delete(vendorBillItems).where(inArray(vendorBillItems.vendorBillId, vBillIds)).catch(() => {});
          await db.delete(vendorBills).where(inArray(vendorBills.id, vBillIds)).catch(() => {});
        }
        await db.delete(vendors).where(inArray(vendors.id, this.vendorIds)).catch(() => {});
      }

      // 12. Delete test users
      if (this.userIds.length > 0) {
        await db.delete(users).where(inArray(users.id, this.userIds)).catch(() => {});
      }
    } catch (e) {
      console.error("[TestCleanup] Error during cleanup:", e);
    }
  }
}
