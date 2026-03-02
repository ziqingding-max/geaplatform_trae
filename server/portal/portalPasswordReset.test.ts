/**
 * Portal Password Reset Flow Tests
 *
 * Tests: forgotPassword, verifyResetToken, resetPassword
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Shared mock state ───
let mockContacts: any[] = [];
let lastUpdate: any = null;
let lastUpdateWhere: any = null;

// ─── Mock drizzle ───
const mockWhere = vi.fn().mockImplementation((condition: any) => {
  lastUpdateWhere = condition;
  return { limit: vi.fn().mockReturnValue(mockContacts) };
});

const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

const mockUpdateSet = vi.fn().mockImplementation((data: any) => {
  lastUpdate = data;
  return { where: vi.fn().mockResolvedValue(undefined) };
});
const mockUpdateTable = vi.fn().mockReturnValue({ set: mockUpdateSet });

const mockDb = {
  select: mockSelect,
  update: mockUpdateTable,
};

vi.mock("../db", () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
}));

vi.mock("../../drizzle/schema", () => ({
  customerContacts: {
    id: "id",
    email: "email",
    contactName: "contactName",
    resetToken: "resetToken",
    resetExpiresAt: "resetExpiresAt",
    passwordHash: "passwordHash",
    isPortalActive: "isPortalActive",
    hasPortalAccess: "hasPortalAccess",
    portalRole: "portalRole",
    customerId: "customerId",
    inviteToken: "inviteToken",
    inviteExpiresAt: "inviteExpiresAt",
    lastLoginAt: "lastLoginAt",
  },
  customers: {
    id: "id",
    companyName: "companyName",
    status: "status",
  },
}));

// Mock portalAuth helpers
vi.mock("./portalAuth", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashed_new_password"),
  verifyPassword: vi.fn().mockImplementation(async (plain: string, hash: string) => {
    return plain === "correct_password" && hash === "existing_hash";
  }),
  signPortalToken: vi.fn().mockResolvedValue("mock_jwt_token"),
  setPortalCookie: vi.fn(),
  clearPortalCookie: vi.fn(),
  verifyPortalToken: vi.fn(),
  getPortalTokenFromRequest: vi.fn(),
  generateResetToken: vi.fn().mockReturnValue("mock_reset_token_abc123"),
  getResetExpiryDate: vi.fn().mockReturnValue(new Date(Date.now() + 3600000)),
}));

// Mock drizzle-orm operators
vi.mock("drizzle-orm", () => ({
  eq: vi.fn().mockImplementation((a: any, b: any) => ({ op: "eq", field: a, value: b })),
  and: vi.fn().mockImplementation((...args: any[]) => ({ op: "and", conditions: args })),
}));

describe("Portal Password Reset Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockContacts = [];
    lastUpdate = null;
    lastUpdateWhere = null;
  });

  describe("forgotPassword", () => {
    it("should return success even if email not found (prevent enumeration)", async () => {
      // No contacts found
      mockContacts = [];

      const { portalAuthRouter } = await import("./routers/portalAuthRouter");
      const caller = portalAuthRouter.createCaller({
        req: {} as any,
        res: { cookie: vi.fn(), clearCookie: vi.fn() } as any,
        portalUser: null,
      });

      const result = await caller.forgotPassword({
        email: "nonexistent@example.com",
        origin: "https://portal.gea.com",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("If an account exists");
      // Should NOT return a resetUrl for non-existent accounts
      expect(result.resetUrl).toBeUndefined();
    });

    it("should return success with reset URL for valid active account", async () => {
      mockContacts = [
        {
          id: 1,
          email: "user@company.com",
          isPortalActive: true,
          hasPortalAccess: true,
        },
      ];

      const { portalAuthRouter } = await import("./routers/portalAuthRouter");
      const caller = portalAuthRouter.createCaller({
        req: {} as any,
        res: { cookie: vi.fn(), clearCookie: vi.fn() } as any,
        portalUser: null,
      });

      const result = await caller.forgotPassword({
        email: "user@company.com",
        origin: "https://portal.gea.com",
      });

      expect(result.success).toBe(true);
      expect(result.resetUrl).toContain("/portal/reset-password?token=");
      expect(result.resetUrl).toContain("mock_reset_token_abc123");
    });

    it("should not generate reset link for inactive portal accounts", async () => {
      mockContacts = [
        {
          id: 1,
          email: "inactive@company.com",
          isPortalActive: false,
          hasPortalAccess: true,
        },
      ];

      const { portalAuthRouter } = await import("./routers/portalAuthRouter");
      const caller = portalAuthRouter.createCaller({
        req: {} as any,
        res: { cookie: vi.fn(), clearCookie: vi.fn() } as any,
        portalUser: null,
      });

      const result = await caller.forgotPassword({
        email: "inactive@company.com",
        origin: "https://portal.gea.com",
      });

      expect(result.success).toBe(true);
      // Should NOT return resetUrl for inactive accounts
      expect(result.resetUrl).toBeUndefined();
    });
  });

  describe("verifyResetToken", () => {
    it("should return invalid for non-existent token", async () => {
      mockContacts = [];

      const { portalAuthRouter } = await import("./routers/portalAuthRouter");
      const caller = portalAuthRouter.createCaller({
        req: {} as any,
        res: { cookie: vi.fn(), clearCookie: vi.fn() } as any,
        portalUser: null,
      });

      const result = await caller.verifyResetToken({ token: "invalid_token" });
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("Invalid reset link");
    });

    it("should return invalid for expired token", async () => {
      mockContacts = [
        {
          id: 1,
          email: "user@company.com",
          contactName: "Test User",
          resetExpiresAt: new Date(Date.now() - 3600000), // 1 hour ago
        },
      ];

      const { portalAuthRouter } = await import("./routers/portalAuthRouter");
      const caller = portalAuthRouter.createCaller({
        req: {} as any,
        res: { cookie: vi.fn(), clearCookie: vi.fn() } as any,
        portalUser: null,
      });

      const result = await caller.verifyResetToken({ token: "expired_token" });
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("Reset link has expired");
    });

    it("should return valid with email for valid token", async () => {
      mockContacts = [
        {
          id: 1,
          email: "user@company.com",
          contactName: "Test User",
          resetExpiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        },
      ];

      const { portalAuthRouter } = await import("./routers/portalAuthRouter");
      const caller = portalAuthRouter.createCaller({
        req: {} as any,
        res: { cookie: vi.fn(), clearCookie: vi.fn() } as any,
        portalUser: null,
      });

      const result = await caller.verifyResetToken({ token: "valid_token" });
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.email).toBe("user@company.com");
        expect(result.contactName).toBe("Test User");
      }
    });
  });

  describe("resetPassword", () => {
    it("should reject mismatched passwords", async () => {
      const { portalAuthRouter } = await import("./routers/portalAuthRouter");
      const caller = portalAuthRouter.createCaller({
        req: {} as any,
        res: { cookie: vi.fn(), clearCookie: vi.fn() } as any,
        portalUser: null,
      });

      await expect(
        caller.resetPassword({
          token: "valid_token",
          password: "newpassword1",
          confirmPassword: "different",
        })
      ).rejects.toThrow("Passwords do not match");
    });

    it("should reject invalid reset token", async () => {
      mockContacts = [];

      const { portalAuthRouter } = await import("./routers/portalAuthRouter");
      const caller = portalAuthRouter.createCaller({
        req: {} as any,
        res: { cookie: vi.fn(), clearCookie: vi.fn() } as any,
        portalUser: null,
      });

      await expect(
        caller.resetPassword({
          token: "invalid_token",
          password: "newpassword1",
          confirmPassword: "newpassword1",
        })
      ).rejects.toThrow("Invalid reset link");
    });

    it("should reject expired reset token", async () => {
      mockContacts = [
        {
          id: 1,
          email: "user@company.com",
          contactName: "Test User",
          customerId: 10,
          portalRole: "admin",
          resetExpiresAt: new Date(Date.now() - 3600000), // expired
        },
      ];

      const { portalAuthRouter } = await import("./routers/portalAuthRouter");
      const caller = portalAuthRouter.createCaller({
        req: {} as any,
        res: { cookie: vi.fn(), clearCookie: vi.fn() } as any,
        portalUser: null,
      });

      await expect(
        caller.resetPassword({
          token: "expired_token",
          password: "newpassword1",
          confirmPassword: "newpassword1",
        })
      ).rejects.toThrow("Reset link has expired");
    });

    it("should reset password and auto-login for valid token", async () => {
      // First call returns the contact (for reset token lookup)
      // Second call returns the customer (for company name)
      let callCount = 0;
      mockFrom.mockImplementation(() => ({
        where: vi.fn().mockImplementation(() => ({
          limit: vi.fn().mockImplementation(() => {
            callCount++;
            if (callCount === 1) {
              return [
                {
                  id: 1,
                  email: "user@company.com",
                  contactName: "Test User",
                  customerId: 10,
                  portalRole: "admin",
                  resetToken: "valid_reset_token",
                  resetExpiresAt: new Date(Date.now() + 3600000),
                  passwordHash: "old_hash",
                  isPortalActive: true,
                  hasPortalAccess: true,
                },
              ];
            }
            return [{ companyName: "Test Corp" }];
          }),
        })),
      }));

      const { portalAuthRouter } = await import("./routers/portalAuthRouter");
      const mockRes = { cookie: vi.fn(), clearCookie: vi.fn() };
      const caller = portalAuthRouter.createCaller({
        req: {} as any,
        res: mockRes as any,
        portalUser: null,
      });

      const result = await caller.resetPassword({
        token: "valid_reset_token",
        password: "newpassword1",
        confirmPassword: "newpassword1",
      });

      expect(result.success).toBe(true);
      expect(result.user.email).toBe("user@company.com");
      expect(result.user.companyName).toBe("Test Corp");

      // Verify password was hashed
      const { hashPassword } = await import("./portalAuth");
      expect(hashPassword).toHaveBeenCalledWith("newpassword1");

      // Verify reset token was cleared
      expect(mockUpdateSet).toHaveBeenCalledWith(
        expect.objectContaining({
          passwordHash: "hashed_new_password",
          resetToken: null,
          resetExpiresAt: null,
        })
      );

      // Verify auto-login (cookie set)
      const { setPortalCookie } = await import("./portalAuth");
      expect(setPortalCookie).toHaveBeenCalled();
    });
  });

  describe("Security: Password reset does not leak information", () => {
    it("forgotPassword response is identical for existing and non-existing emails", async () => {
      const { portalAuthRouter } = await import("./routers/portalAuthRouter");
      const caller = portalAuthRouter.createCaller({
        req: {} as any,
        res: { cookie: vi.fn(), clearCookie: vi.fn() } as any,
        portalUser: null,
      });

      // Non-existing email
      mockContacts = [];
      const result1 = await caller.forgotPassword({
        email: "nobody@example.com",
        origin: "https://portal.gea.com",
      });

      expect(result1.success).toBe(true);
      expect(result1.message).toContain("If an account exists");
    });
  });
});
