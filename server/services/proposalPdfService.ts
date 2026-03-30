/**
 * Proposal PDF Service
 *
 * Generates a combined "Headhunter Toolkit Proposal" PDF by aggregating
 * data from multiple toolkit modules (benefits, compliance, salary, start-date, templates, cost_simulator).
 *
 * Reuses the existing htmlPdfService infrastructure (Puppeteer + branded templates).
 */
import puppeteer from "puppeteer-core";
import { existsSync } from "fs";
import { GEA_LOGO_HORIZONTAL_GREEN_BASE64 } from "./proposalLogoData";
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
  metricValueEn: string | null;
  metricValueZh?: string | null;
  riskLevel?: string | null;
  category?: string | null;
  notesEn?: string | null;
  notesZh?: string | null;
}

export interface ProposalSalaryItem {
  jobTitle: string;
  seniorityLevel?: string | null;
  salaryP25?: string | null;
  salaryP50?: string | null;
  salaryP75?: string | null;
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
  documentType: string;
  fileName?: string | null;
}

export interface ProposalCostSimulatorItem {
  mode: string; // "forward" | "reverse" | "gross_to_net" | "net_to_gross"
  calcMode?: string; // "gross_to_net" | "net_to_gross"
  currency: string;
  // Frontend sends `salary`, backend expected `grossSalary` — support both
  grossSalary?: number;
  salary?: number;
  netPay: number | string;
  // Frontend sends `totalEmployee`, backend expected `employeeSocialInsurance` — support both
  employeeSocialInsurance?: number | string;
  totalEmployee?: number | string;
  incomeTax: number | string;
  // Frontend sends `totalEmployer`, backend expected `employerContributions` — support both
  employerContributions?: number | string;
  totalEmployer?: number | string;
  // Frontend sends `totalCost`, backend expected `totalEmploymentCost` — support both
  totalEmploymentCost?: number | string;
  totalCost?: number | string;
  effectiveTaxRate?: number;
  // Frontend sends `items` (ContributionItem[]), backend expected `employerBreakdown`/`employeeBreakdown`
  employerBreakdown?: Array<{ name: string; amount: number }>;
  employeeBreakdown?: Array<{ name: string; amount: number }>;
  items?: Array<{
    itemNameEn: string;
    itemNameZh?: string;
    employerContribution: string | number;
    employeeContribution: string | number;
  }>;
  taxDetails?: {
    effectiveTaxRate: string;
    annualGross?: number;
    standardDeduction?: number;
    annualEmployeeSS?: number;
    annualTaxableIncome?: number;
    annualTax?: number;
    brackets?: Array<{ min: number; max: number; rate: string; taxableAmount: number; tax: number }>;
  };
  regionCode?: string;
}

export interface ProposalSection {
  type: "benefits" | "compliance" | "salary" | "start_date" | "templates" | "cost_simulator";
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

