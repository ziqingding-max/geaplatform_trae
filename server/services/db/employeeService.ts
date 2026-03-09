
import { eq, like, count, desc, and, or, gte, lte, ne } from "drizzle-orm";
import { 
  employees, InsertEmployee,
  employeeDocuments, InsertEmployeeDocument,
  employeeContracts, InsertEmployeeContract,
  leaveBalances, InsertLeaveBalance,
  leaveRecords, InsertLeaveRecord,
  leaveTypes,
  customers
} from "../../../drizzle/schema";
import { getDb } from "./connection";

// EMPLOYEES
export async function createEmployee(data: InsertEmployee) {
  const db = await getDb();
  if (!db) return [];
  return await db.insert(employees).values(data).returning();
}

export async function getEmployeeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(employees).where(eq(employees.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export interface ListEmployeesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  customerId?: number;
  status?: string;
  country?: string;
  serviceType?: string;
}

export async function listEmployees(params: ListEmployeesParams = {}) {
  const { page = 1, pageSize = 50, search, customerId, status, country, serviceType } = params;
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * pageSize;
  
  const conditions = [];
  if (search) {
    conditions.push(or(
      like(employees.firstName, `%${search}%`), 
      like(employees.lastName, `%${search}%`),
      like(employees.email, `%${search}%`)
    ));
  }
  if (customerId) conditions.push(eq(employees.customerId, customerId));
  if (status) conditions.push(eq(employees.status, status as any));
  if (country) conditions.push(eq(employees.country, country));
  if (serviceType) conditions.push(eq(employees.serviceType, serviceType as any));
  
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  
  const [data, totalResult] = await Promise.all([
    db.select({
      id: employees.id,
      employeeCode: employees.employeeCode,
      firstName: employees.firstName,
      lastName: employees.lastName,
      email: employees.email,
      country: employees.country,
      status: employees.status,
      jobTitle: employees.jobTitle,
      startDate: employees.startDate,
      customerId: employees.customerId,
      customerName: customers.companyName,
      clientCode: customers.clientCode,
    })
    .from(employees)
    .leftJoin(customers, eq(employees.customerId, customers.id))
    .where(where)
    .limit(pageSize)
    .offset(offset)
    .orderBy(desc(employees.createdAt)),
    db.select({ count: count() }).from(employees).where(where)
  ]);
  
  return { data, total: totalResult[0]?.count || 0 };
}

export async function updateEmployee(id: number, data: Partial<InsertEmployee>) {
  const db = await getDb();
  if (!db) return;
  await db.update(employees).set(data).where(eq(employees.id, id));
}

export async function getEmployeeCountByStatus() {
  const db = await getDb();
  if (!db) return [];
  return await db.select({ status: employees.status, count: count() })
    .from(employees)
    .groupBy(employees.status);
}

export async function getEmployeeCountByCountry() {
  const db = await getDb();
  if (!db) return [];
  return await db.select({ country: employees.country, count: count() })
    .from(employees)
    .groupBy(employees.country);
}

export async function getActiveEmployeesForPayroll(countryCode: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(employees)
    .where(and(
      eq(employees.country, countryCode), 
      eq(employees.status, "active"),
      ne(employees.serviceType, "aor") // Exclude AOR
    ));
}

// EMPLOYEE DOCUMENTS
export async function listEmployeeDocuments(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(employeeDocuments).where(eq(employeeDocuments.employeeId, employeeId));
}

export async function createEmployeeDocument(data: InsertEmployeeDocument) {
  const db = await getDb();
  if (!db) return;
  await db.insert(employeeDocuments).values(data);
}

export async function deleteEmployeeDocument(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(employeeDocuments).where(eq(employeeDocuments.id, id));
}

export async function getEmployeeDocumentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(employeeDocuments).where(eq(employeeDocuments.id, id)).limit(1);
  return result[0];
}

// EMPLOYEE CONTRACTS
export async function listEmployeeContracts(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(employeeContracts).where(eq(employeeContracts.employeeId, employeeId));
}

export async function createEmployeeContractRecord(data: InsertEmployeeContract) {
  const db = await getDb();
  if (!db) return;
  await db.insert(employeeContracts).values(data);
}

export async function updateEmployeeContract(id: number, data: Partial<InsertEmployeeContract>) {
  const db = await getDb();
  if (!db) return;
  await db.update(employeeContracts).set(data).where(eq(employeeContracts.id, id));
}

export async function deleteEmployeeContract(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(employeeContracts).where(eq(employeeContracts.id, id));
}

export async function getContractSignedEmployeesReadyForActivation(dateStr: string) {
  const db = await getDb();
  if (!db) return [];
  // status='contract_signed' AND startDate <= dateStr
  return await db.select().from(employees).where(and(
    eq(employees.status, 'contract_signed'),
    lte(employees.startDate, dateStr)
  ));
}

export async function getCountriesWithActiveEmployees() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({ country: employees.country })
    .from(employees)
    .where(and(
      eq(employees.status, 'active'),
      ne(employees.serviceType, 'aor') // Exclude AOR
    ))
    .groupBy(employees.country);
  return result.map(r => r.country);
}

