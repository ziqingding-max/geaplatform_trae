import { getDb } from "../db";
import { countrySocialInsuranceItems, incomeTaxRules } from "../../drizzle/schema";
import { eq, and, or, isNull, lte, desc, sql } from "drizzle-orm";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CalculationInput {
  countryCode: string;
  year: number;
  salary: number; // Monthly base salary (gross)
  regionCode?: string;
  age?: number;
}

interface ReverseCalculationInput {
  countryCode: string;
  year: number;
  netPay: number; // Monthly net pay (take-home)
  regionCode?: string;
  age?: number;
}

interface ContributionItem {
  itemKey: string;
  itemNameEn: string;
  itemNameZh: string;
  category: string;
  employerContribution: string;
  employeeContribution: string;
  employerRate: string;
  employeeRate: string;
  capNote?: string;
}

interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

interface CalculationResult {
  countryCode: string;
  year: number;
  ruleYear: number;
  salary: number; // Monthly gross salary
  items: ContributionItem[];
  totalEmployer: string;
  totalEmployee: string;
  totalCost: string; // Salary + Employer Contribution
  // New fields for enhanced calculation
  incomeTax: string; // Monthly income tax
  netPay: string; // Monthly net pay = Salary - Employee SS - Income Tax
  totalEmployerCost: string; // = Salary + Employer SS (same as totalCost)
  taxDetails?: {
    annualGross: number;
    standardDeduction: number;
    annualEmployeeSS: number;
    annualTaxableIncome: number;
    annualTax: number;
    effectiveTaxRate: string;
    brackets: Array<{
      min: number;
      max: number;
      rate: string;
      taxableAmount: number;
      tax: number;
    }>;
  };
}

interface ReverseCalculationResult extends CalculationResult {
  mode: "reverse";
  inputNetPay: number;
  convergenceIterations: number;
}

// ─── Helper: Fetch social insurance rules ────────────────────────────────────

async function fetchSocialInsuranceRules(
  countryCode: string,
  year: number,
  regionCode?: string
) {
  const db = getDb();
  if (!db) throw new Error("Database connection failed");

  const buildWhereClause = (targetYear: number) => {
    return regionCode
      ? and(
          eq(countrySocialInsuranceItems.countryCode, countryCode),
          eq(countrySocialInsuranceItems.effectiveYear, targetYear),
          eq(countrySocialInsuranceItems.isActive, true),
          or(
            eq(countrySocialInsuranceItems.regionCode, regionCode),
            isNull(countrySocialInsuranceItems.regionCode)
          )
        )
      : and(
          eq(countrySocialInsuranceItems.countryCode, countryCode),
          eq(countrySocialInsuranceItems.effectiveYear, targetYear),
          eq(countrySocialInsuranceItems.isActive, true),
          isNull(countrySocialInsuranceItems.regionCode)
        );
  };

  let ruleYear = year;
  let rules = await db
    .select()
    .from(countrySocialInsuranceItems)
    .where(buildWhereClause(year))
    .orderBy(countrySocialInsuranceItems.sortOrder);

  // Year fallback
  if (rules.length === 0) {
    const fallbackResult = await db
      .select({
        maxYear: sql<number>`max(${countrySocialInsuranceItems.effectiveYear})`,
      })
      .from(countrySocialInsuranceItems)
      .where(
        and(
          eq(countrySocialInsuranceItems.countryCode, countryCode),
          lte(countrySocialInsuranceItems.effectiveYear, year),
          eq(countrySocialInsuranceItems.isActive, true)
        )
      );

    const fallbackYear = fallbackResult[0]?.maxYear;
    if (fallbackYear) {
      ruleYear = fallbackYear;
      rules = await db
        .select()
        .from(countrySocialInsuranceItems)
        .where(buildWhereClause(fallbackYear))
        .orderBy(countrySocialInsuranceItems.sortOrder);
    }
  }

  // Fallback for region-only countries
  if (rules.length === 0 && !regionCode) {
    const anyRules = await db.query.countrySocialInsuranceItems.findMany({
      where: and(
        eq(countrySocialInsuranceItems.countryCode, countryCode),
        eq(countrySocialInsuranceItems.effectiveYear, ruleYear),
        eq(countrySocialInsuranceItems.isActive, true)
      ),
      orderBy: [countrySocialInsuranceItems.sortOrder],
    });

    if (anyRules.length > 0) {
      const firstRegion = anyRules.find((r) => r.regionCode !== null)?.regionCode;
      if (firstRegion) {
        rules = anyRules.filter(
          (r) => r.regionCode === firstRegion || r.regionCode === null
        );
      } else {
        rules = anyRules;
      }
    }
  }

  return { rules, ruleYear };
}

