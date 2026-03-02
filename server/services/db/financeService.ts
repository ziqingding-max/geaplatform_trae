
import { eq, like, count, desc, and, inArray, sum } from "drizzle-orm";
import { 
  invoices, InsertInvoice,
  invoiceItems, InsertInvoiceItem,
  payrollRuns, InsertPayrollRun,
  payrollItems, InsertPayrollItem,
  adjustments, InsertAdjustment,
  reimbursements, InsertReimbursement,
  creditNoteApplications, InsertCreditNoteApplication,
  vendors, InsertVendor,
  vendorBills, InsertVendorBill,
  vendorBillItems, InsertVendorBillItem,
  billInvoiceAllocations, InsertBillInvoiceAllocation,
  customers
} from "../../../drizzle/schema";
import { getDb } from "./connection";

// INVOICES
export async function createInvoice(data: InsertInvoice) {
  const db = await getDb();
  if (!db) return [];
  return await db.insert(invoices).values(data);
}

export async function getInvoiceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  return result[0];
}

export async function listInvoices(page: number = 1, pageSize: number = 50, search?: string) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const where = search ? like(invoices.invoiceNumber, `%${search}%`) : undefined;
  
  const [data, totalResult] = await Promise.all([
    db.select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      customerId: invoices.customerId,
      customerName: customers.companyName,
      status: invoices.status,
      issueDate: invoices.issueDate,
      dueDate: invoices.dueDate,
      totalAmount: invoices.totalAmount,
      currency: invoices.currency,
      type: invoices.type
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .where(where)
    .limit(pageSize)
    .offset(offset)
    .orderBy(desc(invoices.createdAt)),
    db.select({ count: count() }).from(invoices).where(where)
  ]);
  
  return { data, total: totalResult[0]?.count || 0 };
}

export async function getRelatedInvoices(invoiceId: number) {
  // Placeholder for related invoices logic (e.g. credit notes applied)
  return [];
}

export async function updateInvoice(id: number, data: Partial<InsertInvoice>) {
  const db = await getDb();
  if (!db) return;
  await db.update(invoices).set(data).where(eq(invoices.id, id));
}

export async function deleteInvoice(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(invoices).where(eq(invoices.id, id));
}

export async function createInvoiceItem(data: InsertInvoiceItem) {
  const db = await getDb();
  if (!db) return;
  await db.insert(invoiceItems).values(data);
}

export async function listInvoiceItemsByInvoice(invoiceId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
}

export async function updateInvoiceItem(id: number, data: Partial<InsertInvoiceItem>) {
  const db = await getDb();
  if (!db) return;
  await db.update(invoiceItems).set(data).where(eq(invoiceItems.id, id));
}

export async function deleteInvoiceItem(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(invoiceItems).where(eq(invoiceItems.id, id));
}

export async function getInvoiceProfitAnalysis(invoiceId: number) {
  // Complex logic placeholder
  return null;
}

// PAYROLL
export async function createPayrollRun(data: InsertPayrollRun) {
  const db = await getDb();
  if (!db) return [];
  return await db.insert(payrollRuns).values(data);
}

export async function getPayrollRunById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(payrollRuns).where(eq(payrollRuns.id, id)).limit(1);
  return result[0];
}

export async function listPayrollRuns(page: number = 1, pageSize: number = 50) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * pageSize;
  
  const [data, totalResult] = await Promise.all([
    db.select().from(payrollRuns).limit(pageSize).offset(offset).orderBy(desc(payrollRuns.createdAt)),
    db.select({ count: count() }).from(payrollRuns)
  ]);
  
  return { data, total: totalResult[0]?.count || 0 };
}

export async function updatePayrollRun(id: number, data: Partial<InsertPayrollRun>) {
  const db = await getDb();
  if (!db) return;
  await db.update(payrollRuns).set(data).where(eq(payrollRuns.id, id));
}

export async function findPayrollRunByCountryMonth(country: string, month: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(payrollRuns).where(and(eq(payrollRuns.country, country), eq(payrollRuns.period, month))).limit(1);
  return result[0];
}

export async function createPayrollItem(data: InsertPayrollItem) {
  const db = await getDb();
  if (!db) return;
  await db.insert(payrollItems).values(data);
}

