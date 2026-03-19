import { getDb } from "../db";
import { countrySocialInsuranceItems } from "../../drizzle/schema";
import { eq, and, or, isNull, lte, desc, sql } from "drizzle-orm";

interface CalculationInput {
  countryCode: string;
  year: number;
  salary: number; // Monthly base salary
  regionCode?: string; // Optional: e.g. "CN-SH" for Shanghai
  age?: number; // Optional: for age-based rules (e.g. SG CPF)
}

interface ContributionItem {
  itemKey: string;
  itemNameEn: string;
  itemNameZh: string;
  category: string;
  employerContribution: string; // Formatted to 2 decimals
  employeeContribution: string; // Formatted to 2 decimals
  employerRate: string; // Display string
  employeeRate: string; // Display string
  capNote?: string; // Explanation of cap if applied
}

interface CalculationResult {
  countryCode: string;
  year: number;
  ruleYear: number; // The actual year of the rules used (may differ from requested year due to fallback)
  salary: number;
  items: ContributionItem[];
  totalEmployer: string;
  totalEmployee: string;
  totalCost: string; // Salary + Employer Contribution
}

export const calculationService = {
  /**
   * Calculate social insurance contributions for a given salary.
   * If no rules exist for the requested year, automatically falls back
   * to the most recent available year's rules for the given country.
   */
  calculateSocialInsurance: async (input: CalculationInput): Promise<CalculationResult> => {
    const { countryCode, year, salary, regionCode, age } = input;

    const db = getDb();
    if (!db) throw new Error("Database connection failed");

    // Helper: build WHERE clause for a specific year
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

    // 1. Try fetching rules for the requested year
    let ruleYear = year;
    let rules = await db
      .select()
      .from(countrySocialInsuranceItems)
      .where(buildWhereClause(year))
      .orderBy(countrySocialInsuranceItems.sortOrder);

    // 2. Year fallback: if no rules found for requested year, find the most recent available year
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

    // 3. Fallback logic for countries where ALL rules might be tied to a region,
    // but no region was selected (e.g. US, VN, CA).
    // In this case, we pick the first available region's rules as a representative estimate.
    if (rules.length === 0 && !regionCode) {
        const anyRules = await db.query.countrySocialInsuranceItems.findMany({
            where: and(
                eq(countrySocialInsuranceItems.countryCode, countryCode),
                eq(countrySocialInsuranceItems.effectiveYear, ruleYear),
                eq(countrySocialInsuranceItems.isActive, true)
            ),
            orderBy: [countrySocialInsuranceItems.sortOrder]
        });
        
        if (anyRules.length > 0) {
            // Pick rules from the first region found
            const firstRegion = anyRules.find(r => r.regionCode !== null)?.regionCode;
            if (firstRegion) {
                rules = anyRules.filter(r => r.regionCode === firstRegion || r.regionCode === null);
            } else {
                rules = anyRules;
            }
        }
    }

    const items: ContributionItem[] = [];
    let totalEmployer = 0;
    let totalEmployee = 0;

    for (const rule of rules) {
      // 4. Filter by Age Bracket if applicable
      if (age !== undefined) {
        if (rule.ageBracketMin !== null && age < rule.ageBracketMin) continue;
        if (rule.ageBracketMax !== null && age > rule.ageBracketMax) continue;
      }

      // 5. Filter by Salary Bracket if applicable (e.g. HK MPF min salary)
      
      const rateEmployer = parseFloat(rule.rateEmployer);
      const rateEmployee = parseFloat(rule.rateEmployee);

      // 6. Calculate Employer Contribution
      let employerBase = salary;
      let employerCapNote = "";
      
      // Apply Cap Logic for Employer
      if (rule.capType === "fixed_amount" && rule.capBase) {
        const cap = parseFloat(rule.capBase);
        if (salary > cap) {
          employerBase = cap;
          employerCapNote = `Capped at ${cap}`;
        }
      } else if (rule.capType === "salary_multiple" && rule.capMultiplier && rule.capReferenceBase) {
        const ref = parseFloat(rule.capReferenceBase);
        const mult = parseFloat(rule.capMultiplier);
        const cap = ref * mult;
        if (salary > cap) {
          employerBase = cap;
          employerCapNote = `Capped at ${cap} (${mult}x Base)`;
        }
      }

      let employerAmount = employerBase * rateEmployer;

      // 7. Calculate Employee Contribution
      let employeeBase = salary;
      let employeeCapNote = "";

      // Special Case: HK MPF Min Salary check for Employee
      if (countryCode === "HK" && rule.salaryBracketMin) {
        const minSalary = parseFloat(rule.salaryBracketMin);
        if (salary < minSalary) {
            employeeBase = 0; // Exempt
            employeeCapNote = `Below min salary ${minSalary}`;
        }
      }
      
      // Apply Cap Logic for Employee (same as Employer usually, but calculated independently)
      if (employeeBase > 0) {
        if (rule.capType === "fixed_amount" && rule.capBase) {
            const cap = parseFloat(rule.capBase);
            if (salary > cap) {
            employeeBase = cap;
            }
        } else if (rule.capType === "salary_multiple" && rule.capMultiplier && rule.capReferenceBase) {
            const ref = parseFloat(rule.capReferenceBase);
            const mult = parseFloat(rule.capMultiplier);
            const cap = ref * mult;
            if (salary > cap) {
            employeeBase = cap;
            }
        }
      }

      let employeeAmount = employeeBase * rateEmployee;

      // Rounding (2 decimals)
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
        capNote: employerCapNote || employeeCapNote || undefined
      });
    }

    return {
      countryCode,
      year,
      ruleYear,
      salary,
      items,
      totalEmployer: totalEmployer.toFixed(2),
      totalEmployee: totalEmployee.toFixed(2),
      totalCost: (salary + totalEmployer).toFixed(2)
    };
  }
};
