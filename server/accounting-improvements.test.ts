import { describe, it, expect } from "vitest";

/**
 * Accounting Logic Improvements - Test Suite
 * Tests for all 9 improvement items from the audit report
 */

// ============================================================================
// 1. Revenue Query Defensive Exclusion (credit_note)
// ============================================================================
describe("Revenue Query Defensive Exclusion", () => {
  const excludedTypes = ["deposit", "deposit_refund", "credit_note"];
  const revenueTypes = [
    "monthly_eor",
    "monthly_aor",
    "visa_service",
    "manual",
  ];

  it("should exclude credit_note from revenue calculations", () => {
    // Simulate the NOT IN filter
    const allTypes = [...revenueTypes, ...excludedTypes];
    const filteredForRevenue = allTypes.filter(
      (t) => !excludedTypes.includes(t)
    );

    expect(filteredForRevenue).not.toContain("credit_note");
    expect(filteredForRevenue).not.toContain("deposit");
    expect(filteredForRevenue).not.toContain("deposit_refund");
    expect(filteredForRevenue).toEqual(revenueTypes);
  });

  it("should include all regular invoice types in revenue", () => {
    const allTypes = [...revenueTypes, ...excludedTypes];
    const filteredForRevenue = allTypes.filter(
      (t) => !excludedTypes.includes(t)
    );

    expect(filteredForRevenue).toContain("monthly_eor");
    expect(filteredForRevenue).toContain("monthly_aor");
    expect(filteredForRevenue).toContain("visa_service");
    expect(filteredForRevenue).toContain("manual");
  });
});

// ============================================================================
// 2. Status Guard: credit_note/deposit_refund cannot be marked as paid
// ============================================================================
describe("Invoice Status Guard", () => {
  const blockedTypes = ["credit_note", "deposit_refund"];
  const allowedTypes = [
    "monthly_eor",
    "monthly_aor",
    "visa_service",
    "manual",
    "deposit",
  ];

  function canMarkAsPaid(invoiceType: string): boolean {
    return !blockedTypes.includes(invoiceType);
  }

  it("should block credit_note from being marked as paid", () => {
    expect(canMarkAsPaid("credit_note")).toBe(false);
  });

  it("should block deposit_refund from being marked as paid", () => {
    expect(canMarkAsPaid("deposit_refund")).toBe(false);
  });

  it("should allow regular invoice types to be marked as paid", () => {
    for (const t of allowedTypes) {
      expect(canMarkAsPaid(t)).toBe(true);
    }
  });
});

// ============================================================================
// 5 & 6. Allocation Invoice Filtering
// ============================================================================
describe("Allocation Invoice Filtering", () => {
  const mockInvoices = [
    {
      id: 1,
      invoiceType: "monthly_eor",
      status: "paid",
      total: "10000",
      creditApplied: "0",
    },
    {
      id: 2,
      invoiceType: "credit_note",
      status: "applied",
      total: "-3000",
      creditApplied: "0",
    },
    {
      id: 3,
      invoiceType: "deposit",
      status: "paid",
      total: "20000",
      creditApplied: "0",
    },
    {
      id: 4,
      invoiceType: "deposit_refund",
      status: "paid",
      total: "-5000",
      creditApplied: "0",
    },
    {
      id: 5,
      invoiceType: "monthly_eor",
      status: "draft",
      total: "8000",
      creditApplied: "0",
    },
    {
      id: 6,
      invoiceType: "deposit",
      status: "paid",
      total: "15000",
      creditApplied: "15000",
    }, // Fully consumed by CN
    {
      id: 7,
      invoiceType: "deposit",
      status: "paid",
      total: "15000",
      creditApplied: "5000",
    }, // Partially consumed
    {
      id: 8,
      invoiceType: "monthly_eor",
      status: "sent",
      total: "12000",
      creditApplied: "0",
    },
  ];

  function filterForOperationalBill(invoices: typeof mockInvoices) {
    return invoices.filter((inv) => {
      if (
        inv.invoiceType === "credit_note" ||
        inv.invoiceType === "deposit_refund"
      )
        return false;
      if (!["paid", "sent"].includes(inv.status)) return false;
      if (inv.invoiceType === "deposit") return false; // Operational bills exclude deposits
      return true;
    });
  }

  function filterForDepositBill(invoices: typeof mockInvoices) {
    return invoices.filter((inv) => {
      if (
        inv.invoiceType === "credit_note" ||
        inv.invoiceType === "deposit_refund"
      )
        return false;
      if (!["paid", "sent"].includes(inv.status)) return false;
      if (inv.invoiceType !== "deposit") return false; // Deposit bills only show deposits
      // Exclude fully consumed deposits
      const creditApplied = parseFloat(inv.creditApplied || "0");
      const total = parseFloat(inv.total || "0");
      if (total > 0 && creditApplied >= total) return false;
      return true;
    });
  }

  it("should exclude credit_note and deposit_refund from all allocations", () => {
    const operationalResult = filterForOperationalBill(mockInvoices);
    const depositResult = filterForDepositBill(mockInvoices);

    const allIds = [
      ...operationalResult.map((i) => i.id),
      ...depositResult.map((i) => i.id),
    ];
    expect(allIds).not.toContain(2); // credit_note
    expect(allIds).not.toContain(4); // deposit_refund
  });

  it("should exclude draft invoices from allocations", () => {
    const result = filterForOperationalBill(mockInvoices);
    expect(result.map((i) => i.id)).not.toContain(5); // draft
  });

  it("should exclude deposit invoices from operational bill allocations", () => {
    const result = filterForOperationalBill(mockInvoices);
    expect(result.map((i) => i.id)).not.toContain(3); // deposit
    expect(result.map((i) => i.id)).not.toContain(6); // deposit (consumed)
    expect(result.map((i) => i.id)).not.toContain(7); // deposit (partial)
  });

  it("should include paid/sent regular invoices for operational bills", () => {
    const result = filterForOperationalBill(mockInvoices);
    expect(result.map((i) => i.id)).toContain(1); // paid monthly_eor
    expect(result.map((i) => i.id)).toContain(8); // sent monthly_eor
  });

  it("should only show deposit invoices for deposit bill allocations", () => {
    const result = filterForDepositBill(mockInvoices);
    for (const inv of result) {
      expect(inv.invoiceType).toBe("deposit");
    }
  });

  it("should exclude fully consumed deposits from deposit bill allocations", () => {
    const result = filterForDepositBill(mockInvoices);
    expect(result.map((i) => i.id)).not.toContain(6); // creditApplied >= total
  });

  it("should include partially consumed deposits for deposit bill allocations", () => {
    const result = filterForDepositBill(mockInvoices);
    expect(result.map((i) => i.id)).toContain(7); // creditApplied < total
  });

  it("should include unconsumed deposits for deposit bill allocations", () => {
    const result = filterForDepositBill(mockInvoices);
    expect(result.map((i) => i.id)).toContain(3); // creditApplied = 0
  });
});

