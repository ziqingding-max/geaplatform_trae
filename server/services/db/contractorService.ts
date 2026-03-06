
import { eq, like, count, desc, and, or, getTableColumns } from "drizzle-orm";
import { 
  contractors, InsertContractor,
  customers,
  users,
  contractorMilestones, InsertContractorMilestone,
  contractorAdjustments, InsertContractorAdjustment,
  contractorInvoices, InsertContractorInvoice,
  contractorInvoiceItems
} from "../../../drizzle/schema";
import { getDb } from "./connection";

// Helper for payment date
function calculateNextPaymentDate(contractor: any): string | null {
  if (contractor.status !== "active") return null;
  if (contractor.paymentFrequency === "fixed") return null; // Milestones driven

  const today = new Date();
  if (contractor.paymentFrequency === "monthly") {
    // Return last day of current month
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return lastDay.toISOString().split("T")[0];
  }
  // Add other frequencies as needed
  return null;
}

// CONTRACTORS
export async function createContractor(data: InsertContractor) {
  const db = await getDb();
  if (!db) return [];
  return await db.insert(contractors).values(data).returning();
}

export async function getContractorById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select({
    ...getTableColumns(contractors),
    defaultApproverName: users.displayName,
    customerName: customers.companyName,
  })
  .from(contractors)
  .leftJoin(users, eq(contractors.defaultApproverId, users.id))
  .leftJoin(customers, eq(contractors.customerId, customers.id))
  .where(eq(contractors.id, id))
  .limit(1);

  if (result.length === 0) return undefined;
  
  const contractor = result[0];
  const nextPaymentDate = calculateNextPaymentDate(contractor);
  
  return { ...contractor, nextPaymentDate };
}

export async function listContractors(
  filters: {
    customerId?: number;
    status?: string;
    search?: string;
  },
  limit: number = 50,
  offset: number = 0
) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };

  const conditions = [];
  if (filters.customerId) conditions.push(eq(contractors.customerId, filters.customerId));
  if (filters.status) conditions.push(eq(contractors.status, filters.status as any));
  
  if (filters.search) {
    conditions.push(or(
      like(contractors.firstName, `%${filters.search}%`),
      like(contractors.lastName, `%${filters.search}%`),
      like(contractors.email, `%${filters.search}%`),
      like(contractors.contractorCode, `%${filters.search}%`)
    ));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, totalResult] = await Promise.all([
    db.select({
      id: contractors.id,
      contractorCode: contractors.contractorCode,
      firstName: contractors.firstName,
      lastName: contractors.lastName,
      email: contractors.email,
      country: contractors.country,
      status: contractors.status,
      jobTitle: contractors.jobTitle,
      startDate: contractors.startDate,
      customerId: contractors.customerId,
      customerName: customers.companyName,
      paymentFrequency: contractors.paymentFrequency,
    })
    .from(contractors)
    .leftJoin(customers, eq(contractors.customerId, customers.id))
    .where(where)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(contractors.createdAt)),
    
    db.select({ count: count() }).from(contractors).where(where)
  ]);

  return { data, total: totalResult[0]?.count || 0 };
}

export async function updateContractor(id: number, data: Partial<InsertContractor>) {
  const db = await getDb();
  if (!db) return;
  await db.update(contractors).set(data).where(eq(contractors.id, id));
}

// MILESTONES
export async function listContractorMilestones(contractorId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    ...getTableColumns(contractorMilestones),
    approverName: users.displayName
  })
  .from(contractorMilestones)
  .leftJoin(users, eq(contractorMilestones.approvedBy, users.id))
  .where(eq(contractorMilestones.contractorId, contractorId))
  .orderBy(desc(contractorMilestones.createdAt));
}

