import { z } from "zod";
import { portalRouter, protectedPortalProcedure } from "../portalTrpc";
import { walletService } from "../../services/walletService";
import { getDb } from "../../db";
import { walletTransactions, invoices } from "../../../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";
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

      // Bug 4&5 fix: Join with invoices table to get invoiceNumber for display
      const txs = await db.query.walletTransactions.findMany({
        where: eq(walletTransactions.walletId, wallet.id),
        orderBy: [desc(walletTransactions.createdAt)],
        limit: input.limit,
        offset: input.offset,
      });

      // Enrich transactions with invoiceNumber when referenceType is "invoice"
      const invoiceRefIds = txs
        .filter((tx: any) => tx.referenceType === "invoice" && tx.referenceId)
        .map((tx: any) => tx.referenceId);

      let invoiceNumberMap: Record<number, string> = {};
      if (invoiceRefIds.length > 0) {
        const invRows = await db
          .select({ id: invoices.id, invoiceNumber: invoices.invoiceNumber })
          .from(invoices)
          .where(sql`${invoices.id} IN (${sql.join(invoiceRefIds.map((id: number) => sql`${id}`), sql`, `)})`);

        for (const row of invRows) {
          invoiceNumberMap[row.id] = row.invoiceNumber;
        }
      }

      return txs.map((tx: any) => ({
        ...tx,
        // Replace internal referenceId display with human-readable invoiceNumber
        invoiceNumber: tx.referenceType === "invoice" && tx.referenceId
          ? invoiceNumberMap[tx.referenceId] || null
          : null,
      }));
    }),
});
