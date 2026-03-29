/**
 * Toolkit Enhanced Router — Backend APIs for Headhunter Toolkit
 *
 * Provides:
 *   1. Global Benefits — getBenefitsByCountry / createBenefit / updateBenefit / deleteBenefit
 *   2. Hiring Compliance — getComplianceByCountry / createCompliance / updateCompliance / deleteCompliance
 *   3. Document Templates — getDocumentTemplates / createTemplate / updateTemplate / deleteTemplate
 *   4. Start Date Predictor — predictStartDate (mutation)
 *   5. Enhanced Salary Benchmark — getSalaryBenchmarks / getBenchmarkChartData / listJobCategories
 *   6. Shared — getActiveCountries
 *   7. Proposal PDF — generateProposal
 *
 * Permission:
 *   - Read endpoints use `userProcedure` (all authenticated users)
 *   - Write/CMS endpoints use `adminProcedure` (admin only)
 *
 * Naming convention: frontend procedure names are the source of truth.
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
import { generateProposalPdf, type ProposalData } from "../services/proposalPdfService";

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

  /** List benefits by country (optionally filter by type) — used by toolkit pages */
  getBenefitsByCountry: userProcedure
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

  /** CMS: Create a new benefit */
  createBenefit: adminProcedure
    .input(
      z.object({
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

  /** CMS: Update an existing benefit */
  updateBenefit: adminProcedure
    .input(
      z.object({
        id: z.number(),
        countryCode: z.string().optional(),
        benefitType: z.enum(["statutory", "customary"]).optional(),
        category: z.enum([
          "social_security", "health_insurance", "pension", "paid_leave",
          "parental", "housing", "meal_transport", "bonus", "insurance",
          "equity", "wellness", "education", "other",
        ]).optional(),
        nameEn: z.string().min(1).optional(),
        nameZh: z.string().min(1).optional(),
        descriptionEn: z.string().min(1).optional(),
        descriptionZh: z.string().min(1).optional(),
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
      const { id, ...data } = input;
      await db
        .update(globalBenefits)
        .set({
          ...data,
          lastVerifiedAt: now,
          updatedAt: now,
        })
        .where(eq(globalBenefits.id, id));
      return { id };
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

  /** Get compliance data for a country — used by toolkit pages */
  getComplianceByCountry: userProcedure
    .input(z.object({ countryCode: z.string() }))
    .query(async ({ input }) => {
      const db = requireDb();
      const rows = await db
        .select()
        .from(hiringCompliance)
        .where(eq(hiringCompliance.countryCode, input.countryCode));
      return rows[0] || null;
    }),

  /** CMS: Create a new compliance record */
  createCompliance: adminProcedure
    .input(
      z.object({
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

  /** CMS: Update an existing compliance record */
  updateCompliance: adminProcedure
    .input(
      z.object({
        id: z.number(),
        countryCode: z.string().optional(),
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
      const { id, ...data } = input;
      await db
        .update(hiringCompliance)
        .set({
          ...data,
          lastVerifiedAt: now,
          updatedAt: now,
        })
        .where(eq(hiringCompliance.id, id));
      return { id };
    }),

  /** CMS: Delete a compliance record */
  deleteCompliance: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = requireDb();
      await db.delete(hiringCompliance).where(eq(hiringCompliance.id, input.id));
      return { success: true };
    }),

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. DOCUMENT TEMPLATES
  // ═══════════════════════════════════════════════════════════════════════════

  /** List templates by country — used by toolkit pages */
  getDocumentTemplates: userProcedure
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

  /** CMS: Create a new template record */
  createTemplate: adminProcedure
    .input(
      z.object({
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

  /** CMS: Update an existing template record */
  updateTemplate: adminProcedure
    .input(
      z.object({
        id: z.number(),
        countryCode: z.string().optional(),
        documentType: z.enum([
          "employment_contract", "offer_letter", "nda",
          "termination_letter", "employee_handbook", "other",
        ]).optional(),
        titleEn: z.string().min(1).optional(),
        titleZh: z.string().min(1).optional(),
        descriptionEn: z.string().optional(),
        descriptionZh: z.string().optional(),
        fileUrl: z.string().min(1).optional(),
        fileName: z.string().min(1).optional(),
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
      const { id, ...data } = input;
      await db
        .update(documentTemplates)
        .set({
          ...data,
          lastVerifiedAt: now,
          updatedAt: now,
        })
        .where(eq(documentTemplates.id, id));
      return { id };
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
  // 4. START DATE PREDICTOR (mutation — frontend uses useMutation)
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
    .mutation(async ({ input }) => {
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
        .select({ holidayDate: publicHolidays.holidayDate, holidayName: publicHolidays.holidayName, localName: publicHolidays.localName })
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
        .map((h) => ({ date: h.holidayDate, name: h.holidayName, localName: h.localName }));

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

  /** List benchmarks with multi-dimension filters — used by toolkit pages */
  getSalaryBenchmarks: userProcedure
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

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. SHARED: Countries list for toolkit dropdowns
  // ═══════════════════════════════════════════════════════════════════════════

  /** List all active countries with key metadata — used by all toolkit pages */
  getActiveCountries: userProcedure.query(async () => {
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

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. PROPOSAL: Generate combined PDF from cart items
  // ═══════════════════════════════════════════════════════════════════════════

  /** Generate a combined Proposal PDF from selected toolkit sections */
  generateProposal: userProcedure
    .input(
      z.object({
        sections: z.array(
          z.object({
            type: z.enum(["benefits", "compliance", "salary", "start_date", "templates"]),
            countryCode: z.string(),
          })
        ),
        locale: z.enum(["en", "zh"]).optional().default("en"),
        clientName: z.string().optional(),
        preparedBy: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = requireDb();

      // Resolve country names
      const countryCodes = Array.from(new Set(input.sections.map((s) => s.countryCode)));
      const countries = await db
        .select({ countryCode: countriesConfig.countryCode, countryName: countriesConfig.countryName })
        .from(countriesConfig)
        .where(inArray(countriesConfig.countryCode, countryCodes));
      const countryMap = Object.fromEntries(countries.map((c) => [c.countryCode, c.countryName]));

      // Build proposal sections by fetching data for each cart item
      const proposalSections: ProposalData["sections"] = [];

      for (const section of input.sections) {
        const countryName = countryMap[section.countryCode] || section.countryCode;

        switch (section.type) {
          case "benefits": {
            const rows = await db
              .select()
              .from(globalBenefits)
              .where(and(eq(globalBenefits.countryCode, section.countryCode), eq(globalBenefits.isActive, true)))
              .orderBy(asc(globalBenefits.sortOrder));
            proposalSections.push({
              type: "benefits",
              country: countryName,
              countryCode: section.countryCode,
              data: rows.map((r) => ({
                nameEn: r.nameEn,
                nameZh: r.nameZh,
                category: r.category,
                descriptionEn: r.descriptionEn,
                descriptionZh: r.descriptionZh,
                costIndication: r.costIndication,
              })),
            });
            break;
          }
          case "compliance": {
            const row = await db
              .select()
              .from(hiringCompliance)
              .where(eq(hiringCompliance.countryCode, section.countryCode))
              .then((rows) => rows[0]);
            if (row) {
              const metrics: Array<{
                metricNameEn: string;
                metricNameZh: string;
                metricValueEn: string | null;
                metricValueZh: string | null;
                riskLevel: string;
                category: string;
              }> = [];
              if (row.probationRulesEn) metrics.push({ metricNameEn: "Probation Period", metricNameZh: "试用期", metricValueEn: row.probationRulesEn, metricValueZh: row.probationRulesZh, riskLevel: "low", category: "probation" });
              if (row.noticePeriodRulesEn) metrics.push({ metricNameEn: "Notice Period", metricNameZh: "通知期", metricValueEn: row.noticePeriodRulesEn, metricValueZh: row.noticePeriodRulesZh, riskLevel: "medium", category: "notice" });
              if (row.backgroundCheckRulesEn) metrics.push({ metricNameEn: "Background Check", metricNameZh: "背景调查", metricValueEn: row.backgroundCheckRulesEn, metricValueZh: row.backgroundCheckRulesZh, riskLevel: "medium", category: "background_check" });
              if (row.severanceRulesEn) metrics.push({ metricNameEn: "Severance Pay", metricNameZh: "遣散费", metricValueEn: row.severanceRulesEn, metricValueZh: row.severanceRulesZh, riskLevel: "high", category: "severance" });
              if (row.nonCompeteRulesEn) metrics.push({ metricNameEn: "Non-Compete", metricNameZh: "竞业限制", metricValueEn: row.nonCompeteRulesEn, metricValueZh: row.nonCompeteRulesZh, riskLevel: "medium", category: "non_compete" });
              if (row.workPermitRulesEn) metrics.push({ metricNameEn: "Work Permit", metricNameZh: "工作许可", metricValueEn: row.workPermitRulesEn, metricValueZh: row.workPermitRulesZh, riskLevel: "high", category: "work_permit" });
              proposalSections.push({
                type: "compliance",
                country: countryName,
                countryCode: section.countryCode,
                data: metrics,
              });
            }
            break;
          }
          case "salary": {
            const rows = await db
              .select()
              .from(salaryBenchmarks)
              .where(eq(salaryBenchmarks.countryCode, section.countryCode))
              .orderBy(asc(salaryBenchmarks.jobCategory), asc(salaryBenchmarks.seniorityLevel));
            proposalSections.push({
              type: "salary",
              country: countryName,
              countryCode: section.countryCode,
              data: rows.map((r) => ({
                jobTitle: r.jobTitle,
                seniorityLevel: r.seniorityLevel,
                salaryP25: r.salaryP25,
                salaryP50: r.salaryP50,
                salaryP75: r.salaryP75,
                currency: r.currency,
              })),
            });
            break;
          }
          case "start_date": {
            const countryRow = await db
              .select()
              .from(countriesConfig)
              .where(eq(countriesConfig.countryCode, section.countryCode))
              .then((rows) => rows[0]);
            const noticePeriodDays = countryRow?.noticePeriodDays ?? 30;
            const workingDaysPerWeek = countryRow?.workingDaysPerWeek ?? 5;
            const eorOnboardingDays = 10;
            const today = new Date();

            // Fetch holidays using correct column names
            const year = today.getFullYear();
            const holidayRowsForProposal = await db
              .select({ holidayDate: publicHolidays.holidayDate, holidayName: publicHolidays.holidayName, localName: publicHolidays.localName })
              .from(publicHolidays)
              .where(
                and(
                  eq(publicHolidays.countryCode, section.countryCode),
                  inArray(publicHolidays.year, [year, year + 1])
                )
              );
            const holidaySetForProposal = new Set(holidayRowsForProposal.map((h) => h.holidayDate));

            // Calculate: notice period (business days) + EOR onboarding (business days)
            const afterNotice = addBusinessDays(today, noticePeriodDays, holidaySetForProposal, workingDaysPerWeek);
            const candidateDate = addBusinessDays(afterNotice, eorOnboardingDays, holidaySetForProposal, workingDaysPerWeek);
            const startDate = getNextBusinessDay(candidateDate, holidaySetForProposal, workingDaysPerWeek);

            // Filter holidays in range
            const rangeStartStr = today.toISOString().split("T")[0];
            const rangeEndStr = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
            const holidaysInRange = holidayRowsForProposal
              .filter((h) => h.holidayDate >= rangeStartStr && h.holidayDate <= rangeEndStr)
              .map((h) => `${h.holidayDate} (${h.localName || h.holidayName})`);

            proposalSections.push({
              type: "start_date",
              country: countryName,
              countryCode: section.countryCode,
              data: [{
                countryName,
                noticePeriodDays,
                eorOnboardingDays,
                holidaysInRange,
                earliestStartDate: startDate.toISOString().split("T")[0],
              }],
            });
            break;
          }
          case "templates": {
            const rows = await db
              .select()
              .from(documentTemplates)
              .where(and(eq(documentTemplates.countryCode, section.countryCode), eq(documentTemplates.isActive, true)))
              .orderBy(asc(documentTemplates.countryCode), desc(documentTemplates.createdAt));
            proposalSections.push({
              type: "templates",
              country: countryName,
              countryCode: section.countryCode,
              data: rows.map((r) => ({
                titleEn: r.titleEn,
                titleZh: r.titleZh,
                documentType: r.documentType,
                fileName: r.fileName,
              })),
            });
            break;
          }
        }
      }

      if (proposalSections.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No valid sections to generate proposal" });
      }

      const pdfBuffer = await generateProposalPdf({
        sections: proposalSections,
        locale: input.locale,
        clientName: input.clientName,
        preparedBy: input.preparedBy,
      });

      // Return as base64 for tRPC transport
      return {
        pdf: pdfBuffer.toString("base64"),
        filename: `GEA_Toolkit_Proposal_${new Date().toISOString().split("T")[0]}.pdf`,
      };
    }),
});