  .cover-body {
    flex: 1; display: flex; flex-direction: column; justify-content: center;
    padding: 30mm 24mm 30mm 24mm; margin-left: 8mm;
  }
  .cover-logo { margin-bottom: 2mm; }
  .cover-logo img { height: 18mm; max-width: 70mm; object-fit: contain; display: block; }
  .cover-logo-fallback { font-size: 28pt; font-weight: 700; color: ${BRAND.primary}; letter-spacing: 2pt; }
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
  .cover-disclaimer { position: absolute; bottom: 16mm; left: 12mm; right: 12mm; padding: 3mm 4mm; background: ${BRAND.bg}; border-left: 2pt solid ${BRAND.gold}; font-size: 7pt; color: ${BRAND.muted}; line-height: 1.5; }
  .cost-summary { background: ${BRAND.bg}; border: 1pt solid ${BRAND.border}; border-radius: 2mm; padding: 4mm; margin: 4mm 0; }
  .cost-summary-row { display: flex; justify-content: space-between; padding: 1.5mm 2mm; }
  .cost-summary-row.total { border-top: 1pt solid ${BRAND.primary}; margin-top: 2mm; padding-top: 3mm; font-weight: 700; color: ${BRAND.primary}; font-size: 11pt; }
  .cost-summary-label { color: ${BRAND.text}; }
  .cost-summary-value { font-weight: 600; }
  .about-section { margin-bottom: 6mm; }
  .about-section p { font-size: 9.5pt; line-height: 1.7; margin-bottom: 3mm; color: ${BRAND.text}; }
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

// ─── Company Introduction Page ───────────────────────────────────────────────

function renderCompanyIntroPage(locale: string): string {
  const isZh = locale === "zh";
  return `<div class="page">
    <h2>${isZh ? "关于 CGL Group" : "About CGL Group"}</h2>
    <div class="about-section">
      <p>${isZh
        ? "CGL Group 的核心业务是国际猎头服务（CGL），专注于服务中国经济增长中的创新型初创企业和正在转型的传统企业。我们基于对行业人才市场的深刻理解，提供战略性人才咨询、人才地图绘制，帮助企业招募核心高管团队。同时，我们还设计具有竞争力的薪酬方案，并提供CEO及高管领导力辅导与入职支持服务。"
        : "CGL Group's core business is international executive search (CGL), with a focus on serving innovative startups and traditional enterprises undergoing transformation in China's growing economy. We provide strategic talent advisory, talent mapping, and help enterprises recruit core executive teams based on our deep understanding of industry talent markets. We also design competitive compensation packages and deliver CEO and executive leadership coaching and onboarding support."
      }</p>
    </div>

    <h2>${isZh ? "关于 GEA (Global Employment Advisors)" : "About GEA (Global Employment Advisors)"}</h2>
    <div class="about-section">
      <p>${isZh
        ? "作为 CGL 的海外业务子品牌，GEA 帮助中国企业在新兴市场中实现全生命周期的管理——从市场准入到落地实施，从业务发展到组织重构——提供全面的、端到端的人力资源服务与解决方案。"
        : "As CGL's overseas business sub-brand, GEA helps Chinese enterprises navigate emerging markets across the full lifecycle — from Access to Implementation, from Development to Reorganization — providing comprehensive, end-to-end human resources services and solutions."
      }</p>
      <p>${isZh
        ? "我们不仅针对不同行业——如新能源、智能制造、食品饮料、医疗健康、消费电子和具身智能——设计差异化解决方案，还为同一行业中具有不同海外扩张战略重点的客户提供定制化服务。"
        : "We design differentiated solutions tailored not only to different industries — such as new energy, smart manufacturing, food &amp; beverage, healthcare, consumer electronics, and embodied AI — but also to clients within the same industry who have distinct strategic priorities for their overseas expansion."
      }</p>
      <p>${isZh
        ? "从针对单一目的地的轻量级市场进入，到设有统一结算中心的区域枢纽模式，我们提供最适合中国企业出海灵活多元需求的定制化解决方案。"
        : "From lightweight market entry targeting a single destination to regional hub models with unified settlement centers, we deliver customized solutions that best fit the flexible and diversified needs of Chinese enterprises going global."
      }</p>
    </div>
  </div><div class="page">
    <h2>${isZh ? "我们的核心服务" : "Our Core Services"}</h2>
    <table>
      <tr><th>${isZh ? "服务" : "Service"}</th><th>${isZh ? "说明" : "Description"}</th></tr>
      <tr><td><strong>EOR</strong><br/><span style="font-size:8pt;color:${BRAND.muted};">${isZh ? "名义雇主" : "Employer of Record"}</span></td><td>${isZh
        ? "无需在海外设立法律实体，由 GEA 作为名义雇主，代表客户在目标国家合规雇佣员工。我们全面承担当地劳动法合规义务，包括劳动合同签署、薪酬发放、社保与税务申报、员工福利管理以及劳动关系的全生命周期管理，帮助企业快速、低风险地进入海外市场。"
        : "GEA acts as the legal employer on behalf of the client in the target country, eliminating the need to establish a local entity. We assume full local labor law compliance obligations, including employment contract execution, payroll processing, social insurance and tax filing, employee benefits administration, and end-to-end employment lifecycle management — enabling rapid, low-risk market entry."
      }</td></tr>
      <tr><td><strong>AOR</strong><br/><span style="font-size:8pt;color:${BRAND.muted};">${isZh ? "承包商代理" : "Agent of Record"}</span></td><td>${isZh
        ? "为企业合规管理海外独立承包商。GEA 负责承包商合同的起草与签署、合规性审查（防止劳动关系误分类风险）、付款结算与发票管理，以及当地税务合规申报，确保客户与承包商之间的合作关系符合目标国家的法律法规要求。"
        : "Compliantly manage overseas independent contractors on behalf of the client. GEA handles contractor agreement drafting and execution, compliance review (mitigating misclassification risks), payment settlement and invoice management, and local tax compliance filing — ensuring the engagement between client and contractor fully meets the legal and regulatory requirements of the target country."
      }</td></tr>
      <tr><td><strong>MHS</strong><br/><span style="font-size:8pt;color:${BRAND.muted};">${isZh ? "人力资源托管" : "Managed HR Services"}</span></td><td>${isZh
        ? "面向已在海外设立法律实体的企业，GEA 作为客户的外包人力资源部门，提供全套人力资源服务。服务范围涵盖薪酬计算与发放、劳动合同起草与管理、员工入职与离职全生命周期流程管理、社保与公积金缴纳、个税申报，以及日常人事行政支持，让企业专注于核心业务发展。"
        : "For companies that have already established a legal entity overseas, GEA serves as the outsourced HR department, delivering comprehensive human resources services. Our scope covers payroll calculation and disbursement, employment contract drafting and management, full employee lifecycle administration (onboarding through offboarding), social insurance and provident fund contributions, individual income tax filing, and day-to-day HR administrative support — allowing businesses to focus on core operations."
      }</td></tr>
      <tr><td><strong>${isZh ? "猎头招聘" : "Recruitment"}</strong><br/><span style="font-size:8pt;color:${BRAND.muted};">${isZh ? "高端人才搜寻" : "Executive Search"}</span></td><td>${isZh
        ? "依托 CGL Group 深厚的国际猎头经验和本地人才市场洞察，为出海企业提供高端人才搜寻与猎聘服务。我们覆盖从人才地图绘制、候选人筛选与评估、薪酬方案设计到入职辅导的全流程，帮助企业在目标市场快速组建核心团队。"
        : "Leveraging CGL Group's deep international executive search expertise and local talent market insights, we provide premium talent search and headhunting services for enterprises expanding overseas. Our end-to-end coverage spans talent mapping, candidate screening and assessment, compensation package design, and onboarding coaching — helping businesses rapidly build core teams in target markets."
      }</td></tr>
    </table>
  </div>`;
}

// ─── Section Renderers ────────────────────────────────────────────────────────

function renderBenefitsSection(country: string, items: ProposalBenefitItem[], locale: string): string {
  const isZh = locale === "zh";
  const statutory = items.filter((i: any) => i.benefitType === "statutory" || i.category === "social_security" || i.category === "pension" || i.category === "paid_leave" || i.category === "parental");
  const customary = items.filter((i: any) => i.benefitType === "customary" || (i.benefitType !== "statutory" && !statutory.includes(i)));

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
      <td>${isZh ? (c.metricValueZh || c.metricValueEn || "—") : (c.metricValueEn || "—")}</td>
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
      <td>${s.seniorityLevel || "—"}</td>
      <td>${s.salaryP25 != null ? Number(s.salaryP25).toLocaleString() : "—"}</td>
      <td>${s.salaryP50 != null ? Number(s.salaryP50).toLocaleString() : "—"}</td>
      <td>${s.salaryP75 != null ? Number(s.salaryP75).toLocaleString() : "—"}</td>
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
    const ext = t.fileName ? t.fileName.split('.').pop()?.toUpperCase() || 'PDF' : 'PDF';
    html += `<tr><td>${isZh ? (t.titleZh || t.titleEn) : t.titleEn}</td><td>${t.documentType.replace(/_/g, ' ')}</td><td>${ext}</td></tr>`;
  }
  html += `</table>`;
  return html;
}

