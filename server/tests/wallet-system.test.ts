import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { walletService } from "./services/walletService";
import { customers, invoices, customerWallets, walletTransactions } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { createCaller } from "./_core/trpc"; // Assuming you have a helper for this

describe("Wallet System Integration", () => {
  let testCustomerId: number;
  let walletId: number;
  let invoiceId: number;

  const mockCtx = {
    user: { id: 1, name: "Test Admin", role: "admin" },
    req: {} as any,
    res: {} as any,
  };

  const caller = appRouter.createCaller(mockCtx);

  beforeAll(async () => {
    const db = getDb();
    if (!db) return;

    // Create test customer
    const [customer] = await db.insert(customers).values({
      companyName: "Wallet Test Corp",
      country: "USA",
      status: "active",
    }).returning();
    testCustomerId = customer.id;

    // Initialize wallet via service
    const wallet = await walletService.getWallet(testCustomerId, "USD");
    walletId = wallet.id;
  });

  afterAll(async () => {
    const db = getDb();
    if (!db) return;
    // Cleanup
    await db.delete(walletTransactions).where(eq(walletTransactions.walletId, walletId));
    await db.delete(customerWallets).where(eq(customerWallets.id, walletId));
    await db.delete(invoices).where(eq(invoices.customerId, testCustomerId));
    await db.delete(customers).where(eq(customers.id, testCustomerId));
  });

  it("should initialize wallet with 0 balance", async () => {
    const wallet = await caller.wallet.get({ customerId: testCustomerId, currency: "USD" });
    expect(wallet).toBeDefined();
    expect(wallet.balance).toBe("0");
  });

  it("should allow manual credit adjustment (Top-up)", async () => {
    await caller.wallet.manualAdjustment({
      customerId: testCustomerId,
      currency: "USD",
      amount: "1000.00",
      direction: "credit",
      description: "Test Deposit",
    });

    const wallet = await caller.wallet.get({ customerId: testCustomerId, currency: "USD" });
    expect(wallet.balance).toBe("1000.00");
  });

  it("should auto-deduct when invoice moves to pending_review", async () => {
    // Create Draft Invoice
    const result = await caller.invoices.create({
      customerId: testCustomerId,
      invoiceType: "monthly_eor",
      currency: "USD",
      subtotal: "500.00",
      total: "500.00",
      status: "draft",
    });
    invoiceId = (result as any).insertId || (result as any)[0].insertId;

    // Move to Pending Review
    await caller.invoices.updateStatus({
      id: invoiceId,
      status: "pending_review",
    });

    // Check Wallet Deduction
    const wallet = await caller.wallet.get({ customerId: testCustomerId, currency: "USD" });
    expect(wallet.balance).toBe("500.00"); // 1000 - 500

    // Check Invoice Fields
    const invoice = await caller.invoices.get({ id: invoiceId });
    expect(invoice?.walletAppliedAmount).toBe("500.00");
    expect(invoice?.amountDue).toBe("0.00");
  });

  it("should refund wallet when invoice is rejected (pending -> draft)", async () => {
    // Reject Invoice
    await caller.invoices.updateStatus({
      id: invoiceId,
      status: "draft",
    });

    // Check Wallet Refund
    const wallet = await caller.wallet.get({ customerId: testCustomerId, currency: "USD" });
    expect(wallet.balance).toBe("1000.00"); // Back to 1000

    // Check Invoice Reset
    const invoice = await caller.invoices.get({ id: invoiceId });
    expect(invoice?.walletAppliedAmount).toBe("0");
    expect(invoice?.amountDue).toBe("500.00");
  });

  it("should handle partial deduction if balance is insufficient", async () => {
    // Reduce wallet balance to 100
    await caller.wallet.manualAdjustment({
      customerId: testCustomerId,
      currency: "USD",
      amount: "900.00",
      direction: "debit",
      description: "Reduce balance",
    }); // Balance now 100

    // Submit 500 invoice again
    await caller.invoices.updateStatus({
      id: invoiceId,
      status: "pending_review",
    });

    // Check Wallet Empty
    const wallet = await caller.wallet.get({ customerId: testCustomerId, currency: "USD" });
    expect(wallet.balance).toBe("0.00");

    // Check Invoice Partial Payment
    const invoice = await caller.invoices.get({ id: invoiceId });
    expect(invoice?.walletAppliedAmount).toBe("100.00");
    expect(invoice?.amountDue).toBe("400.00");
  });

  it("should credit overpayment to wallet", async () => {
    // Mark as paid with overpayment
    // Invoice due is 400. Pay 500.
    await caller.invoices.updateStatus({
      id: invoiceId,
      status: "paid",
      paidAmount: "500.00",
    });

    // Wallet should receive (500 - 400) = 100 credit
    const wallet = await caller.wallet.get({ customerId: testCustomerId, currency: "USD" });
    expect(wallet.balance).toBe("100.00");
  });
});
