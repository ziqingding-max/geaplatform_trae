import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "./_core/trpc";
import { hasAnyRole, isAdmin } from "../shared/roles";

// Re-export protectedProcedure so routers can import from procedures.ts
export { protectedProcedure };

/**
 * Role-based procedure wrappers
 * Now supports multi-role: a user's role field can be "operations_manager,finance_manager"
 *
 * Permission matrix (write access):
 *   admin              → everything
 *   sales              → Sales module only (CRM, Quotations)
 *   customer_manager   → Client Management module only (Customers, Employees, Contractors)
 *   operations_manager → Operations module + Finance/Vendor (except mark-paid, review, export)
 *   finance_manager    → Finance + Vendor full access (including mark-paid, review, export)
 *
 * All roles get read-only access to all modules via userProcedure.
 */

// Admin can do everything
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!isAdmin(ctx.user.role)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({ ctx });
});

// Customer Manager: Create/manage customers and employees
export const customerManagerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!hasAnyRole(ctx.user.role, ["admin", "customer_manager"])) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Customer Manager access required",
    });
  }
  return next({ ctx });
});

// Operations Manager: Manage payroll, leave, reimbursement
export const operationsManagerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!hasAnyRole(ctx.user.role, ["admin", "operations_manager"])) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Operations Manager access required",
    });
  }
  return next({ ctx });
});

// Finance Manager: Manage invoices and billing (full access including mark-paid, review)
export const financeManagerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!hasAnyRole(ctx.user.role, ["admin", "finance_manager"])) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Finance Manager access required",
    });
  }
  return next({ ctx });
});

/**
 * Finance & Operations combined procedure:
 * Used for general create/update/delete in Finance and Vendor modules
 * that do NOT involve sensitive operations (mark-paid, review, export).
 * Allows: admin, finance_manager, operations_manager
 */
export const financeAndOpsProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!hasAnyRole(ctx.user.role, ["admin", "finance_manager", "operations_manager"])) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Finance Manager or Operations Manager access required",
    });
  }
  return next({ ctx });
});

// Sales: CRM and Quotations (Sales-only write access)
export const salesProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!hasAnyRole(ctx.user.role, ["admin", "sales"])) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Sales access required",
    });
  }
  return next({ ctx });
});

// CRM Access: Sales only (removed customer_manager write access per new requirements)
export const crmProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!hasAnyRole(ctx.user.role, ["admin", "sales"])) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Sales access required for CRM operations",
    });
  }
  return next({ ctx });
});

// Any authenticated user (read-only access to all modules)
export const userProcedure = protectedProcedure;
