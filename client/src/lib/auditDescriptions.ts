/**
 * Human-readable audit log description formatter
 * Converts raw action + entityType + changes into clear, understandable descriptions
 */

const ENTITY_LABELS: Record<string, string> = {
  customer: "Customer",
  employee: "Employee",
  payroll_run: "Payroll Run",
  payroll_item: "Payroll Item",
  invoice: "Invoice",
  invoices: "Invoices",
  invoice_item: "Invoice Item",
  adjustment: "Adjustment",
  leave_record: "Leave Record",
  country_config: "Country/Region",
  leave_type: "Leave Type",
  exchange_rate: "Exchange Rate",
  exchange_rates: "Exchange Rates",
  exchange_rate_markup: "Exchange Rate Markup",
  billing_entity: "Billing Entity",
  employee_document: "Employee Document",
  employee_contract: "Employee Contract",
  customer_pricing: "Customer Pricing",
  customer_contact: "Customer Contact",
  customer_contract: "Customer Contract",
  sales_lead: "Sales Lead",
  user: "User",
  system: "System",
};

const ACTION_LABELS: Record<string, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  approve: "Approved",
  reject: "Rejected",
  cancel: "Cancelled",
  auto_fill: "Auto-filled",
  batch_create: "Batch created",
  batch_update: "Batch updated",
  generate: "Generated",
  regenerate: "Regenerated",
  initialize: "Initialized",
  upsert: "Updated",
  update_role: "Changed role of",
  activate: "Activated",
  deactivate: "Deactivated",
  upload_receipt: "Uploaded receipt for",
  auto_create: "Auto-created",
  auto_lock_monthly: "Auto-locked monthly data",
  employee_auto_activated: "Auto-activated",
  employee_auto_added_to_payroll: "Auto-added to payroll",
  payroll_run_auto_created: "Auto-created",
  employee_auto_on_leave: "Auto-marked on leave",
  employee_auto_return_from_leave: "Auto-returned from leave",
  payroll_submit_lock: "Submitted and locked",
  fetch_live: "Fetched live rates for",
  convert_to_customer: "Converted to customer",
  // Cron job actions — previously missing
  employee_auto_terminated: "Auto-terminated",
  invoice_auto_overdue: "Auto-marked overdue",
  monthly_leave_accrual: "Monthly leave accrual",
  contractor_invoices_auto_created: "Auto-created contractor invoices",
  exchange_rate_auto_fetched: "Auto-fetched exchange rates",
  cron_job_executed: "Cron job executed",
  stop_recurring: "Stopped recurring",
  recurring_adjustment_generation: "Generated recurring adjustments",
};

/**
 * Extract invoiceNumber from changes JSON if available.
 * Returns the invoiceNumber string or null if not found.
 */
