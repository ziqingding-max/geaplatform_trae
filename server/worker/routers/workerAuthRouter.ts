/**
 * Worker Auth Router
 *
 * Handles login, registration, and password reset for workers.
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
} from "../workerAuth";
import { getDb } from "../../services/db/connection";
import { workerUsers, contractors } from "../../../drizzle/schema";
import { eq, and } from "drizzle-orm";

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
});
