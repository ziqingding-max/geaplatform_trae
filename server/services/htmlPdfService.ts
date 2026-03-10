/**
 * HTML → PDF Service
 *
 * Uses Puppeteer + system Chromium to render pixel-perfect PDFs from HTML templates.
 * This replaces the old PDFKit-based approach which had issues with:
 *  - Markdown tables not rendering (no table support in drawMarkdown)
 *  - Blank pages due to incorrect page-break logic
 *  - Bold/italic inline formatting not supported
 *  - No company intro section in quotations
 *  - Employer cost breakdown not shown
 */

import puppeteer from "puppeteer-core";
import { marked } from "marked";

const CHROMIUM_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--font-render-hinting=none",
  "--single-process",
  "--no-zygote",
];

/** Candidate paths tried in order; first existing file wins. */
const CHROMIUM_CANDIDATES = [
  process.env.CHROMIUM_PATH,          // override via env var (highest priority)
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/local/bin/chromium",
  "/snap/bin/chromium",
  "/opt/google/chrome/chrome",
];

import { existsSync } from "fs";
import { execSync } from "child_process";

function findChromiumPath(): string {
  // 1. Try known candidate paths
  for (const p of CHROMIUM_CANDIDATES) {
    if (p && existsSync(p)) return p;
  }
  // 2. Try `which` as last resort
  try {
    const found = execSync("which chromium chromium-browser google-chrome google-chrome-stable 2>/dev/null | head -1", { encoding: "utf8" }).trim();
    if (found) return found;
  } catch (_) { /* ignore */ }
  throw new Error(
    "Chromium not found. Install it (e.g. `apt-get install chromium-browser`) or set the CHROMIUM_PATH environment variable."
  );
}

// ─── Brand Design Tokens ─────────────────────────────────────────────────────
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

