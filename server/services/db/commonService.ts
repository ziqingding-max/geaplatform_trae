
import { eq, desc, count, like } from "drizzle-orm";
import { 
  countriesConfig, InsertCountryConfig,
  systemConfig, InsertSystemConfig,
  auditLogs, InsertAuditLog,
  exchangeRates,
  leaveTypes, InsertLeaveType,
  salesLeads, InsertSalesLead,
  salesActivities, InsertSalesActivity,
  billingEntities, InsertBillingEntity
} from "../../../drizzle/schema";
import { getDb } from "./connection";
import { customers, employees } from "../../../drizzle/schema";

// COUNTRIES CONFIG
export async function listCountriesConfig() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(countriesConfig);
}

export async function getCountryConfig(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(countriesConfig).where(eq(countriesConfig.countryCode, code)).limit(1);
  return result[0];
}

export async function createCountryConfig(data: InsertCountryConfig) {
  const db = await getDb();
  if (!db) return;
  await db.insert(countriesConfig).values(data);
}

export async function updateCountryConfig(id: number, data: Partial<InsertCountryConfig>) {
  const db = await getDb();
  if (!db) return;
  await db.update(countriesConfig).set(data).where(eq(countriesConfig.id, id));
}

export async function deleteCountryConfig(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(countriesConfig).where(eq(countriesConfig.id, id));
}

// SYSTEM CONFIG
export async function getSystemConfig(key: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(systemConfig).where(eq(systemConfig.configKey, key)).limit(1);
  return result.length > 0 ? result[0].configValue : null;
}

export async function setSystemConfig(key: string, value: string) {
  const db = await getDb();
  if (!db) return;
  // Upsert logic
  await db.insert(systemConfig).values({ configKey: key, configValue: value })
    .onDuplicateKeyUpdate({ set: { configValue: value } });
}

export async function listSystemConfigs() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(systemConfig);
}

// AUDIT LOGS
export async function logAuditAction(data: InsertAuditLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLogs).values(data);
}

export async function listAuditLogs(page: number = 1, pageSize: number = 50) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * pageSize;
  
  const [data, totalResult] = await Promise.all([
    db.select().from(auditLogs).limit(pageSize).offset(offset).orderBy(desc(auditLogs.createdAt)),
    db.select({ count: count() }).from(auditLogs)
  ]);
  
  return { data, total: totalResult[0]?.count || 0 };
}

// LEAVE TYPES
export async function listLeaveTypesByCountry(countryCode: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(leaveTypes).where(eq(leaveTypes.countryCode, countryCode));
}

export async function createLeaveType(data: InsertLeaveType) {
  const db = await getDb();
  if (!db) return;
  await db.insert(leaveTypes).values(data);
}

export async function updateLeaveType(id: number, data: Partial<InsertLeaveType>) {
  const db = await getDb();
  if (!db) return;
  await db.update(leaveTypes).set(data).where(eq(leaveTypes.id, id));
}

export async function deleteLeaveType(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(leaveTypes).where(eq(leaveTypes.id, id));
}

export async function getLeaveTypeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(leaveTypes).where(eq(leaveTypes.id, id)).limit(1);
  return result[0];
}

// EXCHANGE RATES
export async function listAllExchangeRates(page: number = 1, pageSize: number = 50) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * pageSize;
  
  const [data, totalResult] = await Promise.all([
    db.select().from(exchangeRates).limit(pageSize).offset(offset).orderBy(desc(exchangeRates.updatedAt)),
    db.select({ count: count() }).from(exchangeRates)
  ]);
  return { data, total: totalResult[0]?.count || 0 };
}

export async function deleteExchangeRate(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(exchangeRates).where(eq(exchangeRates.id, id));
}

// DASHBOARD
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return {
    totalCustomers: 0,
    totalEmployees: 0,
    activeEmployees: 0,
    pendingPayrolls: 0,
    pendingInvoices: 0,
    pendingAdjustments: 0,
    pendingLeaves: 0,
    newHiresThisMonth: 0,
    terminationsThisMonth: 0,
    newClientsThisMonth: 0,
  };

  const [
    custCount, empCount, activeEmpCount
  ] = await Promise.all([
    db.select({ count: count() }).from(customers),
    db.select({ count: count() }).from(employees),
    db.select({ count: count() }).from(employees).where(eq(employees.status, 'active'))
  ]);

  return {
    totalCustomers: custCount[0]?.count || 0,
    totalEmployees: empCount[0]?.count || 0,
    activeEmployees: activeEmpCount[0]?.count || 0,
    pendingPayrolls: 0, // Placeholder
    pendingInvoices: 0, // Placeholder
    pendingAdjustments: 0, // Placeholder
    pendingLeaves: 0, // Placeholder
    newHiresThisMonth: 0, // Placeholder
    terminationsThisMonth: 0, // Placeholder
    newClientsThisMonth: 0, // Placeholder
  };
}

// BILLING ENTITIES
export async function listBillingEntities() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(billingEntities);
}

export async function getBillingEntityById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(billingEntities).where(eq(billingEntities.id, id)).limit(1);
  return result[0];
}

export async function createBillingEntity(data: InsertBillingEntity) {
  const db = await getDb();
  if (!db) return;
  await db.insert(billingEntities).values(data);
}

export async function updateBillingEntity(id: number, data: Partial<InsertBillingEntity>) {
  const db = await getDb();
  if (!db) return;
  await db.update(billingEntities).set(data).where(eq(billingEntities.id, id));
}

export async function deleteBillingEntity(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(billingEntities).where(eq(billingEntities.id, id));
}

// SALES CRM (Leads)
export async function createSalesLead(data: InsertSalesLead) {
  const db = await getDb();
  if (!db) return;
  await db.insert(salesLeads).values(data);
}

export async function getSalesLeadById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(salesLeads).where(eq(salesLeads.id, id)).limit(1);
  return result[0];
}

export async function listSalesLeads(page: number = 1, pageSize: number = 50, search?: string) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const where = search ? like(salesLeads.companyName, `%${search}%`) : undefined;
  
  const [data, totalResult] = await Promise.all([
    db.select().from(salesLeads).where(where).limit(pageSize).offset(offset).orderBy(desc(salesLeads.createdAt)),
    db.select({ count: count() }).from(salesLeads).where(where)
  ]);
  return { data, total: totalResult[0]?.count || 0 };
}

export async function updateSalesLead(id: number, data: Partial<InsertSalesLead>) {
  const db = await getDb();
  if (!db) return;
  await db.update(salesLeads).set(data).where(eq(salesLeads.id, id));
}

export async function deleteSalesLead(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(salesLeads).where(eq(salesLeads.id, id));
}

// SALES ACTIVITIES
export async function createSalesActivity(data: InsertSalesActivity) {
  const db = await getDb();
  if (!db) return;
  await db.insert(salesActivities).values(data);
}

export async function listSalesActivities(leadId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(salesActivities).where(eq(salesActivities.leadId, leadId)).orderBy(desc(salesActivities.activityDate));
}

export async function deleteSalesActivity(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(salesActivities).where(eq(salesActivities.id, id));
}
