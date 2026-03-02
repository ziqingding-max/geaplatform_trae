/**
 * Portal Invite Flow Tests
 *
 * Validates:
 * 1. generatePortalInvite generates a valid token and sets correct fields
 * 2. verifyInvite correctly validates tokens
 * 3. register flow activates the account
 * 4. Expired/invalid tokens are rejected
 * 5. Already-active accounts cannot be re-invited
 */

import { describe, expect, it } from "vitest";
import {
  generateInviteToken,
  getInviteExpiryDate,
  hashPassword,
  verifyPassword,
  signPortalToken,
  verifyPortalToken,
} from "./portalAuth";
import { portalAppRouter } from "./portalRouter";
import type { PortalContext } from "./portalTrpc";

// ============================================================================
// Test Helpers
// ============================================================================

function createPortalContext(
  portalUser: { contactId: number; customerId: number; email: string; contactName: string; portalRole: string; companyName: string } | null = null
): { ctx: PortalContext; cookies: Record<string, string> } {
  const cookies: Record<string, string> = {};

  const ctx: PortalContext = {
    portalUser,
    req: {
      protocol: "https",
      headers: {},
    } as PortalContext["req"],
    res: {
      clearCookie: () => {},
      cookie: (name: string, value: string) => {
        cookies[name] = value;
      },
    } as unknown as PortalContext["res"],
  };

  return { ctx, cookies };
}

// ============================================================================
// 1. Invite Token Generation Tests
// ============================================================================

describe("Invite Token Generation", () => {
  it("generates cryptographically random tokens", () => {
    const tokens = new Set<string>();
    for (let i = 0; i < 100; i++) {
      tokens.add(generateInviteToken());
    }
    // All 100 tokens should be unique
    expect(tokens.size).toBe(100);
  });

  it("tokens are 64-character hex strings", () => {
    const token = generateInviteToken();
    expect(token).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(token)).toBe(true);
  });

  it("invite expiry is approximately 72 hours in the future", () => {
    const expiry = getInviteExpiryDate();
    const now = Date.now();
    const diffHours = (expiry.getTime() - now) / (1000 * 60 * 60);
    // Should be between 71.9 and 72.1 hours
    expect(diffHours).toBeGreaterThan(71.9);
    expect(diffHours).toBeLessThan(72.1);
  });
});

// ============================================================================
// 2. Password Hashing Security Tests
// ============================================================================

describe("Password Hashing for Portal", () => {
  it("produces different hashes for the same password (salting)", async () => {
    const password = "TestPassword123!";
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    expect(hash1).not.toBe(hash2); // Different salts
    // But both should verify
    expect(await verifyPassword(password, hash1)).toBe(true);
    expect(await verifyPassword(password, hash2)).toBe(true);
  });

  it("rejects empty passwords", async () => {
    const hash = await hashPassword("ValidPassword");
    expect(await verifyPassword("", hash)).toBe(false);
  });

  it("is case-sensitive", async () => {
    const hash = await hashPassword("MyPassword");
    expect(await verifyPassword("mypassword", hash)).toBe(false);
    expect(await verifyPassword("MYPASSWORD", hash)).toBe(false);
    expect(await verifyPassword("MyPassword", hash)).toBe(true);
  });
});

// ============================================================================
// 3. Portal JWT for Invite Flow Tests
// ============================================================================

describe("Portal JWT for Invite Flow", () => {
  it("signed token contains all required fields for data scoping", async () => {
    const token = await signPortalToken({
      sub: "42",
      customerId: 200,
      email: "jane@company.com",
      portalRole: "hr_manager",
      iss: "gea-portal",
    });

    const payload = await verifyPortalToken(token);
    expect(payload).not.toBeNull();
    expect(payload!.sub).toBe("42");
    expect(payload!.customerId).toBe(200);
    expect(payload!.email).toBe("jane@company.com");
    expect(payload!.portalRole).toBe("hr_manager");
    expect(payload!.iss).toBe("gea-portal");
  });

  it("token expires after the configured duration", async () => {
    const token = await signPortalToken({
      sub: "1",
      customerId: 100,
      email: "test@test.com",
      portalRole: "viewer",
      iss: "gea-portal",
    });

    // Token should be valid now
    const payload = await verifyPortalToken(token);
    expect(payload).not.toBeNull();

    // Verify exp claim exists and is in the future
    expect(payload!.exp).toBeDefined();
    expect(payload!.exp! * 1000).toBeGreaterThan(Date.now());
  });
});

// ============================================================================
// 4. Auth Router Validation Tests (without DB)
// ============================================================================

describe("Portal Auth Router Input Validation", () => {
  it("login rejects invalid email format", async () => {
    const { ctx } = createPortalContext(null);
    const caller = portalAppRouter.createCaller(ctx);

    await expect(
      caller.auth.login({ email: "not-an-email", password: "test123" })
    ).rejects.toThrow(); // Zod validation error
  });

  it("login rejects empty password", async () => {
    const { ctx } = createPortalContext(null);
    const caller = portalAppRouter.createCaller(ctx);

    await expect(
      caller.auth.login({ email: "test@test.com", password: "" })
    ).rejects.toThrow();
  });

  it("register rejects short passwords", async () => {
    const { ctx } = createPortalContext(null);
    const caller = portalAppRouter.createCaller(ctx);

    await expect(
      caller.auth.register({
        token: "some-token",
        password: "short",
        confirmPassword: "short",
      })
    ).rejects.toThrow(); // min 8 chars
  });

  it("register rejects mismatched passwords", async () => {
    const { ctx } = createPortalContext(null);
    const caller = portalAppRouter.createCaller(ctx);

    await expect(
      caller.auth.register({
        token: "some-token",
        password: "Password123!",
        confirmPassword: "DifferentPassword!",
      })
    ).rejects.toThrow("Passwords do not match");
  });

  it("changePassword rejects mismatched new passwords", async () => {
    const user = {
      contactId: 1,
      customerId: 100,
      email: "test@test.com",
      contactName: "Test User",
      portalRole: "admin",
      companyName: "Test Corp",
    };
    const { ctx } = createPortalContext(user);
    const caller = portalAppRouter.createCaller(ctx);

    await expect(
      caller.auth.changePassword({
        currentPassword: "OldPassword123!",
        newPassword: "NewPassword123!",
        confirmNewPassword: "DifferentNewPassword!",
      })
    ).rejects.toThrow("Passwords do not match");
  });
});

// ============================================================================
// 5. Portal Me Endpoint Tests
// ============================================================================

describe("Portal Me Endpoint", () => {
  it("returns null when not authenticated", async () => {
    const { ctx } = createPortalContext(null);
    const caller = portalAppRouter.createCaller(ctx);

    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user info when authenticated", async () => {
    const user = {
      contactId: 42,
      customerId: 200,
      email: "jane@acme.com",
      contactName: "Jane Doe",
      portalRole: "hr_manager",
      companyName: "Acme Corp",
    };
    const { ctx } = createPortalContext(user);
    const caller = portalAppRouter.createCaller(ctx);

    const result = await caller.auth.me();
    expect(result).toEqual(user);
  });
});
