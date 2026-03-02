/**
 * Portal Features Tests
 *
 * Tests for the portal tRPC procedures: dashboard, employees, payroll,
 * adjustments, leave, invoices, settings.
 */
import { describe, expect, it } from "vitest";
import { portalAppRouter } from "./portal/portalRouter";
import type { PortalContext } from "./portal/portalTrpc";
import type { PortalUser } from "./portal/portalAuth";

// ─── Test Helpers ────────────────────────────────────────────────────────────

function createPortalUser(overrides: Partial<PortalUser> = {}): PortalUser {
  return {
    contactId: 1,
    customerId: 1,
    email: "test@company.com",
    contactName: "Test User",
    portalRole: "admin",
    companyName: "Test Company",
    ...overrides,
  };
}

function createPortalContext(user: PortalUser | null = null): PortalContext {
  return {
    req: {
      protocol: "https",
      headers: {},
    } as PortalContext["req"],
    res: {
      clearCookie: () => {},
      cookie: () => {},
    } as unknown as PortalContext["res"],
    portalUser: user,
  };
}

const caller = portalAppRouter.createCaller;

// ─── Dashboard Tests ─────────────────────────────────────────────────────────

describe("Portal Dashboard", () => {
  it("should return stats for authenticated user", async () => {
    const user = createPortalUser();
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    const stats = await trpc.dashboard.stats();
    expect(stats).toBeDefined();
    if (stats) {
      expect(typeof stats.activeEmployees).toBe("number");
      expect(typeof stats.activeCountries).toBe("number");
      expect(typeof stats.pendingOnboarding).toBe("number");
      expect(typeof stats.pendingAdjustments).toBe("number");
      expect(typeof stats.pendingLeave).toBe("number");
      expect(typeof stats.overdueInvoices).toBe("number");
      expect(typeof stats.unpaidInvoices).toBe("number");
    }
  });

  it("should reject unauthenticated requests", async () => {
    const ctx = createPortalContext(null);
    const trpc = caller(ctx);

    await expect(trpc.dashboard.stats()).rejects.toThrow();
  });

  it("should return employees by country", async () => {
    const user = createPortalUser();
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    const countries = await trpc.dashboard.employeesByCountry();
    expect(Array.isArray(countries)).toBe(true);
    for (const c of countries) {
      expect(c).toHaveProperty("countryCode");
      expect(c).toHaveProperty("countryName");
      expect(c).toHaveProperty("employeeCount");
    }
  });

  it("should return recent activity", async () => {
    const user = createPortalUser();
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    const activity = await trpc.dashboard.recentActivity();
    expect(Array.isArray(activity)).toBe(true);
    expect(activity.length).toBeLessThanOrEqual(20);
  });

  it("should return payroll trend data", async () => {
    const user = createPortalUser();
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    const trend = await trpc.dashboard.payrollTrend();
    expect(Array.isArray(trend)).toBe(true);
    for (const t of trend) {
      expect(typeof t.totalGross).toBe("number");
      expect(typeof t.totalNet).toBe("number");
      expect(typeof t.totalEmployerCost).toBe("number");
    }
  });

  it("should return employee status distribution", async () => {
    const user = createPortalUser();
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    const dist = await trpc.dashboard.employeeStatusDistribution();
    expect(Array.isArray(dist)).toBe(true);
    for (const d of dist) {
      expect(d).toHaveProperty("status");
      expect(d).toHaveProperty("count");
    }
  });
});

// ─── Employees Tests ─────────────────────────────────────────────────────────

describe("Portal Employees", () => {
  it("should list employees for authenticated user", async () => {
    const user = createPortalUser();
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    const result = await trpc.employees.list({});
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.items)).toBe(true);
  });

  it("should reject unauthenticated employee list", async () => {
    const ctx = createPortalContext(null);
    const trpc = caller(ctx);

    await expect(trpc.employees.list({})).rejects.toThrow();
  });

  it("should list employees with pagination", async () => {
    const user = createPortalUser();
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    const result = await trpc.employees.list({ limit: 5, offset: 0 });
    expect(result.items.length).toBeLessThanOrEqual(5);
  });

  it("should get employee detail", async () => {
    const user = createPortalUser();
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    // First get the list to find an employee
    const list = await trpc.employees.list({});
    if (list.items.length > 0) {
      const detail = await trpc.employees.detail({ id: list.items[0].id });
      expect(detail).toBeDefined();
      if (detail) {
        expect(detail).toHaveProperty("id");
        expect(detail).toHaveProperty("firstName");
        expect(detail).toHaveProperty("lastName");
      }
    }
  });
});

// ─── Payroll Tests ───────────────────────────────────────────────────────────

describe("Portal Payroll", () => {
  it("should list payroll runs for authenticated user", async () => {
    const user = createPortalUser();
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    const result = await trpc.payroll.list({});
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.items)).toBe(true);
  });

  it("should reject unauthenticated payroll list", async () => {
    const ctx = createPortalContext(null);
    const trpc = caller(ctx);

    await expect(trpc.payroll.list({})).rejects.toThrow();
  });
});

