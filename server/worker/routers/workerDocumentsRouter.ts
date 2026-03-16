/**
 * Worker Documents Router
 *
 * Both Employee and Contractor: view documents and contracts uploaded by Admin/Client.
 *
 * - Employee: reads from employee_documents + employee_contracts
 * - Contractor: reads from contractor_documents + contractor_contracts
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  workerRouter,
  protectedWorkerProcedure,
} from "../workerTrpc";
import { getDb } from "../../services/db/connection";
import {
  employeeDocuments,
  employeeContracts,
  contractorDocuments,
  contractorContracts,
} from "../../../drizzle/schema";
import { eq, and, ne, desc } from "drizzle-orm";

export const workerDocumentsRouter = workerRouter({
  /**
   * List my documents — returns different data based on workerType
   */
  listDocuments: protectedWorkerProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const { workerUser } = ctx;

    if (workerUser.workerType === "employee" && workerUser.employeeId) {
      // Exclude payslip documents — they are shown in the dedicated Payslips page
      const docs = await db
        .select({
          id: employeeDocuments.id,
          documentType: employeeDocuments.documentType,
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
            eq(employeeDocuments.employeeId, workerUser.employeeId),
            ne(employeeDocuments.documentType, "payslip")
          )
        )
        .orderBy(desc(employeeDocuments.uploadedAt));

      return { workerType: "employee" as const, documents: docs };
    } else if (workerUser.workerType === "contractor" && workerUser.contractorId) {
      const docs = await db
        .select({
          id: contractorDocuments.id,
          documentType: contractorDocuments.documentType,
          documentName: contractorDocuments.documentName,
          fileUrl: contractorDocuments.fileUrl,
          mimeType: contractorDocuments.mimeType,
          fileSize: contractorDocuments.fileSize,
          notes: contractorDocuments.notes,
          uploadedAt: contractorDocuments.uploadedAt,
        })
        .from(contractorDocuments)
        .where(eq(contractorDocuments.contractorId, workerUser.contractorId))
        .orderBy(desc(contractorDocuments.uploadedAt));

      return { workerType: "contractor" as const, documents: docs };
    }

    return { workerType: workerUser.workerType, documents: [] };
  }),

  /**
   * List my contracts — returns different data based on workerType
   */
  listContracts: protectedWorkerProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const { workerUser } = ctx;

    if (workerUser.workerType === "employee" && workerUser.employeeId) {
      const contracts = await db
        .select({
          id: employeeContracts.id,
          contractType: employeeContracts.contractType,
          fileUrl: employeeContracts.fileUrl,
          signedDate: employeeContracts.signedDate,
          effectiveDate: employeeContracts.effectiveDate,
          expiryDate: employeeContracts.expiryDate,
          status: employeeContracts.status,
          createdAt: employeeContracts.createdAt,
        })
        .from(employeeContracts)
        .where(eq(employeeContracts.employeeId, workerUser.employeeId))
        .orderBy(desc(employeeContracts.createdAt));

      return { workerType: "employee" as const, contracts };
    } else if (workerUser.workerType === "contractor" && workerUser.contractorId) {
      const contracts = await db
        .select({
          id: contractorContracts.id,
          contractType: contractorContracts.contractType,
          fileUrl: contractorContracts.fileUrl,
          signedDate: contractorContracts.signedDate,
          effectiveDate: contractorContracts.effectiveDate,
          expiryDate: contractorContracts.expiryDate,
          status: contractorContracts.status,
          createdAt: contractorContracts.createdAt,
        })
        .from(contractorContracts)
        .where(eq(contractorContracts.contractorId, workerUser.contractorId))
        .orderBy(desc(contractorContracts.createdAt));

      return { workerType: "contractor" as const, contracts };
    }

    return { workerType: workerUser.workerType, contracts: [] };
  }),
});
