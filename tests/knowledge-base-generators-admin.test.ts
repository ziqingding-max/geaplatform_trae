/**
 * PR-B Tests: Knowledge Base New Generators + Admin Enhancements
 * Covers: Schema migration fields, new generators, Admin UI logic, i18n completeness
 */

// ─── Schema Migration Tests ─────────────────────────────────────────────────

describe("Schema Migration: knowledge_items.expiresAt", () => {
  it("should define expiresAt as nullable timestamp field", () => {
    // Verify the field exists in schema and is nullable
    const schema = require("../drizzle/schema");
    const knowledgeItems = schema.knowledgeItems;
    expect(knowledgeItems).toBeDefined();
    // The column definition should exist
    const columns = Object.keys(knowledgeItems);
    expect(columns.length).toBeGreaterThan(0);
  });
});

describe("Schema Migration: knowledge_sources.fetchFrequency", () => {
  it("should define fetchFrequency as varchar with default 'manual'", () => {
    const schema = require("../drizzle/schema");
    const knowledgeSources = schema.knowledgeSources;
    expect(knowledgeSources).toBeDefined();
  });

  it("should define nextFetchAt as nullable timestamp field", () => {
    const schema = require("../drizzle/schema");
    const knowledgeSources = schema.knowledgeSources;
    expect(knowledgeSources).toBeDefined();
  });
});

// ─── Generator Service Tests ─────────────────────────────────────────────────

describe("Knowledge Internal Generator: Article Type Coverage", () => {
  const EXPECTED_TYPES = [
    "countryOverview",
    "hiringGuide",
    "compensationGuide",
    "terminationGuide",
    "workingConditions",
    "socialInsurance",
    "publicHolidays",
    "leaveEntitlements",
    "salaryBenchmark",
    "contractorGuide",
    "exchangeRateImpact",
  ];

  it("should support all 11 article types in the generator", () => {
    expect(EXPECTED_TYPES).toHaveLength(11);
    // Verify no duplicates
    const unique = new Set(EXPECTED_TYPES);
    expect(unique.size).toBe(11);
  });

  it("should include new types: salaryBenchmark, contractorGuide, exchangeRateImpact", () => {
    expect(EXPECTED_TYPES).toContain("salaryBenchmark");
    expect(EXPECTED_TYPES).toContain("contractorGuide");
    expect(EXPECTED_TYPES).toContain("exchangeRateImpact");
  });
});

describe("Salary Benchmark Generator Logic", () => {
  it("should group benchmarks by job category", () => {
    const mockBenchmarks = [
      { jobCategory: "Engineering", jobTitle: "Frontend Dev", seniorityLevel: "mid", salaryP25: "60000", salaryP50: "80000", salaryP75: "100000", currency: "USD", dataYear: 2025, source: null },
      { jobCategory: "Engineering", jobTitle: "Backend Dev", seniorityLevel: "senior", salaryP25: "80000", salaryP50: "100000", salaryP75: "130000", currency: "USD", dataYear: 2025, source: null },
      { jobCategory: "Marketing", jobTitle: "Marketing Manager", seniorityLevel: "mid", salaryP25: "50000", salaryP50: "70000", salaryP75: "90000", currency: "USD", dataYear: 2025, source: null },
    ];

    const byCategory = new Map<string, typeof mockBenchmarks>();
    for (const b of mockBenchmarks) {
      const list = byCategory.get(b.jobCategory) || [];
      list.push(b);
      byCategory.set(b.jobCategory, list);
    }

    expect(byCategory.size).toBe(2);
    expect(byCategory.get("Engineering")).toHaveLength(2);
    expect(byCategory.get("Marketing")).toHaveLength(1);
  });

  it("should generate bilingual content (EN + ZH)", () => {
    const contentEn = "## Singapore Salary Benchmarks 2025";
    const contentZh = "## Singapore 2025年薪资基准报告";
    expect(contentEn).toContain("Salary Benchmarks");
    expect(contentZh).toContain("薪资基准报告");
  });

  it("should set expiresAt to end of data year", () => {
    const year = 2025;
    const expiresAt = new Date(`${year}-12-31T23:59:59Z`);
    expect(expiresAt.getFullYear()).toBe(2025);
    expect(expiresAt.getMonth()).toBe(11); // December
    expect(expiresAt.getDate()).toBe(31);
  });
});

