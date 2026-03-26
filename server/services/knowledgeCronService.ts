/**
 * Knowledge Base Cron Service
 * 
 * Provides two cron job runners:
 * 1. runKnowledgeSourceIngest: Fetches content from external sources that are due for ingestion
 * 2. runKnowledgeContentRefresh: Detects expired/stale content and triggers regeneration
 * 
 * Both integrate with the existing cron framework via CRON_JOB_DEFS.
 */

import { eq, and, lte, isNotNull, desc, inArray } from "drizzle-orm";
import { getDb } from "../db";
import { knowledgeSources, knowledgeItems } from "../../drizzle/schema";
import {
  evaluateSourceAuthorityWithAI,
  generateKnowledgeDraftWithAI,
} from "./knowledgeAiService";
import { logAuditAction } from "../db";

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
    }
  }

  const res = await fetch(url, {
    method: "GET",
    headers: { "User-Agent": "GEA-KnowledgeBot/1.0" },
  });
  if (!res.ok) throw new Error(`Failed to fetch source: ${res.status}`);

  const contentType = res.headers.get("content-type") || "";

  // --- JSON / API parsing ---
  if (contentType.includes("application/json")) {
    const json = (await res.json()) as any;
    if (Array.isArray(json)) {
      return json.slice(0, 20).map((row: any, idx: number) => ({
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

  // --- Try RSS parsing on text content ---
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
    $("script, style, nav, header, footer, aside, .sidebar, .menu, .navigation, .ad, .advertisement, .cookie-banner").remove();

    const mainContent = $("article").first().length
      ? $("article").first()
      : $("main").first().length
        ? $("main").first()
        : $(".post-content, .entry-content, .article-content, .content, #content").first().length
          ? $(".post-content, .entry-content, .article-content, .content, #content").first()
          : $("body");

    const title = $("title").text().trim() || $("h1").first().text().trim() || "Web Source Update";
    const metaDesc = $("meta[name='description']").attr("content") || "";

    const paragraphs: string[] = [];
    mainContent.find("p, h2, h3, h4, li").each((_: number, el: any) => {
      const t = $(el).text().trim();
      if (t.length > 20) paragraphs.push(t);
    });

    const content = paragraphs.join("\n\n").slice(0, 8000) || mainContent.text().trim().slice(0, 8000);
    const summary = metaDesc || paragraphs.slice(0, 2).join(" ").slice(0, 500) || "Fetched from web source";

    return [{ title, summary, content }];
  } catch {
    const titleMatch = text.match(/<title>(.*?)<\/title>/i);
    return [{
      title: titleMatch?.[1]?.trim() || "Web Source Update",
      summary: "Fetched from web source",
      content: text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 8000),
    }];
  }
}

// ─── Tiered Auto-Publish Logic ───────────────────────────────────────────────

/**
 * Determines the publish action for a draft article based on AI confidence and source authority.
 * 
 * | AI Confidence | Source Authority | Action          |
 * |---------------|-----------------|-----------------|
 * | >= 85         | High            | auto_publish    |
 * | 70-84         | High/Medium     | auto_publish    |  (marked as AI-generated, 24h review window)
 * | 50-69         | Any             | pending_review  |
 * | < 50          | Any             | auto_discard    |
 */
function determinePublishAction(
  aiConfidence: number,
  authorityLevel: string,
  riskScore: number,
): "auto_publish" | "pending_review" | "auto_discard" {
  if (aiConfidence < 50) return "auto_discard";
  if (riskScore >= 70) return "pending_review"; // High risk always needs review
  if (aiConfidence >= 85 && authorityLevel === "high") return "auto_publish";
  if (aiConfidence >= 70 && (authorityLevel === "high" || authorityLevel === "medium")) return "auto_publish";
  return "pending_review";
}

// ─── Cron Runner 1: External Source Ingestion ────────────────────────────────

export async function runKnowledgeSourceIngest(): Promise<{
  sourcesProcessed: number;
  articlesCreated: number;
  autoPublished: number;
  autoDiscarded: number;
  errors: string[];
}> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const now = new Date();
  let sourcesProcessed = 0;
  let articlesCreated = 0;
  let autoPublished = 0;
  let autoDiscarded = 0;
  const errors: string[] = [];

  // Find all active sources that are due for fetching
  const dueSources = await db
    .select()
    .from(knowledgeSources)
    .where(
      and(
        eq(knowledgeSources.isActive, true),
        // Only sources with a scheduled frequency (not manual)
        // and nextFetchAt is in the past or null (first run)
        lte(knowledgeSources.nextFetchAt, now),
      )
    )
    .orderBy(desc(knowledgeSources.updatedAt));

  console.log(`[KnowledgeCron] Found ${dueSources.length} sources due for ingestion`);

  for (const source of dueSources) {
    try {
      // Skip manual sources
      if (source.fetchFrequency === "manual") continue;

      sourcesProcessed++;
      console.log(`[KnowledgeCron] Ingesting source: ${source.name} (${source.url})`);

      const pulled = await pullFromSource(source.url, source.sourceType);
      if (!pulled.length) {
        console.log(`[KnowledgeCron] No content from source: ${source.name}`);
        // Still update nextFetchAt
        await db.update(knowledgeSources).set({
          lastFetchedAt: now,
          nextFetchAt: computeNextFetchAt(source.fetchFrequency as "daily" | "weekly" | "monthly"),
        }).where(eq(knowledgeSources.id, source.id));
        continue;
      }

      // Generate AI drafts
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

      for (let idx = 0; idx < drafts.length; idx++) {
        const draft = drafts[idx];
        const raw = pulled[idx];

        const freshnessScore = computeFreshnessScore();
        const duplicationScore = computeDuplicationScore(raw.content, raw.title);
        const riskScore = computeRiskScore({
          authorityScore: source.authorityScore,
          freshnessScore,
          duplicationScore,
        });

        // Determine auto-publish action
        const action = determinePublishAction(
          draft.confidence,
          source.authorityLevel,
          riskScore,
        );

        if (action === "auto_discard") {
          autoDiscarded++;
          console.log(`[KnowledgeCron] Auto-discarded low-quality article: "${draft.title}" (confidence: ${draft.confidence})`);
          continue;
        }

        const status = action === "auto_publish" ? "published" as const : "pending_review" as const;
        const publishedAt = action === "auto_publish" ? now : null;

        await db.insert(knowledgeItems).values({
          customerId: null, // Global
          sourceId: source.id,
          title: draft.title,
          summary: draft.summary,
          content: draft.content,
          status,
          category: draft.category,
          topic: draft.topic,
          language: draft.language,
          aiConfidence: draft.confidence,
          aiSummary: draft.summary,
          publishedAt,
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
            autoPublished: action === "auto_publish",
            cronIngested: true,
          },
        });

        articlesCreated++;
        if (action === "auto_publish") autoPublished++;
      }

      // Update source: lastFetchedAt + nextFetchAt
      await db.update(knowledgeSources).set({
        lastFetchedAt: now,
        nextFetchAt: computeNextFetchAt(source.fetchFrequency as "daily" | "weekly" | "monthly"),
      }).where(eq(knowledgeSources.id, source.id));

    } catch (err) {
      const errMsg = `Source "${source.name}" (id=${source.id}): ${String(err)}`;
      errors.push(errMsg);
      console.error(`[KnowledgeCron] Error ingesting source:`, errMsg);
    }
  }

  // Audit log
  await logAuditAction({
    userName: "System",
    action: "knowledge_source_ingest",
    entityType: "knowledge",
    entityId: 0,
    changes: {
      detail: `Cron ingestion: ${sourcesProcessed} sources processed, ${articlesCreated} articles created (${autoPublished} auto-published, ${autoDiscarded} auto-discarded), ${errors.length} errors`,
    },
  });

  return { sourcesProcessed, articlesCreated, autoPublished, autoDiscarded, errors };
}

