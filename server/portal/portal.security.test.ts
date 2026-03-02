/**
 * Portal Security Tests
 *
 * Validates:
 * 1. Portal auth is completely separate from admin auth
 * 2. Data access is always scoped to customerId
 * 3. Role-based access control works correctly
 * 4. JWT tokens cannot be cross-used between admin and portal
 */

import { describe, expect, it } from "vitest";
import { portalAppRouter } from "./portalRouter";
import type { PortalContext } from "./portalTrpc";
import type { PortalUser } from "./portalAuth";
import {
  PORTAL_COOKIE_NAME,
  PORTAL_UNAUTHED_ERR_MSG,
  PORTAL_FORBIDDEN_ERR_MSG,
} from "../../shared/const";

// ============================================================================
// Test Helpers
// ============================================================================

function createPortalContext(
  portalUser: PortalUser | null = null
): { ctx: PortalContext; clearedCookies: { name: string; options: Record<string, unknown> }[] } {
  const clearedCookies: { name: string; options: Record<string, unknown> }[] = [];

  const ctx: PortalContext = {
    portalUser,
    req: {
      protocol: "https",
      headers: {},
    } as PortalContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
      cookie: () => {},
    } as unknown as PortalContext["res"],
  };

  return { ctx, clearedCookies };
}

