/**
 * Proposal PDF Service
 *
 * Generates a combined "Headhunter Toolkit Proposal" PDF by aggregating
 * data from multiple toolkit modules (benefits, compliance, salary, start-date, templates).
 *
 * Reuses the existing htmlPdfService infrastructure (Puppeteer + branded templates).
 */
import puppeteer from "puppeteer-core";
import { existsSync } from "fs";
import { execSync } from "child_process";
import { PDFDocument } from "pdf-lib";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProposalBenefitItem {
  nameEn: string;
  nameZh?: string | null;
  category: string;
  descriptionEn?: string | null;
  descriptionZh?: string | null;
  costIndication?: string | null;
}

export interface ProposalComplianceItem {
  metricNameEn: string;
  metricNameZh?: string | null;
  metricValueEn: string;
  metricValueZh?: string | null;
  riskLevel?: string | null;
  category?: string | null;
  notesEn?: string | null;
  notesZh?: string | null;
}

export interface ProposalSalaryItem {
  jobTitle: string;
  level?: string | null;
  p25?: number | null;
  p50?: number | null;
  p75?: number | null;
  currency?: string | null;
}

export interface ProposalStartDateItem {
  countryName: string;
  noticePeriodDays: number;
  eorOnboardingDays: number;
  holidaysInRange: string[];
  earliestStartDate: string;
}

export interface ProposalTemplateItem {
  titleEn: string;
  titleZh?: string | null;
  templateType: string;
  fileFormat?: string | null;
}

export interface ProposalSection {
  type: "benefits" | "compliance" | "salary" | "start_date" | "templates";
  country: string;
  countryCode?: string;
  data: any[];
}

export interface ProposalData {
  sections: ProposalSection[];
  locale?: "en" | "zh";
  clientName?: string;
  preparedBy?: string;
}

// ─── Brand Tokens (aligned with htmlPdfService) ──────────────────────────────

const BRAND = {
  primary: "#005430",
  primaryLight: "#2E6E50",
  gold: "#E1BA2E",
  bg: "#F8FBF9",
  text: "#1a1a1a",
  muted: "#666666",
  border: "#d0ddd6",
  tableHeader: "#e8f0ec",
  tableStripe: "#f4f8f6",
};

