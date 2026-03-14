/**
 * GEA Email Notification Test Script
 * 
 * Usage:
 *   docker cp scripts/test_email.js gea-saas-app:/tmp/test_email.js
 *   docker exec gea-saas-app node /tmp/test_email.js
 * 
 * This script sends all 9 email notification templates to the admin email
 * for verification. Each email subject is prefixed with [TEST].
 * 
 * Make sure .env has correct EMAIL_SMTP_* configuration before running.
 */

const nodemailer = require("nodemailer");

// Read from environment variables, with fallback defaults
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

const templates = [
  {
    name: "invoice_sent",
    subject: "Invoice #INV-TEST-001 from GEA",
    html: "<p>Dear Simon,</p><p>Please find attached invoice #INV-TEST-001 for USD 5000.00.</p><p>Due Date: 2026-04-14</p><p>Best regards,<br>GEA Team</p>"
  },
  {
    name: "invoice_overdue",
    subject: "OVERDUE: Invoice #INV-TEST-002",
    html: "<p>Dear Simon,</p><p>This is a reminder that invoice #INV-TEST-002 was due on 2026-03-01.</p><p>Please arrange payment immediately.</p>"
  },
  {
    name: "new_employee_request",
    subject: "New Employee Onboarding Request",
    html: "<p>Customer Test Corp has requested onboarding for John Smith.</p>"
  },
  {
    name: "worker_invite",
    subject: "Invitation to GEA Worker Portal",
    html: "<p>Dear John Smith,</p><p>You have been invited to the GEA Worker Portal.</p><p>Please click the link below to set up your account:</p><p><a href='https://worker.geahr.com'>Accept Invitation</a></p>"
  },
  {
    name: "worker_invoice_ready",
    subject: "Invoice #WI-TEST-001 Ready",
    html: "<p>Dear John Smith,</p><p>Your invoice #WI-TEST-001 for March 2026 is now ready.</p>"
  },
  {
    name: "worker_payment_sent",
    subject: "Payment Sent: USD 3500.00",
    html: "<p>Dear John Smith,</p><p>We have processed a payment of USD 3500.00 for invoice #WI-TEST-001.</p>"
  },
  {
    name: "leave_policy_country_activated",
    subject: "New Country Leave Policy Activated: Malaysia",
    html: "<p>Dear Simon,</p><p>A new country <strong>Malaysia</strong> has been activated for leave policy management.</p><p>Please review leave policies in <strong>Settings</strong>.</p><p>Best regards,<br>GEA Team</p>"
  },
  {
    name: "employee_termination_request",
    subject: "Employee Termination Request: John Smith (EMP-001)",
    html: "<p>Dear Admin,</p><p>Customer <strong>Test Corp</strong> has requested termination for employee <strong>John Smith</strong> (EMP-001).</p><p><strong>Last Working Day:</strong> 2026-04-30</p><p><strong>Reason:</strong> Contract ended</p><p>Best regards,<br>GEA System</p>"
  },
  {
    name: "contractor_termination_request",
    subject: "Contractor Termination Request: Jane Doe (CTR-001)",
    html: "<p>Dear Admin,</p><p>Customer <strong>Test Corp</strong> has requested termination for contractor <strong>Jane Doe</strong> (CTR-001).</p><p><strong>End Date:</strong> 2026-04-30</p><p><strong>Reason:</strong> Project completed</p><p>Best regards,<br>GEA System</p>"
  }
];

(async () => {
  console.log("=== GEA Email Notification Test ===");
  console.log("SMTP Host:", SMTP_HOST);
  console.log("SMTP User:", SMTP_USER);
  console.log("Send To:", EMAIL_ADMIN);
  console.log("-----------------------------------");

  let ok = 0;
  let fail = 0;

  for (const t of templates) {
    try {
      await transporter.sendMail({
        from: "GEA Notification <" + EMAIL_FROM + ">",
        to: EMAIL_ADMIN,
        subject: "[TEST] " + t.subject,
        html: t.html
      });
      console.log("OK [" + t.name + "]: " + t.subject);
      ok++;
    } catch (e) {
      console.error("FAIL [" + t.name + "]: " + t.subject + " - " + e.message);
      fail++;
    }
  }

  console.log("-----------------------------------");
  console.log("Results: " + ok + " sent, " + fail + " failed, " + templates.length + " total");
  console.log("All done! Check your inbox at " + EMAIL_ADMIN);
})();
