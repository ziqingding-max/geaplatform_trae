/**
 * usePermissions — Centralized RBAC permission hook for the admin frontend.
 *
 * Reads the current user's role from useAuth() and exposes boolean flags
 * that every page can consume to show/hide action buttons.
 *
 * Permission matrix:
 *   admin              → everything
 *   sales              → Sales module write only; all else read-only
 *   customer_manager   → Client Management module write only; all else read-only
 *   operations_manager → Operations write + Finance/Vendor write (except mark-paid, review, export)
 *   finance_manager    → Finance + Vendor full access (including mark-paid, review, export)
 *   user               → read-only everywhere
 */

import { useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  canEditSales,
  canEditClientManagement,
  canEditOperations,
  canEditFinance,
  canMarkPaidAndReview,
  canExportData,
  isAdmin,
} from "../../../shared/roles";

export function usePermissions() {
  const { user } = useAuth();
  const roleStr = user?.role || "user";

  return useMemo(() => ({
    /** Full admin access */
    isAdmin: isAdmin(roleStr),

    /** Can create/edit/delete in Sales module (CRM, Quotations) */
    canEditSales: canEditSales(roleStr),

    /** Can create/edit/delete in Client Management (Customers, Employees, Contractors) */
    canEditClient: canEditClientManagement(roleStr),

    /** Can create/edit/delete in Operations (Payroll, Leave, Adjustments, Reimbursements, Contractor Invoices) */
    canEditOps: canEditOperations(roleStr),

    /** Can create/edit/delete in Finance/Vendor (general CRUD, NOT mark-paid/review) — Finance Manager OR Operations Manager */
    canEditFinanceOps: canEditFinance(roleStr),

    /** Can create/edit/delete in Finance/Vendor (general CRUD, NOT mark-paid/review) */
    canEditFinance: canEditFinance(roleStr),

    /** Can mark invoices/bills as Paid, approve release tasks */
    canMarkPaid: canMarkPaidAndReview(roleStr),

    /** Can review/approve release tasks (same as canMarkPaid) */
    canReview: canMarkPaidAndReview(roleStr),

    /** Can export data (CSV downloads) */
    canExport: canExportData(roleStr),
  }), [roleStr]);
}