// ─── Helper: Fetch income tax rules ──────────────────────────────────────────

async function fetchIncomeTaxRules(countryCode: string, year: number) {
  const db = getDb();
  if (!db) throw new Error("Database connection failed");

  // Try exact year first
  const exactMatch = await db
    .select()
    .from(incomeTaxRules)
    .where(
      and(
        eq(incomeTaxRules.countryCode, countryCode),
        eq(incomeTaxRules.taxYear, year),
        eq(incomeTaxRules.isActive, true)
      )
    )
    .limit(1);
  let taxRule = exactMatch[0] || null;

  // Fallback to most recent year
  if (!taxRule) {
    const fallback = await db
      .select()
      .from(incomeTaxRules)
      .where(
        and(
          eq(incomeTaxRules.countryCode, countryCode),
          lte(incomeTaxRules.taxYear, year),
          eq(incomeTaxRules.isActive, true)
        )
      )
      .orderBy(desc(incomeTaxRules.taxYear))
      .limit(1);
    taxRule = fallback[0] || null;
  }

  return taxRule;
}

// ─── Helper: Calculate social insurance for a given salary ───────────────────

function calculateSocialInsuranceFromRules(
  salary: number,
  rules: any[],
  countryCode: string,
  age?: number
): { items: ContributionItem[]; totalEmployer: number; totalEmployee: number } {
  const items: ContributionItem[] = [];
  let totalEmployer = 0;
  let totalEmployee = 0;

  for (const rule of rules) {
    // Filter by Age Bracket
    if (age !== undefined) {
      if (rule.ageBracketMin !== null && age < rule.ageBracketMin) continue;
      if (rule.ageBracketMax !== null && age > rule.ageBracketMax) continue;
    }

    const rateEmployer = parseFloat(rule.rateEmployer);
    const rateEmployee = parseFloat(rule.rateEmployee);

    // Calculate Employer Contribution
    let employerBase = salary;
    let employerCapNote = "";

    if (rule.capType === "fixed_amount" && rule.capBase) {
      const cap = parseFloat(rule.capBase);
      if (salary > cap) {
        employerBase = cap;
        employerCapNote = `Capped at ${cap}`;
      }
    } else if (
      rule.capType === "salary_multiple" &&
      rule.capMultiplier &&
      rule.capReferenceBase
    ) {
      const ref = parseFloat(rule.capReferenceBase);
      const mult = parseFloat(rule.capMultiplier);
      const cap = ref * mult;
      if (salary > cap) {
        employerBase = cap;
        employerCapNote = `Capped at ${cap} (${mult}x Base)`;
      }
    }

    let employerAmount = employerBase * rateEmployer;

    // Calculate Employee Contribution
    let employeeBase = salary;
    let employeeCapNote = "";

    // HK MPF Min Salary check
    if (countryCode === "HK" && rule.salaryBracketMin) {
      const minSalary = parseFloat(rule.salaryBracketMin);
      if (salary < minSalary) {
        employeeBase = 0;
        employeeCapNote = `Below min salary ${minSalary}`;
      }
    }

    if (employeeBase > 0) {
      if (rule.capType === "fixed_amount" && rule.capBase) {
        const cap = parseFloat(rule.capBase);
        if (salary > cap) {
          employeeBase = cap;
        }
      } else if (
        rule.capType === "salary_multiple" &&
        rule.capMultiplier &&
        rule.capReferenceBase
      ) {
        const ref = parseFloat(rule.capReferenceBase);
        const mult = parseFloat(rule.capMultiplier);
        const cap = ref * mult;
        if (salary > cap) {
          employeeBase = cap;
        }
      }
    }

    let employeeAmount = employeeBase * rateEmployee;

    // Rounding
    employerAmount = Math.round(employerAmount * 100) / 100;
    employeeAmount = Math.round(employeeAmount * 100) / 100;

    totalEmployer += employerAmount;
    totalEmployee += employeeAmount;

    items.push({
      itemKey: rule.itemKey,
      itemNameEn: rule.itemNameEn,
      itemNameZh: rule.itemNameZh,
      category: rule.category,
      employerContribution: employerAmount.toFixed(2),
      employeeContribution: employeeAmount.toFixed(2),
      employerRate: `${(rateEmployer * 100).toFixed(2)}%`,
      employeeRate: `${(rateEmployee * 100).toFixed(2)}%`,
      capNote: employerCapNote || employeeCapNote || undefined,
    });
  }

  return { items, totalEmployer, totalEmployee };
}

