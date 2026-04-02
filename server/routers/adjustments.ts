import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router } from "../_core/trpc";
import { operationsManagerProcedure, userProcedure } from "../procedures";
import {
  createAdjustment,
  listAdjustments,
  getAdjustmentById,
  updateAdjustment,
  deleteAdjustment,
  logAuditAction,
  getEmployeeById,
  getCountryConfig,
} from "../db";
import { enforceCutoff, checkCutoffPassed, getAdjustmentPayrollMonth } from "../utils/cutoff";
import { storagePut, storageGet } from "../storage";
import { attachmentsSchema, resolveAttachments } from "../utils/attachments";

export const adjustmentsRouter = router({
  list: userProcedure
    .input(
      z.object({
        customerId: z.number().optional(),
        employeeId: z.number().optional(),
        status: z.string().optional(),
        adjustmentType: z.string().optional(),
        effectiveMonth: z.string().optional(), // YYYY-MM or YYYY-MM-01
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const page = Math.floor(input.offset / input.limit) + 1;
      const { data: items, total } = await listAdjustments({
        page,
        pageSize: input.limit,
        customerId: input.customerId,
        employeeId: input.employeeId,
        status: input.status,
        adjustmentType: input.adjustmentType,
        effectiveMonth: input.effectiveMonth,
      });

      // Resolve attachments (new multi-file field + legacy single-file fallback)
      const processedItems = await Promise.all(items.map(async (item) => {
        const resolvedAttachments = await resolveAttachments(item as any);

        // Also keep legacy receiptFileUrl for backward compat with old frontend code
        let receiptFileUrl = (item as any).receiptFileUrl;
        if ((item as any).receiptFileKey && !resolvedAttachments.length) {
          try {
            const { url } = await storageGet((item as any).receiptFileKey);
            receiptFileUrl = url;
          } catch (e) {
            // keep original
          }
        } else if (resolvedAttachments.length > 0) {
          receiptFileUrl = resolvedAttachments[0].url;
        }

        return { ...item, receiptFileUrl, attachments: resolvedAttachments };
      }));

      return { data: processedItems, total };
    }),

  get: userProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getAdjustmentById(input.id);
    }),

  create: operationsManagerProcedure
    .input(
      z.object({
        employeeId: z.number(),
        adjustmentType: z.enum(["bonus", "allowance", "deduction", "other"]),
        category: z.enum([
          "housing", "transport", "meals", "performance_bonus", "year_end_bonus",
          "overtime", "travel_reimbursement", "equipment_reimbursement",
          "absence_deduction", "other",
        ]).optional(),
        description: z.string().optional(),
        amount: z.string(),
        effectiveMonth: z.string(), // YYYY-MM or YYYY-MM-01
        receiptFileUrl: z.string().optional(),
        receiptFileKey: z.string().optional(),
        attachments: attachmentsSchema,
        // Recurring adjustment fields
        recurrenceType: z.enum(["one_time", "monthly", "permanent"]).default("one_time"),
        recurrenceEndMonth: z.string().optional(), // YYYY-MM or YYYY-MM-01, required for monthly
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Normalize effectiveMonth to YYYY-MM-01
      // Handle various input formats (YYYY-MM, YYYY-MM-DD)
      const parts = input.effectiveMonth.split("-");
      if (parts.length < 2) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: "Invalid effective month format" });
      }
      const normalizedMonth = `${parts[0]}-${parts[1].padStart(2, "0")}-01`;

      // 1. Check if Payroll Run for this month is already approved/locked
      // If payroll is locked, we CANNOT add new adjustments regardless of cutoff date
      const employee = await getEmployeeById(input.employeeId);
      if (!employee) throw new TRPCError({ code: 'BAD_REQUEST', message: "Employee not found" });

      const { findPayrollRunByCountryMonth } = await import("../db");
      const existingPayroll = await findPayrollRunByCountryMonth(employee.country, normalizedMonth);
      
      if (existingPayroll && (existingPayroll.status === "approved" || existingPayroll.status === "pending_approval")) {
        throw new TRPCError({ 
          code: 'BAD_REQUEST', 
          message: `Payroll run for ${normalizedMonth.substring(0, 7)} is already ${existingPayroll.status}. Adjustments cannot be added.` 
        });
      }

      // 2. Enforce cutoff — allow creating adjustments for any month whose cutoff hasn't passed.
      const now = new Date();
      await enforceCutoff(normalizedMonth, ctx.user.role, "create adjustment");

      // Check if cutoff is approaching (within 48 hours) for warning
      const { passed, cutoffDate } = await checkCutoffPassed(normalizedMonth);
      let cutoffWarning: string | undefined;
      if (!passed) {
        const hoursUntilCutoff = (cutoffDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (hoursUntilCutoff <= 48) {
          cutoffWarning = `Cutoff for ${parts[0]}-${parts[1]} payroll is in ${Math.round(hoursUntilCutoff)} hours. Submit before the deadline.`;
        }
      }

      const currency = employee.salaryCurrency || "USD";
      const customerId = employee.customerId;

      // Receipt is optional for all adjustment types (reimbursement is now a separate module)

      const payrollMonth = getAdjustmentPayrollMonth(normalizedMonth);

      // Validate recurrence fields
      const isRecurring = input.recurrenceType !== "one_time";
      let normalizedEndMonth: string | undefined;
      if (input.recurrenceType === "monthly") {
        if (!input.recurrenceEndMonth) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: "End month is required for monthly recurring adjustments" });
        }
        const endParts = input.recurrenceEndMonth.split("-");
        normalizedEndMonth = `${endParts[0]}-${endParts[1].padStart(2, "0")}-01`;
        if (normalizedEndMonth < normalizedMonth) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: "End month must be on or after the effective month" });
        }
      }
      if (input.recurrenceType === "permanent" && input.recurrenceEndMonth) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: "Permanent adjustments should not have an end month" });
      }

      // Build attachments: prefer new multi-file field, fall back to legacy single-file
      const attachments = input.attachments && input.attachments.length > 0
        ? input.attachments
        : (input.receiptFileUrl
          ? [{ url: input.receiptFileUrl, fileKey: input.receiptFileKey || "", fileName: "receipt" }]
          : null);

      const result = await createAdjustment({
        employeeId: input.employeeId,
        customerId,
        adjustmentType: input.adjustmentType,
        category: input.category,
        description: input.description,
        amount: input.amount,
        currency,
        effectiveMonth: normalizedMonth, // Store as YYYY-MM-01 string (text column)
        receiptFileUrl: input.receiptFileUrl,
        receiptFileKey: input.receiptFileKey,
        attachments,
        status: "submitted",
        submittedBy: ctx.user.id,
        // Recurring fields
        recurrenceType: input.recurrenceType,
        recurrenceEndMonth: normalizedEndMonth || null,
        isRecurringTemplate: isRecurring,
        parentAdjustmentId: null,
      } as any);

      await logAuditAction({
        userId: ctx.user.id, userName: ctx.user.name || null,
        action: "create",
        entityType: "adjustment",
        changes: JSON.stringify({ ...input, customerId, currency, payrollMonth }),
      });

      return {
        ...result,
        payrollMonth,
        cutoffWarning,
      };
    }),

  update: operationsManagerProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          adjustmentType: z.enum(["bonus", "allowance", "deduction", "other"]).optional(),
          category: z.enum([
            "housing", "transport", "meals", "performance_bonus", "year_end_bonus",
            "overtime", "travel_reimbursement", "equipment_reimbursement",
            "absence_deduction", "other",
          ]).optional(),
          description: z.string().optional(),
          amount: z.string().optional(),
          effectiveMonth: z.string().optional(),
          receiptFileUrl: z.string().optional().nullable(),
          receiptFileKey: z.string().optional().nullable(),
          attachments: attachmentsSchema.nullable().optional(),
          // Recurring adjustment fields
          recurrenceType: z.enum(["one_time", "monthly", "permanent"]).optional(),
          recurrenceEndMonth: z.string().optional().nullable(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await getAdjustmentById(input.id);
      if (!existing) throw new TRPCError({ code: 'BAD_REQUEST', message: "Adjustment not found" });
      if (existing.status === "locked") throw new TRPCError({ code: 'BAD_REQUEST', message: "Cannot edit a locked adjustment" });

      // Enforce cutoff based on existing effectiveMonth
      const effectiveMonth = input.data.effectiveMonth
        ? `${input.data.effectiveMonth.split("-")[0]}-${input.data.effectiveMonth.split("-")[1].padStart(2, "0")}-01`
        : existing.effectiveMonth;
      await enforceCutoff(effectiveMonth!, ctx.user.role, "update adjustment");

      const updateData: any = { ...input.data };
      if (input.data.effectiveMonth) {
        const parts = input.data.effectiveMonth.split("-");
        updateData.effectiveMonth = `${parts[0]}-${parts[1].padStart(2, "0")}-01`;
      }

      // If effectiveMonth changed, re-check cutoff for new month too
      if (input.data.effectiveMonth && input.data.effectiveMonth !== String(existing.effectiveMonth)) {
        await enforceCutoff(updateData.effectiveMonth, ctx.user.role, "update adjustment (new month)");
      }

      // Receipt is optional for all adjustment types (reimbursement is now a separate module)

      // Handle recurrence field updates
      if (input.data.recurrenceType !== undefined) {
        updateData.recurrenceType = input.data.recurrenceType;
        if (input.data.recurrenceType === "one_time") {
          // Stopping recurrence: clear template flag and end month
          updateData.isRecurringTemplate = false;
          updateData.recurrenceEndMonth = null;
        } else {
          updateData.isRecurringTemplate = true;
          if (input.data.recurrenceType === "monthly") {
            if (!input.data.recurrenceEndMonth) {
              throw new TRPCError({ code: 'BAD_REQUEST', message: "End month is required for monthly recurring adjustments" });
            }
            const endParts = input.data.recurrenceEndMonth.split("-");
            updateData.recurrenceEndMonth = `${endParts[0]}-${endParts[1].padStart(2, "0")}-01`;
          } else {
            // permanent
            updateData.recurrenceEndMonth = null;
          }
        }
      } else if (input.data.recurrenceEndMonth !== undefined) {
        // Allow updating just the end month
        if (input.data.recurrenceEndMonth) {
          const endParts = input.data.recurrenceEndMonth.split("-");
          updateData.recurrenceEndMonth = `${endParts[0]}-${endParts[1].padStart(2, "0")}-01`;
        } else {
          updateData.recurrenceEndMonth = null;
        }
      }

      await updateAdjustment(input.id, updateData);

      await logAuditAction({
        userId: ctx.user.id, userName: ctx.user.name || null,
        action: "update",
        entityType: "adjustment",
        entityId: input.id,
        changes: JSON.stringify(input.data),
      });

      return { success: true };
    }),

  delete: operationsManagerProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const existing = await getAdjustmentById(input.id);
      if (!existing) throw new TRPCError({ code: 'BAD_REQUEST', message: "Adjustment not found" });
      if (existing.status === "locked") throw new TRPCError({ code: 'BAD_REQUEST', message: "Cannot delete a locked adjustment" });

      // Enforce cutoff
      await enforceCutoff(existing.effectiveMonth!, ctx.user.role, "delete adjustment");

      await deleteAdjustment(input.id);

      await logAuditAction({
        userId: ctx.user.id, userName: ctx.user.name || null,
        action: "delete",
        entityType: "adjustment",
        entityId: input.id,
      });

      return { success: true };
    }),

  /**
   * Admin approve — confirms a submitted adjustment
   */
  adminApprove: operationsManagerProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const existing = await getAdjustmentById(input.id);
      if (!existing) throw new TRPCError({ code: 'BAD_REQUEST', message: "Adjustment not found" });
      if (existing.status !== "client_approved") {
        throw new TRPCError({ code: 'BAD_REQUEST', message: "Only client-approved adjustments can be admin-approved. Current status: " + existing.status });
      }

      await updateAdjustment(input.id, {
        status: "admin_approved",
        adminApprovedBy: ctx.user.id,
        adminApprovedAt: new Date(),
      } as any);

      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "admin_approve",
        entityType: "adjustment",
        entityId: input.id,
      });

      return { success: true };
    }),

  /**
   * Admin reject — rejects a client-approved adjustment
   */
  adminReject: operationsManagerProcedure
    .input(z.object({
      id: z.number(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const existing = await getAdjustmentById(input.id);
      if (!existing) throw new TRPCError({ code: 'BAD_REQUEST', message: "Adjustment not found" });
      if (existing.status !== "client_approved") {
        throw new TRPCError({ code: 'BAD_REQUEST', message: "Only client-approved adjustments can be admin-rejected. Current status: " + existing.status });
      }

      await updateAdjustment(input.id, {
        status: "admin_rejected",
        adminApprovedBy: ctx.user.id,
        adminApprovedAt: new Date(),
        adminRejectionReason: input.reason || null,
      } as any);

      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "admin_reject",
        entityType: "adjustment",
        entityId: input.id,
        changes: JSON.stringify({ reason: input.reason }),
      });

      return { success: true };
    }),

  /**
   * Bulk admin approve — approve all client_approved adjustments by IDs
   */
  bulkAdminApprove: operationsManagerProcedure
    .input(z.object({
      ids: z.array(z.number()).min(1).max(500),
    }))
    .mutation(async ({ input, ctx }) => {
      let approvedCount = 0;
      let skippedCount = 0;

      for (const id of input.ids) {
        const existing = await getAdjustmentById(id);
        if (!existing || existing.status !== "client_approved") {
          skippedCount++;
          continue;
        }

        await updateAdjustment(id, {
          status: "admin_approved",
          adminApprovedBy: ctx.user.id,
          adminApprovedAt: new Date(),
        } as any);

        await logAuditAction({
          userId: ctx.user.id,
          userName: ctx.user.name || null,
          action: "admin_approve",
          entityType: "adjustment",
          entityId: id,
          changes: JSON.stringify({ bulk: true }),
        });

        approvedCount++;
      }

      return { approvedCount, skippedCount };
    }),

  // Upload receipt file for reimbursement adjustments
  uploadReceipt: operationsManagerProcedure
    .input(
      z.object({
        fileBase64: z.string(),
        fileName: z.string(),
        mimeType: z.string().default("application/pdf"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const fileBuffer = Buffer.from(input.fileBase64, "base64");

      // Limit file size to 20MB
      if (fileBuffer.length > 20 * 1024 * 1024) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: "File size must be under 20MB" });
      }

      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const fileKey = `adjustment-receipts/${Date.now()}-${randomSuffix}-${input.fileName}`;
      const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);

      await logAuditAction({
        userId: ctx.user.id, userName: ctx.user.name || null,
        action: "upload_receipt",
        entityType: "adjustment",
        changes: JSON.stringify({ fileName: input.fileName, fileKey }),
      });

      return { url, fileKey };
    }),

  /**
   * Stop a recurring adjustment template — sets recurrenceType to one_time
   * so the cron job will no longer generate child records.
   * Already-generated child records are NOT affected.
   */
  stopRecurring: operationsManagerProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const existing = await getAdjustmentById(input.id);
      if (!existing) throw new TRPCError({ code: 'BAD_REQUEST', message: "Adjustment not found" });
      if (!existing.isRecurringTemplate) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: "This adjustment is not a recurring template" });
      }

      await updateAdjustment(input.id, {
        recurrenceType: "one_time",
        isRecurringTemplate: false,
        recurrenceEndMonth: null,
      } as any);

      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "stop_recurring",
        entityType: "adjustment",
        entityId: input.id,
        changes: JSON.stringify({ previousRecurrenceType: existing.recurrenceType }),
      });

      return { success: true };
    }),
});
