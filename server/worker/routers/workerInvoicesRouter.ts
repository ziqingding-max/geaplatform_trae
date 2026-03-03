/**
 * Worker Invoices Router
 *
 * Handles viewing invoices.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  workerRouter,
  protectedWorkerProcedure,
} from "../workerTrpc";
import { getDb } from "../../services/db/connection";
import { contractorInvoices } from "../../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const workerInvoicesRouter = workerRouter({
  /**
   * List my invoices
   */
  list: protectedWorkerProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
        status: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { items: [], total: 0 };

      if (!ctx.workerUser.contractorId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No contractor profile linked to this user",
        });
      }

      const offset = (input.page - 1) * input.pageSize;
      
      const conditions = [eq(contractorInvoices.contractorId, ctx.workerUser.contractorId)];
      if (input.status) {
        conditions.push(eq(contractorInvoices.status, input.status as any));
      }

      // TODO: Implement count and filtering properly
      const items = await db
        .select()
        .from(contractorInvoices)
        .where(eq(contractorInvoices.contractorId, ctx.workerUser.contractorId))
        .limit(input.pageSize)
        .offset(offset)
        .orderBy(desc(contractorInvoices.createdAt));

      return {
        items,
        total: 0, // TODO: Implement count query
      };
    }),
});
