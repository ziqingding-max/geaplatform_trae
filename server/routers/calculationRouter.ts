import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { calculationService } from "../services/calculationService";
import { getDb } from "../db";
import { countrySocialInsuranceItems, incomeTaxRules } from "../../drizzle/schema";
import { eq, and, isNotNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const calculationRouter = router({
  /**
   * Forward calculation: Gross Salary → Net Pay + Employer Cost
   * Enhanced with income tax calculation
   */
  calculateContributions: protectedProcedure
    .input(
      z.object({
        countryCode: z.string(),
        year: z.number().optional().default(new Date().getFullYear()),
        salary: z.number(),
        regionCode: z.string().optional(),
        age: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await calculationService.calculateSocialInsurance({
        ...input,
        year: input.year || new Date().getFullYear()
      });
    }),

  /**
   * Reverse calculation: Net Pay → Gross Salary + Employer Cost
   * Uses binary search to find the gross salary that produces the target net pay
   */
  calculateReverse: protectedProcedure
    .input(
      z.object({
        countryCode: z.string(),
        year: z.number().optional().default(new Date().getFullYear()),
        netPay: z.number().positive("Net pay must be positive"),
        regionCode: z.string().optional(),
        age: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await calculationService.calculateReverseFromNetPay({
        ...input,
        year: input.year || new Date().getFullYear()
      });
    }),

  listSocialInsuranceRules: protectedProcedure
    .input(
      z.object({
        countryCode: z.string(),
        year: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      return await db
        .select()
        .from(countrySocialInsuranceItems)
        .where(
          and(
            eq(countrySocialInsuranceItems.countryCode, input.countryCode),
            eq(countrySocialInsuranceItems.effectiveYear, input.year),
            eq(countrySocialInsuranceItems.isActive, true)
          )
        )
        .orderBy(countrySocialInsuranceItems.sortOrder);
    }),

  listRegions: protectedProcedure
    .input(
      z.object({
        countryCode: z.string(),
        year: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const result = await db
        .selectDistinct({
          regionCode: countrySocialInsuranceItems.regionCode,
          regionName: countrySocialInsuranceItems.regionName,
        })
        .from(countrySocialInsuranceItems)
        .where(
          and(
            eq(countrySocialInsuranceItems.countryCode, input.countryCode),
            eq(countrySocialInsuranceItems.effectiveYear, input.year),
            isNotNull(countrySocialInsuranceItems.regionCode)
          )
        );
      
      return result;
    }),

  /**
   * Check if income tax rules exist for a country
   */
  hasIncomeTaxRules: protectedProcedure
    .input(
      z.object({
        countryCode: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const result = await db
        .select({ id: incomeTaxRules.id })
        .from(incomeTaxRules)
        .where(
          and(
            eq(incomeTaxRules.countryCode, input.countryCode),
            eq(incomeTaxRules.isActive, true)
          )
        )
        .limit(1);

      return { hasRules: result.length > 0 };
    }),
});
