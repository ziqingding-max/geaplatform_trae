/**
 * Portal Invoice Detail Page
 *
 * Full-page invoice view with:
 * - Status mapping: sent→Issued, applied→Applied (grey)
 * - Color system: green=favorable, yellow=pending, red=urgent, grey=inactive
 * - Credit Note balance display (Original / Applied / Remaining)
 * - Credit Note application history (where it was applied)
 * - Applied Credit Notes section (which CNs were applied to this invoice)
 * - Related Documents (bidirectional: parent + children via relatedInvoiceId)
 * - Payment breakdown with Balance Due
 */
import { useParams, useLocation } from "wouter";
import PortalLayout from "@/components/PortalLayout";
import { portalTrpc } from "@/lib/portalTrpc";
import { portalPath } from "@/lib/portalBasePath";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft, Download, FileText, CreditCard, CalendarDays,
  Hash, Clock, CheckCircle, AlertCircle,
  Receipt, Info, ExternalLink,
  ArrowRight, Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/format";

import { useI18n } from "@/lib/i18n";
/* ─── Status Config ──────────────────────────────────────────────────────── */

// statusLabels built with t() inside component

const statusColors: Record<string, string> = {
  sent: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  overdue: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
  void: "bg-gray-100 text-gray-500 border-gray-200",
  applied: "bg-gray-100 text-gray-500 border-gray-200",
};

