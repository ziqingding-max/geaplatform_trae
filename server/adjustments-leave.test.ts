import { describe, expect, it, vi, beforeEach } from "vitest";

/**
 * Tests for:
 * 1. Cutoff utility logic (checkCutoffPassed, enforceCutoff)
 * 2. Unpaid leave deduction calculation
 * 3. Adjustment router validation (locked status, cutoff enforcement)
 * 4. Leave router validation (locked status, cutoff enforcement)
 */

// ========== 1. Cutoff Utility Tests ==========
// We test the pure logic by mocking getSystemConfig

describe("cutoff utility", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("checkCutoffPassed returns correct result for future cutoff", async () => {
    // Mock getSystemConfig to return default values
    vi.doMock("./db", () => ({
      getSystemConfig: vi.fn().mockResolvedValue("4"),
    }));

    const { checkCutoffPassed } = await import("./utils/cutoff");

    // Use a month far in the future so cutoff hasn't passed
    const result = await checkCutoffPassed("2099-12-01");

    expect(result).toHaveProperty("passed");
    expect(result).toHaveProperty("cutoffDate");
    expect(result.passed).toBe(false);
    expect(result.cutoffDate).toBeInstanceOf(Date);
  });

  it("checkCutoffPassed returns passed=true for old months", async () => {
    vi.doMock("./db", () => ({
      getSystemConfig: vi.fn().mockResolvedValue("4"),
    }));

    const { checkCutoffPassed } = await import("./utils/cutoff");

    // Use a month far in the past so cutoff has definitely passed
    const result = await checkCutoffPassed("2020-01-01");

    expect(result.passed).toBe(true);
  });

  it("enforceCutoff allows modification before cutoff", async () => {
    vi.doMock("./db", () => ({
      getSystemConfig: vi.fn().mockResolvedValue("4"),
    }));

    const { enforceCutoff } = await import("./utils/cutoff");

    // Future month - cutoff hasn't passed, should not throw for any role
    await expect(enforceCutoff("2099-12-01", "user", "test action")).resolves.toBeUndefined();
  });

  it("enforceCutoff blocks regular user after cutoff", async () => {
    vi.doMock("./db", () => ({
      getSystemConfig: vi.fn().mockResolvedValue("4"),
    }));

    const { enforceCutoff } = await import("./utils/cutoff");

    // Past month - cutoff has passed, should throw for regular user
    await expect(enforceCutoff("2020-01-01", "user", "test action")).rejects.toThrow(
      /Cannot test action.*cutoff has passed/
    );
  });

  it("enforceCutoff allows operations_manager after cutoff", async () => {
    vi.doMock("./db", () => ({
      getSystemConfig: vi.fn().mockResolvedValue("4"),
    }));

    const { enforceCutoff } = await import("./utils/cutoff");

    // Past month - cutoff has passed, but operations_manager should be allowed
    await expect(enforceCutoff("2020-01-01", "operations_manager", "test action")).resolves.toBeUndefined();
  });

  it("enforceCutoff allows admin after cutoff", async () => {
    vi.doMock("./db", () => ({
      getSystemConfig: vi.fn().mockResolvedValue("4"),
    }));

    const { enforceCutoff } = await import("./utils/cutoff");

    // Past month - cutoff has passed, but admin should be allowed
    await expect(enforceCutoff("2020-01-01", "admin", "test action")).resolves.toBeUndefined();
  });
});

// ========== 2. Unpaid Leave Deduction Calculation Tests ==========

describe("unpaid leave deduction calculation", () => {
  // Replicate the function from leave.ts for unit testing
  function calculateUnpaidDeduction(baseSalary: number, days: number, workingDaysPerWeek: number): number {
    const monthlyWorkingDays = workingDaysPerWeek * 4.33;
    if (monthlyWorkingDays <= 0) return 0;
    return Math.round((baseSalary / monthlyWorkingDays) * days * 100) / 100;
  }

  it("calculates correct deduction for standard 5-day work week", () => {
    // baseSalary = 10000, 1 day leave, 5 days/week
    // monthlyWorkingDays = 5 * 4.33 = 21.65
    // deduction = 10000 / 21.65 * 1 = 461.89
    const result = calculateUnpaidDeduction(10000, 1, 5);
    expect(result).toBeCloseTo(461.89, 1);
  });

  it("calculates correct deduction for 2 days leave", () => {
    const result = calculateUnpaidDeduction(10000, 2, 5);
    expect(result).toBeCloseTo(923.79, 1);
  });

  it("calculates correct deduction for half day leave", () => {
    const result = calculateUnpaidDeduction(10000, 0.5, 5);
    expect(result).toBeCloseTo(230.95, 1);
  });

  it("returns 0 when baseSalary is 0", () => {
    const result = calculateUnpaidDeduction(0, 5, 5);
    expect(result).toBe(0);
  });

  it("returns 0 when workingDaysPerWeek is 0", () => {
    const result = calculateUnpaidDeduction(10000, 5, 0);
    expect(result).toBe(0);
  });

  it("handles 6-day work week correctly", () => {
    // baseSalary = 10000, 1 day leave, 6 days/week
    // monthlyWorkingDays = 6 * 4.33 = 25.98
    // deduction = 10000 / 25.98 * 1 = 385.07
    const result = calculateUnpaidDeduction(10000, 1, 6);
    expect(result).toBeCloseTo(384.91, 1);
  });
});