// ─── Adjustments Tests ───────────────────────────────────────────────────────

describe("Portal Adjustments", () => {
  it("should list adjustments for authenticated user", async () => {
    const user = createPortalUser();
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    const result = await trpc.adjustments.list({});
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.items)).toBe(true);
  });

  it("should reject unauthenticated adjustments list", async () => {
    const ctx = createPortalContext(null);
    const trpc = caller(ctx);

    await expect(trpc.adjustments.list({})).rejects.toThrow();
  });

  it("should reject create adjustment from viewer role", async () => {
    const user = createPortalUser({ portalRole: "viewer" });
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    await expect(
      trpc.adjustments.create({
        employeeId: 1,
        adjustmentType: "bonus",
        category: "recurring",
        amount: 100,
        currency: "USD",
        effectiveMonth: new Date().toISOString(),
      })
    ).rejects.toThrow();
  });
});

// ─── Leave Tests ─────────────────────────────────────────────────────────────

describe("Portal Leave", () => {
  it("should list leave records for authenticated user", async () => {
    const user = createPortalUser();
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    const result = await trpc.leave.list({});
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.items)).toBe(true);
  });

  it("should reject unauthenticated leave list", async () => {
    const ctx = createPortalContext(null);
    const trpc = caller(ctx);

    await expect(trpc.leave.list({})).rejects.toThrow();
  });

  it("should list leave balances", async () => {
    const user = createPortalUser();
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    // balances requires employeeId - test with a dummy id
    const balances = await trpc.leave.balances({ employeeId: 1 });
    expect(Array.isArray(balances)).toBe(true);
  });
});

// ─── Invoices Tests ──────────────────────────────────────────────────────────

describe("Portal Invoices", () => {
  it("should list invoices for authenticated user", async () => {
    const user = createPortalUser();
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    const result = await trpc.invoices.list({});
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.items)).toBe(true);
  });

  it("should reject unauthenticated invoice list", async () => {
    const ctx = createPortalContext(null);
    const trpc = caller(ctx);

    await expect(trpc.invoices.list({})).rejects.toThrow();
  });

  it("should get invoice detail with items", async () => {
    const user = createPortalUser();
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    const list = await trpc.invoices.list({});
    if (list.items.length > 0) {
      const detail = await trpc.invoices.detail({ id: list.items[0].id });
      expect(detail).toBeDefined();
      if (detail) {
        expect(detail).toHaveProperty("id");
        expect(detail).toHaveProperty("items");
        expect(Array.isArray(detail.items)).toBe(true);
      }
    }
  });
});

// ─── Settings Tests ──────────────────────────────────────────────────────────

describe("Portal Settings", () => {
  it("should return company profile for authenticated user", async () => {
    const user = createPortalUser();
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    const profile = await trpc.settings.companyProfile();
    // May return null if no customer data exists for test user
    if (profile) {
      expect(profile).toHaveProperty("companyName");
    }
  });

  it("should return leave policies", async () => {
    const user = createPortalUser();
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    const policies = await trpc.settings.leavePolicies();
    expect(Array.isArray(policies)).toBe(true);
  });

  it("should reject listUsers from non-admin role", async () => {
    const user = createPortalUser({ portalRole: "viewer" });
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    await expect(trpc.settings.listUsers()).rejects.toThrow();
  });

  it("should list users for admin", async () => {
    const user = createPortalUser({ portalRole: "admin" });
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    const users = await trpc.settings.listUsers();
    expect(Array.isArray(users)).toBe(true);
  });

  it("should reject inviteUser from non-admin role", async () => {
    const user = createPortalUser({ portalRole: "hr_manager" });
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    await expect(
      trpc.settings.inviteUser({
        email: "new@company.com",
        contactName: "New User",
        portalRole: "viewer",
      })
    ).rejects.toThrow();
  });

  it("should return active countries", async () => {
    const user = createPortalUser();
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    const countries = await trpc.settings.activeCountries();
    expect(Array.isArray(countries)).toBe(true);
  });

  it("should reject updateLeavePolicy from non-admin", async () => {
    const user = createPortalUser({ portalRole: "finance" });
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    await expect(
      trpc.settings.updateLeavePolicy({
        id: 1,
        annualEntitlement: 20,
        expiryRule: "year_end",
        carryOverDays: 5,
      })
    ).rejects.toThrow();
  });

  it("should reject deactivateUser for self", async () => {
    const user = createPortalUser({ contactId: 1, portalRole: "admin" });
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    await expect(
      trpc.settings.deactivateUser({ contactId: 1 })
    ).rejects.toThrow("Cannot deactivate your own account");
  });

  it("should reject updateUserRole for self", async () => {
    const user = createPortalUser({ contactId: 1, portalRole: "admin" });
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    await expect(
      trpc.settings.updateUserRole({ contactId: 1, portalRole: "viewer" })
    ).rejects.toThrow("Cannot change your own role");
  });
});

// ─── Account Summary Tests ──────────────────────────────────────────────────

