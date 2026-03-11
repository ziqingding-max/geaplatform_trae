/**
 * Portal Leave Router
 *
 * All queries are SCOPED to ctx.portalUser.customerId via employee join.
 * Portal users can view and submit leave records.
 *
 * Unified approval flow: submitted → client_approved → admin_approved → locked
 * Cross-month leave is automatically split into monthly portions (matching Admin behavior).
 * Cutoff enforcement ensures submissions respect payroll deadlines.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { sql, eq, and, count } from "drizzle-orm";
import {
  protectedPortalProcedure,
  portalHrProcedure,
  portalRouter,
} from "../portalTrpc";
import { getDb } from "../../db";
import {
  leaveRecords,
  leaveBalances,
  leaveTypes,
  employees,
  publicHolidays,
  payrollRuns,
  payrollItems,
} from "../../../drizzle/schema";
import {
  enforceCutoff,
  isLeavesCrossMonth,
  splitLeaveByMonth,
  getLeavePayrollMonth,
} from "../../utils/cutoff";

export const portalLeaveRouter = portalRouter({
  /**
   * List leave records — scoped to customerId via employee join
   */
  list: protectedPortalProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
        status: z.string().optional(),
        employeeId: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { items: [], total: 0 };
      const cid = ctx.portalUser.customerId;

      const conditions = [eq(employees.customerId, cid)];

      if (input.status) {
        conditions.push(eq(leaveRecords.status, input.status as any));
      }
      if (input.employeeId) {
        conditions.push(eq(leaveRecords.employeeId, input.employeeId));
      }

      const where = and(...conditions);

      const [totalResult] = await db
        .select({ count: count() })
        .from(leaveRecords)
        .innerJoin(employees, eq(leaveRecords.employeeId, employees.id))
        .where(where);

      const items = await db
        .select({
          id: leaveRecords.id,
          employeeId: leaveRecords.employeeId,
          leaveTypeId: leaveRecords.leaveTypeId,
          startDate: leaveRecords.startDate,
          endDate: leaveRecords.endDate,
          days: leaveRecords.days,
          status: leaveRecords.status,
          reason: leaveRecords.reason,
          clientApprovedBy: leaveRecords.clientApprovedBy,
          clientApprovedAt: leaveRecords.clientApprovedAt,
          clientRejectionReason: leaveRecords.clientRejectionReason,
          adminApprovedBy: leaveRecords.adminApprovedBy,
          adminApprovedAt: leaveRecords.adminApprovedAt,
          adminRejectionReason: leaveRecords.adminRejectionReason,
          createdAt: leaveRecords.createdAt,
          // Employee info
          employeeFirstName: employees.firstName,
          employeeLastName: employees.lastName,
          // Leave type info
          leaveTypeName: leaveTypes.leaveTypeName,
        })
        .from(leaveRecords)
        .innerJoin(employees, eq(leaveRecords.employeeId, employees.id))
        .leftJoin(leaveTypes, eq(leaveRecords.leaveTypeId, leaveTypes.id))
        .where(where)
        .orderBy(sql`${leaveRecords.updatedAt} DESC`)
        .limit(input.pageSize)
        .offset((input.page - 1) * input.pageSize);

      return { items, total: totalResult?.count ?? 0 };
    }),

  /**
   * Get leave balances for an employee — scoped to customerId
   */
  balances: protectedPortalProcedure
    .input(z.object({ employeeId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const cid = ctx.portalUser.customerId;

      // Verify employee belongs to this customer
      const [emp] = await db
        .select({ id: employees.id })
        .from(employees)
        .where(and(eq(employees.id, input.employeeId), eq(employees.customerId, cid)));

      if (!emp) return [];

      const balances = await db
        .select({
          id: leaveBalances.id,
          leaveTypeId: leaveBalances.leaveTypeId,
          year: leaveBalances.year,
          totalEntitlement: leaveBalances.totalEntitlement,
          used: leaveBalances.used,
          remaining: leaveBalances.remaining,
          leaveTypeName: leaveTypes.leaveTypeName,
        })
        .from(leaveBalances)
        .leftJoin(leaveTypes, eq(leaveBalances.leaveTypeId, leaveTypes.id))
        .where(eq(leaveBalances.employeeId, input.employeeId));

      return balances;
    }),

  /**
   * Submit leave record — only HR managers and admins
   *
   * Now includes:
   * - Cutoff enforcement (matching Admin behavior)
   * - Cross-month leave auto-splitting (matching Admin behavior)
   * - Business day calculation for accurate day counts
   */
  create: portalHrProcedure
    .input(
      z.object({
        employeeId: z.number(),
        leaveTypeId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
        days: z.string(),
        reason: z.string().optional(),
        isHalfDay: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const cid = ctx.portalUser.customerId;

      // CRITICAL: Verify employee belongs to this customer
      const [emp] = await db
        .select({ id: employees.id, country: employees.country })
        .from(employees)
        .where(and(eq(employees.id, input.employeeId), eq(employees.customerId, cid)));

      if (!emp) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found" });
      }

      // Enforce cutoff based on the end date's payroll month (matching Admin behavior)
      const endPayrollMonth = getLeavePayrollMonth(input.endDate);
      const endPayrollMonthNormalized = `${endPayrollMonth}-01`;
      await enforceCutoff(endPayrollMonthNormalized, "portal_hr", "create leave record");

      // Check if payroll run for the end date's month is already approved/locked
      const [existingPayroll] = await db
        .select({ id: payrollRuns.id, status: payrollRuns.status })
        .from(payrollRuns)
        .innerJoin(payrollItems, eq(payrollRuns.id, payrollItems.payrollRunId))
        .where(
          and(
            eq(payrollRuns.countryCode, emp.country),
            eq(payrollRuns.payrollMonth, endPayrollMonthNormalized),
            eq(payrollItems.employeeId, input.employeeId)
          )
        )
        .limit(1);

      if (existingPayroll && (existingPayroll.status === "approved" || existingPayroll.status === "pending_approval")) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Payroll run for ${endPayrollMonth} is already ${existingPayroll.status}. Leave requests cannot be added.`,
        });
      }

      // Half day: subtract 0.5 from total days (last day is half day)
      const actualDays = input.isHalfDay
        ? (parseFloat(input.days) - 0.5).toFixed(1)
        : input.days;

      // Cross-month leave splitting (matching Admin behavior)
      if (isLeavesCrossMonth(input.startDate, input.endDate)) {
        const splits = splitLeaveByMonth(input.startDate, input.endDate, parseFloat(actualDays));

        // Insert each split as a separate leave record
        for (const split of splits) {
          await db.insert(leaveRecords).values({
            employeeId: input.employeeId,
            leaveTypeId: input.leaveTypeId,
            startDate: split.startDate,
            endDate: split.endDate,
            days: String(split.days),
            status: "submitted",
            reason: input.reason || null,
          });
        }

        return { success: true, splits: splits.length };
      }

      // Single-month leave: insert as-is
      await db.insert(leaveRecords).values({
        employeeId: input.employeeId,
        leaveTypeId: input.leaveTypeId,
        startDate: input.startDate,
        endDate: input.endDate,
        days: actualDays,
        status: "submitted",
        reason: input.reason || null,
      });

      return { success: true };
    }),

  /**
   * Delete leave record — only if status is 'submitted'
   */
  delete: portalHrProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const cid = ctx.portalUser.customerId;

      // Verify leave record belongs to an employee of this customer
      const records = await db
        .select({
          id: leaveRecords.id,
          status: leaveRecords.status,
          endDate: leaveRecords.endDate,
        })
        .from(leaveRecords)
        .innerJoin(employees, eq(leaveRecords.employeeId, employees.id))
        .where(and(eq(leaveRecords.id, input.id), eq(employees.customerId, cid)));

      if (records.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Leave record not found" });
      }

      if (records[0].status !== "submitted") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Leave record is locked and cannot be deleted" });
      }

      // Enforce cutoff before allowing deletion
      if (records[0].endDate) {
        const payrollMonth = getLeavePayrollMonth(records[0].endDate);
        await enforceCutoff(`${payrollMonth}-01`, "portal_hr", "delete leave record");
      }

      await db.delete(leaveRecords).where(eq(leaveRecords.id, input.id));
      return { success: true };
    }),

  /**
   * Client approve leave record — HR manager / admin approves a submitted leave
   */
  approve: portalHrProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const cid = ctx.portalUser.customerId;

      const records = await db
        .select({ id: leaveRecords.id, status: leaveRecords.status })
        .from(leaveRecords)
        .innerJoin(employees, eq(leaveRecords.employeeId, employees.id))
        .where(and(eq(leaveRecords.id, input.id), eq(employees.customerId, cid)));

      if (records.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Leave record not found" });
      }

      if (records[0].status !== "submitted") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only submitted leave records can be approved" });
      }

      await db.update(leaveRecords).set({
        status: "client_approved",
        clientApprovedBy: ctx.portalUser.contactId,
        clientApprovedAt: new Date(),
      }).where(eq(leaveRecords.id, input.id));

      return { success: true };
    }),

  /**
   * Client reject leave record
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

      const records = await db
        .select({ id: leaveRecords.id, status: leaveRecords.status })
        .from(leaveRecords)
        .innerJoin(employees, eq(leaveRecords.employeeId, employees.id))
        .where(and(eq(leaveRecords.id, input.id), eq(employees.customerId, cid)));

      if (records.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Leave record not found" });
      }

      if (records[0].status !== "submitted") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only submitted leave records can be rejected" });
      }

      await db.update(leaveRecords).set({
        status: "client_rejected",
        clientApprovedBy: ctx.portalUser.contactId,
        clientApprovedAt: new Date(),
        clientRejectionReason: input.reason || null,
      }).where(eq(leaveRecords.id, input.id));

      return { success: true };
    }),

  /**
   * Get public holidays for countries where this customer has active employees
   */
  publicHolidays: protectedPortalProcedure
    .input(z.object({ year: z.number().default(2026) }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const cid = ctx.portalUser.customerId;

      // Get countries where this customer has active employees
      const activeCountries = await db
        .select({ country: employees.country })
        .from(employees)
        .where(and(eq(employees.customerId, cid), eq(employees.status, "active")))
        .groupBy(employees.country);

      if (activeCountries.length === 0) return [];

      const countryCodes = activeCountries.map((c) => c.country);

      const holidays = await db
        .select()
        .from(publicHolidays)
        .where(
          and(
            sql`${publicHolidays.countryCode} IN (${sql.join(countryCodes.map(c => sql`${c}`), sql`, `)})`,
            eq(publicHolidays.year, input.year)
          )
        )
        .orderBy(publicHolidays.holidayDate);

      return holidays;
    }),
});