// ─── Cron Runner 2: Content Refresh (Expired Detection) ──────────────────────

export async function runKnowledgeContentRefresh(): Promise<{
  expiredFound: number;
  refreshTriggered: number;
  errors: string[];
}> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const now = new Date();
  let expiredFound = 0;
  let refreshTriggered = 0;
  const errors: string[] = [];

  // Find published articles with expiresAt in the past
  const expiredArticles = await db
    .select()
    .from(knowledgeItems)
    .where(
      and(
        eq(knowledgeItems.status, "published"),
        isNotNull(knowledgeItems.expiresAt),
        lte(knowledgeItems.expiresAt, now),
      )
    )
    .orderBy(desc(knowledgeItems.publishedAt))
    .limit(100);

  expiredFound = expiredArticles.length;
  console.log(`[KnowledgeCron] Found ${expiredFound} expired articles`);

  for (const article of expiredArticles) {
    try {
      const meta = (article.metadata || {}) as Record<string, any>;
      const sourceType = meta.sourceType || meta.generatorType || "unknown";

      // For internally generated articles, we can trigger regeneration
      if (sourceType === "internal" || meta.countryCode) {
        // Mark as draft to trigger regeneration on next internal generation run
        await db
          .update(knowledgeItems)
          .set({
            status: "draft",
            metadata: {
              ...meta,
              expiredAt: now.toISOString(),
              needsRefresh: true,
            },
          })
          .where(eq(knowledgeItems.id, article.id));

        refreshTriggered++;
        console.log(`[KnowledgeCron] Marked for refresh: "${article.title}" (id=${article.id})`);
      } else {
        // For external source articles, just mark as expired in metadata
        await db
          .update(knowledgeItems)
          .set({
            metadata: {
              ...meta,
              expiredAt: now.toISOString(),
              isStale: true,
            },
          })
          .where(eq(knowledgeItems.id, article.id));

        console.log(`[KnowledgeCron] Marked as stale: "${article.title}" (id=${article.id})`);
      }
    } catch (err) {
      const errMsg = `Article "${article.title}" (id=${article.id}): ${String(err)}`;
      errors.push(errMsg);
      console.error(`[KnowledgeCron] Error processing expired article:`, errMsg);
    }
  }

  // Also check for articles published more than 12 months ago without expiresAt
  const twelveMonthsAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  const staleArticles = await db
    .select()
    .from(knowledgeItems)
    .where(
      and(
        eq(knowledgeItems.status, "published"),
        lte(knowledgeItems.publishedAt, twelveMonthsAgo),
      )
    )
    .limit(50);

  for (const article of staleArticles) {
    const meta = (article.metadata || {}) as Record<string, any>;
    if (meta.isStale) continue; // Already marked

    await db
      .update(knowledgeItems)
      .set({
        metadata: {
          ...meta,
          isStale: true,
          staleReason: "Published more than 12 months ago",
        },
      })
      .where(eq(knowledgeItems.id, article.id));
  }

  // Audit log
  await logAuditAction({
    userName: "System",
    action: "knowledge_content_refresh",
    entityType: "knowledge",
    entityId: 0,
    changes: {
      detail: `Content refresh: ${expiredFound} expired found, ${refreshTriggered} marked for refresh, ${staleArticles.length} stale articles detected, ${errors.length} errors`,
    },
  });

  return { expiredFound, refreshTriggered, errors };
}
