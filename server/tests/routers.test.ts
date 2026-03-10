import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ── helpers ──────────────────────────────────────────────────────────────────

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAnonContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ── test suites ──────────────────────────────────────────────────────────────

describe("Dashboard router", () => {
  it("returns stats for authenticated user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const stats = await caller.dashboard.stats();
    expect(stats).toBeDefined();
    expect(typeof stats.totalCustomers).toBe("number");
    expect(typeof stats.totalEmployees).toBe("number");
    expect(typeof stats.activeEmployees).toBe("number");
  });

  it("rejects anonymous access to dashboard stats", async () => {
    const caller = appRouter.createCaller(createAnonContext());
    await expect(caller.dashboard.stats()).rejects.toThrow();
  });
});

describe("Customers router", () => {
  it("lists customers (empty initially)", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.customers.list({ limit: 10 });
    expect(result).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(typeof result.total).toBe("number");
  });

  it("rejects anonymous access to customer list", async () => {
    const caller = appRouter.createCaller(createAnonContext());
    await expect(caller.customers.list({ limit: 10 })).rejects.toThrow();
  });
});

describe("Employees router", () => {
  it("lists employees with filters", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.employees.list({ limit: 10 });
    expect(result).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(typeof result.total).toBe("number");
  });

  it("lists employees with status filter", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.employees.list({ status: "active", limit: 10 });
    expect(result).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("returns null for non-existent employee", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.employees.get({ id: 999999 });
    expect(result).toBeFalsy();
  });
});

describe("Payroll router", () => {
  it("lists payroll runs", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.payroll.list({ limit: 10 });
    expect(result).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(typeof result.total).toBe("number");
  });

  it("lists payroll items for non-existent run returns empty", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.payroll.getItems({ payrollRunId: 999999 });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});

describe("Invoices router", () => {
  it("lists invoices", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.invoices.list({ limit: 10 });
    expect(result).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(typeof result.total).toBe("number");
  });

  it("returns null for non-existent invoice", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.invoices.get({ id: 999999 });
    expect(result).toBeFalsy();
  });
});

describe("Countries router", () => {
  it("lists country configurations", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.countries.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("lists leave types for a country code", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.countries.leaveTypes.list({ countryCode: "SG" });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Leave router", () => {
  it("lists leave requests", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.leave.list({ limit: 10 });
    expect(result).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(typeof result.total).toBe("number");
  });
});

describe("Adjustments router", () => {
  it("lists adjustments", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.adjustments.list({ limit: 10 });
    expect(result).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(typeof result.total).toBe("number");
  });
});

describe("Auth router", () => {
  it("returns something for authenticated user", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.auth.me();
    // auth.me may return user directly or wrapped
    expect(result).toBeDefined();
  });

  it("returns falsy for anonymous", async () => {
    const caller = appRouter.createCaller(createAnonContext());
    const result = await caller.auth.me();
    // Anonymous may return null or { user: null }
    const user = result && typeof result === 'object' && 'user' in result ? (result as any).user : result;
    expect(user).toBeFalsy();
  });
});
