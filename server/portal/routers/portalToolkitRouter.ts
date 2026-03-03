import { z } from "zod";
import { portalRouter, protectedPortalProcedure } from "../portalTrpc";
import { calculationService } from "../../services/calculationService";
import { getDb } from "../../db";
import { countriesConfig, countryGuideChapters, salaryBenchmarks } from "../../../drizzle/schema";
import { eq, and, asc } from "drizzle-orm";

export const portalToolkitRouter = portalRouter({
  // Countries list for dropdowns
  listCountries: protectedPortalProcedure.query(async () => {
    const db = getDb();
    if (!db) throw new Error("DB error");
    return await db.select({
        countryCode: countriesConfig.countryCode,
        countryName: countriesConfig.countryName,
        localCurrency: countriesConfig.localCurrency
    })
    .from(countriesConfig)
    .where(eq(countriesConfig.isActive, true));
  }),

  // Cost Calculation
  calculateCost: protectedPortalProcedure
    .input(z.object({
        countryCode: z.string(),
        salary: z.number(),
        regionCode: z.string().optional()
    }))
    .mutation(async ({ input }) => {
        // Use 2025 as default year for now
        return await calculationService.calculateSocialInsurance({
            countryCode: input.countryCode,
            year: 2025,
            salary: input.salary,
            regionCode: input.regionCode
        });
    }),

  // Country Guide
  listGuideChapters: protectedPortalProcedure
    .input(z.object({ countryCode: z.string() }))
    .query(async ({ input }) => {
        const db = getDb();
        if (!db) throw new Error("DB error");
        return await db.select()
            .from(countryGuideChapters)
            .where(
                and(
                    eq(countryGuideChapters.countryCode, input.countryCode),
                    eq(countryGuideChapters.status, "published")
                )
            )
            .orderBy(asc(countryGuideChapters.sortOrder));
    }),

  // Benchmarks
  getBenchmark: protectedPortalProcedure
    .input(z.object({
        countryCode: z.string(),
        jobCategory: z.string(),
        seniorityLevel: z.enum(["junior", "mid", "senior", "lead", "director"])
    }))
    .query(async ({ input }) => {
        const db = getDb();
        if (!db) throw new Error("DB error");
        return await db.query.salaryBenchmarks.findFirst({
            where: and(
                eq(salaryBenchmarks.countryCode, input.countryCode),
                eq(salaryBenchmarks.jobCategory, input.jobCategory),
                eq(salaryBenchmarks.seniorityLevel, input.seniorityLevel)
            )
        });
    }),
});
