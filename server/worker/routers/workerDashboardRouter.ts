/**
 * Worker Dashboard Router
 *
 * Returns dashboard summary data based on worker type (activeRole):
 * - Contractor: pending milestones, pending invoices, total paid, recent invoices
 * - Employee: pending leave requests, pending reimbursements, latest payslip, total documents
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
  employeeDocuments,
} from "../../../drizzle/schema";
import { eq, and, sql, desc, count, inArray } from "drizzle-orm";

export const workerDashboardRouter = workerRouter({
  /**
   * Get dashboard summary — returns different data based on activeRole
   */
  getSummary: protectedWorkerProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const { workerUser } = ctx;
    // Use activeRole (which is also aliased as workerType)
    const role = workerUser.activeRole || workerUser.workerType;

    if (role === "contractor" && workerUser.contractorId) {
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
    } else if (role === "employee" && workerUser.employeeId) {
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

      // Latest payslip — check employee_payslips table first (published ones)
      let latestPayslip: {
        id: number;
        payPeriod: string;
        payDate: string | null;
        netAmount: string | null;
        grossAmount: string | null;
        currency: string | null;
        source: "payslip" | "document";
      } | null = null;

      const payslipRecords = await db
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

      if (payslipRecords.length > 0) {
        const ps = payslipRecords[0];
        latestPayslip = { ...ps, source: "payslip" };
      }

      // If no payslip record found, check employee_documents with documentType = "payslip"
      if (!latestPayslip) {
        const payslipDocs = await db
          .select({
            id: employeeDocuments.id,
            documentName: employeeDocuments.documentName,
            fileUrl: employeeDocuments.fileUrl,
            uploadedAt: employeeDocuments.uploadedAt,
          })
          .from(employeeDocuments)
          .where(
            and(
              eq(employeeDocuments.employeeId, workerUser.employeeId),
              eq(employeeDocuments.documentType, "payslip")
            )
          )
          .orderBy(desc(employeeDocuments.uploadedAt))
          .limit(1);

        if (payslipDocs.length > 0) {
          const doc = payslipDocs[0];
          latestPayslip = {
            id: doc.id,
            payPeriod: doc.documentName || "Payslip",
            payDate: doc.uploadedAt ? new Date(doc.uploadedAt).toISOString().slice(0, 10) : null,
            netAmount: null,
            grossAmount: null,
            currency: workerUser.currency,
            source: "document",
          };
        }
      }

      // Count total payslip documents (for display)
      const [payslipDocCount] = await db
        .select({ count: count() })
        .from(employeeDocuments)
        .where(
          and(
            eq(employeeDocuments.employeeId, workerUser.employeeId),
            eq(employeeDocuments.documentType, "payslip")
          )
        );

      const [payslipRecordCount] = await db
        .select({ count: count() })
        .from(employeePayslips)
        .where(
          and(
            eq(employeePayslips.employeeId, workerUser.employeeId),
            eq(employeePayslips.isPublished, true)
          )
        );

      return {
        workerType: "employee" as const,
        pendingLeave: pendingLeave?.count ?? 0,
        pendingReimbursements: pendingReimbursements?.count ?? 0,
        latestPayslip,
        totalPayslips: (payslipDocCount?.count ?? 0) + (payslipRecordCount?.count ?? 0),
      };
    }

    // Fallback for edge cases — return empty data matching the role
    if (role === "employee") {
      return {
        workerType: "employee" as const,
        pendingLeave: 0,
        pendingReimbursements: 0,
        latestPayslip: null,
        totalPayslips: 0,
      };
    }

    return {
      workerType: "contractor" as const,
      pendingMilestones: 0,
      pendingInvoices: 0,
      totalPaid: "0",
      recentInvoices: [],
    };
  }),
});
