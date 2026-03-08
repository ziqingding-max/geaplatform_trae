
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

export async function getInvoiceByNumber(invoiceNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(invoices).where(eq(invoices.invoiceNumber, invoiceNumber)).limit(1);
  return result[0];
}

export async function listInvoices(
  filters: { customerId?: number; status?: string; invoiceType?: string; invoiceMonth?: string } = {},
  limit: number = 50,
  offset: number = 0
) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };

  // Build WHERE conditions from filters
  const conditions = [];
  if (filters.customerId) conditions.push(eq(invoices.customerId, filters.customerId));
  if (filters.status) conditions.push(eq(invoices.status, filters.status as any));
  if (filters.invoiceType) conditions.push(eq(invoices.invoiceType, filters.invoiceType as any));
  if (filters.invoiceMonth) conditions.push(eq(invoices.invoiceMonth, filters.invoiceMonth));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, totalResult] = await Promise.all([
    db.select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      customerId: invoices.customerId,
      customerName: customers.companyName,
      billingEntityId: invoices.billingEntityId,
      invoiceType: invoices.invoiceType,
      invoiceMonth: invoices.invoiceMonth,
      status: invoices.status,
      dueDate: invoices.dueDate,
      total: invoices.total,
      amountDue: invoices.amountDue,
      currency: invoices.currency,
      createdAt: invoices.createdAt,
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .where(where)
    .limit(limit)
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

export async function listPayrollRuns(
  filters: { status?: string; countryCode?: string; payrollMonth?: string } = {},
  limit: number = 50,
  offset: number = 0
) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };

  const conditions = [];
  if (filters.status) conditions.push(eq(payrollRuns.status, filters.status));
  if (filters.countryCode) conditions.push(eq(payrollRuns.countryCode, filters.countryCode));
  if (filters.payrollMonth) conditions.push(eq(payrollRuns.payrollMonth, filters.payrollMonth));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, totalResult] = await Promise.all([
    whereClause
      ? db.select().from(payrollRuns).where(whereClause).limit(limit).offset(offset).orderBy(desc(payrollRuns.createdAt))
      : db.select().from(payrollRuns).limit(limit).offset(offset).orderBy(desc(payrollRuns.createdAt)),
    whereClause
      ? db.select({ count: count() }).from(payrollRuns).where(whereClause)
      : db.select({ count: count() }).from(payrollRuns)
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
  const result = await db.select().from(payrollRuns).where(and(eq(payrollRuns.countryCode, country), eq(payrollRuns.payrollMonth, month))).limit(1);
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

export interface ListAdjustmentsParams {
  page?: number;
  pageSize?: number;
  customerId?: number;
  employeeId?: number;
  status?: string;
  adjustmentType?: string;
  effectiveMonth?: string;
}

export async function listAdjustments(params: ListAdjustmentsParams = {}) {
  const { page = 1, pageSize = 50, customerId, employeeId, status, adjustmentType, effectiveMonth } = params;
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * pageSize;
  
  const conditions = [];
  if (customerId) conditions.push(eq(adjustments.customerId, customerId));
  if (employeeId) conditions.push(eq(adjustments.employeeId, employeeId));
  if (status) conditions.push(eq(adjustments.status, status as any));
  if (adjustmentType) conditions.push(eq(adjustments.adjustmentType, adjustmentType as any));
  if (effectiveMonth) conditions.push(eq(adjustments.effectiveMonth, effectiveMonth));
  
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  
  const [data, totalResult] = await Promise.all([
    db.select().from(adjustments).where(where).limit(pageSize).offset(offset).orderBy(desc(adjustments.createdAt)),
    db.select({ count: count() }).from(adjustments).where(where)
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

export async function getSubmittedAdjustmentsForPayroll(countryCodeOrEmployeeId: string | number, monthStr: string, statuses: string[] = ['admin_approved']) {
  const db = await getDb();
  if (!db) return [];
  // When called with a country code (string), fetch all approved adjustments for that country+month
  // When called with an employee ID (number), fetch for that specific employee
  if (typeof countryCodeOrEmployeeId === 'string') {
    // Join with employees to filter by country
    const { employees } = await import('../../../drizzle/schema');
    const results = await db.select({
      id: adjustments.id,
      employeeId: adjustments.employeeId,
      customerId: adjustments.customerId,
      adjustmentType: adjustments.adjustmentType,
      category: adjustments.category,
      description: adjustments.description,
      amount: adjustments.amount,
      currency: adjustments.currency,
      status: adjustments.status,
      effectiveMonth: adjustments.effectiveMonth,
      createdAt: adjustments.createdAt,
    }).from(adjustments)
      .innerJoin(employees, eq(adjustments.employeeId, employees.id))
      .where(and(
        eq(employees.country, countryCodeOrEmployeeId),
        eq(adjustments.effectiveMonth, monthStr),
        inArray(adjustments.status, statuses as any[])
      ));
    return results;
  } else {
    return await db.select().from(adjustments)
      .where(and(
        eq(adjustments.employeeId, countryCodeOrEmployeeId),
        eq(adjustments.effectiveMonth, monthStr),
        inArray(adjustments.status, statuses as any[])
      ));
  }
}

export async function lockSubmittedAdjustments(monthStr: string, countryCode?: string) {
  const db = await getDb();
  if (!db) return 0;
  // Lock admin_approved adjustments for the given country+month by setting status to 'locked'
  const conditions = [
    eq(adjustments.effectiveMonth, monthStr),
    eq(adjustments.status, 'admin_approved')
  ];

  if (countryCode) {
    const { employees } = await import('../../../drizzle/schema');
    const empRows = await db.select({ id: employees.id }).from(employees).where(eq(employees.country, countryCode));
    const empIds = empRows.map(e => e.id);
    if (empIds.length === 0) return 0;
    conditions.push(inArray(adjustments.employeeId, empIds));
  }

  const result = await db.update(adjustments).set({ status: 'locked' as any }).where(and(...conditions));
  return (result as any).changes || 0;
}

// REIMBURSEMENTS
export async function createReimbursement(data: InsertReimbursement) {
  const db = await getDb();
  if (!db) return;
  return await db.insert(reimbursements).values(data);
}

export interface ListReimbursementsParams {
  page?: number;
  pageSize?: number;
  customerId?: number;
  employeeId?: number;
  status?: string;
  category?: string;
  effectiveMonth?: string;
}

export async function listReimbursements(params: ListReimbursementsParams = {}) {
  const { page = 1, pageSize = 50, customerId, employeeId, status, category, effectiveMonth } = params;
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * pageSize;
  
  const conditions = [];
  if (customerId) conditions.push(eq(reimbursements.customerId, customerId));
  if (employeeId) conditions.push(eq(reimbursements.employeeId, employeeId));
  if (status) conditions.push(eq(reimbursements.status, status as any));
  if (category) conditions.push(eq(reimbursements.category, category as any));
  if (effectiveMonth) conditions.push(eq(reimbursements.effectiveMonth, effectiveMonth));
  
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  
  const [data, totalResult] = await Promise.all([
    db.select().from(reimbursements).where(where).limit(pageSize).offset(offset).orderBy(desc(reimbursements.createdAt)),
    db.select({ count: count() }).from(reimbursements).where(where)
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

export interface ListVendorsParams {
  page?: number;
  pageSize?: number;
  status?: string;
  country?: string;
  vendorType?: string;
  search?: string;
}

export async function listVendors(params: ListVendorsParams = {}) {
  const { page = 1, pageSize = 50, status, country, vendorType, search } = params;
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * pageSize;
  
  const conditions = [];
  if (status) conditions.push(eq(vendors.status, status as any));
  if (country) conditions.push(eq(vendors.country, country));
  if (vendorType) conditions.push(eq(vendors.vendorType, vendorType as any));
  if (search) conditions.push(like(vendors.vendorName, `%${search}%`));
  
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  
  const [data, totalResult] = await Promise.all([
    db.select().from(vendors).where(where).limit(pageSize).offset(offset).orderBy(desc(vendors.createdAt)),
    db.select({ count: count() }).from(vendors).where(where)
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

export interface ListVendorBillsParams {
  page?: number;
  pageSize?: number;
  vendorId?: number;
  status?: string;
  category?: string;
  billMonth?: string;
  search?: string;
}

export async function listVendorBills(params: ListVendorBillsParams = {}) {
  const { page = 1, pageSize = 50, vendorId, status, category, billMonth, search } = params;
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * pageSize;
  
  const conditions = [];
  if (vendorId) conditions.push(eq(vendorBills.vendorId, vendorId));
  if (status) conditions.push(eq(vendorBills.status, status as any));
  if (category) conditions.push(eq(vendorBills.category, category as any));
  if (billMonth) conditions.push(eq(vendorBills.billMonth, billMonth));
  if (search) conditions.push(like(vendorBills.billNumber, `%${search}%`));
  
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  
  const [data, totalResult] = await Promise.all([
    db.select().from(vendorBills).where(where).limit(pageSize).offset(offset).orderBy(desc(vendorBills.createdAt)),
    db.select({ count: count() }).from(vendorBills).where(where)
  ]);
  
  return { data, total: totalResult[0]?.count || 0 };
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
