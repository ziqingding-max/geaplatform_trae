import { z } from "zod";
import { desc, eq, gte, inArray, count, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { adminProcedure, userProcedure } from "../procedures";
import { router } from "../_core/trpc";
import { getDb } from "../db";
import { knowledgeFeedbackEvents, knowledgeItems, knowledgeSources } from "../../drizzle/schema";
import {
  evaluateSourceAuthorityWithAI,
  generateKnowledgeDraftWithAI,
} from "../services/knowledgeAiService";

async function pullFromSource(url: string, sourceType?: string): Promise<Array<{ title: string; summary: string; content: string }>> {
  // --- RSS Feed parsing ---
  if (sourceType === "rss" || url.match(/\/(feed|rss|atom)(\.xml)?\/?$/i)) {
    try {
      const RssParser = (await import("rss-parser")).default;
      const parser = new RssParser({ timeout: 15000 });
      const feed = await parser.parseURL(url);
      const items = (feed.items || []).slice(0, 20);
      if (items.length === 0) {
        return [{ title: feed.title || "Empty RSS Feed", summary: feed.description || "", content: "No articles found in this feed." }];
      }
      return items.map((item, idx) => ({
        title: String(item.title || `Article ${idx + 1}`),
        summary: String(item.contentSnippet || item.summary || item.content || "").slice(0, 500),
        content: String(item["content:encoded"] || item.content || item.contentSnippet || item.summary || "").slice(0, 8000),
      }));
    } catch (rssError: any) {
      console.warn(`[pullFromSource] RSS parse failed for ${url}, falling back to HTML:`, rssError?.message);
      // Fall through to HTML parsing
    }
  }

  const res = await fetch(url, {
    method: "GET",
    headers: { "User-Agent": "GEA-KnowledgeBot/1.0" },
  });
  if (!res.ok) throw new TRPCError({ code: "BAD_REQUEST", message: `Failed to fetch source: ${res.status}` });

  const contentType = res.headers.get("content-type") || "";

  // --- JSON / API parsing ---
  if (contentType.includes("application/json")) {
    const json = (await res.json()) as any;
    if (Array.isArray(json)) {
      return json.slice(0, 20).map((row, idx) => ({
        title: String(row.title || row.name || `Untitled ${idx + 1}`),
        summary: String(row.summary || row.description || ""),
        content: String(row.content || row.body || row.summary || ""),
      }));
    }
    return [
      {
        title: String(json.title || "JSON Source Update"),
        summary: String(json.summary || json.message || "Pulled from JSON endpoint"),
        content: JSON.stringify(json).slice(0, 8000),
      },
    ];
  }

  const text = await res.text();

  // --- Try RSS parsing on text content (some servers return RSS as text/html) ---
  if (text.trim().startsWith("<?xml") || text.includes("<rss") || text.includes("<feed")) {
    try {
      const RssParser = (await import("rss-parser")).default;
      const parser = new RssParser();
      const feed = await parser.parseString(text);
      const items = (feed.items || []).slice(0, 20);
      if (items.length > 0) {
        return items.map((item, idx) => ({
          title: String(item.title || `Article ${idx + 1}`),
          summary: String(item.contentSnippet || item.summary || "").slice(0, 500),
          content: String(item["content:encoded"] || item.content || item.contentSnippet || "").slice(0, 8000),
        }));
      }
    } catch { /* not RSS, continue to HTML parsing */ }
  }

  // --- HTML content extraction with cheerio ---
  try {
    const cheerio = await import("cheerio");
    const $ = cheerio.load(text);

    // Remove non-content elements
    $("script, style, nav, header, footer, aside, .sidebar, .menu, .navigation, .ad, .advertisement, .cookie-banner").remove();

    // Try to find the main content area
    const mainContent = $("article").first().length
      ? $("article").first()
      : $("main").first().length
        ? $("main").first()
        : $(".post-content, .entry-content, .article-content, .content, #content").first().length
          ? $(".post-content, .entry-content, .article-content, .content, #content").first()
          : $("body");

    const title = $("title").text().trim() || $("h1").first().text().trim() || "Web Source Update";
    const metaDesc = $("meta[name='description']").attr("content") || "";

    // Extract text paragraphs from main content
    const paragraphs: string[] = [];
    mainContent.find("p, h2, h3, h4, li").each((_, el) => {
      const t = $(el).text().trim();
      if (t.length > 20) paragraphs.push(t);
    });

    const content = paragraphs.join("\n\n").slice(0, 8000) || mainContent.text().trim().slice(0, 8000);
    const summary = metaDesc || paragraphs.slice(0, 2).join(" ").slice(0, 500) || "Fetched from web source";

    return [{ title, summary, content }];
  } catch {
    // Fallback: raw text extraction
    const titleMatch = text.match(/<title>(.*?)<\/title>/i);
    return [{
      title: titleMatch?.[1]?.trim() || "Web Source Update",
      summary: "Fetched from web source",
      content: text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 8000),
    }];
  }
}