export async function listPayrollItemsByRun(runId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(payrollItems).where(eq(payrollItems.payrollRunId, runId));
}

export async function getPayrollItemById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(payrollItems).where(eq(payrollItems.id, id)).limit(1);
  return result[0];
}

export async function updatePayrollItem(id: number, data: Partial<InsertPayrollItem>) {
  const db = await getDb();
  if (!db) return;
  await db.update(payrollItems).set(data).where(eq(payrollItems.id, id));
}

export async function deletePayrollItem(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(payrollItems).where(eq(payrollItems.id, id));
}

export async function listPayrollItemsByEmployee(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(payrollItems).where(eq(payrollItems.employeeId, employeeId));
}

// ADJUSTMENTS
export async function createAdjustment(data: InsertAdjustment) {
  const db = await getDb();
  if (!db) return;
  return await db.insert(adjustments).values(data);
}

export async function listAdjustments(page: number = 1, pageSize: number = 50) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * pageSize;
  
  const [data, totalResult] = await Promise.all([
    db.select().from(adjustments).limit(pageSize).offset(offset).orderBy(desc(adjustments.createdAt)),
    db.select({ count: count() }).from(adjustments)
  ]);
  
  return { data, total: totalResult[0]?.count || 0 };
}

export async function getAdjustmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(adjustments).where(eq(adjustments.id, id)).limit(1);
  return result[0];
}

export async function updateAdjustment(id: number, data: Partial<InsertAdjustment>) {
  const db = await getDb();
  if (!db) return;
  await db.update(adjustments).set(data).where(eq(adjustments.id, id));
}

export async function deleteAdjustment(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(adjustments).where(eq(adjustments.id, id));
}

export async function getSubmittedAdjustmentsForPayroll(employeeId: number, monthStr: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(adjustments)
    .where(and(
      eq(adjustments.employeeId, employeeId),
      eq(adjustments.effectiveMonth, monthStr),
      eq(adjustments.status, 'approved')
    ));
}

export async function lockSubmittedAdjustments(payrollRunId: number, country: string, month: string) {
  // Placeholder logic
  return 0;
}

// REIMBURSEMENTS
export async function createReimbursement(data: InsertReimbursement) {
  const db = await getDb();
  if (!db) return;
  return await db.insert(reimbursements).values(data);
}

export async function listReimbursements(page: number = 1, pageSize: number = 50) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * pageSize;
  
  const [data, totalResult] = await Promise.all([
    db.select().from(reimbursements).limit(pageSize).offset(offset).orderBy(desc(reimbursements.createdAt)),
    db.select({ count: count() }).from(reimbursements)
  ]);
  
  return { data, total: totalResult[0]?.count || 0 };
}

export async function getReimbursementById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(reimbursements).where(eq(reimbursements.id, id)).limit(1);
  return result[0];
}

export async function updateReimbursement(id: number, data: Partial<InsertReimbursement>) {
  const db = await getDb();
  if (!db) return;
  await db.update(reimbursements).set(data).where(eq(reimbursements.id, id));
}

export async function deleteReimbursement(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(reimbursements).where(eq(reimbursements.id, id));
}

// CREDIT NOTES & APPLICATIONS
export async function applyCreditNote(data: InsertCreditNoteApplication) {
  const db = await getDb();
  if (!db) return;
  await db.insert(creditNoteApplications).values(data);
}

export async function listCreditNoteApplications() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(creditNoteApplications);
}

export async function listApplicationsForInvoice(invoiceId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(creditNoteApplications).where(eq(creditNoteApplications.invoiceId, invoiceId));
}

export async function getCreditNoteRemainingBalance(creditNoteId: number) {
  // Logic to calculate remaining balance
  return null;
}

export async function hasDepositBeenProcessed(depositInvoiceId: number) {
  return { processed: false };
}

// VENDORS
export async function createVendor(data: InsertVendor) {
  const db = await getDb();
  if (!db) return;
  return await db.insert(vendors).values(data);
}

export async function getVendorById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(vendors).where(eq(vendors.id, id)).limit(1);
  return result[0];
}

