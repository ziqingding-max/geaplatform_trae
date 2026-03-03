/**
 * Worker Portal tRPC Setup
 *
 * COMPLETELY SEPARATE tRPC instance from admin and customer portal.
 * Every procedure that accesses data MUST go through protectedWorkerProcedure,
 * which injects ctx.workerUser into the context.
 */

import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import {
  authenticateWorkerRequest,
  type WorkerUserContext,
} from "./workerAuth";

// ============================================================================
// Context
// ============================================================================

export type WorkerContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  workerUser: WorkerUserContext | null;
};

export async function createWorkerContext(
  opts: CreateExpressContextOptions
): Promise<WorkerContext> {
  let workerUser: WorkerUserContext | null = null;

  try {
    workerUser = await authenticateWorkerRequest(opts.req);
  } catch {
    workerUser = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    workerUser,
  };
}

// ============================================================================
// tRPC Instance
// ============================================================================

const t = initTRPC.context<WorkerContext>().create({
  transformer: superjson,
});

export const workerRouter = t.router;

/**
 * Public worker procedure — ONLY for auth endpoints (login, register, verify invite).
 * MUST NOT be used for any data-access endpoints.
 */
export const workerPublicProcedure = t.procedure;

/**
 * Protected worker procedure — EVERY data-access endpoint MUST use this.
 * Guarantees:
 * 1. User is authenticated via worker JWT
 * 2. ctx.workerUser is always populated
 */
const requireWorkerUser = t.middleware(async ({ ctx, next }) => {
  if (!ctx.workerUser) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return next({
    ctx: {
      ...ctx,
      workerUser: ctx.workerUser, // guaranteed non-null
    },
  });
});

export const protectedWorkerProcedure = t.procedure.use(requireWorkerUser);
