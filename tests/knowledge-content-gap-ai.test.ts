/**
 * PR-D Tests: Content Gap AI Generation + Gaps Tab Enhancement
 * Covers: generateFromContentGap API, dismissContentGap API, Gaps Tab UI logic, i18n
 */

import * as fs from "fs";
import * as path from "path";

// ─── Helper: Read source files ──────────────────────────────────────────────

const ROOT = path.resolve(__dirname, "..");
const readFile = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf-8");

const adminRouterSrc = readFile("server/routers/knowledgeBaseAdmin.ts");
const adminPageSrc = readFile("client/src/pages/KnowledgeBaseAdmin.tsx");
const i18nSrc = readFile("client/src/lib/i18n.ts");

// ─── 1. Backend: generateFromContentGap API ─────────────────────────────────

describe("Backend: generateFromContentGap API", () => {
  test("should define generateFromContentGap procedure", () => {
    expect(adminRouterSrc).toContain("generateFromContentGap");
  });

  test("should accept query, topics, and language inputs", () => {
    expect(adminRouterSrc).toContain("query: z.string()");
    expect(adminRouterSrc).toContain("topics: z.array(z.string())");
    expect(adminRouterSrc).toContain('language: z.enum(["en", "zh"])');
  });

  test("should call generateKnowledgeDraftWithAI", () => {
    // The function should use AI to generate content
    const gapSection = adminRouterSrc.split("generateFromContentGap")[1];
    expect(gapSection).toContain("generateKnowledgeDraftWithAI");
  });

  test("should insert with status pending_review", () => {
    const gapSection = adminRouterSrc.split("generateFromContentGap")[1]?.split("dismissContentGap")[0] || "";
    expect(gapSection).toContain("pending_review");
  });

  test("should store metadata with generatedFrom: content_gap", () => {
    expect(adminRouterSrc).toContain("content_gap");
    expect(adminRouterSrc).toContain("originalQuery");
    expect(adminRouterSrc).toContain("originalTopics");
  });

  test("should compute risk scores for generated content", () => {
    const gapSection = adminRouterSrc.split("generateFromContentGap")[1]?.split("dismissContentGap")[0] || "";
    expect(gapSection).toContain("computeFreshnessScore");
    expect(gapSection).toContain("computeDuplicationScore");
    expect(gapSection).toContain("computeRiskScore");
  });

  test("should return success, title, and confidence", () => {
    const gapSection = adminRouterSrc.split("generateFromContentGap")[1]?.split("dismissContentGap")[0] || "";
    expect(gapSection).toContain("success: true");
    expect(gapSection).toContain("title: draft.title");
    expect(gapSection).toContain("confidence: draft.confidence");
  });
});

// ─── 2. Backend: dismissContentGap API ──────────────────────────────────────

describe("Backend: dismissContentGap API", () => {
  test("should define dismissContentGap procedure", () => {
    expect(adminRouterSrc).toContain("dismissContentGap");
  });

  test("should accept query input", () => {
    const dismissSection = adminRouterSrc.split("dismissContentGap")[1] || "";
    expect(dismissSection).toContain("query: z.string()");
  });

  test("should return success", () => {
    const dismissSection = adminRouterSrc.split("dismissContentGap")[1]?.split("listExpiredContent")[0] || "";
    expect(dismissSection).toContain("success: true");
  });
});

// ─── 3. Frontend: Gaps Tab Enhancement ──────────────────────────────────────

describe("Frontend: Gaps Tab Enhancement", () => {
  test("should have generateFromGapMutation", () => {
    expect(adminPageSrc).toContain("generateFromGapMutation");
    expect(adminPageSrc).toContain("generateFromContentGap");
  });

  test("should have dismissGapMutation", () => {
    expect(adminPageSrc).toContain("dismissGapMutation");
    expect(adminPageSrc).toContain("dismissContentGap");
  });

  test("should track dismissed gaps in state", () => {
    expect(adminPageSrc).toContain("dismissedGaps");
    expect(adminPageSrc).toContain("setDismissedGaps");
  });

  test("should filter out dismissed gaps from display", () => {
    expect(adminPageSrc).toContain("dismissedGaps.includes");
  });

  test("should have AI Generate EN button", () => {
    expect(adminPageSrc).toContain("knowledge_admin.gaps.ai_generate_en");
  });

  test("should have AI Generate ZH button", () => {
    expect(adminPageSrc).toContain("knowledge_admin.gaps.ai_generate_zh");
  });

  test("should have Dismiss button", () => {
    expect(adminPageSrc).toContain("knowledge_admin.gaps.dismiss");
  });

  test("should pass query, topics, and language to generateFromGapMutation", () => {
    // Check that the mutation is called with proper params
    expect(adminPageSrc).toContain("query: gap.query");
    expect(adminPageSrc).toContain("topics: gap.topics");
    expect(adminPageSrc).toContain('language: "en"');
    expect(adminPageSrc).toContain('language: "zh"');
  });

  test("should show empty state with CheckCircle2 icon when no gaps", () => {
    expect(adminPageSrc).toContain("CheckCircle2");
  });
});

// ─── 4. i18n: New translation keys ─────────────────────────────────────────

describe("i18n: Content Gap AI keys", () => {
  const NEW_KEYS = [
    "knowledge_admin.gaps.ai_generate_en",
    "knowledge_admin.gaps.ai_generate_zh",
    "knowledge_admin.gaps.dismiss",
    "knowledge_admin.toast.gap_generated",
    "knowledge_admin.toast.gap_dismissed",
  ];

  test("should have all new translation keys present in both EN and ZH", () => {
    // Each key should appear exactly twice in the file (once in en, once in zh)
    for (const key of NEW_KEYS) {
      const escapedKey = key.replace(/\./g, "\\.");
      const regex = new RegExp(`"${escapedKey}"`, "g");
      const matches = i18nSrc.match(regex) || [];
      expect(matches.length).toBeGreaterThanOrEqual(2);
    }
  });

  test("EN and ZH should have same number of gap-related keys", () => {
    // Count occurrences in the full file - each key should appear exactly twice (en + zh)
    for (const key of NEW_KEYS) {
      const escapedKey2 = key.replace(/\./g, "\\.");
      const regex = new RegExp(`"${escapedKey2}"`, "g");
      const matches = i18nSrc.match(regex) || [];
      expect(matches.length).toBe(2); // once in en, once in zh
    }
  });
});

// ─── 5. After-test cleanup ──────────────────────────────────────────────────

afterAll(() => {
  // Verify no temp files were created during tests
  const testTmpFiles = fs.readdirSync(path.join(ROOT, "tests")).filter((f) => f.endsWith(".tmp"));
  expect(testTmpFiles.length).toBe(0);
  console.log("✅ After-test cleanup: no temp files found, all clean.");
});
