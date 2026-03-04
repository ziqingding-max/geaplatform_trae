
import { eq, like, count, desc, and, or, gte, lte, ne } from "drizzle-orm";
import { 
  employees, InsertEmployee,
  employeeDocuments, InsertEmployeeDocument,
  employeeContracts, InsertEmployeeContract,
  leaveBalances, InsertLeaveBalance,
  leaveRecords, InsertLeaveRecord,
  customers
} from "../../../drizzle/schema";
import { getDb } from "./connection";

// EMPLOYEES
export async function createEmployee(data: InsertEmployee) {
  const db = await getDb();
  if (!db) return [];
  return await db.insert(employees).values(data);
}

export async function getEmployeeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(employees).where(eq(employees.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listEmployees(page: number = 1, pageSize: number = 50, search?: string) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const where = search 
    ? or(
        like(employees.firstName, `%${search}%`), 
        like(employees.lastName, `%${search}%`),
        like(employees.email, `%${search}%`)
      )
    : undefined;
  
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

export async function getContractSignedEmployeesReadyForActivation() {
  const db = await getDb();
  if (!db) return [];
  // Logic: status='onboarding' AND has signed contract
  // Simplified for now
  return await db.select().from(employees).where(eq(employees.status, 'onboarding'));
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

export async function getEmployeesForPayrollMonth(country: string, year: number, month: number) {
  const db = await getDb();
  if (!db) return [];
  // Simplified logic: active employees in that country
  return await db.select().from(employees)
    .where(and(
      eq(employees.country, country), 
      eq(employees.status, 'active'),
      ne(employees.serviceType, 'aor') // Exclude AOR
    ));
}

// LEAVE BALANCES
export async function listLeaveBalances(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(leaveBalances).where(eq(leaveBalances.employeeId, employeeId));
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

export async function listLeaveRecords(page: number = 1, pageSize: number = 50, employeeId?: number) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const where = employeeId ? eq(leaveRecords.employeeId, employeeId) : undefined;
  
  const [data, totalResult] = await Promise.all([
    db.select().from(leaveRecords).where(where).limit(pageSize).offset(offset).orderBy(desc(leaveRecords.createdAt)),
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

export async function lockSubmittedLeaveRecords(monthStr: string, countryCode: string) {
  const db = await getDb();
  if (!db) return 0;
  // Lock admin_approved leave records for the given country+month
  const empRows = await db.select({ id: employees.id }).from(employees).where(eq(employees.country, countryCode));
  const empIds = empRows.map(e => e.id);
  if (empIds.length === 0) return 0;
  const monthPrefix = monthStr.length === 7 ? monthStr : monthStr.substring(0, 7);
  const startOfMonth = `${monthPrefix}-01`;
  const endOfMonth = `${monthPrefix}-31`;
  const result = await db.update(leaveRecords).set({ status: 'locked' as any }).where(and(
    or(...empIds.map(id => eq(leaveRecords.employeeId, id))),
    gte(leaveRecords.startDate, startOfMonth),
    lte(leaveRecords.startDate, endOfMonth),
    eq(leaveRecords.status, 'admin_approved')
  ));
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

export async function getOnLeaveEmployeesWithExpiredLeave() {
  // Placeholder logic
  return [];
}

export async function getSubmittedUnpaidLeaveForPayroll(countryCodeOrEmployeeId: string | number, monthStr: string) {
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
        eq(leaveRecords.status, 'admin_approved')
      ));
  } else {
    return await db.select().from(leaveRecords)
      .where(and(
        eq(leaveRecords.employeeId, countryCodeOrEmployeeId),
        or(...unpaidTypeIds.map(id => eq(leaveRecords.leaveTypeId, id))),
        gte(leaveRecords.startDate, startOfMonth),
        lte(leaveRecords.startDate, endOfMonth),
        eq(leaveRecords.status, 'admin_approved')
      ));
  }
}
