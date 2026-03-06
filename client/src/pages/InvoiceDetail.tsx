
import { useRoute, useLocation } from "wouter";
import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft, Download, FileText, CreditCard, Calendar,
  Hash, Clock, CheckCircle2, AlertTriangle,
  Receipt, CircleDollarSign, Info, ExternalLink,
  ArrowRight, Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatAmount, formatDate } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

/* ─── Status Config ──────────────────────────────────────────────────────── */

const statusLabels: Record<string, string> = {
  draft: "Draft",
  pending_review: "Pending Review",
  sent: "Issued",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
  void: "Void",
  applied: "Applied",
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600 border-gray-200",
  pending_review: "bg-amber-50 text-amber-700 border-amber-200",
  sent: "bg-blue-50 text-blue-700 border-blue-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  overdue: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
  void: "bg-gray-100 text-gray-500 border-gray-200",
  applied: "bg-purple-50 text-purple-700 border-purple-200",
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

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function InvoiceDetail({ id }: { id: number }) {
  const { t } = useI18n();
  const [, setLocation] = useLocation();

  const { data, isLoading } = trpc.invoices.get.useQuery({ id });
  const { data: items = [] } = trpc.invoices.getItems.useQuery({ invoiceId: id }, { enabled: !!data });

  function handleDownload() {
    window.open(`/api/invoices/${id}/pdf`, "_blank");
  }

  function navigateToInvoice(invoiceId: number) {
    setLocation(`/invoices/${invoiceId}`);
  }

  // Loading state
  if (isLoading) {
    return (
      <Layout breadcrumb={["GEA", "Invoices", "Loading..."]}>
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
      </Layout>
    );
  }

  // Not found
  if (!data) {
    return (
      <Layout breadcrumb={["GEA", "Invoices", "Not Found"]}>
        <div className="p-6 max-w-5xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/invoices")} className="mb-6 gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back to Invoices
          </Button>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="w-12 h-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold mb-1">Invoice Not Found</h3>
              <p className="text-sm text-muted-foreground">The invoice you are looking for does not exist or has been deleted.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const isCreditNote = data.invoiceType === "credit_note";
  const isDepositRefund = data.invoiceType === "deposit_refund";
  const isDeposit = data.invoiceType === "deposit";
  const isCredit = isCreditNote || isDepositRefund;

  // Status display
  let statusLabel = statusLabels[data.status] || data.status;
  let statusColor = statusColors[data.status] || "";

  // Note: These checks rely on optional fields that might not exist on the admin invoice type
  // Assuming the data structure is similar to portal
  const isPartiallyPaid = false; // Add logic if needed
  const isOverpaid = false; // Add logic if needed

  // Banner color
  const bannerColor = isCreditNote
    ? (data.status === "applied" ? "from-gray-500 to-gray-600" : "from-emerald-600 to-emerald-700")
    : isDepositRefund
      ? "from-emerald-600 to-emerald-700"
      : isPartiallyPaid
        ? "from-orange-500 to-orange-600"
        : data.status === "paid"
          ? "from-emerald-600 to-emerald-700"
          : data.status === "overdue"
            ? "from-red-600 to-red-700"
            : "from-primary to-primary/90";

  // Banner label and value
  let bannerLabel = "Amount Due";
  let bannerValue = `${data.currency} ${formatAmount(data.amountDue || data.total)}`;

  if (isCreditNote) {
    // Logic for credit note balance would go here if available in admin API
    bannerLabel = "Credit Amount";
    bannerValue = `${data.currency} ${formatAmount(data.total)}`;
  } else if (isDepositRefund) {
    bannerLabel = "Refund Amount";
    bannerValue = `${data.currency} ${formatAmount(data.total)}`;
  } else if (data.status === "paid") {
    bannerLabel = "Total Paid";
    bannerValue = `${data.currency} ${formatAmount(data.paidAmount || data.total)}`;
  } else if (data.status === "cancelled" || data.status === "void") {
    bannerLabel = "Total Amount";
    bannerValue = `${data.currency} ${formatAmount(data.total)}`;
  }

  const paidAmt = data.paidAmount ? parseFloat(data.paidAmount) : 0;
  
  return (
    <Layout breadcrumb={["GEA", "Invoices", data.invoiceNumber || `INV-${data.id}`]}>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Back Navigation */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/invoices")}
          className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
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
            <Download className="w-4 h-4" /> Download PDF
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
                  <MetaField icon={Calendar} label="Issue Date" value={data.sentDate ? formatDate(data.sentDate) : "Draft"} />
                  <MetaField icon={Clock} label="Due Date" value={data.dueDate ? formatDate(data.dueDate) : "N/A"} />
                  <MetaField icon={CircleDollarSign} label="Currency" value={data.currency || "USD"} />
                  <MetaField icon={Hash} label="Reference" value={data.invoiceNumber || "-"} mono />
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-muted-foreground" />
                  Line Items
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="pl-6">Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right pr-6">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No line items
                          </TableCell>
                        </TableRow>
                      ) : (
                        items.map((item: any, idx: number) => (
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
                            <TableCell className="text-right font-mono text-sm tabular-nums">
                              {item.quantity || 1}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm tabular-nums">
                              {item.unitPrice ? formatAmount(item.unitPrice) : "0.00"}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm font-medium pr-6 tabular-nums">
                              {item.amount ? formatAmount(item.amount) : "0.00"}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {data.notes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="w-4 h-4 text-muted-foreground" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{data.notes}</p>
                </CardContent>
              </Card>
            )}
            
            {data.internalNotes && (
               <Card className="border-amber-200 bg-amber-50/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-amber-800">
                    <Info className="w-4 h-4" />
                    Internal Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-amber-900/80 whitespace-pre-wrap leading-relaxed">{data.internalNotes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column — Financial Summary */}
          <div className="space-y-6">
            {/* Total Banner */}
            <Card className={cn(
              "overflow-hidden",
              isPartiallyPaid && "ring-2 ring-orange-200"
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
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <span className="text-sm font-mono tabular-nums">{data.currency} {formatAmount(data.subtotal)}</span>
                  </div>

                  {parseFloat(data.serviceFeeTotal) > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Service Fees</span>
                      <span className="text-sm font-mono tabular-nums">{data.currency} {formatAmount(data.serviceFeeTotal)}</span>
                    </div>
                  )}

                  {parseFloat(data.tax) > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Tax / VAT</span>
                      <span className="text-sm font-mono tabular-nums">{data.currency} {formatAmount(data.tax)}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">Total</span>
                    <span className={cn("text-sm font-mono font-semibold tabular-nums", isCredit && "text-emerald-600")}>
                      {isCredit && "-"}{data.currency} {formatAmount(data.total)}
                    </span>
                  </div>
                  
                  {/* Paid */}
                  {paidAmt > 0 && (
                    <div className="flex justify-between items-center text-emerald-600">
                      <span className="text-sm">Paid</span>
                      <span className="text-sm font-mono tabular-nums">{data.currency} {formatAmount(data.paidAmount)}</span>
                    </div>
                  )}
                  
                  {/* Amount Due */}
                  {!isCredit && data.status !== 'paid' && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold">Balance Due</span>
                        <span className="text-sm font-mono font-semibold tabular-nums text-amber-600">
                           {data.currency} {formatAmount(data.amountDue || data.total)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Details Card */}
            {data.paidDate && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Payment Date</span>
                    <span className="text-sm">{formatDate(data.paidDate)}</span>
                  </div>
                  {paidAmt > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Amount Received</span>
                      <span className="text-sm font-mono tabular-nums">{data.currency} {formatAmount(data.paidAmount)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Download */}
            <Button onClick={handleDownload} variant="outline" className="w-full gap-2">
              <Download className="w-4 h-4" /> Download PDF
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function MetaField({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: any;
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
