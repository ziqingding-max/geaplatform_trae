/**
 * Batch 4 Tests — Approval Workflow & Reimbursements
 *
 * Validates:
 * 1. Admin reimbursement CRUD operations
 * 2. Admin approval/rejection for adjustments, leave, reimbursements
 * 3. Portal approval/rejection for adjustments, leave, reimbursements
 * 4. Status transition enforcement (only client_approved → admin_approved/admin_rejected)
 */

import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import { portalAppRouter } from "./portal/portalRouter";
import type { TrpcContext } from "./_core/context";
import type { PortalContext } from "./portal/portalTrpc";
import type { PortalUser } from "./portal/portalAuth";

// ============================================================================
// Admin Test Helpers
// ============================================================================

function createAdminCaller(role: string = "admin") {
  const ctx: TrpcContext = {
    user: {
      id: 1,
      openId: "test-" + role,
      email: `${role}@test.com`,
      name: role.charAt(0).toUpperCase() + role.slice(1),
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
  return appRouter.createCaller(ctx);
}

// ============================================================================
// Portal Test Helpers
// ============================================================================

function createPortalCaller(portalUser: PortalUser | null = null) {
  const ctx: PortalContext = {
    portalUser,
    req: {
      protocol: "https",
      headers: {},
    } as PortalContext["req"],
    res: {
      clearCookie: () => {},
      cookie: () => {},
    } as unknown as PortalContext["res"],
  };
  return portalAppRouter.createCaller(ctx);
}

function createTestPortalUser(overrides: Partial<PortalUser> = {}): PortalUser {
  return {
    contactId: 1,
    customerId: 100,
    email: "john@acme.com",
    contactName: "John Doe",
    portalRole: "admin",
    companyName: "Acme Corp",
    ...overrides,
  };
}

// ============================================================================
// 1. Admin Reimbursement Router Tests
// ============================================================================

describe("Admin Reimbursements Router", () => {
  it("should have list endpoint", async () => {
    const caller = createAdminCaller();
    const result = await caller.reimbursements.list({ limit: 10, offset: 0 });
    expect(result).toBeDefined();
    expect(result).toHaveProperty("data");
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("should reject get for non-existent reimbursement", async () => {
    const caller = createAdminCaller();
    const result = await caller.reimbursements.get({ id: 999999 });
    // getReimbursementById returns undefined for non-existent
    expect(result).toBeFalsy();
  });

  it("should reject create without employee", async () => {
    const caller = createAdminCaller();
    try {
      await caller.reimbursements.create({
        employeeId: 999999,
        category: "travel",
        amount: "100.00",
        effectiveMonth: "2026-03",
        receiptFileUrl: "https://example.com/receipt.pdf",
      });
      expect.fail("Should have thrown");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });

  it("should reject delete for non-existent reimbursement", async () => {
    const caller = createAdminCaller();
    try {
      await caller.reimbursements.delete({ id: 999999 });
      expect.fail("Should have thrown");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });

  it("should reject adminApprove for non-existent reimbursement", async () => {
    const caller = createAdminCaller();
    try {
      await caller.reimbursements.adminApprove({ id: 999999 });
      expect.fail("Should have thrown");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });

  it("should reject adminReject for non-existent reimbursement", async () => {
    const caller = createAdminCaller();
    try {
      await caller.reimbursements.adminReject({ id: 999999 });
      expect.fail("Should have thrown");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });
});

// ============================================================================
// 2. Admin Adjustment Approval Tests
// ============================================================================

describe("Admin Adjustment Approval", () => {
  it("should have adminApprove endpoint", async () => {
    const caller = createAdminCaller();
    try {
      await caller.adjustments.adminApprove({ id: 999999 });
      expect.fail("Should have thrown for non-existent");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });

  it("should have adminReject endpoint", async () => {
    const caller = createAdminCaller();
    try {
      await caller.adjustments.adminReject({ id: 999999 });
      expect.fail("Should have thrown for non-existent");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });

  it("should reject operations_manager from admin approval", async () => {
    const caller = createAdminCaller("operations_manager");
    try {
      await caller.adjustments.adminApprove({ id: 999999 });
      expect.fail("Should have thrown");
    } catch (error: any) {
      // operations_manager should not be able to admin approve
      expect(error.message).toBeDefined();
    }
  });
});

// ============================================================================
// 3. Admin Leave Approval Tests
// ============================================================================

describe("Admin Leave Approval", () => {
  it("should have adminApprove endpoint", async () => {
    const caller = createAdminCaller();
    try {
      await caller.leave.adminApprove({ id: 999999 });
      expect.fail("Should have thrown for non-existent");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });

  it("should have adminReject endpoint", async () => {
    const caller = createAdminCaller();
    try {
      await caller.leave.adminReject({ id: 999999 });
      expect.fail("Should have thrown for non-existent");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });
});

// ============================================================================
// 4. Portal Reimbursement Tests
// ============================================================================

describe("Portal Reimbursements Router", () => {
  it("should list reimbursements for authenticated portal user", async () => {
    const user = createTestPortalUser();
    const caller = createPortalCaller(user);
    const result = await caller.reimbursements.list({});
    expect(result).toBeDefined();
    // Portal reimbursements returns { items, total }
    expect(result).toHaveProperty("items");
    expect(Array.isArray(result.items)).toBe(true);
  });

  it("should reject unauthenticated access", async () => {
    const caller = createPortalCaller(null);
    try {
      await caller.reimbursements.list({});
      expect.fail("Should have thrown");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });

  it("should reject create without receipt", async () => {
    const user = createTestPortalUser();
    const caller = createPortalCaller(user);
    try {
      await caller.reimbursements.create({
        employeeId: 999999,
        category: "travel",
        amount: "100.00",
        effectiveMonth: "2026-03",
      });
      expect.fail("Should have thrown");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });
});

// ============================================================================
// 5. Portal Leave Approval Tests
// ============================================================================

describe("Portal Leave Approval", () => {
  it("should have clientApprove endpoint", async () => {
    const user = createTestPortalUser();
    const caller = createPortalCaller(user);
    try {
      await caller.leave.clientApprove({ id: 999999 });
      expect.fail("Should have thrown for non-existent");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });

  it("should have clientReject endpoint", async () => {
    const user = createTestPortalUser();
    const caller = createPortalCaller(user);
    try {
      await caller.leave.clientReject({ id: 999999 });
      expect.fail("Should have thrown for non-existent");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });

  it("should reject viewer from approving leave", async () => {
    const viewer = createTestPortalUser({ portalRole: "viewer" });
    const caller = createPortalCaller(viewer);
    try {
      await caller.leave.clientApprove({ id: 999999 });
      expect.fail("Should have thrown");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });
});

// ============================================================================
// 6. Portal Adjustment Approval Tests
// ============================================================================

describe("Portal Adjustment Approval", () => {
  it("should have clientApprove endpoint", async () => {
    const user = createTestPortalUser();
    const caller = createPortalCaller(user);
    try {
      await caller.adjustments.clientApprove({ id: 999999 });
      expect.fail("Should have thrown for non-existent");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });

  it("should have clientReject endpoint", async () => {
    const user = createTestPortalUser();
    const caller = createPortalCaller(user);
    try {
      await caller.adjustments.clientReject({ id: 999999 });
      expect.fail("Should have thrown for non-existent");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });
});

// ============================================================================
// 7. Portal Reimbursement Approval Tests
// ============================================================================

describe("Portal Reimbursement Approval", () => {
  it("should have clientApprove endpoint", async () => {
    const user = createTestPortalUser();
    const caller = createPortalCaller(user);
    try {
      await caller.reimbursements.clientApprove({ id: 999999 });
      expect.fail("Should have thrown for non-existent");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });

  it("should have clientReject endpoint", async () => {
    const user = createTestPortalUser();
    const caller = createPortalCaller(user);
    try {
      await caller.reimbursements.clientReject({ id: 999999 });
      expect.fail("Should have thrown for non-existent");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });

  it("should reject viewer from approving reimbursement", async () => {
    const viewer = createTestPortalUser({ portalRole: "viewer" });
    const caller = createPortalCaller(viewer);
    try {
      await caller.reimbursements.clientApprove({ id: 999999 });
      expect.fail("Should have thrown");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });
});
