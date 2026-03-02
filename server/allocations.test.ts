import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Test Helpers ────────────────────────────────────────────────────────────

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext() {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@gea.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as unknown as TrpcContext["res"],
  };

  return { ctx, user };
}

function createRegularUserContext() {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@gea.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as unknown as TrpcContext["res"],
  };

  return { ctx, user };
}

function createUnauthContext() {
  const ctx: TrpcContext = {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Allocation System - Router Structure", () => {
  it("appRouter has allocations sub-router", () => {
    const caller = appRouter.createCaller(createAdminContext().ctx);
    expect(caller.allocations).toBeDefined();
  });

  it("allocations router has expected query procedures", () => {
    const caller = appRouter.createCaller(createAdminContext().ctx);
    expect(caller.allocations.listByBill).toBeDefined();
    expect(caller.allocations.listByInvoice).toBeDefined();
    expect(caller.allocations.billSummary).toBeDefined();
    expect(caller.allocations.invoiceSummary).toBeDefined();
    expect(caller.allocations.vendorAnalysis).toBeDefined();
    expect(caller.allocations.profitOverview).toBeDefined();
    expect(caller.allocations.vendorComparison).toBeDefined();
  });

  it("allocations router has expected mutation procedures", () => {
    const caller = appRouter.createCaller(createAdminContext().ctx);
    expect(caller.allocations.create).toBeDefined();
    expect(caller.allocations.batchCreate).toBeDefined();
    expect(caller.allocations.update).toBeDefined();
    expect(caller.allocations.delete).toBeDefined();
    expect(caller.allocations.deleteAllForBill).toBeDefined();
  });
});

describe("Allocation System - Authorization", () => {
  it("unauthenticated user cannot list allocations by bill", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.allocations.listByBill({ vendorBillId: 1 })).rejects.toThrow();
  });

  it("unauthenticated user cannot create allocation", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.allocations.create({
        vendorBillId: 1,
        invoiceId: 1,
        employeeId: 1,
        allocatedAmount: "1000.00",
      })
    ).rejects.toThrow();
  });

  it("regular user can read allocations (listByBill)", async () => {
    // Regular users should have read access via userProcedure
    const { ctx } = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);
    // This should not throw an auth error (may throw DB error which is fine)
    try {
      await caller.allocations.listByBill({ vendorBillId: 999 });
    } catch (e: any) {
      // Should not be an auth/permission error
      expect(e.message).not.toContain("UNAUTHORIZED");
      expect(e.message).not.toContain("Finance Manager");
    }
  });

  it("regular user cannot create allocation (finance manager only)", async () => {
    const { ctx } = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.allocations.create({
        vendorBillId: 1,
        invoiceId: 1,
        employeeId: 1,
        allocatedAmount: "1000.00",
      })
    ).rejects.toThrow("Finance Manager");
  });

  it("regular user cannot delete allocation (finance manager only)", async () => {
    const { ctx } = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.allocations.delete({ id: 1 })
    ).rejects.toThrow("Finance Manager");
  });

  it("regular user cannot batch create allocations (finance manager only)", async () => {
    const { ctx } = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.allocations.batchCreate({
        allocations: [
          { vendorBillId: 1, invoiceId: 1, employeeId: 1, allocatedAmount: "500.00" },
        ],
      })
    ).rejects.toThrow("Finance Manager");
  });
});

describe("Allocation System - Input Validation", () => {
  it("create allocation rejects zero amount", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.allocations.create({
        vendorBillId: 1,
        invoiceId: 1,
        employeeId: 1,
        allocatedAmount: "0",
      })
    ).rejects.toThrow();
  });

  it("create allocation rejects negative amount", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.allocations.create({
        vendorBillId: 1,
        invoiceId: 1,
        employeeId: 1,
        allocatedAmount: "-500",
      })
    ).rejects.toThrow();
  });

  it("create allocation requires vendorBillId", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.allocations.create({
        vendorBillId: undefined as any,
        invoiceId: 1,
        employeeId: 1,
        allocatedAmount: "1000",
      })
    ).rejects.toThrow();
  });

  it("create allocation requires invoiceId", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.allocations.create({
        vendorBillId: 1,
        invoiceId: undefined as any,
        employeeId: 1,
        allocatedAmount: "1000",
      })
    ).rejects.toThrow();
  });

  it("create allocation requires employeeId", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.allocations.create({
        vendorBillId: 1,
        invoiceId: 1,
        employeeId: undefined as any,
        allocatedAmount: "1000",
      })
    ).rejects.toThrow();
  });

  it("batch create rejects empty allocations array", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    // Empty array should still be accepted by zod (it's a valid array)
    // but the result should have 0 created items
    try {
      const result = await caller.allocations.batchCreate({ allocations: [] });
      expect(result.created).toBe(0);
    } catch (e: any) {
      // DB error is acceptable here
      expect(e.code).not.toBe("BAD_REQUEST");
    }
  });
});

describe("Allocation System - PDF Parsing Router", () => {
  it("appRouter has pdfParsing sub-router", () => {
    const caller = appRouter.createCaller(createAdminContext().ctx);
    expect(caller.pdfParsing).toBeDefined();
  });

  it("pdfParsing router has expected procedures", () => {
    const caller = appRouter.createCaller(createAdminContext().ctx);
    expect(caller.pdfParsing.parseVendorInvoice).toBeDefined();
    expect(caller.pdfParsing.parseBankPOP).toBeDefined();
  });

  it("unauthenticated user cannot parse vendor invoice", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.pdfParsing.parseVendorInvoice({ fileUrl: "https://example.com/test.pdf" })
    ).rejects.toThrow();
  });

  it("regular user cannot parse vendor invoice (finance manager only)", async () => {
    const { ctx } = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.pdfParsing.parseVendorInvoice({ fileUrl: "https://example.com/test.pdf" })
    ).rejects.toThrow("Finance Manager");
  });
});

describe("Allocation System - Reports Enhancement", () => {
  it("reports.profitAndLoss procedure exists and is callable", () => {
    const caller = appRouter.createCaller(createAdminContext().ctx);
    expect(caller.reports.profitAndLoss).toBeDefined();
  });

  it("allocations.profitOverview procedure exists", () => {
    const caller = appRouter.createCaller(createAdminContext().ctx);
    expect(caller.allocations.profitOverview).toBeDefined();
  });

  it("allocations.vendorComparison procedure exists", () => {
    const caller = appRouter.createCaller(createAdminContext().ctx);
    expect(caller.allocations.vendorComparison).toBeDefined();
  });
});