export async function listVendors(page: number = 1, pageSize: number = 50) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * pageSize;
  
  const [data, totalResult] = await Promise.all([
    db.select().from(vendors).limit(pageSize).offset(offset).orderBy(desc(vendors.createdAt)),
    db.select({ count: count() }).from(vendors)
  ]);
  
  return { data, total: totalResult[0]?.count || 0 };
}

export async function updateVendor(id: number, data: Partial<InsertVendor>) {
  const db = await getDb();
  if (!db) return;
  await db.update(vendors).set(data).where(eq(vendors.id, id));
}

export async function deleteVendor(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(vendors).where(eq(vendors.id, id));
}

export async function getVendorProfitAnalysis(vendorId: number) {
  return null;
}

// VENDOR BILLS
export async function createVendorBill(data: InsertVendorBill) {
  const db = await getDb();
  if (!db) return;
  return await db.insert(vendorBills).values(data);
}

export async function getVendorBillById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(vendorBills).where(eq(vendorBills.id, id)).limit(1);
  return result[0];
}

export async function listVendorBills(vendorId?: number) {
  const db = await getDb();
  if (!db) return [];
  const where = vendorId ? eq(vendorBills.vendorId, vendorId) : undefined;
  return await db.select().from(vendorBills).where(where);
}

export async function updateVendorBill(id: number, data: Partial<InsertVendorBill>) {
  const db = await getDb();
  if (!db) return;
  await db.update(vendorBills).set(data).where(eq(vendorBills.id, id));
}

export async function deleteVendorBill(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(vendorBills).where(eq(vendorBills.id, id));
}

export async function createVendorBillItem(data: InsertVendorBillItem) {
  const db = await getDb();
  if (!db) return;
  await db.insert(vendorBillItems).values(data);
}

export async function listVendorBillItems(billId?: number) {
  const db = await getDb();
  if (!db) return [];
  const where = billId ? eq(vendorBillItems.billId, billId) : undefined;
  return await db.select().from(vendorBillItems).where(where);
}

export async function updateVendorBillItem(id: number, data: Partial<InsertVendorBillItem>) {
  const db = await getDb();
  if (!db) return;
  await db.update(vendorBillItems).set(data).where(eq(vendorBillItems.id, id));
}

export async function deleteVendorBillItem(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(vendorBillItems).where(eq(vendorBillItems.id, id));
}

export async function listVendorBillItemsByBill(billId: number) {
  return listVendorBillItems(billId);
}

// BILL ALLOCATIONS
export async function createBillInvoiceAllocation(data: InsertBillInvoiceAllocation) {
  const db = await getDb();
  if (!db) return;
  await db.insert(billInvoiceAllocations).values(data);
}

export async function getBillInvoiceAllocationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(billInvoiceAllocations).where(eq(billInvoiceAllocations.id, id)).limit(1);
  return result[0];
}

export async function listAllocationsByBill(billId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(billInvoiceAllocations).where(eq(billInvoiceAllocations.vendorBillId, billId));
}

export async function listAllocationsByInvoice(invoiceId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(billInvoiceAllocations).where(eq(billInvoiceAllocations.invoiceId, invoiceId));
}

export async function updateBillInvoiceAllocation(id: number, data: Partial<InsertBillInvoiceAllocation>) {
  const db = await getDb();
  if (!db) return;
  await db.update(billInvoiceAllocations).set(data).where(eq(billInvoiceAllocations.id, id));
}

export async function deleteBillInvoiceAllocation(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(billInvoiceAllocations).where(eq(billInvoiceAllocations.id, id));
}

export async function deleteAllocationsByBill(billId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(billInvoiceAllocations).where(eq(billInvoiceAllocations.vendorBillId, billId));
}

export async function getBillAllocatedTotal(billId: number) {
  const db = await getDb();
  if (!db) return 0;
  // Implementation of sum
  return 0; 
}

export async function getInvoiceCostAllocatedTotal(invoiceId: number) {
  const db = await getDb();
  if (!db) return 0;
  return 0;
}

export async function recalcBillAllocation(billId: number) {}
export async function recalcInvoiceCostAllocation(invoiceId: number) {}
export async function listDetailedAllocationsByBill(billId: number) { return []; }
export async function listDetailedAllocationsByInvoice(invoiceId: number) { return []; }
