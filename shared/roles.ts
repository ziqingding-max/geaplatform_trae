/**
 * Shared role utilities for multi-role support.
 *
 * Role storage format: comma-separated string in the `role` field.
 * Examples: "admin", "user", "operations_manager,finance_manager", "customer_manager,operations_manager,finance_manager"
 *
 * Rules:
 * - "admin" and "user" are exclusive (single-select only)
 * - "operations_manager", "finance_manager", "customer_manager" can be combined
 */

export const ALL_ROLES = [
  "admin",
  "customer_manager",
  "operations_manager",
  "finance_manager",
  "sales",
  "user",
] as const;

export type RoleValue = (typeof ALL_ROLES)[number];

/** Manager roles that can be combined */
export const MANAGER_ROLES: RoleValue[] = [
  "customer_manager",
  "operations_manager",
  "finance_manager",
  "sales",
];

/** Exclusive roles (cannot be combined with others) */
export const EXCLUSIVE_ROLES: RoleValue[] = ["admin", "user"];

/** Parse a role string into an array of individual roles */
export function parseRoles(roleStr: string | null | undefined): RoleValue[] {
  if (!roleStr) return ["user"];
  return roleStr.split(",").map((r) => r.trim()).filter(Boolean) as RoleValue[];
}

/** Serialize an array of roles into a comma-separated string */
export function serializeRoles(roles: RoleValue[]): string {
  if (roles.length === 0) return "user";
  return roles.join(",");
}

/** Check if a user has a specific role */
export function hasRole(roleStr: string | null | undefined, targetRole: RoleValue): boolean {
  const roles = parseRoles(roleStr);
  return roles.includes(targetRole);
}

/** Check if a user has ANY of the specified roles */
export function hasAnyRole(roleStr: string | null | undefined, targetRoles: RoleValue[]): boolean {
  const roles = parseRoles(roleStr);
  return targetRoles.some((r) => roles.includes(r));
}

/** Check if the user is an admin */
export function isAdmin(roleStr: string | null | undefined): boolean {
  return hasRole(roleStr, "admin");
}

/** Validate a role combination: admin and user are exclusive */
export function validateRoles(roles: RoleValue[]): { valid: boolean; error?: string } {
  if (roles.length === 0) return { valid: false, error: "At least one role is required" };

  const hasExclusive = roles.some((r) => EXCLUSIVE_ROLES.includes(r));
  const hasManager = roles.some((r) => MANAGER_ROLES.includes(r));

  if (hasExclusive && hasManager) {
    return {
      valid: false,
      error: `"admin" and "user" cannot be combined with manager roles`,
    };
  }

  if (hasExclusive && roles.length > 1) {
    return {
      valid: false,
      error: `"admin" and "user" are exclusive roles and cannot be combined`,
    };
  }

  return { valid: true };
}

/** Human-readable role labels */
export const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  customer_manager: "Customer Manager",
  operations_manager: "Operations Manager",
  finance_manager: "Finance Manager",
  sales: "Sales",
  user: "User",
};

/** Format roles for display */
export function formatRoles(roleStr: string | null | undefined): string {
  const roles = parseRoles(roleStr);
  return roles.map((r) => ROLE_LABELS[r] || r).join(", ");
}

/* ─── Fine-grained permission helpers for RBAC ─── */

/**
 * Permission matrix:
 *   admin              → everything
 *   sales              → Sales module write only
 *   customer_manager   → Client Management module write only
 *   operations_manager → Operations write + Finance/Vendor write (except mark-paid, review, export)
 *   finance_manager    → Finance + Vendor full access (including mark-paid, review, export)
 *   user               → read-only everywhere
 */

/** Can the user edit Sales module content (CRM, Quotations)? */
export function canEditSales(roleStr: string | null | undefined): boolean {
  return hasAnyRole(roleStr, ["admin", "sales"]);
}

/** Can the user edit Client Management content (Customers, Employees, Contractors)? */
export function canEditClientManagement(roleStr: string | null | undefined): boolean {
  return hasAnyRole(roleStr, ["admin", "customer_manager"]);
}

/** Can the user edit Operations content (Payroll, Leave, Adjustments, Reimbursements)? */
export function canEditOperations(roleStr: string | null | undefined): boolean {
  return hasAnyRole(roleStr, ["admin", "operations_manager"]);
}

/** Can the user edit Finance/Vendor content (general create/update/delete, NOT mark-paid/review)? */
export function canEditFinance(roleStr: string | null | undefined): boolean {
  return hasAnyRole(roleStr, ["admin", "finance_manager", "operations_manager"]);
}

/** Can the user perform sensitive finance operations (mark invoice/bill as Paid, review release tasks)? */
export function canMarkPaidAndReview(roleStr: string | null | undefined): boolean {
  return hasAnyRole(roleStr, ["admin", "finance_manager"]);
}

/** Can the user export data (CSV, reports)? */
export function canExportData(roleStr: string | null | undefined): boolean {
  return hasAnyRole(roleStr, ["admin", "finance_manager"]);
}
