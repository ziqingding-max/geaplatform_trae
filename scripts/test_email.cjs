/**
 * GEA Email Notification Test Script — Brand Upgrade v2
 *
 * Usage:
 *   node scripts/test_email.cjs
 *
 * Sends all 10 branded email notification templates to the admin email.
 * Each subject is prefixed with [TEST].
 * Logo is loaded via external URL (ADMIN_APP_URL env var).
 */

const nodemailer = require("nodemailer");

// ─── SMTP Config ────────────────────────────────────────
const SMTP_HOST = process.env.EMAIL_SMTP_HOST || "smtpdm.aliyun.com";
const SMTP_PORT = parseInt(process.env.EMAIL_SMTP_PORT || "465", 10);
const SMTP_USER = process.env.EMAIL_SMTP_USER || "notifications@no-reply.geahr.com";
const SMTP_PASS = process.env.EMAIL_SMTP_PASS || "NoTifications2026";
const EMAIL_FROM = process.env.EMAIL_FROM || SMTP_USER;
const EMAIL_ADMIN = process.env.EMAIL_ADMIN || "simon.ding@bestgea.com";

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS }
});

// ─── Brand Constants ────────────────────────────────────
const BRAND_GREEN = "#005430";
const BRAND_GOLD = "#D4A843";
const TEXT_PRIMARY = "#1a1a1a";
const TEXT_SECONDARY = "#555555";
const TEXT_MUTED = "#888888";
const BG_BODY = "#f4f5f7";
const BG_CARD = "#ffffff";
const BORDER_LIGHT = "#e5e7eb";

// ─── Logo (external URL) ───────────────────────────────
const ADMIN_APP_URL = (process.env.ADMIN_APP_URL || "https://app.geahr.com").replace(/\/+$/, "");
const logoImg = `<img src="${ADMIN_APP_URL}/brand/gea-logo-email.png" alt="GEA - Global Employment Advisors" width="220" style="display:block;margin:0 auto;max-width:220px;height:auto;" />`;

// ─── Reusable HTML Builders ─────────────────────────────
function emailButton(text, href, color) {
  color = color || BRAND_GREEN;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;">
<tr><td align="center" style="background-color:${color};border-radius:6px;">
<a href="${href}" target="_blank" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;border-radius:6px;">${text}</a>
</td></tr></table>`;
}

function emailInfoCard(rows) {
  const rowsHtml = rows.map(r =>
    `<tr><td style="padding:8px 12px;font-size:13px;color:${TEXT_SECONDARY};border-bottom:1px solid ${BORDER_LIGHT};width:40%;font-weight:600;">${r.label}</td>
<td style="padding:8px 12px;font-size:13px;color:${TEXT_PRIMARY};border-bottom:1px solid ${BORDER_LIGHT};">${r.value}</td></tr>`
  ).join("\n");
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f9fafb;border:1px solid ${BORDER_LIGHT};border-radius:6px;margin:16px 0;overflow:hidden;">${rowsHtml}</table>`;
}

function emailBanner(text, type) {
  const colors = {
    warning: { bg: "#fffbeb", border: "#f59e0b", text: "#92400e" },
    danger:  { bg: "#fef2f2", border: "#ef4444", text: "#991b1b" },
    success: { bg: "#f0fdf4", border: "#22c55e", text: "#166534" },
    info:    { bg: "#eff6ff", border: "#3b82f6", text: "#1e40af" },
  };
  const c = colors[type] || colors.info;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:16px 0;">
<tr><td style="background-color:${c.bg};border-left:4px solid ${c.border};padding:12px 16px;border-radius:4px;">
<p style="margin:0;font-size:14px;font-weight:600;color:${c.text};">${text}</p>
</td></tr></table>`;
}

function emailAmountDisplay(currency, amount) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:16px 0;">
<tr><td align="center" style="padding:16px;background-color:#f9fafb;border-radius:6px;">
<p style="margin:0;font-size:28px;font-weight:bold;color:${BRAND_GREEN};">${currency} ${amount}</p>
</td></tr></table>`;
}

