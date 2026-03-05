import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router } from "../_core/trpc";
import { operationsManagerProcedure, userProcedure } from "../procedures";
import {
  createLeaveRecord,
  listLeaveRecords,
  updateLeaveRecord,
  getLeaveRecordById,
  deleteLeaveRecord,
  listLeaveBalances,
  updateLeaveBalance,
  logAuditAction,
  getEmployeeById,
  getLeaveTypeById,
  getDb,
} from "../db";
import { leaveRecords } from "../../drizzle/schema";
import { and, eq, sql, or, ne } from "drizzle-orm";
import {
  enforceCutoff,
  getLeavePayrollMonth,
  isLeavesCrossMonth,
  splitLeaveByMonth,
  checkCutoffPassed,
} from "../utils/cutoff";

/**
 * Update leave balance: adjust used/remaining by delta days.
 * Positive delta = consuming leave (create), negative delta = restoring leave (delete/cancel).
 */
async function adjustLeaveBalance(employeeId: number, leaveTypeId: number, deltaDays: number, year: number): Promise<{ warning?: string }> {
  const balances = await listLeaveBalances(employeeId, year);
  const balance = balances.find((b: any) => b.leaveTypeId === leaveTypeId);
  if (!balance) {
    return { warning: "No leave balance found for this leave type and year" };
  }

  const newUsed = (balance.used ?? 0) + deltaDays;
  const newRemaining = (balance.remaining ?? 0) - deltaDays;

  let warning: string | undefined;
  if (newRemaining < 0) {
    warning = "Leave balance will be negative (" + newRemaining + " days remaining). Proceeding anyway.";
  }

  await updateLeaveBalance(balance.id, {
    used: Math.max(0, newUsed),
    remaining: newRemaining,
  });

  return { warning };
}

/**
 * Derive the effective month for cutoff enforcement from a leave record's end date.
 * Rule: Leave is attributed to the END DATE's month for payroll purposes.
 */
function getEffectiveMonthFromEndDate(endDate: string): string {
  const parts = endDate.split("-");
  return `${parts[0]}-${parts[1]}-01`;
}

/**
 * Validate that a date string represents a real calendar date.
 * e.g. "2026-02-31" is invalid because February has no 31st.
 */
function validateCalendarDate(dateStr: string): { valid: boolean; error?: string } {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return { valid: false, error: `Invalid date format: "${dateStr}". Expected YYYY-MM-DD.` };

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return { valid: false, error: `Invalid date: "${dateStr}" contains non-numeric values.` };
  }
  if (month < 1 || month > 12) {
    return { valid: false, error: `Invalid month ${month} in date "${dateStr}".` };
  }
  if (day < 1 || day > 31) {
    return { valid: false, error: `Invalid day ${day} in date "${dateStr}".` };
  }

  // Construct a Date and verify it matches the input
  const constructed = new Date(year, month - 1, day);
  if (
    constructed.getFullYear() !== year ||
    constructed.getMonth() !== month - 1 ||
    constructed.getDate() !== day
  ) {
    return { valid: false, error: `Invalid calendar date: "${dateStr}" does not exist (e.g. February has no ${day}th).` };
  }

  return { valid: true };
}

/**
 * Check for overlapping leave records for the same employee.
 * Returns overlapping records if found.
 * Only checks submitted/locked status records.
 * @param excludeIds - IDs to exclude from overlap check (for updates or same-batch splits)
 */
async function findOverlappingLeave(
  employeeId: number,
  startDate: string,
  endDate: string,
  excludeIds: number[] = []
): Promise<{ id: number; startDate: string; endDate: string; days: string }[]> {
  const db = await getDb();
  if (!db) return [];

  const conditions = [
    eq(leaveRecords.employeeId, employeeId),
    // Overlap: existing.start <= new.end AND existing.end >= new.start
    sql`${leaveRecords.startDate} <= ${endDate}`,
    sql`${leaveRecords.endDate} >= ${startDate}`,
    // Only check active records
    sql`${leaveRecords.status} IN ('submitted', 'locked')`,
  ];

  // Exclude specific IDs (for same-batch splits or updates)
  if (excludeIds.length > 0) {
    for (const id of excludeIds) {
      conditions.push(ne(leaveRecords.id, id));
    }
  }

  const overlapping = await db
    .select({
      id: leaveRecords.id,
      startDate: leaveRecords.startDate,
      endDate: leaveRecords.endDate,
      days: leaveRecords.days,
    })
    .from(leaveRecords)
    .where(and(...conditions));

  return overlapping.map((r: any) => ({
    id: r.id,
    startDate: String(r.startDate),
    endDate: String(r.endDate),
    days: String(r.days),
  }));
}

