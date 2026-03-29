/**
 * Toolkit Enhanced Router — Backend APIs for Headhunter Toolkit
 *
 * Provides:
 *   1. Global Benefits — list / upsert / delete
 *   2. Hiring Compliance — get / upsert
 *   3. Document Templates — list / create / update / delete
 *   4. Start Date Predictor — algorithm combining notice period + public holidays + EOR SLA
 *   5. Enhanced Salary Benchmark — list with multi-dimension filters + chart data
 *
 * Permission:
 *   - Read endpoints use `userProcedure` (all authenticated users)
 *   - Write/CMS endpoints use `adminProcedure` (admin only)
 */
import { z } from "zod";
import { router } from "../_core/trpc";
import { adminProcedure, userProcedure } from "../procedures";
import { getDb } from "../db";
import {
  globalBenefits,
  hiringCompliance,
  documentTemplates,
  salaryBenchmarks,
  countriesConfig,
  publicHolidays,
} from "../../drizzle/schema";
import { eq, and, desc, asc, sql, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// ─── Helper: get DB or throw ──────────────────────────────────────────────────
function requireDb() {
  const db = getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  return db;
}

// ─── Start Date Predictor Algorithm ───────────────────────────────────────────
function addBusinessDays(
  startDate: Date,
  days: number,
  holidays: Set<string>,
  workingDaysPerWeek: number
): Date {
  let added = 0;
  const current = new Date(startDate);
  while (added < days) {
    current.setDate(current.getDate() + 1);
    const dayOfWeek = current.getDay(); // 0=Sun, 6=Sat
    const isWeekend =
      workingDaysPerWeek <= 5
        ? dayOfWeek === 0 || dayOfWeek === 6
        : workingDaysPerWeek <= 6
          ? dayOfWeek === 0 // Only Sunday off for 6-day weeks
          : false; // 7-day weeks, no weekend
    const dateStr = current.toISOString().split("T")[0];
    const isHoliday = holidays.has(dateStr);
    if (!isWeekend && !isHoliday) {
      added++;
    }
  }
  return current;
}

function getNextBusinessDay(date: Date, holidays: Set<string>, workingDaysPerWeek: number): Date {
  const current = new Date(date);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const dayOfWeek = current.getDay();
    const isWeekend =
      workingDaysPerWeek <= 5
        ? dayOfWeek === 0 || dayOfWeek === 6
        : workingDaysPerWeek <= 6
          ? dayOfWeek === 0
          : false;
    const dateStr = current.toISOString().split("T")[0];
    const isHoliday = holidays.has(dateStr);
    if (!isWeekend && !isHoliday) {
      return current;
    }
    current.setDate(current.getDate() + 1);
  }
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const toolkitEnhancedRouter = router({
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. GLOBAL BENEFITS
  // ═══════════════════════════════════════════════════════════════════════════

  /** List benefits by country (optionally filter by type) */
  listBenefits: userProcedure
    .input(
      z.object({
        countryCode: z.string(),
        benefitType: z.enum(["statutory", "customary"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = requireDb();
      const conditions = [
        eq(globalBenefits.countryCode, input.countryCode),
        eq(globalBenefits.isActive, true),
      ];
      if (input.benefitType) {
        conditions.push(eq(globalBenefits.benefitType, input.benefitType));
      }
      return await db
        .select()
        .from(globalBenefits)
        .where(and(...conditions))
        .orderBy(asc(globalBenefits.sortOrder), asc(globalBenefits.id));
    }),

  /** List all countries that have benefits data */
  listBenefitCountries: userProcedure.query(async () => {
    const db = requireDb();
    const rows = await db
      .selectDistinct({ countryCode: globalBenefits.countryCode })
      .from(globalBenefits)
      .where(eq(globalBenefits.isActive, true));
    return rows.map((r) => r.countryCode);
  }),

  /** CMS: List all benefits (including inactive) for admin management */
  adminListBenefits: adminProcedure
    .input(
      z.object({
        countryCode: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = requireDb();
      if (input?.countryCode) {
        return await db
          .select()
          .from(globalBenefits)
          .where(eq(globalBenefits.countryCode, input.countryCode))
          .orderBy(asc(globalBenefits.sortOrder), asc(globalBenefits.id));
      }
      return await db
        .select()
        .from(globalBenefits)
        .orderBy(asc(globalBenefits.countryCode), asc(globalBenefits.sortOrder));
    }),

  /** CMS: Upsert a benefit */
  upsertBenefit: adminProcedure
    .input(
      z.object({
        id: z.number().optional(),
        countryCode: z.string(),
        benefitType: z.enum(["statutory", "customary"]),
        category: z.enum([
          "social_security", "health_insurance", "pension", "paid_leave",
          "parental", "housing", "meal_transport", "bonus", "insurance",
          "equity", "wellness", "education", "other",
        ]),
        nameEn: z.string().min(1),
        nameZh: z.string().min(1),
        descriptionEn: z.string().min(1),
        descriptionZh: z.string().min(1),
        costIndication: z.string().optional(),
        pitchCardEn: z.string().optional(),
        pitchCardZh: z.string().optional(),
        source: z.string().optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = requireDb();
      const now = new Date();
      if (input.id) {
        await db
          .update(globalBenefits)
          .set({
            ...input,
            lastVerifiedAt: now,
            updatedAt: now,
          })
          .where(eq(globalBenefits.id, input.id));
        return { id: input.id };
      }
      const [res] = await db
        .insert(globalBenefits)
        .values({
          ...input,
          source: input.source || "manual",
          lastVerifiedAt: now,
        })
        .returning({ id: globalBenefits.id });
      return res;
    }),

  /** CMS: Delete a benefit */
  deleteBenefit: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = requireDb();
      await db.delete(globalBenefits).where(eq(globalBenefits.id, input.id));
      return { success: true };
    }),

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. HIRING COMPLIANCE
  // ═══════════════════════════════════════════════════════════════════════════

  /** Get compliance data for a country */
  getCompliance: userProcedure
    .input(z.object({ countryCode: z.string() }))
    .query(async ({ input }) => {
      const db = requireDb();
      return await db.query.hiringCompliance.findFirst({
        where: eq(hiringCompliance.countryCode, input.countryCode),
      });
    }),

  /** List all countries that have compliance data */
  listComplianceCountries: userProcedure.query(async () => {
    const db = requireDb();
    const rows = await db
      .select({ countryCode: hiringCompliance.countryCode })
      .from(hiringCompliance);
    return rows.map((r) => r.countryCode);
  }),

  /** CMS: List all compliance records */
  adminListCompliance: adminProcedure.query(async () => {
    const db = requireDb();
    return await db
      .select()
      .from(hiringCompliance)
      .orderBy(asc(hiringCompliance.countryCode));
  }),

  /** CMS: Upsert compliance data */
  upsertCompliance: adminProcedure
    .input(
      z.object({
        id: z.number().optional(),
        countryCode: z.string(),
        probationRulesEn: z.string().optional(),
        probationRulesZh: z.string().optional(),
        noticePeriodRulesEn: z.string().optional(),
        noticePeriodRulesZh: z.string().optional(),
        backgroundCheckRulesEn: z.string().optional(),
        backgroundCheckRulesZh: z.string().optional(),
        severanceRulesEn: z.string().optional(),
        severanceRulesZh: z.string().optional(),
        nonCompeteRulesEn: z.string().optional(),
        nonCompeteRulesZh: z.string().optional(),
        workPermitRulesEn: z.string().optional(),
        workPermitRulesZh: z.string().optional(),
        additionalNotesEn: z.string().optional(),
        additionalNotesZh: z.string().optional(),
        source: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = requireDb();
      const now = new Date();
      if (input.id) {
        await db
          .update(hiringCompliance)
          .set({
            ...input,
            lastVerifiedAt: now,
            updatedAt: now,
          })
          .where(eq(hiringCompliance.id, input.id));
        return { id: input.id };
      }
      const [res] = await db
        .insert(hiringCompliance)
        .values({
          ...input,
          source: input.source || "manual",
          lastVerifiedAt: now,
        })
        .returning({ id: hiringCompliance.id });
      return res;
    }),

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. DOCUMENT TEMPLATES
  // ═══════════════════════════════════════════════════════════════════════════

  /** List templates by country */
  listTemplates: userProcedure
    .input(
      z.object({
        countryCode: z.string().optional(),
        documentType: z.enum([
          "employment_contract", "offer_letter", "nda",
          "termination_letter", "employee_handbook", "other",
        ]).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = requireDb();
      const conditions = [eq(documentTemplates.isActive, true)];
      if (input?.countryCode) {
        conditions.push(eq(documentTemplates.countryCode, input.countryCode));
      }
      if (input?.documentType) {
        conditions.push(eq(documentTemplates.documentType, input.documentType));
      }
      return await db
        .select()
        .from(documentTemplates)
        .where(and(...conditions))
        .orderBy(asc(documentTemplates.countryCode), desc(documentTemplates.createdAt));
    }),

  /** List all countries that have templates */
  listTemplateCountries: userProcedure.query(async () => {
    const db = requireDb();
    const rows = await db
      .selectDistinct({ countryCode: documentTemplates.countryCode })
      .from(documentTemplates)
      .where(eq(documentTemplates.isActive, true));
    return rows.map((r) => r.countryCode);
  }),

  /** CMS: List all templates (including inactive) */
  adminListTemplates: adminProcedure
    .input(
      z.object({
        countryCode: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = requireDb();
      if (input?.countryCode) {
        return await db
          .select()
          .from(documentTemplates)
          .where(eq(documentTemplates.countryCode, input.countryCode))
          .orderBy(desc(documentTemplates.createdAt));
      }
      return await db
        .select()
        .from(documentTemplates)
        .orderBy(asc(documentTemplates.countryCode), desc(documentTemplates.createdAt));
    }),

  /** CMS: Upsert a template record */
  upsertTemplate: adminProcedure
    .input(
      z.object({
        id: z.number().optional(),
        countryCode: z.string(),
        documentType: z.enum([
          "employment_contract", "offer_letter", "nda",
          "termination_letter", "employee_handbook", "other",
        ]),
        titleEn: z.string().min(1),
        titleZh: z.string().min(1),
        descriptionEn: z.string().optional(),
        descriptionZh: z.string().optional(),
        fileUrl: z.string().min(1),
        fileName: z.string().min(1),
        fileSize: z.number().optional(),
        mimeType: z.string().optional(),
        version: z.string().optional(),
        source: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = requireDb();
      const now = new Date();
      if (input.id) {
        await db
          .update(documentTemplates)
          .set({
            ...input,
            lastVerifiedAt: now,
            updatedAt: now,
          })
          .where(eq(documentTemplates.id, input.id));
        return { id: input.id };
      }
      const [res] = await db
        .insert(documentTemplates)
        .values({
          ...input,
          source: input.source || "manual",
          lastVerifiedAt: now,
        })
        .returning({ id: documentTemplates.id });
      return res;
    }),

  /** CMS: Delete a template */
  deleteTemplate: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = requireDb();
      await db.delete(documentTemplates).where(eq(documentTemplates.id, input.id));
      return { success: true };
    }),

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. START DATE PREDICTOR
  // ═══════════════════════════════════════════════════════════════════════════

  /** Predict the earliest realistic start date */
  predictStartDate: userProcedure
    .input(
      z.object({
        countryCode: z.string(),
        resignationDate: z.string(), // ISO date string, e.g. "2026-04-01"
        eorOnboardingSla: z.number().default(10), // business days for EOR setup
        customNoticePeriodDays: z.number().optional(), // override default
      })
    )
    .query(async ({ input }) => {
      const db = requireDb();

      // 1. Get country config
      const country = await db.query.countriesConfig.findFirst({
        where: eq(countriesConfig.countryCode, input.countryCode),
      });
      if (!country) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Country not found" });
      }

      const noticePeriodDays = input.customNoticePeriodDays ?? country.noticePeriodDays ?? 30;
      const workingDaysPerWeek = country.workingDaysPerWeek ?? 5;

      // 2. Get public holidays for relevant years
      const resignDate = new Date(input.resignationDate);
      const year = resignDate.getFullYear();
      const holidayRows = await db
        .select({ holidayDate: publicHolidays.holidayDate })
        .from(publicHolidays)
        .where(
          and(
            eq(publicHolidays.countryCode, input.countryCode),
            inArray(publicHolidays.year, [year, year + 1])
          )
        );
      const holidaySet = new Set(holidayRows.map((h) => h.holidayDate));

      // 3. Calculate notice period end date (in business days)
      const noticePeriodEndDate = addBusinessDays(
        resignDate,
        noticePeriodDays,
        holidaySet,
        workingDaysPerWeek
      );

      // 4. Add EOR onboarding SLA (in business days)
      const eorReadyDate = addBusinessDays(
        noticePeriodEndDate,
        input.eorOnboardingSla,
        holidaySet,
        workingDaysPerWeek
      );

      // 5. Ensure start date is a business day
      const earliestStartDate = getNextBusinessDay(eorReadyDate, holidaySet, workingDaysPerWeek);

      // 6. Collect holidays in the range for calendar display
      const rangeStart = resignDate.toISOString().split("T")[0];
      const rangeEnd = new Date(earliestStartDate.getTime() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      const holidaysInRange = holidayRows
        .filter((h) => h.holidayDate >= rangeStart && h.holidayDate <= rangeEnd)
        .map((h) => h.holidayDate);

      return {
        countryCode: input.countryCode,
        countryName: country.countryName,
        resignationDate: input.resignationDate,
        noticePeriodDays,
        noticePeriodEndDate: noticePeriodEndDate.toISOString().split("T")[0],
        eorOnboardingSla: input.eorOnboardingSla,
        eorReadyDate: eorReadyDate.toISOString().split("T")[0],
        earliestStartDate: earliestStartDate.toISOString().split("T")[0],
        workingDaysPerWeek,
        holidaysInRange,
      };
    }),

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. ENHANCED SALARY BENCHMARK
  // ═══════════════════════════════════════════════════════════════════════════

  /** List benchmarks with multi-dimension filters */
  listBenchmarks: userProcedure
    .input(
      z.object({
        countryCode: z.string(),
        jobCategory: z.string().optional(),
        seniorityLevel: z.enum(["junior", "mid", "senior", "lead", "director"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = requireDb();
      const conditions = [eq(salaryBenchmarks.countryCode, input.countryCode)];
      if (input.jobCategory) {
        conditions.push(eq(salaryBenchmarks.jobCategory, input.jobCategory));
      }
      if (input.seniorityLevel) {
        conditions.push(eq(salaryBenchmarks.seniorityLevel, input.seniorityLevel));
      }
      return await db
        .select()
        .from(salaryBenchmarks)
        .where(and(...conditions))
        .orderBy(asc(salaryBenchmarks.jobCategory), asc(salaryBenchmarks.seniorityLevel));
    }),

  /** Get chart data: salary distribution by seniority for a job category */
  getBenchmarkChartData: userProcedure
    .input(
      z.object({
        countryCode: z.string(),
        jobCategory: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = requireDb();
      const rows = await db
        .select()
        .from(salaryBenchmarks)
        .where(
          and(
            eq(salaryBenchmarks.countryCode, input.countryCode),
            eq(salaryBenchmarks.jobCategory, input.jobCategory)
          )
        )
        .orderBy(asc(salaryBenchmarks.seniorityLevel));

      const seniorityOrder = ["junior", "mid", "senior", "lead", "director"];
      const sorted = [...rows].sort(
        (a, b) => seniorityOrder.indexOf(a.seniorityLevel) - seniorityOrder.indexOf(b.seniorityLevel)
      );

      return {
        currency: sorted[0]?.currency || "USD",
        dataYear: sorted[0]?.dataYear || new Date().getFullYear(),
        chartData: sorted.map((r) => ({
          seniority: r.seniorityLevel,
          jobTitle: r.jobTitle,
          p25: parseFloat(r.salaryP25),
          p50: parseFloat(r.salaryP50),
          p75: parseFloat(r.salaryP75),
        })),
      };
    }),

  /** List all job categories for a country */
  listJobCategories: userProcedure
    .input(z.object({ countryCode: z.string() }))
    .query(async ({ input }) => {
      const db = requireDb();
      const rows = await db
        .selectDistinct({ category: salaryBenchmarks.jobCategory })
        .from(salaryBenchmarks)
        .where(eq(salaryBenchmarks.countryCode, input.countryCode));
      return rows.map((r) => r.category);
    }),

  /** List all countries that have benchmark data */
  listBenchmarkCountries: userProcedure.query(async () => {
    const db = requireDb();
    const rows = await db
      .selectDistinct({ countryCode: salaryBenchmarks.countryCode })
      .from(salaryBenchmarks);
    return rows.map((r) => r.countryCode);
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. SHARED: Countries list for toolkit dropdowns
  // ═══════════════════════════════════════════════════════════════════════════

  /** List all active countries with key metadata */
  listCountries: userProcedure.query(async () => {
    const db = requireDb();
    return await db
      .select({
        countryCode: countriesConfig.countryCode,
        countryName: countriesConfig.countryName,
        localCurrency: countriesConfig.localCurrency,
        noticePeriodDays: countriesConfig.noticePeriodDays,
        probationPeriodDays: countriesConfig.probationPeriodDays,
        workingDaysPerWeek: countriesConfig.workingDaysPerWeek,
        statutoryAnnualLeave: countriesConfig.statutoryAnnualLeave,
        isActive: countriesConfig.isActive,
      })
      .from(countriesConfig)
      .where(eq(countriesConfig.isActive, true))
      .orderBy(asc(countriesConfig.countryName));
  }),
});