// ─── Shared CSS ───────────────────────────────────────────────────────────────
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

  /* ── Page Layout ── */
  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 18mm 16mm 22mm 16mm;
    position: relative;
    page-break-after: always;
    background: white;
  }
  .page:last-child { page-break-after: avoid; }

  /* ── Cover Page ── */
  .cover {
    background: ${BRAND.bg};
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0;
    overflow: hidden;
  }
  .cover-top-bar {
    background: ${BRAND.primary};
    height: 8mm;
    width: 100%;
  }
  .cover-body {
    flex: 1;
    padding: 18mm 16mm;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .cover-logo {
    font-size: 28pt;
    font-weight: 700;
    color: ${BRAND.primary};
    letter-spacing: -0.5px;
  }
  .cover-tagline {
    font-size: 9pt;
    color: ${BRAND.muted};
    margin-top: 2mm;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .cover-divider {
    width: 20mm;
    height: 1mm;
    background: ${BRAND.gold};
    margin: 12mm 0;
  }
  .cover-title {
    font-size: 28pt;
    font-weight: 700;
    color: ${BRAND.primary};
    line-height: 1.2;
    margin-bottom: 4mm;
  }
  .cover-subtitle {
    font-size: 14pt;
    color: ${BRAND.primaryLight};
    margin-bottom: 3mm;
  }
  .cover-date {
    font-size: 9pt;
    color: ${BRAND.muted};
  }
  .cover-bottom-bar {
    background: ${BRAND.primary};
    height: 12mm;
    width: 100%;
    display: flex;
    align-items: center;
    padding: 0 16mm;
    color: rgba(255,255,255,0.7);
    font-size: 8pt;
  }

  /* ── Page Header ── */
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 3mm;
    border-bottom: 0.5pt solid ${BRAND.border};
    margin-bottom: 6mm;
  }
  .page-header-logo {
    font-size: 11pt;
    font-weight: 700;
    color: ${BRAND.primary};
  }
  .page-header-title {
    font-size: 9pt;
    color: ${BRAND.muted};
  }

  /* ── Page Footer ── */
  .page-footer {
    position: absolute;
    bottom: 8mm;
    left: 16mm;
    right: 16mm;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 0.5pt solid ${BRAND.border};
    padding-top: 2mm;
    font-size: 7.5pt;
    color: ${BRAND.muted};
  }

  /* ── Typography ── */
  h1 { font-size: 18pt; font-weight: 700; color: ${BRAND.primary}; margin: 6mm 0 3mm; }
  h2 { font-size: 14pt; font-weight: 700; color: ${BRAND.primary}; margin: 5mm 0 2.5mm; border-bottom: 0.5pt solid ${BRAND.border}; padding-bottom: 1.5mm; }
  h3 { font-size: 11pt; font-weight: 600; color: ${BRAND.primaryLight}; margin: 4mm 0 2mm; }
  h4 { font-size: 10pt; font-weight: 600; color: ${BRAND.text}; margin: 3mm 0 1.5mm; }
  p  { margin: 0 0 2.5mm; }
  strong { font-weight: 600; }
  em { font-style: italic; }

  /* ── Lists ── */
  ul, ol { margin: 1.5mm 0 2.5mm 5mm; padding-left: 4mm; }
  li { margin-bottom: 1mm; }
  ul li::marker { color: ${BRAND.gold}; }

  /* ── Tables ── */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 3mm 0 4mm;
    font-size: 9pt;
    page-break-inside: avoid;
  }
  thead tr {
    background: ${BRAND.tableHeader};
  }
  thead th {
    padding: 2.5mm 3mm;
    text-align: left;
    font-weight: 600;
    font-size: 8.5pt;
    color: ${BRAND.primary};
    border: 0.5pt solid ${BRAND.border};
    white-space: nowrap;
  }
  tbody tr:nth-child(even) {
    background: ${BRAND.tableStripe};
  }
  tbody td {
    padding: 2mm 3mm;
    border: 0.5pt solid ${BRAND.border};
    vertical-align: top;
    font-size: 9pt;
  }

  /* ── Section Card ── */
  .section-card {
    background: ${BRAND.bg};
    border: 0.5pt solid ${BRAND.border};
    border-radius: 2mm;
    padding: 4mm 5mm;
    margin-bottom: 4mm;
    page-break-inside: avoid;
  }
  .section-card-title {
    font-size: 10pt;
    font-weight: 600;
    color: ${BRAND.primary};
    margin-bottom: 2mm;
    display: flex;
    align-items: center;
    gap: 2mm;
  }

  /* ── Info Grid ── */
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2mm 6mm;
    margin-bottom: 4mm;
  }
  .info-item label {
    font-size: 7.5pt;
    color: ${BRAND.muted};
    text-transform: uppercase;
    letter-spacing: 0.3px;
    display: block;
    margin-bottom: 0.5mm;
  }
  .info-item span {
    font-size: 9.5pt;
    font-weight: 500;
    color: ${BRAND.text};
  }

  /* ── Quotation Table ── */
  .qt-table {
    width: 100%;
    border-collapse: collapse;
    margin: 3mm 0;
    font-size: 9pt;
  }
  .qt-table thead tr {
    background: ${BRAND.primary};
    color: white;
  }
  .qt-table thead th {
    padding: 2.5mm 3mm;
    text-align: left;
    font-weight: 600;
    font-size: 8pt;
    border: none;
    white-space: nowrap;
  }
  .qt-table thead th.right { text-align: right; }
  .qt-table tbody tr:nth-child(even) { background: ${BRAND.tableStripe}; }
  .qt-table tbody td {
    padding: 2mm 3mm;
    border-bottom: 0.5pt solid ${BRAND.border};
    vertical-align: top;
  }
  .qt-table tbody td.right { text-align: right; font-variant-numeric: tabular-nums; }
  .qt-table tbody td.bold { font-weight: 600; }
  .qt-table tfoot tr { background: ${BRAND.tableHeader}; }
  .qt-table tfoot td {
    padding: 2.5mm 3mm;
    font-weight: 700;
    border-top: 1pt solid ${BRAND.primary};
  }
  .qt-table tfoot td.right { text-align: right; font-size: 11pt; color: ${BRAND.primary}; }

  /* ── Cost Breakdown ── */
  .cost-breakdown {
    margin: 2mm 0 3mm 0;
    padding: 2mm 3mm;
    background: white;
    border: 0.5pt solid ${BRAND.border};
    border-radius: 1.5mm;
    font-size: 8.5pt;
  }
  .cost-breakdown-title {
    font-size: 8pt;
    font-weight: 600;
    color: ${BRAND.muted};
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin-bottom: 1.5mm;
  }
  .cost-breakdown table {
    margin: 0;
    font-size: 8pt;
  }
  .cost-breakdown table thead th {
    background: ${BRAND.tableHeader};
    font-size: 7.5pt;
    padding: 1.5mm 2mm;
  }
  .cost-breakdown table tbody td {
    padding: 1.5mm 2mm;
    font-size: 8pt;
  }
  .cost-breakdown-total {
    margin-top: 1.5mm;
    text-align: right;
    font-weight: 600;
    font-size: 8.5pt;
    color: ${BRAND.primary};
  }

  /* ── Total Box ── */
  .total-box {
    display: flex;
    justify-content: flex-end;
    margin-top: 4mm;
  }
  .total-inner {
    background: ${BRAND.primary};
    color: white;
    padding: 3mm 6mm;
    border-radius: 2mm;
    text-align: right;
  }
  .total-label { font-size: 8pt; opacity: 0.8; }
  .total-amount { font-size: 16pt; font-weight: 700; }

  /* ── Notes / Terms ── */
  .notes-box {
    background: ${BRAND.bg};
    border-left: 2pt solid ${BRAND.gold};
    padding: 3mm 4mm;
    margin: 4mm 0;
    font-size: 9pt;
    color: ${BRAND.muted};
  }

  /* ── Chapter heading ── */
  .chapter-heading {
    display: flex;
    align-items: center;
    gap: 3mm;
    margin-bottom: 4mm;
    padding-bottom: 2mm;
    border-bottom: 1pt solid ${BRAND.primary};
  }
  .chapter-number {
    background: ${BRAND.primary};
    color: white;
    width: 7mm;
    height: 7mm;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9pt;
    font-weight: 700;
    flex-shrink: 0;
  }
  .chapter-title {
    font-size: 14pt;
    font-weight: 700;
    color: ${BRAND.primary};
  }

  /* ── TOC ── */
  .toc-item {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 1.5mm 0;
    border-bottom: 0.3pt dotted ${BRAND.border};
    font-size: 10pt;
  }
  .toc-item:last-child { border-bottom: none; }
  .toc-num {
    font-weight: 600;
    color: ${BRAND.primary};
    min-width: 8mm;
  }
  .toc-title { flex: 1; padding: 0 3mm; }
  .toc-dots { flex: 1; border-bottom: 0.3pt dotted ${BRAND.muted}; margin: 0 2mm 1.5mm; }

  /* ── Print ── */
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
`;

// ─── Helper: render markdown to HTML ─────────────────────────────────────────
function mdToHtml(content: string): string {
  if (!content) return "";
  // Configure marked for GFM (tables, etc.)
  marked.setOptions({ gfm: true, breaks: true } as any);
  return marked.parse(content) as string;
}

// ─── Helper: format money ─────────────────────────────────────────────────────
function fmt(n: number, currency = ""): string {
  const s = n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency ? `${currency} ${s}` : s;
}

// ─── Helper: launch browser ───────────────────────────────────────────────────
async function launchBrowser() {
  const executablePath = findChromiumPath();
  return puppeteer.launch({
    executablePath,
    args: CHROMIUM_ARGS,
    headless: true,
  });
}

// ─── Helper: render HTML to PDF buffer ───────────────────────────────────────
async function htmlToPdf(html: string): Promise<Buffer> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

// ─── Branding Info (from Billing Entity) ────────────────────────────────────
export interface BrandingInfo {
  /** Short display name, e.g. "GEA" or entityName */
  shortName: string;
  /** Full legal / trading name, e.g. "Global Employment Advisors" */
  fullName: string;
  /** S3 URL for logo image – if present, rendered as <img>; otherwise shortName text is used */
  logoUrl?: string | null;
  /** Contact email shown in T&C footer */
  contactEmail?: string | null;
  /** One-line address for "Issued By" section */
  address?: string | null;
  /** Legal name override */
  legalName?: string | null;
}

/** Default branding used when no billing entity is configured */
const DEFAULT_BRANDING: BrandingInfo = {
  shortName: "GEA",
  fullName: "Global Employment Advisors",
  logoUrl: null,
  contactEmail: "sales@geahr.com",
};

// ─── Page wrapper helpers ─────────────────────────────────────────────────────
function logoHtml(b: BrandingInfo, size: "cover" | "header"): string {
  if (b.logoUrl) {
    const h = size === "cover" ? "18mm" : "7mm";
    return `<img src="${b.logoUrl}" alt="${b.shortName}" style="height:${h};object-fit:contain;display:block;" />`;
  }
  if (size === "cover") {
    return `<div class="cover-logo">${b.shortName}</div>`;
  }
  return `<span class="page-header-logo">${b.shortName}</span>`;
}

function coverPage(title: string, subtitle: string, date: string, branding: BrandingInfo = DEFAULT_BRANDING): string {
  return `
  <div class="page cover">
    <div class="cover-top-bar"></div>
    <div class="cover-body">
      <div>
        ${logoHtml(branding, "cover")}
        ${!branding.logoUrl ? `<div class="cover-tagline">${branding.fullName}</div>` : ""}
      </div>
      <div class="cover-divider"></div>
      <div class="cover-title">${title}</div>
      <div class="cover-subtitle">${subtitle}</div>
      <div class="cover-date">${date}</div>
    </div>
    <div class="cover-bottom-bar">Confidential &amp; Proprietary — ${branding.fullName}</div>
  </div>`;
}

function contentPage(headerTitle: string, pageNum: number, totalPages: number, body: string, branding: BrandingInfo = DEFAULT_BRANDING): string {
  return `
  <div class="page">
    <div class="page-header">
      ${logoHtml(branding, "header")}
      <span class="page-header-title">${headerTitle}</span>
    </div>
    ${body}
    <div class="page-footer">
      <span>Confidential &amp; Proprietary</span>
      <span>${branding.fullName}</span>
      <span>Page ${pageNum}</span>
    </div>
  </div>`;
}

// ─── Country Guide PDF ────────────────────────────────────────────────────────
export interface CountryGuideChapter {
  id: number;
  titleEn: string;
  titleZh?: string;
  contentEn: string;
  contentZh?: string;
  chapterKey: string;
  sortOrder: number;
}

export interface CountryInfo {
  countryCode: string;
  countryName: string;
}

export async function generateCountryGuidePdf(
  country: CountryInfo,
  chapters: CountryGuideChapter[],
  locale: "en" | "zh" = "en",
  branding: BrandingInfo = DEFAULT_BRANDING
): Promise<Buffer> {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const headerTitle = `Country Guide: ${country.countryName}`;

  let pages = "";

  // 1. Cover
  pages += coverPage("Country Guide", country.countryName, date, branding);

  // 2. Table of Contents
  let tocRows = chapters.map((ch, i) => `
    <div class="toc-item">
      <span class="toc-num">${i + 1}.</span>
      <span class="toc-title">${locale === "zh" && ch.titleZh ? ch.titleZh : ch.titleEn}</span>
    </div>`).join("");

  pages += contentPage(headerTitle, 2, chapters.length + 2, `
    <h2>Table of Contents</h2>
    <div style="margin-top: 4mm;">${tocRows}</div>
  `, branding);

  // 3. Chapter pages
  chapters.forEach((ch, i) => {
    const title = locale === "zh" && ch.titleZh ? ch.titleZh : ch.titleEn;
    const content = locale === "zh" && ch.contentZh ? ch.contentZh : ch.contentEn;
    const htmlContent = mdToHtml(content);

    pages += contentPage(headerTitle, i + 3, chapters.length + 2, `
      <div class="chapter-heading">
        <div class="chapter-number">${i + 1}</div>
        <div class="chapter-title">${title}</div>
      </div>
      <div class="chapter-content">${htmlContent}</div>
    `, branding);
  });

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${headerTitle}</title>
  <style>${BASE_CSS}</style>
</head>
<body>${pages}</body>
</html>`;

  return htmlToPdf(html);
}

