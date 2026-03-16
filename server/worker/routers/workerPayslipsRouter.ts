/**
 * Worker Payslips Router
 *
 * Employee-only: view and download payslips.
 *
 * Data sources:
 * 1. employee_payslips table — dedicated payslip records with structured data (published only)
 * 2. employee_documents table — documents uploaded by Admin with documentType = "payslip"
 *
 * Both sources are merged and displayed together in the Worker Portal.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  workerRouter,
  employeeOnlyProcedure,
} from "../workerTrpc";
import { getDb } from "../../services/db/connection";
import { employeePayslips, employeeDocuments } from "../../../drizzle/schema";
import { eq, and, desc, count } from "drizzle-orm";

// Unified payslip item shape returned to frontend
interface PayslipItem {
  id: number;
  source: "payslip" | "document"; // Distinguish the data source
  payPeriod: string;
  payDate: string | null;
  fileName: string | null;
  fileUrl: string;
  currency: string | null;
  grossAmount: string | null;
  netAmount: string | null;
  publishedAt: Date | null;
  notes: string | null;
}

export const workerPayslipsRouter = workerRouter({
  /**
   * List my payslips (merged from employee_payslips + employee_documents) with pagination
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

      // Source 1: employee_payslips (published only)
      const payslipRecords = await db
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
          notes: employeePayslips.notes,
        })
        .from(employeePayslips)
        .where(
          and(
            eq(employeePayslips.employeeId, employeeId),
            eq(employeePayslips.isPublished, true)
          )
        )
        .orderBy(desc(employeePayslips.payPeriod));

      // Source 2: employee_documents with documentType = "payslip"
      const payslipDocs = await db
        .select({
          id: employeeDocuments.id,
          documentName: employeeDocuments.documentName,
          fileUrl: employeeDocuments.fileUrl,
          mimeType: employeeDocuments.mimeType,
          fileSize: employeeDocuments.fileSize,
          notes: employeeDocuments.notes,
          uploadedAt: employeeDocuments.uploadedAt,
        })
        .from(employeeDocuments)
        .where(
          and(
            eq(employeeDocuments.employeeId, employeeId),
            eq(employeeDocuments.documentType, "payslip")
          )
        )
        .orderBy(desc(employeeDocuments.uploadedAt));

      // Merge both sources into unified format
      const allItems: PayslipItem[] = [];

      for (const ps of payslipRecords) {
        allItems.push({
          id: ps.id,
          source: "payslip",
          payPeriod: ps.payPeriod,
          payDate: ps.payDate,
          fileName: ps.fileName,
          fileUrl: ps.fileUrl,
          currency: ps.currency,
          grossAmount: ps.grossAmount,
          netAmount: ps.netAmount,
          publishedAt: ps.publishedAt,
          notes: ps.notes,
        });
      }

      for (const doc of payslipDocs) {
        allItems.push({
          id: doc.id,
          source: "document",
          payPeriod: doc.documentName || "Payslip",
          payDate: doc.uploadedAt ? new Date(doc.uploadedAt).toISOString().slice(0, 10) : null,
          fileName: doc.documentName,
          fileUrl: doc.fileUrl,
          currency: ctx.workerUser.currency || null,
          grossAmount: null,
          netAmount: null,
          publishedAt: doc.uploadedAt,
          notes: doc.notes,
        });
      }

      // Sort by publishedAt/payPeriod descending
      allItems.sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        if (dateA !== dateB) return dateB - dateA;
        return b.payPeriod.localeCompare(a.payPeriod);
      });

      // Paginate
      const total = allItems.length;
      const offset = (input.page - 1) * input.pageSize;
      const items = allItems.slice(offset, offset + input.pageSize);

      return {
        items,
        total,
        page: input.page,
        pageSize: input.pageSize,
      };
    }),

  /**
   * Get a single payslip detail (for download)
   * Supports both employee_payslips and employee_documents sources
   */
  getById: employeeOnlyProcedure
    .input(z.object({
      id: z.number(),
      source: z.enum(["payslip", "document"]).default("payslip"),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const employeeId = ctx.workerUser.employeeId!;

      if (input.source === "payslip") {
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

        return {
          ...payslip,
          source: "payslip" as const,
        };
      } else {
        // Source: employee_documents
        const [doc] = await db
          .select()
          .from(employeeDocuments)
          .where(
            and(
              eq(employeeDocuments.id, input.id),
              eq(employeeDocuments.employeeId, employeeId),
              eq(employeeDocuments.documentType, "payslip")
            )
          );

        if (!doc) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Payslip document not found" });
        }

        return {
          id: doc.id,
          source: "document" as const,
          payPeriod: doc.documentName || "Payslip",
          payDate: doc.uploadedAt ? new Date(doc.uploadedAt).toISOString().slice(0, 10) : null,
          fileName: doc.documentName,
          fileUrl: doc.fileUrl,
          fileKey: doc.fileKey,
          mimeType: doc.mimeType,
          currency: ctx.workerUser.currency || null,
          grossAmount: null,
          netAmount: null,
          notes: doc.notes,
          publishedAt: doc.uploadedAt,
          isPublished: true,
          employeeId: doc.employeeId,
        };
      }
    }),
});
