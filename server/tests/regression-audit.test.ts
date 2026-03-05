
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createEmployee, listEmployees, createCustomer, getDb } from "../services/db";
import { employees, customers } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TestCleanup } from "../test-cleanup";

describe("Regression Audit (P0 Fixes)", () => {
  const cleanup = new TestCleanup();
  let customerId: number;

  beforeAll(async () => {
    // Create a dummy customer for tests
    const customer = await createCustomer({
      companyName: "Regression Test Corp",
      country: "US",
      status: "active",
    });
    customerId = (customer as any)[0].insertId;
    cleanup.trackCustomer(customerId);
  });

  afterAll(async () => {
    await cleanup.run();
  });

  it("P0-B: should store dates as strings (YYYY-MM-DD), not Date objects", async () => {
    // 1. Create employee with date fields
    const result = await createEmployee({
      customerId,
      firstName: "Date",
      lastName: "Test",
      email: "date.test@example.com",
      country: "US",
      jobTitle: "Tester",
      baseSalary: "5000",
      salaryCurrency: "USD",
      startDate: "2025-01-01", // Input as string
      // The service might convert it, but we want to ensure it ends up as string in DB
    });
    
    const employeeId = (result as any)[0].insertId;
    cleanup.trackEmployee(employeeId);

    // 2. Read directly from DB to verify storage format
    const db = getDb();
    if (!db) throw new Error("DB not initialized");

    const rawEmployee = await db
      .select()
      .from(employees)
      .where(eq(employees.id, employeeId))
      .get();

    expect(rawEmployee).toBeDefined();
    
    // Verify type and format
    expect(typeof rawEmployee?.startDate).toBe("string");
    expect(rawEmployee?.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD
    expect(rawEmployee?.startDate).toBe("2025-01-01");

    // Ensure it's NOT an object or ISO timestamp with time
    expect(rawEmployee?.startDate).not.toContain("T00:00:00");
    expect(rawEmployee?.startDate).not.toBeInstanceOf(Date);
  });

  it("P0-A: should accept object parameters for listEmployees (Service Signature)", async () => {
    // 1. Create a few employees
    const emp1 = await createEmployee({
      customerId,
      firstName: "Filter",
      lastName: "Active",
      email: "active@example.com",
      country: "US",
      jobTitle: "Dev",
      baseSalary: "1000",
      startDate: "2025-01-01",
      status: "active"
    });
    cleanup.trackEmployee((emp1 as any)[0].insertId);

    const emp2 = await createEmployee({
      customerId,
      firstName: "Filter",
      lastName: "Terminated",
      email: "term@example.com",
      country: "US",
      jobTitle: "Dev",
      baseSalary: "1000",
      startDate: "2025-01-01",
      status: "terminated"
    });
    cleanup.trackEmployee((emp2 as any)[0].insertId);

    // 2. Call listEmployees with object params
    // Old signature: listEmployees(customerId, page, limit, ...) -> would fail or behave wrongly
    // New signature: listEmployees({ customerId, status: ... })
    
    const result = await listEmployees({
      customerId,
      status: "active",
      page: 1,
      pageSize: 10
    });

    // 3. Verify filtering worked
    expect(result.data).toBeDefined();
    expect(result.data.length).toBeGreaterThanOrEqual(1);
    
    const activeFound = result.data.find(e => e.email === "active@example.com");
    const termFound = result.data.find(e => e.email === "term@example.com");

    expect(activeFound).toBeDefined();
    expect(termFound).toBeUndefined(); // Should be filtered out
  });
});
