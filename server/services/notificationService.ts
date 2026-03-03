
import { getDb } from "../db";
import { notifications, systemSettings, users, customerContacts } from "../../drizzle/schema";
import { eq, and, like, inArray, or } from "drizzle-orm";
// import { sendEmail } from "../_core/notification"; // Removed: use internal sendRawEmail
import { generateInvoicePdf } from "./invoicePdfService";
import { TRPCError } from "@trpc/server";
import { DEFAULT_RULES, NotificationConfig } from "./notificationConstants";

export type NotificationEvent = {
  type: string;
  customerId?: number; // Required for client-side notifications
  data: Record<string, any>;
};

export const notificationService = {
  /**
   * Main entry point to send notifications.
   * Handles configuration lookup, recipient resolution, template rendering, and multi-channel delivery.
   */
  async send(event: NotificationEvent) {
    const db = getDb();
    if (!db) {
        console.error("[Notification] DB connection failed");
        return;
    }

    try {
      // 1. Get configuration
      const config = await this.getConfig(event.type);
      if (!config || !config.enabled) {
        console.log(`[Notification] Skipped ${event.type} (disabled or config missing)`);
        return;
      }

      console.log(`[Notification] Processing ${event.type} for customer ${event.customerId || 'N/A'}`);

      // 2. Resolve recipients
      const recipients = await this.resolveRecipients(config.recipients, event.customerId);
      if (recipients.length === 0) {
        console.warn(`[Notification] No recipients found for ${event.type}`);
        return;
      }

      // 3. Prepare attachments (if any)
      const attachments: { filename: string; content: Buffer; contentType: string }[] = [];
      
      // Special handling for invoice PDFs
      if ((event.type === "invoice_sent" || event.type === "invoice_overdue") && event.data.invoiceId) {
        try {
          const pdfBuffer = await generateInvoicePdf({ invoiceId: event.data.invoiceId });
          attachments.push({
            filename: `Invoice_${event.data.invoiceNumber || event.data.invoiceId}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf"
          });
        } catch (err) {
          console.error(`[Notification] Failed to generate PDF for invoice ${event.data.invoiceId}`, err);
        }
      }

      // 4. Send to each recipient
      for (const recipient of recipients) {
        const lang = (recipient.language as "en" | "zh") || "en";
        const template = config.templates[lang] || config.templates.en;

        // Render content
        const emailSubject = this.renderTemplate(template.emailSubject, event.data);
        const emailBody = this.renderTemplate(template.emailBody, { ...event.data, contactName: recipient.name });
        const inAppMessage = this.renderTemplate(template.inAppMessage, event.data);

        // Channel: In-App
        if (config.channels.includes("in_app")) {
          await db.insert(notifications).values({
            targetPortal: recipient.portal,
            targetUserId: recipient.id,
            targetRole: recipient.role,
            targetCustomerId: recipient.portal === "client" ? event.customerId : undefined,
            type: event.type,
            title: inAppMessage, // Using the short message as title for now
            data: JSON.stringify(event.data), // Fix: data should be stringified JSON
            isRead: false,
          });
        }

        // Channel: Email
        if (config.channels.includes("email") && recipient.email) {
          // Use internal sendRawEmail instead of imported sendEmail
          await this.sendRawEmail({
            to: recipient.email,
            subject: emailSubject,
            html: emailBody,
            attachments
          });
        }
      }
    } catch (err) {
      console.error(`[Notification] Error processing ${event.type}:`, err);
    }
  },

  // --- Helper Methods ---

  async getConfig(type: string): Promise<NotificationConfig | null> {
    const db = getDb();
    if (!db) return null;

    // Try to get from DB first
    const setting = await db.query.systemSettings.findFirst({
      where: eq(systemSettings.key, "notification_rules")
    });

    if (setting && setting.value) {
      try {
        const rules = JSON.parse(setting.value);
        if (rules[type]) {
          // Merge with default to ensure structure integrity
          return { ...DEFAULT_RULES[type], ...rules[type] };
        }
      } catch (e) {
        console.error("[Notification] Failed to parse notification rules JSON", e);
      }
    }

    // Fallback to defaults
    return DEFAULT_RULES[type] || null;
  },

  async resolveRecipients(recipientRules: string[], customerId?: number) {
    const db = getDb();
    if (!db) return [];

    const targets: Array<{
      id: number;
      email: string;
      name: string;
      role: string;
      portal: "admin" | "client";
      language: string;
    }> = [];

    for (const rule of recipientRules) {
      const [portal, role] = rule.split(":"); // e.g. "client:finance"

      if (portal === "admin") {
        // Find admin users with this role
        const adminUsers = await db.query.users.findMany({
          where: and(
            eq(users.isActive, true),
            like(users.role, `%${role}%`) // Role is comma-separated string
          )
        });
        targets.push(...adminUsers.map((u: typeof users.$inferSelect) => ({
          id: u.id,
          email: u.email || "",
          name: u.name || "Admin",
          role: role,
          portal: "admin" as const,
          language: u.language || "en"
        })));
      } else if (portal === "client" && customerId) {
        // Find client contacts
        const contacts = await db.query.customerContacts.findMany({
          where: and(
            eq(customerContacts.customerId, customerId),
            eq(customerContacts.portalRole, role as any), // portalRole is enum
            eq(customerContacts.hasPortalAccess, true)
          )
        });
        
        // Fallback: If no 'finance' role found, try 'admin'
        if (role === "finance" && contacts.length === 0) {
           const adminContacts = await db.query.customerContacts.findMany({
            where: and(
              eq(customerContacts.customerId, customerId),
              eq(customerContacts.portalRole, "admin"),
              eq(customerContacts.hasPortalAccess, true)
            )
          });
          targets.push(...adminContacts.map((c: typeof customerContacts.$inferSelect) => ({
            id: c.id,
            email: c.email,
            name: c.contactName,
            role: "admin", // Fallback role
            portal: "client" as const,
            language: "en" // Contacts don't have language field yet, default to en
          })));
        } else {
          targets.push(...contacts.map((c: typeof customerContacts.$inferSelect) => ({
            id: c.id,
            email: c.email,
            name: c.contactName,
            role: role,
            portal: "client" as const,
            language: "en"
          })));
        }
      }
    }

    // Dedup by email
    const uniqueTargets = new Map();
    for (const t of targets) {
      if (t.email) uniqueTargets.set(t.email, t);
    }
    return Array.from(uniqueTargets.values());
  },

  renderTemplate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return data[key] !== undefined ? String(data[key]) : "";
    });
  },

  // Temporary internal mailer until we refactor _core/notification.ts
  async sendRawEmail(payload: { to: string; subject: string; html: string; attachments?: any[] }) {
    // Dynamic import to avoid circular dependency issues if any, though nodemailer is external
    const nodemailer = (await import("nodemailer")).default;
    const { ENV } = await import("../_core/env");

    if (!ENV.emailSmtpHost || !ENV.emailSmtpUser) {
      console.log(`[Dev Email] To: ${payload.to} | Subject: ${payload.subject}`);
      return;
    }

    const transporter = nodemailer.createTransport({
      host: ENV.emailSmtpHost,
      port: Number(ENV.emailSmtpPort) || 587,
      secure: Number(ENV.emailSmtpPort) === 465,
      auth: {
        user: ENV.emailSmtpUser,
        pass: ENV.emailSmtpPass,
      },
    });

    await transporter.sendMail({
      from: `GEA Notification <${ENV.emailFrom}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      attachments: payload.attachments
    });
  }
};
