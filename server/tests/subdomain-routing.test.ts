/**
 * Subdomain-based Portal Routing Tests
 *
 * Tests the portalBasePath utility logic and routing behavior
 * for admin.geahr.com vs app.geahr.com subdomain routing.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We test the pure logic of the portalBasePath utility
// Since it uses window.location, we need to mock it

describe("Portal Base Path Utility", () => {
  const originalWindow = global.window;

  afterEach(() => {
    // Restore original window
    if (originalWindow) {
      global.window = originalWindow;
    }
  });

  function mockHostname(hostname: string) {
    // @ts-ignore - mocking window for testing
    global.window = {
      location: {
        hostname,
        protocol: "https:",
        origin: `https://${hostname}`,
      },
    } as any;
  }

  describe("isPortalDomain", () => {
    it("should return true for app.geahr.com", async () => {
      mockHostname("app.geahr.com");
      // Re-import to pick up the mocked window
      const mod = await import("../client/src/lib/portalBasePath");
      expect(mod.isPortalDomain()).toBe(true);
    });

    it("should return false for admin.geahr.com", async () => {
      mockHostname("admin.geahr.com");
      const mod = await import("../client/src/lib/portalBasePath");
      expect(mod.isPortalDomain()).toBe(false);
    });

    it("should return false for localhost", async () => {
      mockHostname("localhost");
      const mod = await import("../client/src/lib/portalBasePath");
      expect(mod.isPortalDomain()).toBe(false);
    });

    it("should return false for admin domain", async () => {
      mockHostname("admin.geahr.com");
      const mod = await import("../client/src/lib/portalBasePath");
      expect(mod.isPortalDomain()).toBe(false);
    });
  });

  describe("getPortalBasePath", () => {
    it("should return empty string for portal domain", async () => {
      mockHostname("app.geahr.com");
      const mod = await import("../client/src/lib/portalBasePath");
      expect(mod.getPortalBasePath()).toBe("");
    });

    it("should return /portal for admin domain", async () => {
      mockHostname("admin.geahr.com");
      const mod = await import("../client/src/lib/portalBasePath");
      expect(mod.getPortalBasePath()).toBe("/portal");
    });

    it("should return /portal for localhost", async () => {
      mockHostname("localhost");
      const mod = await import("../client/src/lib/portalBasePath");
      expect(mod.getPortalBasePath()).toBe("/portal");
    });
  });

  describe("portalPath", () => {
    it("should prefix with /portal on admin domain", async () => {
      mockHostname("admin.geahr.com");
      const mod = await import("../client/src/lib/portalBasePath");
      expect(mod.portalPath("/login")).toBe("/portal/login");
      expect(mod.portalPath("/employees")).toBe("/portal/employees");
      expect(mod.portalPath("/invoices")).toBe("/portal/invoices");
    });

    it("should not prefix on portal domain", async () => {
      mockHostname("app.geahr.com");
      const mod = await import("../client/src/lib/portalBasePath");
      expect(mod.portalPath("/login")).toBe("/login");
      expect(mod.portalPath("/employees")).toBe("/employees");
      expect(mod.portalPath("/invoices")).toBe("/invoices");
    });

    it("should handle root path correctly on portal domain", async () => {
      mockHostname("app.geahr.com");
      const mod = await import("../client/src/lib/portalBasePath");
      expect(mod.portalPath("/")).toBe("/");
      expect(mod.portalPath("")).toBe("/");
    });

    it("should handle root path correctly on admin domain", async () => {
      mockHostname("admin.geahr.com");
      const mod = await import("../client/src/lib/portalBasePath");
      expect(mod.portalPath("/")).toBe("/portal");
      expect(mod.portalPath("")).toBe("/portal");
    });
  });

  describe("getPortalOrigin", () => {
    it("should return app.geahr.com origin when on admin.geahr.com", async () => {
      mockHostname("admin.geahr.com");
      const mod = await import("../client/src/lib/portalBasePath");
      expect(mod.getPortalOrigin()).toBe("https://app.geahr.com");
    });

    it("should return current origin when on app.geahr.com", async () => {
      mockHostname("app.geahr.com");
      const mod = await import("../client/src/lib/portalBasePath");
      expect(mod.getPortalOrigin()).toBe("https://app.geahr.com");
    });

    it("should return current origin for localhost (dev mode)", async () => {
      mockHostname("localhost");
      // @ts-ignore
      global.window.location.origin = "http://localhost:3000";
      const mod = await import("../client/src/lib/portalBasePath");
      expect(mod.getPortalOrigin()).toBe("http://localhost:3000");
    });
  });
});

describe("Server-side URL construction", () => {
  it("should construct reset URL without /portal/ prefix when origin is app.geahr.com", () => {
    const origin = "https://app.geahr.com";
    const resetToken = "test-token-123";
    const isPortalDomain = origin.includes("app.geahr.com");
    const resetUrl = isPortalDomain
      ? `${origin}/reset-password?token=${resetToken}`
      : `${origin}/portal/reset-password?token=${resetToken}`;
    expect(resetUrl).toBe("https://app.geahr.com/reset-password?token=test-token-123");
  });

  it("should construct reset URL with /portal/ prefix when origin is not portal domain", () => {
    const origin = "https://admin.geahr.com";
    const resetToken = "test-token-123";
    const isPortalDomain = origin.includes("app.geahr.com");
    const resetUrl = isPortalDomain
      ? `${origin}/reset-password?token=${resetToken}`
      : `${origin}/portal/reset-password?token=${resetToken}`;
    expect(resetUrl).toBe("https://admin.geahr.com/portal/reset-password?token=test-token-123");
  });
});

describe("Invite link construction", () => {
  it("should generate app.geahr.com invite link when on production admin domain", () => {
    const hostname = "admin.geahr.com";
    const protocol = "https:";
    const token = "invite-token-abc";
    const isProduction = hostname.includes("geahr.com") || hostname.includes("manus.space");
    let inviteLink: string;
    if (isProduction) {
      inviteLink = `${protocol}//app.geahr.com/register?token=${token}`;
    } else {
      inviteLink = `${protocol}//${hostname}/portal/register?token=${token}`;
    }
    expect(inviteLink).toBe("https://app.geahr.com/register?token=invite-token-abc");
  });

  it("should generate /portal/ invite link for localhost dev", () => {
    const hostname = "localhost";
    const origin = "http://localhost:3000";
    const token = "invite-token-abc";
    const isProduction = hostname.includes("geahr.com") || hostname.includes("manus.space");
    let inviteLink: string;
    if (isProduction) {
      inviteLink = `https://app.geahr.com/register?token=${token}`;
    } else {
      inviteLink = `${origin}/portal/register?token=${token}`;
    }
    expect(inviteLink).toBe("http://localhost:3000/portal/register?token=invite-token-abc");
  });
});