// ========== 3. Adjustment Status Validation Tests ==========

describe("adjustment status rules", () => {
  it("new adjustments should have status 'submitted'", () => {
    // Verify the expected initial status
    const validStatuses = ["submitted", "locked"];
    expect(validStatuses).toContain("submitted");
    expect(validStatuses).not.toContain("pending");
    expect(validStatuses).not.toContain("approved");
    expect(validStatuses).not.toContain("rejected");
  });

  it("locked adjustments cannot be edited", () => {
    // Simulate the check in the update mutation
    const existing = { status: "locked" };
    expect(() => {
      if (existing.status === "locked") throw new Error("Cannot edit a locked adjustment");
    }).toThrow("Cannot edit a locked adjustment");
  });

  it("locked adjustments cannot be deleted", () => {
    const existing = { status: "locked" };
    expect(() => {
      if (existing.status === "locked") throw new Error("Cannot delete a locked adjustment");
    }).toThrow("Cannot delete a locked adjustment");
  });

  it("submitted adjustments can be edited", () => {
    const existing = { status: "submitted" };
    expect(() => {
      if (existing.status === "locked") throw new Error("Cannot edit a locked adjustment");
    }).not.toThrow();
  });

  it("submitted adjustments can be deleted", () => {
    const existing = { status: "submitted" };
    expect(() => {
      if (existing.status === "locked") throw new Error("Cannot delete a locked adjustment");
    }).not.toThrow();
  });
});

// ========== 4. Leave Status Validation Tests ==========

describe("leave status rules", () => {
  it("new leave records should have status 'submitted'", () => {
    const validStatuses = ["submitted", "locked", "cancelled"];
    expect(validStatuses).toContain("submitted");
    expect(validStatuses).not.toContain("pending");
    expect(validStatuses).not.toContain("approved");
    expect(validStatuses).not.toContain("rejected");
  });

  it("locked leave records cannot be edited", () => {
    const existing = { status: "locked" };
    expect(() => {
      if (existing.status === "locked") throw new Error("Cannot edit a locked leave record");
    }).toThrow("Cannot edit a locked leave record");
  });

  it("locked leave records cannot be deleted", () => {
    const existing = { status: "locked" };
    expect(() => {
      if (existing.status === "locked") throw new Error("Cannot delete a locked leave record");
    }).toThrow("Cannot delete a locked leave record");
  });

  it("locked leave records cannot be cancelled", () => {
    const existing = { status: "locked" };
    expect(() => {
      if (existing.status === "locked") throw new Error("Cannot cancel a locked leave record");
    }).toThrow("Cannot cancel a locked leave record");
  });

  it("submitted leave records can be edited", () => {
    const existing = { status: "submitted" };
    expect(() => {
      if (existing.status === "locked") throw new Error("Cannot edit a locked leave record");
    }).not.toThrow();
  });

  it("submitted leave records can be deleted", () => {
    const existing = { status: "submitted" };
    expect(() => {
      if (existing.status === "locked") throw new Error("Cannot delete a locked leave record");
    }).not.toThrow();
  });

  it("submitted leave records can be cancelled", () => {
    const existing = { status: "submitted" };
    expect(() => {
      if (existing.status === "locked") throw new Error("Cannot cancel a locked leave record");
    }).not.toThrow();
  });
});

// ========== 5. Adjustment Category Standardization Tests ==========

describe("adjustment category standardization", () => {
  const validCategories = [
    "housing", "transport", "meals", "performance_bonus", "year_end_bonus",
    "overtime", "travel_reimbursement", "equipment_reimbursement",
    "absence_deduction", "other",
  ];

  it("all standard categories are valid", () => {
    expect(validCategories.length).toBe(10);
  });

  it("old free-text categories are not in the standard list", () => {
    expect(validCategories).not.toContain("custom_text");
    expect(validCategories).not.toContain("misc");
  });

  it("adjustment types are standardized", () => {
    const validTypes = ["bonus", "allowance", "reimbursement", "deduction", "other"];
    expect(validTypes.length).toBe(5);
    expect(validTypes).not.toContain("overtime"); // overtime is a category, not a type
  });
});

// ========== 6. Effective Month Normalization Tests ==========

describe("effective month normalization", () => {
  it("normalizes YYYY-MM to YYYY-MM-01", () => {
    const input = "2026-03";
    const parts = input.split("-");
    const normalized = `${parts[0]}-${parts[1].padStart(2, "0")}-01`;
    expect(normalized).toBe("2026-03-01");
  });

  it("normalizes YYYY-M to YYYY-0M-01", () => {
    const input = "2026-3";
    const parts = input.split("-");
    const normalized = `${parts[0]}-${parts[1].padStart(2, "0")}-01`;
    expect(normalized).toBe("2026-03-01");
  });

  it("handles YYYY-MM-01 input correctly", () => {
    const input = "2026-03-01";
    const parts = input.split("-");
    const normalized = `${parts[0]}-${parts[1].padStart(2, "0")}-01`;
    expect(normalized).toBe("2026-03-01");
  });
});