export async function getEmployeesForPayrollMonth(country: string, monthStart: string, monthEnd: string) {
  const db = await getDb();
  if (!db) return [];
  // Simplified logic: active employees in that country
  // We accept monthStart/monthEnd to match the caller signature, but currently don't use them for filtering
  // because "active" status implies they should be paid.
  // In a real implementation, we might check if their startDate is before monthEnd etc.
  return await db.select().from(employees)
    .where(and(
      eq(employees.country, country), 
      eq(employees.status, 'active'),
      ne(employees.serviceType, 'aor') // Exclude AOR
    ));
}

// LEAVE BALANCES
export async function listLeaveBalances(employeeId: number, year?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(leaveBalances.employeeId, employeeId)];
  if (year) conditions.push(eq(leaveBalances.year, year));
  return await db.select().from(leaveBalances).where(and(...conditions));
}

export async function createLeaveBalance(data: InsertLeaveBalance) {
  const db = await getDb();
  if (!db) return;
  await db.insert(leaveBalances).values(data);
}

export async function updateLeaveBalance(id: number, data: Partial<InsertLeaveBalance>) {
  const db = await getDb();
  if (!db) return;
  await db.update(leaveBalances).set(data).where(eq(leaveBalances.id, id));
}

export async function deleteLeaveBalance(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(leaveBalances).where(eq(leaveBalances.id, id));
}

export async function initializeLeaveBalancesForEmployee(employeeId: number) {
  // Placeholder for complex initialization logic
  return { added: 0 };
}

// LEAVE RECORDS
export async function createLeaveRecord(data: InsertLeaveRecord) {
  const db = await getDb();
  if (!db) return;
  return await db.insert(leaveRecords).values(data);
}

export interface ListLeaveRecordsParams {
  page?: number;
  pageSize?: number;
  employeeId?: number;
  status?: string;
  month?: string; // YYYY-MM
}

export async function listLeaveRecords(params: ListLeaveRecordsParams = {}) {
  const { page = 1, pageSize = 50, employeeId, status, month } = params;
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * pageSize;
  
  const conditions = [];
  if (employeeId) conditions.push(eq(leaveRecords.employeeId, employeeId));
  if (status) conditions.push(eq(leaveRecords.status, status as any));
  if (month) {
    const startOfMonth = `${month}-01`;
    const endOfMonth = `${month}-31`;
    conditions.push(and(gte(leaveRecords.startDate, startOfMonth), lte(leaveRecords.startDate, endOfMonth)));
  }
  
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  
  const [data, totalResult] = await Promise.all([
    db.select({
      id: leaveRecords.id,
      employeeId: leaveRecords.employeeId,
      leaveTypeId: leaveRecords.leaveTypeId,
      startDate: leaveRecords.startDate,
      endDate: leaveRecords.endDate,
      days: leaveRecords.days,
      reason: leaveRecords.reason,
      status: leaveRecords.status,
      createdAt: leaveRecords.createdAt,
      updatedAt: leaveRecords.updatedAt,
      submittedBy: leaveRecords.submittedBy,
      clientApprovedBy: leaveRecords.clientApprovedBy,
      clientApprovedAt: leaveRecords.clientApprovedAt,
      clientRejectionReason: leaveRecords.clientRejectionReason,
      adminApprovedBy: leaveRecords.adminApprovedBy,
      adminApprovedAt: leaveRecords.adminApprovedAt,
      adminRejectionReason: leaveRecords.adminRejectionReason,
      // Join fields
      leaveTypeName: leaveTypes.leaveTypeName,
    })
    .from(leaveRecords)
    .leftJoin(leaveTypes, eq(leaveRecords.leaveTypeId, leaveTypes.id))
    .where(where)
    .limit(pageSize)
    .offset(offset)
    .orderBy(desc(leaveRecords.createdAt)),
    db.select({ count: count() }).from(leaveRecords).where(where)
  ]);
  
  return { data, total: totalResult[0]?.count || 0 };
}

export async function updateLeaveRecord(id: number, data: Partial<InsertLeaveRecord>) {
  const db = await getDb();
  if (!db) return;
  await db.update(leaveRecords).set(data).where(eq(leaveRecords.id, id));
}

export async function getLeaveRecordById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(leaveRecords).where(eq(leaveRecords.id, id)).limit(1);
  return result[0];
}

export async function deleteLeaveRecord(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(leaveRecords).where(eq(leaveRecords.id, id));
}

