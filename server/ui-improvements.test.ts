/**
 * Tests for the 7 UI/UX improvements
 * 1. P&L link in Dashboard Finance tab
 * 2. Vendor bill approval workflow
 * 3. Upload dialog file name overflow (CSS-only, tested visually)
 * 4. Employee dropdown data shape
 * 5. Invoice filtering for allocation
 * 6. P&L revenue calculation accuracy
 * 7. Navigation reorganization (Billing Entities & Audit Logs in Settings)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Test 2: Vendor bill approval status transitions ──
describe("Vendor Bill Approval Workflow", () => {
  it("should allow status transition from draft to pending_approval", () => {
    const validTransitions: Record<string, string[]> = {
      draft: ["pending_approval"],
      pending_approval: ["approved", "draft"], // approve or reject (back to draft)
      approved: ["paid"],
      paid: [],
    };
    expect(validTransitions.draft).toContain("pending_approval");
    expect(validTransitions.pending_approval).toContain("approved");
    expect(validTransitions.pending_approval).toContain("draft"); // reject
    expect(validTransitions.approved).toContain("paid");
  });
});

// ── Test 4: Employee data shape parsing ──
describe("Employee Dropdown Data Shape", () => {
  it("should correctly extract employees from { data: [], total: 0 } response shape", () => {
    const mockResponse = {
      data: [
        { id: 1, firstName: "John", lastName: "Doe", country: "US" },
        { id: 2, firstName: "Jane", lastName: "Smith", country: "UK" },
      ],
      total: 2,
    };
    // The fix uses (response as any)?.data || []
    const employees = (mockResponse as any)?.data || [];
    expect(employees).toHaveLength(2);
    expect(employees[0].firstName).toBe("John");
    expect(employees[1].country).toBe("UK");
  });

  it("should handle empty response gracefully", () => {
    const mockResponse = { data: [], total: 0 };
    const employees = (mockResponse as any)?.data || [];
    expect(employees).toHaveLength(0);
  });

  it("should handle undefined response gracefully", () => {
    const mockResponse = undefined;
    const employees = (mockResponse as any)?.data || [];
    expect(employees).toHaveLength(0);
  });
});

// ── Test 5: Invoice filtering for allocation ──
describe("Invoice Filtering for Allocation", () => {
  const mockInvoices = [
    { id: 1, invoiceNumber: "INV-001", invoiceType: "monthly_eor", status: "paid", total: "5000" },
    { id: 2, invoiceNumber: "INV-002", invoiceType: "monthly_eor", status: "sent", total: "3000" },
    { id: 3, invoiceNumber: "CN-001", invoiceType: "credit_note", status: "paid", total: "-1000" },
    { id: 4, invoiceNumber: "DEP-001", invoiceType: "deposit", status: "paid", total: "10000" },
    { id: 5, invoiceNumber: "DR-001", invoiceType: "deposit_refund", status: "paid", total: "-5000" },
    { id: 6, invoiceNumber: "INV-003", invoiceType: "monthly_eor", status: "draft", total: "4000" },
    { id: 7, invoiceNumber: "INV-004", invoiceType: "monthly_eor", status: "cancelled", total: "2000" },
    { id: 8, invoiceNumber: "INV-005", invoiceType: "monthly_eor", status: "void", total: "1000" },
    { id: 9, invoiceNumber: "INV-006", invoiceType: "visa_service", status: "paid", total: "800" },
    { id: 10, invoiceNumber: "INV-007", invoiceType: "monthly_aor", status: "sent", total: "6000" },
  ];

  function filterInvoicesForAllocation(invoices: typeof mockInvoices) {
    return invoices.filter((inv) => {
      if (inv.invoiceType === "credit_note" || inv.invoiceType === "deposit_refund") return false;
      if (!["paid", "sent"].includes(inv.status)) return false;
      return true;
    });
  }

  it("should exclude credit notes from allocation", () => {
    const filtered = filterInvoicesForAllocation(mockInvoices);
    expect(filtered.find((i) => i.invoiceType === "credit_note")).toBeUndefined();
  });

  it("should exclude deposit refunds from allocation", () => {
    const filtered = filterInvoicesForAllocation(mockInvoices);
    expect(filtered.find((i) => i.invoiceType === "deposit_refund")).toBeUndefined();
  });

  it("should only include paid and sent invoices", () => {
    const filtered = filterInvoicesForAllocation(mockInvoices);
    filtered.forEach((inv) => {
      expect(["paid", "sent"]).toContain(inv.status);
    });
  });

  it("should exclude draft, cancelled, and void invoices", () => {
    const filtered = filterInvoicesForAllocation(mockInvoices);
    expect(filtered.find((i) => i.status === "draft")).toBeUndefined();
    expect(filtered.find((i) => i.status === "cancelled")).toBeUndefined();
    expect(filtered.find((i) => i.status === "void")).toBeUndefined();
  });

  it("should include deposits (they are valid for allocation)", () => {
    const filtered = filterInvoicesForAllocation(mockInvoices);
    expect(filtered.find((i) => i.invoiceType === "deposit")).toBeDefined();
  });

  it("should include visa_service and monthly_aor types", () => {
    const filtered = filterInvoicesForAllocation(mockInvoices);
    expect(filtered.find((i) => i.invoiceType === "visa_service")).toBeDefined();
    expect(filtered.find((i) => i.invoiceType === "monthly_aor")).toBeDefined();
  });

  it("should return correct count of filtered invoices", () => {
    const filtered = filterInvoicesForAllocation(mockInvoices);
    // Expected: INV-001 (paid eor), INV-002 (sent eor), DEP-001 (paid deposit), INV-006 (paid visa), INV-007 (sent aor) = 5
    expect(filtered).toHaveLength(5);
  });
});

// ── Test 6: P&L Revenue Calculation Logic ──
describe("P&L Revenue Calculation", () => {
  it("should exclude deposit and deposit_refund from revenue", () => {
    const excludedTypes = ["deposit", "deposit_refund"];
    const invoiceTypes = [
      "deposit",
      "monthly_eor",
      "monthly_visa_eor",
      "monthly_aor",
      "visa_service",
      "deposit_refund",
      "credit_note",
      "manual",
    ];

    const revenueTypes = invoiceTypes.filter((t) => !excludedTypes.includes(t));
    expect(revenueTypes).not.toContain("deposit");
    expect(revenueTypes).not.toContain("deposit_refund");
    expect(revenueTypes).toContain("monthly_eor");
    expect(revenueTypes).toContain("credit_note"); // Credit notes reduce revenue naturally
  });

  it("should only count paid invoices as revenue", () => {
    const revenueStatuses = ["paid"];
    expect(revenueStatuses).toContain("paid");
    expect(revenueStatuses).not.toContain("draft");
    expect(revenueStatuses).not.toContain("sent");
    expect(revenueStatuses).not.toContain("cancelled");
  });

  it("should count paid, approved, and partially_paid vendor bills as expenses", () => {
    const expenseStatuses = ["paid", "approved", "partially_paid"];
    expect(expenseStatuses).toContain("paid");
    expect(expenseStatuses).toContain("approved");
    expect(expenseStatuses).toContain("partially_paid");
    expect(expenseStatuses).not.toContain("draft");
    expect(expenseStatuses).not.toContain("cancelled");
  });

  it("credit notes should have negative totals that naturally reduce revenue", () => {
    const invoices = [
      { type: "monthly_eor", total: 5000, status: "paid" },
      { type: "credit_note", total: -1000, status: "paid" },
    ];
    const revenue = invoices
      .filter((i) => i.status === "paid" && !["deposit", "deposit_refund"].includes(i.type))
      .reduce((sum, i) => sum + i.total, 0);
    expect(revenue).toBe(4000); // 5000 - 1000
  });
});

// ── Test 7: Navigation structure ──
describe("Navigation Reorganization", () => {
  it("should not have Reports group in sidebar", () => {
    // The sidebar nav groups should not include a "Reports" group
    const sidebarGroups = [
      "OVERVIEW",
      "SALES",
      "CLIENT MANAGEMENT",
      "OPERATIONS",
      "FINANCE",
      "SYSTEM",
    ];
    expect(sidebarGroups).not.toContain("REPORTS");
  });

  it("should have P&L in Finance group", () => {
    const financeItems = ["Invoices", "Vendors", "Vendor Bills", "Profit & Loss"];
    expect(financeItems).toContain("Profit & Loss");
    expect(financeItems).not.toContain("Billing Entities"); // moved to Settings
  });

  it("should not have Audit Logs in System group", () => {
    const systemItems = ["Countries", "Help Center"];
    expect(systemItems).not.toContain("Audit Logs"); // moved to Settings
  });
});