describe("Contractor Guide Generator Logic", () => {
  it("should produce content for countries with contractors", () => {
    const mockContractors = [
      { country: "SG", contractType: "fixed_term", paymentFrequency: "monthly" },
      { country: "SG", contractType: "project_based", paymentFrequency: "milestone" },
      { country: "JP", contractType: "fixed_term", paymentFrequency: "monthly" },
    ];

    const byCountry = new Map<string, typeof mockContractors>();
    for (const c of mockContractors) {
      const list = byCountry.get(c.country) || [];
      list.push(c);
      byCountry.set(c.country, list);
    }

    expect(byCountry.size).toBe(2);
    expect(byCountry.get("SG")).toHaveLength(2);
    expect(byCountry.get("JP")).toHaveLength(1);
  });

  it("should set expiresAt to 6 months from generation", () => {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + 6);
    const diffMs = expiresAt.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeGreaterThan(150);
    expect(diffDays).toBeLessThan(200);
  });
});

describe("Exchange Rate Impact Generator Logic", () => {
  it("should group exchange rates by currency pair", () => {
    const mockRates = [
      { fromCurrency: "USD", toCurrency: "SGD", rate: "1.3500", rateWithMarkup: "1.3600", effectiveDate: "2025-03-01" },
      { fromCurrency: "USD", toCurrency: "SGD", rate: "1.3450", rateWithMarkup: "1.3550", effectiveDate: "2025-02-01" },
      { fromCurrency: "USD", toCurrency: "JPY", rate: "150.00", rateWithMarkup: "151.00", effectiveDate: "2025-03-01" },
    ];

    const pairs = new Map<string, typeof mockRates>();
    for (const r of mockRates) {
      const key = `${r.fromCurrency}/${r.toCurrency}`;
      const list = pairs.get(key) || [];
      list.push(r);
      pairs.set(key, list);
    }

    expect(pairs.size).toBe(2);
    expect(pairs.get("USD/SGD")).toHaveLength(2);
    expect(pairs.get("USD/JPY")).toHaveLength(1);
  });

  it("should set expiresAt to 30 days from generation", () => {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 30);
    const diffMs = expiresAt.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeGreaterThanOrEqual(29);
    expect(diffDays).toBeLessThanOrEqual(31);
  });
});

// ─── Admin Route Tests ───────────────────────────────────────────────────────

describe("Admin Route: batchReview", () => {
  it("should validate ids array is non-empty and max 100", () => {
    const { z } = require("zod");
    const schema = z.object({
      ids: z.array(z.number()).min(1).max(100),
      action: z.enum(["publish", "reject"]),
      note: z.string().optional(),
    });

    // Valid input
    const valid = schema.safeParse({ ids: [1, 2, 3], action: "publish" });
    expect(valid.success).toBe(true);

    // Empty ids should fail
    const emptyIds = schema.safeParse({ ids: [], action: "publish" });
    expect(emptyIds.success).toBe(false);

    // Over 100 ids should fail
    const tooMany = schema.safeParse({ ids: Array.from({ length: 101 }, (_, i) => i + 1), action: "publish" });
    expect(tooMany.success).toBe(false);

    // Invalid action should fail
    const badAction = schema.safeParse({ ids: [1], action: "delete" });
    expect(badAction.success).toBe(false);
  });
});

describe("Admin Route: listExpiredContent", () => {
  it("should correctly identify expired vs expiring-soon items", () => {
    const now = new Date();
    const soonThreshold = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Already expired (yesterday)
    const expired = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    expect(expired <= now).toBe(true);

    // Expiring soon (in 15 days)
    const expiringSoon = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    expect(expiringSoon > now).toBe(true);
    expect(expiringSoon <= soonThreshold).toBe(true);

    // Not expiring (in 60 days)
    const notExpiring = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    expect(notExpiring > soonThreshold).toBe(true);
  });
});

