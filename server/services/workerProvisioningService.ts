/**
 * Worker Provisioning Service
 *
 * Handles the creation of Worker Portal accounts (worker_users) for both
 * employees and contractors. This is a standalone service that can be called
 * from Admin, Client Portal, or automated workflows.
 *
 * Business Rules:
 * - Each employee/contractor can have at most one worker_users record.
 * - The invite flow: create worker_users record (inactive) -> send invite email -> worker sets password -> account activated.
 * - This service does NOT modify Admin or Client Portal pages; it only provides backend APIs.
 *
 * TODO (Phase 2 - Admin/Client Portal UI):
 * - Add "Invite to Worker Portal" button on Admin contractor/employee detail pages.
 * - Add "Invite to Worker Portal" button on Client Portal people detail pages.
 */

import { getDb } from "./db/connection";
import { workerUsers, contractors, employees, customers } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { sendWorkerPortalInviteEmail } from "./authEmailService";

interface ProvisionWorkerInput {
  /** Exactly one of these must be provided */
  contractorId?: number;
  employeeId?: number;
  /** If not provided, will be looked up from the contractor/employee record */
  email?: string;
  /** Base URL for the invite link (e.g., "https://worker.geahr.com" or "http://localhost:5000/worker") */
  baseUrl?: string;
  /** Whether to send the invite email. Defaults to true. */
  sendEmail?: boolean;
}

interface ProvisionResult {
  workerUserId: number;
  email: string;
  inviteToken: string;
  alreadyExists: boolean;
}

/**
 * Create a Worker Portal account for an employee or contractor.
 * If the account already exists, returns the existing record info.
 */
export async function provisionWorkerUser(input: ProvisionWorkerInput): Promise<ProvisionResult> {
  const db = getDb();
  if (!db) throw new Error("Database unavailable");

  const { contractorId, employeeId, sendEmail: shouldSendEmail = true } = input;

  if (!contractorId && !employeeId) {
    throw new Error("Either contractorId or employeeId must be provided");
  }
  if (contractorId && employeeId) {
    throw new Error("Cannot provide both contractorId and employeeId");
  }

  // Check if worker_users record already exists
  const existingConditions = contractorId
    ? eq(workerUsers.contractorId, contractorId)
    : eq(workerUsers.employeeId, employeeId!);

  const [existing] = await db.select().from(workerUsers).where(existingConditions).limit(1);

  if (existing) {
    return {
      workerUserId: existing.id,
      email: existing.email,
      inviteToken: existing.inviteToken || existing.resetToken || "",
      alreadyExists: true,
    };
  }

  // Look up the employee/contractor to get email and other details
  let email = input.email || "";
  let workerName = "";
  let workerType: "employee" | "contractor" = contractorId ? "contractor" : "employee";
  let companyName = "";
  let customerId: number | null = null;

  if (contractorId) {
    const [contractor] = await db.select().from(contractors).where(eq(contractors.id, contractorId)).limit(1);
    if (!contractor) throw new Error(`Contractor ${contractorId} not found`);
    email = email || contractor.email || "";
    workerName = `${contractor.firstName || ""} ${contractor.lastName || ""}`.trim();
    customerId = contractor.customerId;
  } else if (employeeId) {
    const [employee] = await db.select().from(employees).where(eq(employees.id, employeeId!)).limit(1);
    if (!employee) throw new Error(`Employee ${employeeId} not found`);
    email = email || employee.email || "";
    workerName = `${employee.firstName || ""} ${employee.lastName || ""}`.trim();
    customerId = employee.customerId;
  }

  if (!email) {
    throw new Error("Cannot create worker account: no email address found");
  }

  // Look up company name
  if (customerId) {
    const [customer] = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
    companyName = customer?.companyName || "your company";
  }

  // Generate invite token (used for initial password setup)
  const inviteToken = crypto.randomBytes(32).toString("hex");
  const inviteTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Create worker_users record
  const [newWorkerUser] = await db.insert(workerUsers).values({
    email,
    passwordHash: "", // Empty until worker sets password via invite link
    contractorId: contractorId || null,
    employeeId: employeeId || null,
    inviteToken: inviteToken,
    inviteExpiresAt: inviteTokenExpiry,
  }).returning();

  // Send invite email
  if (shouldSendEmail) {
    const baseUrl = input.baseUrl || process.env.WORKER_PORTAL_URL || "https://worker.geahr.com";
    const inviteUrl = `${baseUrl}/invite/${inviteToken}`;

    try {
      await sendWorkerPortalInviteEmail({
        to: email,
        workerName: workerName || email,
        companyName,
        workerType,
        inviteUrl,
      });
    } catch (err) {
      console.error("[WorkerProvisioning] Failed to send invite email:", err);
      // Don't throw — the account is created, email can be resent later
    }
  }

  return {
    workerUserId: newWorkerUser.id,
    email,
    inviteToken,
    alreadyExists: false,
  };
}

/**
 * Resend the invite email for an existing worker_users record.
 * Generates a new token and sends a fresh invite email.
 */
export async function resendWorkerInvite(workerUserId: number, baseUrl?: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Database unavailable");

  const [workerUser] = await db.select().from(workerUsers).where(eq(workerUsers.id, workerUserId)).limit(1);
  if (!workerUser) throw new Error(`Worker user ${workerUserId} not found`);

  // Generate new token
  const inviteToken = crypto.randomBytes(32).toString("hex");
  const inviteTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.update(workerUsers).set({
    inviteToken: inviteToken,
    inviteExpiresAt: inviteTokenExpiry,
  }).where(eq(workerUsers.id, workerUserId));

  // Determine worker info for email
  let workerName = "";
  let workerType: "employee" | "contractor" = "contractor";
  let companyName = "";

  if (workerUser.contractorId) {
    const [contractor] = await db.select().from(contractors).where(eq(contractors.id, workerUser.contractorId)).limit(1);
    workerName = contractor ? `${contractor.firstName || ""} ${contractor.lastName || ""}`.trim() : "";
    if (contractor?.customerId) {
      const [customer] = await db.select().from(customers).where(eq(customers.id, contractor.customerId)).limit(1);
      companyName = customer?.companyName || "";
    }
  } else if (workerUser.employeeId) {
    workerType = "employee";
    const [employee] = await db.select().from(employees).where(eq(employees.id, workerUser.employeeId!)).limit(1);
    workerName = employee ? `${employee.firstName || ""} ${employee.lastName || ""}`.trim() : "";
    if (employee?.customerId) {
      const [customer] = await db.select().from(customers).where(eq(customers.id, employee.customerId)).limit(1);
      companyName = customer?.companyName || "";
    }
  }

  const url = baseUrl || process.env.WORKER_PORTAL_URL || "https://worker.geahr.com";
  const inviteUrl = `${url}/invite/${inviteToken}`;

  await sendWorkerPortalInviteEmail({
    to: workerUser.email,
    workerName: workerName || workerUser.email,
    companyName: companyName || "your company",
    workerType,
    inviteUrl,
  });
}