// invoiceTypeLabels built with t() inside component

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function PortalInvoiceDetail() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const invoiceId = parseInt(params.id || "0", 10);

  const statusLabels: Record<string, string> = {
    sent: t("portal_invoices.status.issued"),
    paid: t("portal_invoices.status.paid"),
    overdue: t("portal_invoices.status.overdue"),
    cancelled: t("portal_invoices.status.cancelled"),
    void: t("portal_invoices.status.void"),
    applied: t("portal_invoices.status.applied"),
  };
  const invoiceTypeLabels: Record<string, string> = {
    deposit: t("portal_invoices.type.deposit"),
    monthly_eor: t("portal_invoices.type.monthly_eor"),
    monthly_visa_eor: t("portal_invoices.type.monthly_visa_eor"),
    monthly_aor: t("portal_invoices.type.monthly_aor"),
    visa_service: t("portal_invoices.type.visa_service"),
    deposit_refund: t("portal_invoices.type.deposit_refund"),
    credit_note: t("portal_invoices.type.credit_note"),
    manual: t("portal_invoices.type.manual"),
  };

  const { data, isLoading } = portalTrpc.invoices.detail.useQuery(
    { id: invoiceId },
    { enabled: !!invoiceId }
  );

  function handleDownload() {
    window.open(`/api/portal-invoices/${invoiceId}/pdf`, "_blank");
  }

  function navigateToInvoice(id: number) {
    setLocation(portalPath(`/invoices/${id}`));
  }

  // Loading state
  if (isLoading) {
    return (
      <PortalLayout title={t("portal_invoice_detail.page_title")}>
        <div className="p-6 max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-64" />
            </div>
            <Skeleton className="h-80" />
          </div>
        </div>
      </PortalLayout>
    );
  }

  // Not found
  if (!data) {
    return (
      <PortalLayout title={t("portal_invoice_detail.page_title")}>
        <div className="p-6 max-w-5xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => setLocation(portalPath("/invoices"))} className="mb-6 gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> {t("portal_invoice_detail.back_to_finance")}
          </Button>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="w-12 h-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold mb-1">{t("portal_invoice_detail.not_found.title")}</h3>
              <p className="text-sm text-muted-foreground">{t("portal_invoice_detail.not_found.description")}</p>
            </CardContent>
          </Card>
        </div>
      </PortalLayout>
    );
  }

  const isCreditNote = data.invoiceType === "credit_note";
  const isDepositRefund = data.invoiceType === "deposit_refund";
  const isDeposit = data.invoiceType === "deposit";
  const isCredit = isCreditNote || isDepositRefund;

  // Status display
  let statusLabel = statusLabels[data.status] || data.status;
  let statusColor = statusColors[data.status] || "";

  if (data.isPartiallyPaid) {
    statusLabel = t("portal_invoices.status.partially_paid");
    statusColor = "bg-orange-50 text-orange-700 border-orange-200";
  } else if (data.isOverpaid) {
    statusLabel = t("portal_invoices.status.paid");
    statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  // Credit note active status = green
  if (isCreditNote && data.status !== "applied" && data.status !== "cancelled" && data.status !== "void") {
    statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (data.creditNoteBalance && data.creditNoteBalance.applied > 0 && data.creditNoteBalance.remaining > 0) {
      statusLabel = t("portal_invoices.status.partially_applied");
    }
  }

  // Banner color
  const bannerColor = isCreditNote
    ? (data.status === "applied" ? "from-gray-500 to-gray-600" : "from-emerald-600 to-emerald-700")
    : isDepositRefund
      ? "from-emerald-600 to-emerald-700"
      : data.isPartiallyPaid
        ? "from-orange-500 to-orange-600"
        : data.status === "paid"
          ? "from-emerald-600 to-emerald-700"
          : data.status === "overdue"
            ? "from-red-600 to-red-700"
            : "from-primary to-primary/90";

  // Banner label and value
  let bannerLabel = t("portal_invoice_detail.banner.amount_due");
  let bannerValue = formatCurrency(data.currency, data.balanceDue);

  if (isCreditNote) {
    if (data.creditNoteBalance && data.creditNoteBalance.remaining > 0) {
      bannerLabel = t("portal_invoice_detail.banner.available_credit");
      bannerValue = formatCurrency(data.currency, data.creditNoteBalance.remaining);
    } else {
      bannerLabel = t("portal_invoice_detail.banner.credit_amount");
      bannerValue = formatCurrency(data.currency, Math.abs(Number(data.total)));
    }
  } else if (isDepositRefund) {
    bannerLabel = t("portal_invoice_detail.banner.refund_amount");
    bannerValue = formatCurrency(data.currency, Math.abs(Number(data.total)));
  } else if (data.status === "paid" && !data.isPartiallyPaid) {
    bannerLabel = t("portal_invoice_detail.banner.total_paid");
    bannerValue = formatCurrency(data.currency, data.paidAmount || data.total);
  } else if (data.isPartiallyPaid) {
    bannerLabel = t("portal_invoice_detail.banner.remaining_balance");
    const remaining = Number(data.amountDue || data.total) - Number(data.paidAmount || 0);
    bannerValue = formatCurrency(data.currency, Math.max(0, remaining));
  } else if (data.status === "cancelled" || data.status === "void") {
    bannerLabel = t("portal_invoice_detail.banner.total_amount");
    bannerValue = formatCurrency(data.currency, data.total);
  }

  const paidAmt = data.paidAmount != null ? Number(data.paidAmount) : 0;
  const effectiveDue = data.amountDue != null ? Number(data.amountDue) : Number(data.total);

  return (
    <PortalLayout title={t("portal_invoice_detail.page_title")}>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Back Navigation */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation(portalPath("/invoices"))}
          className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="w-4 h-4" /> {t("portal_invoice_detail.back_to_finance")}
        </Button>

        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight font-mono">
                {data.invoiceNumber || `INV-${data.id}`}
              </h1>
              <Badge variant="outline" className={cn("text-sm px-3 py-1", statusColor)}>
                {statusLabel}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {invoiceTypeLabels[data.invoiceType] || data.invoiceType}
              {data.invoiceMonth && (
                <> &middot; {new Date(data.invoiceMonth).toLocaleDateString("en-US", { year: "numeric", month: "long" })}</>
              )}
            </p>
          </div>
          <Button onClick={handleDownload} className="gap-2 shrink-0">
            <Download className="w-4 h-4" /> {t("portal_invoice_detail.actions.download_pdf")}
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Metadata */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <MetaField icon={CalendarDays} label={t("portal_invoice_detail.meta.issue_date")} value={formatDate(data.sentDate)} />
                  <MetaField icon={Clock} label={t("portal_invoice_detail.meta.due_date")} value={formatDate(data.dueDate)} />
                  <MetaField icon={CreditCard} label={t("portal_invoice_detail.meta.currency")} value={data.currency || "USD"} />
                  <MetaField icon={FileText} label={t("portal_invoice_detail.meta.reference")} value={data.invoiceNumber || "-"} mono />
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-muted-foreground" />
                  {t("portal_invoice_detail.line_items.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="pl-6">{t("portal_invoice_detail.line_items.description")}</TableHead>
                        <TableHead>{t("portal_invoice_detail.line_items.category")}</TableHead>
                        <TableHead>{t("portal_invoice_detail.line_items.currency")}</TableHead>
                        <TableHead className="text-right">{t("portal_invoice_detail.line_items.quantity")}</TableHead>
                        <TableHead className="text-right">{t("portal_invoice_detail.line_items.unit_price")}</TableHead>
                        <TableHead className="text-right pr-6">{t("portal_invoice_detail.line_items.amount")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(data.items || []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            {t("portal_invoice_detail.line_items.empty")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        (data.items || []).map((item: any, idx: number) => (
                          <TableRow key={item.id || idx}>
                            <TableCell className="pl-6">
                              <p className="text-sm font-medium">{item.description || "-"}</p>
                              {item.countryCode && (
                                <p className="text-xs text-muted-foreground mt-0.5">{item.countryCode}</p>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-muted-foreground capitalize px-2 py-0.5 rounded-full bg-muted/50">
                                {item.itemType?.replace(/_/g, " ") || "-"}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm">
                              {item.localCurrency || data.currency || "—"}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm tabular-nums">
                              {item.quantity || 1}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm tabular-nums">
                              {formatCurrency(item.localCurrency || data.currency, item.unitPrice)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm font-medium pr-6 tabular-nums">
                              {formatCurrency(item.localCurrency || data.currency, item.localAmount || item.amount)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Applied Credit Notes (which CNs were applied to THIS invoice) */}
            {data.creditApplications && data.creditApplications.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    {t("portal_invoice_detail.credits_applied.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.creditApplications.map((ca: any) => (
                    <div
                      key={ca.id}
                      className="flex items-center justify-between p-4 rounded-xl border bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50 transition-colors cursor-pointer"
                      onClick={() => ca.creditNoteId && navigateToInvoice(ca.creditNoteId)}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-emerald-800">{ca.creditNoteNumber}</p>
                          <ExternalLink className="w-3 h-3 text-emerald-600/60" />
                        </div>
                        {ca.notes && <p className="text-xs text-emerald-600/80">{ca.notes}</p>}
                        <p className="text-xs text-muted-foreground">{t("portal_invoice_detail.credits_applied.applied_on")} {formatDate(ca.appliedAt)}</p>
                      </div>
                      <span className="font-mono text-sm text-emerald-700 font-semibold">
                        -{formatCurrency(data.currency, ca.appliedAmount)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Credit Note Application History (if THIS is a credit note, where was it applied) */}
            {isCreditNote && data.creditApplicationsFrom && data.creditApplicationsFrom.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    {t("portal_invoice_detail.application_history.title")}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("portal_invoice_detail.application_history.description")}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.creditApplicationsFrom.map((app: any) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => app.appliedToInvoiceId && navigateToInvoice(app.appliedToInvoiceId)}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{app.invoiceNumber}</p>
                          <Badge variant="outline" className="text-xs">
                            {invoiceTypeLabels[app.invoiceType] || app.invoiceType}
                          </Badge>
                          <ExternalLink className="w-3 h-3 text-muted-foreground/60" />
                        </div>
                        {app.notes && <p className="text-xs text-muted-foreground">{app.notes}</p>}
                        <p className="text-xs text-muted-foreground">{t("portal_invoice_detail.credits_applied.applied_on")} {formatDate(app.appliedAt)}</p>
                      </div>
                      <span className="font-mono text-sm font-medium">
                        {formatCurrency(data.currency, app.appliedAmount)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Related Documents (bidirectional via relatedInvoiceId) */}
            {(data.relatedDocuments?.parent || (data.relatedDocuments?.children && data.relatedDocuments.children.length > 0)) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-muted-foreground" />
                    {t("portal_invoice_detail.related_documents.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Parent document */}
                  {data.relatedDocuments.parent && (
                    <RelatedDocLink
                      doc={data.relatedDocuments.parent}
                      currency={data.currency}
                      statusLabels={statusLabels}
                      relationship={
                        isCreditNote ? "Source Invoice" :
                        isDepositRefund ? "Original Deposit" :
                        data.invoiceType === "manual" ? "Original Invoice" :
                        "Related Document"
                      }
                      onClick={() => navigateToInvoice(data.relatedDocuments.parent.id)}
                    />
                  )}
                  {/* Child documents */}
                  {data.relatedDocuments.children?.map((child: any) => (
                    <RelatedDocLink
                      key={child.id}
                      doc={child}
                      currency={data.currency}
                      statusLabels={statusLabels}
                      relationship={
                        child.invoiceType === "credit_note" ? "Overpayment Credit Note" :
                        child.invoiceType === "deposit_refund" ? "Deposit Refund" :
                        child.invoiceType === "manual" ? "Follow-up Invoice (Underpayment)" :
                        "Related Document"
                      }
                      onClick={() => navigateToInvoice(child.id)}
                    />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {data.notes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="w-4 h-4 text-muted-foreground" />
                    {t("portal_invoice_detail.notes.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{data.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column — Financial Summary */}
          <div className="space-y-6">
            {/* Total Banner */}
            <Card className={cn(
              "overflow-hidden",
              data.isPartiallyPaid && "ring-2 ring-orange-200"
            )}>
              <div className={cn("px-6 py-5 bg-gradient-to-br", bannerColor)}>
                <p className="text-xs font-medium text-white/70 uppercase tracking-wider mb-1">
                  {bannerLabel}
                </p>
                <p className="text-3xl font-bold text-white font-mono tabular-nums">
                  {bannerValue}
                </p>
              </div>

              <CardContent className="pt-5 space-y-4">
                {/* Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t("portal_invoice_detail.summary.subtotal")}</span>
                    <span className="text-sm font-mono tabular-nums">{formatCurrency(data.currency, data.subtotal)}</span>
                  </div>

                  {Number(data.serviceFeeTotal) > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{t("portal_invoice_detail.summary.service_fees")}</span>
                      <span className="text-sm font-mono tabular-nums">{formatCurrency(data.currency, data.serviceFeeTotal)}</span>
                    </div>
                  )}

                  {Number(data.tax) > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{t("portal_invoice_detail.summary.tax_vat")}</span>
                      <span className="text-sm font-mono tabular-nums">{formatCurrency(data.currency, data.tax)}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">{t("portal_invoice_detail.summary.total")}</span>
                    <span className={cn("text-sm font-mono font-semibold tabular-nums", isCredit && "text-emerald-600")}>
                      {isCredit && "-"}{formatCurrency(data.currency, Math.abs(Number(data.total)))}
                    </span>
                  </div>

                  {/* Credit Applied */}
                  {Number(data.creditApplied) > 0 && (
                    <div className="flex justify-between items-center text-emerald-600">
                      <span className="text-sm">{t("portal_invoice_detail.summary.credit_applied")}</span>
                      <span className="text-sm font-mono tabular-nums">-{formatCurrency(data.currency, data.creditApplied)}</span>
                    </div>
                  )}

                  {/* Amount Due (after credit) */}
                  {data.amountDue != null && Number(data.amountDue) !== Number(data.total) && !isCreditNote && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold">{t("portal_invoice_detail.banner.amount_due")}</span>
                        <span className="text-sm font-mono font-semibold tabular-nums text-amber-600">
                          {formatCurrency(data.currency, data.amountDue)}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Paid */}
                  {paidAmt > 0 && (
                    <div className="flex justify-between items-center text-emerald-600">
                      <span className="text-sm">{t("portal_invoice_detail.status.paid")}</span>
                      <span className="text-sm font-mono tabular-nums">{formatCurrency(data.currency, paidAmt)}</span>
                    </div>
                  )}

                  {/* Balance Due */}
                  {!isCreditNote && !isDepositRefund && data.balanceDue > 0 && (
                    <>
                      <Separator />
                      <div className={cn(
                        "flex justify-between items-center",
                        data.status === "overdue" ? "text-red-600" : "text-amber-600"
                      )}>
                        <span className="text-sm font-semibold">{t("portal_invoice_detail.summary.balance_due")}</span>
                        <span className="text-sm font-mono font-semibold tabular-nums">{formatCurrency(data.currency, data.balanceDue)}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Partial Payment Alert */}
                {data.isPartiallyPaid && (
                  <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                    <div className="flex gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-orange-800">{t("portal_invoice_detail.alert.partial_payment.title")}</p>
                        <p className="text-xs text-orange-600 mt-0.5">
                          {t("portal_invoice_detail.alert.partial_payment.description")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Overpayment Info */}
                {data.isOverpaid && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-emerald-800">{t("portal_invoice_detail.alert.overpayment.title")}</p>
                        <p className="text-xs text-emerald-600 mt-0.5">
                          {t("portal_invoice_detail.alert.overpayment.description")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Credit Note Balance Card (only for credit notes) */}
            {isCreditNote && data.creditNoteBalance && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {t("portal_invoice_detail.credit_balance.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t("portal_invoice_detail.credit_balance.original_amount")}</span>
                    <span className="text-sm font-mono tabular-nums">{formatCurrency(data.currency, data.creditNoteBalance.original)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t("portal_invoice_detail.status.applied")}</span>
                    <span className="text-sm font-mono tabular-nums">{formatCurrency(data.currency, data.creditNoteBalance.applied)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">{t("portal_invoice_detail.credit_balance.remaining")}</span>
                    <span className={cn(
                      "text-sm font-mono font-semibold tabular-nums",
                      data.creditNoteBalance.remaining > 0 ? "text-emerald-600" : "text-muted-foreground"
                    )}>
                      {formatCurrency(data.currency, data.creditNoteBalance.remaining)}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (data.creditNoteBalance.applied / data.creditNoteBalance.original) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {Math.round((data.creditNoteBalance.applied / data.creditNoteBalance.original) * 100)}% {t("portal_invoice_detail.credit_balance.applied_percent")}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Payment Details Card */}
            {data.paidDate && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {t("portal_invoice_detail.payment_details.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t("portal_invoice_detail.payment_details.payment_date")}</span>
                    <span className="text-sm">{formatDate(data.paidDate)}</span>
                  </div>
                  {paidAmt > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{t("portal_invoice_detail.payment_details.amount_received")}</span>
                      <span className="text-sm font-mono tabular-nums">{formatCurrency(data.currency, paidAmt)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Download */}
            <Button onClick={handleDownload} variant="outline" className="w-full gap-2">
              <Download className="w-4 h-4" /> {t("portal_invoice_detail.actions.download_pdf")}
            </Button>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function MetaField({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <p className={cn("text-sm font-medium", mono && "font-mono")}>{value}</p>
    </div>
  );
}

function RelatedDocLink({
  doc,
  relationship,
  onClick,
  currency,
  statusLabels,
}: {
  doc: { id: number; invoiceNumber: string; invoiceType: string; total: string; status: string };
  relationship: string;
  onClick: () => void;
  currency?: string;
  statusLabels: Record<string, string>;
}) {
  const isCredit = doc.invoiceType === "credit_note" || doc.invoiceType === "deposit_refund";
  const statusLabel = statusLabels[doc.status] || doc.status;
  const statusColor = statusColors[doc.status] || "";

  return (
    <div
      className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/30 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium font-mono">{doc.invoiceNumber}</span>
          <Badge variant="outline" className={cn("text-xs", statusColor)}>{statusLabel}</Badge>
          <ExternalLink className="w-3 h-3 text-muted-foreground/60" />
        </div>
        <p className="text-xs text-muted-foreground pl-6">{relationship}</p>
      </div>
      <span className={cn(
        "font-mono text-sm font-medium tabular-nums",
        isCredit ? "text-emerald-600" : ""
      )}>
        {isCredit ? "-" : ""}{formatCurrency(currency, Math.abs(Number(doc.total)))}
      </span>
    </div>
  );
}