const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 10pt;
    line-height: 1.6;
    color: ${BRAND.text};
    background: white;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 18mm 16mm 22mm 16mm;
    position: relative;
    page-break-after: always;
    background: white;
  }
  .page.cover {
    height: 297mm;
    min-height: 297mm;
    max-height: 297mm;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
    padding: 0;
  }
  .cover-sidebar {
    position: absolute; top: 0; left: 0; width: 8mm; height: 100%;
    background: linear-gradient(180deg, ${BRAND.primary} 0%, ${BRAND.primaryLight} 100%);
  }
  .cover-corner {
    position: absolute; top: 0; right: 0; width: 40mm; height: 40mm;
    background: linear-gradient(135deg, ${BRAND.gold} 0%, transparent 70%);
    opacity: 0.3;
  }
  .cover-body {
    flex: 1; display: flex; flex-direction: column; justify-content: center;
    padding: 30mm 24mm 30mm 24mm; margin-left: 8mm;
  }
  .cover-logo { font-size: 28pt; font-weight: 700; color: ${BRAND.primary}; letter-spacing: 2pt; }
  .cover-divider { width: 50mm; height: 1mm; background: ${BRAND.gold}; margin: 8mm 0; border-radius: 1mm; }
  .cover-title { font-size: 22pt; font-weight: 700; color: ${BRAND.primary}; margin-bottom: 3mm; }
  .cover-subtitle { font-size: 14pt; font-weight: 400; color: ${BRAND.muted}; margin-bottom: 6mm; }
  .cover-date { font-size: 10pt; color: ${BRAND.muted}; margin-bottom: 6mm; }
  .cover-meta { display: flex; gap: 8mm; margin-top: 6mm; }
  .cover-meta-item { display: flex; flex-direction: column; }
  .cover-meta-label { font-size: 8pt; color: ${BRAND.muted}; text-transform: uppercase; letter-spacing: 0.5pt; }
  .cover-meta-value { font-size: 11pt; font-weight: 600; color: ${BRAND.text}; }
  .cover-bottom-accent {
    position: absolute; bottom: 0; left: 0; right: 0; height: 12mm;
    background: ${BRAND.primary}; display: flex; align-items: center; justify-content: center;
  }
  .cover-bottom-text { color: white; font-size: 8pt; letter-spacing: 1pt; text-transform: uppercase; }
  /* Content pages */
  h2 { font-size: 14pt; font-weight: 700; color: ${BRAND.primary}; margin-bottom: 4mm; border-bottom: 0.5pt solid ${BRAND.border}; padding-bottom: 2mm; }
  h3 { font-size: 11pt; font-weight: 600; color: ${BRAND.primaryLight}; margin: 4mm 0 2mm 0; }
  table { width: 100%; border-collapse: collapse; margin: 3mm 0 5mm 0; font-size: 9pt; }
  th { background: ${BRAND.tableHeader}; color: ${BRAND.primary}; font-weight: 600; text-align: left; padding: 2mm 3mm; border: 0.5pt solid ${BRAND.border}; }
  td { padding: 2mm 3mm; border: 0.5pt solid ${BRAND.border}; }
  tr:nth-child(even) td { background: ${BRAND.tableStripe}; }
  .risk-high { color: #dc2626; font-weight: 600; }
  .risk-medium { color: #ea580c; font-weight: 600; }
  .risk-low { color: #16a34a; font-weight: 600; }
  .section-intro { font-size: 9pt; color: ${BRAND.muted}; margin-bottom: 4mm; }
  .badge { display: inline-block; padding: 0.5mm 2mm; border-radius: 1mm; font-size: 8pt; font-weight: 500; }
  .badge-statutory { background: #dcfce7; color: #166534; }
  .badge-customary { background: #dbeafe; color: #1e40af; }
  .disclaimer { margin-top: 6mm; padding: 3mm; background: ${BRAND.bg}; border-left: 2pt solid ${BRAND.gold}; font-size: 8pt; color: ${BRAND.muted}; }
`;

// ─── Chromium Launcher ────────────────────────────────────────────────────────

const CHROMIUM_ARGS = [
  "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage",
  "--disable-gpu", "--font-render-hinting=none", "--disable-extensions",
  "--disable-background-networking", "--disable-default-apps",
  "--disable-translate", "--no-first-run",
];

const CHROMIUM_CANDIDATES = [
  process.env.CHROMIUM_PATH,
  "/usr/bin/chromium-browser", "/usr/bin/chromium",
  "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable",
  "/usr/local/bin/chromium", "/snap/bin/chromium",
  "/opt/google/chrome/chrome",
];

function findChromiumPath(): string {
  for (const p of CHROMIUM_CANDIDATES) {
    if (p && existsSync(p)) return p;
  }
  try {
    const found = execSync("which chromium chromium-browser google-chrome 2>/dev/null | head -1", { encoding: "utf8" }).trim();
    if (found) return found;
  } catch (_) {}
  throw new Error("Chromium not found.");
}

async function launchBrowser() {
  return puppeteer.launch({ executablePath: findChromiumPath(), headless: true, args: CHROMIUM_ARGS });
}

async function htmlToPdf(html: string): Promise<Buffer> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({ format: "A4", printBackground: true });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

async function htmlToPdfWithHeader(html: string, opts: { headerTemplate: string; footerTemplate: string }): Promise<Buffer> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4", printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: opts.headerTemplate,
      footerTemplate: opts.footerTemplate,
      margin: { top: "18mm", bottom: "18mm", left: "16mm", right: "16mm" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

async function mergePdfs(pdfBuffers: Buffer[]): Promise<Buffer> {
  const merged = await PDFDocument.create();
  for (const buf of pdfBuffers) {
    const doc = await PDFDocument.load(buf);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }
  return Buffer.from(await merged.save());
}

// ─── Section Renderers ────────────────────────────────────────────────────────

function renderBenefitsSection(country: string, items: ProposalBenefitItem[], locale: string): string {
  const isZh = locale === "zh";
  const statutory = items.filter(i => i.category === "statutory");
  const customary = items.filter(i => i.category !== "statutory");

  let html = `<h2>${isZh ? `${country} — 福利概览` : `${country} — Benefits Overview`}</h2>`;

  if (statutory.length) {
    html += `<h3>${isZh ? "法定强制福利 (Statutory)" : "Statutory Benefits"}</h3>`;
    html += `<table><tr><th>${isZh ? "福利名称" : "Benefit"}</th><th>${isZh ? "说明" : "Description"}</th><th>${isZh ? "成本参考" : "Cost Indication"}</th></tr>`;
    for (const b of statutory) {
      html += `<tr><td><strong>${isZh ? (b.nameZh || b.nameEn) : b.nameEn}</strong></td><td>${isZh ? (b.descriptionZh || b.descriptionEn || "") : (b.descriptionEn || "")}</td><td>${b.costIndication || "—"}</td></tr>`;
    }
    html += `</table>`;
  }

  if (customary.length) {
    html += `<h3>${isZh ? "市场补充福利 (Customary)" : "Customary / Market Practice"}</h3>`;
    html += `<table><tr><th>${isZh ? "福利名称" : "Benefit"}</th><th>${isZh ? "说明" : "Description"}</th><th>${isZh ? "成本参考" : "Cost Indication"}</th></tr>`;
    for (const b of customary) {
      html += `<tr><td><strong>${isZh ? (b.nameZh || b.nameEn) : b.nameEn}</strong></td><td>${isZh ? (b.descriptionZh || b.descriptionEn || "") : (b.descriptionEn || "")}</td><td>${b.costIndication || "—"}</td></tr>`;
    }
    html += `</table>`;
  }

  return html;
}

function renderComplianceSection(country: string, items: ProposalComplianceItem[], locale: string): string {
  const isZh = locale === "zh";
  let html = `<h2>${isZh ? `${country} — 招聘合规速查` : `${country} — Hiring Compliance`}</h2>`;
  html += `<table><tr><th>${isZh ? "指标" : "Metric"}</th><th>${isZh ? "值" : "Value"}</th><th>${isZh ? "风险等级" : "Risk"}</th><th>${isZh ? "备注" : "Notes"}</th></tr>`;
  for (const c of items) {
    const riskClass = c.riskLevel === "high" ? "risk-high" : c.riskLevel === "medium" ? "risk-medium" : "risk-low";
    const riskLabel = c.riskLevel ? c.riskLevel.toUpperCase() : "—";
    html += `<tr>
      <td><strong>${isZh ? (c.metricNameZh || c.metricNameEn) : c.metricNameEn}</strong></td>
      <td>${isZh ? (c.metricValueZh || c.metricValueEn) : c.metricValueEn}</td>
      <td><span class="${riskClass}">${riskLabel}</span></td>
      <td>${isZh ? (c.notesZh || c.notesEn || "") : (c.notesEn || "")}</td>
    </tr>`;
  }
  html += `</table>`;
  return html;
}

function renderSalarySection(country: string, items: ProposalSalaryItem[], locale: string): string {
  const isZh = locale === "zh";
  let html = `<h2>${isZh ? `${country} — 薪酬基准` : `${country} — Salary Benchmarks`}</h2>`;
  html += `<table><tr><th>${isZh ? "职位" : "Job Title"}</th><th>${isZh ? "级别" : "Level"}</th><th>P25</th><th>P50</th><th>P75</th><th>${isZh ? "货币" : "Currency"}</th></tr>`;
  for (const s of items) {
    html += `<tr>
      <td><strong>${s.jobTitle}</strong></td>
      <td>${s.level || "—"}</td>
      <td>${s.p25 != null ? s.p25.toLocaleString() : "—"}</td>
      <td>${s.p50 != null ? s.p50.toLocaleString() : "—"}</td>
      <td>${s.p75 != null ? s.p75.toLocaleString() : "—"}</td>
      <td>${s.currency || "USD"}</td>
    </tr>`;
  }
  html += `</table>`;
  return html;
}

function renderStartDateSection(country: string, items: ProposalStartDateItem[], locale: string): string {
  const isZh = locale === "zh";
  const item = items[0];
  if (!item) return "";
  let html = `<h2>${isZh ? `${country} — 入职日预测` : `${country} — Start Date Prediction`}</h2>`;
  html += `<table>
    <tr><th>${isZh ? "指标" : "Metric"}</th><th>${isZh ? "值" : "Value"}</th></tr>
    <tr><td>${isZh ? "法定通知期" : "Notice Period"}</td><td>${item.noticePeriodDays} ${isZh ? "天" : "days"}</td></tr>
    <tr><td>${isZh ? "EOR入职办理" : "EOR Onboarding SLA"}</td><td>${item.eorOnboardingDays} ${isZh ? "天" : "days"}</td></tr>
    <tr><td>${isZh ? "期间公共假日" : "Public Holidays in Range"}</td><td>${item.holidaysInRange.length > 0 ? item.holidaysInRange.join(", ") : (isZh ? "无" : "None")}</td></tr>
    <tr style="background:${BRAND.tableHeader};"><td><strong>${isZh ? "建议最早入职日" : "Earliest Recommended Start Date"}</strong></td><td><strong>${item.earliestStartDate}</strong></td></tr>
  </table>`;
  return html;
}

function renderTemplatesSection(country: string, items: ProposalTemplateItem[], locale: string): string {
  const isZh = locale === "zh";
  let html = `<h2>${isZh ? `${country} — 文档模版清单` : `${country} — Document Templates`}</h2>`;
  html += `<table><tr><th>${isZh ? "文档名称" : "Document"}</th><th>${isZh ? "类型" : "Type"}</th><th>${isZh ? "格式" : "Format"}</th></tr>`;
  for (const t of items) {
    html += `<tr><td>${isZh ? (t.titleZh || t.titleEn) : t.titleEn}</td><td>${t.templateType}</td><td>${(t.fileFormat || "PDF").toUpperCase()}</td></tr>`;
  }
  html += `</table>`;
  return html;
}

// ─── Main Generator ───────────────────────────────────────────────────────────

export async function generateProposalPdf(data: ProposalData): Promise<Buffer> {
  const locale = data.locale || "en";
  const isZh = locale === "zh";
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // ── 1. Cover Page ──
  const countries = [...new Set(data.sections.map(s => s.country))];
  const coverMeta = [
    { label: isZh ? "国家" : "Countries", value: countries.join(", ") },
    { label: isZh ? "模块数" : "Sections", value: `${data.sections.length}` },
  ];
  if (data.clientName) {
    coverMeta.push({ label: isZh ? "客户" : "Client", value: data.clientName });
  }
  if (data.preparedBy) {
    coverMeta.push({ label: isZh ? "准备人" : "Prepared By", value: data.preparedBy });
  }

  const coverMetaHtml = coverMeta.map(m => `
    <div class="cover-meta-item">
      <span class="cover-meta-label">${m.label}</span>
      <span class="cover-meta-value">${m.value}</span>
    </div>`).join("");

  const coverHtml = `<!DOCTYPE html>
<html lang="${locale}">
<head><meta charset="UTF-8"><style>${BASE_CSS}</style></head>
<body>
  <div class="page cover">
    <div class="cover-sidebar"></div>
    <div class="cover-corner"></div>
    <div class="cover-body">
      <div class="cover-logo">GEA</div>
      <div class="cover-divider"></div>
      <div class="cover-title">${isZh ? "猎头工具包报告" : "Headhunter Toolkit Proposal"}</div>
      <div class="cover-subtitle">${isZh ? "全球用工解决方案" : "Global Employment Solutions"}</div>
      <div class="cover-date">${date}</div>
      <div class="cover-meta">${coverMetaHtml}</div>
    </div>
    <div class="cover-bottom-accent">
      <span class="cover-bottom-text">Confidential &amp; Proprietary — Global Employment Advisors</span>
    </div>
  </div>
</body>
</html>`;
  const coverPdf = await htmlToPdf(coverHtml);

  // ── 2. Content Pages ──
  let contentPages = "";

  // Table of Contents
  let tocItems = data.sections.map((s, i) => {
    const typeLabels: Record<string, { en: string; zh: string }> = {
      benefits: { en: "Benefits Overview", zh: "福利概览" },
      compliance: { en: "Hiring Compliance", zh: "招聘合规" },
      salary: { en: "Salary Benchmarks", zh: "薪酬基准" },
      start_date: { en: "Start Date Prediction", zh: "入职日预测" },
      templates: { en: "Document Templates", zh: "文档模版" },
    };
    const label = isZh ? typeLabels[s.type]?.zh : typeLabels[s.type]?.en;
    return `<div style="display:flex;justify-content:space-between;padding:1.5mm 0;border-bottom:0.3pt dotted ${BRAND.border};">
      <span><strong>${i + 1}.</strong> ${s.country} — ${label || s.type}</span>
    </div>`;
  }).join("");

  contentPages += `<div class="page">
    <h2>${isZh ? "目录" : "Table of Contents"}</h2>
    <div style="margin-top:4mm;">${tocItems}</div>
  </div>`;

  // Section pages
  for (const section of data.sections) {
    let sectionHtml = "";
    switch (section.type) {
      case "benefits":
        sectionHtml = renderBenefitsSection(section.country, section.data, locale);
        break;
      case "compliance":
        sectionHtml = renderComplianceSection(section.country, section.data, locale);
        break;
      case "salary":
        sectionHtml = renderSalarySection(section.country, section.data, locale);
        break;
      case "start_date":
        sectionHtml = renderStartDateSection(section.country, section.data, locale);
        break;
      case "templates":
        sectionHtml = renderTemplatesSection(section.country, section.data, locale);
        break;
    }
    if (sectionHtml) {
      contentPages += `<div class="page">${sectionHtml}</div>`;
    }
  }

  // Disclaimer page
  contentPages += `<div class="page">
    <div class="disclaimer">
      <strong>${isZh ? "免责声明" : "Disclaimer"}</strong><br/>
      ${isZh
        ? "本报告中的数据仅供参考，不构成法律或税务建议。实际用工成本和合规要求可能因具体情况而异。建议在做出任何雇佣决策前咨询专业法律和税务顾问。数据来源标记为 AI Generated 的内容已尽力确保准确性，但可能存在偏差，请以当地官方最新法规为准。"
        : "The data in this report is for reference purposes only and does not constitute legal or tax advice. Actual employment costs and compliance requirements may vary depending on specific circumstances. We recommend consulting professional legal and tax advisors before making any employment decisions. Data marked as AI Generated has been prepared with best efforts for accuracy but may contain discrepancies; please refer to the latest local official regulations."
      }
    </div>
  </div>`;

  const headerTitle = isZh ? "GEA 猎头工具包报告" : "GEA Headhunter Toolkit Proposal";
  const headerTemplate = `
    <div style="width:100%;padding:4mm 16mm 2mm 16mm;display:flex;justify-content:space-between;align-items:center;border-bottom:0.5pt solid ${BRAND.border};font-family:'Inter',sans-serif;font-size:9pt;">
      <span style="font-size:11pt;font-weight:700;color:${BRAND.primary};">GEA</span>
      <span style="font-size:9pt;color:${BRAND.muted};">${headerTitle}</span>
    </div>`;
  const footerTemplate = `
    <div style="width:100%;padding:2mm 16mm 4mm 16mm;display:flex;justify-content:space-between;align-items:center;border-top:0.5pt solid ${BRAND.border};font-family:'Inter',sans-serif;font-size:7.5pt;color:${BRAND.muted};">
      <span>Confidential &amp; Proprietary</span>
      <span>Global Employment Advisors</span>
      <span>Page <span class="pageNumber"></span></span>
    </div>`;

  const contentHtml = `<!DOCTYPE html>
<html lang="${locale}">
<head><meta charset="UTF-8"><style>${BASE_CSS}</style></head>
<body>${contentPages}</body>
</html>`;
  const contentPdf = await htmlToPdfWithHeader(contentHtml, { headerTemplate, footerTemplate });

  // ── 3. Merge ──
  return mergePdfs([coverPdf, contentPdf]);
}