export async function lockSubmittedLeaveRecords(monthStr: string, countryCode?: string) {
  const db = await getDb();
  if (!db) return 0;
  // Lock admin_approved leave records for the given country+month
  const monthPrefix = monthStr.length === 7 ? monthStr : monthStr.substring(0, 7);
  const startOfMonth = `${monthPrefix}-01`;
  const endOfMonth = `${monthPrefix}-31`;
  
  const conditions = [
    gte(leaveRecords.startDate, startOfMonth),
    lte(leaveRecords.startDate, endOfMonth),
    eq(leaveRecords.status, 'admin_approved')
  ];

  if (countryCode) {
    const empRows = await db.select({ id: employees.id }).from(employees).where(eq(employees.country, countryCode));
    const empIds = empRows.map(e => e.id);
    if (empIds.length === 0) return 0;
    conditions.push(or(...empIds.map(id => eq(leaveRecords.employeeId, id))));
  }

  const result = await db.update(leaveRecords).set({ status: 'locked' as any }).where(and(...conditions));
  return (result as any).changes || 0;
}

export async function getActiveLeaveRecordsForDate(employeeId: number, date: Date) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(leaveRecords)
    .where(and(
      eq(leaveRecords.employeeId, employeeId),
      lte(leaveRecords.startDate, date),
      gte(leaveRecords.endDate, date),
      eq(leaveRecords.status, 'approved')
    ));
}

/**
 * Get all approved leave records that are active on a given date (across all employees).
 * Used by cronJobs for daily leave status transitions.
 * @param dateStr - Date string in YYYY-MM-DD format
 */
export async function getAllActiveLeaveRecordsForDate(dateStr: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(leaveRecords)
    .where(and(
      lte(leaveRecords.startDate, dateStr),
      gte(leaveRecords.endDate, dateStr),
      or(
        eq(leaveRecords.status, 'approved'),
        eq(leaveRecords.status, 'admin_approved'),
        eq(leaveRecords.status, 'locked')
      )
    ));
}

/**
 * Get on_leave employees whose all leave records have ended (endDate < today).
 * Used by cronJobs to transition employees back to active status.
 * @param todayStr - Date string in YYYY-MM-DD format
 */
export async function getOnLeaveEmployeesWithExpiredLeave(todayStr?: string) {
  const db = await getDb();
  if (!db) return [];
  const dateStr = todayStr || new Date().toISOString().split('T')[0];
  
  // Find employees with status 'on_leave' who have NO active leave records for today
  const onLeaveEmps = await db.select({ id: employees.id, employeeCode: employees.employeeCode })
    .from(employees)
    .where(eq(employees.status, 'on_leave'));
  
  const result: Array<{ id: number; employeeCode: string | null }> = [];
  for (const emp of onLeaveEmps) {
    // Check if they have any active leave records covering today
    const activeLeaves = await db.select().from(leaveRecords)
      .where(and(
        eq(leaveRecords.employeeId, emp.id),
        lte(leaveRecords.startDate, dateStr),
        gte(leaveRecords.endDate, dateStr),
        or(
          eq(leaveRecords.status, 'approved'),
          eq(leaveRecords.status, 'admin_approved'),
          eq(leaveRecords.status, 'locked')
        )
      ))
      .limit(1);
    
    if (activeLeaves.length === 0) {
      // No active leave records covering today - employee should return to active
      result.push(emp);
    }
  }
  return result;
}

export async function getSubmittedUnpaidLeaveForPayroll(countryCodeOrEmployeeId: string | number, monthStr: string, statuses: string[] = ['admin_approved']) {
  const db = await getDb();
  if (!db) return [];
  const { leaveTypes } = await import('../../../drizzle/schema');
  const monthPrefix = monthStr.length === 7 ? monthStr : monthStr.substring(0, 7);
  const startOfMonth = `${monthPrefix}-01`;
  const endOfMonth = `${monthPrefix}-31`;

  // Get unpaid leave type IDs
  const unpaidTypes = await db.select({ id: leaveTypes.id }).from(leaveTypes).where(eq(leaveTypes.isPaid, false));
  const unpaidTypeIds = unpaidTypes.map(t => t.id);
  if (unpaidTypeIds.length === 0) return [];

  if (typeof countryCodeOrEmployeeId === 'string') {
    // Fetch all unpaid leave records for employees in this country for the given month
    const empRows = await db.select({ id: employees.id }).from(employees).where(eq(employees.country, countryCodeOrEmployeeId));
    const empIds = empRows.map(e => e.id);
    if (empIds.length === 0) return [];
    return await db.select().from(leaveRecords)
      .where(and(
        or(...empIds.map(id => eq(leaveRecords.employeeId, id))),
        or(...unpaidTypeIds.map(id => eq(leaveRecords.leaveTypeId, id))),
        gte(leaveRecords.startDate, startOfMonth),
        lte(leaveRecords.startDate, endOfMonth),
        inArray(leaveRecords.status, statuses as any[])
      ));
  } else {
    return await db.select().from(leaveRecords)
      .where(and(
        eq(leaveRecords.employeeId, countryCodeOrEmployeeId),
        or(...unpaidTypeIds.map(id => eq(leaveRecords.leaveTypeId, id))),
        gte(leaveRecords.startDate, startOfMonth),
        lte(leaveRecords.startDate, endOfMonth),
        inArray(leaveRecords.status, statuses as any[])
      ));
  }
}
