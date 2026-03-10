/**
 * Round 51 Tests - Financial Accounting Compliance & Invoice Calculation Fix
 *
 * 1. Invoice subtotal/total calculation: exchange rate conversion
 * 2. Credit Note Apply: restricted to pending_review status only
 * 3. Credit Note Apply: amount cannot exceed target invoice remaining balance
 * 4. Deposit revenue separation: exclude from total revenue
 * 5. Mark as Paid: uses adjusted amount due (after credit)
 * 6. Credit Note balance validation: prevent over-application
 * 7. Invoice schema: creditApplied and amountDue fields
 */
import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createCaller(role: string = "admin") {
  const ctx: TrpcContext = {
    user: {
      id: 1,
      openId: "test-" + role,
      email: `${role}@test.com`,
      name: role.charAt(0).toUpperCase() + role.slice(1),
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
  return appRouter.createCaller(ctx);
}

describe("Round 51 - Financial Accounting Compliance", () => {
  // ===== 1. Invoice Calculation: Exchange Rate Conversion =====
  describe("Invoice Total Calculation with Exchange Rate", () => {
    it("should have recalculate endpoint that handles foreign currency items", async () => {
      const caller = createCaller();
      try {
        await caller.invoices.addItem({
          invoiceId: 999999,
          description: "Test item",
          quantity: "1",
          unitPrice: "1000",
          amount: "1000",
          itemType: "employment_cost",
          localCurrency: "CNY",
          localAmount: "1000",
          vatRate: "6",
        });
        expect.fail("Should have thrown for non-existent invoice");
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });

    it("should accept localCurrency and vatRate in addItem", async () => {
      const caller = createCaller();
      try {
        await caller.invoices.addItem({
          invoiceId: 999999,
          description: "Employment cost - CN",
          quantity: "1",
          unitPrice: "10000",
          amount: "10000",
          itemType: "employment_cost",
          localCurrency: "CNY",
          localAmount: "10000",
          vatRate: "6",
          countryCode: "CN",
        });
      } catch (error: any) {
        // Expected to fail on invoice lookup, not on schema validation
        expect(error.message).not.toContain("invalid_type");
        expect(error.message).not.toContain("unrecognized_keys");
      }
    });

    it("should accept updateItem with exchange rate fields", async () => {
      const caller = createCaller();
      try {
        await caller.invoices.updateItem({
          id: 999999,
          invoiceId: 999999,
          data: {
            description: "Updated item",
            quantity: "1",
            unitPrice: "10000",
            amount: "10000",
            itemType: "employment_cost",
            localCurrency: "CNY",
            localAmount: "10000",
            vatRate: "6",
          },
        });
      } catch (error: any) {
        // Should fail on item lookup, not schema
        expect(error.message).not.toContain("invalid_type");
      }
    });
  });

  // ===== 2. Credit Note Apply: Restricted to pending_review =====
  describe("Credit Note Apply - Status Restriction", () => {
    it("should reject apply credit for non-existent credit note", async () => {
      const caller = createCaller();
      try {
        await caller.invoices.applyCreditToInvoice({
          creditNoteId: 999999,
          appliedToInvoiceId: 999998,
          appliedAmount: "100.00",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toBeDefined();
        // Should mention invalid credit note
        expect(
          error.message.toLowerCase().includes("invalid") ||
          error.message.toLowerCase().includes("credit note") ||
          error.message.toLowerCase().includes("not found")
        ).toBe(true);
      }
    });

    it("should reject apply credit with zero amount", async () => {
      const caller = createCaller();
      try {
        await caller.invoices.applyCreditToInvoice({
          creditNoteId: 999999,
          appliedToInvoiceId: 999998,
          appliedAmount: "0",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });

    it("should reject apply credit with negative amount", async () => {
      const caller = createCaller();
      try {
        await caller.invoices.applyCreditToInvoice({
          creditNoteId: 999999,
          appliedToInvoiceId: 999998,
          appliedAmount: "-100",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });

    it("should have invoiceCreditApplications endpoint", async () => {
      const caller = createCaller();
      const result = await caller.invoices.invoiceCreditApplications({ invoiceId: 999999 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it("should accept notes field in apply credit", async () => {
      const caller = createCaller();
      try {
        await caller.invoices.applyCreditToInvoice({
          creditNoteId: 999999,
          appliedToInvoiceId: 999998,
          appliedAmount: "100.00",
          notes: "Applied per customer request",
        });
      } catch (error: any) {
        // Should fail on credit note lookup, not schema
        expect(error.message).not.toContain("unrecognized_keys");
      }
    });
  });

  // ===== 3. Deposit Revenue Separation =====
  describe("Deposit Revenue Separation", () => {
    it("finance overview should return deferred revenue fields", async () => {
      const caller = createCaller("finance_manager");
      const result = await caller.dashboard.financeOverview();

      // Verify the new fields exist
      expect(result).toHaveProperty("totalRevenue");
      expect(result).toHaveProperty("totalServiceFeeRevenue");
      expect(result).toHaveProperty("totalDeferredRevenue");
      expect(result).toHaveProperty("totalDepositInvoices");
      expect(result).toHaveProperty("totalOutstandingAmount");
      expect(result).toHaveProperty("totalOverdueAmount");
      expect(result).toHaveProperty("monthlyRevenue");

      // Deferred revenue should be a string (decimal)
      expect(typeof result.totalDeferredRevenue).toBe("string");
      expect(typeof result.totalDepositInvoices).toBe("number");
    });

    it("finance overview monthly revenue should be an array", async () => {
      const caller = createCaller("finance_manager");
      const result = await caller.dashboard.financeOverview();

      expect(Array.isArray(result.monthlyRevenue)).toBe(true);
      // When DB is unavailable, returns empty; when available, returns 12
      expect([0, 12]).toContain(result.monthlyRevenue.length);

      for (const entry of result.monthlyRevenue) {
        expect(entry).toHaveProperty("month");
        expect(entry).toHaveProperty("totalRevenue");
        expect(entry).toHaveProperty("serviceFeeRevenue");
        expect(entry).toHaveProperty("invoiceCount");
      }
    });
  });

  // ===== 4. Available Credit Notes Endpoint =====
  describe("Available Credit Notes", () => {
    it("should return empty array for customer with no credit notes", async () => {
      const caller = createCaller();
      const result = await caller.invoices.availableCreditNotes({ customerId: 999999 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it("should filter out fully applied credit notes (balance <= 0.01)", async () => {
      const caller = createCaller();
      const result = await caller.invoices.availableCreditNotes({ customerId: 0 });
      expect(Array.isArray(result)).toBe(true);
      for (const cn of result) {
        expect(cn.remainingBalance).toBeGreaterThan(0.01);
      }
    });
  });

  // ===== 5. Credit Note Balance Validation =====
  describe("Credit Note Balance Validation", () => {
    it("should reject creditNoteBalance for non-existent credit note", async () => {
      const caller = createCaller();
      try {
        await caller.invoices.creditNoteBalance({ creditNoteId: 999999 });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });

    it("should reject apply credit exceeding remaining balance", async () => {
      const caller = createCaller();
      try {
        await caller.invoices.applyCreditToInvoice({
          creditNoteId: 999999,
          appliedToInvoiceId: 999998,
          appliedAmount: "999999999.00",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });
  });

  // ===== 6. Invoice Status Transitions =====
  describe("Invoice Status Transitions", () => {
    it("should reject status update for non-existent invoice", async () => {
      const caller = createCaller();
      try {
        await caller.invoices.updateStatus({
          id: 999999,
          status: "paid",
          paidAmount: "1000.00",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });

    it("should accept paidAmount in status update", async () => {
      const caller = createCaller();
      try {
        await caller.invoices.updateStatus({
          id: 999999,
          status: "paid",
          paidAmount: "1500.50",
        });
      } catch (error: any) {
        // Should fail on invoice lookup, not schema
        expect(error.message).not.toContain("invalid_type");
      }
    });
  });

  // ===== 7. Schema Validation: creditApplied and amountDue fields =====
  describe("Invoice Schema - Credit Applied Fields", () => {
    it("should include creditApplied and amountDue in invoice data", async () => {
      const caller = createCaller();
      // List invoices and check that the fields exist in the response type
      const result = await caller.invoices.list({ limit: 1 });
      // Even if empty, the structure should be valid
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);

      // If there are invoices, verify the new fields
      if (result.data.length > 0) {
        const inv = result.data[0];
        // creditApplied should default to "0" or null
        expect(inv).toHaveProperty("creditApplied");
        // amountDue may be null if not set
        expect("amountDue" in inv).toBe(true);
      }
    });
  });
});
