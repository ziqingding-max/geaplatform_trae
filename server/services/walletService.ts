import { eq, sql, and } from "drizzle-orm";
import { getDb } from "./db/connection";
import {
  customerWallets,
  walletTransactions,
  customerFrozenWallets,
  frozenWalletTransactions,
  type WalletTransaction,
  type CustomerWallet,
  type FrozenWalletTransaction,
} from "../../drizzle/schema";
import { TRPCError } from "@trpc/server";

export type WalletTransactionType = WalletTransaction["type"];
export type FrozenWalletTransactionType = FrozenWalletTransaction["type"];

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

  // ── Frozen Wallet Methods ─────────────────────────────────────────────

  /**
   * Get or create a frozen wallet for a customer and currency
   */
  async getFrozenWallet(customerId: number, currency: string) {
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    const existing = await db.query.customerFrozenWallets.findFirst({
      where: (t, { and, eq }) => and(eq(t.customerId, customerId), eq(t.currency, currency)),
    });

    if (existing) return existing;

    // Create new frozen wallet if not exists
    const [inserted] = await db
      .insert(customerFrozenWallets)
      .values({
        customerId,
        currency,
        balance: "0",
        version: 1,
      })
      .onConflictDoUpdate({
        target: [customerFrozenWallets.customerId, customerFrozenWallets.currency],
        set: { updatedAt: new Date() },
      })
      .returning();

    return inserted;
  }

  /**
   * Execute a frozen wallet transaction with optimistic locking
   */
  async frozenTransact(params: {
    walletId: number;
    type: FrozenWalletTransactionType;
    amount: string; // Always positive
    direction: "credit" | "debit";
    referenceId: number;
    referenceType: FrozenWalletTransaction["referenceType"];
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
      const wallet = await tx.query.customerFrozenWallets.findFirst({
        where: eq(customerFrozenWallets.id, params.walletId),
      });

      if (!wallet) throw new Error(`Frozen Wallet ${params.walletId} not found`);

      const currentBalance = parseFloat(wallet.balance);
      let newBalance = currentBalance;

      if (params.direction === "credit") {
        newBalance += amountNum;
      } else {
        newBalance -= amountNum;
        if (newBalance < 0) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: `Insufficient frozen wallet balance. Current: ${currentBalance}, Required: ${amountNum}`,
          });
        }
      }

      // 2. Update wallet balance with optimistic locking
      const result = await tx
        .update(customerFrozenWallets)
        .set({
          balance: newBalance.toFixed(2),
          version: wallet.version + 1,
        })
        .where(
          and(eq(customerFrozenWallets.id, params.walletId), eq(customerFrozenWallets.version, wallet.version))
        );

      if (result.rowsAffected === 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Frozen Wallet balance was updated concurrently. Please try again.",
        });
      }

      // 3. Record transaction
      const [transaction] = await tx
        .insert(frozenWalletTransactions)
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
   * Deposit funds into frozen wallet (e.g. from paid deposit invoice)
   */
  async depositToFrozen(customerId: number, currency: string, amount: string, invoiceId: number, createdBy?: number) {
    const wallet = await this.getFrozenWallet(customerId, currency);
    return await this.frozenTransact({
      walletId: wallet.id,
      type: "deposit_in",
      amount,
      direction: "credit",
      referenceId: invoiceId,
      referenceType: "invoice",
      description: `Deposit received from Invoice #${invoiceId}`,
      createdBy,
    });
  }

  /**
   * Release funds from frozen wallet to main wallet (e.g. after employee termination)
   */
  async releaseFrozenToMain(customerId: number, currency: string, amount: string, reason: string, createdBy?: number) {
    const frozenWallet = await this.getFrozenWallet(customerId, currency);
    const mainWallet = await this.getWallet(customerId, currency);

    // We can't use db.transaction across 'this.transact' because they might create their own transactions
    // But Drizzle supports nested transactions (savepoints).
    // However, my `transact` method creates a new transaction `db.transaction(...)`.
    // Nesting them works fine in SQLite/Postgres/MySQL with Drizzle.
    
    const db = getDb();
    if (!db) throw new Error("Database not initialized");

    return await db.transaction(async (tx) => {
        // 1. Debit Frozen Wallet
        await this.frozenTransact({
            walletId: frozenWallet.id,
            type: "deposit_release",
            amount,
            direction: "debit",
            referenceId: 0, // Manual
            referenceType: "manual",
            description: `Deposit release: ${reason}`,
            createdBy
        });

        // 2. Credit Main Wallet
        await this.transact({
            walletId: mainWallet.id,
            type: "manual_adjustment",
            amount,
            direction: "credit",
            referenceId: 0, 
            referenceType: "manual",
            description: `Deposit released from frozen wallet: ${reason}`,
            createdBy
        });
    });
  }
}

export const walletService = new WalletService();
