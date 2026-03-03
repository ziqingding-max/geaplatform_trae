/**
 * Worker Portal Authentication Service
 *
 * COMPLETELY INDEPENDENT from Admin and Customer Portal.
 * Uses email/password + JWT stored in a separate cookie (WORKER_COOKIE_NAME).
 *
 * Security guarantees:
 * 1. Worker JWT tokens are signed with a different prefix
 * 2. Worker cookie name is different
 * 3. Worker context injects workerId/contractorId
 */

import bcrypt from "bcryptjs";
import * as jose from "jose";
import type { Request, Response } from "express";
import { ENV } from "../_core/env";
import { getDb } from "../services/db/connection";
import { workerUsers, contractors } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

// ============================================================================
// Constants
// ============================================================================

export const WORKER_COOKIE_NAME = "gea_worker_auth";
export const WORKER_JWT_EXPIRY = "7d";
export const WORKER_INVITE_EXPIRY_HOURS = 72;

// ============================================================================
// Types
// ============================================================================

export interface WorkerUserContext {
  id: number;
  email: string;
  contractorId: number | null;
  // TODO: Add employeeId support if needed
}

export interface WorkerJwtPayload {
  sub: string; // worker_users.id as string
  email: string;
  contractorId: number | null;
  iss: string; // "gea-worker"
}

// ============================================================================
// JWT Helpers
// ============================================================================

const JWT_ISSUER = "gea-worker";
const JWT_AUDIENCE = "gea-worker-client";

function getJwtSecret(): Uint8Array {
  const workerKey = `worker:${ENV.cookieSecret}`;
  return new TextEncoder().encode(workerKey);
}

export async function signWorkerToken(payload: WorkerJwtPayload): Promise<string> {
  const secret = getJwtSecret();
  return new jose.SignJWT(payload as unknown as jose.JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(WORKER_JWT_EXPIRY)
    .sign(secret);
}

export async function verifyWorkerToken(token: string): Promise<WorkerJwtPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jose.jwtVerify(token, secret, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    
    if (!payload.sub || !payload.email) {
      return null;
    }
    return payload as unknown as WorkerJwtPayload;
  } catch {
    return null;
  }
}

// ============================================================================
// Password Helpers
// ============================================================================

const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================================================
// Invite Token Helpers
// ============================================================================

export function generateInviteToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function getInviteExpiryDate(): Date {
  return new Date(Date.now() + WORKER_INVITE_EXPIRY_HOURS * 60 * 60 * 1000);
}

// ============================================================================
// Cookie Helpers
// ============================================================================

export function setWorkerCookie(res: Response, token: string): void {
  res.cookie(WORKER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true, // Should be true in production, maybe false for local dev if needed
    sameSite: "lax", // Lax is usually better for top-level navigation, 'none' for cross-site
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export function clearWorkerCookie(res: Response): void {
  res.clearCookie(WORKER_COOKIE_NAME, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
}

export function getWorkerTokenFromRequest(req: Request): string | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  // Manual parsing or use cookie-parser if available on req
  const cookies = cookieHeader.split(";").reduce(
    (acc, cookie) => {
      const [key, ...vals] = cookie.trim().split("=");
      acc[key] = vals.join("=");
      return acc;
    },
    {} as Record<string, string>
  );

  return cookies[WORKER_COOKIE_NAME] || null;
}

// ============================================================================
// Authentication: Resolve worker user from request
// ============================================================================

export async function authenticateWorkerRequest(req: Request): Promise<WorkerUserContext | null> {
  const token = getWorkerTokenFromRequest(req);
  if (!token) return null;

  const payload = await verifyWorkerToken(token);
  if (!payload) return null;

  const db = await getDb();
  if (!db) return null;

  // Verify worker user exists and is active
  const [user] = await db
    .select({
      id: workerUsers.id,
      email: workerUsers.email,
      contractorId: workerUsers.contractorId,
      isActive: workerUsers.isActive,
    })
    .from(workerUsers)
    .where(and(eq(workerUsers.id, parseInt(payload.sub)), eq(workerUsers.isActive, true)));

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    contractorId: user.contractorId,
  };
}
