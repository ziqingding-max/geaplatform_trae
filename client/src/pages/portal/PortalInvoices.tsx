/**
 * Portal Finance Page
 *
 * Comprehensive finance module with:
 * - Active tab (Issued, Overdue, Paid invoices) and History tab (completed/cancelled)
 * - Type category filters: All, Receivables, Credits, Deposits
 * - Status mapping: sent→Issued, applied→Applied (grey), etc.
 * - Color system: green=client-favorable, yellow=pending, red=urgent, grey=inactive
 * - Balance Due column with proper accounting logic
 * - Credit Note remaining balance display
 * - Account Summary with net deposit balance
 */
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import PortalLayout from "@/components/PortalLayout";
import { portalTrpc } from "@/lib/portalTrpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Receipt, Download, ChevronLeft, ChevronRight, FileText,
  CreditCard, Wallet, Info, ArrowUpRight, AlertTriangle,
  CheckCircle2, Clock, Eye, BarChart3, Archive,
} from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { exportToCsv } from "@/lib/csvExport";
import { formatCurrency, formatDate } from "@/lib/format";

import { useI18n } from "@/lib/i18n";
/* ─── Status Display Config ──────────────────────────────────────────────── */

// Portal status labels: sent → Issued
const statusLabels: Record<string, string> = {
  sent: "Issued",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
  void: "Void",
  applied: "Applied",
};

// Color system: green=favorable, yellow/amber=pending, red=urgent, grey=inactive
const statusColors: Record<string, string> = {
  sent: "bg-amber-50 text-amber-700 border-amber-200",         // Issued = yellow (pending)
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",   // Paid = green
  overdue: "bg-red-50 text-red-700 border-red-200",            // Overdue = red
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",      // Cancelled = grey
  void: "bg-gray-100 text-gray-500 border-gray-200",           // Void = grey
  applied: "bg-gray-100 text-gray-500 border-gray-200",        // Applied (CN fully used) = grey
};

const invoiceTypeLabels: Record<string, string> = {
  deposit: "Deposit",
  monthly_eor: "Monthly EOR",
  monthly_visa_eor: "Monthly Visa EOR",
  monthly_aor: "Monthly AOR",
  visa_service: "Visa Service",
  deposit_refund: "Deposit Refund",
  credit_note: "Credit Note",
  manual: "Manual",
};

