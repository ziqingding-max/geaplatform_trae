/**
 * Portal Dashboard — Role-based Workspace (Apple Liquid Glass Design)
 *
 * Mirrors the Admin Dashboard architecture with role-specific workspaces:
 *   - HR Workspace (admin, hr_manager): Onboarding, leave, adjustments, team pulse, contracts
 *   - Finance Workspace (admin, finance): Invoices, wallet, reimbursements
 *   - Overview (all roles): KPI cards, employee map, status chart, payroll trend
 *   - Viewer: Read-only overview with limited data
 *
 * All surfaces use backdrop-blur and semi-transparent backgrounds (glass morphism).
 */

import { useMemo } from "react";
import PortalLayout from "@/components/PortalLayout";
import { portalPath } from "@/lib/portalBasePath";
import WorldMap from "@/components/WorldMap";
import { formatStatusLabel, formatCurrency, countryName } from "@/lib/format";
import { portalTrpc } from "@/lib/portalTrpc";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  Users, Globe, Clock, AlertCircle, ArrowUpDown, CalendarDays,
  Receipt, UserPlus, CheckCircle2, MapPin, TrendingUp,
  DollarSign, Activity, ArrowRight, Settings,
  Star, Cake, Award, PartyPopper, Wallet,
  FileWarning, ShieldCheck, AlertTriangle,
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

// ─── Types ──────────────────────────────────────────────────────────────────
type PortalRole = "admin" | "hr_manager" | "finance" | "viewer";

// ─── Glass KPI Card ─────────────────────────────────────────────────────────
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

// ─── Action Item Row ────────────────────────────────────────────────────────
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