function renderCostSimulatorSection(country: string, items: ProposalCostSimulatorItem[], locale: string): string {
  const isZh = locale === "zh";
  const raw = items[0];
  if (!raw) return "";

  // ── Normalize fields: frontend sends different names than what the old renderer expected ──
  const toNum = (v: any): number => {
    if (v == null) return 0;
    const n = typeof v === "string" ? parseFloat(v) : v;
    return isNaN(n) ? 0 : n;
  };

  const grossSalary = toNum(raw.grossSalary ?? raw.salary);
  const netPay = toNum(raw.netPay);
  const employeeSS = toNum(raw.employeeSocialInsurance ?? raw.totalEmployee);
  const incomeTax = toNum(raw.incomeTax);
  const employerContrib = toNum(raw.employerContributions ?? raw.totalEmployer);
  const totalCost = toNum(raw.totalEmploymentCost ?? raw.totalCost);
  const currency = raw.currency || "USD";

  // Determine mode label
  const calcMode = raw.calcMode || raw.mode || "gross_to_net";
  const isGrossToNet = calcMode === "gross_to_net" || calcMode === "forward";
  const modeLabel = isGrossToNet
    ? (isZh ? "正算：税前 → 税后" : "Gross to Net")
    : (isZh ? "倒算：税后 → 税前" : "Net to Gross");

  // Effective tax rate
  let effectiveTaxRateStr = "";
  if (raw.effectiveTaxRate != null) {
    effectiveTaxRateStr = toNum(raw.effectiveTaxRate).toFixed(1) + "%";
  } else if (raw.taxDetails?.effectiveTaxRate) {
    effectiveTaxRateStr = raw.taxDetails.effectiveTaxRate;
  }

  const fmt = (n: number) => currency + " " + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  let html = `<h2>${isZh ? `${country} — 雇佣成本模拟` : `${country} — Employment Cost Simulation`}</h2>`;
  html += `<p class="section-intro">${isZh ? `计算模式：${modeLabel}` : `Calculation Mode: ${modeLabel}`}</p>`;

  // Summary card
  html += `<div class="cost-summary">`;
  html += `<div class="cost-summary-row"><span class="cost-summary-label">${isZh ? "月度总薪资 (Gross)" : "Monthly Gross Salary"}</span><span class="cost-summary-value">${fmt(grossSalary)}</span></div>`;
  html += `<div class="cost-summary-row"><span class="cost-summary-label">${isZh ? "个人社保缴费" : "Employee Social Insurance"}</span><span class="cost-summary-value">- ${fmt(employeeSS)}</span></div>`;
  html += `<div class="cost-summary-row"><span class="cost-summary-label">${isZh ? "个人所得税（估算）" : "Income Tax (Est.)"}</span><span class="cost-summary-value">- ${fmt(incomeTax)}</span></div>`;
  html += `<div class="cost-summary-row" style="border-top:0.5pt solid ${BRAND.border};padding-top:2mm;margin-top:1mm;"><span class="cost-summary-label"><strong>${isZh ? "实发工资 (Net Pay)" : "Net Pay"}</strong></span><span class="cost-summary-value"><strong>${fmt(netPay)}</strong></span></div>`;
  html += `<div class="cost-summary-row"><span class="cost-summary-label">${isZh ? "雇主社保缴费" : "Employer Contributions"}</span><span class="cost-summary-value">+ ${fmt(employerContrib)}</span></div>`;
  html += `<div class="cost-summary-row total"><span class="cost-summary-label">${isZh ? "雇主总成本" : "Total Employment Cost"}</span><span class="cost-summary-value">${fmt(totalCost)}</span></div>`;
  if (effectiveTaxRateStr) {
    html += `<div class="cost-summary-row"><span class="cost-summary-label">${isZh ? "有效税率" : "Effective Tax Rate"}</span><span class="cost-summary-value">${effectiveTaxRateStr}</span></div>`;
  }
  html += `</div>`;

  // Build breakdown tables from either new format (employerBreakdown) or frontend format (items)
  let employerRows: Array<{ name: string; amount: number }> = [];
  let employeeRows: Array<{ name: string; amount: number }> = [];

  if (raw.employerBreakdown && raw.employerBreakdown.length > 0) {
    employerRows = raw.employerBreakdown;
  } else if (raw.items && raw.items.length > 0) {
    // Convert ContributionItem[] to breakdown format
    for (const ci of raw.items) {
      const empAmt = toNum(ci.employerContribution);
      if (empAmt > 0) {
        employerRows.push({ name: (isZh && ci.itemNameZh) ? ci.itemNameZh : ci.itemNameEn, amount: empAmt });
      }
    }
  }

  if (raw.employeeBreakdown && raw.employeeBreakdown.length > 0) {
    employeeRows = raw.employeeBreakdown;
  } else if (raw.items && raw.items.length > 0) {
    for (const ci of raw.items) {
      const eeAmt = toNum(ci.employeeContribution);
      if (eeAmt > 0) {
        employeeRows.push({ name: (isZh && ci.itemNameZh) ? ci.itemNameZh : ci.itemNameEn, amount: eeAmt });
      }
    }
  }

  // Employer breakdown table
  if (employerRows.length > 0) {
    html += `<h3>${isZh ? "雇主缴费明细" : "Employer Contribution Breakdown"}</h3>`;
    html += `<table><tr><th>${isZh ? "项目" : "Item"}</th><th style="text-align:right;">${isZh ? "金额" : "Amount"}</th></tr>`;
    for (const b of employerRows) {
      html += `<tr><td>${b.name}</td><td style="text-align:right;">${fmt(b.amount)}</td></tr>`;
    }
    html += `<tr style="background:${BRAND.tableHeader};font-weight:600;"><td>${isZh ? "合计" : "Total"}</td><td style="text-align:right;">${fmt(employerContrib)}</td></tr>`;
    html += `</table>`;
  }

  // Employee deduction breakdown table
  if (employeeRows.length > 0) {
    html += `<h3>${isZh ? "个人扣除明细" : "Employee Deduction Breakdown"}</h3>`;
    html += `<table><tr><th>${isZh ? "项目" : "Item"}</th><th style="text-align:right;">${isZh ? "金额" : "Amount"}</th></tr>`;
    for (const b of employeeRows) {
      html += `<tr><td>${b.name}</td><td style="text-align:right;">${fmt(b.amount)}</td></tr>`;
    }
    html += `<tr style="background:${BRAND.tableHeader};font-weight:600;"><td>${isZh ? "合计" : "Total"}</td><td style="text-align:right;">${fmt(employeeSS)}</td></tr>`;
    html += `</table>`;
  }

  // Tax bracket details
  if (raw.taxDetails?.brackets && raw.taxDetails.brackets.length > 0 && incomeTax > 0) {
    html += `<h3>${isZh ? "个税计算明细" : "Income Tax Bracket Details"}</h3>`;
    html += `<table><tr><th>${isZh ? "级距" : "Bracket"}</th><th style="text-align:right;">${isZh ? "税率" : "Rate"}</th><th style="text-align:right;">${isZh ? "应税金额" : "Taxable Amount"}</th><th style="text-align:right;">${isZh ? "税额" : "Tax"}</th></tr>`;
    for (const br of raw.taxDetails.brackets) {
      if (br.taxableAmount > 0) {
        html += `<tr><td>${fmt(br.min)} — ${br.max === Infinity || br.max > 1e12 ? "∞" : fmt(br.max)}</td><td style="text-align:right;">${br.rate}</td><td style="text-align:right;">${fmt(br.taxableAmount)}</td><td style="text-align:right;">${fmt(br.tax)}</td></tr>`;
      }
    }
    html += `</table>`;
  }

  html += `<div class="disclaimer">${isZh
    ? "此为基于现行法定规定的估算值。个人所得税按标准个人申报身份计算，未考虑额外扣除项。实际金额可能有所不同。"
    : "This is an estimation based on current statutory regulations. Income tax is calculated using standard individual filing status without additional deductions. Actual amounts may vary."
  }</div>`;

  return html;
}

