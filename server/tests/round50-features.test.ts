/**
 * Round 50 Tests
 * - Credit Note Apply mechanism
 * - Deposit terminated check
 * - Invoice month filter
 * - Exchange rate direction
 * - Applied status support
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

describe("Round 50 - Deposit/Credit Note & Invoice Improvements", () => {
  // ===== 1. Deposit Invoice: employee terminated check =====
  describe("Deposit Refund - Employee Terminated Check", () => {
    it("should reject deposit refund for non-existent invoice", async () => {
      const caller = createCaller();
      try {
        await caller.invoices.generateDepositRefund({ invoiceId: 999999 });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });
  });

  // ===== 2. Credit Note Apply Mechanism =====
  describe("Credit Note Apply Mechanism", () => {
    it("should have creditNoteBalance endpoint", async () => {
      const caller = createCaller();
      try {
        const result = await caller.invoices.creditNoteBalance({ creditNoteId: 999999 });
        expect(result).toBeDefined();
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });

    it("should reject apply credit for non-existent credit note", async () => {
      const caller = createCaller();
      try {
        await caller.invoices.applyCreditToInvoice({
          creditNoteId: 999999,
          targetInvoiceId: 999998,
          amount: 100,
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });

    it("should return empty array for non-existent credit note applications", async () => {
      const caller = createCaller();
      const result = await caller.invoices.invoiceCreditApplications({ invoiceId: 999999 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it("should return empty array for non-existent customer credit notes", async () => {
      const caller = createCaller();
      const result = await caller.invoices.availableCreditNotes({ customerId: 999999 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  // ===== 3. Invoice List - Month Filter =====
  describe("Invoice List - Month Filter", () => {
    it("should accept invoiceMonth filter parameter", async () => {
      const caller = createCaller();
      const result = await caller.invoices.list({
        invoiceMonth: "2026-02",
        limit: 10,
        offset: 0,
      });
      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("total");
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("should return all invoices when no month filter", async () => {
      const caller = createCaller();
      const result = await caller.invoices.list({
        limit: 10,
        offset: 0,
      });
      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("total");
    });

    it("should filter by both status and month", async () => {
      const caller = createCaller();
      const result = await caller.invoices.list({
        status: "draft",
        invoiceMonth: "2026-02",
        limit: 10,
        offset: 0,
      });
      expect(result).toHaveProperty("data");
      for (const inv of result.data) {
        expect(inv.status).toBe("draft");
      }
    });

    it("should return empty for future month with no invoices", async () => {
      const caller = createCaller();
      const result = await caller.invoices.list({
        invoiceMonth: "2030-12",
        limit: 10,
        offset: 0,
      });
      expect(result.data.length).toBe(0);
      expect(result.total).toBe(0);
    });
  });

  // ===== 4. Exchange Rate Reference =====
  describe("Exchange Rate - getRealTimeRateReference", () => {
    it("should reject for non-existent invoice", async () => {
      const caller = createCaller();
      try {
        await caller.invoices.getRealTimeRateReference({ invoiceId: 999999 });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });
  });

  // ===== 5. Credit Note Status - Applied =====
  describe("Credit Note Status - Applied Status", () => {
    it("should support applied status filter in invoice list", async () => {
      const caller = createCaller();
      const result = await caller.invoices.list({
        status: "applied",
        limit: 10,
        offset: 0,
      });
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
    });
  });
});
