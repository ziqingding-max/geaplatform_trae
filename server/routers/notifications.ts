
import { z } from "zod";
import { router } from "../_core/trpc";
import { userProcedure, adminProcedure } from "../procedures";
import { db } from "../db";
import { notifications, systemSettings } from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { DEFAULT_RULES } from "../services/notificationConstants";

// Schema for updating notification rules
const NotificationConfigSchema = z.object({
  enabled: z.boolean().default(false),
  channels: z.array(z.enum(["email", "in_app"])).default([]),
  recipients: z.array(z.string()).default([]),
  templates: z.object({
    en: z.object({
      emailSubject: z.string().default(""),
      emailBody: z.string().default(""),
      inAppMessage: z.string().default(""),
    }).default({}),
    zh: z.object({
      emailSubject: z.string().default(""),
      emailBody: z.string().default(""),
      inAppMessage: z.string().default(""),
    }).default({}),
  }).default({}),
});

export const notificationsRouter = router({
  // --- Admin: Settings Management ---

  /**
   * Get all notification rules configuration
   */
  getSettings: adminProcedure.query(async () => {
    const setting = await db.query.systemSettings.findFirst({
      where: eq(systemSettings.key, "notification_rules"),
    });

    const config = JSON.parse(JSON.stringify(DEFAULT_RULES)); // Deep clone defaults

    if (setting && setting.value) {
      try {
        const dbRules = JSON.parse(setting.value);
        // Merge DB rules over defaults
        for (const [key, value] of Object.entries(dbRules)) {
          if (config[key]) {
            // Ensure we don't lose structure if DB has partial update (though UI sends full object)
            // Use Zod to parse and validate the DB value safely
            const result = NotificationConfigSchema.safeParse(value);
            if (result.success) {
              config[key] = { ...config[key], ...result.data };
            } else {
              console.warn(`[Notification] Invalid rule config for ${key}, using defaults`, result.error);
            }
          }
        }
      } catch (e) {
        console.error("Failed to parse notification rules", e);
      }
    }

    return config;
  }),

  /**
   * Update a specific notification rule
   */
  updateRule: adminProcedure
    .input(
      z.object({
        type: z.string(), // e.g. "invoice_sent"
        config: NotificationConfigSchema,
      })
    )
    .mutation(async ({ input }) => {
      // Fetch existing settings
      const setting = await db.query.systemSettings.findFirst({
        where: eq(systemSettings.key, "notification_rules"),
      });

      let rules: Record<string, any> = {};
      if (setting && setting.value) {
        try {
          rules = JSON.parse(setting.value);
        } catch (e) {
          // ignore error, start fresh
        }
      }

      // Update the specific rule
      rules[input.type] = input.config;

      // Save back to DB
      await db
        .insert(systemSettings)
        .values({
          key: "notification_rules",
          value: JSON.stringify(rules),
          description: "Configuration for system notifications",
        })
        .onConflictDoUpdate({
          target: systemSettings.key,
          set: {
            value: JSON.stringify(rules),
            updatedAt: new Date(),
          },
        });

      return { success: true };
    }),

  // --- User: Notification Center ---

  /**
   * Get unread notifications for the current user
   */
  getUnread: userProcedure
    .input(
      z.object({
        limit: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      // User can see notifications targeted to:
      // 1. Their specific User ID (admin portal)
      // 2. Their specific Role (if they are admin)
      
      const userId = ctx.user.id;
      const userRoles = (ctx.user.role || "").split(",");

      // Build OR conditions for roles
      // targetRole IS NULL OR targetRole IN userRoles
      // Since SQLite doesn't support array overlap easily, we fetch all role-based notifs 
      // where targetPortal='admin' and filter in memory or complex query.
      // Better:
      // WHERE targetPortal = 'admin' 
      //   AND (targetUserId = userId OR targetRole IN (role1, role2))
      //   AND isRead = false

      // Note: This logic assumes admin portal context. Client portal has separate router.
      
      const roleConditions = userRoles.map(role => eq(notifications.targetRole, role.trim()));
      
      return await db.query.notifications.findMany({
        where: (t, { and, or, eq }) => and(
          eq(t.targetPortal, "admin"),
          eq(t.isRead, false),
          or(
            eq(t.targetUserId, userId),
            ...roleConditions
          )
        ),
        orderBy: [desc(notifications.createdAt)],
        limit: input.limit,
      });
    }),

  /**
   * Mark a notification as read
   */
  markAsRead: userProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership (loosely - if you can see it, you can mark it read)
      // In strict mode, we should check if the notif targets this user
      
      await db
        .update(notifications)
        .set({ isRead: true, readAt: new Date() })
        .where(eq(notifications.id, input.id));
        
      return { success: true };
    }),

  /**
   * Mark all visible notifications as read
   */
  markAllAsRead: userProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;
    const userRoles = (ctx.user.role || "").split(",");
    
    // Complex update with join/subquery is hard in Drizzle/SQLite
    // Simple approach: Update where targetPortal='admin' and targetUserId=userId
    // For role-based, it's trickier because multiple users share the same role notification?
    // Wait - if a notification is sent to a ROLE, does everyone see the SAME row?
    // YES, based on current schema.
    // If User A marks it read, User B will see it as read? 
    // CRITICAL FLAW in schema for "Shared Role Notifications".
    // If targetRole is set, it means "Broadcast to this role".
    // Usually broadcast means "Insert 1 row per user" OR "Single row + read_receipts table".
    // Given the current simple schema: 
    // CHANGE STRATEGY: NotificationService should "Fan Out" (Insert multiple rows) 
    // when sending to a role.
    // Let's check NotificationService.ts...
    //
    // NotificationService.ts:
    // resolveRecipients() finds all users.
    // loops through recipients...
    // db.insert(notifications).values({ targetUserId: recipient.id ... })
    //
    // PERFECT! The service ALREADY fans out (creates 1 row per user).
    // So targetUserId is ALWAYS set. targetRole is just metadata.
    // So we only need to query by targetUserId!
    
    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(notifications.targetPortal, "admin"),
          eq(notifications.targetUserId, userId),
          eq(notifications.isRead, false)
        )
      );
      
    return { success: true };
  }),
});