function wrapLayout(bodyHtml, audience, preheader) {
  const year = new Date().getFullYear();
  const aboutSection = audience === "client" ? `
<tr><td style="padding:0 32px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr><td style="border-top:1px solid ${BORDER_LIGHT};padding:20px 0 0 0;">
<p style="margin:0 0 8px 0;font-size:13px;font-weight:bold;color:${BRAND_GREEN};">About GEA (Global Employment Advisors)</p>
<p style="margin:0;font-size:12px;line-height:1.6;color:${TEXT_MUTED};">As CGL Group's overseas business sub-brand, GEA helps enterprises navigate emerging markets across the full lifecycle — from Access to Implementation, from Development to Reorganization — providing comprehensive, end-to-end human resources services and solutions.</p>
</td></tr></table></td></tr>` : "";

  const supportLine = audience === "admin"
    ? "This is an internal system notification."
    : `Questions? Contact us at <a href="mailto:support@bestgea.com" style="color:${BRAND_GREEN};text-decoration:none;">support@bestgea.com</a>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>GEA Notification</title></head>
<body style="margin:0;padding:0;background-color:${BG_BODY};font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;">
${preheader ? `<div style="display:none;font-size:1px;color:#f4f5f7;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>` : ""}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BG_BODY};">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background-color:${BG_CARD};border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
<tr><td style="background-color:${BRAND_GREEN};padding:28px 32px;text-align:center;">${logoImg}</td></tr>
<tr><td style="background-color:${BRAND_GOLD};height:3px;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td style="padding:32px 32px 24px 32px;color:${TEXT_PRIMARY};font-size:15px;line-height:1.65;">${bodyHtml}</td></tr>
${aboutSection}
<tr><td style="padding:20px 32px 24px 32px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr><td style="border-top:1px solid ${BORDER_LIGHT};padding:20px 0 0 0;text-align:center;">
<p style="margin:0 0 6px 0;font-size:12px;color:${TEXT_MUTED};">${supportLine}</p>
<p style="margin:0;font-size:11px;color:#aaa;">&copy; ${year} Global Employment Advisors (GEA). All rights reserved.</p>
</td></tr></table></td></tr>
</table></td></tr></table></body></html>`;
}

// ─── Template Definitions ───────────────────────────────
const templates = [
  {
    name: "invoice_sent",
    audience: "client",
    subject: "Invoice #INV-TEST-001 from Global Employment Advisors",
    body: `<p>Dear Simon,</p>
<p>Thank you for your continued partnership with GEA. A new invoice has been generated for your account. Please find the details below:</p>
${emailInfoCard([
  { label: "Invoice Number", value: "#INV-TEST-001" },
  { label: "Amount Due", value: "USD 5,000.00" },
  { label: "Due Date", value: "2026-04-14" },
])}
<p>The invoice PDF is attached to this email for your records. If you have any questions regarding this invoice, please don't hesitate to reach out to your dedicated account manager.</p>
${emailButton("View in Client Portal", "https://app.geahr.com")}
<p>Best regards,<br><strong>GEA Finance Team</strong><br>Global Employment Advisors</p>`
  },
  {
    name: "invoice_overdue",
    audience: "client",
    subject: "Payment Overdue: Invoice #INV-TEST-002 — Action Required",
    body: `${emailBanner("This invoice is past due. Please arrange payment at your earliest convenience.", "warning")}
<p>Dear Simon,</p>
<p>We would like to bring to your attention that the following invoice remains unpaid past its due date:</p>
${emailInfoCard([
  { label: "Invoice Number", value: "#INV-TEST-002" },
  { label: "Original Due Date", value: "2026-03-01" },
  { label: "Status", value: "<span style='color:#ef4444;font-weight:bold;'>OVERDUE</span>" },
])}
<p>To avoid any disruption to your services, we kindly request that payment be arranged as soon as possible.</p>
${emailButton("View Invoice Details", "https://app.geahr.com", "#ef4444")}
<p>Best regards,<br><strong>GEA Finance Team</strong><br>Global Employment Advisors</p>`
  },
  {
    name: "new_employee_request",
    audience: "admin",
    subject: "New Employee Onboarding Request — John Smith from Test Corp",
    body: `${emailBanner("A new employee onboarding request has been submitted and requires your review.", "info")}
<p>Dear Admin,</p>
<p>Customer <strong>Test Corp</strong> has submitted a new employee onboarding request through the Client Portal. Please review the details below:</p>
${emailInfoCard([
  { label: "Employee Name", value: "John Smith" },
  { label: "Customer", value: "Test Corp" },
  { label: "Service Type", value: "EOR" },
  { label: "Requested Start Date", value: "2026-04-01" },
])}
<p>Please review this request and begin the onboarding process at your earliest convenience.</p>
${emailButton("Review in Admin Panel", "https://admin.geahr.com")}
<p>— GEA System</p>`
  },
  {
    name: "worker_invite",
    audience: "worker",
    subject: "Welcome to GEA — Set Up Your Worker Portal Account",
    body: `<p>Dear John Smith,</p>
<p>Welcome to <strong>Global Employment Advisors (GEA)</strong>! You have been invited to join the GEA Worker Portal, where you can manage your employment information, view payslips, submit invoices, and more.</p>
${emailInfoCard([
  { label: "Portal", value: "GEA Worker Portal" },
  { label: "Your Email", value: "john.smith@example.com" },
])}
<p>To get started, please click the button below to set up your password and activate your account:</p>
${emailButton("Accept Invitation & Set Up Account", "https://worker.geahr.com/register?token=test-token")}
${emailBanner("This invitation link will expire in 7 days. If you did not expect this invitation, please ignore this email.", "info")}
<p>Best regards,<br><strong>GEA Operations Team</strong><br>Global Employment Advisors</p>`
  },
  {
    name: "worker_invoice_ready",
    audience: "worker",
    subject: "Your Invoice #WI-TEST-001 Is Ready — March 2026",
    body: `<p>Dear John Smith,</p>
<p>Your invoice for the period of <strong>March 2026</strong> has been generated and is now available in your Worker Portal.</p>
${emailInfoCard([
  { label: "Invoice Number", value: "#WI-TEST-001" },
  { label: "Period", value: "March 2026" },
])}
<p>You can view and download the invoice by logging into your portal:</p>
${emailButton("View Invoice in Portal", "https://worker.geahr.com")}
<p>Best regards,<br><strong>GEA Operations Team</strong><br>Global Employment Advisors</p>`
  },
  {
    name: "worker_payment_sent",
    audience: "worker",
    subject: "Payment Sent: USD 3,500.00 — Invoice #WI-TEST-001",
    body: `${emailBanner("Your payment has been processed and sent successfully.", "success")}
<p>Dear John Smith,</p>
<p>We are pleased to confirm that a payment has been processed for your account:</p>
${emailAmountDisplay("USD", "3,500.00")}
${emailInfoCard([
  { label: "Invoice Number", value: "#WI-TEST-001" },
  { label: "Amount", value: "USD 3,500.00" },
  { label: "Status", value: "<span style='color:#22c55e;font-weight:bold;'>Sent</span>" },
])}
<p>Please allow 1–3 business days for the funds to arrive in your account.</p>
${emailButton("View Payment Details", "https://worker.geahr.com")}
<p>Best regards,<br><strong>GEA Finance Team</strong><br>Global Employment Advisors</p>`
  },
  {
    name: "leave_policy_country_activated",
    audience: "client",
    subject: "New Country Leave Policy Activated: Malaysia",
    body: `${emailBanner("A new country has been activated for leave policy management.", "info")}
<p>Dear Simon,</p>
<p>Based on recent employee onboarding activity, a new country has been activated in your leave policy management system:</p>
${emailInfoCard([
  { label: "Country", value: "Malaysia" },
  { label: "Status", value: "<span style='color:#22c55e;font-weight:bold;'>Active</span>" },
])}
<p>Statutory leave policies for <strong>Malaysia</strong> have been automatically initialized with default entitlements based on local labor regulations. We recommend reviewing and customizing these policies.</p>
${emailButton("Review Leave Policies", "https://app.geahr.com")}
<p>Best regards,<br><strong>GEA Operations Team</strong><br>Global Employment Advisors</p>`
  },
  {
    name: "employee_termination_request",
    audience: "admin",
    subject: "Employee Termination Request: John Smith (EMP-001)",
    body: `${emailBanner("An employee termination request has been submitted and requires your review.", "warning")}
<p>Dear Admin,</p>
<p>Customer <strong>Test Corp</strong> has submitted a termination request through the Client Portal:</p>
${emailInfoCard([
  { label: "Employee Name", value: "John Smith" },
  { label: "Employee Code", value: "EMP-001" },
  { label: "Customer", value: "Test Corp" },
  { label: "Requested Last Working Day", value: "2026-04-30" },
  { label: "Reason", value: "Contract ended" },
  { label: "Requested By", value: "Simon Ding" },
])}
<p>Please review this request carefully and take appropriate action in the Admin panel.</p>
${emailButton("Review in Admin Panel", "https://admin.geahr.com")}
<p>— GEA System</p>`
  },
  {
    name: "contractor_termination_request",
    audience: "admin",
    subject: "Contractor Termination Request: Jane Doe (CTR-001)",
    body: `${emailBanner("A contractor termination request has been submitted and requires your review.", "warning")}
<p>Dear Admin,</p>
<p>Customer <strong>Test Corp</strong> has submitted a contractor termination request:</p>
${emailInfoCard([
  { label: "Contractor Name", value: "Jane Doe" },
  { label: "Contractor Code", value: "CTR-001" },
  { label: "Customer", value: "Test Corp" },
  { label: "Requested End Date", value: "2026-04-30" },
  { label: "Reason", value: "Project completed" },
  { label: "Requested By", value: "Simon Ding" },
])}
<p>Please review this request and take appropriate action.</p>
${emailButton("Review in Admin Panel", "https://admin.geahr.com")}
<p>— GEA System</p>`
  },
  {
    name: "admin_system_alert",
    audience: "admin",
    subject: "[GEA System Alert] Database Backup Completed",
    body: `${emailBanner("Database Backup Completed", "warning")}
<p style="font-size:15px;color:#1a1a1a;line-height:1.65;">The scheduled database backup has been completed successfully. All data has been securely stored.</p>
<p style="margin-top:20px;font-size:13px;color:#888;">This is an automated system alert from the GEA platform.<br/>Timestamp: ${new Date().toISOString()}</p>`
  }
];

// ─── Send All ───────────────────────────────────────────
(async () => {
  console.log("=== GEA Email Notification Test (Brand Upgrade v2) ===");
  console.log("SMTP Host:", SMTP_HOST);
  console.log("SMTP User:", SMTP_USER);
  console.log("Send To:", EMAIL_ADMIN);
  console.log("Logo:", `External URL (${ADMIN_APP_URL}/brand/gea-logo-email.png)`);
  console.log("------------------------------------------------------");

  let ok = 0;
  let fail = 0;

  for (const t of templates) {
    try {
      const html = wrapLayout(t.body, t.audience, t.subject);
      await transporter.sendMail({
        from: `GEA Notification <${EMAIL_FROM}>`,
        to: EMAIL_ADMIN,
        subject: `[TEST] ${t.subject}`,
        html
      });
      console.log(`  ✓ [${t.name}] ${t.subject}`);
      ok++;
    } catch (e) {
      console.error(`  ✗ [${t.name}] ${t.subject} — ${e.message}`);
      fail++;
    }
  }

  console.log("------------------------------------------------------");
  console.log(`Results: ${ok} sent, ${fail} failed, ${templates.length} total`);
  console.log(`Check your inbox at ${EMAIL_ADMIN}`);
})();
