/**
 * GEA Admin — Dashboard (Role-based Workspace)
 *
 * Replaces the old multi-tab report-heavy dashboard with a task-oriented,
 * role-specific workspace. Each role sees their own action items, metrics,
 * and team pulse — all on a single, clean page.
 *
 * Roles:
 *   - Sales:              Pipeline funnel, quotation stats, stale leads
 *   - AM (Customer Mgr):  Onboarding, employee lifecycle, client health
 *   - Ops Manager:        Pending tasks across all operations & finance modules
 *   - Finance Manager:    AR/AP, settlement, wallet balances
 *   - Admin:              Everything
 */
import { useMemo } from "react";
import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { hasAnyRole, isAdmin, parseRoles } from "@shared/roles";
import { cn } from "@/lib/utils";
import { formatCurrencyCompact, formatDate, formatStatusLabel, countryName } from "@/lib/format";
import { formatActivitySummary } from "@/lib/auditDescriptions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  Users, Globe, Clock, AlertCircle, ArrowRight, CalendarDays,
  Receipt, UserPlus, CheckCircle2, TrendingUp, DollarSign,
  Activity, FileText, Briefcase, Building2, Wallet, ShieldCheck,
  ArrowUpDown, Package, Star, PartyPopper, Cake, Award,
  Target, Megaphone, HandshakeIcon, CircleDollarSign,
  ClipboardList, CreditCard, AlertTriangle, BarChart3,
  TrendingDown, Landmark, HeartPulse, XCircle, MapPin,
  FileWarning, Timer, WalletCards, Mail,
} from "lucide-react";

