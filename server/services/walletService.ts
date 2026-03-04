import { eq, sql, and } from "drizzle-orm";
import { getDb } from "./db/connection";
import { customerWallets, walletTransactions, type WalletTransaction, type CustomerWallet } from "../../drizzle/schema";
import { TRPCError } from "@trpc/server";

export type WalletTransactionType = WalletTransaction["type"];

export class WalletService {
  /**
   * Get or create a wallet for a customer and currency
   */
  async getWallet(customerId: number, currency: string) {
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const existing = await db.query.customerWallets.findFirst({
      where: (t, { and, eq }) => and(eq(t.customerId, customerId), eq(t.currency, currency)),
    });

    if (existing) return existing;

    // Create new wallet if not exists
    // Use upsert to handle race conditions during creation
    const [inserted] = await db
      .insert(customerWallets)
      .values({
        customerId,
        currency,
        balance: "0",
        version: 1,
      })
      .onConflictDoUpdate({
        target: [customerWallets.customerId, customerWallets.currency],
        set: { updatedAt: new Date() }, // Dummy update to return existing
      })
      .returning();

    return inserted;
  }

  /**
   * Execute a wallet transaction with optimistic locking
   */
  async transact(params: {
    walletId: number;
    type: WalletTransactionType;
    amount: string; // Always positive
    direction: "credit" | "debit";
    referenceId: number;
    referenceType: WalletTransaction["referenceType"];
    description?: string;
    internalNote?: string;
    createdBy?: number;
  }) {
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const amountNum = parseFloat(params.amount);
    if (amountNum <= 0) throw new Error("Transaction amount must be positive");

    return await db.transaction(async (tx) => {
      // 1. Get current wallet state with lock
      const wallet = await tx.query.customerWallets.findFirst({
        where: eq(customerWallets.id, params.walletId),
      });

      if (!wallet) throw new Error(`Wallet ${params.walletId} not found`);

      const currentBalance = parseFloat(wallet.balance);
      let newBalance = currentBalance;

      if (params.direction === "credit") {
        newBalance += amountNum;
      } else {
        newBalance -= amountNum;
        // Prevent negative balance (strict mode)
        if (newBalance < 0) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: `Insufficient wallet balance. Current: ${currentBalance}, Required: ${amountNum}`,
          });
        }
      }

      // 2. Update wallet balance with optimistic locking
      const result = await tx
        .update(customerWallets)
        .set({
          balance: newBalance.toFixed(2),
          version: wallet.version + 1,
        })
        .where(
          // Ensure version hasn't changed since read
          and(eq(customerWallets.id, params.walletId), eq(customerWallets.version, wallet.version))
        );

      if (result.rowsAffected === 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Wallet balance was updated concurrently. Please try again.",
        });
      }

      // 3. Record transaction
      const [transaction] = await tx
        .insert(walletTransactions)
        .values({
          walletId: params.walletId,
          type: params.type,
          amount: params.amount,
          direction: params.direction,
          balanceBefore: currentBalance.toFixed(2),
          balanceAfter: newBalance.toFixed(2),
          referenceId: params.referenceId,
          referenceType: params.referenceType,
          description: params.description,
          internalNote: params.internalNote,
          createdBy: params.createdBy,
        })
        .returning();

      return { wallet: { ...wallet, balance: newBalance.toFixed(2) }, transaction };
    });
  }

  /**
   * Auto-deduct from wallet for an invoice
   * Returns the amount deducted
   */
  async attemptAutoDeduction(invoiceId: number, customerId: number, currency: string, totalAmount: string) {
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const wallet = await this.getWallet(customerId, currency);
    const balance = parseFloat(wallet.balance);
    const total = parseFloat(totalAmount);

    if (balance <= 0) return "0";

    // Calculate deduction amount: min(balance, invoiceTotal)
    const deductionAmount = Math.min(balance, total).toFixed(2);

    if (parseFloat(deductionAmount) > 0) {
      await this.transact({
        walletId: wallet.id,
        type: "invoice_deduction",
        amount: deductionAmount,
        direction: "debit",
        referenceId: invoiceId,
        referenceType: "invoice",
        description: `Auto-deduction for Invoice #${invoiceId}`,
      });
    }

    return deductionAmount;
  }

  /**
   * Refund a deduction (e.g. when invoice is rejected)
   */
  async refundDeduction(invoiceId: number, customerId: number, currency: string, amount: string) {
    if (parseFloat(amount) <= 0) return;

    const wallet = await this.getWallet(customerId, currency);

    await this.transact({
      walletId: wallet.id,
      type: "invoice_refund",
      amount: amount,
      direction: "credit",
      referenceId: invoiceId,
      referenceType: "invoice",
      description: `Refund for rejected/voided Invoice #${invoiceId}`,
    });
  }
}

export const walletService = new WalletService();