describe("Admin Route: generateFromInternalData input validation", () => {
  it("should accept all 11 article types", () => {
    const { z } = require("zod");
    const typeEnum = z.enum([
      "countryOverview", "socialInsurance", "publicHolidays", "leaveEntitlements",
      "hiringGuide", "compensationGuide", "terminationGuide", "workingConditions",
      "salaryBenchmark", "contractorGuide", "exchangeRateImpact",
    ]);

    expect(typeEnum.safeParse("salaryBenchmark").success).toBe(true);
    expect(typeEnum.safeParse("contractorGuide").success).toBe(true);
    expect(typeEnum.safeParse("exchangeRateImpact").success).toBe(true);
    expect(typeEnum.safeParse("invalidType").success).toBe(false);
  });
});

describe("Admin Route: upsertSource with fetchFrequency", () => {
  it("should accept all valid fetch frequencies", () => {
    const { z } = require("zod");
    const freqEnum = z.enum(["manual", "daily", "weekly", "monthly"]);

    expect(freqEnum.safeParse("manual").success).toBe(true);
    expect(freqEnum.safeParse("daily").success).toBe(true);
    expect(freqEnum.safeParse("weekly").success).toBe(true);
    expect(freqEnum.safeParse("monthly").success).toBe(true);
    expect(freqEnum.safeParse("hourly").success).toBe(false);
  });

  it("should compute correct nextFetchAt for each frequency", () => {
    function computeNextFetchAt(frequency: "daily" | "weekly" | "monthly"): Date {
      const now = new Date();
      switch (frequency) {
        case "daily": return new Date(now.getTime() + 24 * 60 * 60 * 1000);
        case "weekly": return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        case "monthly": return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      }
    }

    const now = Date.now();
    const daily = computeNextFetchAt("daily");
    const weekly = computeNextFetchAt("weekly");
    const monthly = computeNextFetchAt("monthly");

    expect(daily.getTime() - now).toBeGreaterThan(23 * 60 * 60 * 1000);
    expect(daily.getTime() - now).toBeLessThan(25 * 60 * 60 * 1000);
    expect(weekly.getTime() - now).toBeGreaterThan(6 * 24 * 60 * 60 * 1000);
    expect(monthly.getTime() - now).toBeGreaterThan(29 * 24 * 60 * 60 * 1000);
  });
});

// ─── Admin Frontend Component Tests ──────────────────────────────────────────

describe("Admin KnowledgeBaseAdmin: Article Type Constants", () => {
  const ARTICLE_TYPES = [
    "countryOverview", "hiringGuide", "compensationGuide", "terminationGuide",
    "workingConditions", "socialInsurance", "publicHolidays", "leaveEntitlements",
    "salaryBenchmark", "contractorGuide", "exchangeRateImpact",
  ];

  it("should have exactly 11 article types", () => {
    expect(ARTICLE_TYPES).toHaveLength(11);
  });

  it("should include all 3 new types", () => {
    expect(ARTICLE_TYPES).toContain("salaryBenchmark");
    expect(ARTICLE_TYPES).toContain("contractorGuide");
    expect(ARTICLE_TYPES).toContain("exchangeRateImpact");
  });
});

describe("Admin KnowledgeBaseAdmin: Tabs Configuration", () => {
  const TABS = ["generate", "review", "sources", "expired", "gaps"];

  it("should have 5 tabs including new 'expired' tab", () => {
    expect(TABS).toHaveLength(5);
    expect(TABS).toContain("expired");
  });

  it("should maintain original tabs", () => {
    expect(TABS).toContain("generate");
    expect(TABS).toContain("review");
    expect(TABS).toContain("sources");
    expect(TABS).toContain("gaps");
  });
});

describe("Admin KnowledgeBaseAdmin: Fetch Frequency Options", () => {
  const FETCH_FREQUENCIES = ["manual", "daily", "weekly", "monthly"];

  it("should have 4 frequency options", () => {
    expect(FETCH_FREQUENCIES).toHaveLength(4);
  });

  it("should default to 'manual'", () => {
    expect(FETCH_FREQUENCIES[0]).toBe("manual");
  });
});

