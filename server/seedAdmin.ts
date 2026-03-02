/**
 * Seed Default Admin
 *
 * Creates the default admin user on first startup if it doesn't exist.
 *
 * SECURITY POLICY:
 * - Production: requires ADMIN_BOOTSTRAP_PASSWORD env var (no hardcoded default).
 * - Non-production: allows fallback default for developer convenience.
 */

import { hashPassword } from "./_core/adminAuth";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { ENV } from "./_core/env";

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_BOOTSTRAP_EMAIL || "simon.ding@geahr.com";
const DEFAULT_ADMIN_NAME = process.env.ADMIN_BOOTSTRAP_NAME || "Simon Ding";
const DEV_FALLBACK_PASSWORD = "BestGEA2026~~";

function resolveBootstrapPassword(): string {
  const fromEnv = process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim();
  if (fromEnv) return fromEnv;

  // Keep local onboarding convenient while preventing hardcoded production credential.
  if (!ENV.isProduction) return DEV_FALLBACK_PASSWORD;

  throw new Error("ADMIN_BOOTSTRAP_PASSWORD is required in production for initial admin seeding");
}

export async function seedDefaultAdmin(): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Seed] Database not available, skipping admin seed");
      return;
    }

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, DEFAULT_ADMIN_EMAIL))
      .limit(1);

    if (existing.length > 0) {
      console.log("[Seed] Default admin already exists, skipping");
      return;
    }

    const bootstrapPassword = resolveBootstrapPassword();
    const passwordHash = await hashPassword(bootstrapPassword);
    const openId = `admin_${crypto.randomBytes(16).toString("hex")}`;

    await db.insert(users).values({
      openId,
      name: DEFAULT_ADMIN_NAME,
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash,
      loginMethod: "password",
      role: "admin",
      isActive: true,
      language: "en",
      lastSignedIn: new Date(),
    });

    if (ENV.isProduction) {
      console.warn(`[Seed] Bootstrap admin created: ${DEFAULT_ADMIN_EMAIL}. Please rotate ADMIN_BOOTSTRAP_PASSWORD immediately.`);
    } else {
      console.log(`[Seed] Default admin created: ${DEFAULT_ADMIN_EMAIL}`);
    }
  } catch (error) {
    console.error("[Seed] Failed to seed default admin:", error);
  }
}
