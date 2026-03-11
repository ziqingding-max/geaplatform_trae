/**
 * Portal Adjustments Router
 *
 * All queries are SCOPED to ctx.portalUser.customerId.
 * Portal users can view and submit adjustments.
 * Adjustments are editable until locked (monthly cutoff on 4th).
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { sql, eq, and, count, desc } from "drizzle-orm";
import {
  protectedPortalProcedure,
  portalHrProcedure,
  portalRouter,
} from "../portalTrpc";
import { getDb } from "../../db";
import { adjustments, employees, payrollRuns, payrollItems } from "../../../drizzle/schema";
import { storagePut } from "../../storage";

export const portalAdjustmentsRouter = portalRouter({
  /**
   * List adjustments — scoped to customerId
   */
  list: protectedPortalProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
        status: z.string().optional(),
        effectiveMonth: z.string().optional(),
        employeeId: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { items: [], total: 0 };
      const cid = ctx.portalUser.customerId;

      const conditions = [eq(adjustments.customerId, cid)];

      if (input.status) {
        conditions.push(eq(adjustments.status, input.status as any));
      }
      if (input.effectiveMonth) {
        conditions.push(eq(adjustments.effectiveMonth, input.effectiveMonth as any));
      }
      if (input.employeeId) {
        conditions.push(eq(adjustments.employeeId, input.employeeId));
      }

      const where = and(...conditions);

      const [totalResult] = await db
        .select({ count: count() })
        .from(adjustments)
        .where(where);

      const items = await db
        .select({
          id: adjustments.id,
          employeeId: adjustments.employeeId,
          adjustmentType: adjustments.adjustmentType,
          category: adjustments.category,
          amount: adjustments.amount,
          currency: adjustments.currency,
          effectiveMonth: adjustments.effectiveMonth,
          description: adjustments.description,
          status: adjustments.status,
          receiptFileUrl: adjustments.receiptFileUrl,
          clientApprovedBy: adjustments.clientApprovedBy,
          clientApprovedAt: adjustments.clientApprovedAt,
          clientRejectionReason: adjustments.clientRejectionReason,
          adminApprovedBy: adjustments.adminApprovedBy,
          adminApprovedAt: adjustments.adminApprovedAt,
          adminRejectionReason: adjustments.adminRejectionReason,
          createdAt: adjustments.createdAt,
          updatedAt: adjustments.updatedAt,
          // Join employee name
          employeeFirstName: employees.firstName,
          employeeLastName: employees.lastName,
        })
        .from(adjustments)
        .innerJoin(employees, eq(adjustments.employeeId, employees.id))
        .where(where)
        .orderBy(sql`${adjustments.updatedAt} DESC`)
        .limit(input.pageSize)
        .offset((input.page - 1) * input.pageSize);

      return {
        items,
        total: totalResult?.count ?? 0,
      };
    }),

  /**
   * Create adjustment — only HR managers and admins
   */
  create: portalHrProcedure
    .input(
      z.object({
        employeeId: z.number(),
        adjustmentType: z.enum(["bonus", "allowance", "reimbursement", "deduction", "other"]),
        category: z.enum(["housing", "transport", "meals", "performance_bonus", "year_end_bonus", "overtime", "travel_reimbursement", "equipment_reimbursement", "absence_deduction", "other"]).optional(),
        amount: z.string(),
        currency: z.string().default("USD"),
        effectiveMonth: z.string(),
        description: z.string().optional(),
        receiptFileUrl: z.string().optional(),
        receiptFileKey: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const cid = ctx.portalUser.customerId;

      // CRITICAL: Verify employee belongs to this customer
      const [emp] = await db
        .select({ id: employees.id, country: employees.country, salaryCurrency: employees.salaryCurrency })
        .from(employees)
        .where(and(eq(employees.id, input.employeeId), eq(employees.customerId, cid)));

      if (!emp) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found" });
      }

      // Normalize effectiveMonth to YYYY-MM-01 format, consistent with admin endpoint
      const parts = input.effectiveMonth.split("-");
      if (parts.length < 2) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid effective month format" });
      }
      const normalizedMonth = `${parts[0]}-${parts[1].padStart(2, "0")}-01`;

      // Check if payroll run for this month is already approved/locked
      const [existingPayroll] = await db
        .select({ id: payrollRuns.id, status: payrollRuns.status })
        .from(payrollRuns)
        .innerJoin(payrollItems, eq(payrollRuns.id, payrollItems.payrollRunId))
        .where(
          and(
            eq(payrollRuns.countryCode, emp.country),
            eq(payrollRuns.payrollMonth, normalizedMonth),
            eq(payrollItems.employeeId, input.employeeId)
          )
        )
        .limit(1);

      if (existingPayroll && (existingPayroll.status === "approved" || existingPayroll.status === "pending_approval")) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Payroll run for ${normalizedMonth.substring(0, 7)} is already ${existingPayroll.status}. Adjustments cannot be added.`,
        });
      }

      // Use employee's salary currency, not the user-provided one
      const currency = emp.salaryCurrency || input.currency;

      await db.insert(adjustments).values({
        employeeId: input.employeeId,
        customerId: cid, // ALWAYS from context
        adjustmentType: input.adjustmentType,
        category: input.category || null,
        amount: input.amount,
        currency,
        effectiveMonth: normalizedMonth, // Store as text string, not Date
        description: input.description || null,
        receiptFileUrl: input.receiptFileUrl || null,
        receiptFileKey: input.receiptFileKey || null,
        status: "submitted",
      });

      return { success: true };
    }),

  /**
   * Update adjustment — only if status is 'submitted' (not locked)
   */
  update: portalHrProcedure
    .input(
      z.object({
        id: z.number(),
        amount: z.string().optional(),
        description: z.string().optional(),
        receiptFileUrl: z.string().optional(),
        receiptFileKey: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const cid = ctx.portalUser.customerId;

      // Verify adjustment belongs to this customer and is still editable
      const [adj] = await db
        .select({ id: adjustments.id, status: adjustments.status })
        .from(adjustments)
        .where(and(eq(adjustments.id, input.id), eq(adjustments.customerId, cid)));

      if (!adj) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Adjustment not found" });
      }

      if (adj.status !== "submitted") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Adjustment is locked and cannot be edited" });
      }

      const updates: Record<string, any> = {};
      if (input.amount !== undefined) updates.amount = input.amount;
      if (input.description !== undefined) updates.description = input.description;
      if (input.receiptFileUrl !== undefined) updates.receiptFileUrl = input.receiptFileUrl;
      if (input.receiptFileKey !== undefined) updates.receiptFileKey = input.receiptFileKey;

      if (Object.keys(updates).length > 0) {
        await db
          .update(adjustments)
          .set(updates)
          .where(eq(adjustments.id, input.id));
      }

      return { success: true };
    }),

  /**
   * Delete adjustment — only if status is 'submitted'
   */
  delete: portalHrProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const cid = ctx.portalUser.customerId;

      const [adj] = await db
        .select({ id: adjustments.id, status: adjustments.status })
        .from(adjustments)
        .where(and(eq(adjustments.id, input.id), eq(adjustments.customerId, cid)));

      if (!adj) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Adjustment not found" });
      }

      if (adj.status !== "submitted") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Adjustment is locked and cannot be deleted" });
      }

      await db.delete(adjustments).where(eq(adjustments.id, input.id));
      return { success: true };
    }),

  /**
   * Client approve adjustment — HR manager / admin approves a submitted adjustment
   */
  approve: portalHrProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const cid = ctx.portalUser.customerId;

      const [adj] = await db
        .select({ id: adjustments.id, status: adjustments.status })
        .from(adjustments)
        .where(and(eq(adjustments.id, input.id), eq(adjustments.customerId, cid)));

      if (!adj) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Adjustment not found" });
      }

      if (adj.status !== "submitted") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only submitted adjustments can be approved" });
      }

      await db.update(adjustments).set({
        status: "client_approved",
        clientApprovedBy: ctx.portalUser.contactId,
        clientApprovedAt: new Date(),
      }).where(eq(adjustments.id, input.id));

      return { success: true };
    }),

  /**
   * Client reject adjustment
   */
  reject: portalHrProcedure
    .input(z.object({
      id: z.number(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const cid = ctx.portalUser.customerId;

      const [adj] = await db
        .select({ id: adjustments.id, status: adjustments.status })
        .from(adjustments)
        .where(and(eq(adjustments.id, input.id), eq(adjustments.customerId, cid)));

      if (!adj) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Adjustment not found" });
      }

      if (adj.status !== "submitted") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only submitted adjustments can be rejected" });
      }

      await db.update(adjustments).set({
        status: "client_rejected",
        clientApprovedBy: ctx.portalUser.contactId,
        clientApprovedAt: new Date(),
        clientRejectionReason: input.reason || null,
      }).where(eq(adjustments.id, input.id));

      return { success: true };
    }),

  /**
   * Upload receipt file for an adjustment
   */
  uploadReceipt: portalHrProcedure
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
      const fileKey = `adjustment-receipts/${Date.now()}-${randomSuffix}-${input.fileName}`;
      const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);
      return { url, fileKey };
    }),
});
