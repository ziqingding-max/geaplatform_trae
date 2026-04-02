/**
 * Worker Reimbursements Router
 *
 * Employee-only: submit reimbursement requests, view history and status.
 *
 * Workflow:
 * 1. Employee submits reimbursement with receipt (status: "submitted")
 * 2. Client approves/rejects via Client Portal
 * 3. Admin confirms via Admin Portal
 * 4. Reimbursement is included in next payroll run when locked
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  workerRouter,
  employeeOnlyProcedure,
} from "../workerTrpc";
import { getDb } from "../../services/db/connection";
import { reimbursements } from "../../../drizzle/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { storagePut } from "../../storage";
import { attachmentsSchema, resolveAttachments } from "../../utils/attachments";

export const workerReimbursementsRouter = workerRouter({
  /**
   * List my reimbursements with pagination and optional status filter
   */
  list: employeeOnlyProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
        status: z.enum([
          "submitted", "client_approved", "client_rejected",
          "admin_approved", "admin_rejected", "locked",
        ]).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const employeeId = ctx.workerUser.employeeId!;
      const offset = (input.page - 1) * input.pageSize;

      const baseCondition = eq(reimbursements.employeeId, employeeId);
      const whereCondition = input.status
        ? and(baseCondition, eq(reimbursements.status, input.status))
        : baseCondition;

      const [totalResult] = await db
        .select({ count: count() })
        .from(reimbursements)
        .where(whereCondition);

      const rawItems = await db
        .select({
          id: reimbursements.id,
          category: reimbursements.category,
          description: reimbursements.description,
          amount: reimbursements.amount,
          currency: reimbursements.currency,
          receiptFileUrl: reimbursements.receiptFileUrl,
          receiptFileKey: reimbursements.receiptFileKey,
          attachments: reimbursements.attachments,
          status: reimbursements.status,
          effectiveMonth: reimbursements.effectiveMonth,
          clientRejectionReason: reimbursements.clientRejectionReason,
          adminRejectionReason: reimbursements.adminRejectionReason,
          createdAt: reimbursements.createdAt,
        })
        .from(reimbursements)
        .where(whereCondition)
        .limit(input.pageSize)
        .offset(offset)
        .orderBy(desc(reimbursements.createdAt));

      // Resolve attachments (new multi-file field + legacy single-file fallback)
      const items = await Promise.all(rawItems.map(async (item) => {
        const resolvedAttachments = await resolveAttachments(item as any);
        return { ...item, attachments: resolvedAttachments };
      }));

      return {
        items,
        total: totalResult?.count ?? 0,
        page: input.page,
        pageSize: input.pageSize,
      };
    }),

  /**
   * Upload receipt file (base64 encoded).
   * Returns the URL and file key for use in the submit mutation.
   */
  uploadReceipt: employeeOnlyProcedure
    .input(
      z.object({
        fileBase64: z.string(),
        fileName: z.string(),
        mimeType: z.string().default("application/pdf"),
      })
    )
    .mutation(async ({ input }) => {
      const fileBuffer = Buffer.from(input.fileBase64, "base64");

      if (fileBuffer.length > 20 * 1024 * 1024) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "File size must be under 20MB" });
      }

      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const fileKey = `reimbursement-receipts/${Date.now()}-${randomSuffix}-${input.fileName}`;
      const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);

      return { url, fileKey };
    }),

  /**
   * Submit a reimbursement request.
   * Employee provides category, amount, description, and a receipt file (required).
   */
  submit: employeeOnlyProcedure
    .input(
      z.object({
        category: z.enum([
          "travel", "equipment", "meals", "transportation",
          "medical", "education", "office_supplies", "communication", "other",
        ]),
        description: z.string().optional(),
        amount: z.string(), // Decimal as string
        currency: z.string().length(3).default("USD"),
        receiptFileUrl: z.string().optional(),
        receiptFileKey: z.string().optional(),
        attachments: attachmentsSchema,
        effectiveMonth: z.string(), // YYYY-MM-01
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const employeeId = ctx.workerUser.employeeId!;
      const customerId = ctx.workerUser.customerId;

      if (!customerId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Employee profile is incomplete" });
      }

      // Require at least one attachment (receipt required)
      const hasAttachments = (input.attachments && input.attachments.length > 0) || !!input.receiptFileUrl;
      if (!hasAttachments) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Receipt is required for reimbursement claims" });
      }

      // Build attachments: prefer new multi-file field, fall back to legacy single-file
      const attachments = input.attachments && input.attachments.length > 0
        ? input.attachments
        : (input.receiptFileUrl
          ? [{ url: input.receiptFileUrl, fileKey: input.receiptFileKey || "", fileName: "receipt" }]
          : null);

      await db.insert(reimbursements).values({
        employeeId,
        customerId,
        category: input.category,
        description: input.description || null,
        amount: input.amount,
        currency: input.currency,
        receiptFileUrl: input.receiptFileUrl || null,
        receiptFileKey: input.receiptFileKey || null,
        attachments,
        status: "submitted",
        submittedBy: ctx.workerUser.id,
        effectiveMonth: input.effectiveMonth,
      });

      return { success: true };
    }),

  /**
   * Cancel a reimbursement request.
   * Only allowed when status is "submitted" (before any approval).
   */
  cancel: employeeOnlyProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const employeeId = ctx.workerUser.employeeId!;

      const [record] = await db
        .select()
        .from(reimbursements)
        .where(
          and(
            eq(reimbursements.id, input.id),
            eq(reimbursements.employeeId, employeeId)
          )
        );

      if (!record) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reimbursement not found" });
      }

      if (record.status !== "submitted") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only cancel reimbursements that are still pending review",
        });
      }

      await db
        .delete(reimbursements)
        .where(eq(reimbursements.id, input.id));

      return { success: true };
    }),
});