// ─── Helper: Calculate annual income tax ─────────────────────────────────────

function calculateAnnualIncomeTax(
  annualGross: number,
  annualEmployeeSS: number,
  taxRule: {
    standardDeductionAnnual: string;
    taxBrackets: unknown;
    socialSecurityDeductible: boolean;
  }
): {
  annualTax: number;
  standardDeduction: number;
  annualTaxableIncome: number;
  effectiveTaxRate: number;
  bracketDetails: Array<{
    min: number;
    max: number;
    rate: string;
    taxableAmount: number;
    tax: number;
  }>;
} {
  const standardDeduction = parseFloat(taxRule.standardDeductionAnnual) || 0;
  const brackets = taxRule.taxBrackets as TaxBracket[];

  // Calculate taxable income
  let annualTaxableIncome = annualGross - standardDeduction;
  if (taxRule.socialSecurityDeductible) {
    annualTaxableIncome -= annualEmployeeSS;
  }
  annualTaxableIncome = Math.max(0, annualTaxableIncome);

  // Apply progressive brackets
  let totalTax = 0;
  const bracketDetails: Array<{
    min: number;
    max: number;
    rate: string;
    taxableAmount: number;
    tax: number;
  }> = [];

  for (const bracket of brackets) {
    if (annualTaxableIncome <= bracket.min) break;

    const taxableInBracket = Math.min(annualTaxableIncome, bracket.max) - bracket.min;
    if (taxableInBracket <= 0) continue;

    const taxInBracket = Math.round(taxableInBracket * bracket.rate * 100) / 100;
    totalTax += taxInBracket;

    bracketDetails.push({
      min: bracket.min,
      max: bracket.max,
      rate: `${(bracket.rate * 100).toFixed(1)}%`,
      taxableAmount: Math.round(taxableInBracket * 100) / 100,
      tax: taxInBracket,
    });
  }

  totalTax = Math.round(totalTax * 100) / 100;
  const effectiveTaxRate = annualGross > 0 ? totalTax / annualGross : 0;

  return {
    annualTax: totalTax,
    standardDeduction,
    annualTaxableIncome,
    effectiveTaxRate,
    bracketDetails,
  };
}

// ─── Main Service ────────────────────────────────────────────────────────────

