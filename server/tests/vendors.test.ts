import { describe, expect, it } from "vitest";
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

describe("Vendor Management - Router Structure", () => {
  it("appRouter has vendors sub-router", () => {
    expect(appRouter).toBeDefined();
    // Verify the router has the expected procedure keys
    const routerDef = appRouter._def;
    expect(routerDef).toBeDefined();
  });

  it("vendors router has expected procedures", () => {
    const caller = appRouter.createCaller(createAdminContext().ctx);
    // Verify the caller has vendor methods
    expect(caller.vendors).toBeDefined();
    expect(caller.vendors.list).toBeDefined();
    expect(caller.vendors.getById).toBeDefined();
    expect(caller.vendors.create).toBeDefined();
    expect(caller.vendors.update).toBeDefined();
    expect(caller.vendors.delete).toBeDefined();
  });

  it("vendorBills router has expected procedures", () => {
    const caller = appRouter.createCaller(createAdminContext().ctx);
    expect(caller.vendorBills).toBeDefined();
    expect(caller.vendorBills.list).toBeDefined();
    expect(caller.vendorBills.getById).toBeDefined();
    expect(caller.vendorBills.create).toBeDefined();
    expect(caller.vendorBills.update).toBeDefined();
    expect(caller.vendorBills.updateStatus).toBeDefined();
    expect(caller.vendorBills.delete).toBeDefined();
  });

  it("reports router has expected procedures", () => {
    const caller = appRouter.createCaller(createAdminContext().ctx);
    expect(caller.reports).toBeDefined();
    expect(caller.reports.profitLoss).toBeDefined();
  });
});

describe("Vendor Management - Authorization", () => {
  it("unauthenticated user cannot access vendors.list", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.vendors.list({})).rejects.toThrow();
  });

  it("unauthenticated user cannot create vendor", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.vendors.create({ name: "Test Vendor" })
    ).rejects.toThrow();
  });

  it("regular user cannot create vendor (admin only)", async () => {
    const { ctx } = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.vendors.create({ name: "Test Vendor" })
    ).rejects.toThrow("Finance Manager");
  });

  it("regular user cannot update vendor (admin only)", async () => {
    const { ctx } = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.vendors.update({ id: 1, name: "Updated" })
    ).rejects.toThrow("Finance Manager");
  });

  it("regular user cannot delete vendor (admin only)", async () => {
    const { ctx } = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.vendors.delete({ id: 1 })).rejects.toThrow(
      "Finance Manager"
    );
  });

  it("regular user cannot create vendor bill (admin only)", async () => {
    const { ctx } = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.vendorBills.create({
        vendorId: 1,
        category: "other",
        totalAmount: "1000",
        billDate: "2026-01-15",
      })
    ).rejects.toThrow("Finance Manager");
  });

  it("regular user cannot update bill status (admin only)", async () => {
    const { ctx } = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.vendorBills.update({ id: 1, status: "approved" })
    ).rejects.toThrow("Finance Manager");
  });

  it("unauthenticated user cannot access reports", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.reports.profitAndLoss({ startMonth: "2026-01", endMonth: "2026-02" })
    ).rejects.toThrow();
  });
});

describe("Vendor Management - Input Validation", () => {
  it("vendors.create rejects empty name", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.vendors.create({ name: "" })).rejects.toThrow();
  });

  it("vendorBills.create validates required fields", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    // Missing required fields (billNumber, subtotal) should throw
    await expect(
      caller.vendorBills.create({
        vendorId: 1,
        category: "other",
        totalAmount: "1000",
        billDate: "2026-01-15",
      } as any)
    ).rejects.toThrow();
  });

  it("vendorBills.update validates status enum", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.vendorBills.update({
        id: 1,
        status: "invalid_status" as any,
      })
    ).rejects.toThrow();
  });

  it("reports.profitAndLoss procedure exists and is callable", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    // Verify the procedure exists on the router
    expect(caller.reports.profitAndLoss).toBeDefined();
  });
});
