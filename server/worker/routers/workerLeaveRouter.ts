/**
 * Worker Leave Router
 *
 * Employee-only: submit leave requests, view leave balances and history.
 *
 * Workflow:
 * 1. Employee submits leave request (status: "submitted")
 * 2. Client approves/rejects via Client Portal
 * 3. Admin confirms via Admin Portal
 * 4. Leave balance is deducted upon admin approval
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  workerRouter,
  employeeOnlyProcedure,
} from "../workerTrpc";
import { getDb } from "../../services/db/connection";
import {
  leaveRecords,
  leaveBalances,
  leaveTypes,
} from "../../../drizzle/schema";
import { eq, and, desc, count } from "drizzle-orm";

export const workerLeaveRouter = workerRouter({
  /**
   * Get leave balances for current year
   */
  getBalances: employeeOnlyProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const employeeId = ctx.workerUser.employeeId!;
    const currentYear = new Date().getFullYear();

    const balances = await db
      .select({
        id: leaveBalances.id,
        leaveTypeId: leaveBalances.leaveTypeId,
        year: leaveBalances.year,
        totalEntitlement: leaveBalances.totalEntitlement,
        used: leaveBalances.used,
        remaining: leaveBalances.remaining,
        leaveTypeName: leaveTypes.leaveTypeName,
        isPaid: leaveTypes.isPaid,
      })
      .from(leaveBalances)
      .innerJoin(leaveTypes, eq(leaveBalances.leaveTypeId, leaveTypes.id))
      .where(
        and(
          eq(leaveBalances.employeeId, employeeId),
          eq(leaveBalances.year, currentYear)
        )
      );

    return balances;
  }),

  /**
   * List leave records with pagination
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

      const baseCondition = eq(leaveRecords.employeeId, employeeId);
      const whereCondition = input.status
        ? and(baseCondition, eq(leaveRecords.status, input.status))
        : baseCondition;

      const [totalResult] = await db
        .select({ count: count() })
        .from(leaveRecords)
        .where(whereCondition);

      const items = await db
        .select({
          id: leaveRecords.id,
          leaveTypeId: leaveRecords.leaveTypeId,
          startDate: leaveRecords.startDate,
          endDate: leaveRecords.endDate,
          days: leaveRecords.days,
          reason: leaveRecords.reason,
          status: leaveRecords.status,
          clientRejectionReason: leaveRecords.clientRejectionReason,
          adminRejectionReason: leaveRecords.adminRejectionReason,
          createdAt: leaveRecords.createdAt,
        })
        .from(leaveRecords)
        .where(whereCondition)
        .limit(input.pageSize)
        .offset(offset)
        .orderBy(desc(leaveRecords.createdAt));

      return {
        items,
        total: totalResult?.count ?? 0,
        page: input.page,
        pageSize: input.pageSize,
      };
    }),

  /**
   * Submit a leave request.
   * The employee selects leave type, date range, and provides a reason.
   */
  submit: employeeOnlyProcedure
    .input(
      z.object({
        leaveTypeId: z.number(),
        startDate: z.string(), // YYYY-MM-DD
        endDate: z.string(),   // YYYY-MM-DD
        days: z.string(), // Support half days, e.g. "1", "0.5", "3"
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const employeeId = ctx.workerUser.employeeId!;

      // Verify leave type exists
      const [leaveType] = await db
        .select()
        .from(leaveTypes)
        .where(eq(leaveTypes.id, input.leaveTypeId));

      if (!leaveType) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Leave type not found" });
      }

      // Check leave balance
      const currentYear = new Date().getFullYear();
      const [balance] = await db
        .select()
        .from(leaveBalances)
        .where(
          and(
            eq(leaveBalances.employeeId, employeeId),
            eq(leaveBalances.leaveTypeId, input.leaveTypeId),
            eq(leaveBalances.year, currentYear)
          )
        );

      const requestedDays = parseFloat(input.days);
      if (balance && balance.remaining < requestedDays) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Insufficient leave balance. Available: ${balance.remaining} days, Requested: ${requestedDays} days`,
        });
      }

      // Insert leave record
      await db.insert(leaveRecords).values({
        employeeId,
        leaveTypeId: input.leaveTypeId,
        startDate: input.startDate,
        endDate: input.endDate,
        days: input.days,
        reason: input.reason || null,
        status: "submitted",
        submittedBy: ctx.workerUser.id,
      });

      return { success: true };
    }),

  /**
   * Cancel a leave request.
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
        .from(leaveRecords)
        .where(
          and(
            eq(leaveRecords.id, input.id),
            eq(leaveRecords.employeeId, employeeId)
          )
        );

      if (!record) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Leave record not found" });
      }

      if (record.status !== "submitted") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only cancel leave requests that are still pending review",
        });
      }

      // Delete the record (or could set a "cancelled" status if needed)
      await db
        .delete(leaveRecords)
        .where(eq(leaveRecords.id, input.id));

      return { success: true };
    }),
});