export const calculationService = {
  /**
   * Forward calculation: Gross Salary → Net Pay + Employer Cost
   * Enhanced with income tax calculation
   */
  calculateSocialInsurance: async (
    input: CalculationInput
  ): Promise<CalculationResult> => {
    const { countryCode, year, salary, regionCode, age } = input;

    // 1. Fetch social insurance rules
    const { rules, ruleYear } = await fetchSocialInsuranceRules(
      countryCode,
      year,
      regionCode
    );

    // 2. Calculate social insurance
    const { items, totalEmployer, totalEmployee } =
      calculateSocialInsuranceFromRules(salary, rules, countryCode, age);

    // 3. Fetch and calculate income tax
    const taxRule = await fetchIncomeTaxRules(countryCode, year);
    let monthlyTax = 0;
    let taxDetails: CalculationResult["taxDetails"] = undefined;

    if (taxRule) {
      const annualGross = salary * 12;
      const annualEmployeeSS = totalEmployee * 12;

      const taxResult = calculateAnnualIncomeTax(
        annualGross,
        annualEmployeeSS,
        taxRule
      );

      monthlyTax = Math.round((taxResult.annualTax / 12) * 100) / 100;

      taxDetails = {
        annualGross,
        standardDeduction: taxResult.standardDeduction,
        annualEmployeeSS,
        annualTaxableIncome: taxResult.annualTaxableIncome,
        annualTax: taxResult.annualTax,
        effectiveTaxRate: `${(taxResult.effectiveTaxRate * 100).toFixed(2)}%`,
        brackets: taxResult.bracketDetails,
      };
    }

    // 4. Calculate net pay
    const netPay = Math.round((salary - totalEmployee - monthlyTax) * 100) / 100;

    return {
      countryCode,
      year,
      ruleYear,
      salary,
      items,
      totalEmployer: totalEmployer.toFixed(2),
      totalEmployee: totalEmployee.toFixed(2),
      totalCost: (salary + totalEmployer).toFixed(2),
      incomeTax: monthlyTax.toFixed(2),
      netPay: Math.max(0, netPay).toFixed(2),
      totalEmployerCost: (salary + totalEmployer).toFixed(2),
      taxDetails,
    };
  },

  /**
   * Reverse calculation: Net Pay → Gross Salary + Employer Cost
   * Uses binary search to find the gross salary that produces the target net pay.
   */
  calculateReverseFromNetPay: async (
    input: ReverseCalculationInput
  ): Promise<ReverseCalculationResult> => {
    const { countryCode, year, netPay, regionCode, age } = input;

    // 1. Fetch rules (only once, reuse for all iterations)
    const { rules, ruleYear } = await fetchSocialInsuranceRules(
      countryCode,
      year,
      regionCode
    );
    const taxRule = await fetchIncomeTaxRules(countryCode, year);

    // 2. Define the forward calculation function (pure, no DB calls)
    const forwardCalc = (grossSalary: number) => {
      const { items, totalEmployer, totalEmployee } =
        calculateSocialInsuranceFromRules(grossSalary, rules, countryCode, age);

      let monthlyTax = 0;
      if (taxRule) {
        const annualGross = grossSalary * 12;
        const annualEmployeeSS = totalEmployee * 12;
        const taxResult = calculateAnnualIncomeTax(
          annualGross,
          annualEmployeeSS,
          taxRule
        );
        monthlyTax = Math.round((taxResult.annualTax / 12) * 100) / 100;
      }

      const calculatedNetPay =
        Math.round((grossSalary - totalEmployee - monthlyTax) * 100) / 100;

      return {
        items,
        totalEmployer,
        totalEmployee,
        monthlyTax,
        netPay: calculatedNetPay,
      };
    };

    // 3. Binary search for gross salary
    const TOLERANCE = 0.01; // Within 0.01 currency unit
    const MAX_ITERATIONS = 100;

    // Initial bounds: net pay is at least the gross (lower bound),
    // and gross could be up to 5x net pay for high-tax countries
    let low = netPay;
    let high = netPay * 5;
    let iterations = 0;
    let bestGross = netPay;
    let bestResult = forwardCalc(netPay);

    // Verify upper bound is sufficient
    const highResult = forwardCalc(high);
    if (highResult.netPay < netPay) {
      // Extremely high tax scenario, expand upper bound
      high = netPay * 10;
    }

    while (iterations < MAX_ITERATIONS) {
      iterations++;
      const mid = Math.round(((low + high) / 2) * 100) / 100;
      const midResult = forwardCalc(mid);
      const diff = midResult.netPay - netPay;

      if (Math.abs(diff) <= TOLERANCE) {
        bestGross = mid;
        bestResult = midResult;
        break;
      }

      if (diff < 0) {
        // Net pay too low → gross needs to be higher
        low = mid;
      } else {
        // Net pay too high → gross needs to be lower
        high = mid;
      }

      bestGross = mid;
      bestResult = midResult;
    }

    // 4. Build the full result using the converged gross salary
    let taxDetails: CalculationResult["taxDetails"] = undefined;
    if (taxRule) {
      const annualGross = bestGross * 12;
      const annualEmployeeSS = bestResult.totalEmployee * 12;
      const taxResult = calculateAnnualIncomeTax(
        annualGross,
        annualEmployeeSS,
        taxRule
      );
      taxDetails = {
        annualGross,
        standardDeduction: taxResult.standardDeduction,
        annualEmployeeSS,
        annualTaxableIncome: taxResult.annualTaxableIncome,
        annualTax: taxResult.annualTax,
        effectiveTaxRate: `${(taxResult.effectiveTaxRate * 100).toFixed(2)}%`,
        brackets: taxResult.bracketDetails,
      };
    }

    return {
      mode: "reverse",
      inputNetPay: netPay,
      convergenceIterations: iterations,
      countryCode,
      year,
      ruleYear,
      salary: bestGross,
      items: bestResult.items,
      totalEmployer: bestResult.totalEmployer.toFixed(2),
      totalEmployee: bestResult.totalEmployee.toFixed(2),
      totalCost: (bestGross + bestResult.totalEmployer).toFixed(2),
      incomeTax: bestResult.monthlyTax.toFixed(2),
      netPay: bestResult.netPay.toFixed(2),
      totalEmployerCost: (bestGross + bestResult.totalEmployer).toFixed(2),
      taxDetails,
    };
  },
};
