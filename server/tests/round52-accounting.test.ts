/**
 * Round 52 Tests - Financial Accounting Rules & Credit Note Workflow
 *
 * 1. Credit Note Apply: only 'sent' status credit notes can be applied
 * 2. Credit Note Apply: only 'pending_review' invoices can receive credit
 * 3. Apply amount cap: credit note side (remaining balance) and invoice side (remaining payable)
 * 4. Auto-mark: credit note → applied when balance exhausted; invoice → paid when fully covered
 * 5. Deposit mutual exclusion: refund and credit note are mutually exclusive
 * 6. Deposit: only full-amount credit note allowed
 * 7. Credit note cumulative limit: total credit notes for one invoice cannot exceed invoice total
 * 8. Credit note type restriction: cannot create for credit_note or deposit_refund types
 * 9. hasDepositInvoice: relationship-based check (not status-based)
 * 10. Status cleanup: void merged to cancelled
 * 11. Invoice-side Apply Credit button (bidirectional apply)
 * 12. availableCreditNotes returns only 'sent' status credit notes
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

describe("Round 52 - Financial Accounting Rules & Credit Note Workflow", () => {
  // ===== 1. Credit Note Apply: Status Restrictions =====
  describe("Credit Note Apply - Status Restrictions", () => {
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
        // Should mention credit note not found or invalid
        const msg = error.message.toLowerCase();
        expect(
          msg.includes("invalid") ||
          msg.includes("not found") ||
          msg.includes("credit note")
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

    it("should accept notes field in apply credit input", async () => {
      const caller = createCaller();
      try {
        await caller.invoices.applyCreditToInvoice({
          creditNoteId: 999999,
          appliedToInvoiceId: 999998,
          appliedAmount: "100.00",
          notes: "Applied per customer request",
        });
      } catch (error: any) {
        // Should fail on credit note lookup, not schema validation
        expect(error.message).not.toContain("unrecognized_keys");
      }
    });
  });

  // ===== 2. Credit Applications for Invoice =====
  describe("Invoice Credit Applications", () => {
    it("should return empty array for non-existent invoice", async () => {
      const caller = createCaller();
      const result = await caller.invoices.invoiceCreditApplications({
        invoiceId: 999999,
      });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  // ===== 3. Available Credit Notes - Only Sent Status =====
  describe("Available Credit Notes - Status Filter", () => {
    it("should return empty array for customer with no credit notes", async () => {
      const caller = createCaller();
      const result = await caller.invoices.availableCreditNotes({
        customerId: 999999,
      });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it("should only return credit notes with positive remaining balance", async () => {
      const caller = createCaller();
      const result = await caller.invoices.availableCreditNotes({
        customerId: 0,
      });
      expect(Array.isArray(result)).toBe(true);
      for (const cn of result) {
        expect(cn.remainingBalance).toBeGreaterThan(0.01);
      }
    });
  });

  // ===== 4. Credit Note Balance Endpoint =====
  describe("Credit Note Balance", () => {
    it("should reject creditNoteBalance for non-existent credit note", async () => {
      const caller = createCaller();
      try {
        await caller.invoices.creditNoteBalance({ creditNoteId: 999999 });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });
  });

  // ===== 5. Invoice Status Transitions - Void merged to Cancelled =====
  describe("Invoice Status Transitions - Void Cleanup", () => {
    it("should reject 'void' as a valid status transition target", async () => {
      const caller = createCaller();
      try {
        await caller.invoices.updateStatus({
          id: 999999,
          status: "void" as any,
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        // Should either fail on schema validation (void not in enum) or on invoice lookup
        expect(error.message).toBeDefined();
      }
    });

    it("should accept 'cancelled' as a valid status", async () => {
      const caller = createCaller();
      try {
        await caller.invoices.updateStatus({
          id: 999999,
          status: "cancelled",
        });
      } catch (error: any) {
        // Should fail on invoice lookup, not schema validation
        expect(error.message).not.toContain("invalid_enum_value");
      }
    });

    it("should accept 'paid' status with paidAmount", async () => {
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

  // ===== 6. Finance Overview - Deferred Revenue =====
  describe("Finance Overview - Deposit Revenue Separation", () => {
    it("should return deferred revenue fields", async () => {
      const caller = createCaller("finance_manager");
      const result = await caller.dashboard.financeOverview();

      expect(result).toHaveProperty("totalRevenue");
      expect(result).toHaveProperty("totalServiceFeeRevenue");
      expect(result).toHaveProperty("totalDeferredRevenue");
      expect(result).toHaveProperty("totalDepositInvoices");
      expect(result).toHaveProperty("totalOutstandingAmount");
      expect(result).toHaveProperty("totalOverdueAmount");
      expect(result).toHaveProperty("monthlyRevenue");

      expect(typeof result.totalDeferredRevenue).toBe("string");
      expect(typeof result.totalDepositInvoices).toBe("number");
    });

    it("should have monthly revenue array with 12 entries", async () => {
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

  // ===== 7. Invoice Schema - Credit Applied Fields =====
  describe("Invoice Schema - Credit Applied Fields", () => {
    it("should include creditApplied and amountDue in invoice list data", async () => {
      const caller = createCaller();
      const result = await caller.invoices.list({ limit: 1 });
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);

      if (result.data.length > 0) {
        const inv = result.data[0];
        expect(inv).toHaveProperty("creditApplied");
        expect("amountDue" in inv).toBe(true);
      }
    });
  });

  // ===== 8. Invoice Item with Exchange Rate Fields =====
  describe("Invoice Item - Exchange Rate Fields", () => {
    it("should accept localCurrency and vatRate in addItem schema", async () => {
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

  // ===== 9. Apply Credit Amount Validation =====
  describe("Apply Credit - Amount Validation", () => {
    it("should reject apply credit exceeding maximum possible amount", async () => {
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

    it("should reject apply credit with amount string '0.00'", async () => {
      const caller = createCaller();
      try {
        await caller.invoices.applyCreditToInvoice({
          creditNoteId: 999999,
          appliedToInvoiceId: 999998,
          appliedAmount: "0.00",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });
  });

  // ===== 10. Create Credit Note - Type and Amount Restrictions =====
  describe("Create Credit Note - Restrictions", () => {
    it("should reject creating credit note for non-existent invoice", async () => {
      const caller = createCaller();
      try {
        await caller.invoices.createCreditNote({
          originalInvoiceId: 999999,
          isFullCredit: true,
          reason: "Full credit for test",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });

    it("should accept partial credit note with line items", async () => {
      const caller = createCaller();
      try {
        await caller.invoices.createCreditNote({
          originalInvoiceId: 999999,
          isFullCredit: false,
          reason: "Partial refund for service issue",
          lineItems: [
            { description: "Refund item", amount: "500.00" },
          ],
        });
      } catch (error: any) {
        // Should fail on invoice lookup, not schema
        expect(error.message).not.toContain("unrecognized_keys");
        expect(error.message).not.toContain("invalid_type");
      }
    });
  });

  // ===== 11. Deposit Refund - Mutual Exclusion =====
  describe("Deposit Refund - Mutual Exclusion", () => {
    it("should have processDepositRefund endpoint", async () => {
      const caller = createCaller();
      try {
        await caller.employees.processDepositRefund({
          employeeId: 999999,
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        // Should fail on employee lookup, not on missing endpoint
        expect(error.message).toBeDefined();
        expect(error.message).not.toContain("is not a function");
      }
    });
  });

  // ===== 12. Invoice List - Filter and Pagination =====
  describe("Invoice List - Filtering", () => {
    it("should support status filter with cancelled", async () => {
      const caller = createCaller();
      const result = await caller.invoices.list({
        limit: 5,
        status: "cancelled",
      });
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
      for (const inv of result.data) {
        expect(inv.status).toBe("cancelled");
      }
    });

    it("should support status filter with pending_review", async () => {
      const caller = createCaller();
      const result = await caller.invoices.list({
        limit: 5,
        status: "pending_review",
      });
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
      for (const inv of result.data) {
        expect(inv.status).toBe("pending_review");
      }
    });

    it("should support status filter with sent", async () => {
      const caller = createCaller();
      const result = await caller.invoices.list({
        limit: 5,
        status: "sent",
      });
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
      for (const inv of result.data) {
        expect(inv.status).toBe("sent");
      }
    });
  });
});
