/**
 * Tests for Sales CRM form fixes:
 * 1. Email validation allows empty strings
 * 2. CountrySelect uses scope="all" in Sales CRM
 * 3. IntendedServices uses ServiceMultiSelect (dropdown multi-select)
 * 4. TargetCountries uses CountryMultiSelect (searchable multi-select)
 * 5. ExpectedCloseDate uses DatePicker component
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const salesRouterSrc = readFileSync(
  resolve(__dirname, "routers/sales.ts"),
  "utf-8"
);
const salesCRMSrc = readFileSync(
  resolve(__dirname, "../client/src/pages/SalesCRM.tsx"),
  "utf-8"
);

describe("Sales CRM — Email validation", () => {
  it("create mutation allows empty contactEmail via z.union with z.literal", () => {
    // The create input should use z.union([z.literal(""), z.string().email(...)]) pattern
    expect(salesRouterSrc).toMatch(/contactEmail.*z\.union\(\[z\.literal\(""\)/);
  });

  it("update mutation also uses z.union for contactEmail", () => {
    // Both create and update should use z.union pattern
    const matches = salesRouterSrc.match(/contactEmail.*z\.union\(\[z\.literal\(""\)/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(2);
  });
});

describe("Sales CRM — Country select scope", () => {
  it("uses scope='all' for CountrySelect in create form", () => {
    expect(salesCRMSrc).toContain('scope="all"');
  });

  it("imports ALL_COUNTRIES from CountrySelect", () => {
    expect(salesCRMSrc).toMatch(/import.*ALL_COUNTRIES.*from.*CountrySelect/);
  });
});

describe("Sales CRM — Service multi-select", () => {
  it("defines SERVICE_OPTIONS constant with EOR service types", () => {
    expect(salesCRMSrc).toContain("SERVICE_OPTIONS");
    expect(salesCRMSrc).toMatch(/value:\s*"eor"/);
    expect(salesCRMSrc).toMatch(/value:\s*"visa_eor"/);
    expect(salesCRMSrc).toMatch(/value:\s*"aor"/);
  });

  it("defines ServiceMultiSelect component", () => {
    expect(salesCRMSrc).toContain("function ServiceMultiSelect");
  });

  it("uses ServiceMultiSelect in create form instead of Input", () => {
    // The create form section should use ServiceMultiSelect for intendedServices
    expect(salesCRMSrc).toContain("<ServiceMultiSelect");
  });

  it("ServiceMultiSelect uses Checkbox for multi-selection", () => {
    // The component should use Checkbox for each option
    expect(salesCRMSrc).toMatch(/ServiceMultiSelect[\s\S]*?Checkbox/);
  });
});

describe("Sales CRM — Country multi-select for target countries", () => {
  it("defines CountryMultiSelect component", () => {
    expect(salesCRMSrc).toContain("function CountryMultiSelect");
  });

  it("uses CountryMultiSelect in create form instead of Input", () => {
    expect(salesCRMSrc).toContain("<CountryMultiSelect");
  });

  it("CountryMultiSelect uses Command for searchable list", () => {
    expect(salesCRMSrc).toMatch(/CountryMultiSelect[\s\S]*?CommandInput/);
  });

  it("CountryMultiSelect supports tag removal with X icon", () => {
    expect(salesCRMSrc).toMatch(/CountryMultiSelect[\s\S]*?removeTag/);
  });

  it("uses CountryMultiSelect in both create and edit forms", () => {
    const matches = salesCRMSrc.match(/<CountryMultiSelect/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(2);
  });
});

describe("Sales CRM — DatePicker for expected close date", () => {
  it("imports DatePicker component", () => {
    expect(salesCRMSrc).toMatch(/import.*DatePicker.*from.*DatePicker/);
  });

  it("uses DatePicker for expectedCloseDate in create form", () => {
    expect(salesCRMSrc).toContain("<DatePicker");
    // Should not use <Input type="date" for expectedCloseDate anymore
    expect(salesCRMSrc).not.toMatch(/<Input\s+type="date".*expectedCloseDate/);
  });

  it("uses DatePicker in both create and edit forms", () => {
    const matches = salesCRMSrc.match(/<DatePicker/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(2);
  });
});

describe("Sales CRM — Detail view formatting", () => {
  it("formats intendedServices with SERVICE_OPTIONS labels in detail view", () => {
    // Detail view should map service values to labels
    expect(salesCRMSrc).toMatch(/intendedServices.*SERVICE_OPTIONS\.find/);
  });

  it("formats targetCountries with country names in detail view", () => {
    // Detail view should map country codes to names
    expect(salesCRMSrc).toMatch(/targetCountries.*ALL_COUNTRIES\.find/);
  });
});

// ── createdBy (owner) field ──────────────────────────────────────────────────

describe("Sales Lead Owner (createdBy)", () => {
  it("schema includes createdBy column in sales_leads", () => {
    const schemaContent = readFileSync(resolve(__dirname, "../drizzle/schema.ts"), "utf-8");
    expect(schemaContent).toContain('createdBy: int("createdBy")');
  });

  it("create mutation sets createdBy from ctx.user.id", () => {
    expect(salesRouterSrc).toContain("createdBy: ctx.user.id");
  });

  it("frontend list table shows Owner column", () => {
    expect(salesCRMSrc).toContain('t("sales.owner")');
    expect(salesCRMSrc).toContain("lead.createdBy");
  });

  it("detail view shows Owner InfoRow", () => {
    expect(salesCRMSrc).toContain('label={t("sales.owner")}');
    expect(salesCRMSrc).toContain("leadOwner?.name");
  });
});

// ── i18n status keys ─────────────────────────────────────────────────────────

describe("Sales CRM i18n status keys", () => {
  it("i18n has correct pipeline status keys (discovery, leads, quotation_sent, etc.)", () => {
    const i18nContent = readFileSync(resolve(__dirname, "../client/src/lib/i18n.ts"), "utf-8");
    const expectedKeys = ["discovery", "leads", "quotation_sent", "msa_sent", "msa_signed", "closed_won", "closed_lost"];
    for (const key of expectedKeys) {
      expect(i18nContent).toContain(`"sales.status.${key}"`);
    }
  });

  it("i18n does NOT have old status keys (new, contacted, qualified, etc.)", () => {
    const i18nContent = readFileSync(resolve(__dirname, "../client/src/lib/i18n.ts"), "utf-8");
    const oldKeys = ["sales.status.new", "sales.status.contacted", "sales.status.qualified", "sales.status.negotiation"];
    for (const key of oldKeys) {
      expect(i18nContent).not.toContain(`"${key}"`);
    }
  });
});