const invoiceTypeColors: Record<string, string> = {
  deposit: "bg-indigo-50 text-indigo-700 border-indigo-200",
  monthly_eor: "bg-blue-50 text-blue-700 border-blue-200",
  monthly_visa_eor: "bg-sky-50 text-sky-700 border-sky-200",
  monthly_aor: "bg-cyan-50 text-cyan-700 border-cyan-200",
  visa_service: "bg-violet-50 text-violet-700 border-violet-200",
  deposit_refund: "bg-emerald-50 text-emerald-700 border-emerald-200",
  credit_note: "bg-emerald-50 text-emerald-700 border-emerald-200",
  manual: "bg-gray-50 text-gray-700 border-gray-200",
};

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function PortalInvoices() {
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const [mainTab, setMainTab] = useState("active");
  const [typeCategory, setTypeCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Reset page when filters change
  const handleMainTabChange = (v: string) => { setMainTab(v); setPage(1); setStatusFilter("all"); };
  const handleTypeCategoryChange = (v: string) => { setTypeCategory(v); setPage(1); };
  const handleStatusFilterChange = (v: string) => { setStatusFilter(v); setPage(1); };

  const { data: listData, isLoading: listLoading } = portalTrpc.invoices.list.useQuery({
    page,
    pageSize,
    tab: mainTab as "active" | "history",
    typeCategory: typeCategory as any,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const { data: summary } = portalTrpc.invoices.accountSummary.useQuery();

  const items = listData?.items ?? [];
  const total = listData?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  function navigateToDetail(id: number) {
    setLocation(`/portal/invoices/${id}`);
  }

  function handleDownload(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    window.open(`/api/portal-invoices/${id}/pdf`, "_blank");
  }

  // Status filter options based on tab
  const statusOptions = useMemo(() => {
    if (mainTab === "active") {
      return [
        { value: "all", label: t("portal_invoices.filter.all_statuses") },
        { value: "sent", label: t("portal_invoices.status.issued") },
        { value: "partially_paid", label: "Partially Paid" },
        { value: "paid", label: t("portal_invoices.status.paid") },
        { value: "overdue", label: t("portal_invoices.status.overdue") },
      ];
    }
    return [
      { value: "all", label: "All Statuses" },
      { value: "paid", label: "Paid" },
      { value: "applied", label: t("portal_invoices.status.applied") },
      { value: "cancelled", label: t("portal_invoices.status.cancelled") },
      { value: "void", label: t("portal_invoices.status.void") },
    ];
  }, [mainTab]);

  // Quick stats from current data
  const quickStats = useMemo(() => {
    if (!summary) return null;
    return {
      outstanding: summary.outstandingBalance,
      overdue: items.filter((i: any) => i.status === "overdue").length,
    };
  }, [summary, items]);

  return (
    <PortalLayout title={t("portal_invoices.title")}>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("portal_invoices.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage invoices, credit notes, and deposits
            </p>
          </div>
          <div className="flex items-center gap-2">
            {quickStats && quickStats.outstanding > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">
                  Outstanding: {formatCurrency(undefined, quickStats.outstanding)}
                </span>
                {quickStats.overdue > 0 && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs ml-1">
                    {quickStats.overdue} overdue
                  </Badge>
                )}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={items.length === 0}
              onClick={() => {
                exportToCsv(items, [
                  { header: "Invoice #", accessor: (r: any) => r.invoiceNumber || "" },
                  { header: "Type", accessor: (r: any) => r.invoiceType || "" },
                  { header: "Issue Date", accessor: (r: any) => r.issueDate ? new Date(r.issueDate).toLocaleDateString() : "" },
                  { header: "Due Date", accessor: (r: any) => r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "" },
                  { header: "Total", accessor: (r: any) => r.total || 0 },
                  { header: "Amount Due", accessor: (r: any) => r.amountDue ?? r.total ?? 0 },
                  { header: "Currency", accessor: (r: any) => r.currency || "" },
                  { header: "Status", accessor: (r: any) => statusLabels[r.status] || r.status || "" },
                ], `invoices-${new Date().toISOString().slice(0, 10)}.csv`);
              }}
            >
              <Download className="w-4 h-4 mr-1" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Main Tabs: Active / History / Summary */}
        <Tabs value={mainTab} onValueChange={handleMainTabChange}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <TabsList className="h-10">
              <TabsTrigger value="active" className="gap-1.5 px-4">
                <Receipt className="w-4 h-4" /> Active
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1.5 px-4">
                <Archive className="w-4 h-4" /> History
              </TabsTrigger>
              <TabsTrigger value="summary" className="gap-1.5 px-4">
                <BarChart3 className="w-4 h-4" /> Summary
              </TabsTrigger>
            </TabsList>

            {/* Filters — only show for Active and History tabs */}
            {mainTab !== "summary" && (
              <div className="flex items-center gap-2">
                <Select value={typeCategory} onValueChange={handleTypeCategoryChange}>
                  <SelectTrigger className="w-[140px] h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("portal_invoices.filter.all_types")}</SelectItem>
                    <SelectItem value="receivables">{t("portal_invoices.filter.receivables")}</SelectItem>
                    <SelectItem value="credits">{t("portal_invoices.filter.credits")}</SelectItem>
                    <SelectItem value="deposits">{t("portal_invoices.filter.deposits")}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="w-[140px] h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Active & History Tabs — share the same table layout */}
          {["active", "history"].map(tab => (
            <TabsContent key={tab} value={tab} className="mt-4">
              <Card className="border shadow-sm">
                <CardContent className="p-0">
                  {listLoading ? (
                    <div className="p-6 space-y-3">
                      {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
                    </div>
                  ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <FileText className="w-12 h-12 text-muted-foreground/30 mb-3" />
                      <p className="text-sm font-medium text-muted-foreground">No documents found</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {tab === "history" ? "Completed and cancelled documents will appear here." : "No active invoices at this time."}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="pl-6 font-semibold text-xs uppercase tracking-wider">Document #</TableHead>
                            <TableHead className="font-semibold text-xs uppercase tracking-wider">{t("portal_invoices.table.header.type")}</TableHead>
                            <TableHead className="font-semibold text-xs uppercase tracking-wider">Period</TableHead>
                            <TableHead className="font-semibold text-xs uppercase tracking-wider">{t("portal_invoices.table.header.due_date")}</TableHead>
                            <TableHead className="text-right font-semibold text-xs uppercase tracking-wider">Amount</TableHead>
                            <TableHead className="text-right font-semibold text-xs uppercase tracking-wider">Balance Due</TableHead>
                            <TableHead className="font-semibold text-xs uppercase tracking-wider">{t("portal_invoices.table.header.status")}</TableHead>
                            <TableHead className="text-right pr-6 font-semibold text-xs uppercase tracking-wider">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((inv: any) => (
                            <InvoiceRow
                              key={inv.id}
                              inv={inv}
                              onNavigate={navigateToDetail}
                              onDownload={handleDownload}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-3">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{(page - 1) * pageSize + 1}</span>–<span className="font-medium text-foreground">{Math.min(page * pageSize, total)}</span> of <span className="font-medium text-foreground">{total}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-8">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm tabular-nums px-2">{page} / {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          ))}

          {/* Account Summary Tab */}
          <TabsContent value="summary" className="space-y-6 mt-4">
            {!summary ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <SummaryCard
                    icon={FileText}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                    label="Total Invoiced"
                    value={formatCurrency(undefined, summary.totalInvoiced)}
                  />
                  <SummaryCard
                    icon={CheckCircle2}
                    iconBg="bg-emerald-50"
                    iconColor="text-emerald-600"
                    label="Total Paid"
                    value={formatCurrency(undefined, summary.totalPaid)}
                    valueColor="text-emerald-700"
                  />
                  <SummaryCard
                    icon={AlertTriangle}
                    iconBg="bg-amber-50"
                    iconColor="text-amber-600"
                    label="Outstanding Balance"
                    value={formatCurrency(undefined, summary.outstandingBalance)}
                    valueColor={summary.outstandingBalance > 0 ? "text-amber-700" : undefined}
                  />
                  <SummaryCard
                    icon={CreditCard}
                    iconBg={summary.creditBalance === 0 && summary.totalCreditNotes > 0 ? "bg-gray-100" : "bg-emerald-50"}
                    iconColor={summary.creditBalance === 0 && summary.totalCreditNotes > 0 ? "text-gray-400" : "text-emerald-600"}
                    label="Credit Balance"
                    value={formatCurrency(undefined, summary.creditBalance ?? 0)}
                    valueColor={summary.creditBalance === 0 ? "text-gray-400" : "text-emerald-700"}
                    subtitle={
                      summary.totalCreditNotes === 0
                        ? "No credit notes issued"
                        : summary.creditBalance === 0
                          ? `All credits fully applied (Total issued: ${formatCurrency(undefined, summary.totalCreditNotes)})`
                          : `Remaining from ${formatCurrency(undefined, summary.totalCreditNotes)} issued`
                    }
                  />
                  <SummaryCard
                    icon={Wallet}
                    iconBg="bg-indigo-50"
                    iconColor="text-indigo-600"
                    label="Deposit Balance"
                    value={formatCurrency(undefined, summary.totalDeposits)}
                    valueColor="text-indigo-700"
                    subtitle={summary.totalDeposits === 0 ? "All deposits converted or refunded" : undefined}
                  />
                </div>

                {/* Understanding Finance */}
                <Card className="border shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Info className="w-4 h-4 text-muted-foreground" /> Understanding Your Finance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoCard
                        title="Monthly Invoices"
                        description="Recurring invoices for EOR/AOR services, including employee salary costs, employer contributions, and service fees."
                      />
                      <InfoCard
                        title="Credit Notes"
                        description="Issued when adjustments reduce your balance. Shown in green with remaining balance. Once fully applied, status changes to Applied (grey)."
                      />
                      <InfoCard
                        title="Deposit Balance"
                        description="Security deposits held for onboarding. The balance reflects deposits minus any converted credit notes or refunds."
                      />
                      <InfoCard
                        title="Balance Due"
                        description="The remaining amount payable on each document. For credit notes, it shows the unused balance available for future application."
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PortalLayout>
  );
}

/* ─── Invoice Row Component ──────────────────────────────────────────────── */

function InvoiceRow({
  inv,
  onNavigate,
  onDownload,
}: {
  inv: any;
  onNavigate: (id: number) => void;
  onDownload: (e: React.MouseEvent, id: number) => void;
}) {
  const { t } = useI18n();
  const isCreditNote = inv.invoiceType === "credit_note";
  const isDepositRefund = inv.invoiceType === "deposit_refund";
  const isCredit = isCreditNote || isDepositRefund;

  // Determine the status badge
  let statusLabel = statusLabels[inv.status] || inv.status;
  let statusColor = statusColors[inv.status] || "";

  // Special composite statuses
  if (inv.isPartiallyPaid) {
    statusLabel = "Partially Paid";
    statusColor = "bg-orange-50 text-orange-700 border-orange-200";
  } else if (inv.isOverpaid) {
    statusLabel = "Paid";
    statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  // Credit note: if not fully applied, show green; if applied, show grey
  if (isCreditNote) {
    if (inv.status === "applied") {
      statusLabel = "Applied";
      statusColor = "bg-gray-100 text-gray-500 border-gray-200";
    } else if (inv.status !== "cancelled" && inv.status !== "void") {
      // Active credit note — green
      statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
      if (inv.creditNoteTotalApplied > 0 && inv.creditNoteRemaining > 0) {
        statusLabel = "Partially Applied";
      } else {
        statusLabel = statusLabels[inv.status] || inv.status;
      }
    }
  }

  // Balance Due display
  let balanceDueDisplay: React.ReactNode = null;
  if (isCreditNote) {
    // Credit note: show remaining balance in green
    if (inv.creditNoteRemaining != null && inv.creditNoteRemaining > 0) {
      balanceDueDisplay = (
        <span className="text-emerald-600 font-medium">{formatCurrency(inv.currency, inv.creditNoteRemaining)}</span>
      );
    } else {
      balanceDueDisplay = <span className="text-muted-foreground/40">-</span>;
    }
  } else if (isDepositRefund || inv.status === "cancelled" || inv.status === "void" || inv.status === "paid") {
    if (inv.isPartiallyPaid && inv.relatedDocuments?.length > 0) {
      // Partially paid with follow-up: show "See follow-up"
      balanceDueDisplay = (
        <span className="text-xs text-orange-600">See follow-up</span>
      );
    } else {
      balanceDueDisplay = <span className="text-muted-foreground/40">-</span>;
    }
  } else if (inv.balanceDue > 0) {
    // Outstanding balance — red for overdue, amber for issued
    const color = inv.status === "overdue" ? "text-red-600" : "text-amber-600";
    balanceDueDisplay = (
      <span className={cn("font-medium", color)}>{formatCurrency(inv.currency, inv.balanceDue)}</span>
    );
  } else {
    balanceDueDisplay = <span className="text-muted-foreground/40">-</span>;
  }

  return (
    <TableRow
      className="cursor-pointer group transition-colors hover:bg-muted/40"
      onClick={() => onNavigate(inv.id)}
    >
      <TableCell className="pl-6">
        <div className="flex items-center gap-2">
          <span className="font-medium font-mono text-sm">
            {inv.invoiceNumber || `INV-${inv.id}`}
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-colors" />
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={cn("text-xs font-medium", invoiceTypeColors[inv.invoiceType] || "")}>
          {invoiceTypeLabels[inv.invoiceType] || inv.invoiceType}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {inv.invoiceMonth
          ? new Date(inv.invoiceMonth).toLocaleDateString("en-US", { year: "numeric", month: "short" })
          : "-"}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {inv.dueDate ? formatDate(inv.dueDate) : "-"}
      </TableCell>
      <TableCell className={cn(
        "text-right font-mono text-sm tabular-nums",
        isCredit ? "text-emerald-600" : "font-medium"
      )}>
        {isCredit ? "-" : ""}
        {formatCurrency(inv.currency, Math.abs(Number(inv.total)))}
      </TableCell>
      <TableCell className="text-right font-mono text-sm tabular-nums">
        {balanceDueDisplay}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={cn("text-xs", statusColor)}>
          {statusLabel}
        </Badge>
      </TableCell>
      <TableCell className="text-right pr-6">
        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  onClick={() => onNavigate(inv.id)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">{t("portal_invoices.tooltip.view_details")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  onClick={e => onDownload(e, inv.id)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">{t("portal_invoices.tooltip.download_pdf")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </TableCell>
    </TableRow>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function SummaryCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  valueColor,
  subtitle,
}: {
  icon: typeof FileText;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  valueColor?: string;
  subtitle?: string;
}) {
  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className={cn("p-2.5 rounded-xl", iconBg)}>
            <Icon className={cn("w-5 h-5", iconColor)} />
          </div>
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className={cn("text-xl font-bold tabular-nums font-mono", valueColor)}>{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors">
      <p className="font-medium text-sm text-foreground mb-1.5">{title}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
