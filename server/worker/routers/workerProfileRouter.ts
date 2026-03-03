/**
 * Worker Profile Router
 *
 * Handles viewing and updating worker profile.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  workerRouter,
  protectedWorkerProcedure,
} from "../workerTrpc";
import { getDb } from "../../services/db/connection";
import { contractors, workerUsers } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";

export const workerProfileRouter = workerRouter({
  /**
   * Get my profile
   */
  me: protectedWorkerProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    if (!ctx.workerUser.contractorId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No contractor profile linked to this user",
      });
    }

    const [contractor] = await db
      .select()
      .from(contractors)
      .where(eq(contractors.id, ctx.workerUser.contractorId));

    if (!contractor) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Contractor profile not found",
      });
    }

    return contractor;
  }),

  /**
   * Update my profile (limited fields)
   */
  update: protectedWorkerProcedure
    .input(
      z.object({
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        bankDetails: z.any().optional(), // TODO: Validate JSON structure
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      if (!ctx.workerUser.contractorId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No contractor profile linked to this user",
        });
      }

      await db
        .update(contractors)
        .set(input)
        .where(eq(contractors.id, ctx.workerUser.contractorId));

      return { success: true };
    }),
});