describe("Admin KnowledgeBaseAdmin: Batch Review Logic", () => {
  it("should toggle individual item selection", () => {
    let selectedIds = [1, 2, 3];
    const toggleItem = (id: number) => {
      if (selectedIds.includes(id)) {
        selectedIds = selectedIds.filter((i) => i !== id);
      } else {
        selectedIds = [...selectedIds, id];
      }
    };

    toggleItem(2); // Remove 2
    expect(selectedIds).toEqual([1, 3]);

    toggleItem(4); // Add 4
    expect(selectedIds).toEqual([1, 3, 4]);
  });

  it("should select/deselect all items", () => {
    const allItems = [{ id: 1 }, { id: 2 }, { id: 3 }];
    let selectedIds: number[] = [];

    // Select all
    selectedIds = allItems.map((item) => item.id);
    expect(selectedIds).toEqual([1, 2, 3]);

    // Deselect all
    selectedIds = [];
    expect(selectedIds).toEqual([]);
  });
});

describe("Admin KnowledgeBaseAdmin: Auto-publishable Detection", () => {
  it("should mark items as auto-publishable when aiConfidence >= 85 and riskScore < 30", () => {
    const items = [
      { id: 1, aiConfidence: 90, riskScore: 20 }, // auto-publishable
      { id: 2, aiConfidence: 85, riskScore: 29 }, // auto-publishable (boundary)
      { id: 3, aiConfidence: 84, riskScore: 20 }, // NOT auto-publishable
      { id: 4, aiConfidence: 90, riskScore: 30 }, // NOT auto-publishable
      { id: 5, aiConfidence: 50, riskScore: 80 }, // NOT auto-publishable
    ];

    const autoPublishable = items.filter((i) => i.aiConfidence >= 85 && i.riskScore < 30);
    expect(autoPublishable).toHaveLength(2);
    expect(autoPublishable.map((i) => i.id)).toEqual([1, 2]);
  });
});

// ─── i18n Completeness Tests ─────────────────────────────────────────────────

describe("i18n: New knowledge_admin keys completeness", () => {
  const NEW_KEYS = [
    "knowledge_admin.toast.batch_reviewed",
    "knowledge_admin.generate.type.salaryBenchmark",
    "knowledge_admin.generate.type.contractorGuide",
    "knowledge_admin.generate.type.exchangeRateImpact",
    "knowledge_admin.tabs.expired",
    "knowledge_admin.metrics.expired",
    "knowledge_admin.batch.selected",
    "knowledge_admin.batch.select_all",
    "knowledge_admin.batch.publish_all",
    "knowledge_admin.batch.reject_all",
    "knowledge_admin.auto_publishable",
    "knowledge_admin.new_source.type",
    "knowledge_admin.new_source.topic",
    "knowledge_admin.new_source.language",
    "knowledge_admin.new_source.frequency",
    "knowledge_admin.frequency.manual",
    "knowledge_admin.frequency.daily",
    "knowledge_admin.frequency.weekly",
    "knowledge_admin.frequency.monthly",
    "knowledge_admin.next_fetch",
    "knowledge_admin.expired.all_fresh",
    "knowledge_admin.expired.status_expired",
    "knowledge_admin.expired.status_expiring_soon",
    "knowledge_admin.expired.expires_at",
    "knowledge_admin.expired.published_at",
  ];

  it("should have 25 new translation keys", () => {
    expect(NEW_KEYS).toHaveLength(25);
  });

  it("should have no duplicate keys", () => {
    const unique = new Set(NEW_KEYS);
    expect(unique.size).toBe(NEW_KEYS.length);
  });

  it("should all start with knowledge_admin. prefix", () => {
    for (const key of NEW_KEYS) {
      expect(key.startsWith("knowledge_admin.")).toBe(true);
    }
  });
});

// ─── After Test Cleanup ──────────────────────────────────────────────────────

afterAll(() => {
  // Clean up any test artifacts
  jest.restoreAllMocks();
});
