/**
 * Worker Payslips Router
 *
 * Employee-only: view and download payslips uploaded by Admin.
 *
 * Workflow:
 * 1. Admin uploads payslip PDF for employee and publishes it
 * 2. Employee sees published payslips in Worker Portal
 * 3. Employee can download the PDF file
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  workerRouter,
  employeeOnlyProcedure,
} from "../workerTrpc";
import { getDb } from "../../services/db/connection";
import { employeePayslips } from "../../../drizzle/schema";
import { eq, and, desc, count } from "drizzle-orm";

export const workerPayslipsRouter = workerRouter({
  /**
   * List my payslips (only published ones) with pagination
   */
  list: employeeOnlyProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const employeeId = ctx.workerUser.employeeId!;
      const offset = (input.page - 1) * input.pageSize;

      const whereCondition = and(
        eq(employeePayslips.employeeId, employeeId),
        eq(employeePayslips.isPublished, true)
      );

      const [totalResult] = await db
        .select({ count: count() })
        .from(employeePayslips)
        .where(whereCondition);

      const items = await db
        .select({
          id: employeePayslips.id,
          payPeriod: employeePayslips.payPeriod,
          payDate: employeePayslips.payDate,
          fileName: employeePayslips.fileName,
          fileUrl: employeePayslips.fileUrl,
          currency: employeePayslips.currency,
          grossAmount: employeePayslips.grossAmount,
          netAmount: employeePayslips.netAmount,
          publishedAt: employeePayslips.publishedAt,
        })
        .from(employeePayslips)
        .where(whereCondition)
        .limit(input.pageSize)
        .offset(offset)
        .orderBy(desc(employeePayslips.payPeriod));

      return {
        items,
        total: totalResult?.count ?? 0,
        page: input.page,
        pageSize: input.pageSize,
      };
    }),

  /**
   * Get a single payslip detail (for download)
   */
  getById: employeeOnlyProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const employeeId = ctx.workerUser.employeeId!;

      const [payslip] = await db
        .select()
        .from(employeePayslips)
        .where(
          and(
            eq(employeePayslips.id, input.id),
            eq(employeePayslips.employeeId, employeeId),
            eq(employeePayslips.isPublished, true)
          )
        );

      if (!payslip) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Payslip not found" });
      }

      return payslip;
    }),
});
