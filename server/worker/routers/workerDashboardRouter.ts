/**
 * Worker Dashboard Router
 *
 * Provides dashboard stats.
 */

import { TRPCError } from "@trpc/server";
import {
  workerRouter,
  protectedWorkerProcedure,
} from "../workerTrpc";
import { getDb } from "../../services/db/connection";
import { contractorInvoices, contractorMilestones } from "../../../drizzle/schema";
import { eq, count, and } from "drizzle-orm";

export const workerDashboardRouter = workerRouter({
  /**
   * Get dashboard stats
   */
  stats: protectedWorkerProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { pendingInvoices: 0, pendingMilestones: 0, totalPaid: 0 };

    if (!ctx.workerUser.contractorId) {
      return { pendingInvoices: 0, pendingMilestones: 0, totalPaid: 0 };
    }

    const [pendingInvoices] = await db
      .select({ count: count() })
      .from(contractorInvoices)
      .where(and(eq(contractorInvoices.contractorId, ctx.workerUser.contractorId), eq(contractorInvoices.status, "pending_approval")));

    const [pendingMilestones] = await db
      .select({ count: count() })
      .from(contractorMilestones)
      .where(and(eq(contractorMilestones.contractorId, ctx.workerUser.contractorId), eq(contractorMilestones.status, "pending")));

    return {
      pendingInvoices: pendingInvoices?.count || 0,
      pendingMilestones: pendingMilestones?.count || 0,
      totalPaid: 0, // TODO: Calculate sum of paid invoices
    };
  }),
});