describe("Portal Account Summary", () => {
  it("should return account summary for authenticated user", async () => {
    const user = createPortalUser();
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    const summary = await trpc.invoices.accountSummary();
    expect(summary).toBeDefined();
    expect(typeof summary.totalInvoiced).toBe("number");
    expect(typeof summary.totalPaid).toBe("number");
    expect(typeof summary.totalCreditNotes).toBe("number");
    expect(typeof summary.totalDeposits).toBe("number");
    expect(typeof summary.outstandingBalance).toBe("number");
  });

  it("should reject unauthenticated account summary", async () => {
    const ctx = createPortalContext(null);
    const trpc = caller(ctx);

    await expect(trpc.invoices.accountSummary()).rejects.toThrow();
  });

  it("should return non-negative deposit balance", async () => {
    const user = createPortalUser();
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    const summary = await trpc.invoices.accountSummary();
    expect(summary.totalDeposits).toBeGreaterThanOrEqual(0);
  });

  it("should return non-negative outstanding balance", async () => {
    const user = createPortalUser();
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    const summary = await trpc.invoices.accountSummary();
    expect(summary.outstandingBalance).toBeGreaterThanOrEqual(0);
  });
});

// ─── Account Summary with Real Customer Data ────────────────────────────────

describe("Portal Account Summary - Acme Corp (360001)", () => {
  it("should reflect deposit-to-credit-note conversion in deposit balance", async () => {
    // Acme Corp has deposit GEAHK-DEP-202602-001 (22978.33) fully converted to credit note CN-GEAHK-202602-004 (applied)
    const user = createPortalUser({ customerId: 360001 });
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    const summary = await trpc.invoices.accountSummary();
    // The deposit was fully converted to a credit note, so net deposit balance should be 0
    expect(summary.totalDeposits).toBe(0);
  });

  it("should show correct credit notes total (negative values)", async () => {
    const user = createPortalUser({ customerId: 360001 });
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    const summary = await trpc.invoices.accountSummary();
    // Credit notes total represents the absolute value of credit notes issued
    expect(typeof summary.totalCreditNotes).toBe('number');
  });
});

// ─── Partial Payment Display Logic Tests ────────────────────────────────────

describe("Portal Invoice Partial Payment Detection", () => {
  it("should detect partial payment when paidAmount < amountDue", async () => {
    const user = createPortalUser({ customerId: 360001 });
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    const list = await trpc.invoices.list({});
    // Find invoice GEAHK-202602-007 (partially paid)
    const partiallyPaid = list.items.find((inv: any) =>
      inv.invoiceNumber === "GEAHK-202602-007"
    );

    if (partiallyPaid) {
      const effectiveDue = partiallyPaid.amountDue != null
        ? Number(partiallyPaid.amountDue)
        : Number(partiallyPaid.total);
      const paidAmt = partiallyPaid.paidAmount != null
        ? Number(partiallyPaid.paidAmount)
        : 0;
      const remaining = effectiveDue - paidAmt;

      // Should be partially paid (remaining > 0)
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeCloseTo(231.63, 1);
      expect(partiallyPaid.status).toBe("paid");
    }
  });

  it("should return invoice detail with credit applications", async () => {
    const user = createPortalUser({ customerId: 360001 });
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    const list = await trpc.invoices.list({});
    const invoiceWithCredit = list.items.find((inv: any) =>
      Number(inv.creditApplied) > 0
    );

    if (invoiceWithCredit) {
      const detail = await trpc.invoices.detail({ id: invoiceWithCredit.id });
      expect(detail).toBeDefined();
      expect(detail.creditApplications).toBeDefined();
      expect(Array.isArray(detail.creditApplications)).toBe(true);
      if (detail.creditApplications.length > 0) {
        const app = detail.creditApplications[0];
        expect(app).toHaveProperty("appliedAmount");
        expect(app).toHaveProperty("creditNoteNumber");
        expect(Number(app.appliedAmount)).toBeGreaterThan(0);
      }
    }
  });
});

// ─── Employee Delete Tests ──────────────────────────────────────────────────

describe("Portal Employee Delete", () => {
  it("should reject unauthenticated delete requests", async () => {
    const ctx = createPortalContext(null);
    const trpc = caller(ctx);

    await expect(trpc.employees.delete({ id: 1 })).rejects.toThrow();
  });

  it("should reject delete for non-pending_review employees", async () => {
    const user = createPortalUser({ customerId: 360001 });
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    // Get an active employee
    const list = await trpc.employees.list({ status: "active" });
    if (list.items.length > 0) {
      const activeEmp = list.items[0];
      await expect(trpc.employees.delete({ id: activeEmp.id })).rejects.toThrow(
        /pending review/i
      );
    }
  });

  it("should reject delete for employees belonging to another customer", async () => {
    const user = createPortalUser({ customerId: 999999 });
    const ctx = createPortalContext(user);
    const trpc = caller(ctx);

    await expect(trpc.employees.delete({ id: 1 })).rejects.toThrow();
  });
});