function computeFreshnessScore(): number {
  return 92;
}

function computeDuplicationScore(rawContent: string, title: string): number {
  const normalizedLength = Math.min(100, Math.floor((rawContent.length + title.length) / 40));
  return Math.max(5, Math.min(95, normalizedLength));
}

function computeRiskScore(input: {
  authorityScore?: number;
  freshnessScore?: number;
  duplicationScore?: number;
}) {
  const authority = Number(input.authorityScore ?? 0);
  const freshness = Number(input.freshnessScore ?? 0);
  const duplication = Number(input.duplicationScore ?? 0);
  return Math.max(0, Math.min(100, Math.round((100 - authority) * 0.45 + (100 - freshness) * 0.25 + duplication * 0.3)));
}

function computeNextFetchAt(frequency: "daily" | "weekly" | "monthly"): Date {
  const now = new Date();
  switch (frequency) {
    case "daily":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "weekly":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "monthly":
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
}

export const knowledgeBaseAdminRouter = router({
  listReviewQueue: userProcedure
    .input(
      z
        .object({
          statuses: z
            .array(z.enum(["pending_review", "published", "rejected", "draft"]))
            .default(["pending_review"]),
          page: z.number().int().min(1).default(1),
          pageSize: z.number().int().min(1).max(200).default(50),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const statuses: Array<"draft" | "pending_review" | "published" | "rejected"> =
        input?.statuses?.length ? input.statuses : ["pending_review"];
      const page = input?.page ?? 1;
      const pageSize = input?.pageSize ?? 50;
      const offset = (page - 1) * pageSize;

      const whereClause = inArray(knowledgeItems.status, statuses);

      const [rows, totalResult] = await Promise.all([
        db
          .select()
          .from(knowledgeItems)
          .where(whereClause)
          .orderBy(desc(knowledgeItems.createdAt))
          .limit(pageSize)
          .offset(offset),
        db
          .select({ count: count() })
          .from(knowledgeItems)
          .where(whereClause),
      ]);

      const total = totalResult[0]?.count || 0;

      const items = rows
        .map((row) => {
          const meta = (row.metadata || {}) as Record<string, any>;
          const riskScore = computeRiskScore({
            authorityScore: meta.authorityScore,
            freshnessScore: meta.freshnessScore,
            duplicationScore: meta.duplicationScore,
          });
          return {
            ...row,
            riskScore,
            metadata: {
              ...meta,
              freshnessScore: Number(meta.freshnessScore ?? 0),
              duplicationScore: Number(meta.duplicationScore ?? 0),
            },
          };
        })
        .sort((a, b) => b.riskScore - a.riskScore || Number(b.createdAt) - Number(a.createdAt));

      return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    }),

  listSources: userProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    return db.select().from(knowledgeSources).orderBy(desc(knowledgeSources.updatedAt));
  }),

  listContentGaps: userProcedure
    .input(
      z
        .object({
          days: z.number().min(1).max(90).default(30),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const days = input?.days ?? 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const rows = await db
        .select()
        .from(knowledgeFeedbackEvents)
        .where(gte(knowledgeFeedbackEvents.createdAt, since))
        .orderBy(desc(knowledgeFeedbackEvents.createdAt))
        .limit(500);

      const bucket = new Map<string, { query: string; hits: number; topics: Set<string>; latestAt: Date }>();
      for (const row of rows) {
        const key = (row.query || "(empty)").trim().toLowerCase() || "(empty)";
        const current = bucket.get(key) || {
          query: row.query || "",
          hits: 0,
          topics: new Set<string>(),
          latestAt: row.createdAt,
        };
        current.hits += 1;
        const topicsArr = Array.isArray(row.topics) ? row.topics : [];
        for (const topic of topicsArr) current.topics.add(String(topic));
        if (row.createdAt > current.latestAt) current.latestAt = row.createdAt;
        bucket.set(key, current);
      }

      return Array.from(bucket.values())
        .map((item) => ({
          query: item.query,
          hits: item.hits,
          topics: Array.from(item.topics),
          latestAt: item.latestAt,
        }))
        .sort((a, b) => b.hits - a.hits)
        .slice(0, 20);
    }),

  upsertSource: adminProcedure
    .input(
      z.object({
        id: z.number().optional(),
        name: z.string().min(2),
        url: z.string().url(),
        sourceType: z.enum(["rss", "api", "web"]).default("web"),
        language: z.enum(["en", "zh", "multi"]).default("multi"),
        topic: z
          .enum(["payroll", "compliance", "leave", "invoice", "onboarding", "general"])
          .default("general"),
        isActive: z.boolean().default(true),
        fetchFrequency: z.enum(["manual", "daily", "weekly", "monthly"]).default("manual"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const authority = await evaluateSourceAuthorityWithAI({
        sourceName: input.name,
        url: input.url,
        sourceType: input.sourceType,
      });

      // Calculate next fetch time based on frequency
      const nextFetchAt = input.fetchFrequency !== "manual" ? computeNextFetchAt(input.fetchFrequency) : null;

      if (input.id) {
        await db
          .update(knowledgeSources)
          .set({
            name: input.name,
            url: input.url,
            sourceType: input.sourceType,
            language: input.language,
            topic: input.topic,
            isActive: input.isActive,
            fetchFrequency: input.fetchFrequency,
            nextFetchAt,
            authorityScore: authority.score,
            authorityLevel: authority.level,
            authorityReason: authority.reason,
            aiReviewedAt: new Date(),
            updatedBy: ctx.user.id,
          })
          .where(eq(knowledgeSources.id, input.id));
        return { success: true, id: input.id };
      }

      const result = await db.insert(knowledgeSources).values({
        name: input.name,
        url: input.url,
        sourceType: input.sourceType,
        language: input.language,
        topic: input.topic,
        isActive: input.isActive,
        fetchFrequency: input.fetchFrequency,
        nextFetchAt,
        authorityScore: authority.score,
        authorityLevel: authority.level,
        authorityReason: authority.reason,
        aiReviewedAt: new Date(),
        updatedBy: ctx.user.id,
      });
      return { success: true, id: Number((result as any).insertId ?? 0), authority };
    }),

  auditSourceAuthority: adminProcedure
    .input(z.object({ sourceId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [source] = await db
        .select()
        .from(knowledgeSources)
        .where(eq(knowledgeSources.id, input.sourceId))
        .limit(1);
      if (!source) throw new TRPCError({ code: "NOT_FOUND", message: "Source not found" });

      const authority = await evaluateSourceAuthorityWithAI({
        sourceName: source.name,
        url: source.url,
        sourceType: source.sourceType,
      });

      await db
        .update(knowledgeSources)
        .set({
          authorityScore: authority.score,
          authorityLevel: authority.level,
          authorityReason: authority.reason,
          aiReviewedAt: new Date(),
        })
        .where(eq(knowledgeSources.id, source.id));

      return { success: true, authority };
    }),

  ingestSourceNow: adminProcedure
    .input(z.object({ sourceId: z.number(), customerId: z.number().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [source] = await db.select().from(knowledgeSources).where(eq(knowledgeSources.id, input.sourceId)).limit(1);
      if (!source) throw new TRPCError({ code: "NOT_FOUND", message: "Source not found" });

      const pulled = await pullFromSource(source.url, source.sourceType);
      if (!pulled.length) return { success: true, created: 0 };

      const drafts = await Promise.all(
        pulled.map((item) =>
          generateKnowledgeDraftWithAI({
            sourceName: source.name,
            sourceUrl: source.url,
            topic: source.topic,
            languageHint: source.language,
            rawTitle: item.title,
            rawContent: `${item.summary}\n\n${item.content}`,
          })
        )
      );

      await db.insert(knowledgeItems).values(
        drafts.map((draft, idx) => {
          const raw = pulled[idx];
          const freshnessScore = computeFreshnessScore();
          const duplicationScore = computeDuplicationScore(raw.content, raw.title);
          const riskScore = computeRiskScore({
            authorityScore: source.authorityScore,
            freshnessScore,
            duplicationScore,
          });

          return {
            customerId: input.customerId ?? null,
            sourceId: source.id,
            title: draft.title,
            summary: draft.summary,
            content: draft.content,
            status: "pending_review" as const,
            category: draft.category,
            topic: draft.topic,
            language: draft.language,
            aiConfidence: draft.confidence,
            aiSummary: draft.summary,
            metadata: {
              sourceName: source.name,
              sourceUrl: source.url,
              aiTags: draft.tags,
              aiCountries: draft.countries,
              authorityScore: source.authorityScore,
              authorityLevel: source.authorityLevel,
              freshnessScore,
              duplicationScore,
              riskScore,
            },
          };
        })
      );

      await db.update(knowledgeSources).set({ lastFetchedAt: new Date() }).where(eq(knowledgeSources.id, source.id));

      return { success: true, created: drafts.length };
    }),

  generateFromInternalData: adminProcedure
    .input(
      z.object({
        types: z.array(
          z.enum([
            "socialInsurance",
            "publicHolidays",
            "leaveEntitlements",
            "salaryBenchmark",
            "contractorGuide",
          ])
        ).optional(),
        countryCodes: z.array(z.string()).optional(),
        dryRun: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const { generateKnowledgeFromInternalData } = await import("../services/knowledgeInternalGeneratorService");
      const result = await generateKnowledgeFromInternalData({
        types: input.types as any,
        countryCodes: input.countryCodes,
        dryRun: input.dryRun,
      });
      return result;
    }),

  reviewItem: adminProcedure
    .input(z.object({ id: z.number(), action: z.enum(["publish", "reject"]), note: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [item] = await db.select().from(knowledgeItems).where(eq(knowledgeItems.id, input.id)).limit(1);
      if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });

      await db
        .update(knowledgeItems)
        .set({
          status: input.action === "publish" ? "published" : "rejected",
          reviewedBy: ctx.user.id,
          reviewedAt: new Date(),
          publishedAt: input.action === "publish" ? new Date() : item.publishedAt,
          reviewNote: input.note || null,
        })
        .where(eq(knowledgeItems.id, input.id));

      return { success: true };
    }),

  // Batch review: publish or reject multiple items at once
  batchReview: adminProcedure
    .input(
      z.object({
        ids: z.array(z.number()).min(1).max(500),
        action: z.enum(["publish", "reject"]),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const now = new Date();
      await db
        .update(knowledgeItems)
        .set({
          status: input.action === "publish" ? "published" : "rejected",
          reviewedBy: ctx.user.id,
          reviewedAt: now,
          publishedAt: input.action === "publish" ? now : undefined,
          reviewNote: input.note || null,
        })
        .where(inArray(knowledgeItems.id, input.ids));

      return { success: true, count: input.ids.length };
    }),

  // Generate article from content gap signal using AI
  generateFromContentGap: adminProcedure
    .input(
      z.object({
        query: z.string().min(1).max(500),
        topics: z.array(z.string()).default([]),
        language: z.enum(["en", "zh"]).default("en"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Use AI to generate a knowledge article based on the gap query
      const topicHint = input.topics.length > 0
        ? (input.topics[0] as "payroll" | "compliance" | "leave" | "invoice" | "onboarding" | "general")
        : "general";

      const draft = await generateKnowledgeDraftWithAI({
        sourceName: "Content Gap Auto-Generation",
        sourceUrl: "internal://content-gap",
        topic: topicHint,
        languageHint: input.language === "zh" ? "zh" : "en",
        rawTitle: input.query,
        rawContent: `User search query that had no results: "${input.query}". Topics: ${input.topics.join(", ") || "general"}. Please generate a comprehensive knowledge article that answers this query for B2B clients using EOR/AOR/visa services.`,
      });

      const freshnessScore = computeFreshnessScore();
      const duplicationScore = computeDuplicationScore(input.query, draft.title);
      const riskScore = computeRiskScore({
        authorityScore: 70, // internal generation has moderate authority
        freshnessScore,
        duplicationScore,
      });

      await db.insert(knowledgeItems).values({
        customerId: null,
        sourceId: null,
        title: draft.title,
        summary: draft.summary,
        content: draft.content,
        status: "pending_review" as const,
        category: draft.category,
        topic: draft.topic,
        language: draft.language,
        aiConfidence: draft.confidence,
        aiSummary: draft.summary,
        metadata: {
          generatedFrom: "content_gap",
          originalQuery: input.query,
          originalTopics: input.topics,
          aiTags: draft.tags,
          aiCountries: draft.countries,
          authorityScore: 70,
          freshnessScore,
          duplicationScore,
          riskScore,
        },
      });

      return { success: true, title: draft.title, confidence: draft.confidence };
    }),

  // Dismiss a content gap signal
  dismissContentGap: adminProcedure
    .input(
      z.object({
        query: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      // We don't delete feedback events, but we can mark them as addressed
      // For now, this is a no-op that the frontend uses to hide dismissed gaps
      return { success: true, query: input.query };
    }),

  // List expired or soon-to-expire articles
  listExpiredContent: adminProcedure
    .input(
      z.object({
        includeExpiringSoon: z.boolean().default(true), // within 30 days
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const now = new Date();
      const soonThreshold = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Get articles that have expiresAt set
      const rows = await db
        .select()
        .from(knowledgeItems)
        .where(eq(knowledgeItems.status, "published"))
        .orderBy(desc(knowledgeItems.publishedAt))
        .limit(500);

      return rows
        .filter((row) => {
          if (!row.expiresAt) return false;
          const expiresAt = new Date(row.expiresAt);
          if (expiresAt <= now) return true; // already expired
          if (input?.includeExpiringSoon && expiresAt <= soonThreshold) return true; // expiring soon
          return false;
        })
        .map((row) => ({
          ...row,
          isExpired: row.expiresAt ? new Date(row.expiresAt) <= now : false,
          isExpiringSoon: row.expiresAt ? new Date(row.expiresAt) <= soonThreshold && new Date(row.expiresAt) > now : false,
        }));
    }),

  // Deduplicate knowledge items: keep newest per title+language, reject older duplicates
  deduplicateItems: adminProcedure
    .mutation(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Find all non-rejected items grouped by title + language
      const allItems = await db
        .select({
          id: knowledgeItems.id,
          title: knowledgeItems.title,
          language: knowledgeItems.language,
          status: knowledgeItems.status,
          createdAt: knowledgeItems.createdAt,
        })
        .from(knowledgeItems)
        .where(
          inArray(knowledgeItems.status, ["published", "pending_review", "draft"])
        )
        .orderBy(desc(knowledgeItems.createdAt));

      // Group by title + language
      const groups = new Map<string, typeof allItems>();
      for (const item of allItems) {
        const key = `${item.title}|||${item.language}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(item);
      }

      // Collect IDs of duplicates to reject (keep the first = newest per group)
      const idsToReject: number[] = [];
      const groupEntries = Array.from(groups.entries());
      for (const [, items] of groupEntries) {
        if (items.length <= 1) continue;
        // Skip the first (newest), reject the rest
        for (let i = 1; i < items.length; i++) {
          idsToReject.push(items[i].id);
        }
      }

      if (idsToReject.length > 0) {
        // Batch update in chunks of 500
        for (let i = 0; i < idsToReject.length; i += 500) {
          const batch = idsToReject.slice(i, i + 500);
          await db
            .update(knowledgeItems)
            .set({ status: "rejected" as const })
            .where(inArray(knowledgeItems.id, batch));
        }
      }

      return {
        success: true,
        duplicatesFound: idsToReject.length,
        groupsProcessed: Array.from(groups.values()).filter((g) => g.length > 1).length,
      };
    }),

  /**
   * Clean Country Guide duplicates — reject all knowledge items that were generated
   * from internal country guide data (since Country Guide is a separate feature).
   */
  cleanCountryGuideItems: adminProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    }

    // Find all items with metadata.sourceType = 'internal_country_guide' that are not already rejected
    const items = await db
      .select({ id: knowledgeItems.id })
      .from(knowledgeItems)
      .where(
        and(
          sql`(metadata->>'sourceType') = 'internal_country_guide'`,
          sql`status != 'rejected'`
        )
      );

    if (items.length === 0) {
      return { success: true, cleaned: 0 };
    }

    const idsToReject = items.map((i) => i.id);
    for (let i = 0; i < idsToReject.length; i += 500) {
      const batch = idsToReject.slice(i, i + 500);
      await db
        .update(knowledgeItems)
        .set({ status: "rejected" as const })
        .where(inArray(knowledgeItems.id, batch));
    }

    return { success: true, cleaned: idsToReject.length };
  }),
});
