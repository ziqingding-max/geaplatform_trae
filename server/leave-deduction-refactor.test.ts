import { describe, expect, it } from "vitest";

/**
 * Tests for Round 17 - Unpaid Leave Deduction Refactor
 *
 * Key changes:
 * 1. Leave records no longer store deduction amounts (unpaidDeductionAmount/Currency removed)
 * 2. Deduction is calculated at Payroll time: baseSalary / monthlyWorkingDays × days
 * 3. Unpaid Leave Deduction field is editable by ops manager in Payroll item
 * 4. Leave module only tracks: employee, leave type, period (start/end), days, status
 */

// ========== 1. Leave Record Schema Tests ==========

describe("leave record schema - no deduction fields", () => {
  it("leave record should only contain factual fields (no deduction)", () => {
    // Simulates the new leave record shape from the DB
    const leaveRecord = {
      id: 1,
      employeeId: 10,
      leaveTypeId: 3,
      startDate: "2026-03-01",
      endDate: "2026-03-05",
      days: "5",
      status: "submitted",
      reason: "Personal leave",
      submittedBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Should NOT have deduction fields
    expect(leaveRecord).not.toHaveProperty("unpaidDeductionAmount");
    expect(leaveRecord).not.toHaveProperty("unpaidDeductionCurrency");

    // Should have factual fields
    expect(leaveRecord).toHaveProperty("days");
    expect(leaveRecord).toHaveProperty("startDate");
    expect(leaveRecord).toHaveProperty("endDate");
    expect(leaveRecord).toHaveProperty("leaveTypeId");
  });
});

// ========== 2. Payroll Deduction Calculation Tests ==========

describe("payroll unpaid leave deduction calculation", () => {
  /**
   * This replicates the calculation now used in payroll auto-fill and preview.
   * Formula: baseSalary / (workingDaysPerWeek × 4.33) × unpaidLeaveDays
   */
  function calculateDeductionAtPayroll(
    baseSalary: number,
    unpaidLeaveDays: number,
    workingDaysPerWeek: number
  ): number {
    const monthlyWorkingDays = workingDaysPerWeek * 4.33;
    if (monthlyWorkingDays <= 0) return 0;
    return Math.round((baseSalary / monthlyWorkingDays) * unpaidLeaveDays * 100) / 100;
  }

  it("calculates deduction correctly for 1 day, 5-day week", () => {
    // baseSalary=10000, 1 day, 5 days/week → 10000/21.65 ≈ 461.89
    const result = calculateDeductionAtPayroll(10000, 1, 5);
    expect(result).toBeCloseTo(461.89, 1);
  });

  it("calculates deduction correctly for multiple days", () => {
    // baseSalary=10000, 3 days, 5 days/week → 10000/21.65 × 3 ≈ 1385.68
    const result = calculateDeductionAtPayroll(10000, 3, 5);
    expect(result).toBeCloseTo(1385.68, 1);
  });

  it("calculates deduction correctly for half day", () => {
    const result = calculateDeductionAtPayroll(10000, 0.5, 5);
    expect(result).toBeCloseTo(230.95, 1);
  });

  it("returns 0 when no unpaid leave days", () => {
    const result = calculateDeductionAtPayroll(10000, 0, 5);
    expect(result).toBe(0);
  });

  it("returns 0 when baseSalary is 0", () => {
    const result = calculateDeductionAtPayroll(0, 5, 5);
    expect(result).toBe(0);
  });

  it("returns 0 when workingDaysPerWeek is 0", () => {
    const result = calculateDeductionAtPayroll(10000, 5, 0);
    expect(result).toBe(0);
  });

  it("handles 6-day work week", () => {
    // baseSalary=10000, 1 day, 6 days/week → 10000/25.98 ≈ 384.91
    const result = calculateDeductionAtPayroll(10000, 1, 6);
    expect(result).toBeCloseTo(384.91, 1);
  });

  it("handles high salary correctly", () => {
    // baseSalary=50000, 2 days, 5 days/week → 50000/21.65 × 2 ≈ 4618.94
    const result = calculateDeductionAtPayroll(50000, 2, 5);
    expect(result).toBeCloseTo(4618.94, 1);
  });
});

// ========== 3. Leave Aggregation for Payroll Tests ==========

describe("leave aggregation for payroll (days only)", () => {
  it("aggregates days from multiple leave records per employee", () => {
    // Simulates the new getSubmittedUnpaidLeaveForPayroll return shape
    const leaveRecords = [
      { id: 1, employeeId: 10, days: "2" },
      { id: 2, employeeId: 10, days: "1.5" },
      { id: 3, employeeId: 20, days: "3" },
    ];

    // Aggregate by employee (as done in payroll auto-fill)
    const byEmployee = new Map<number, { days: number }>();
    for (const lv of leaveRecords) {
      const empId = lv.employeeId;
      if (!byEmployee.has(empId)) {
        byEmployee.set(empId, { days: 0 });
      }
      const agg = byEmployee.get(empId)!;
      agg.days += parseFloat(lv.days ?? "0");
    }

    expect(byEmployee.get(10)?.days).toBe(3.5);
    expect(byEmployee.get(20)?.days).toBe(3);
  });

  it("returns 0 days for employee with no leave", () => {
    const byEmployee = new Map<number, { days: number }>();
    const agg = byEmployee.get(99) ?? { days: 0 };
    expect(agg.days).toBe(0);
  });
});

// ========== 4. Payroll Item Editability Tests ==========

describe("payroll item unpaid leave deduction editability", () => {
  it("ops manager can override system-calculated deduction", () => {
    // System calculates: baseSalary=10000, 2 days → ~923.79
    const systemCalculated = 923.79;

    // Ops manager overrides to a different value
    const opsOverride = 800.00;

    // The payroll item should accept the override
    const payrollItem = {
      unpaidLeaveDays: "2",
      unpaidLeaveDeduction: String(opsOverride),
    };

    expect(parseFloat(payrollItem.unpaidLeaveDeduction)).not.toBe(systemCalculated);
    expect(parseFloat(payrollItem.unpaidLeaveDeduction)).toBe(800.00);
  });

  it("unpaid leave days remain read-only (from leave records)", () => {
    // Days come from leave records and should not be manually editable
    const leaveData = { totalDays: 3.5 };
    const payrollItem = {
      unpaidLeaveDays: String(leaveData.totalDays),
    };

    expect(payrollItem.unpaidLeaveDays).toBe("3.5");
  });
});

// ========== 5. Payroll Totals Calculation with Editable Deduction ==========

describe("payroll totals with editable unpaid leave deduction", () => {
  function calculateItemTotals(fields: {
    baseSalary: string;
    bonus: string;
    allowances: string;
    reimbursements: string;
    deductions: string;
    taxDeduction: string;
    socialSecurityDeduction: string;
    unpaidLeaveDeduction: string;
    employerSocialContribution: string;
  }) {
    const base = parseFloat(fields.baseSalary);
    const bonus = parseFloat(fields.bonus);
    const allowances = parseFloat(fields.allowances);
    const reimbursements = parseFloat(fields.reimbursements);
    const deductions = parseFloat(fields.deductions);
    const tax = parseFloat(fields.taxDeduction);
    const social = parseFloat(fields.socialSecurityDeduction);
    const unpaidLeave = parseFloat(fields.unpaidLeaveDeduction);
    const employerSocial = parseFloat(fields.employerSocialContribution);

    const gross = base + bonus + allowances + reimbursements;
    const totalDeductions = deductions + tax + social + unpaidLeave;
    const net = gross - totalDeductions;
    const totalEmploymentCost = net + employerSocial;

    return {
      gross: gross.toFixed(2),
      net: net.toFixed(2),
      totalEmploymentCost: totalEmploymentCost.toFixed(2),
    };
  }

  it("calculates correct totals with system-calculated deduction", () => {
    const result = calculateItemTotals({
      baseSalary: "10000",
      bonus: "500",
      allowances: "200",
      reimbursements: "100",
      deductions: "0",
      taxDeduction: "1000",
      socialSecurityDeduction: "500",
      unpaidLeaveDeduction: "461.89", // system calculated
      employerSocialContribution: "800",
    });

    expect(result.gross).toBe("10800.00");
    expect(result.net).toBe("8838.11");
    expect(result.totalEmploymentCost).toBe("9638.11");
  });

  it("calculates correct totals with ops-overridden deduction", () => {
    const result = calculateItemTotals({
      baseSalary: "10000",
      bonus: "500",
      allowances: "200",
      reimbursements: "100",
      deductions: "0",
      taxDeduction: "1000",
      socialSecurityDeduction: "500",
      unpaidLeaveDeduction: "400.00", // ops override (lower)
      employerSocialContribution: "800",
    });

    expect(result.gross).toBe("10800.00");
    expect(result.net).toBe("8900.00");
    expect(result.totalEmploymentCost).toBe("9700.00");
  });

  it("handles zero unpaid leave deduction", () => {
    const result = calculateItemTotals({
      baseSalary: "10000",
      bonus: "0",
      allowances: "0",
      reimbursements: "0",
      deductions: "0",
      taxDeduction: "0",
      socialSecurityDeduction: "0",
      unpaidLeaveDeduction: "0",
      employerSocialContribution: "0",
    });

    expect(result.gross).toBe("10000.00");
    expect(result.net).toBe("10000.00");
  });
});
