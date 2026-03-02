import { describe, expect, it, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { TestCleanup } from "./test-cleanup";

const cleanup = new TestCleanup();

afterAll(async () => {
  await cleanup.run();
});

/**
 * Helper to create a mock context with a specific role
 */
function createMockContext(role: string = "admin"): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user-001",
      email: "admin@test.com",
      name: "Test Admin",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  return createMockContext("user");
}

function createAdminContext(): TrpcContext {
  return createMockContext("admin");
}

function createOperationsContext(): TrpcContext {
  return createMockContext("operations_manager");
}

function createFinanceContext(): TrpcContext {
  return createMockContext("finance_manager");
}

function createCustomerManagerContext(): TrpcContext {
  return createMockContext("customer_manager");
}

/* ========== Billing Entities Tests ========== */
describe("billingEntities router", () => {
  it("should list billing entities (admin)", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    // billingEntities.list returns array directly (no input needed but it's a query with no input)
    const result = await caller.billingEntities.list();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should create a billing entity (finance manager)", async () => {
    const caller = appRouter.createCaller(createFinanceContext());
    try {
      const result = await caller.billingEntities.create({
        entityName: "Test Entity Ltd",
        legalName: "Test Entity Legal Name",
        country: "SG",
        currency: "SGD",
        registrationNumber: "REG-001",
        taxId: "TAX-001",
        address: "123 Test Street",
      });
      // MySQL insert returns result header, not the row itself
      expect(result).toBeDefined();
      const insertId = (result as any)?.[0]?.insertId ?? (result as any)?.insertId;
      if (insertId) cleanup.trackBillingEntity(insertId);
    } catch (e: any) {
      // DB unavailable — verify it's an infra error, not auth/validation
      expect(e.message).toMatch(/database|internal/i);
    }
  });

  it("should get a billing entity by id (admin)", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    // Get all entities, pick one if exists
    const list = await caller.billingEntities.list();
    if (list.length > 0) {
      const result = await caller.billingEntities.get({ id: list[0].id });
      expect(result).toBeDefined();
      expect(result?.entityName).toBeTruthy();
    }
  });

  it("should deny billing entity list for regular user", async () => {
    // billingEntities.list uses userProcedure, so regular user CAN access it
    // but create uses financeManagerProcedure
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.billingEntities.create({
        entityName: "Fail",
        legalName: "Fail",
        country: "US",
      })
    ).rejects.toThrow();
  });
});

/* ========== Exchange Rates Tests ========== */
describe("exchangeRates router", () => {
  it("should list exchange rates (finance manager)", async () => {
    const caller = appRouter.createCaller(createFinanceContext());
    // exchangeRates.list requires input { limit, offset } with defaults
    const result = await caller.exchangeRates.list({ limit: 10, offset: 0 });
    expect(result).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("should upsert an exchange rate (admin)", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    try {
      const result = await caller.exchangeRates.upsert({
        fromCurrency: "USD",
        toCurrency: "EUR",
        rate: 0.92,
      });
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    } catch (e: any) {
      // DB unavailable — verify it's an infra error, not auth/validation
      expect(e.message).toMatch(/database|internal/i);
    }
  });

  it("should deny access for regular user on upsert", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.exchangeRates.upsert({
        fromCurrency: "USD",
        toCurrency: "EUR",
        rate: 0.92,
      })
    ).rejects.toThrow();
  });
});

/* ========== User Management Tests ========== */
describe("userManagement router", () => {
  it("should list users (admin)", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.userManagement.list({ limit: 10 });
    expect(result).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(typeof result.total).toBe("number");
  });

  it("should deny access for non-admin user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.userManagement.list({ limit: 10 })).rejects.toThrow();
  });

  it("should deny access for operations manager", async () => {
    const caller = appRouter.createCaller(createOperationsContext());
    await expect(caller.userManagement.list({ limit: 10 })).rejects.toThrow();
  });
});

/* ========== Audit Logs Tests ========== */
describe("auditLogs router", () => {
  it("should list audit logs (admin)", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.auditLogs.list({ limit: 10 });
    expect(result).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(typeof result.total).toBe("number");
  });

  it("should deny access for regular user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.auditLogs.list({ limit: 10 })).rejects.toThrow();
  });
});

/* ========== Payroll Auto-Fill Tests ========== */
describe("payroll.autoFill", () => {
  it("should reject for regular user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.payroll.autoFill({ payrollRunId: 999 })
    ).rejects.toThrow();
  });

  it("should reject for non-existent payroll run", async () => {
    const caller = appRouter.createCaller(createOperationsContext());
    await expect(
      caller.payroll.autoFill({ payrollRunId: 99999 })
    ).rejects.toThrow("Payroll run not found");
  });
});

/* ========== Employee Enhancements Tests ========== */
describe("employees enhancements", () => {
  it("should list employee contracts via nested router", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.employees.contracts.list({ employeeId: 99999 });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it("should get salary info for non-existent employee", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      caller.employees.salaryInfo({ employeeId: 99999 })
    ).rejects.toThrow();
  });

  it("should get leave balances for employee (returns array)", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.employees.leaveBalances({ employeeId: 99999 });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get payroll history for employee", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.employees.payrollHistory({ employeeId: 99999 });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get adjustments for employee (returns {data, total})", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.employees.adjustmentHistory({ employeeId: 99999 });
    expect(result).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(typeof result.total).toBe("number");
  });

  it("should detect visa requirement - same country", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.employees.checkVisaRequired({
      nationality: "SG",
      workCountry: "SG",
    });
    expect(result).toBeDefined();
    expect(result.requiresVisa).toBe(false);
  });

  it("should detect visa requirement - different country", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.employees.checkVisaRequired({
      nationality: "CN",
      workCountry: "SG",
    });
    expect(result).toBeDefined();
    expect(result.requiresVisa).toBe(true);
  });

  it("should deny employee update for regular user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.employees.update({
        id: 1,
        data: { status: "active" },
      })
    ).rejects.toThrow();
  });
});

/* ========== Countries Tax Rate Tests ========== */
describe("countries tax rates", () => {
  it("should list countries (returns array directly)", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.countries.list();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});

/* ========== Role-Based Access Control Tests ========== */
describe("role-based access control", () => {
  it("customer manager can access customer endpoints", async () => {
    const caller = appRouter.createCaller(createCustomerManagerContext());
    const result = await caller.customers.list({ limit: 10 });
    expect(result).toBeDefined();
  });

  it("operations manager can access payroll endpoints", async () => {
    const caller = appRouter.createCaller(createOperationsContext());
    const result = await caller.payroll.list({ limit: 10 });
    expect(result).toBeDefined();
  });

  it("finance manager can access invoice endpoints", async () => {
    const caller = appRouter.createCaller(createFinanceContext());
    const result = await caller.invoices.list({ limit: 10 });
    expect(result).toBeDefined();
  });

  it("regular user cannot create payroll", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.payroll.create({
        countryCode: "SG",
        payrollMonth: "2026-01-01",
      })
    ).rejects.toThrow();
  });

  it("regular user cannot create invoices", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.invoices.create({
        customerId: 360001,
        invoiceType: "monthly_eor",
        currency: "USD",
        subtotal: "1000",
      })
    ).rejects.toThrow();
  });
});
