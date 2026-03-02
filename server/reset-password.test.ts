/**
 * Tests for Admin Reset Password functionality.
 * Following test-data-cleanup skill: all created entities are tracked and cleaned up.
 */
import { describe, it, expect, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { TestCleanup } from "./test-cleanup";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "./_core/adminAuth";

const cleanup = new TestCleanup();

afterAll(async () => {
  await cleanup.run();
});

// Helper to create an admin caller
function createAdminCaller(userId = 999999) {
  const ctx: TrpcContext = {
    user: { id: userId, openId: "__TEST__admin", name: "__TEST__Admin", role: "admin" },
    req: { protocol: "https", get: () => "test.example.com" } as any,
    res: { cookie: () => {} } as any,
  };
  return appRouter.createCaller(ctx);
}

// Helper to create a non-admin caller
function createUserCaller(userId = 999998) {
  const ctx: TrpcContext = {
    user: { id: userId, openId: "__TEST__user", name: "__TEST__User", role: "user" },
    req: { protocol: "https", get: () => "test.example.com" } as any,
    res: { cookie: () => {} } as any,
  };
  return appRouter.createCaller(ctx);
}

// Helper to create a test user in the DB
async function createTestUser(email: string, name: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");

  const passwordHash = await hashPassword("OldPassword123!");
  const openId = `__TEST__reset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const result = await db.insert(users).values({
    openId,
    name,
    email: email.toLowerCase().trim(),
    passwordHash,
    loginMethod: "password",
    role: "user",
    isActive: true,
    language: "en",
    lastSignedIn: new Date(),
  });

  const insertId = Number((result as any)[0]?.insertId);
  if (insertId) cleanup.trackUser(insertId);
  return insertId;
}

describe("Admin Reset Password", () => {
  it("should reset a user's password and return a temporary password", async () => {
    const caller = createAdminCaller();
    const testUserId = await createTestUser(
      `__TEST__reset-${Date.now()}@example.com`,
      "__TEST__ResetUser"
    );

    const result = await caller.userManagement.resetPassword({ id: testUserId });

    expect(result.success).toBe(true);
    expect(result.temporaryPassword).toBeDefined();
    expect(typeof result.temporaryPassword).toBe("string");
    expect(result.temporaryPassword.length).toBeGreaterThanOrEqual(8);
    expect(result.userName).toBe("__TEST__ResetUser");
    expect(result.userEmail).toContain("__test__reset-");
  });

  it("should set mustChangePassword flag after reset", async () => {
    const caller = createAdminCaller();
    const testUserId = await createTestUser(
      `__TEST__flag-${Date.now()}@example.com`,
      "__TEST__FlagUser"
    );

    await caller.userManagement.resetPassword({ id: testUserId });

    // Verify the flag is set in DB
    const db = await getDb();
    if (!db) throw new Error("DB not available");
    const [user] = await db.select().from(users).where(eq(users.id, testUserId)).limit(1);
    expect(user.mustChangePassword).toBe(true);
  });

  it("should not allow resetting own password", async () => {
    const adminId = await createTestUser(
      `__TEST__self-${Date.now()}@example.com`,
      "__TEST__SelfAdmin"
    );

    // Create caller with the same user ID
    const caller = createAdminCaller(adminId);

    await expect(
      caller.userManagement.resetPassword({ id: adminId })
    ).rejects.toThrow(/Cannot reset your own password/);
  });

  it("should throw NOT_FOUND for non-existent user", async () => {
    const caller = createAdminCaller();

    await expect(
      caller.userManagement.resetPassword({ id: 999999999 })
    ).rejects.toThrow(/not found/i);
  });

  it("should generate different passwords each time", async () => {
    const caller = createAdminCaller();
    const testUserId = await createTestUser(
      `__TEST__multi-${Date.now()}@example.com`,
      "__TEST__MultiReset"
    );

    const result1 = await caller.userManagement.resetPassword({ id: testUserId });
    const result2 = await caller.userManagement.resetPassword({ id: testUserId });

    expect(result1.temporaryPassword).not.toBe(result2.temporaryPassword);
  });
});