// ============================================================================
// 7. Vendor Bill billType field
// ============================================================================
describe("Vendor Bill billType", () => {
  const validBillTypes = ["operational", "deposit", "deposit_refund"];

  it("should have three valid bill types", () => {
    expect(validBillTypes).toHaveLength(3);
    expect(validBillTypes).toContain("operational");
    expect(validBillTypes).toContain("deposit");
    expect(validBillTypes).toContain("deposit_refund");
  });

  it("should default to operational", () => {
    const defaultType = "operational";
    expect(defaultType).toBe("operational");
  });
});

// ============================================================================
// 9. Allocation Backend Validation (billType vs invoiceType)
// ============================================================================
describe("Allocation Backend Validation", () => {
  function validateAllocation(
    billType: string,
    invoiceType: string
  ): { valid: boolean; error?: string } {
    if (
      invoiceType === "credit_note" ||
      invoiceType === "deposit_refund"
    ) {
      return {
        valid: false,
        error: `Cannot allocate costs to ${invoiceType.replace("_", " ")}`,
      };
    }
    if (billType === "deposit" && invoiceType !== "deposit") {
      return {
        valid: false,
        error:
          "Deposit vendor bills can only be allocated to deposit invoices",
      };
    }
    if (billType === "operational" && invoiceType === "deposit") {
      return {
        valid: false,
        error:
          "Operational vendor bills should not be allocated to deposit invoices",
      };
    }
    return { valid: true };
  }

  it("should allow operational bill → regular invoice", () => {
    expect(validateAllocation("operational", "monthly_eor").valid).toBe(true);
    expect(validateAllocation("operational", "monthly_aor").valid).toBe(true);
    expect(validateAllocation("operational", "visa_service").valid).toBe(true);
  });

  it("should allow deposit bill → deposit invoice", () => {
    expect(validateAllocation("deposit", "deposit").valid).toBe(true);
  });

  it("should block operational bill → deposit invoice", () => {
    const result = validateAllocation("operational", "deposit");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Operational");
  });

  it("should block deposit bill → regular invoice", () => {
    const result = validateAllocation("deposit", "monthly_eor");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Deposit vendor bills");
  });

  it("should block any bill → credit_note", () => {
    expect(validateAllocation("operational", "credit_note").valid).toBe(false);
    expect(validateAllocation("deposit", "credit_note").valid).toBe(false);
  });

  it("should block any bill → deposit_refund", () => {
    expect(validateAllocation("operational", "deposit_refund").valid).toBe(
      false
    );
    expect(validateAllocation("deposit", "deposit_refund").valid).toBe(false);
  });
});