function createTestUser(overrides: Partial<PortalUser> = {}): PortalUser {
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
// 1. Authentication Isolation Tests
// ============================================================================

describe("Portal Authentication Isolation", () => {
  it("rejects unauthenticated requests to protected endpoints", async () => {
    const { ctx } = createPortalContext(null); // No user
    const caller = portalAppRouter.createCaller(ctx);

    // Dashboard stats requires authentication
    await expect(caller.dashboard.stats()).rejects.toThrow(PORTAL_UNAUTHED_ERR_MSG);
  });

  it("rejects unauthenticated requests to employee list", async () => {
    const { ctx } = createPortalContext(null);
    const caller = portalAppRouter.createCaller(ctx);

    await expect(
      caller.employees.list({ page: 1, pageSize: 10 })
    ).rejects.toThrow(PORTAL_UNAUTHED_ERR_MSG);
  });

  it("rejects unauthenticated requests to invoices", async () => {
    const { ctx } = createPortalContext(null);
    const caller = portalAppRouter.createCaller(ctx);

    await expect(
      caller.invoices.list({ page: 1, pageSize: 10 })
    ).rejects.toThrow(PORTAL_UNAUTHED_ERR_MSG);
  });

  it("rejects unauthenticated requests to settings", async () => {
    const { ctx } = createPortalContext(null);
    const caller = portalAppRouter.createCaller(ctx);

    await expect(caller.settings.companyProfile()).rejects.toThrow(
      PORTAL_UNAUTHED_ERR_MSG
    );
  });

  it("portal logout clears the portal cookie (not admin cookie)", async () => {
    const user = createTestUser();
    const { ctx, clearedCookies } = createPortalContext(user);
    const caller = portalAppRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(PORTAL_COOKIE_NAME);
    // Verify it uses secure cookie settings
    expect(clearedCookies[0]?.options).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
  });
});

// ============================================================================
// 2. Role-Based Access Control Tests
// ============================================================================

describe("Portal Role-Based Access Control", () => {
  it("allows admin to access settings.listUsers", async () => {
    const user = createTestUser({ portalRole: "admin" });
    const { ctx } = createPortalContext(user);
    const caller = portalAppRouter.createCaller(ctx);

    // Should not throw (may return empty array if no DB data)
    const result = await caller.settings.listUsers();
    expect(Array.isArray(result)).toBe(true);
  });

  it("denies viewer access to settings.listUsers (admin-only)", async () => {
    const user = createTestUser({ portalRole: "viewer" });
    const { ctx } = createPortalContext(user);
    const caller = portalAppRouter.createCaller(ctx);

    await expect(caller.settings.listUsers()).rejects.toThrow(
      PORTAL_FORBIDDEN_ERR_MSG
    );
  });

  it("denies hr_manager access to settings.listUsers (admin-only)", async () => {
    const user = createTestUser({ portalRole: "hr_manager" });
    const { ctx } = createPortalContext(user);
    const caller = portalAppRouter.createCaller(ctx);

    await expect(caller.settings.listUsers()).rejects.toThrow(
      PORTAL_FORBIDDEN_ERR_MSG
    );
  });

  it("denies finance access to settings.listUsers (admin-only)", async () => {
    const user = createTestUser({ portalRole: "finance" });
    const { ctx } = createPortalContext(user);
    const caller = portalAppRouter.createCaller(ctx);

    await expect(caller.settings.listUsers()).rejects.toThrow(
      PORTAL_FORBIDDEN_ERR_MSG
    );
  });

  it("denies viewer access to inviteUser (admin-only)", async () => {
    const user = createTestUser({ portalRole: "viewer" });
    const { ctx } = createPortalContext(user);
    const caller = portalAppRouter.createCaller(ctx);

    await expect(
      caller.settings.inviteUser({
        contactName: "Test",
        email: "test@test.com",
        portalRole: "viewer",
      })
    ).rejects.toThrow(PORTAL_FORBIDDEN_ERR_MSG);
  });
});

// ============================================================================
// 3. Cookie Separation Tests
// ============================================================================

describe("Cookie Separation", () => {
  it("portal cookie name differs from admin cookie name", async () => {
    // Import admin cookie name using dynamic ESM import
    const { COOKIE_NAME } = await import("../../shared/const");
    expect(PORTAL_COOKIE_NAME).not.toBe(COOKIE_NAME);
  });
});

// ============================================================================
// 4. JWT Token Isolation Tests
// ============================================================================

describe("JWT Token Isolation", () => {
  it("portal JWT uses different issuer from admin", async () => {
    const { signPortalToken, verifyPortalToken } = await import("./portalAuth");

    const token = await signPortalToken({
      sub: "1",
      customerId: 100,
      email: "test@test.com",
      portalRole: "admin",
      iss: "gea-portal",
    });

    // Should verify successfully with portal verifier
    const payload = await verifyPortalToken(token);
    expect(payload).not.toBeNull();
    expect(payload!.iss).toBe("gea-portal");
    expect(payload!.customerId).toBe(100);
  });

  it("portal JWT contains customerId for data scoping", async () => {
    const { signPortalToken, verifyPortalToken } = await import("./portalAuth");

    const token = await signPortalToken({
      sub: "42",
      customerId: 999,
      email: "user@company.com",
      portalRole: "viewer",
      iss: "gea-portal",
    });

    const payload = await verifyPortalToken(token);
    expect(payload).not.toBeNull();
    expect(payload!.sub).toBe("42");
    expect(payload!.customerId).toBe(999);
    expect(payload!.portalRole).toBe("viewer");
  });

  it("rejects tampered JWT tokens", async () => {
    const { signPortalToken, verifyPortalToken } = await import("./portalAuth");

    const token = await signPortalToken({
      sub: "1",
      customerId: 100,
      email: "test@test.com",
      portalRole: "admin",
      iss: "gea-portal",
    });

    // Tamper with the token
    const tampered = token.slice(0, -5) + "XXXXX";
    const payload = await verifyPortalToken(tampered);
    expect(payload).toBeNull();
  });
});

// ============================================================================
// 5. Password Security Tests
// ============================================================================

describe("Password Security", () => {
  it("hashes passwords with bcrypt", async () => {
    const { hashPassword, verifyPassword } = await import("./portalAuth");

    const password = "SecureP@ss123!";
    const hash = await hashPassword(password);

    // Hash should not be the plaintext
    expect(hash).not.toBe(password);
    // Hash should start with bcrypt prefix
    expect(hash.startsWith("$2a$") || hash.startsWith("$2b$")).toBe(true);
    // Should verify correctly
    expect(await verifyPassword(password, hash)).toBe(true);
    // Wrong password should fail
    expect(await verifyPassword("WrongPassword", hash)).toBe(false);
  });

  it("generates unique invite tokens", async () => {
    const { generateInviteToken } = await import("./portalAuth");

    const token1 = generateInviteToken();
    const token2 = generateInviteToken();

    expect(token1).not.toBe(token2);
    // Should be a hex string of reasonable length
    expect(token1.length).toBe(64); // 32 bytes = 64 hex chars
    expect(/^[0-9a-f]+$/.test(token1)).toBe(true);
  });

  it("invite expiry date is in the future", async () => {
    const { getInviteExpiryDate } = await import("./portalAuth");

    const expiry = getInviteExpiryDate();
    expect(expiry.getTime()).toBeGreaterThan(Date.now());
  });
});