// ─── Pending Actions Card ───────────────────────────────────────────────────
function PendingActionsCard({
  title,
  items,
  t,
}: {
  title: string;
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
        <h3 className="text-base font-semibold">{title}</h3>
        {totalPending > 0 && (
          <Badge variant="destructive" className="ml-auto text-xs">{totalPending}</Badge>
        )}
      </div>
      {totalPending === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <CheckCircle2 className="w-8 h-8 mb-2 text-green-500" />
          <p className="text-sm font-medium">{t("portal_dashboard.action_items.all_caught_up")}</p>
          <p className="text-xs mt-1">{t("portal_dashboard.action_items.no_pending_actions")}</p>
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

// ─── Team Pulse Card ────────────────────────────────────────────────────────
function TeamPulseCard({ t }: { t: (key: string) => string }) {
  const { data: events, isLoading } = portalTrpc.dashboard.teamPulse.useQuery();

  const typeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; labelKey: string }> = {
    birthday: { icon: Cake, color: "text-pink-500 bg-pink-500/10", labelKey: "portal_dashboard.team_birthday" },
    new_joiner: { icon: PartyPopper, color: "text-blue-500 bg-blue-500/10", labelKey: "portal_dashboard.team_new_joiner" },
    anniversary: { icon: Award, color: "text-amber-500 bg-amber-500/10", labelKey: "portal_dashboard.team_anniversary" },
    onboarding: { icon: UserPlus, color: "text-green-500 bg-green-500/10", labelKey: "portal_dashboard.team_onboarding" },
  };

  return (
    <div className="glass-card p-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-base font-semibold">{t("portal_dashboard.team_pulse")}</h3>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
        </div>
      ) : !events || events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Users className="w-8 h-8 mb-2 text-muted-foreground/50" />
          <p className="text-sm">{t("portal_dashboard.team_no_events")}</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {events.map((event: any, i: number) => {
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

// ─── Expiring Contracts Card ────────────────────────────────────────────────
function ExpiringContractsCard({ t }: { t: (key: string) => string }) {
  const { data: hrMetrics } = portalTrpc.dashboard.hrMetrics.useQuery();
  const contracts = hrMetrics?.expiringContracts ?? [];

  return (
    <div className="glass-card p-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        <FileWarning className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-base font-semibold">{t("portal_dashboard.expiring_contracts")}</h3>
      </div>
      {contracts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <ShieldCheck className="w-8 h-8 mb-2 text-green-500" />
          <p className="text-sm">{t("portal_dashboard.no_expiring_contracts")}</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
          {contracts.map((c: any, i: number) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/30 border border-white/20">
              <div className={cn("p-1.5 rounded-lg shrink-0", c.type === "employee" ? "text-blue-500 bg-blue-500/10" : "text-purple-500 bg-purple-500/10")}>
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {c.type === "employee" ? "EOR" : "Contractor"} · {c.country ? countryName(c.country) : ""}
                </p>
              </div>
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 shrink-0">
                {t("portal_dashboard.expires")} {c.expiryDate?.slice(5)}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Upcoming Holidays Card ─────────────────────────────────────────────────
function UpcomingHolidaysCard({ t }: { t: (key: string) => string }) {
  const { data: hrMetrics } = portalTrpc.dashboard.hrMetrics.useQuery();
  const holidays = hrMetrics?.upcomingHolidays ?? [];

  return (
    <div className="glass-card p-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-base font-semibold">{t("portal_dashboard.upcoming_holidays")}</h3>
      </div>
      {holidays.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <CalendarDays className="w-8 h-8 mb-2 text-muted-foreground/50" />
          <p className="text-sm">{t("portal_dashboard.no_upcoming_holidays")}</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
          {holidays.map((h: any, i: number) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/30 border border-white/20">
              <div className="p-1.5 rounded-lg shrink-0 text-purple-500 bg-purple-500/10">
                <CalendarDays className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{h.holidayName}</p>
                <p className="text-xs text-muted-foreground">
                  {h.countryCode ? countryName(h.countryCode) : ""} · {h.holidayDate}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Wallet Overview Card ───────────────────────────────────────────────────
function WalletOverviewCard({ t }: { t: (key: string) => string }) {
  const { data: financeMetrics } = portalTrpc.dashboard.financeMetrics.useQuery();
  const wallets = financeMetrics?.wallets ?? [];
  const frozenWallets = financeMetrics?.frozenWallets ?? [];

  return (
    <div className="glass-card p-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-base font-semibold">{t("portal_dashboard.wallet_balance")}</h3>
      </div>
      {wallets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Wallet className="w-8 h-8 mb-2 text-muted-foreground/50" />
          <p className="text-sm">No wallet configured</p>
        </div>
      ) : (
        <div className="space-y-3">
          {wallets.map((w: any) => {
            const frozen = frozenWallets.find((f: any) => f.currency === w.currency);
            return (
              <Link key={w.id} href={portalPath("/wallet")}>
                <div className="p-3 rounded-xl bg-white/40 border border-white/30 hover:bg-white/60 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">{w.currency} {t("portal_dashboard.wallet_balance")}</p>
                      <p className="text-xl font-bold mt-1">{formatCurrency(w.currency, w.balance)}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {frozen && parseFloat(frozen.balance) > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("portal_dashboard.wallet_frozen")}: {formatCurrency(frozen.currency, frozen.balance)}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Overdue Invoices Card ──────────────────────────────────────────────────
function OverdueInvoicesCard({ t }: { t: (key: string) => string }) {
  const { data: financeMetrics } = portalTrpc.dashboard.financeMetrics.useQuery();
  const overdueList = financeMetrics?.overdueInvoices ?? [];

  return (
    <div className="glass-card p-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-red-500" />
        <h3 className="text-base font-semibold">{t("portal_dashboard.overdue_invoices")}</h3>
        {overdueList.length > 0 && (
          <Badge variant="destructive" className="ml-auto text-xs">{overdueList.length}</Badge>
        )}
      </div>
      {overdueList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <CheckCircle2 className="w-8 h-8 mb-2 text-green-500" />
          <p className="text-sm">{t("portal_dashboard.no_overdue_invoices")}</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
          {overdueList.map((inv: any) => (
            <Link key={inv.id} href={portalPath(`/invoices/${inv.id}`)}>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-red-50/50 border border-red-100 hover:bg-red-50 transition-all cursor-pointer group">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{inv.invoiceNumber || `INV-${inv.id}`}</p>
                  <p className="text-xs text-muted-foreground">Due: {inv.dueDate}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-red-600">{formatCurrency(inv.currency, inv.total)}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Employee Map ───────────────────────────────────────────────────────────
function EmployeeMapCard() {
  const { t } = useI18n();
  const { data: countryData, isLoading } = portalTrpc.dashboard.employeesByCountry.useQuery();

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-base font-semibold">{t("portal_dashboard.global_workforce.title")}</h3>
        </div>
        <Skeleton className="h-[250px] w-full rounded-lg" />
      </div>
    );
  }

  const mapData = (countryData ?? []).map((c) => ({
    countryCode: c.countryCode,
    countryName: c.countryName,
    employeeCount: c.employeeCount,
  }));

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-base font-semibold">{t("portal_dashboard.global_workforce.title")}</h3>
      </div>
      {mapData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <MapPin className="w-8 h-8 mb-2" />
          <p className="text-sm font-medium">{t("portal_dashboard.global_workforce.no_employees_yet")}</p>
          <p className="text-xs mt-1">{t("portal_dashboard.global_workforce.start_onboarding")}</p>
        </div>
      ) : (
        <WorldMap data={mapData} />
      )}
    </div>
  );
}

// ─── Payroll Trend Chart (Bar Chart) ────────────────────────────────────────
const payrollChartConfig: ChartConfig = {
  totalGross: { label: "Gross Pay", color: "oklch(0.55 0.18 250)" },
  totalNet: { label: "Net Pay", color: "oklch(0.6 0.18 160)" },
  totalEmployerCost: { label: "Employer Cost", color: "oklch(0.65 0.15 60)" },
};

function PayrollTrendCard() {
  const { t } = useI18n();
  const { data: trendData, isLoading } = portalTrpc.dashboard.payrollTrend.useQuery();

  const chartData = useMemo(() => {
    if (!trendData) return [];
    return trendData.map((d) => ({
      month: d.month ? new Date(d.month).toLocaleDateString(undefined, { month: "short", year: "2-digit" }) : "",
      totalGross: Number(d.totalGross) || 0,
      totalNet: Number(d.totalNet) || 0,
      totalEmployerCost: Number(d.totalEmployerCost) || 0,
    }));
  }, [trendData]);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-base font-semibold">{t("portal_dashboard.payroll_trend.title")}</h3>
      </div>
      {isLoading ? (
        <Skeleton className="h-[280px] w-full rounded-lg" />
      ) : chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <DollarSign className="w-8 h-8 mb-2" />
          <p className="text-sm font-medium">{t("portal_dashboard.payroll_trend.no_payroll_data_yet")}</p>
          <p className="text-xs mt-1">{t("portal_dashboard.payroll_trend.first_approved_run")}</p>
        </div>
      ) : (
        <ChartContainer config={payrollChartConfig} className="h-[280px] w-full">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
              }
            />
            <Bar dataKey="totalGross" fill="oklch(0.55 0.18 250)" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar dataKey="totalNet" fill="oklch(0.6 0.18 160)" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar dataKey="totalEmployerCost" fill="oklch(0.65 0.15 60)" radius={[4, 4, 0, 0]} barSize={20} />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}

// ─── Employee Status Distribution ───────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  active: "#22c55e",
  onboarding: "#3b82f6",
  pending_review: "#f59e0b",
  documents_incomplete: "#f43f5e",
  offboarding: "#ef4444",
  terminated: "#6b7280",
  inactive: "#9ca3af",
};

function EmployeeStatusCard() {
  const { t } = useI18n();
  const { data: statusData, isLoading } = portalTrpc.dashboard.employeeStatusDistribution.useQuery();

  const chartData = useMemo(() => {
    if (!statusData) return [];
    return statusData.map((d) => ({
      name: t(`portal_dashboard.status.${d.status}`) || formatStatusLabel(d.status),
      value: d.count,
      color: STATUS_COLORS[d.status] || "#6b7280",
    }));
  }, [statusData, t]);

  const totalEmployees = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="glass-card p-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-base font-semibold">{t("portal_dashboard.employee_status.title")}</h3>
      </div>
      {isLoading ? (
        <Skeleton className="h-[200px] w-full rounded-lg" />
      ) : chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Users className="w-8 h-8 mb-2" />
          <p className="text-sm font-medium">{t("portal_dashboard.global_workforce.no_employees_yet")}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-full h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center -mt-[110px] mb-[50px]">
            <p className="text-2xl font-bold">{totalEmployees}</p>
            <p className="text-xs text-muted-foreground">{t("portal_dashboard.employee_status.total")}</p>
          </div>
          <div className="w-full space-y-1.5 mt-2">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Recent Activity ────────────────────────────────────────────────────────
function RecentActivityCard() {
  const { t } = useI18n();
  const { data: activities, isLoading } = portalTrpc.dashboard.recentActivity.useQuery();

  const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    employee: Users,
    adjustment: ArrowUpDown,
    leave: CalendarDays,
    invoice: Receipt,
    reimbursement: DollarSign,
  };

  const typeColors: Record<string, string> = {
    employee: "bg-blue-500/10 text-blue-600",
    adjustment: "bg-amber-500/10 text-amber-600",
    leave: "bg-purple-500/10 text-purple-600",
    invoice: "bg-red-500/10 text-red-600",
    reimbursement: "bg-green-500/10 text-green-600",
  };

  const statusBadgeColors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    onboarding: "bg-blue-100 text-blue-700",
    pending_review: "bg-yellow-100 text-yellow-700",
    submitted: "bg-blue-100 text-blue-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    locked: "bg-gray-100 text-gray-700",
    terminated: "bg-gray-100 text-gray-600",
    sent: "bg-blue-100 text-blue-700",
    overdue: "bg-red-100 text-red-700",
    paid: "bg-green-100 text-green-700",
  };

  const typeLabels: Record<string, string> = {
    employee: t("portal_dashboard.recent_activity.employee"),
    adjustment: t("portal_dashboard.recent_activity.adjustment"),
    leave: t("portal_dashboard.recent_activity.leave"),
    invoice: t("portal_dashboard.recent_activity.invoice"),
    reimbursement: t("portal_dashboard.recent_activity.reimbursement"),
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-base font-semibold">{t("portal_dashboard.recent_activity.title")}</h3>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : !activities || activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Activity className="w-8 h-8 mb-2" />
          <p className="text-sm font-medium">{t("portal_dashboard.recent_activity.no_recent_activity")}</p>
        </div>
      ) : (
        <div className="space-y-1">
          {activities.slice(0, 10).map((item: any, idx: number) => {
            const Icon = typeIcons[item.type] || AlertCircle;
            return (
              <div key={`${item.type}-${item.id}-${idx}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/40 transition-colors duration-200">
                <div className={cn("p-1.5 rounded-lg", typeColors[item.type] || "bg-muted text-muted-foreground")}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {typeLabels[item.type] || item.type}
                    {" · "}
                    {new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </p>
                </div>
                <Badge variant="outline" className={cn("text-xs", statusBadgeColors[item.status] || "")}>
                  {formatStatusLabel(item.status)}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HR WORKSPACE — visible to admin & hr_manager
// ═══════════════════════════════════════════════════════════════════════════════
function HrWorkspace({ stats, t }: { stats: any; t: (key: string) => string }) {
  const { data: hrMetrics, isLoading } = portalTrpc.dashboard.hrMetrics.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-40 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold">{t("portal_dashboard.hr_workspace")}</h3>
      </div>

      {/* HR KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title={t("portal_dashboard.kpi.eor_employees")}
          value={stats?.activeEorEmployees ?? 0}
          icon={Users}
          accent="blue"
          description={t("portal_dashboard.kpi.eor_employees_desc")}
          href={portalPath("/employees")}
        />
        <StatCard
          title={t("portal_dashboard.kpi.active_contractors")}
          value={stats?.activeContractors ?? 0}
          icon={Users}
          accent="purple"
          description={t("portal_dashboard.kpi.active_contractors_desc")}
          href={portalPath("/contractors")}
        />
        <StatCard
          title={t("portal_dashboard.new_hires_this_month")}
          value={hrMetrics?.newHiresThisMonth ?? 0}
          icon={UserPlus}
          accent="green"
          description={t("portal_dashboard.new_hires_desc")}
        />
        <StatCard
          title={t("portal_dashboard.kpi.pending_onboarding")}
          value={stats?.pendingOnboarding ?? 0}
          icon={UserPlus}
          accent="amber"
          description={t("portal_dashboard.kpi.pending_onboarding_desc")}
          href={portalPath("/onboarding")}
        />
      </div>

      {/* HR Pending Actions + Team Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PendingActionsCard
            title={t("portal_dashboard.hr_pending_actions")}
            items={[
              {
                icon: UserPlus,
                label: t("portal_dashboard.pending_tasks.onboarding_in_progress"),
                count: stats?.pendingOnboarding ?? 0,
                href: portalPath("/onboarding"),
                colorClass: "text-blue-500 bg-blue-500/10",
              },
              {
                icon: CalendarDays,
                label: t("portal_dashboard.pending_tasks.leave_requests"),
                count: stats?.pendingLeave ?? 0,
                href: portalPath("/leave"),
                colorClass: "text-purple-500 bg-purple-500/10",
              },
              {
                icon: ArrowUpDown,
                label: t("portal_dashboard.pending_tasks.pending_adjustments"),
                count: stats?.pendingAdjustments ?? 0,
                href: portalPath("/adjustments"),
                colorClass: "text-amber-500 bg-amber-500/10",
              },
              {
                icon: Settings,
                label: t("portal_dashboard.pending_tasks.leave_policy_setup"),
                count: stats?.unconfiguredLeavePolicyCountries ?? 0,
                href: portalPath("/settings"),
                colorClass: "text-emerald-500 bg-emerald-500/10",
              },
            ]}
            t={t}
          />
        </div>
        <div className="lg:col-span-1">
          <TeamPulseCard t={t} />
        </div>
        <div className="lg:col-span-1">
          <ExpiringContractsCard t={t} />
        </div>
      </div>

      {/* Upcoming Holidays */}
      <UpcomingHolidaysCard t={t} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FINANCE WORKSPACE — visible to admin & finance
// ═══════════════════════════════════════════════════════════════════════════════
function FinanceWorkspace({ stats, t }: { stats: any; t: (key: string) => string }) {
  const { data: financeMetrics, isLoading } = portalTrpc.dashboard.financeMetrics.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-40 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const totalOutstanding = financeMetrics?.totalOutstanding ?? "0";
  const totalOutstandingCount = financeMetrics?.totalOutstandingCount ?? 0;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-green-500" />
        <h3 className="text-lg font-semibold">{t("portal_dashboard.finance_workspace")}</h3>
      </div>

      {/* Finance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title={t("portal_dashboard.total_outstanding")}
          value={formatCurrency("USD", totalOutstanding)}
          icon={Receipt}
          accent={totalOutstandingCount > 0 ? "amber" : "green"}
          description={t("portal_dashboard.total_outstanding_desc").replace("{count}", String(totalOutstandingCount))}
          href={portalPath("/invoices")}
        />
        <StatCard
          title={t("portal_dashboard.overdue_invoices")}
          value={stats?.overdueInvoices ?? 0}
          icon={AlertTriangle}
          accent={(stats?.overdueInvoices ?? 0) > 0 ? "red" : "green"}
          description={(stats?.overdueInvoices ?? 0) > 0 ? t("portal_dashboard.overdue_invoices_desc") : t("portal_dashboard.no_overdue_invoices")}
          href={portalPath("/invoices")}
        />
        <StatCard
          title={t("portal_dashboard.kpi.unpaid_invoices")}
          value={stats?.unpaidInvoices ?? 0}
          icon={Receipt}
          accent="blue"
          description={t("portal_dashboard.kpi.awaiting_payment")}
          href={portalPath("/invoices")}
        />
      </div>

      {/* Finance Pending Actions + Wallet + Overdue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PendingActionsCard
            title={t("portal_dashboard.finance_pending_actions")}
            items={[
              {
                icon: Receipt,
                label: t("portal_dashboard.pending_tasks.unpaid_invoices"),
                count: (stats?.unpaidInvoices ?? 0) + (stats?.overdueInvoices ?? 0),
                href: portalPath("/invoices"),
                colorClass: "text-red-500 bg-red-500/10",
              },
              {
                icon: DollarSign,
                label: t("portal_dashboard.pending_tasks.pending_reimbursements"),
                count: stats?.pendingReimbursements ?? 0,
                href: portalPath("/reimbursements"),
                colorClass: "text-green-500 bg-green-500/10",
              },
            ]}
            t={t}
          />
        </div>
        <div className="lg:col-span-1">
          <WalletOverviewCard t={t} />
        </div>
        <div className="lg:col-span-1">
          <OverdueInvoicesCard t={t} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD — role-based rendering
// ═══════════════════════════════════════════════════════════════════════════════
export default function PortalDashboard() {
  const { t, locale } = useI18n();
  const { user } = usePortalAuth();
  const { data: stats, isLoading } = portalTrpc.dashboard.stats.useQuery();
  const { data: greeting } = portalTrpc.dashboard.greeting.useQuery();

  const role = (user?.portalRole ?? "viewer") as PortalRole;
  const showHr = ["admin", "hr_manager"].includes(role);
  const showFinance = ["admin", "finance"].includes(role);
  const isViewer = role === "viewer";

  // Dynamic greeting — respects current i18n locale
  const greetingText = useMemo(() => {
    if (!greeting) return `${t("portal_dashboard.welcome")}, ${user?.contactName?.split(" ")[0] || "User"}`;
    // Pick the greeting matching the current locale; fall back to the other language
    const localized = locale === "zh" ? (greeting.zh || greeting.en) : (greeting.en || greeting.zh);
    return localized || `${t("portal_dashboard.welcome")}, ${user?.contactName?.split(" ")[0] || "User"}`;
  }, [greeting, locale, t, user]);

  return (
    <PortalLayout title={t("portal_dashboard.header.title")}>
      <div className="p-6 space-y-8 animate-page-in">
        {/* Welcome / Greeting */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{greetingText}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isViewer ? t("portal_dashboard.viewer_desc") : t("portal_dashboard.overview")}
          </p>
        </div>

        {/* Global KPI Cards — visible to all roles */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-stat-card p-5">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title={t("portal_dashboard.kpi.active_employees")}
              value={stats?.activeEmployees ?? 0}
              icon={Users}
              accent="green"
              description={t("portal_dashboard.kpi.active_employees_desc")}
              href={portalPath("/employees")}
            />
            <StatCard
              title={t("portal_dashboard.kpi.countries")}
              value={stats?.activeCountries ?? 0}
              icon={Globe}
              accent="blue"
              description={t("portal_dashboard.kpi.active_locations_desc")}
            />
            <StatCard
              title={t("portal_dashboard.kpi.pending_onboarding")}
              value={stats?.pendingOnboarding ?? 0}
              icon={UserPlus}
              accent="amber"
              description={t("portal_dashboard.kpi.pending_onboarding_desc")}
              href={portalPath("/onboarding")}
            />
            <StatCard
              title={t("portal_dashboard.kpi.unpaid_invoices")}
              value={(stats?.unpaidInvoices ?? 0) + (stats?.overdueInvoices ?? 0)}
              icon={Receipt}
              accent={(stats?.overdueInvoices ?? 0) > 0 ? "red" : "default"}
              description={stats?.overdueInvoices ? `${stats.overdueInvoices} ${t("portal_dashboard.kpi.overdue")}` : t("portal_dashboard.kpi.awaiting_payment")}
              href={portalPath("/invoices")}
            />
          </div>
        )}

        {/* ── HR Workspace ─────────────────────────────────────────────── */}
        {showHr && <HrWorkspace stats={stats} t={t} />}

        {/* ── Finance Workspace ────────────────────────────────────────── */}
        {showFinance && <FinanceWorkspace stats={stats} t={t} />}

        {/* ── Viewer: Simple overview with status chart ─────────────────── */}
        {isViewer && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EmployeeStatusCard />
            <EmployeeMapCard />
          </div>
        )}

        {/* ── Shared Sections (non-viewer) ──────────────────────────────── */}
        {!isViewer && (
          <>
            {/* Payroll Trend + Employee Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PayrollTrendCard />
              </div>
              <div>
                <EmployeeStatusCard />
              </div>
            </div>

            {/* Map */}
            <EmployeeMapCard />

            {/* Recent Activity */}
            <RecentActivityCard />
          </>
        )}
      </div>
    </PortalLayout>
  );
}