// ─── Glass Stat Card ─────────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  icon: Icon,
  description,
  href,
  accent = "default",
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  href?: string;
  accent?: "default" | "green" | "amber" | "red" | "blue" | "purple";
}) {
  const accentStyles = {
    default: "bg-gray-500/10 text-gray-600",
    green: "bg-emerald-500/15 text-emerald-600",
    amber: "bg-amber-500/15 text-amber-600",
    red: "bg-red-500/15 text-red-600",
    blue: "bg-blue-500/15 text-blue-600",
    purple: "bg-purple-500/15 text-purple-600",
  };
  const content = (
    <div className={cn(
      "glass-stat-card p-5 relative overflow-hidden group h-full",
      href && "cursor-pointer"
    )}>
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className={cn("p-2.5 rounded-xl", accentStyles[accent])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {href && (
        <div className="absolute bottom-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

// ─── Action Item Row ─────────────────────────────────────────────────────────
function ActionItem({
  icon: Icon,
  label,
  count,
  href,
  colorClass,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number;
  href: string;
  colorClass: string;
}) {
  if (count === 0) return null;
  return (
    <Link href={href}>
      <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/30 hover:bg-white/60 transition-all duration-200 cursor-pointer group">
        <div className="flex items-center gap-3">
          <div className={cn("p-1.5 rounded-lg", colorClass)}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono bg-white/50">{count}</Badge>
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </Link>
  );
}

// ─── Pending Actions Card ────────────────────────────────────────────────────
function PendingActionsCard({
  items,
  t,
}: {
  items: Array<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    count: number;
    href: string;
    colorClass: string;
  }>;
  t: (key: string) => string;
}) {
  const totalPending = items.reduce((s, i) => s + i.count, 0);
  return (
    <div className="glass-card p-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-base font-semibold">{t("dashboard.pending_actions")}</h3>
        {totalPending > 0 && (
          <Badge variant="destructive" className="ml-auto text-xs">{totalPending}</Badge>
        )}
      </div>
      {totalPending === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <CheckCircle2 className="w-8 h-8 mb-2 text-green-500" />
          <p className="text-sm font-medium">{t("dashboard.all_caught_up")}</p>
          <p className="text-xs mt-1">{t("dashboard.no_pending_tasks")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <ActionItem key={i} {...item} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Team Pulse Card ─────────────────────────────────────────────────────────
function TeamPulseCard({ t }: { t: (key: string) => string }) {
  const { data: events, isLoading } = trpc.adminDashboard.teamPulse.useQuery();

  const typeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; labelKey: string }> = {
    birthday: { icon: Cake, color: "text-pink-500 bg-pink-500/10", labelKey: "dashboard.team_birthday" },
    new_joiner: { icon: PartyPopper, color: "text-blue-500 bg-blue-500/10", labelKey: "dashboard.team_new_joiner" },
    anniversary: { icon: Award, color: "text-amber-500 bg-amber-500/10", labelKey: "dashboard.team_anniversary" },
    onboarding: { icon: UserPlus, color: "text-green-500 bg-green-500/10", labelKey: "dashboard.team_onboarding" },
  };

  return (
    <div className="glass-card p-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-base font-semibold">{t("dashboard.team_pulse")}</h3>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
        </div>
      ) : !events || events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Users className="w-8 h-8 mb-2 text-muted-foreground/50" />
          <p className="text-sm">{t("dashboard.team_no_events")}</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {events.map((event, i) => {
            const cfg = typeConfig[event.type] || typeConfig.new_joiner;
            const EventIcon = cfg.icon;
            return (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/30 border border-white/20">
                <div className={cn("p-1.5 rounded-lg shrink-0", cfg.color)}>
                  <EventIcon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{event.employeeName}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(cfg.labelKey)} · {event.country ? countryName(event.country) : ""} {event.detail ? `· ${event.detail}` : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Recent Activity Card ────────────────────────────────────────────────────
function RecentActivityCard({ t }: { t: (key: string) => string }) {
  const { data: logs, isLoading } = trpc.adminDashboard.recentActivity.useQuery({ limit: 10 });

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-base font-semibold">{t("dashboard.recent_activity")}</h3>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
        </div>
      ) : !logs || logs.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">{t("dashboard.no_recent_activity")}</p>
      ) : (
        <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/30 transition-colors">
              <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center shrink-0 mt-0.5">
                <Activity className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-medium">{log.userName || "System"}</span>{" "}
                  <span className="text-muted-foreground">
                    {formatActivitySummary({ action: log.action, entityType: log.entityType, changes: log.changes, userName: log.userName })}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(log.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SALES WORKSPACE
// ═══════════════════════════════════════════════════════════════════════════════
function SalesWorkspace({ t }: { t: (key: string) => string }) {
  const { data, isLoading } = trpc.adminDashboard.salesMetrics.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const pipeline = data?.pipeline ?? {};
  const quotationStats = data?.quotationStats ?? {};
  const staleLeads = data?.staleLeads ?? [];
  const recentLeads = data?.recentLeads ?? [];

  // Pipeline stages for funnel display
  const stages = [
    { key: "discovery", label: t("dashboard.sales_discovery"), color: "bg-slate-400" },
    { key: "leads", label: t("dashboard.sales_leads"), color: "bg-blue-400" },
    { key: "quotation_sent", label: t("dashboard.sales_quotation_sent"), color: "bg-indigo-400" },
    { key: "msa_sent", label: t("dashboard.sales_msa_sent"), color: "bg-purple-400" },
    { key: "msa_signed", label: t("dashboard.sales_msa_signed"), color: "bg-emerald-400" },
  ];

  const pendingQuotations = (quotationStats["draft"]?.count ?? 0) + (quotationStats["sent"]?.count ?? 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title={t("dashboard.sales_active_leads")}
          value={data?.totalActiveLeads ?? 0}
          icon={Target}
          href="/sales"
          accent="blue"
        />
        <StatCard
          title={t("dashboard.sales_pending_quotations")}
          value={pendingQuotations}
          icon={FileText}
          href="/quotations"
          accent="amber"
        />
        <StatCard
          title={t("dashboard.sales_closed_won")}
          value={pipeline["closed_won"] ?? 0}
          icon={HandshakeIcon}
          accent="green"
        />
        <StatCard
          title={t("dashboard.sales_stale_leads")}
          value={staleLeads.length}
          icon={AlertCircle}
          href="/sales"
          accent={staleLeads.length > 0 ? "red" : "default"}
          description={staleLeads.length > 0 ? t("dashboard.sales_needs_followup") : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Funnel */}
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            {t("dashboard.sales_pipeline")}
          </h3>
          <div className="space-y-3">
            {stages.map((stage) => {
              const cnt = pipeline[stage.key] ?? 0;
              const maxCount = Math.max(...stages.map(s => pipeline[s.key] ?? 0), 1);
              const pct = Math.max((cnt / maxCount) * 100, 4);
              return (
                <div key={stage.key} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-28 truncate">{stage.label}</span>
                  <div className="flex-1 h-7 bg-white/30 rounded-lg overflow-hidden relative">
                    <div
                      className={cn("h-full rounded-lg transition-all duration-500", stage.color)}
                      style={{ width: `${pct}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                      {cnt}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-muted-foreground" />
            {t("dashboard.sales_recent_leads")}
          </h3>
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {recentLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{t("dashboard.sales_no_leads")}</p>
            ) : (
              recentLeads.map((lead) => (
                <Link key={lead.id} href={`/sales?id=${lead.id}`}>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/30 border border-white/20 hover:bg-white/50 transition-colors cursor-pointer">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{lead.companyName}</p>
                      <p className="text-xs text-muted-foreground">{lead.contactName || "—"}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0 ml-2">
                      {formatStatusLabel(lead.status)}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AM (CUSTOMER MANAGER) WORKSPACE
// ═══════════════════════════════════════════════════════════════════════════════
function AmWorkspace({ t }: { t: (key: string) => string }) {
  const { data, isLoading } = trpc.adminDashboard.amMetrics.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const empStatus = data?.employeeStatus ?? {};
  const expiringContracts = data?.expiringContracts ?? [];
  const empByCountry = data?.employeesByCountry ?? [];

  // Pending action items for AM
  const actionItems = [
    {
      icon: UserPlus,
      label: t("dashboard.am_pending_onboarding"),
      count: data?.pendingOnboardingInvites ?? 0,
      href: "/onboarding",
      colorClass: "text-blue-500 bg-blue-500/10",
    },
    {
      icon: ClipboardList,
      label: t("dashboard.am_pending_review"),
      count: (empStatus["pending_review"] ?? 0) + (empStatus["documents_incomplete"] ?? 0),
      href: "/employees",
      colorClass: "text-amber-500 bg-amber-500/10",
    },
    {
      icon: AlertTriangle,
      label: t("dashboard.am_expiring_contracts"),
      count: expiringContracts.length,
      href: "/employees",
      colorClass: "text-red-500 bg-red-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title={t("dashboard.am_active_employees")}
          value={data?.totalActiveEmployees ?? 0}
          icon={Users}
          href="/employees"
          accent="blue"
        />
        <StatCard
          title={t("dashboard.am_active_contractors")}
          value={data?.totalActiveContractors ?? 0}
          icon={Briefcase}
          href="/contractors"
          accent="purple"
        />
        <StatCard
          title={t("dashboard.am_active_customers")}
          value={data?.activeCustomers ?? 0}
          icon={Building2}
          href="/customers"
          accent="green"
        />
        <StatCard
          title={t("dashboard.am_new_hires_month")}
          value={data?.newHiresThisMonth ?? 0}
          icon={UserPlus}
          accent="amber"
          description={t("dashboard.this_month")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Actions */}
        <PendingActionsCard items={actionItems} t={t} />

        {/* Employees by Country */}
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            {t("dashboard.am_employees_by_country")}
          </h3>
          <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
            {empByCountry.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{t("dashboard.am_no_employees")}</p>
            ) : (
              empByCountry.map((row) => {
                const maxCount = Math.max(...empByCountry.map(r => r.cnt), 1);
                const pct = Math.max((row.cnt / maxCount) * 100, 8);
                return (
                  <div key={row.country} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-24 truncate">
                      {countryName(row.country)}
                    </span>
                    <div className="flex-1 h-6 bg-white/30 rounded-md overflow-hidden relative">
                      <div
                        className="h-full bg-blue-400/60 rounded-md transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                        {row.cnt}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPS MANAGER WORKSPACE
// ═══════════════════════════════════════════════════════════════════════════════
function OpsWorkspace({ t }: { t: (key: string) => string }) {
  const { data, isLoading } = trpc.adminDashboard.opsMetrics.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const payroll = data?.payroll ?? {};
  const inv = data?.invoices ?? {};
  const vb = data?.vendorBills ?? {};

  const totalPayrollPending = (payroll["draft"] ?? 0) + (payroll["pending_approval"] ?? 0);
  const totalInvoicePending = (inv["draft"] ?? 0) + (inv["pending_review"] ?? 0);
  const totalVendorBillPending = (vb["draft"] ?? 0) + (vb["pending_approval"] ?? 0);
  const totalHRPending = (data?.pendingLeaves ?? 0) + (data?.pendingAdjustments ?? 0) + (data?.pendingReimbursements ?? 0);

  const actionItems = [
    {
      icon: DollarSign,
      label: `${t("dashboard.ops_payroll")} (${payroll["draft"] ?? 0} ${t("dashboard.ops_draft")}, ${payroll["pending_approval"] ?? 0} ${t("dashboard.ops_pending")})`,
      count: totalPayrollPending,
      href: "/payroll",
      colorClass: "text-blue-500 bg-blue-500/10",
    },
    {
      icon: FileText,
      label: `${t("dashboard.ops_invoices")} (${inv["draft"] ?? 0} ${t("dashboard.ops_draft")}, ${inv["pending_review"] ?? 0} ${t("dashboard.ops_pending")})`,
      count: totalInvoicePending,
      href: "/invoices",
      colorClass: "text-indigo-500 bg-indigo-500/10",
    },
    {
      icon: Package,
      label: `${t("dashboard.ops_vendor_bills")} (${vb["draft"] ?? 0} ${t("dashboard.ops_draft")}, ${vb["pending_approval"] ?? 0} ${t("dashboard.ops_pending")})`,
      count: totalVendorBillPending,
      href: "/vendor-bills",
      colorClass: "text-amber-500 bg-amber-500/10",
    },
    {
      icon: CalendarDays,
      label: t("dashboard.ops_pending_leaves"),
      count: data?.pendingLeaves ?? 0,
      href: "/leave",
      colorClass: "text-purple-500 bg-purple-500/10",
    },
    {
      icon: ArrowUpDown,
      label: t("dashboard.ops_pending_adjustments"),
      count: data?.pendingAdjustments ?? 0,
      href: "/adjustments",
      colorClass: "text-orange-500 bg-orange-500/10",
    },
    {
      icon: Receipt,
      label: t("dashboard.ops_pending_reimbursements"),
      count: data?.pendingReimbursements ?? 0,
      href: "/reimbursements",
      colorClass: "text-green-500 bg-green-500/10",
    },
    {
      icon: UserPlus,
      label: t("dashboard.ops_employee_reviews"),
      count: data?.pendingEmployeeReviews ?? 0,
      href: "/employees",
      colorClass: "text-cyan-500 bg-cyan-500/10",
    },
    {
      icon: Briefcase,
      label: t("dashboard.ops_contractor_reviews"),
      count: data?.pendingContractorReviews ?? 0,
      href: "/contractors",
      colorClass: "text-pink-500 bg-pink-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title={t("dashboard.ops_payroll_tasks")}
          value={totalPayrollPending}
          icon={DollarSign}
          href="/payroll"
          accent={totalPayrollPending > 0 ? "amber" : "green"}
        />
        <StatCard
          title={t("dashboard.ops_invoice_tasks")}
          value={totalInvoicePending}
          icon={FileText}
          href="/invoices"
          accent={totalInvoicePending > 0 ? "amber" : "green"}
        />
        <StatCard
          title={t("dashboard.ops_vendor_bill_tasks")}
          value={totalVendorBillPending}
          icon={Package}
          href="/vendor-bills"
          accent={totalVendorBillPending > 0 ? "amber" : "green"}
        />
        <StatCard
          title={t("dashboard.ops_hr_tasks")}
          value={totalHRPending}
          icon={Users}
          accent={totalHRPending > 0 ? "amber" : "green"}
          description={`${t("dashboard.ops_leave_adj_reimb")}`}
        />
      </div>

      {/* All Action Items */}
      <PendingActionsCard items={actionItems} t={t} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FINANCE WORKSPACE
// ═══════════════════════════════════════════════════════════════════════════════
function FinanceWorkspace({ t }: { t: (key: string) => string }) {
  const { data, isLoading } = trpc.adminDashboard.financeMetrics.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const ar = data?.accountsReceivable ?? {};
  const ap = data?.accountsPayable ?? {};
  const overdueInvoices = data?.overdueInvoices ?? [];

  // Calculate totals
  const totalAR = Object.values(ar).reduce((s, v) => s + parseFloat(v.amount || "0"), 0);
  const totalARCount = Object.values(ar).reduce((s, v) => s + v.count, 0);
  const totalAP = Object.values(ap).reduce((s, v) => s + parseFloat(v.amount || "0"), 0);
  const totalAPCount = Object.values(ap).reduce((s, v) => s + v.count, 0);

  const actionItems = [
    {
      icon: CircleDollarSign,
      label: `${t("dashboard.fin_unpaid_invoices")} (${formatCurrencyCompact(totalAR)})`,
      count: totalARCount,
      href: "/invoices",
      colorClass: "text-blue-500 bg-blue-500/10",
    },
    {
      icon: CreditCard,
      label: `${t("dashboard.fin_unsettled_bills")} (${formatCurrencyCompact(totalAP)})`,
      count: totalAPCount,
      href: "/vendor-bills",
      colorClass: "text-amber-500 bg-amber-500/10",
    },
    {
      icon: AlertTriangle,
      label: t("dashboard.fin_overdue_invoices"),
      count: overdueInvoices.length,
      href: "/invoices",
      colorClass: "text-red-500 bg-red-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title={t("dashboard.fin_accounts_receivable")}
          value={formatCurrencyCompact(totalAR)}
          icon={CircleDollarSign}
          href="/invoices"
          accent={totalAR > 0 ? "blue" : "green"}
          description={`${totalARCount} ${t("dashboard.fin_invoices")}`}
        />
        <StatCard
          title={t("dashboard.fin_accounts_payable")}
          value={formatCurrencyCompact(totalAP)}
          icon={CreditCard}
          href="/vendor-bills"
          accent={totalAP > 0 ? "amber" : "green"}
          description={`${totalAPCount} ${t("dashboard.fin_bills")}`}
        />
        <StatCard
          title={t("dashboard.fin_collected_month")}
          value={formatCurrencyCompact(data?.settledThisMonth?.totalCollected ?? "0")}
          icon={TrendingUp}
          accent="green"
          description={`${data?.settledThisMonth?.invoiceCount ?? 0} ${t("dashboard.fin_invoices")}`}
        />
        <StatCard
          title={t("dashboard.fin_wallet_balance")}
          value={formatCurrencyCompact(data?.walletBalance ?? "0")}
          icon={Wallet}
          accent="purple"
          description={`${data?.walletCount ?? 0} ${t("dashboard.fin_wallets")} · ${t("dashboard.fin_frozen")}: ${formatCurrencyCompact(data?.frozenBalance ?? "0")}`}
        />
      </div>

      {/* Cost & Profit KPI Cards - Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title={t("dashboard.total_settled_cost")}
          value={formatCurrencyCompact(data?.vendorPaidThisMonth?.totalSettled ?? "0")}
          icon={TrendingDown}
          href="/vendor-bills"
          accent={parseFloat(data?.vendorPaidThisMonth?.totalSettled ?? "0") > 0 ? "red" : "default"}
          description={`${data?.vendorPaidThisMonth?.billCount ?? 0} ${t("dashboard.fin_bills")}`}
        />
        <StatCard
          title={t("dashboard.bank_fees")}
          value={formatCurrencyCompact(data?.vendorPaidThisMonth?.totalBankFees ?? "0")}
          icon={Landmark}
          accent="default"
          description={t("dashboard.bank_fees_desc")}
        />
        <StatCard
          title={t("dashboard.estimated_net_profit")}
          value={formatCurrencyCompact(
            String(
              parseFloat(data?.settledThisMonth?.totalCollected ?? "0")
              - parseFloat(data?.vendorPaidThisMonth?.totalSettled ?? "0")
              - parseFloat(data?.vendorPaidThisMonth?.totalBankFees ?? "0")
            )
          )}
          icon={TrendingUp}
          accent={
            parseFloat(data?.settledThisMonth?.totalCollected ?? "0")
            - parseFloat(data?.vendorPaidThisMonth?.totalSettled ?? "0")
            - parseFloat(data?.vendorPaidThisMonth?.totalBankFees ?? "0") >= 0
              ? "green" : "red"
          }
          description={t("dashboard.estimated_net_profit_desc")}
        />
        <StatCard
          title={t("dashboard.unsettled_bills")}
          value={formatCurrencyCompact(totalAP)}
          icon={Clock}
          href="/vendor-bills"
          accent={totalAP > 0 ? "amber" : "default"}
          description={t("dashboard.unsettled_bills_desc")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Actions */}
        <PendingActionsCard items={actionItems} t={t} />

        {/* Overdue Invoices */}
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            {t("dashboard.fin_overdue_list")}
          </h3>
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {overdueInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 mb-2 text-green-500" />
                <p className="text-sm">{t("dashboard.fin_no_overdue")}</p>
              </div>
            ) : (
              overdueInvoices.map((inv) => (
                <Link key={inv.id} href={`/invoices?id=${inv.id}`}>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/30 border border-red-200/40 hover:bg-white/50 transition-colors cursor-pointer">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{inv.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">{t("dashboard.fin_due")}: {formatDate(inv.dueDate)}</p>
                    </div>
                    <span className="text-sm font-semibold text-red-600 shrink-0 ml-2">
                      {inv.currency} {formatCurrencyCompact(inv.total)}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM HEALTH CARD — Admin only
// ═══════════════════════════════════════════════════════════════════════════════
type HealthSeverity = "critical" | "warning" | "ok";

function HealthIndicator({ severity, count, label, children }: {
  severity: HealthSeverity;
  count: number;
  label: string;
  children?: React.ReactNode;
}) {
  const colors = {
    critical: "bg-red-100 text-red-700 border-red-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    ok: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  const dotColors = {
    critical: "bg-red-500",
    warning: "bg-amber-500",
    ok: "bg-emerald-500",
  };
  return (
    <div className={cn("rounded-lg border p-3", colors[severity])}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full", dotColors[severity])} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <Badge variant={severity === "ok" ? "outline" : "destructive"} className="text-xs">
          {count}
        </Badge>
      </div>
      {children && count > 0 && (
        <div className="mt-2 text-xs space-y-1 max-h-32 overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  );
}

function SystemHealthCard({ t }: { t: (key: string) => string }) {
  const { data, isLoading } = trpc.adminDashboard.systemHealth.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <HeartPulse className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold">{t("dashboard.health_title")}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const orphanCount = data.orphanEmployees.length;
  const missingBillingCount = data.customersMissingBillingEntity.length;
  const missingPricingCount = data.customersMissingPricing.length;
  const countryIssueCount = data.countriesMissingRate.length + data.unmappedCountries.length;
  const expiredEmpContractCount = data.expiredEmployeeContracts.length;
  const expiredCtrContractCount = data.expiredContractorContracts.length;
  const staleDraftTotal = data.staleDrafts.payrolls + data.staleDrafts.invoices + data.staleDrafts.vendorBills;
  const negativeWalletCount = data.negativeWallets.length;
  const expiredInviteCount = data.expiredInvitesCount;

  const totalIssues = orphanCount + missingBillingCount + missingPricingCount + countryIssueCount
    + expiredEmpContractCount + expiredCtrContractCount + staleDraftTotal + negativeWalletCount + expiredInviteCount;

  const overallSeverity: HealthSeverity = (orphanCount > 0 || missingBillingCount > 0 || negativeWalletCount > 0)
    ? "critical"
    : totalIssues > 0 ? "warning" : "ok";

  const overallColors = {
    critical: "border-red-200 bg-red-50/50",
    warning: "border-amber-200 bg-amber-50/30",
    ok: "border-emerald-200 bg-emerald-50/30",
  };

  return (
    <div className={cn("glass-card p-6 border", overallColors[overallSeverity])}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HeartPulse className={cn("w-5 h-5", overallSeverity === "ok" ? "text-emerald-500" : overallSeverity === "critical" ? "text-red-500" : "text-amber-500")} />
          <h3 className="font-semibold">{t("dashboard.health_title")}</h3>
        </div>
        <Badge variant={overallSeverity === "ok" ? "outline" : "destructive"} className="text-xs">
          {totalIssues === 0 ? t("dashboard.health_all_clear") : `${totalIssues} ${t("dashboard.health_issues")}`}
        </Badge>
      </div>

      {totalIssues === 0 ? (
        <div className="flex items-center justify-center py-6 text-emerald-600">
          <CheckCircle2 className="w-8 h-8 mr-3" />
          <span className="text-lg font-medium">{t("dashboard.health_all_good")}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* 1. Orphan Employees */}
          <HealthIndicator
            severity={orphanCount > 0 ? "critical" : "ok"}
            count={orphanCount}
            label={t("dashboard.health_orphan_employees")}
          >
            {data.orphanEmployees.slice(0, 5).map(e => (
              <div key={e.id} className="flex justify-between">
                <span>{e.name}</span>
                <span className="opacity-70">{e.customerStatus === "terminated" ? t("dashboard.health_customer_terminated") : t("dashboard.health_customer_missing")}</span>
              </div>
            ))}
            {orphanCount > 5 && <div className="opacity-60">+{orphanCount - 5} more...</div>}
          </HealthIndicator>

          {/* 2. Missing Billing Entity */}
          <HealthIndicator
            severity={missingBillingCount > 0 ? "critical" : "ok"}
            count={missingBillingCount}
            label={t("dashboard.health_missing_billing")}
          >
            {data.customersMissingBillingEntity.slice(0, 5).map(c => (
              <div key={c.id}>{c.companyName}</div>
            ))}
            {missingBillingCount > 5 && <div className="opacity-60">+{missingBillingCount - 5} more...</div>}
          </HealthIndicator>

          {/* 3. Missing Pricing */}
          <HealthIndicator
            severity={missingPricingCount > 0 ? "warning" : "ok"}
            count={missingPricingCount}
            label={t("dashboard.health_missing_pricing")}
          >
            {data.customersMissingPricing.slice(0, 5).map(c => (
              <div key={c.id}>{c.companyName}</div>
            ))}
            {missingPricingCount > 5 && <div className="opacity-60">+{missingPricingCount - 5} more...</div>}
          </HealthIndicator>

          {/* 4. Country Config Issues */}
          <HealthIndicator
            severity={countryIssueCount > 0 ? "warning" : "ok"}
            count={countryIssueCount}
            label={t("dashboard.health_country_issues")}
          >
            {data.countriesMissingRate.map(c => (
              <div key={c.countryCode}>{c.countryName} — {t("dashboard.health_no_rate")}</div>
            ))}
            {data.unmappedCountries.map(c => (
              <div key={c.country}>{c.country} — {c.employeeCount} {t("dashboard.health_unmapped")}</div>
            ))}
          </HealthIndicator>

          {/* 5. Expired Employee Contracts */}
          <HealthIndicator
            severity={expiredEmpContractCount > 0 ? "warning" : "ok"}
            count={expiredEmpContractCount}
            label={t("dashboard.health_expired_emp_contracts")}
          >
            {data.expiredEmployeeContracts.slice(0, 5).map(c => (
              <div key={c.id} className="flex justify-between">
                <span>{c.employeeName}</span>
                <span className="opacity-70">{c.expiryDate}</span>
              </div>
            ))}
            {expiredEmpContractCount > 5 && <div className="opacity-60">+{expiredEmpContractCount - 5} more...</div>}
          </HealthIndicator>

          {/* 6. Expired Contractor Contracts */}
          <HealthIndicator
            severity={expiredCtrContractCount > 0 ? "warning" : "ok"}
            count={expiredCtrContractCount}
            label={t("dashboard.health_expired_ctr_contracts")}
          >
            {data.expiredContractorContracts.slice(0, 5).map(c => (
              <div key={c.id} className="flex justify-between">
                <span>{c.contractorName}</span>
                <span className="opacity-70">{c.expiryDate}</span>
              </div>
            ))}
            {expiredCtrContractCount > 5 && <div className="opacity-60">+{expiredCtrContractCount - 5} more...</div>}
          </HealthIndicator>

          {/* 7. Stale Drafts */}
          <HealthIndicator
            severity={staleDraftTotal > 0 ? "warning" : "ok"}
            count={staleDraftTotal}
            label={t("dashboard.health_stale_drafts")}
          >
            {data.staleDrafts.payrolls > 0 && (
              <div>{t("dashboard.ops_payroll")}: {data.staleDrafts.payrolls}</div>
            )}
            {data.staleDrafts.invoices > 0 && (
              <div>{t("dashboard.ops_invoices")}: {data.staleDrafts.invoices}</div>
            )}
            {data.staleDrafts.vendorBills > 0 && (
              <div>{t("dashboard.ops_vendor_bills")}: {data.staleDrafts.vendorBills}</div>
            )}
          </HealthIndicator>

          {/* 8. Negative Wallets */}
          <HealthIndicator
            severity={negativeWalletCount > 0 ? "critical" : "ok"}
            count={negativeWalletCount}
            label={t("dashboard.health_negative_wallets")}
          >
            {data.negativeWallets.slice(0, 5).map(w => (
              <div key={w.id} className="flex justify-between">
                <span>{w.companyName}</span>
                <span className="font-mono text-red-600">{w.currency} {w.balance}</span>
              </div>
            ))}
            {negativeWalletCount > 5 && <div className="opacity-60">+{negativeWalletCount - 5} more...</div>}
          </HealthIndicator>

          {/* 9. Expired Onboarding Invites */}
          <HealthIndicator
            severity={expiredInviteCount > 0 ? "warning" : "ok"}
            count={expiredInviteCount}
            label={t("dashboard.health_expired_invites")}
          />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const { data: greeting } = trpc.adminDashboard.greeting.useQuery();

  const userRole = user?.role ?? "user";
  const isAdminUser = isAdmin(userRole);

  // Determine which workspaces to show
  const showSales = isAdminUser || hasAnyRole(userRole, ["sales"]);
  const showAM = isAdminUser || hasAnyRole(userRole, ["customer_manager"]);
  const showOps = isAdminUser || hasAnyRole(userRole, ["operations_manager"]);
  const showFinance = isAdminUser || hasAnyRole(userRole, ["finance_manager"]);

  // Greeting text
  const greetingText = useMemo(() => {
    if (!greeting) return "";
    return locale === "zh" ? greeting.zh : greeting.en;
  }, [greeting, locale]);

  return (
    <Layout>
      <div className="p-6 space-y-8 pb-8 page-enter">
        {/* ─── Greeting Header ─── */}
        <div className="glass-card p-6">
          <h1 className="text-2xl font-bold tracking-tight">
            {greetingText || `${t("dashboard.welcome")}, ${user?.name?.split(" ")[0] || ""}!`}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* ─── Sales Workspace ─── */}
        {showSales && (
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              {t("dashboard.workspace_sales")}
            </h2>
            <SalesWorkspace t={t} />
          </section>
        )}

        {/* ─── AM Workspace ─── */}
        {showAM && (
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              {t("dashboard.workspace_am")}
            </h2>
            <AmWorkspace t={t} />
          </section>
        )}

        {/* ─── Ops Workspace ─── */}
        {showOps && (
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              {t("dashboard.workspace_ops")}
            </h2>
            <OpsWorkspace t={t} />
          </section>
        )}

        {/* ─── Finance Workspace ─── */}
        {showFinance && (
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-purple-500" />
              {t("dashboard.workspace_finance")}
            </h2>
            <FinanceWorkspace t={t} />
          </section>
        )}

        {/* ─── System Health (Admin only) ─── */}
        {isAdminUser && (
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-red-500" />
              {t("dashboard.workspace_health")}
            </h2>
            <SystemHealthCard t={t} />
          </section>
        )}

        {/* ─── Team Pulse + Recent Activity ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TeamPulseCard t={t} />
          <RecentActivityCard t={t} />
        </div>
      </div>
    </Layout>
  );
}