// ─── Quotation PDF ────────────────────────────────────────────────────────────
export interface QuotationItem {
  countryCode: string;
  serviceType: string;
  headcount: number;
  salary: number;
  currency: string;
  employerCost: number;
  serviceFee: number;
  oneTimeFee?: number;
  usdEmploymentCost: number;
  subtotal: number;
  exchangeRate: number;
  calcDetails?: Array<{
    itemNameEn: string;
    employerContribution: string;
    employerRate: string;
    category: string;
  }>;
}

export interface QuotationData {
  quotationNumber: string;
  customerName: string;
  customerAddress?: string;
  companyIntro?: string;
  items: QuotationItem[];
  totalMonthly: string;
  currency: string;
  validUntil?: string;
  notes?: string;
  branding?: BrandingInfo;
  billingEntity?: {
    entityName: string;
    legalName: string;
    address?: string;
    contactEmail?: string;
    contactPhone?: string;
    country: string;
  };
}

export async function generateQuotationPdf(data: QuotationData): Promise<Buffer> {
  const branding: BrandingInfo = data.branding ?? DEFAULT_BRANDING;
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const headerTitle = `Quotation #${data.quotationNumber}`;
  const validUntil = data.validUntil
    ? new Date(data.validUntil).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "N/A";

  let pages = "";

  // 1. Cover
  pages += coverPage("Quotation Proposal", `Ref: ${data.quotationNumber}`, date, branding);

  // 2. Company Introduction — uses billing entity name dynamically
  const companyIntroHtml = data.companyIntro
    ? `<p>${data.companyIntro}</p>`
    : `
    <p>${branding.fullName} is a leading Employer of Record (EOR) and workforce solutions provider, enabling businesses to hire talent across 50+ countries without the need to establish local legal entities. Our platform combines compliance expertise, payroll management, and HR technology to deliver a seamless employment experience for both clients and their employees.</p>
    <p>We handle all aspects of local employment — including employment contracts, payroll processing, statutory benefits, tax compliance, and HR administration — so you can focus on growing your business globally.</p>
  `;

  pages += contentPage(headerTitle, 2, 0, `
    <h2>About ${branding.fullName}</h2>
    <div class="section-card">
      ${companyIntroHtml}
    </div>

    <h2>Prepared For</h2>
    <div class="info-grid">
      <div class="info-item">
        <label>Company</label>
        <span>${data.customerName}</span>
      </div>
      ${data.customerAddress ? `<div class="info-item"><label>Address</label><span>${data.customerAddress}</span></div>` : ""}
      <div class="info-item">
        <label>Quotation Reference</label>
        <span>${data.quotationNumber}</span>
      </div>
      <div class="info-item">
        <label>Date Issued</label>
        <span>${date}</span>
      </div>
      <div class="info-item">
        <label>Valid Until</label>
        <span>${validUntil}</span>
      </div>
      <div class="info-item">
        <label>Currency</label>
        <span>${data.currency}</span>
      </div>
    </div>

    ${data.billingEntity ? `
    <h2>Issued By</h2>
    <div class="info-grid">
      <div class="info-item">
        <label>Entity</label>
        <span>${data.billingEntity.entityName}</span>
      </div>
      <div class="info-item">
        <label>Legal Name</label>
        <span>${data.billingEntity.legalName}</span>
      </div>
      ${data.billingEntity.address ? `<div class="info-item"><label>Address</label><span>${data.billingEntity.address}</span></div>` : ""}
      ${data.billingEntity.contactEmail ? `<div class="info-item"><label>Email</label><span>${data.billingEntity.contactEmail}</span></div>` : ""}
    </div>` : ""}
  `, branding);

  // 3. Pricing Summary Page
  const tableRows = data.items.map((item, idx) => {
    const serviceLabel = item.serviceType === "eor" ? "EOR"
      : item.serviceType === "visa_eor" ? "Visa EOR"
      : item.serviceType === "aor" ? "AOR"
      : item.serviceType.toUpperCase();

    const localCurrency = item.currency !== "USD"
      ? `<div style="font-size:7.5pt;color:${BRAND.muted};">${item.currency} ${fmt(item.salary)} × ${item.headcount}</div>`
      : "";

    const exchangeNote = item.currency !== "USD" && item.exchangeRate !== 1
      ? `<div style="font-size:7.5pt;color:${BRAND.muted};">Rate: 1 USD = ${item.exchangeRate.toFixed(4)} ${item.currency}</div>`
      : "";

    // Employer cost breakdown sub-table
    let breakdownHtml = "";
    if (item.calcDetails && item.calcDetails.length > 0) {
      const breakdownRows = item.calcDetails.map(d => `
        <tr>
          <td>${d.itemNameEn}</td>
          <td style="text-align:right">${d.employerRate}</td>
          <td style="text-align:right">${item.currency} ${fmt(parseFloat(d.employerContribution))}</td>
        </tr>`).join("");

      breakdownHtml = `
        <div class="cost-breakdown">
          <div class="cost-breakdown-title">Employer Contribution Breakdown</div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align:right">Rate</th>
                <th style="text-align:right">Amount (${item.currency})</th>
              </tr>
            </thead>
            <tbody>${breakdownRows}</tbody>
          </table>
          <div class="cost-breakdown-total">Total ER Cost: ${item.currency} ${fmt(item.employerCost)}</div>
        </div>`;
    }

    return `
      <tr>
        <td>${item.countryCode}</td>
        <td>${serviceLabel}</td>
        <td class="right">${item.headcount}</td>
        <td class="right">
          USD ${fmt(item.salary / (item.exchangeRate || 1))}
          ${localCurrency}
          ${exchangeNote}
        </td>
        <td class="right">
          USD ${fmt(item.employerCost / (item.exchangeRate || 1))}
          ${item.calcDetails && item.calcDetails.length > 0 ? `<div style="font-size:7.5pt;color:${BRAND.primary};cursor:pointer;">▼ see breakdown below</div>` : ""}
        </td>
        <td class="right">USD ${fmt(item.serviceFee)}${item.oneTimeFee ? `<div style="font-size:7.5pt;color:${BRAND.muted};">+ USD ${fmt(item.oneTimeFee)} (one-time)</div>` : ""}</td>
        <td class="right bold">USD ${fmt(item.subtotal)}</td>
      </tr>
      ${breakdownHtml ? `<tr><td colspan="7" style="padding:0 3mm 3mm;">${breakdownHtml}</td></tr>` : ""}`;
  }).join("");

  pages += contentPage(headerTitle, 3, 0, `
    <h2>Pricing Summary</h2>
    <p style="color:${BRAND.muted};font-size:9pt;margin-bottom:3mm;">All amounts in USD unless otherwise noted. Monthly recurring costs.</p>

    <table class="qt-table">
      <thead>
        <tr>
          <th>Country</th>
          <th>Service</th>
          <th class="right">Headcount</th>
          <th class="right">Gross Salary</th>
          <th class="right">Employer Cost</th>
          <th class="right">Service Fee</th>
          <th class="right">Monthly Subtotal</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
      <tfoot>
        <tr>
          <td colspan="6" style="font-weight:700;font-size:10pt;">Total Monthly (${data.currency})</td>
          <td class="right">USD ${fmt(parseFloat(data.totalMonthly))}</td>
        </tr>
      </tfoot>
    </table>

    <div class="total-box">
      <div class="total-inner">
        <div class="total-label">TOTAL MONTHLY INVESTMENT</div>
        <div class="total-amount">USD ${fmt(parseFloat(data.totalMonthly))}</div>
      </div>
    </div>

    ${data.notes ? `
    <div class="notes-box">
      <strong>Notes:</strong><br>${data.notes}
    </div>` : ""}
  `, branding);

  // 4. Terms & Conditions page
  const contactEmail = branding.contactEmail ?? data.billingEntity?.contactEmail ?? "sales@geahr.com";
  pages += contentPage(headerTitle, 4, 0, `
    <h2>Terms &amp; Conditions</h2>
    <div class="section-card">
      <h3>Validity</h3>
      <p>This quotation is valid until <strong>${validUntil}</strong>. Pricing is subject to change after this date.</p>

      <h3>Service Scope</h3>
      <p>The quoted service fee covers: employment contract administration, monthly payroll processing, statutory benefit contributions, HR compliance management, and dedicated account support.</p>

      <h3>Employer of Record (EOR)</h3>
      <p>Under the EOR model, ${branding.shortName} acts as the legal employer of the worker(s) in the respective country. The client retains full day-to-day management of the worker's tasks and responsibilities.</p>

      <h3>Agent of Record (AOR)</h3>
      <p>Under the AOR model, ${branding.shortName} engages contractors on behalf of the client. The contractor rate shown is the gross contractor fee; no statutory employer contributions apply.</p>

      <h3>Exchange Rates</h3>
      <p>Exchange rates are indicative and based on rates at the time of quotation. Final invoiced amounts may vary based on prevailing rates at the time of payroll processing.</p>

      <h3>Confidentiality</h3>
      <p>This document is confidential and intended solely for the named recipient. It may not be shared with third parties without prior written consent from ${branding.shortName}.</p>
    </div>

    <div class="notes-box" style="margin-top:6mm;">
      For questions about this quotation, please contact your ${branding.shortName} account manager or email <strong>${contactEmail}</strong>.
    </div>
  `, branding);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${headerTitle}</title>
  <style>${BASE_CSS}</style>
</head>
<body>${pages}</body>
</html>`;

  return htmlToPdf(html);
}
