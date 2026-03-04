import { z } from "zod";
import { portalRouter, protectedPortalProcedure } from "../portalTrpc";
import { walletService } from "../../services/walletService";
import { getDb } from "../../db";
import { walletTransactions } from "../../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const portalWalletRouter = portalRouter({
  get: protectedPortalProcedure
    .input(z.object({
      currency: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      // Security: Always use ctx.portalUser.customerId
      return await walletService.getWallet(ctx.portalUser.customerId, input.currency);
    }),

  listTransactions: protectedPortalProcedure
    .input(z.object({
      currency: z.string(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not initialized" });

      const wallet = await walletService.getWallet(ctx.portalUser.customerId, input.currency);

      return await db.query.walletTransactions.findMany({
        where: eq(walletTransactions.walletId, wallet.id),
        orderBy: [desc(walletTransactions.createdAt)],
        limit: input.limit,
        offset: input.offset,
      });
    }),
});
