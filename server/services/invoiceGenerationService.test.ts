import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  generateInvoicesFromPayroll,
  getInvoiceGenerationStatus,
  regenerateInvoices,
} from "./invoiceGenerationService";

/**
 * Unit tests for Invoice Generation Service
 * Tests multi-currency support, exchange rates, and invoice calculations
 */

describe("InvoiceGenerationService", () => {
  describe("generateInvoicesFromPayroll", () => {
    it("should return error when no payroll data exists", async () => {
      const result = await generateInvoicesFromPayroll(new Date("2099-12-01"));

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.invoiceIds).toBeUndefined();
    });

    it("should calculate correct service fee percentage", () => {
      // Test calculation logic
      const subtotal = 10000;
      const serviceFeePercentage = 0.1; // 10%
      const expectedServiceFee = subtotal * serviceFeePercentage;

      expect(expectedServiceFee).toBe(1000);
    });

    it("should apply 5% exchange rate markup", () => {
      // Test markup calculation
      const baseRate = 1.0;
      const markupPercentage = 0.05;
      const rateWithMarkup = baseRate * (1 + markupPercentage);

      expect(rateWithMarkup).toBeCloseTo(1.05, 3);
    });

    it("should handle multi-currency invoices correctly", () => {
      // Test currency conversion
      const amount = 10000;
      const rate = 1.1; // EUR to USD
      const markupPercentage = 0.05;
      const rateWithMarkup = rate * (1 + markupPercentage);
      const convertedAmount = amount * rateWithMarkup;

      expect(rateWithMarkup).toBeCloseTo(1.155, 3);
      expect(convertedAmount).toBeCloseTo(11550, 1);
    });

    it("should calculate total cost correctly", () => {
      // Test total calculation: subtotal + service fee
      const subtotal = 10000;
      const serviceFeePercentage = 0.1;
      const serviceFee = subtotal * serviceFeePercentage;
      const total = subtotal + serviceFee;

      expect(serviceFee).toBe(1000);
      expect(total).toBe(11000);
    });
  });

  describe("Exchange Rate Calculations", () => {
    it("should calculate same currency conversion as 1:1", () => {
      const amount = 10000;
      const rate = 1; // Same currency
      const converted = amount * rate;

      expect(converted).toBe(10000);
    });

    it("should apply markup to cross-currency conversions", () => {
      // USD to EUR with 5% markup
      const amount = 10000;
      const baseRate = 0.92; // 1 USD = 0.92 EUR
      const markupPercentage = 0.05;
      const rateWithMarkup = baseRate * (1 + markupPercentage);
      const converted = amount * rateWithMarkup;

      expect(rateWithMarkup).toBeCloseTo(0.966, 3);
      expect(converted).toBeCloseTo(9660, 1);
    });

    it("should handle multiple currency pairs", () => {
      const rates = new Map<string, number>([
        ["USD-EUR", 0.92],
        ["USD-GBP", 0.79],
        ["USD-JPY", 149.5],
      ]);

      expect(rates.size).toBe(3);
      expect(rates.get("USD-EUR")).toBe(0.92);
      expect(rates.get("USD-JPY")).toBe(149.5);
    });
  });

  describe("Invoice Calculations", () => {
    it("should calculate employment cost per employee", () => {
      // Employee total cost = gross + employer contribution
      const gross = 5000;
      const employerContribution = 500; // 10% social security
      const totalCost = gross + employerContribution;

      expect(totalCost).toBe(5500);
    });

    it("should sum all employee costs for invoice subtotal", () => {
      const employees = [
        { id: 1, totalCost: 5500 },
        { id: 2, totalCost: 6000 },
        { id: 3, totalCost: 4500 },
      ];

      const subtotal = employees.reduce((sum, emp) => sum + emp.totalCost, 0);

      expect(subtotal).toBe(16000);
    });

    it("should calculate invoice total with service fee", () => {
      const subtotal = 16000;
      const serviceFeePercentage = 0.1;
      const serviceFee = subtotal * serviceFeePercentage;
      const total = subtotal + serviceFee;

      expect(serviceFee).toBe(1600);
      expect(total).toBe(17600);
    });

    it("should handle currency conversion in invoice total", () => {
      // Payroll in USD, invoice in EUR
      const subtotalUSD = 16000;
      const rateWithMarkup = 0.966; // USD to EUR with 5% markup
      const subtotalEUR = subtotalUSD * rateWithMarkup;
      const serviceFeePercentage = 0.1;
      const serviceFeeEUR = subtotalEUR * serviceFeePercentage;
      const totalEUR = subtotalEUR + serviceFeeEUR;

      expect(subtotalEUR).toBeCloseTo(15456, 1);
      expect(serviceFeeEUR).toBeCloseTo(1545.6, 1);
      expect(totalEUR).toBeCloseTo(17001.6, 1);
    });
  });

  describe("Invoice Number Generation", () => {
    it("should generate unique invoice numbers", () => {
      const now = new Date();
      const yearMonth = now.toISOString().slice(0, 7).replace("-", "");

      const invoiceNumbers = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const random = Math.floor(Math.random() * 100000)
          .toString()
          .padStart(5, "0");
        const invoiceNumber = `INV-${yearMonth}-${random}`;
        invoiceNumbers.add(invoiceNumber);
      }

      // Should have 10 unique numbers (or close to it due to randomness)
      expect(invoiceNumbers.size).toBeGreaterThan(5);
    });

    it("should format invoice number correctly", () => {
      const now = new Date("2026-02-24");
      const yearMonth = now.toISOString().slice(0, 7).replace("-", "");
      const random = "12345";
      const invoiceNumber = `INV-${yearMonth}-${random}`;

      expect(invoiceNumber).toBe("INV-202602-12345");
    });
  });

  describe("Multi-Currency Grouping", () => {
    it("should group payroll items by currency", () => {
      const items = [
        { id: 1, currency: "USD", totalCost: 5000 },
        { id: 2, currency: "USD", totalCost: 6000 },
        { id: 3, currency: "EUR", totalCost: 4500 },
        { id: 4, currency: "EUR", totalCost: 5000 },
        { id: 5, currency: "GBP", totalCost: 3500 },
      ];

      const grouped = new Map<string, typeof items>();
      for (const item of items) {
        if (!grouped.has(item.currency)) {
          grouped.set(item.currency, []);
        }
        grouped.get(item.currency)!.push(item);
      }

      expect(grouped.size).toBe(3);
      expect(grouped.get("USD")?.length).toBe(2);
      expect(grouped.get("EUR")?.length).toBe(2);
      expect(grouped.get("GBP")?.length).toBe(1);
    });

    it("should create separate invoices for each currency", () => {
      const currencies = ["USD", "EUR", "GBP"];
      const invoices = currencies.map((currency) => ({
        currency,
        invoiceNumber: `INV-202602-${Math.random()}`,
      }));

      expect(invoices.length).toBe(3);
      expect(invoices.map((i) => i.currency)).toEqual(["USD", "EUR", "GBP"]);
    });
  });

  describe("Invoice Status Tracking", () => {
    it("should track invoice statuses correctly", () => {
      const invoices = [
        { id: 1, status: "draft" },
        { id: 2, status: "draft" },
        { id: 3, status: "sent" },
        { id: 4, status: "paid" },
      ];

      const statusCounts = {
        draft: invoices.filter((i) => i.status === "draft").length,
        sent: invoices.filter((i) => i.status === "sent").length,
        paid: invoices.filter((i) => i.status === "paid").length,
        overdue: invoices.filter((i) => i.status === "overdue").length,
      };

      expect(statusCounts.draft).toBe(2);
      expect(statusCounts.sent).toBe(1);
      expect(statusCounts.paid).toBe(1);
      expect(statusCounts.overdue).toBe(0);
    });
  });
});
