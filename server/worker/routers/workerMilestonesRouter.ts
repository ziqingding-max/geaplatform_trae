/**
 * Worker Milestones Router
 *
 * Handles viewing milestones.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  workerRouter,
  protectedWorkerProcedure,
} from "../workerTrpc";
import { getDb } from "../../services/db/connection";
import { contractorMilestones } from "../../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const workerMilestonesRouter = workerRouter({
  /**
   * List my milestones
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
      
      const items = await db
        .select()
        .from(contractorMilestones)
        .where(eq(contractorMilestones.contractorId, ctx.workerUser.contractorId))
        .limit(input.pageSize)
        .offset(offset)
        .orderBy(desc(contractorMilestones.createdAt));

      return {
        items,
        total: 0, // TODO: Implement count query
      };
    }),
});
