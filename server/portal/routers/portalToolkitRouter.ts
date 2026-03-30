import { z } from "zod";
import { portalRouter, protectedPortalProcedure } from "../portalTrpc";
import { calculationService } from "../../services/calculationService";
import { getDb } from "../../db";
import { countriesConfig, countryGuideChapters, salaryBenchmarks } from "../../../drizzle/schema";
import { eq, and, asc, sql } from "drizzle-orm";

export const portalToolkitRouter = portalRouter({
  // Countries list for dropdowns (with extra fields for At-a-Glance cards)
  listCountries: protectedPortalProcedure.query(async () => {
    const db = getDb();
    if (!db) throw new Error("DB error");
    return await db
      .select({
        countryCode: countriesConfig.countryCode,
        countryName: countriesConfig.countryName,
        localCurrency: countriesConfig.localCurrency,
        payrollCycle: countriesConfig.payrollCycle,
        workingDaysPerWeek: countriesConfig.workingDaysPerWeek,
        statutoryAnnualLeave: countriesConfig.statutoryAnnualLeave,
        noticePeriodDays: countriesConfig.noticePeriodDays,
        probationPeriodDays: countriesConfig.probationPeriodDays,
      })
      .from(countriesConfig)
      .where(eq(countriesConfig.isActive, true));
  }),

  // Forward Cost Calculation: Gross → Net + Employer Cost
  calculateCost: protectedPortalProcedure
    .input(
      z.object({
        countryCode: z.string(),
        salary: z.number(),
        regionCode: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await calculationService.calculateSocialInsurance({
        countryCode: input.countryCode,
        year: 2025,
        salary: input.salary,
        regionCode: input.regionCode,
      });
    }),

  // Reverse Cost Calculation: Net Pay → Gross + Employer Cost
  calculateCostReverse: protectedPortalProcedure
    .input(
      z.object({
        countryCode: z.string(),
        netPay: z.number().positive("Net pay must be positive"),
        regionCode: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await calculationService.calculateReverseFromNetPay({
        countryCode: input.countryCode,
        year: 2025,
        netPay: input.netPay,
        regionCode: input.regionCode,
      });
    }),

  // Country Guide - list chapters for a country (published only)
  listGuideChapters: protectedPortalProcedure
    .input(z.object({ countryCode: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      if (!db) throw new Error("DB error");
      return await db
        .select()
        .from(countryGuideChapters)
        .where(
          and(
            eq(countryGuideChapters.countryCode, input.countryCode),
            eq(countryGuideChapters.status, "published")
          )
        )
        .orderBy(asc(countryGuideChapters.sortOrder));
    }),

  // Country Guide - list countries that have published guides
  listCountriesWithGuides: protectedPortalProcedure.query(async () => {
    const db = getDb();
    if (!db) throw new Error("DB error");

    const countriesWithGuides = await db
      .select({
        countryCode: countryGuideChapters.countryCode,
        chapterCount: sql<number>`count(*)`.as("chapterCount"),
      })
      .from(countryGuideChapters)
      .where(eq(countryGuideChapters.status, "published"))
      .groupBy(countryGuideChapters.countryCode);

    const allCountries = await db
      .select({
        countryCode: countriesConfig.countryCode,
        countryName: countriesConfig.countryName,
        localCurrency: countriesConfig.localCurrency,
        payrollCycle: countriesConfig.payrollCycle,
        workingDaysPerWeek: countriesConfig.workingDaysPerWeek,
        statutoryAnnualLeave: countriesConfig.statutoryAnnualLeave,
        noticePeriodDays: countriesConfig.noticePeriodDays,
        probationPeriodDays: countriesConfig.probationPeriodDays,
      })
      .from(countriesConfig)
      .where(eq(countriesConfig.isActive, true));

    const guideMap = new Map(countriesWithGuides.map((c) => [c.countryCode, c.chapterCount]));

    return allCountries
      .filter((c) => guideMap.has(c.countryCode))
      .map((c) => ({
        ...c,
        chapterCount: guideMap.get(c.countryCode) || 0,
      }));
  }),

  // Benchmarks
  getBenchmark: protectedPortalProcedure
    .input(
      z.object({
        countryCode: z.string(),
        jobCategory: z.string(),
        seniorityLevel: z.enum(["junior", "mid", "senior", "lead", "director"]),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      if (!db) throw new Error("DB error");
      return await db.query.salaryBenchmarks.findFirst({
        where: and(
          eq(salaryBenchmarks.countryCode, input.countryCode),
          eq(salaryBenchmarks.jobCategory, input.jobCategory),
          eq(salaryBenchmarks.seniorityLevel, input.seniorityLevel)
        ),
      });
    }),
});
