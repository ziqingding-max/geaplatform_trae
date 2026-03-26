import { z } from "zod";
import { and, desc, eq, inArray, isNull, or, sql, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { protectedPortalProcedure, portalRouter } from "../portalTrpc";
import { getDb } from "../../db";
import {
  knowledgeFeedbackEvents,
  knowledgeItems,
  knowledgeMarketingEvents,
  employees,
} from "../../../drizzle/schema";
import { contractors } from "../../../drizzle/aor-schema";

const topicEnum = ["payroll", "compliance", "leave", "invoice", "onboarding", "general"] as const;

// ─── Helpers ────────────────────────────────────────────────────────────────

/** How many days ago a date was (negative = future) */
function daysAgo(date: Date | null): number {
  if (!date) return 999;
  return Math.floor((Date.now() - date.getTime()) / 86_400_000);
}

/**
 * Smart-sort knowledge items:
 *  1. Customer-specific articles first
 *  2. Articles matching customer's employee/contractor countries second
 *  3. Articles published within 7 days get a "new" boost
 *  4. Within each tier, sort by publishedAt desc
 */
function smartSort(
  items: (typeof knowledgeItems.$inferSelect)[],
  customerCountryCodes: string[],
  customerId: number
) {
  const countrySet = new Set(customerCountryCodes.map((c) => c.toUpperCase()));

  return items.sort((a, b) => {
    // Tier 1: Customer-specific articles first
    const aCustomer = a.customerId === customerId ? 1 : 0;
    const bCustomer = b.customerId === customerId ? 1 : 0;
    if (aCustomer !== bCustomer) return bCustomer - aCustomer;

    // Tier 2: Articles matching customer's countries
    const aMeta = (a.metadata || {}) as Record<string, any>;
    const bMeta = (b.metadata || {}) as Record<string, any>;
    const aCountryMatch = aMeta.countryCode && countrySet.has(String(aMeta.countryCode).toUpperCase()) ? 1 : 0;
    const bCountryMatch = bMeta.countryCode && countrySet.has(String(bMeta.countryCode).toUpperCase()) ? 1 : 0;
    if (aCountryMatch !== bCountryMatch) return bCountryMatch - aCountryMatch;

    // Tier 3: Newer articles first (within same tier)
    const aTime = a.publishedAt?.getTime() ?? a.createdAt.getTime();
    const bTime = b.publishedAt?.getTime() ?? b.createdAt.getTime();
    return bTime - aTime;
  });
}

export const portalKnowledgeBaseRouter = portalRouter({
  /**
   * Main dashboard endpoint — now with smart sorting, server-side pagination,
   * country filtering, and customer country data.
   */
  dashboard: protectedPortalProcedure
    .input(
      z
        .object({
          locale: z.enum(["en", "zh"]).default("en"),
          topics: z.array(z.enum(topicEnum)).optional(),
          countryCodes: z.array(z.string()).optional(),
          page: z.number().int().min(1).default(1),
          pageSize: z.number().int().min(1).max(100).default(20),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      }

      const customerId = ctx.portalUser.customerId;
      const locale = input?.locale ?? "en";
      const topics = input?.topics?.length ? input.topics : [...topicEnum];
      const page = input?.page ?? 1;
      const pageSize = input?.pageSize ?? 20;
      const filterCountryCodes = input?.countryCodes;

      // ── 1. Fetch customer's employee countries ──
      const empCountries = await db
        .select({ countryCode: employees.country })
        .from(employees)
        .where(eq(employees.customerId, customerId))
        .groupBy(employees.country);

      // Also fetch contractor countries
      const ctrCountries = await db
        .select({ countryCode: contractors.country })
        .from(contractors)
        .where(eq(contractors.customerId, customerId))
        .groupBy(contractors.country);

      const customerCountryCodes = Array.from(
        new Set(
          empCountries.map((r) => r.countryCode).concat(ctrCountries.map((r) => r.countryCode))
        )
      );

      // ── 2. Build WHERE conditions ──
      // Include current locale + English fallback (for articles without a translation)
      const langCondition =
        locale === "en"
          ? eq(knowledgeItems.language, "en")
          : or(eq(knowledgeItems.language, locale), eq(knowledgeItems.language, "en"));

      const conditions = [
        inArray(knowledgeItems.topic, topics),
        langCondition!,
        eq(knowledgeItems.status, "published"),
        or(eq(knowledgeItems.customerId, customerId), isNull(knowledgeItems.customerId)),
      ];

      // Country filter: filter by metadata->>'countryCode'
      if (filterCountryCodes && filterCountryCodes.length > 0) {
        const upperCodes = filterCountryCodes.map((c) => c.toUpperCase());
        // Include articles that match the country filter OR have no country (global articles)
        conditions.push(
          or(
            inArray(sql`(metadata->>'countryCode')`, upperCodes),
            sql`(metadata->>'countryCode') IS NULL`
          )!
        );
      }

      // ── 3. Get total count for pagination ──
      const [{ total }] = await db
        .select({ total: count() })
        .from(knowledgeItems)
        .where(and(...conditions));

      // ── 4. Fetch ALL items for smart sorting (up to a reasonable cap) ──
      // We fetch all matching items, sort them in memory, then paginate.
      // This is necessary because the sort logic depends on customer context
      // which cannot be expressed in a single SQL ORDER BY.
      // Performance note: for very large datasets (>5000), consider caching.
      const allItems = await db
        .select()
        .from(knowledgeItems)
        .where(and(...conditions))
        .orderBy(desc(knowledgeItems.publishedAt), desc(knowledgeItems.createdAt))
        .limit(5000);

      // ── 5. Deduplicate: if both zh and en versions exist for same title, keep only the locale version ──
      let deduped = allItems;
      if (locale !== "en") {
        const localeTitles = new Set(
          allItems.filter((i) => i.language === locale).map((i) => i.title)
        );
        // Remove English articles that have a corresponding locale version
        deduped = allItems.filter(
          (i) => i.language === locale || !localeTitles.has(i.title)
        );
      }

      // ── 6. Smart sort (mixed, no language priority) ──
      const sortedItems = smartSort(deduped, customerCountryCodes, customerId);

      // ── 7. Paginate ──
      const startIdx = (page - 1) * pageSize;
      const paginatedItems = sortedItems.slice(startIdx, startIdx + pageSize);

      // ── 7b. Mark English fallback articles ──
      const itemsWithFallback = paginatedItems.map((item) => ({
        ...item,
        isFallback: locale !== "en" && item.language === "en",
      }));

      // ── 8. Compute topic counts from ALL deduplicated items (not just current page) ──
      const topicCounts = topics.reduce<Record<string, number>>((acc, topic) => {
        acc[topic] = deduped.filter((item) => item.topic === topic).length;
        return acc;
      }, {});

      // ── 9. Compute available country codes from all deduplicated items ──
      const availableCountries: Record<string, number> = {};
      for (const item of deduped) {
        const meta = (item.metadata || {}) as Record<string, any>;
        const cc = meta.countryCode ? String(meta.countryCode).toUpperCase() : null;
        if (cc) {
          availableCountries[cc] = (availableCountries[cc] || 0) + 1;
        }
      }

      return {
        customerId,
        generatedAt: Date.now(),
        topicCounts,
        items: itemsWithFallback,
        pagination: {
          page,
          pageSize,
          total: deduped.length,
          totalPages: Math.ceil(deduped.length / pageSize),
        },
        customerCountryCodes,
        availableCountries,
      };
    }),

  marketingPreview: protectedPortalProcedure
    .input(
      z.object({
        locale: z.enum(["en", "zh"]).default("en"),
        cadence: z.enum(["daily", "weekly", "monthly"]).default("weekly"),
        topics: z.array(z.enum(topicEnum)).min(1),
        channel: z.enum(["email"]).default("email"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      }

      const payload = {
        audienceKey: `customer-${ctx.portalUser.customerId}`,
        locale: input.locale,
        cadence: input.cadence,
        topics: input.topics,
        channel: input.channel,
        generatedAt: Date.now(),
      };

      await db.insert(knowledgeMarketingEvents).values({
        customerId: ctx.portalUser.customerId,
        contactId: ctx.portalUser.contactId,
        channel: input.channel,
        cadence: input.cadence,
        topics: input.topics,
        payload,
      });

      return {
        success: true,
        integrationType: "marketing-api-preview",
        payload,
        message:
          input.locale === "zh"
            ? "已生成营销接口预览载荷，并记录到知识库营销事件。"
            : "Marketing integration payload preview generated and saved as knowledge marketing event.",
      };
    }),

  submitSearchFeedback: protectedPortalProcedure
    .input(
      z.object({
        locale: z.enum(["en", "zh"]).default("en"),
        query: z.string().max(500).optional(),
        topics: z.array(z.enum(topicEnum)).default([]),
        feedbackType: z.enum(["no_results", "not_helpful"]).default("not_helpful"),
        note: z.string().max(2000).optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      }

      await db.insert(knowledgeFeedbackEvents).values({
        customerId: ctx.portalUser.customerId,
        contactId: ctx.portalUser.contactId,
        locale: input.locale,
        query: input.query || null,
        topics: input.topics,
        feedbackType: input.feedbackType,
        note: input.note || null,
        metadata: input.metadata || {
          contactId: ctx.portalUser.contactId,
          submittedAt: Date.now(),
        },
      });

      return {
        success: true,
        message:
          input.locale === "zh"
            ? "感谢反馈，我们会持续优化知识内容。"
            : "Thanks for your feedback. We will keep improving the knowledge content.",
      };
    }),
});
