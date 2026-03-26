import { executeTaskLLM } from "./aiGatewayService";

export type SourceAuthorityResult = {
  score: number;
  level: "high" | "medium" | "low";
  reason: string;
};

export type KnowledgeDraft = {
  title: string;
  summary: string;
  content: string;
  category: "article" | "alert" | "guide";
  topic: "payroll" | "compliance" | "leave" | "invoice" | "onboarding" | "general";
  language: "en" | "zh";
  tags: string[];
  countries: string[];
  confidence: number;
};

// ─── Brand cleansing constants ───────────────────────────────────────────────

const COMPETITOR_BRANDS = [
  "Deel", "Letsdeel", "Remote.com", "Remote\\.com", "Oyster", "OysterHR",
  "G-P", "Globalization Partners", "Papaya Global", "Velocity Global",
  "Multiplier", "Rippling", "Skuad", "Omnipresent", "Lano", "Remofirst",
  "Safeguard Global", "Atlas HXM", "Horizons", "Airwallex", "Pilot\\.co",
  "Thera", "Teamed", "WorkMotion", "Pebl",
];

const CTA_PATTERNS = [
  /book\s+a\s+demo/gi,
  /schedule\s+a\s+(call|demo|meeting)/gi,
  /sign\s+up\s+(for\s+)?free/gi,
  /try\s+\w+\s+for\s+free/gi,
  /start\s+(your\s+)?free\s+trial/gi,
  /get\s+started\s+(today|now|for\s+free)/gi,
  /request\s+a\s+(demo|quote|proposal)/gi,
  /talk\s+to\s+(an?\s+)?(expert|sales|specialist)/gi,
  /contact\s+(our\s+)?(sales|team)/gi,
  /see\s+(how|why)\s+\w+\s+(can|helps)/gi,
  /learn\s+more\s+about\s+\w+('s)?\s+(platform|product|solution)/gi,
  /powered\s+by\s+\w+/gi,
  /©\s*\d{4}\s*\w+/gi,
  /all\s+rights\s+reserved/gi,
];

/**
 * Layer 1: Pre-processing content cleaner
 * Strips CTAs, promotional sentences, and obvious brand mentions before AI processing
 */
export function preCleanContent(text: string): string {
  let cleaned = text;

  // Remove CTA patterns
  for (const pattern of CTA_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }

  // Remove sentences that are purely promotional (contain brand + action verb)
  const brandPattern = new RegExp(
    `(?:^|[.!?]\\s*)(?:[^.!?]*(?:${COMPETITOR_BRANDS.join("|")})(?:'s)?\\s+(?:helps?|offers?|provides?|enables?|makes?|allows?|lets?|gives?|delivers?|simplifies?|streamlines?|automates?|powers?)[^.!?]*[.!?])`,
    "gi"
  );
  cleaned = cleaned.replace(brandPattern, " ");

  // Remove lines that are just links or buttons
  cleaned = cleaned.replace(/^.*(?:https?:\/\/\S+\s*){2,}.*$/gm, "");

  // Collapse multiple whitespace
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n").replace(/\s{2,}/g, " ").trim();

  return cleaned;
}

/**
 * Layer 3: Post-processing brand scrubber
 * Final safety net to replace any remaining brand names in AI output
 */
export function postCleanBrands(text: string): string {
  let cleaned = text;

  // Build case-insensitive replacement for each brand
  for (const brand of COMPETITOR_BRANDS) {
    // Skip regex-escaped entries for the display pattern
    const displayBrand = brand.replace(/\\\./g, ".");
    const regex = new RegExp(`\\b${brand}(?:'s)?\\b`, "gi");

    // Context-aware replacement
    cleaned = cleaned.replace(regex, (_match) => {
      return "your EOR provider";
    });
  }

  // Clean up awkward double replacements like "your EOR provider your EOR provider"
  cleaned = cleaned.replace(/(your EOR provider\s*){2,}/gi, "your EOR provider ");

  // Remove leftover CTA sentences that slipped through
  for (const pattern of CTA_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }

  return cleaned.trim();
}

// ─── Existing utility functions ──────────────────────────────────────────────

function clampScore(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function authorityLevel(score: number): "high" | "medium" | "low" {
  if (score >= 75) return "high";
  if (score >= 45) return "medium";
  return "low";
}

function heuristicAuthority(sourceName: string, url: string): SourceAuthorityResult {
  const host = (() => {
    try {
      return new URL(url).hostname.toLowerCase();
    } catch {
      return "";
    }
  })();

  const authorityHosts = [
    "littler.com",
    "fragomen.com",
    "ilo.org",
    "shrm.org",
    "gov",
    "oecd.org",
    "imf.org",
    "worldbank.org",
  ];

  const mediumHosts = ["papayaglobal.com", "remote.com", "deel.com"];

  let score = 40;
  if (authorityHosts.some((h) => host.includes(h))) score += 40;
  else if (mediumHosts.some((h) => host.includes(h))) score += 20;
  if (host.endsWith(".gov") || host.includes("gov.")) score += 20;
  if (sourceName.length > 5) score += 5;

  const finalScore = clampScore(score);
  return {
    score: finalScore,
    level: authorityLevel(finalScore),
    reason: `Heuristic authority evaluation for host ${host || "unknown"}.`,
  };
}

export async function evaluateSourceAuthorityWithAI(params: {
  sourceName: string;
  url: string;
  sourceType: "rss" | "api" | "web";
}): Promise<SourceAuthorityResult> {
  const fallback = heuristicAuthority(params.sourceName, params.url);

  try {
    const result = await executeTaskLLM("source_authority_review", {
      messages: [
        {
          role: "system",
          content:
            "You are a compliance intelligence assistant. Evaluate source authority for global employment, payroll, labor law and immigration topics.",
        },
        {
          role: "user",
          content: JSON.stringify(params),
        },
      ],
      responseFormat: { type: "json_object" },
      maxTokens: 300,
    });

    const raw = result.choices?.[0]?.message?.content;
    const text = typeof raw === "string" ? raw : "";
    const parsed = JSON.parse(text || "{}");

    const score = clampScore(Number(parsed.score ?? fallback.score));
    const reason = String(parsed.reason ?? fallback.reason).slice(0, 500);
    const level = authorityLevel(score);
    return { score, level, reason };
  } catch {
    return fallback;
  }
}

export async function generateKnowledgeDraftWithAI(params: {
  sourceName: string;
  sourceUrl: string;
  topic: "payroll" | "compliance" | "leave" | "invoice" | "onboarding" | "general";
  languageHint: "en" | "zh" | "multi";
  rawTitle: string;
  rawContent: string;
}): Promise<KnowledgeDraft> {
  const fallback: KnowledgeDraft = {
    title: params.rawTitle || "Knowledge Update",
    summary: (params.rawContent || "").slice(0, 220),
    content: (params.rawContent || "").slice(0, 2000),
    category: "article",
    topic: params.topic,
    language: params.languageHint === "zh" ? "zh" : "en",
    tags: [params.topic, "auto-generated"],
    countries: [],
    confidence: 65,
  };

  try {
    // Layer 1: Pre-clean the raw content
    const cleanedTitle = postCleanBrands(params.rawTitle);
    const cleanedContent = preCleanContent(params.rawContent);

    // Layer 2: Enhanced AI prompt with brand policy
    const prompt = {
      goal: "Rewrite and normalize raw web content into a neutral, brand-free knowledge article for our enterprise knowledge base",
      constraints: {
        audience: "B2B clients using EOR/AOR/visa services",
        output_language: params.languageHint,
        style: "concise, practical, policy-aware, neutral tone",
        brand_policy: {
          critical_rule: "You MUST remove ALL third-party company names, brand names, product names, and promotional content from the output. This is non-negotiable.",
          competitor_brands_to_remove: [
            "Deel", "Remote.com", "Oyster", "OysterHR", "G-P", "Globalization Partners",
            "Papaya Global", "Velocity Global", "Multiplier", "Rippling", "Skuad",
            "Omnipresent", "Lano", "Remofirst", "Safeguard Global", "Atlas HXM",
            "Horizons", "WorkMotion", "Pebl",
          ],
          replacement_strategy: "Replace any brand/company name with generic terms like 'your EOR provider', 'the employer of record', 'a global employment platform', or simply omit the brand reference",
          content_to_remove: [
            "Calls-to-action (book a demo, sign up, get started, etc.)",
            "Pricing mentions or plan comparisons",
            "Product feature promotions or platform-specific workflows",
            "Demo/signup links and URLs",
            "Testimonials or case studies mentioning specific vendors",
            "Copyright notices and legal disclaimers from the source",
            "Author bios that mention competitor companies",
          ],
          content_to_preserve: [
            "Factual legal and compliance information",
            "Regulatory requirements and deadlines",
            "Country-specific labor law details",
            "Tax rates, contribution percentages, and statutory benefits",
            "Best practices for global employment operations",
          ],
        },
      },
      input: {
        sourceName: params.sourceName,
        sourceUrl: params.sourceUrl,
        topic: params.topic,
        rawTitle: cleanedTitle,
        rawContent: cleanedContent.slice(0, 6000),
      },
      output_schema: {
        title: "string - neutral, no brand names",
        summary: "string <= 240 chars - neutral, no brand names",
        content: "string markdown format - neutral, factual, no brand names or CTAs",
        category: "article|alert|guide",
        topic: "payroll|compliance|leave|invoice|onboarding|general",
        language: "en|zh",
        tags: "string[] - no brand names in tags",
        countries: "string[] ISO country code if possible",
        confidence: "number 0-100",
      },
    };

    const result = await executeTaskLLM("knowledge_summarize", {
      messages: [
        {
          role: "system",
          content:
            "You are a legal/compliance editor for a global employment operations platform. " +
            "Your PRIMARY directive is to produce brand-neutral content. " +
            "NEVER include any third-party company names, product names, or promotional language in your output. " +
            "Replace all brand references with generic terms. " +
            "Focus exclusively on extracting factual, regulatory, and compliance information. " +
            "Return strict JSON only.",
        },
        {
          role: "user",
          content: JSON.stringify(prompt),
        },
      ],
      responseFormat: { type: "json_object" },
      maxTokens: 2000,
    });

    const raw = result.choices?.[0]?.message?.content;
    const text = typeof raw === "string" ? raw : "";
    const parsed = JSON.parse(text || "{}");

    // Layer 3: Post-clean AI output to catch any remaining brand mentions
    const finalTitle = postCleanBrands(String(parsed.title || fallback.title)).slice(0, 500);
    const finalSummary = postCleanBrands(String(parsed.summary || fallback.summary)).slice(0, 500);
    const finalContent = postCleanBrands(String(parsed.content || fallback.content)).slice(0, 10000);
    const finalTags = (Array.isArray(parsed.tags) ? parsed.tags : fallback.tags)
      .map((x: unknown) => postCleanBrands(String(x)))
      .filter((t: string) => t.length > 0 && t !== "your EOR provider")
      .slice(0, 12);

    return {
      title: finalTitle,
      summary: finalSummary,
      content: finalContent,
      category: ["article", "alert", "guide"].includes(parsed.category)
        ? parsed.category
        : fallback.category,
      topic: ["payroll", "compliance", "leave", "invoice", "onboarding", "general"].includes(parsed.topic)
        ? parsed.topic
        : fallback.topic,
      language: parsed.language === "zh" ? "zh" : "en",
      tags: finalTags,
      countries: Array.isArray(parsed.countries)
        ? parsed.countries.map((x: unknown) => String(x).toUpperCase()).slice(0, 8)
        : fallback.countries,
      confidence: clampScore(Number(parsed.confidence ?? fallback.confidence)),
    };
  } catch {
    return fallback;
  }
}

export async function generateCountryGuideDraft(params: {
  countryCode: string;
  topic: string;
}): Promise<{ contentEn: string; contentZh: string }> {
  try {
    const prompt = {
      goal: "Write a comprehensive country guide chapter",
      constraints: {
        audience: "B2B clients, HR managers, international expansion teams",
        style: "professional, authoritative, clear, practical",
        format: "markdown",
      },
      input: {
        country: params.countryCode,
        topic: params.topic,
      },
      output_schema: {
        contentEn: "string markdown (English)",
        contentZh: "string markdown (Chinese Simplified)",
      },
    };

    const result = await executeTaskLLM("knowledge_generate_guide", {
      messages: [
        {
          role: "system",
          content:
            "You are a global employment and compliance expert. Write a detailed guide chapter for the specified country and topic. Return strict JSON only.",
        },
        {
          role: "user",
          content: JSON.stringify(prompt),
        },
      ],
      responseFormat: { type: "json_object" },
      maxTokens: 2000,
    });

    const raw = result.choices?.[0]?.message?.content;
    const text = typeof raw === "string" ? raw : "";
    const parsed = JSON.parse(text || "{}");

    return {
      contentEn: parsed.contentEn || "",
      contentZh: parsed.contentZh || "",
    };
  } catch (error) {
    console.error("AI Generation Failed:", error);
    throw new Error("Failed to generate content via AI");
  }
}
