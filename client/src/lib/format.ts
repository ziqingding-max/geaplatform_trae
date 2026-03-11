/**
 * Centralized formatting utilities for the EOR Admin system.
 * All date, currency, and country display formatting goes through here
 * to ensure global consistency.
 *
 * Date format standard: DD MMM YYYY (e.g., "25 Feb 2026")
 * Month format standard: MMM YYYY (e.g., "Feb 2026")
 * Currency format standard: CUR X,XXX.XX (e.g., "USD 1,234.56")
 * Country format standard: Full name with flag emoji
 */

// ─── Date Formatting ─────────────────────────────────────────────────────────

// Normalize various date inputs to a Date object
function normalizeDate(value: string | number | Date): Date {
  return new Date(value);
}

/**
 * Format a date as "DD MMM YYYY" (e.g., "25 Feb 2026")
 * Handles Date objects, ISO strings, and timestamps.
 */
export function formatDate(value: string | number | Date | null | undefined): string {
  if (!value) return "—";
  const d = normalizeDate(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * Format a date as "MMM YYYY" (e.g., "Feb 2026") — for payroll months, invoice months, etc.
 */
export function formatMonth(value: string | number | Date | null | undefined): string {
  if (!value) return "—";
  // Handle "YYYY-MM" strings by appending "-01"
  const str = String(value);
  // Special case for YYYY-MM strings which parse correctly but we want to be safe
  const d = str.length === 7 ? new Date(str + "-01") : normalizeDate(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en", { month: "short", year: "numeric" });
}

/**
 * Format a date as "MMM YY" (e.g., "Feb 26") — compact format for chart axis labels
 */
export function formatMonthShort(value: string | number | Date | null | undefined): string {
  if (!value) return "—";
  const str = String(value);
  const d = str.length === 7 ? new Date(str + "-01") : normalizeDate(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en", { month: "short", year: "2-digit" });
}

/**
 * Format a date as "MMMM YYYY" (e.g., "February 2026") — for long month display
 */
export function formatMonthLong(value: string | number | Date | null | undefined): string {
  if (!value) return "—";
  const str = String(value);
  const d = str.length === 7 ? new Date(str + "-01") : normalizeDate(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en", { month: "long", year: "numeric" });
}

/**
 * Format a date+time as "DD MMM YYYY, HH:MM" (e.g., "25 Feb 2026, 14:30")
 */
export function formatDateTime(value: string | number | Date | null | undefined): string {
  if (!value) return "—";
  const d = normalizeDate(value);
  
  if (isNaN(d.getTime())) return "—";
  // Use toLocaleString to ensure time is included
  return d.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

/**
 * Format a date as "YYYY-MM-DD" for form inputs
 */
export function formatDateISO(value: string | number | Date | null | undefined): string {
  if (!value) return "";
  const d = normalizeDate(value);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

// ─── Status Label Formatting ────────────────────────────────────────────────

/**
 * Convert a snake_case status string to Title Case.
 * e.g., "pending_review" → "Pending Review", "admin_approved" → "Admin Approved"
 * Used as fallback when no explicit label mapping exists.
 */
export function formatStatusLabel(status: string | null | undefined): string {
  if (!status) return "—";
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Currency Formatting ─────────────────────────────────────────────────────
// Primary currency formatting is in @/components/CurrencyAmount.tsx
// which handles zero-decimal currencies (KRW, JPY, etc.) correctly.
// Re-export here for convenience.
export { formatCurrencyAmount } from "@/components/CurrencyAmount";

/**
 * Format a number as currency: "1,234.56" (always 2 decimals, use formatCurrencyAmount for currency-aware decimals)
 */
export function formatAmount(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "0.00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0.00";
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Format currency with code: "USD 1,234.56"
 */
export function formatCurrency(currency: string | null | undefined, amount: string | number | null | undefined): string {
  const code = currency || "USD";
  return `${code} ${formatAmount(amount)}`;
}

/**
 * Compact currency format for dashboard cards: "$1.2M", "$45.3K", "$500"
 */
export function formatCurrencyCompact(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "$0";
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(n)) return "$0";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

// ─── Country Formatting ──────────────────────────────────────────────────────

const COUNTRY_NAMES: Record<string, string> = {
  AU: "Australia", BR: "Brazil", CA: "Canada", CN: "China", DE: "Germany",
  FR: "France", GB: "United Kingdom", HK: "Hong Kong", ID: "Indonesia",
  IN: "India", JP: "Japan", KR: "South Korea", MY: "Malaysia", NL: "Netherlands",
  PH: "Philippines", SG: "Singapore", TH: "Thailand", US: "United States",
  VN: "Vietnam", TW: "Taiwan", AE: "UAE", SA: "Saudi Arabia", IT: "Italy",
  ES: "Spain", PT: "Portugal", SE: "Sweden", NO: "Norway", DK: "Denmark",
  FI: "Finland", IE: "Ireland", CH: "Switzerland", AT: "Austria", BE: "Belgium",
  PL: "Poland", CZ: "Czech Republic", NZ: "New Zealand", MX: "Mexico",
  AR: "Argentina", CL: "Chile", CO: "Colombia", PE: "Peru",
};

/**
 * Convert a country code to its full name. Falls back to the code itself.
 */
export function countryName(code: string | null | undefined): string {
  if (!code) return "—";
  return COUNTRY_NAMES[code.toUpperCase()] || code.toUpperCase();
}

/**
 * Get flag emoji for a country code
 */
export function countryFlag(code: string | null | undefined): string {
  if (!code || code.length !== 2) return "";
  const upper = code.toUpperCase();
  return String.fromCodePoint(
    ...Array.from(upper).map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
  );
}

/**
 * Format country as "🇺🇸 United States (US)"
 */
export function formatCountry(code: string | null | undefined): string {
  if (!code) return "—";
  const flag = countryFlag(code);
  const name = countryName(code);
  return `${flag} ${name}`;
}