export const leaveRouter = router({
  list: userProcedure
    .input(
      z.object({
        employeeId: z.number().optional(),
        status: z.string().optional(),
        month: z.string().optional(), // YYYY-MM filter by startDate month
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const page = Math.floor(input.offset / input.limit) + 1;
      return await listLeaveRecords({
        page,
        pageSize: input.limit,
        employeeId: input.employeeId,
        status: input.status,
        month: input.month,
      });
    }),

  get: userProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getLeaveRecordById(input.id);
    }),

  create: operationsManagerProcedure
    .input(
      z.object({
        employeeId: z.number(),
        leaveTypeId: z.number(),
        startDate: z.string(), // YYYY-MM-DD
        endDate: z.string(), // YYYY-MM-DD
        days: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 1. Validate calendar dates
      const startValid = validateCalendarDate(input.startDate);
      if (!startValid.valid) throw new TRPCError({ code: 'BAD_REQUEST', message: startValid.error ?? 'Invalid start date' });
      const endValid = validateCalendarDate(input.endDate);
      if (!endValid.valid) throw new TRPCError({ code: 'BAD_REQUEST', message: endValid.error ?? 'Invalid end date' });

      // 2. Validate: end date must be >= start date
      const startDate = new Date(input.startDate);
      const endDate = new Date(input.endDate);
      if (endDate < startDate) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: "Leave end date cannot be before the start date." });
      }

      // 3. Validate employee exists
      const employee = await getEmployeeById(input.employeeId);
      if (!employee) throw new TRPCError({ code: 'BAD_REQUEST', message: "Employee not found" });

      // 4. Determine if cross-month and compute splits
      const crossMonth = isLeavesCrossMonth(input.startDate, input.endDate);
      const totalDays = parseFloat(input.days);
      const splits = splitLeaveByMonth(input.startDate, input.endDate, totalDays);

      // 5. Enforce cutoff for EACH split portion's month
      // Each portion is attributed to its endDate's month
      for (const split of splits) {
        const effectiveMonth = getEffectiveMonthFromEndDate(split.endDate);
        await enforceCutoff(effectiveMonth, ctx.user.role, `create leave record for ${split.payrollMonth}`);
      }

      // 6. Check for overlapping leave records
      const overlapping = await findOverlappingLeave(input.employeeId, input.startDate, input.endDate);
      if (overlapping.length > 0) {
        const overlapDetails = overlapping
          .map((o) => `${o.startDate} to ${o.endDate} (${o.days} days)`)
          .join("; ");
        throw new TRPCError({ code: 'BAD_REQUEST', message: `Duplicate leave detected: employee already has leave records overlapping with this period: ${overlapDetails}. Please adjust the dates or cancel the existing record first.` });
      }

      // 7. Create leave records — one per split portion
      const createdIds: number[] = [];
      const balanceWarnings: string[] = [];

      for (const split of splits) {
        const result = await createLeaveRecord({
          employeeId: input.employeeId,
          leaveTypeId: input.leaveTypeId,
          startDate: split.startDate,
          endDate: split.endDate,
          days: String(split.days),
          reason: crossMonth
            ? `${input.reason || ""}${input.reason ? " | " : ""}[Split ${split.payrollMonth}: ${split.startDate} to ${split.endDate}]`.trim()
            : input.reason,
          status: "submitted",
          submittedBy: ctx.user.id,
        });

        const insertId = (result as any)[0]?.insertId;
        if (insertId) createdIds.push(insertId);

        // Adjust leave balance for each portion
        const year = parseInt(split.endDate.split("-")[0], 10);
        const balResult = await adjustLeaveBalance(input.employeeId, input.leaveTypeId, split.days, year);
        if (balResult.warning) balanceWarnings.push(balResult.warning);
      }

      await logAuditAction({
        userId: ctx.user.id, userName: ctx.user.name || null,
        action: "create",
        entityType: "leave_record",
        changes: JSON.stringify({
          ...input,
          crossMonth,
          splitCount: splits.length,
          splits: crossMonth ? splits : undefined,
          createdIds,
        }),
      });

      // Build response
      return {
        createdIds,
        splitCount: splits.length,
        crossMonth,
        splits,
        balanceWarnings: balanceWarnings.length > 0 ? balanceWarnings : undefined,
      };
    }),

  update: operationsManagerProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          employeeId: z.number().optional(),
          leaveTypeId: z.number().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          days: z.string().optional(),
          reason: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await getLeaveRecordById(input.id);
      if (!existing) throw new TRPCError({ code: 'BAD_REQUEST', message: "Leave record not found" });
      if (existing.status === "locked") throw new TRPCError({ code: 'BAD_REQUEST', message: "Cannot edit a locked leave record" });

      // Validate calendar dates if provided
      if (input.data.startDate) {
        const v = validateCalendarDate(input.data.startDate);
        if (!v.valid) throw new TRPCError({ code: 'BAD_REQUEST', message: v.error ?? 'Invalid date' });
      }
      if (input.data.endDate) {
        const v = validateCalendarDate(input.data.endDate);
        if (!v.valid) throw new TRPCError({ code: 'BAD_REQUEST', message: v.error ?? 'Invalid date' });
      }

      // Enforce cutoff based on END DATE month (attribution rule)
      const endDate = input.data.endDate || String(existing.endDate);
      const effectiveMonth = getEffectiveMonthFromEndDate(endDate);
      await enforceCutoff(effectiveMonth, ctx.user.role, "update leave record");

      // If end date changed, also check cutoff for old end date month
      if (input.data.endDate && input.data.endDate !== String(existing.endDate)) {
        const oldEffectiveMonth = getEffectiveMonthFromEndDate(String(existing.endDate));
        await enforceCutoff(oldEffectiveMonth, ctx.user.role, "update leave record (original month)");
      }

      // Check for date overlap if dates are being changed
      const newStart = input.data.startDate || String(existing.startDate);
      const newEnd = input.data.endDate || String(existing.endDate);
      if (input.data.startDate || input.data.endDate) {
        const overlapping = await findOverlappingLeave(
          existing.employeeId,
          newStart,
          newEnd,
          [input.id] // exclude the record being updated
        );
        if (overlapping.length > 0) {
          const overlapDetails = overlapping
            .map((o) => `${o.startDate} to ${o.endDate} (${o.days} days)`)
            .join("; ");
          throw new TRPCError({ code: 'BAD_REQUEST', message: `Duplicate leave detected: employee already has leave records overlapping with this period: ${overlapDetails}.` });
        }
      }

      // If days changed, adjust balance (rollback old, apply new)
      const oldDays = parseFloat(existing.days?.toString() ?? "0");
      const newDays = input.data.days ? parseFloat(input.data.days) : oldDays;
      const oldLeaveTypeId = existing.leaveTypeId;
      const newLeaveTypeId = input.data.leaveTypeId ?? oldLeaveTypeId;
      const endDateParts = endDate.split("-");
      const year = parseInt(endDateParts[0], 10);

      if (oldDays !== newDays || oldLeaveTypeId !== newLeaveTypeId) {
        // Rollback old balance
        await adjustLeaveBalance(existing.employeeId, oldLeaveTypeId, -oldDays, year);
        // Apply new balance
        await adjustLeaveBalance(existing.employeeId, newLeaveTypeId, newDays, year);
      }

      // Build update data (no deduction fields)
      const updateData: any = { ...input.data };
      // Dates are already validated strings (YYYY-MM-DD), pass directly
      
      await updateLeaveRecord(input.id, updateData);

      await logAuditAction({
        userId: ctx.user.id, userName: ctx.user.name || null,
        action: "update",
        entityType: "leave_record",
        entityId: input.id,
        changes: JSON.stringify(input.data),
      });

      return { success: true };
    }),

  delete: operationsManagerProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Only allow deleting pending/submitted leave
      const existing = await getLeaveRecordById(input.id);
      if (!existing) throw new TRPCError({ code: 'BAD_REQUEST', message: "Leave record not found" });
      if (existing.status === "locked") throw new TRPCError({ code: 'BAD_REQUEST', message: "Cannot delete a locked leave record" });

      // Enforce cutoff based on END DATE month
      const endDate = String(existing.endDate);
      const effectiveMonth = getEffectiveMonthFromEndDate(endDate);
      await enforceCutoff(effectiveMonth, ctx.user.role, "delete leave record");

      // Restore leave balance
      const days = parseFloat(existing.days?.toString() ?? "0");
      const year = parseInt(endDate.split("-")[0], 10);
      await adjustLeaveBalance(existing.employeeId, existing.leaveTypeId, -days, year);

      await deleteLeaveRecord(input.id);

      await logAuditAction({
        userId: ctx.user.id, userName: ctx.user.name || null,
        action: "delete",
        entityType: "leave_record",
        entityId: input.id,
      });

      return { success: true };
    }),

  // Cancel is now equivalent to delete — no cancelled status, just remove the record
  cancel: operationsManagerProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const existing = await getLeaveRecordById(input.id);
      if (!existing) throw new TRPCError({ code: 'BAD_REQUEST', message: "Leave record not found" });
      if (existing.status === "locked") throw new TRPCError({ code: 'BAD_REQUEST', message: "Cannot cancel a locked leave record" });

      // Enforce cutoff based on END DATE month
      const endDate = String(existing.endDate);
      const effectiveMonth = getEffectiveMonthFromEndDate(endDate);
      await enforceCutoff(effectiveMonth, ctx.user.role, "cancel leave record");

      // Restore leave balance
      const days = parseFloat(existing.days?.toString() ?? "0");
      const year = parseInt(endDate.split("-")[0], 10);
      await adjustLeaveBalance(existing.employeeId, existing.leaveTypeId, -days, year);

      // Delete the record instead of setting cancelled status
      await deleteLeaveRecord(input.id);

      await logAuditAction({
        userId: ctx.user.id, userName: ctx.user.name || null,
        action: "cancel",
        entityType: "leave_record",
        entityId: input.id,
      });

      return { success: true };
    }),

  /**
   * Admin approve — confirms a client_approved leave record
   */
  adminApprove: operationsManagerProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const existing = await getLeaveRecordById(input.id);
      if (!existing) throw new TRPCError({ code: 'BAD_REQUEST', message: "Leave record not found" });
      if (existing.status !== "client_approved") {
        throw new TRPCError({ code: 'BAD_REQUEST', message: "Only client-approved leave records can be admin-approved" });
      }

      await updateLeaveRecord(input.id, {
        status: "admin_approved",
        adminApprovedBy: ctx.user.id,
        adminApprovedAt: new Date(),
      } as any);

      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "admin_approve",
        entityType: "leave_record",
        entityId: input.id,
      });

      return { success: true };
    }),

  /**
   * Admin reject — rejects a client_approved leave record
   */
  adminReject: operationsManagerProcedure
    .input(z.object({
      id: z.number(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const existing = await getLeaveRecordById(input.id);
      if (!existing) throw new TRPCError({ code: 'BAD_REQUEST', message: "Leave record not found" });
      if (existing.status !== "client_approved") {
        throw new TRPCError({ code: 'BAD_REQUEST', message: "Only client-approved leave records can be admin-rejected" });
      }

      await updateLeaveRecord(input.id, {
        status: "admin_rejected",
        adminApprovedBy: ctx.user.id,
        adminApprovedAt: new Date(),
        adminRejectionReason: input.reason || null,
      } as any);

      await logAuditAction({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        action: "admin_reject",
        entityType: "leave_record",
        entityId: input.id,
        changes: JSON.stringify({ reason: input.reason }),
      });

      return { success: true };
    }),

  balances: userProcedure
    .input(z.object({ employeeId: z.number(), year: z.number().optional() }))
    .query(async ({ input }) => {
      return await listLeaveBalances(input.employeeId, input.year);
    }),
});
