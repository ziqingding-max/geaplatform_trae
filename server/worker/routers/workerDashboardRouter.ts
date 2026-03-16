/**
 * Worker Dashboard Router
 *
 * Returns dashboard summary data based on worker type:
 * - Contractor: pending milestones, pending invoices, total paid
 * - Employee: pending leave requests, pending reimbursements, latest payslip
 */

import { workerRouter, protectedWorkerProcedure } from "../workerTrpc";
import { getDb } from "../../services/db/connection";
import { TRPCError } from "@trpc/server";
import {
  contractorInvoices,
  contractorMilestones,
  reimbursements,
  leaveRecords,
  employeePayslips,
} from "../../../drizzle/schema";
import { eq, and, sql, desc, count, inArray } from "drizzle-orm";

export const workerDashboardRouter = workerRouter({
  /**
   * Get dashboard summary — returns different data based on workerType
   */
  getSummary: protectedWorkerProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const { workerUser } = ctx;

    if (workerUser.workerType === "contractor" && workerUser.contractorId) {
      // Pending milestones (status = pending or submitted)
      const [pendingMilestones] = await db
        .select({ count: count() })
        .from(contractorMilestones)
        .where(
          and(
            eq(contractorMilestones.contractorId, workerUser.contractorId),
            inArray(contractorMilestones.status, ["pending", "submitted"])
          )
        );

      // Pending invoices (status = pending_approval)
      const [pendingInvoices] = await db
        .select({ count: count() })
        .from(contractorInvoices)
        .where(
          and(
            eq(contractorInvoices.contractorId, workerUser.contractorId),
            eq(contractorInvoices.status, "pending_approval")
          )
        );

      // Total paid amount
      const [totalPaid] = await db
        .select({ total: sql<string>`COALESCE(SUM(CAST(${contractorInvoices.totalAmount} AS REAL)), 0)` })
        .from(contractorInvoices)
        .where(
          and(
            eq(contractorInvoices.contractorId, workerUser.contractorId),
            eq(contractorInvoices.status, "paid")
          )
        );

      // Recent invoices (last 5)
      const recentInvoices = await db
        .select({
          id: contractorInvoices.id,
          invoiceNumber: contractorInvoices.invoiceNumber,
          totalAmount: contractorInvoices.totalAmount,
          currency: contractorInvoices.currency,
          status: contractorInvoices.status,
          invoiceDate: contractorInvoices.invoiceDate,
        })
        .from(contractorInvoices)
        .where(eq(contractorInvoices.contractorId, workerUser.contractorId))
        .orderBy(desc(contractorInvoices.createdAt))
        .limit(5);

      return {
        workerType: "contractor" as const,
        pendingMilestones: pendingMilestones?.count ?? 0,
        pendingInvoices: pendingInvoices?.count ?? 0,
        totalPaid: totalPaid?.total ?? "0",
        recentInvoices,
      };
    } else if (workerUser.workerType === "employee" && workerUser.employeeId) {
      // Pending leave requests (status = submitted)
      const [pendingLeave] = await db
        .select({ count: count() })
        .from(leaveRecords)
        .where(
          and(
            eq(leaveRecords.employeeId, workerUser.employeeId),
            eq(leaveRecords.status, "submitted")
          )
        );

      // Pending reimbursements (status = submitted)
      const [pendingReimbursements] = await db
        .select({ count: count() })
        .from(reimbursements)
        .where(
          and(
            eq(reimbursements.employeeId, workerUser.employeeId),
            eq(reimbursements.status, "submitted")
          )
        );

      // Latest payslip
      const latestPayslip = await db
        .select({
          id: employeePayslips.id,
          payPeriod: employeePayslips.payPeriod,
          payDate: employeePayslips.payDate,
          netAmount: employeePayslips.netAmount,
          grossAmount: employeePayslips.grossAmount,
          currency: employeePayslips.currency,
        })
        .from(employeePayslips)
        .where(
          and(
            eq(employeePayslips.employeeId, workerUser.employeeId),
            eq(employeePayslips.isPublished, true)
          )
        )
        .orderBy(desc(employeePayslips.payPeriod))
        .limit(1);

      return {
        workerType: "employee" as const,
        pendingLeave: pendingLeave?.count ?? 0,
        pendingReimbursements: pendingReimbursements?.count ?? 0,
        latestPayslip: latestPayslip[0] ?? null,
      };
    }

    // Fallback for edge cases
    return {
      workerType: workerUser.workerType,
      pendingMilestones: 0,
      pendingInvoices: 0,
      totalPaid: "0",
      recentInvoices: [],
    };
  }),
});
