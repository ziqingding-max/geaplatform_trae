/**
 * Worker Auth Router
 *
 * Handles login, registration, password reset, and forgot password for workers.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  workerRouter,
  workerPublicProcedure,
  protectedWorkerProcedure,
} from "../workerTrpc";
import {
  hashPassword,
  verifyPassword,
  signWorkerToken,
  setWorkerCookie,
  clearWorkerCookie,
  getWorkerTokenFromRequest,
  verifyWorkerToken,
  generateResetToken,
  getResetExpiryDate,
} from "../workerAuth";
import { getDb } from "../../services/db/connection";
import { workerUsers, contractors } from "../../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { sendWorkerPasswordResetEmail } from "../../services/authEmailService";

export const workerAuthRouter = workerRouter({
  /**
   * Login with email and password
   */
  login: workerPublicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [user] = await db
        .select()
        .from(workerUsers)
        .where(eq(workerUsers.email, input.email.toLowerCase().trim()));

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      if (!user.isActive) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Account is inactive",
        });
      }

      if (!user.passwordHash) {
        // Should use registration flow if no password set
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Please complete registration first",
        });
      }

      const isValid = await verifyPassword(input.password, user.passwordHash);
      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      // Generate token
      const token = await signWorkerToken({
        sub: user.id.toString(),
        email: user.email,
        contractorId: user.contractorId,
        iss: "gea-worker",
      });

      // Set cookie
      setWorkerCookie(ctx.res, token);

      // Update last login
      await db
        .update(workerUsers)
        .set({ lastLoginAt: new Date() })
        .where(eq(workerUsers.id, user.id));

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          contractorId: user.contractorId,
        },
      };
    }),

  /**
   * Logout
   */
  logout: workerPublicProcedure.mutation(({ ctx }) => {
    clearWorkerCookie(ctx.res);
    return { success: true };
  }),

  /**
   * Get current user
   */
  me: protectedWorkerProcedure.query(({ ctx }) => {
    return ctx.workerUser;
  }),

  /**
   * Register with invite token
   */
  register: workerPublicProcedure
    .input(
      z.object({
        token: z.string(),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [user] = await db
        .select()
        .from(workerUsers)
        .where(eq(workerUsers.inviteToken, input.token));

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid or expired invite token",
        });
      }

      if (user.inviteExpiresAt && new Date(user.inviteExpiresAt) < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invite token has expired",
        });
      }

      // Hash password
      const passwordHash = await hashPassword(input.password);

      // Update user
      await db
        .update(workerUsers)
        .set({
          passwordHash,
          inviteToken: null,
          inviteExpiresAt: null,
          isEmailVerified: true,
          isActive: true,
          lastLoginAt: new Date(),
        })
        .where(eq(workerUsers.id, user.id));

      // Generate token for auto-login
      const token = await signWorkerToken({
        sub: user.id.toString(),
        email: user.email,
        contractorId: user.contractorId,
        iss: "gea-worker",
      });

      setWorkerCookie(ctx.res, token);

      return { success: true };
    }),

  /**
   * Forgot password — generates a reset token and sends email
   */
  forgotPassword: workerPublicProcedure
    .input(
      z.object({
        email: z.string().email(),
        origin: z.string().url(), // Frontend origin for building reset URL
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Find worker user by email
      const [user] = await db
        .select({
          id: workerUsers.id,
          email: workerUsers.email,
          isActive: workerUsers.isActive,
          contractorId: workerUsers.contractorId,
        })
        .from(workerUsers)
        .where(eq(workerUsers.email, input.email.toLowerCase().trim()));

      // Always return success to prevent email enumeration
      if (!user || !user.isActive) {
        return {
          success: true,
          message: "If an account exists with this email, a reset link has been sent.",
        };
      }

      const resetToken = generateResetToken();
      const resetExpiresAt = getResetExpiryDate();

      // Store reset token
      await db
        .update(workerUsers)
        .set({ resetToken, resetExpiresAt })
        .where(eq(workerUsers.id, user.id));

      // Build reset URL
      const origin = input.origin;
      const resetUrl = `${origin}/reset-password?token=${resetToken}`;

      // Get worker name from contractors table
      let workerName = user.email;
      if (user.contractorId) {
        try {
          const [contractor] = await db
            .select({ firstName: contractors.firstName, lastName: contractors.lastName })
            .from(contractors)
            .where(eq(contractors.id, user.contractorId));
          if (contractor) {
            workerName = `${contractor.firstName || ""} ${contractor.lastName || ""}`.trim() || user.email;
          }
        } catch {
          // Fallback to email
        }
      }

      // Send password reset email
      try {
        await sendWorkerPasswordResetEmail({
          to: user.email,
          workerName,
          resetUrl,
        });
      } catch (err) {
        console.error("[WorkerAuth] Failed to send password reset email:", err);
      }

      return {
        success: true,
        message: "If an account exists with this email, a reset link has been sent.",
      };
    }),

  /**
   * Verify reset token (check if valid before showing reset form)
   */
  verifyResetToken: workerPublicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [user] = await db
        .select({
          id: workerUsers.id,
          email: workerUsers.email,
          resetExpiresAt: workerUsers.resetExpiresAt,
        })
        .from(workerUsers)
        .where(eq(workerUsers.resetToken, input.token));

      if (!user) {
        return { valid: false, reason: "Invalid reset link" as const };
      }

      if (user.resetExpiresAt && new Date(user.resetExpiresAt) < new Date()) {
        return { valid: false, reason: "Reset link has expired" as const };
      }

      return {
        valid: true,
        email: user.email,
      };
    }),

  /**
   * Reset password using token
   */
  resetPassword: workerPublicProcedure
    .input(
      z.object({
        token: z.string(),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.password !== input.confirmPassword) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Passwords do not match" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Find user by reset token
      const [user] = await db
        .select()
        .from(workerUsers)
        .where(eq(workerUsers.resetToken, input.token));

      if (!user) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid reset link" });
      }

      if (user.resetExpiresAt && new Date(user.resetExpiresAt) < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Reset link has expired" });
      }

      // Hash new password and clear reset token
      const passwordHash = await hashPassword(input.password);

      await db
        .update(workerUsers)
        .set({
          passwordHash,
          resetToken: null,
          resetExpiresAt: null,
        })
        .where(eq(workerUsers.id, user.id));

      // Auto-login after password reset
      const token = await signWorkerToken({
        sub: user.id.toString(),
        email: user.email,
        contractorId: user.contractorId,
        iss: "gea-worker",
      });

      setWorkerCookie(ctx.res, token);

      return { success: true };
    }),

  /**
   * Change password (authenticated)
   */
  changePassword: protectedWorkerProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get current password hash
      const [user] = await db
        .select({ passwordHash: workerUsers.passwordHash })
        .from(workerUsers)
        .where(eq(workerUsers.id, ctx.workerUser.id));

      if (!user || !user.passwordHash) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Account error" });
      }

      const valid = await verifyPassword(input.currentPassword, user.passwordHash);
      if (!valid) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Current password is incorrect" });
      }

      const newHash = await hashPassword(input.newPassword);
      await db
        .update(workerUsers)
        .set({ passwordHash: newHash })
        .where(eq(workerUsers.id, ctx.workerUser.id));

      return { success: true };
    }),
});