// ─── Main Generator ───────────────────────────────────────────────────────────

export async function generateProposalPdf(data: ProposalData): Promise<Buffer> {
  const locale = data.locale || "en";
  const isZh = locale === "zh";
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // ── 1. Cover Page ──
  const countries = Array.from(new Set(data.sections.map(s => s.country)));
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

  // Use pre-embedded base64 logo for reliable rendering in all environments (dev & Docker)
  const logoDataUri = GEA_LOGO_HORIZONTAL_GREEN_BASE64;
  const logoHtml = logoDataUri
    ? `<div class="cover-logo"><img src="${logoDataUri}" alt="GEA" /></div>`
    : `<div class="cover-logo-fallback">GEA</div>`;

  const disclaimerText = isZh
    ? "本报告中的数据仅供参考，不构成法律或税务建议。实际用工成本和合规要求可能因具体情况而异。建议在做出任何雇佣决策前咨询专业法律和税务顾问。所有数据已尽力确保准确性，但可能存在偏差，请以当地官方最新法规为准。"
    : "The data in this report is for reference purposes only and does not constitute legal or tax advice. Actual employment costs and compliance requirements may vary depending on specific circumstances. We recommend consulting professional legal and tax advisors before making any employment decisions. All data has been prepared with best efforts for accuracy but may contain discrepancies; please refer to the latest local official regulations.";

  const coverHtml = `<!DOCTYPE html>
<html lang="${locale}">
<head><meta charset="UTF-8"><style>${BASE_CSS}</style></head>
<body>
  <div class="page cover">
    <div class="cover-sidebar"></div>
    <div class="cover-body">
      ${logoHtml}
      <div class="cover-divider"></div>
      <div class="cover-title">${isZh ? "全球劳动力合规指南" : "Global Workforce Compliance Guide"}</div>
      <div class="cover-subtitle">Global Employment Advisors</div>
      <div class="cover-date">${date}</div>
      <div class="cover-meta">${coverMetaHtml}</div>
    </div>
    <div class="cover-disclaimer">
      <strong>${isZh ? "免责声明" : "Disclaimer"}</strong><br/>
      ${disclaimerText}
    </div>
    <div class="cover-bottom-accent">
      <span class="cover-bottom-text">Confidential &amp; Proprietary &mdash; Global Employment Advisors</span>
    </div>
  </div>
</body>
</html>`;
  const coverPdf = await htmlToPdf(coverHtml);

  // ── 2. Content Pages ──
  let contentPages = "";

  // Table of Contents
  const typeLabels: Record<string, { en: string; zh: string }> = {
    benefits: { en: "Benefits Overview", zh: "福利概览" },
    compliance: { en: "Hiring Compliance", zh: "招聘合规" },
    salary: { en: "Salary Benchmarks", zh: "薪酬基准" },
    start_date: { en: "Start Date Prediction", zh: "入职日预测" },
    templates: { en: "Document Templates", zh: "文档模版" },
    cost_simulator: { en: "Employment Cost Simulation", zh: "雇佣成本模拟" },
  };

  // TOC includes company intro as first item
  let tocItems = `<div style="display:flex;justify-content:space-between;padding:1.5mm 0;border-bottom:0.3pt dotted ${BRAND.border};">
    <span><strong>1.</strong> ${isZh ? "关于 CGL Group & GEA" : "About CGL Group & GEA"}</span>
  </div>`;

  tocItems += data.sections.map((s, i) => {
    const label = isZh ? typeLabels[s.type]?.zh : typeLabels[s.type]?.en;
    return `<div style="display:flex;justify-content:space-between;padding:1.5mm 0;border-bottom:0.3pt dotted ${BRAND.border};">
      <span><strong>${i + 2}.</strong> ${s.country} — ${label || s.type}</span>
    </div>`;
  }).join("");

  contentPages += `<div class="page">
    <h2>${isZh ? "目录" : "Table of Contents"}</h2>
    <div style="margin-top:4mm;">${tocItems}</div>
  </div>`;

  // Company Introduction Page (after TOC, before data sections)
  contentPages += renderCompanyIntroPage(locale);

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
      case "cost_simulator":
        sectionHtml = renderCostSimulatorSection(section.country, section.data, locale);
        break;
    }
    if (sectionHtml) {
      contentPages += `<div class="page">${sectionHtml}</div>`;
    }
  }

  // Disclaimer is now on the cover page — no separate disclaimer page needed

  const headerTitle = isZh ? "GEA 全球劳动力合规指南" : "GEA Global Workforce Compliance Guide";
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