export async function listAllContractorMilestones(filters: { customerId?: number, status?: string, search?: string } = {}) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  
  if (filters.customerId) {
    conditions.push(eq(contractors.customerId, filters.customerId));
  }
  if (filters.status) {
    conditions.push(eq(contractorMilestones.status, filters.status as any));
  }
  if (filters.search) {
     conditions.push(or(
      like(contractorMilestones.title, `%${filters.search}%`),
      like(contractors.firstName, `%${filters.search}%`),
      like(contractors.lastName, `%${filters.search}%`)
    ));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  return await db.select({
      ...getTableColumns(contractorMilestones),
      contractorFirstName: contractors.firstName,
      contractorLastName: contractors.lastName,
      customerId: contractors.customerId,
      customerName: customers.companyName,
      currency: contractors.currency
    })
    .from(contractorMilestones)
    .leftJoin(contractors, eq(contractorMilestones.contractorId, contractors.id))
    .leftJoin(customers, eq(contractors.customerId, customers.id))
    .where(where)
    .orderBy(desc(contractorMilestones.createdAt));
}

export async function createContractorMilestone(data: InsertContractorMilestone) {
  const db = await getDb();
  if (!db) return;
  return await db.insert(contractorMilestones).values(data).returning();
}

export async function updateContractorMilestone(id: number, data: Partial<InsertContractorMilestone>) {
  const db = await getDb();
  if (!db) return;
  await db.update(contractorMilestones).set(data).where(eq(contractorMilestones.id, id));
}

export async function deleteContractorMilestone(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(contractorMilestones).where(eq(contractorMilestones.id, id));
}

// ADJUSTMENTS
export async function listContractorAdjustments(contractorId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(contractorAdjustments)
    .where(eq(contractorAdjustments.contractorId, contractorId))
    .orderBy(desc(contractorAdjustments.createdAt));
}

export async function listAllContractorAdjustments(filters: { customerId?: number, status?: string, search?: string } = {}) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  
  if (filters.customerId) {
    conditions.push(eq(contractors.customerId, filters.customerId));
  }
  if (filters.status) {
    conditions.push(eq(contractorAdjustments.status, filters.status as any));
  }
  if (filters.search) {
     conditions.push(or(
      like(contractorAdjustments.description, `%${filters.search}%`),
      like(contractors.firstName, `%${filters.search}%`),
      like(contractors.lastName, `%${filters.search}%`)
    ));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  return await db.select({
      ...getTableColumns(contractorAdjustments),
      contractorFirstName: contractors.firstName,
      contractorLastName: contractors.lastName,
      customerId: contractors.customerId,
      customerName: customers.companyName
    })
    .from(contractorAdjustments)
    .leftJoin(contractors, eq(contractorAdjustments.contractorId, contractors.id))
    .leftJoin(customers, eq(contractors.customerId, customers.id))
    .where(where)
    .orderBy(desc(contractorAdjustments.createdAt));
}

export async function createContractorAdjustment(data: InsertContractorAdjustment) {
  const db = await getDb();
  if (!db) return;
  return await db.insert(contractorAdjustments).values(data).returning();
}

export async function updateContractorAdjustment(id: number, data: Partial<InsertContractorAdjustment>) {
  const db = await getDb();
  if (!db) return;
  await db.update(contractorAdjustments).set(data).where(eq(contractorAdjustments.id, id));
}

export async function deleteContractorAdjustment(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(contractorAdjustments).where(eq(contractorAdjustments.id, id));
}

// INVOICES
export async function listContractorInvoices(contractorId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(contractorInvoices)
    .where(eq(contractorInvoices.contractorId, contractorId))
    .orderBy(desc(contractorInvoices.createdAt));
}

export async function getContractorInvoiceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select({
    ...getTableColumns(contractorInvoices),
    customerName: customers.companyName,
    contractorName: contractors.firstName, // Just for display
  })
  .from(contractorInvoices)
  .leftJoin(customers, eq(contractorInvoices.customerId, customers.id))
  .leftJoin(contractors, eq(contractorInvoices.contractorId, contractors.id))
  .where(eq(contractorInvoices.id, id))
  .limit(1);

  if (result.length === 0) return undefined;
  
  // Fetch line items
  const items = await db.select().from(contractorInvoiceItems)
    .where(eq(contractorInvoiceItems.invoiceId, id));
    
  return { ...result[0], items };
}