function extractInvoiceNumber(changes: any): string | null {
  if (!changes) return null;
  try {
    const parsed = typeof changes === "string" ? JSON.parse(changes) : changes;
    if (parsed && typeof parsed === "object" && parsed.invoiceNumber) {
      return parsed.invoiceNumber;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Build the entity identifier string for display.
 * For invoice entities, prefer invoiceNumber from changes over raw entityId.
 */
function formatEntityIdentifier(
  entityType: string,
  entityId: number | null | undefined,
  changes: any
): string {
  if (entityType === "invoice" || entityType === "invoices") {
    const invoiceNumber = extractInvoiceNumber(changes);
    if (invoiceNumber) {
      return invoiceNumber;
    }
  }
  // Fallback to #entityId for non-invoice entities or when invoiceNumber is not available
  if (entityId) {
    return `#${entityId}`;
  }
  return "";
}

/**
 * Parse the changes JSON field to extract meaningful details.
 * Excludes invoiceNumber from the detail string since it is handled separately.
 */
function parseChanges(changes: any): string {
  if (!changes) return "";
  
  try {
    const parsed = typeof changes === "string" ? JSON.parse(changes) : changes;
    
    // If it's a simple string, return it
    if (typeof parsed === "string") return parsed;
    
    // If it has a description field, use it
    if (parsed.description) return parsed.description;
    
    // If it has a detail field (used by cron jobs), use it
    if (parsed.detail) return parsed.detail;
    
    // If it has name/companyName, show it
    if (parsed.companyName) return `"${parsed.companyName}"`;
    if (parsed.name) return `"${parsed.name}"`;
    
    // If it has employee info
    if (parsed.firstName && parsed.lastName) return `${parsed.firstName} ${parsed.lastName}`;
    if (parsed.employeeName) return parsed.employeeName;
    
    // If it has invoiceNumber, skip it (handled separately by formatEntityIdentifier)
    // and show remaining fields as details instead
    if (parsed.invoiceNumber) {
      const remainingKeys = Object.keys(parsed).filter(k => k !== "invoiceNumber");
      if (remainingKeys.length === 0) return "";
      if (remainingKeys.length <= 3) {
        return remainingKeys.map(k => `${k}: ${parsed[k]}`).join(", ");
      }
      // Fall through to other checks below with remaining fields
    }
    
    // If it has status changes
    if (parsed.from && parsed.to) return `${parsed.from} → ${parsed.to}`;
    if (parsed.oldStatus && parsed.newStatus) return `${parsed.oldStatus} → ${parsed.newStatus}`;
    
    // If it has a message
    if (parsed.message) return parsed.message;
    
    // If it has count info
    if (parsed.count !== undefined) return `${parsed.count} items`;
    
    // If it has currency pair info
    if (parsed.fromCurrency && parsed.toCurrency) return `${parsed.fromCurrency} → ${parsed.toCurrency}`;
    
    // For objects with a few key fields, show them (exclude invoiceNumber as it's handled by identifier)
    const keys = Object.keys(parsed).filter(k => k !== "invoiceNumber");
    if (keys.length <= 3 && keys.length > 0) {
      return keys.map(k => `${k}: ${parsed[k]}`).join(", ");
    }
    
    return "";
  } catch {
    if (typeof changes === "string") return changes;
    return "";
  }
}

/**
 * Format an audit log entry into a human-readable description
 */
export function formatAuditDescription(log: {
  action: string;
  entityType: string;
  entityId?: number | null;
  changes?: any;
  userName?: string | null;
}): string {
  const actionLabel = ACTION_LABELS[log.action] || log.action;
  const entityLabel = ENTITY_LABELS[log.entityType] || log.entityType;
  const details = parseChanges(log.changes);
  const entityIdentifier = formatEntityIdentifier(log.entityType, log.entityId, log.changes);
  
  // Special cases for system actions
  if (log.action === "auto_lock_monthly") {
    return `System auto-locked adjustments and leave records for the month${details ? ` — ${details}` : ""}`;
  }
  
  if (log.action === "employee_auto_activated") {
    return `System auto-activated employee #${log.entityId}${details ? ` — ${details}` : ""}`;
  }
  
  if (log.action === "employee_auto_added_to_payroll") {
    return `System auto-added employee to payroll run #${log.entityId}${details ? ` — ${details}` : ""}`;
  }
  
  if (log.action === "payroll_run_auto_created") {
    return `System auto-created payroll run #${log.entityId}${details ? ` — ${details}` : ""}`;
  }
  
  if (log.action === "employee_auto_on_leave") {
    return `System marked employee #${log.entityId} as on leave${details ? ` — ${details}` : ""}`;
  }
  
  if (log.action === "employee_auto_return_from_leave") {
    return `System returned employee #${log.entityId} from leave${details ? ` — ${details}` : ""}`;
  }
  
  if (log.action === "fetch_live") {
    return `Fetched live exchange rates from ECB${details ? ` — ${details}` : ""}`;
  }
  
  if (log.action === "initialize") {
    return `Initialized ${entityLabel.toLowerCase()} defaults${details ? ` — ${details}` : ""}`;
  }
  
  if (log.action === "auto_fill") {
    return `Auto-filled payroll run #${log.entityId} with employee data${details ? ` — ${details}` : ""}`;
  }
  
  if (log.action === "payroll_submit_lock") {
    return `Submitted and locked payroll run #${log.entityId}${details ? ` — ${details}` : ""}`;
  }

  // Cron job actions — previously missing
  if (log.action === "employee_auto_terminated") {
    return `System auto-terminated employee #${log.entityId}${details ? ` — ${details}` : ""}`;
  }

  if (log.action === "invoice_auto_overdue") {
    return `System auto-marked invoice ${entityIdentifier} as overdue${details ? ` — ${details}` : ""}`;
  }

  if (log.action === "monthly_leave_accrual") {
    return `System completed monthly leave accrual${details ? ` — ${details}` : ""}`;
  }

  if (log.action === "contractor_invoices_auto_created") {
    return `System auto-created contractor invoices${details ? ` — ${details}` : ""}`;
  }

  if (log.action === "exchange_rate_auto_fetched") {
    return `System auto-fetched exchange rates${details ? ` — ${details}` : ""}`;
  }

  if (log.action === "cron_job_executed") {
    return `${details || "Cron job executed"}`;
  }

  if (log.action === "stop_recurring") {
    return `Stopped recurring adjustment #${log.entityId}${details ? ` — ${details}` : ""}`;
  }

  if (log.action === "recurring_adjustment_generation") {
    return `System generated recurring adjustments${details ? ` — ${details}` : ""}`;
  }

  if (log.action === "convert_to_customer") {
    return `Converted sales lead to customer${details ? ` — ${details}` : ""}`;
  }
  
  // Standard pattern: "Action EntityType identifier — details"
  const parts: string[] = [actionLabel, entityLabel.toLowerCase()];
  
  if (entityIdentifier) {
    parts.push(entityIdentifier);
  }
  
  let result = parts.join(" ");
  
  if (details) {
    // Avoid repeating the invoiceNumber in details if it's already shown as the identifier
    const invoiceNum = extractInvoiceNumber(log.changes);
    if (invoiceNum && details === invoiceNum) {
      // Details only contained the invoiceNumber, which is already displayed as identifier — skip
    } else {
      result += ` — ${details}`;
    }
  }
  
  return result;
}

/**
 * Get a short summary for Dashboard Recent Activity
 */
export function formatActivitySummary(log: {
  action: string;
  entityType: string;
  entityId?: number | null;
  changes?: any;
  resolvedUserName?: string | null;
  userName?: string | null;
  userId?: number | null;
}): string {
  const desc = formatAuditDescription(log);
  const who = log.resolvedUserName || log.userName;
  if (who) return `${who}: ${desc}`;
  return desc;
}
