/**
 * GEA Admin — Vendor Bills (Unified Rebuild)
 * Combines AI-parsed and manual bill creation into one consistent flow.
 * Full i18n support. Integrated cost allocation with employee revenue ceiling.
 */
import Layout from "@/components/Layout";
import CurrencySelect from "@/components/CurrencySelect";
import { DatePicker, MonthPicker } from "@/components/DatePicker";
import { formatDate, formatAmount, countryName } from "@/lib/format";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { useState, useMemo, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter,
} from "@/components/ui/table";
import {
  FileStack, Plus, Search, ArrowLeft, Upload, Check, X, Loader2,
  Clock, AlertTriangle, DollarSign, FileText, Users, Pencil,
  XCircle, Trash2, Download, ChevronRight, Building2,
} from "lucide-react";
import { toast } from "sonner";

/* ─── Helpers ─── */
function safeDate(d: any): string {
  if (!d) return "";
  if (typeof d === "string") return d.substring(0, 10);
  return new Date(d).toISOString().substring(0, 10);
}
function safeMonth(d: any): string {
  if (!d) return "";
  if (typeof d === "string") return d.substring(0, 7);
  return new Date(d).toISOString().substring(0, 7);
}

const statusColorMap: Record<string, string> = {
  draft: "bg-gray-500/15 text-gray-600 border-gray-500/30",
  pending_approval: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  approved: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  paid: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  partially_paid: "bg-teal-500/15 text-teal-600 border-teal-500/30",
  overdue: "bg-red-500/15 text-red-600 border-red-500/30",
  cancelled: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  void: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

const categoryKeys = [
  "payroll_processing", "social_contributions", "tax_filing", "legal_compliance",
  "visa_immigration", "hr_advisory", "it_services", "office_rent", "insurance",
  "bank_charges", "consulting", "equipment", "travel", "marketing", "other",
];

const statusKeys = [
  "draft", "pending_approval", "approved", "paid", "partially_paid", "overdue", "cancelled", "void",
];

const itemTypeKeys = [
  "employment_cost", "service_fee", "visa_fee", "equipment_purchase", "deposit", "deposit_refund", "other",
];

interface LineItem {
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
  itemType: string;
  relatedEmployeeId?: string;
  employeeName?: string;
  relatedCountryCode?: string;
  matchConfidence?: number;
  matchReason?: string;
  confidence?: number;
}

function ConfidenceBadge({ score }: { score: number }) {
  if (score >= 85) return <Badge variant="outline" className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] px-1">{score}%</Badge>;
  if (score >= 50) return <Badge variant="outline" className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[10px] px-1">{score}%</Badge>;
  return <Badge variant="outline" className="bg-red-500/15 text-red-600 border-red-500/30 text-[10px] px-1">{score}%</Badge>;
}

/* ========== AI Upload Drawer ========== */
function AIUploadDrawer({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void }) {
  const { t } = useI18n();
  const [step, setStep] = useState<"upload" | "parsing" | "review">("upload");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [serviceMonth, setServiceMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [parsedResult, setParsedResult] = useState<any>(null);

  // Review state
  const [editedBill, setEditedBill] = useState<any>({});
  const [editedItems, setEditedItems] = useState<LineItem[]>([]);
  const [editedAllocations, setEditedAllocations] = useState<any[]>([]);
  const [editedPayment, setEditedPayment] = useState<any>(null);

  const vendorsQuery = trpc.vendors.list.useQuery({ limit: 500 });
  const vendors = (vendorsQuery.data as any)?.data || vendorsQuery.data || [];

  const uploadMutation = trpc.pdfParsing.uploadFile.useMutation();
  const parseMutation = trpc.pdfParsing.parseMultiFile.useMutation();
  const applyMutation = trpc.pdfParsing.applyMultiFileParse.useMutation();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (pendingFiles.length + files.length > 10) {
      toast.error(t("vendorBills.toast.maxFiles"));
      return;
    }
    setPendingFiles((prev) => [...prev, ...files]);
  }

  async function handleAnalyze() {
    if (!serviceMonth) { toast.error(t("vendorBills.toast.selectMonth")); return; }
    if (pendingFiles.length === 0) { toast.error(t("vendorBills.toast.addFile")); return; }

    setStep("parsing");
    try {
      // Step 1: Upload all files to OSS via tRPC (base64)
      const uploadedFiles: Array<{ fileUrl: string; fileKey: string; fileName: string; fileType: "invoice" | "payment_receipt" | "statement" | "other" }> = [];
      for (const pf of pendingFiles) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(pf);
        });
        const uploadResult = await uploadMutation.mutateAsync({
          fileName: pf.name,
          fileBase64: base64,
          contentType: pf.type || "application/pdf",
        });
        uploadedFiles.push({
          fileUrl: uploadResult.url,
          fileKey: uploadResult.key,
          fileName: pf.name,
          fileType: "invoice",
        });
      }

      // Step 2: Call multi-file AI parse
      const result = await parseMutation.mutateAsync({
        files: uploadedFiles,
        serviceMonth,
      });

      setParsedResult(result);

      // Populate review state from AI result
      const p = (result as any)?.parsed;
      if (p) {
        setEditedBill({
          vendorId: p.matchedVendorId || "",
          billNumber: p.billNumber || "",
          category: p.category || "other",
          billType: p.billType || "operational",
          billDate: p.billDate || "",
          dueDate: p.dueDate || "",
          billMonth: serviceMonth,
          currency: p.currency || "USD",
          subtotal: p.subtotal?.toString() || "",
          tax: p.tax?.toString() || "0",
          totalAmount: p.totalAmount?.toString() || "",
          description: p.description || "",
          internalNotes: p.internalNotes || "",
        });
        setEditedItems(
          (p.lineItems || []).map((li: any) => ({
            description: li.description || "",
            quantity: li.quantity?.toString() || "1",
            unitPrice: li.unitPrice?.toString() || "",
            amount: li.amount?.toString() || "0",
            itemType: li.itemType || "other",
            relatedEmployeeId: li.relatedEmployeeId?.toString() || "",
            employeeName: li.employeeName || "",
            relatedCountryCode: li.relatedCountryCode || "",
            matchConfidence: li.matchConfidence || 0,
            matchReason: li.matchReason || "",
            confidence: li.confidence || 0,
          }))
        );
        setEditedAllocations(
          (p.suggestedAllocations || []).map((a: any) => ({ ...a, enabled: true }))
        );
        if (p.payment) {
          setEditedPayment({ ...p.payment });
        }
      }
      setStep("review");
    } catch (err: any) {
      toast.error(err.message || t("vendorBills.toast.analysisFailed"));
      setStep("upload");
    }
  }

  async function handleConfirmCreate() {
    if (!editedBill.vendorId) { toast.error(t("vendorBills.toast.selectVendor")); return; }
    if (!editedBill.billNumber) { toast.error(t("vendorBills.toast.billNumberRequired")); return; }
    if (!editedBill.totalAmount) { toast.error(t("vendorBills.toast.totalRequired")); return; }

    try {
      const parsed = parsedResult?.parsed;
      await applyMutation.mutateAsync({
        vendorId: parseInt(editedBill.vendorId),
        billNumber: editedBill.billNumber,
        category: editedBill.category,
        billType: editedBill.billType || "operational",
        billDate: editedBill.billDate,
        dueDate: editedBill.dueDate,
        billMonth: editedBill.billMonth || serviceMonth,
        currency: editedBill.currency,
        subtotal: editedBill.subtotal,
        tax: editedBill.tax || "0",
        totalAmount: editedBill.totalAmount,
        description: editedBill.description || "",
        items: editedItems.map((item) => ({
          description: item.description,
          quantity: item.quantity || "1",
          unitPrice: item.unitPrice || item.amount,
          amount: item.amount,
          itemType: (item.itemType || "other") as "employment_cost" | "service_fee" | "visa_fee" | "equipment_purchase" | "deposit" | "deposit_refund" | "other",
          relatedEmployeeId: item.relatedEmployeeId ? parseInt(String(item.relatedEmployeeId)) : undefined,
          relatedCountryCode: item.relatedCountryCode || undefined,
        })),
        allocations: editedAllocations.filter((a) => a.enabled).map((a) => ({
          invoiceId: a.invoiceId,
          employeeId: a.employeeId,
          allocatedAmount: a.allocatedAmount?.toString(),
          description: a.reason || "",
        })),
        paymentInfo: editedPayment ? {
          paidDate: editedPayment.paidDate,
          paidAmount: editedPayment.paidAmount,
          bankName: editedPayment.bankName || "",
          bankReference: editedPayment.bankReference || "",
          bankFee: editedPayment.bankFee || "0",
        } : undefined,
        receiptFileUrl: parsedResult?.files?.[0]?.fileUrl || undefined,
        receiptFileKey: parsedResult?.files?.[0]?.fileKey || undefined,
      });

      toast.success(t("vendorBills.toast.createdSuccess"));
      onCreated();
      onOpenChange(false);
      // Reset
      setStep("upload");
      setPendingFiles([]);
      setParsedResult(null);
      setEditedBill({});
      setEditedItems([]);
      setEditedAllocations([]);
      setEditedPayment(null);
    } catch (err: any) {
      toast.error(err.message || t("vendorBills.toast.createFailed"));
    }
  }

  const cv = parsedResult?.parsed?.crossValidation;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("vendorBills.actions.analyzeWithAI")}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-6">
          {/* Step: Upload */}
          {step === "upload" && (
            <div className="space-y-4">
              <div>
                <Label>{t("vendorBills.details.serviceMonthLabel")}</Label>
                <MonthPicker value={serviceMonth} onChange={(v: string) => setServiceMonth(v)} placeholder={t("vendorBills.details.serviceMonthPlaceholder")} className="mt-1" />
              </div>
              <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => document.getElementById("ai-file-input")?.click()}>
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{t("vendorBills.aiUpload.dropzone")}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("vendorBills.aiUpload.dropzoneHint")}</p>
                <input id="ai-file-input" type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp" className="hidden" onChange={handleFileChange} />
              </div>
              {pendingFiles.length > 0 && (
                <div className="space-y-1">
                  {pendingFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
                      <span className="truncate">{f.name}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setPendingFiles(pendingFiles.filter((_, j) => j !== i))}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Button onClick={handleAnalyze} disabled={pendingFiles.length === 0} className="w-full">
                <Upload className="w-4 h-4 mr-2" />{t("vendorBills.actions.analyzeWithAI")}
              </Button>
            </div>
          )}

          {/* Step: Parsing */}
          {step === "parsing" && (
            <div className="text-center py-16">
              <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{t("vendorBills.review.aiAnalyzingDocs")}</p>
            </div>
          )}

          {/* Step: Review */}
          {step === "review" && (
            <div className="space-y-6">
              {/* Overall confidence */}
              {cv && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                  <span className="text-sm font-medium">{t("vendorBills.review.overallConfidence")}</span>
                  <ConfidenceBadge score={cv.overallConfidence || 0} />
                  {cv.warnings?.length > 0 && (
                    <span className="text-xs text-amber-600 ml-auto">{t("vendorBills.review.warningsCount", { count: String(cv.warnings.length) })}</span>
                  )}
                </div>
              )}

              {/* Bill Details Form (shared with manual) */}
              <BillFormFields bill={editedBill} onChange={setEditedBill} vendors={vendors} t={t} />

              {/* Payment Info (from POP) */}
              {editedPayment && (
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4" /> {t("vendorBills.payment.title")}
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-3 rounded-lg bg-emerald-50/50 border border-emerald-200/50">
                    <div>
                      <Label className="text-xs text-muted-foreground">{t("vendorBills.payment.dateLabel")}</Label>
                      <DatePicker value={editedPayment.paidDate || ""} onChange={(d: string) => setEditedPayment({ ...editedPayment, paidDate: d })} placeholder={t("vendorBills.payment.datePlaceholder")} />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">{t("vendorBills.payment.paidAmountLabel")}</Label>
                      <Input type="number" step="0.01" value={editedPayment.paidAmount || ""} onChange={(e) => setEditedPayment({ ...editedPayment, paidAmount: e.target.value })} className="h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">{t("vendorBills.payment.bankNameLabel")}</Label>
                      <Input value={editedPayment.bankName || ""} onChange={(e) => setEditedPayment({ ...editedPayment, bankName: e.target.value })} className="h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">{t("vendorBills.payment.transactionRefLabel")}</Label>
                      <Input value={editedPayment.bankReference || ""} onChange={(e) => setEditedPayment({ ...editedPayment, bankReference: e.target.value })} className="h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">{t("vendorBills.payment.bankFeeLabel")}</Label>
                      <Input type="number" step="0.01" value={editedPayment.bankFee || "0"} onChange={(e) => setEditedPayment({ ...editedPayment, bankFee: e.target.value })} className="h-8 text-sm" />
                    </div>
                    <div className="flex items-end">
                      <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => setEditedPayment(null)}>
                        <X className="w-3.5 h-3.5 mr-1" />{t("vendorBills.payment.removeButton")}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Line Items */}
              <LineItemsEditor items={editedItems} onChange={setEditedItems} t={t} showConfidence />

              {/* Allocation Suggestions */}
              {editedAllocations.length > 0 && (
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4" /> {t("vendorBills.review.aiAllocationsTitle", { enabled: String(editedAllocations.filter(a => a.enabled).length), total: String(editedAllocations.length) })}
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">{t("vendorBills.review.aiAllocationsHint")}</p>
                  <div className="rounded-lg border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs w-10">{t("vendorBills.review.useHeader")}</TableHead>
                          <TableHead className="text-xs">{t("vendorBills.lineItems.employeeHeader")}</TableHead>
                          <TableHead className="text-xs">{t("vendorBills.review.invoiceHeader")}</TableHead>
                          <TableHead className="text-xs text-right">{t("vendorBills.lineItems.amountHeader")}</TableHead>
                          <TableHead className="text-xs">{t("vendorBills.review.reasonHeader")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {editedAllocations.map((alloc, idx) => (
                          <TableRow key={idx} className={alloc.enabled ? "" : "opacity-50"}>
                            <TableCell>
                              <input type="checkbox" checked={alloc.enabled}
                                onChange={(e) => { const n = [...editedAllocations]; n[idx] = { ...n[idx], enabled: e.target.checked }; setEditedAllocations(n); }}
                                className="h-4 w-4 rounded border-gray-300" />
                            </TableCell>
                            <TableCell className="text-xs">ID: {alloc.employeeId}</TableCell>
                            <TableCell className="text-xs">ID: {alloc.invoiceId}</TableCell>
                            <TableCell>
                              <Input type="number" step="0.01" value={alloc.allocatedAmount} onChange={(e) => {
                                const n = [...editedAllocations]; n[idx] = { ...n[idx], allocatedAmount: e.target.value }; setEditedAllocations(n);
                              }} className="h-7 text-xs text-right" />
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]" title={alloc.reason}>{alloc.reason}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* AI Notes */}
              {cv?.notes?.length > 0 && (
                <div className="p-3 rounded-lg bg-muted/50 border space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">{t("vendorBills.review.aiNotes")}</p>
                  {cv.notes.map((n: string, i: number) => (
                    <p key={i} className="text-xs text-muted-foreground">{n}</p>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => { setStep("upload"); setParsedResult(null); setPendingFiles([]); }}>
                  <Upload className="w-4 h-4 mr-2" />{t("vendorBills.actions.backToUpload")}
                </Button>
                <Button onClick={handleConfirmCreate} disabled={applyMutation.isPending} className="gap-2">
                  {applyMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />{t("vendorBills.actions.creatingBill")}</>
                  ) : (
                    <><Check className="w-4 h-4" />{t("vendorBills.actions.createBill")}</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ========== Shared Bill Form Fields ========== */
function BillFormFields({ bill, onChange, vendors, t }: { bill: any; onChange: (b: any) => void; vendors: any[]; t: (key: string) => string }) {
  const set = (key: string, val: any) => onChange({ ...bill, [key]: val });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">{t("vendorBills.detail.vendor")} *</Label>
          <Select value={bill.vendorId?.toString() || ""} onValueChange={(v) => set("vendorId", v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue placeholder={t("vendorBills.createBill.selectVendor")} /></SelectTrigger>
            <SelectContent>
              {vendors.map((v: any) => (
                <SelectItem key={v.id} value={v.id.toString()}>{v.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">{t("vendorBills.table.billNumberHeader")} *</Label>
          <Input value={bill.billNumber || ""} onChange={(e) => set("billNumber", e.target.value)} className="h-8 text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">{t("vendorBills.createBill.billType")}</Label>
          <Select value={bill.billType || "operational"} onValueChange={(v) => set("billType", v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="operational">{t("vendorBills.billType.operational")}</SelectItem>
              <SelectItem value="deposit">{t("vendorBills.billType.deposit")}</SelectItem>
              <SelectItem value="deposit_refund">{t("vendorBills.billType.deposit_refund")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">{t("vendorBills.filters.allCategories")}</Label>
          <Select value={bill.category || "other"} onValueChange={(v) => set("category", v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {categoryKeys.map((c) => (
                <SelectItem key={c} value={c}>{t(`vendorBills.category.${c}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">{t("vendorBills.details.serviceMonthLabel")}</Label>
          <MonthPicker value={bill.billMonth || ""} onChange={(v: string) => set("billMonth", v)} placeholder={t("vendorBills.details.serviceMonthPlaceholder")} className="h-8 text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">{t("vendorBills.details.billDateLabel")}</Label>
          <DatePicker value={bill.billDate || ""} onChange={(d: string) => set("billDate", d)} placeholder={t("vendorBills.details.billDatePlaceholder")} />
        </div>
        <div>
          <Label className="text-xs">{t("vendorBills.details.dueDateLabel")}</Label>
          <DatePicker value={bill.dueDate || ""} onChange={(d: string) => set("dueDate", d)} placeholder={t("vendorBills.details.dueDatePlaceholder")} />
        </div>
        <div>
          <Label className="text-xs">{t("vendorBills.details.currencyLabel")}</Label>
          <CurrencySelect value={bill.currency || "USD"} onValueChange={(v) => set("currency", v)} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">{t("vendorBills.details.subtotalLabel")}</Label>
          <Input type="number" step="0.01" value={bill.subtotal || ""} onChange={(e) => set("subtotal", e.target.value)} className="h-8 text-sm" />
        </div>
        <div>
          <Label className="text-xs">{t("vendorBills.details.taxLabel")}</Label>
          <Input type="number" step="0.01" value={bill.tax || "0"} onChange={(e) => set("tax", e.target.value)} className="h-8 text-sm" />
        </div>
        <div>
          <Label className="text-xs">{t("vendorBills.details.totalAmountLabel")} *</Label>
          <Input type="number" step="0.01" value={bill.totalAmount || ""} onChange={(e) => set("totalAmount", e.target.value)} className="h-8 text-sm font-medium" />
        </div>
      </div>
      <div>
        <Label className="text-xs">{t("vendorBills.details.descriptionLabel")}</Label>
        <Textarea value={bill.description || ""} onChange={(e) => set("description", e.target.value)} rows={2} className="text-sm" />
      </div>
    </div>
  );
}

/* ========== Shared Line Items Editor ========== */
function LineItemsEditor({ items, onChange, t, showConfidence = false }: { items: LineItem[]; onChange: (items: LineItem[]) => void; t: (key: string) => string; showConfidence?: boolean }) {
  function addItem() {
    onChange([...items, { description: "", quantity: "1", unitPrice: "0", amount: "0", itemType: "other" }]);
  }
  function removeItem(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }
  function updateItem(idx: number, field: string, value: string) {
    const n = [...items];
    n[idx] = { ...n[idx], [field]: value };
    // Auto-calc amount from qty * unitPrice
    if (field === "quantity" || field === "unitPrice") {
      const qty = parseFloat(field === "quantity" ? value : n[idx].quantity) || 0;
      const up = parseFloat(field === "unitPrice" ? value : n[idx].unitPrice) || 0;
      n[idx].amount = (qty * up).toFixed(2);
    }
    onChange(n);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <FileText className="w-4 h-4" /> {t("vendorBills.createBill.lineItemsTitle")} ({items.length})
        </Label>
        <Button variant="outline" size="sm" onClick={addItem} className="h-7 text-xs">
          <Plus className="w-3 h-3 mr-1" /> {t("vendorBills.createBill.addLineItem")}
        </Button>
      </div>
      {items.length > 0 && (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">{t("vendorBills.details.descriptionLabel")}</TableHead>
                <TableHead className="text-xs w-28">{t("vendorBills.createBill.costType")}</TableHead>
                <TableHead className="text-xs text-right w-16">{t("vendorBills.lineItems.quantityHeader")}</TableHead>
                <TableHead className="text-xs text-right w-24">{t("vendorBills.lineItems.unitPriceHeader")}</TableHead>
                <TableHead className="text-xs text-right w-24">{t("vendorBills.lineItems.amountHeader")}</TableHead>
                {showConfidence && <TableHead className="text-xs w-36">{t("vendorBills.lineItems.employeeHeader")}</TableHead>}
                {showConfidence && <TableHead className="text-xs w-16">{t("vendorBills.lineItems.confidenceHeader")}</TableHead>}
                <TableHead className="w-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, idx) => {
                const matchConf = item.matchConfidence || 0;
                const rowBg = showConfidence ? (matchConf >= 85 ? "bg-emerald-50/30" : matchConf >= 50 ? "bg-amber-50/50" : item.relatedEmployeeId ? "bg-red-50/30" : "") : "";
                return (
                  <TableRow key={idx} className={rowBg}>
                    <TableCell>
                      <Input value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} className="h-7 text-xs" />
                    </TableCell>
                    <TableCell>
                      <select value={item.itemType || "other"} onChange={(e) => updateItem(idx, "itemType", e.target.value)}
                        className="h-7 text-xs border rounded px-1 w-full bg-background">
                        {itemTypeKeys.map((k) => (
                          <option key={k} value={k}>{t(`vendorBills.itemType.${k}`)}</option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>
                      <Input type="number" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} className="h-7 text-xs text-right" />
                    </TableCell>
                    <TableCell>
                      <Input type="number" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(idx, "unitPrice", e.target.value)} className="h-7 text-xs text-right" />
                    </TableCell>
                    <TableCell>
                      <Input type="number" step="0.01" value={item.amount} onChange={(e) => updateItem(idx, "amount", e.target.value)} className="h-7 text-xs text-right font-medium" />
                    </TableCell>
                    {showConfidence && (
                      <TableCell>
                        <div className="text-xs" title={item.matchReason || ""}>
                          <div className="flex items-center gap-1 truncate max-w-[140px]">
                            {item.employeeName || "\u2014"}
                            {item.relatedEmployeeId && matchConf >= 85 && <span className="text-emerald-600" title="High confidence">●</span>}
                            {item.relatedEmployeeId && matchConf >= 50 && matchConf < 85 && <span className="text-amber-500" title="Medium confidence">●</span>}
                            {item.relatedEmployeeId && matchConf < 50 && <span className="text-red-500" title="Low confidence">●</span>}
                          </div>
                          {item.matchReason && <p className="text-[10px] text-muted-foreground truncate">{item.matchReason}</p>}
                        </div>
                      </TableCell>
                    )}
                    {showConfidence && <TableCell><ConfidenceBadge score={item.confidence || 0} /></TableCell>}
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeItem(idx)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

/* ========== Vendor Bill List ========== */
function VendorBillList() {
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  // Manual create state
  const [newBill, setNewBill] = useState<any>({
    vendorId: "", billNumber: "", category: "other", billType: "operational",
    billDate: "", dueDate: "", billMonth: "", currency: "USD",
    subtotal: "", tax: "0", totalAmount: "", description: "",
  });
  const [newItems, setNewItems] = useState<LineItem[]>([]);

  const { data, isLoading, refetch } = trpc.vendorBills.list.useQuery({
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    vendorId: vendorFilter !== "all" ? parseInt(vendorFilter) : undefined,
    limit: 200,
  });
  const vendorsQuery = trpc.vendors.list.useQuery({ limit: 500 });
  const vendors = (vendorsQuery.data as any)?.data || vendorsQuery.data || [];

  const bills = useMemo(() => {
    const raw = (data as any)?.data || data || [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const stats = useMemo(() => {
    let total = 0, pending = 0, overdue = 0, totalAmount = 0;
    bills.forEach((b: any) => {
      total++;
      if (b.status === "pending_approval" || b.status === "draft") pending++;
      if (b.status === "overdue") overdue++;
      totalAmount += parseFloat(b.totalAmount || "0");
    });
    return { total, pending, overdue, totalAmount };
  }, [bills]);

  const createMutation = trpc.vendorBills.create.useMutation({
    onSuccess: () => {
      toast.success(t("vendorBills.toast.createdSuccess"));
      setCreateOpen(false);
      setNewBill({ vendorId: "", billNumber: "", category: "other", billType: "operational", billDate: "", dueDate: "", billMonth: "", currency: "USD", subtotal: "", tax: "0", totalAmount: "", description: "" });
      setNewItems([]);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  function handleManualCreate() {
    if (!newBill.vendorId) { toast.error(t("vendorBills.toast.selectVendor")); return; }
    if (!newBill.billNumber) { toast.error(t("vendorBills.toast.billNumberRequired")); return; }
    if (!newBill.totalAmount) { toast.error(t("vendorBills.toast.totalRequired")); return; }

    createMutation.mutate({
      vendorId: parseInt(newBill.vendorId),
      billNumber: newBill.billNumber,
      category: newBill.category,
      billType: newBill.billType || "operational",
      billDate: newBill.billDate || new Date().toISOString().slice(0, 10),
      dueDate: newBill.dueDate || undefined,
      billMonth: newBill.billMonth || undefined,
      currency: newBill.currency,
      subtotal: newBill.subtotal || newBill.totalAmount,
      tax: newBill.tax || "0",
      totalAmount: newBill.totalAmount,
      description: newBill.description || "",
      items: newItems.length > 0 ? newItems.map((item) => ({
        description: item.description,
        quantity: item.quantity || "1",
        unitPrice: item.unitPrice || item.amount,
        amount: item.amount,
        itemType: (item.itemType || "other") as "employment_cost" | "service_fee" | "visa_fee" | "equipment_purchase" | "deposit" | "deposit_refund" | "other",
      })) : undefined,
    });
  }

  function handleExportCSV() {
    const headers = ["Bill #", "Vendor", "Category", "Status", "Bill Date", "Due Date", "Currency", "Total", "Paid"];
    const rows = bills.map((b: any) => [
      b.billNumber, b.vendor?.name || "", b.category, b.status,
      safeDate(b.billDate), safeDate(b.dueDate), b.currency,
      b.totalAmount, b.paidAmount || "0",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c: any) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `vendor-bills-${new Date().toISOString().substring(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  return (
    <Layout breadcrumb={["GEA", t("vendorBills.title")]}>
      <div className="p-6 space-y-6 page-enter">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("vendorBills.title")}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={bills.length === 0}>
              <Download className="w-4 h-4 mr-1" /> {t("vendorBills.actions.export")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> {t("vendorBills.actions.createBill")}
            </Button>
            <Button size="sm" onClick={() => setAiDrawerOpen(true)}>
              <Upload className="w-4 h-4 mr-1" /> {t("vendorBills.actions.analyzeWithAI")}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t("vendorBills.stats.totalBills"), value: stats.total, icon: FileStack, color: "text-foreground" },
            { label: t("vendorBills.stats.totalAmount"), value: formatAmount(stats.totalAmount), icon: DollarSign, color: "text-blue-600" },
            { label: t("vendorBills.stats.pending"), value: stats.pending, icon: Clock, color: "text-amber-600" },
            { label: t("vendorBills.stats.overdue"), value: stats.overdue, icon: AlertTriangle, color: "text-red-600" },
          ].map((s, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className={`w-5 h-5 ${s.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-bold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={t("vendorBills.filters.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder={t("vendorBills.filters.allStatuses")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("vendorBills.filters.allStatuses")}</SelectItem>
              {statusKeys.map((s) => <SelectItem key={s} value={s}>{t(`vendorBills.status.${s}`)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder={t("vendorBills.filters.allCategories")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("vendorBills.filters.allCategories")}</SelectItem>
              {categoryKeys.map((c) => <SelectItem key={c} value={c}>{t(`vendorBills.category.${c}`)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={vendorFilter} onValueChange={setVendorFilter}>
            <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder={t("vendorBills.filters.allVendors")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("vendorBills.filters.allVendors")}</SelectItem>
              {vendors.map((v: any) => <SelectItem key={v.id} value={v.id.toString()}>{v.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : bills.length === 0 ? (
          <div className="text-center py-16 border rounded-lg">
            <FileStack className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">{t("vendorBills.empty.title")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("vendorBills.empty.prompt")}</p>
          </div>
        ) : (
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">{t("vendorBills.table.billNumberHeader")}</TableHead>
                  <TableHead className="text-xs">{t("vendorBills.table.vendorHeader")}</TableHead>
                  <TableHead className="text-xs">{t("vendorBills.table.statusHeader")}</TableHead>
                  <TableHead className="text-xs">{t("vendorBills.table.billDateHeader")}</TableHead>
                  <TableHead className="text-xs">{t("vendorBills.table.dueDateHeader")}</TableHead>
                  <TableHead className="text-xs text-right">{t("vendorBills.table.totalHeader")}</TableHead>
                  <TableHead className="text-xs text-right">{t("vendorBills.table.paidHeader")}</TableHead>
                  <TableHead className="text-xs text-right">{t("vendorBills.table.balanceHeader")}</TableHead>
                  <TableHead className="w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill: any) => {
                  const total = parseFloat(bill.totalAmount || "0");
                  const paid = parseFloat(bill.paidAmount || "0");
                  const balance = total - paid;
                  return (
                    <TableRow key={bill.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setLocation(`/vendor-bills/${bill.id}`)}>
                      <TableCell className="font-medium text-sm">{bill.billNumber}</TableCell>
                      <TableCell className="text-sm">{bill.vendor?.name || "\u2014"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${statusColorMap[bill.status] || ""}`}>
                          {t(`vendorBills.status.${bill.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(bill.billDate)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(bill.dueDate)}</TableCell>
                      <TableCell className="text-sm text-right font-medium">{bill.currency} {formatAmount(total)}</TableCell>
                      <TableCell className="text-sm text-right">{formatAmount(paid)}</TableCell>
                      <TableCell className={`text-sm text-right font-medium ${balance > 0 ? "text-red-600" : "text-emerald-600"}`}>
                        {formatAmount(balance)}
                      </TableCell>
                      <TableCell><ChevronRight className="w-4 h-4 text-muted-foreground" /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={5} className="text-xs font-medium">{t("common.total")}</TableCell>
                  <TableCell className="text-right text-xs font-bold">{formatAmount(bills.reduce((s: number, b: any) => s + parseFloat(b.totalAmount || "0"), 0))}</TableCell>
                  <TableCell className="text-right text-xs font-bold">{formatAmount(bills.reduce((s: number, b: any) => s + parseFloat(b.paidAmount || "0"), 0))}</TableCell>
                  <TableCell className="text-right text-xs font-bold">{formatAmount(bills.reduce((s: number, b: any) => s + parseFloat(b.totalAmount || "0") - parseFloat(b.paidAmount || "0"), 0))}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}

        {/* Manual Create Drawer */}
        <Sheet open={createOpen} onOpenChange={setCreateOpen}>
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{t("vendorBills.actions.createBill")}</SheetTitle>
            </SheetHeader>
            <div className="py-6 space-y-6">
              <BillFormFields bill={newBill} onChange={setNewBill} vendors={vendors} t={t} />
              <LineItemsEditor items={newItems} onChange={setNewItems} t={t} />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleManualCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? t("vendorBills.actions.creating") : t("vendorBills.actions.createBill")}
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* AI Upload Drawer */}
        <AIUploadDrawer open={aiDrawerOpen} onOpenChange={setAiDrawerOpen} onCreated={refetch} />
      </div>
    </Layout>
  );
}

/* ========== Vendor Bill Detail ========== */
function VendorBillDetail() {
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/vendor-bills/:id");
  const billId = params?.id ? parseInt(params.id) : 0;

  const [editOpen, setEditOpen] = useState(false);
  const [allocOpen, setAllocOpen] = useState(false);
  const [allocEmployeeId, setAllocEmployeeId] = useState("");
  const [allocInvoiceId, setAllocInvoiceId] = useState("");
  const [allocAmount, setAllocAmount] = useState("");
  const [allocNote, setAllocNote] = useState("");

  const { data: bill, isLoading, refetch } = trpc.vendorBills.get.useQuery(
    { id: billId },
    { enabled: billId > 0 }
  );

  const [editBill, setEditBill] = useState<any>({});

  // Allocation summary
  const { data: allocSummary } = trpc.allocations.billSummary.useQuery(
    { vendorBillId: billId },
    { enabled: billId > 0 }
  );

  // Allocation list
  const { data: allocations, refetch: refetchAllocs } = trpc.allocations.listByBill.useQuery(
    { vendorBillId: billId },
    { enabled: billId > 0 }
  );

  // Employees for allocation
  const { data: employeesData } = trpc.employees.list.useQuery({ limit: 500 });
  const employees = useMemo(() => {
    const raw = (employeesData as any)?.data || employeesData || [];
    return Array.isArray(raw) ? raw : [];
  }, [employeesData]);

  // Invoices for allocation
  const { data: invoicesData } = trpc.invoices.list.useQuery({ limit: 500 });
  const invoices = useMemo(() => {
    const raw = (invoicesData as any)?.data || invoicesData || [];
    return Array.isArray(raw) ? raw : [];
  }, [invoicesData]);

  // Employee monthly revenue (for selected employee)
  const { data: empRevenue } = trpc.allocations.singleEmployeeRevenue.useQuery(
    {
      employeeId: allocEmployeeId ? parseInt(allocEmployeeId) : 0,
      serviceMonth: bill?.billMonth || safeMonth(bill?.billDate) || "",
    },
    { enabled: !!allocEmployeeId && allocEmployeeId !== "" && billId > 0 }
  );

  // Mutations
  const updateMutation = trpc.vendorBills.update.useMutation({
    onSuccess: () => { toast.success(t("vendorBills.toast.updated")); setEditOpen(false); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const statusMutation = trpc.vendorBills.update.useMutation({
    onSuccess: () => { refetch(); },
    onError: (err: any) => toast.error(err.message),
  });

  const createAllocMutation = trpc.allocations.create.useMutation({
    onSuccess: () => {
      toast.success(t("vendorBills.toast.allocationCreated"));
      setAllocOpen(false);
      setAllocEmployeeId(""); setAllocInvoiceId(""); setAllocAmount(""); setAllocNote("");
      refetchAllocs(); refetch();
    },
    onError: (err) => toast.error(err.message || t("vendorBills.toast.allocationFailed")),
  });

  const deleteAllocMutation = trpc.allocations.delete.useMutation({
    onSuccess: () => { toast.success(t("vendorBills.toast.allocationDeleted")); refetchAllocs(); refetch(); },
    onError: (err) => toast.error(err.message || t("vendorBills.toast.deleteFailed")),
  });

  function openEdit() {
    if (!bill) return;
    setEditBill({
      billNumber: bill.billNumber,
      category: bill.category,
      billType: (bill as any).billType || "operational",
      billDate: safeDate(bill.billDate),
      dueDate: safeDate(bill.dueDate),
      billMonth: bill.billMonth || "",
      currency: bill.currency,
      subtotal: bill.subtotal?.toString() || "",
      tax: bill.tax?.toString() || "0",
      totalAmount: bill.totalAmount?.toString() || "",
      description: bill.description || "",
    });
    setEditOpen(true);
  }

  function handleSaveEdit() {
    updateMutation.mutate({
      id: billId,
      billNumber: editBill.billNumber,
      category: editBill.category,
      billType: editBill.billType,
      billDate: editBill.billDate || undefined,
      dueDate: editBill.dueDate || undefined,
      billMonth: editBill.billMonth || undefined,
      currency: editBill.currency,
      subtotal: editBill.subtotal,
      tax: editBill.tax || "0",
      totalAmount: editBill.totalAmount,
      description: editBill.description,
    });
  }

  function handleCreateAlloc() {
    if (!allocEmployeeId || !allocInvoiceId || !allocAmount) {
      toast.error(t("vendorBills.toast.fillRequired"));
      return;
    }
    createAllocMutation.mutate({
      vendorBillId: billId,
      invoiceId: parseInt(allocInvoiceId),
      employeeId: parseInt(allocEmployeeId),
      allocatedAmount: allocAmount,
      description: allocNote || "",
    });
  }

  if (isLoading) {
    return (
      <Layout breadcrumb={["GEA", t("vendorBills.title"), "..."]}>
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full" />
        </div>
      </Layout>
    );
  }

  if (!bill) {
    return (
      <Layout breadcrumb={["GEA", t("vendorBills.title")]}>
        <div className="p-6 text-center py-16">
          <FileStack className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-muted-foreground">{t("vendorBills.detail.notFound")}</p>
          <Button variant="link" onClick={() => setLocation("/vendor-bills")} className="mt-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> {t("vendorBills.detail.backToList")}
          </Button>
        </div>
      </Layout>
    );
  }

  const totalAmt = parseFloat(bill.totalAmount?.toString() || "0");
  const paidAmt = parseFloat((bill as any).paidAmount?.toString() || "0");
  const allocatedAmt = parseFloat((allocSummary as any)?.allocatedTotal?.toString() || "0");
  const unallocatedAmt = totalAmt - allocatedAmt;
  const allocs = Array.isArray(allocations) ? allocations : (allocations as any)?.data || [];

  // Revenue info for selected employee
  const revTotal = empRevenue ? parseFloat((empRevenue as any)?.totalRevenue?.toString() || "0") : 0;
  const allocAmtNum = parseFloat(allocAmount || "0");
  const exceedsRevenue = allocEmployeeId && revTotal > 0 && allocAmtNum > revTotal;

  return (
    <Layout breadcrumb={["GEA", t("vendorBills.title"), bill.billNumber || `#${billId}`]}>
      <div className="p-6 space-y-6 page-enter">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/vendor-bills")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{bill.billNumber}</h1>
              <p className="text-sm text-muted-foreground">{(bill as any).vendor?.name || ""}</p>
            </div>
            <Badge variant="outline" className={statusColorMap[bill.status] || ""}>
              {t(`vendorBills.status.${bill.status}`)}
            </Badge>
          </div>
          <div className="flex gap-2">
            {bill.status === "draft" && (
              <Button size="sm" variant="outline" onClick={() => statusMutation.mutate({ id: billId, status: "pending_approval" })}>
                {t("vendorBills.actions.submitApproval")}
              </Button>
            )}
            {bill.status === "pending_approval" && (
              <>
                <Button size="sm" variant="outline" className="text-red-600" onClick={() => statusMutation.mutate({ id: billId, status: "draft" })}>
                  {t("vendorBills.actions.reject")}
                </Button>
                <Button size="sm" onClick={() => statusMutation.mutate({ id: billId, status: "approved" })}>
                  <Check className="w-4 h-4 mr-1" /> {t("vendorBills.actions.approve")}
                </Button>
              </>
            )}
            {(bill.status === "approved" || bill.status === "partially_paid") && (
              <Button size="sm" onClick={() => statusMutation.mutate({ id: billId, status: "paid" })}>
                <DollarSign className="w-4 h-4 mr-1" /> {t("vendorBills.actions.markPaid")}
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={openEdit}>
              <Pencil className="w-4 h-4 mr-1" /> {t("common.edit")}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{t("vendorBills.detail.amount")}</p>
              <p className="text-lg font-bold">{bill.currency} {formatAmount(totalAmt)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{t("vendorBills.table.paidHeader")}</p>
              <p className="text-lg font-bold text-emerald-600">{formatAmount(paidAmt)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{t("vendorBills.detail.allocated")}</p>
              <p className="text-lg font-bold text-blue-600">{formatAmount(allocatedAmt)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{t("vendorBills.allocations.unallocated")}</p>
              <p className={`text-lg font-bold ${unallocatedAmt > 0 ? "text-amber-600" : "text-emerald-600"}`}>{formatAmount(unallocatedAmt)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Bill Info */}
        <Card>
          <CardHeader><CardTitle className="text-sm">{t("vendorBills.detail.dates")}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">{t("vendorBills.details.billDateLabel")}</p>
                <p>{formatDate(bill.billDate) || "\u2014"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("vendorBills.details.dueDateLabel")}</p>
                <p>{formatDate(bill.dueDate) || "\u2014"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("vendorBills.details.serviceMonthLabel")}</p>
                <p>{bill.billMonth || "\u2014"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("vendorBills.filters.allCategories")}</p>
                <p>{t(`vendorBills.category.${bill.category}`)}</p>
              </div>
            </div>
            {bill.description && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground">{t("vendorBills.details.descriptionLabel")}</p>
                <p className="text-sm mt-1">{bill.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attachment */}
        {(bill as any).receiptFileUrl && (
          <Card>
            <CardContent className="p-4">
              <a href={(bill as any).receiptFileUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline">
                <FileText className="w-4 h-4" /> {t("vendorBills.detail.viewAttachment")}
              </a>
            </CardContent>
          </Card>
        )}

        {/* Line Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t("vendorBills.detail.lineItems")} ({(bill as any).items?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {(bill as any).items?.length > 0 ? (
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">{t("vendorBills.details.descriptionLabel")}</TableHead>
                      <TableHead className="text-xs">{t("vendorBills.createBill.costType")}</TableHead>
                      <TableHead className="text-xs text-right">{t("vendorBills.lineItems.quantityHeader")}</TableHead>
                      <TableHead className="text-xs text-right">{t("vendorBills.lineItems.unitPriceHeader")}</TableHead>
                      <TableHead className="text-xs text-right">{t("vendorBills.lineItems.amountHeader")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(bill as any).items.map((item: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="text-sm">{item.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{t(`vendorBills.itemType.${item.itemType || "other"}`)}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-right">{item.quantity}</TableCell>
                        <TableCell className="text-sm text-right">{formatAmount(parseFloat(item.unitPrice || "0"))}</TableCell>
                        <TableCell className="text-sm text-right font-medium">{formatAmount(parseFloat(item.amount || "0"))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">{t("vendorBills.detail.noLineItems")}</p>
            )}
          </CardContent>
        </Card>

        {/* Cost Allocations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">{t("vendorBills.detail.costAllocations")}</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setAllocOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> {t("vendorBills.actions.newAllocation")}
            </Button>
          </CardHeader>
          <CardContent>
            {allocs.length > 0 ? (
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">{t("vendorBills.lineItems.employeeHeader")}</TableHead>
                      <TableHead className="text-xs">{t("vendorBills.review.invoiceHeader")}</TableHead>
                      <TableHead className="text-xs text-right">{t("vendorBills.lineItems.amountHeader")}</TableHead>
                      <TableHead className="text-xs">{t("vendorBills.allocations.noteLabel")}</TableHead>
                      <TableHead className="w-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allocs.map((a: any) => (
                      <TableRow key={a.id}>
                        <TableCell className="text-sm">{a.employeeName || t("vendorBills.allocations.unknownEmployee")}{a.employeeCode ? ` (${a.employeeCode})` : ""}</TableCell>
                        <TableCell className="text-sm">{a.invoiceNumber || t("vendorBills.allocations.unknownInvoice")}{a.invoiceCurrency && a.invoiceTotal ? ` - ${a.invoiceCurrency} ${formatAmount(parseFloat(a.invoiceTotal))}` : ""}</TableCell>
                        <TableCell className="text-sm text-right font-medium">{formatAmount(parseFloat(a.allocatedAmount || "0"))}</TableCell>
                        <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">{a.description || "\u2014"}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteAllocMutation.mutate({ id: a.id })}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">{t("vendorBills.allocations.noAllocations")}</p>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{t("common.edit")}</DialogTitle></DialogHeader>
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{t("vendorBills.table.billNumberHeader")}</Label>
                  <Input value={editBill.billNumber || ""} onChange={(e) => setEditBill({ ...editBill, billNumber: e.target.value })} className="h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">{t("vendorBills.createBill.billType")}</Label>
                  <Select value={editBill.billType || "operational"} onValueChange={(v) => setEditBill({ ...editBill, billType: v })}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operational">{t("vendorBills.billType.operational")}</SelectItem>
                      <SelectItem value="deposit">{t("vendorBills.billType.deposit")}</SelectItem>
                      <SelectItem value="deposit_refund">{t("vendorBills.billType.deposit_refund")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">{t("vendorBills.details.billDateLabel")}</Label>
                  <DatePicker value={editBill.billDate || ""} onChange={(d: string) => setEditBill({ ...editBill, billDate: d })} placeholder="" />
                </div>
                <div>
                  <Label className="text-xs">{t("vendorBills.details.dueDateLabel")}</Label>
                  <DatePicker value={editBill.dueDate || ""} onChange={(d: string) => setEditBill({ ...editBill, dueDate: d })} placeholder="" />
                </div>
                <div>
                  <Label className="text-xs">{t("vendorBills.details.serviceMonthLabel")}</Label>
                  <MonthPicker value={editBill.billMonth || ""} onChange={(v: string) => setEditBill({ ...editBill, billMonth: v })} placeholder={t("vendorBills.details.serviceMonthPlaceholder")} className="h-8 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">{t("vendorBills.details.subtotalLabel")}</Label>
                  <Input type="number" step="0.01" value={editBill.subtotal || ""} onChange={(e) => setEditBill({ ...editBill, subtotal: e.target.value })} className="h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">{t("vendorBills.details.taxLabel")}</Label>
                  <Input type="number" step="0.01" value={editBill.tax || "0"} onChange={(e) => setEditBill({ ...editBill, tax: e.target.value })} className="h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">{t("vendorBills.details.totalAmountLabel")} *</Label>
                  <Input type="number" step="0.01" value={editBill.totalAmount || ""} onChange={(e) => setEditBill({ ...editBill, totalAmount: e.target.value })} className="h-8 text-sm font-medium" />
                </div>
              </div>
              <div>
                <Label className="text-xs">{t("vendorBills.details.descriptionLabel")}</Label>
                <Textarea value={editBill.description || ""} onChange={(e) => setEditBill({ ...editBill, description: e.target.value })} rows={2} className="text-sm" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? t("vendorBills.actions.saving") : t("vendorBills.actions.saveChanges")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Allocation Dialog */}
        <Dialog open={allocOpen} onOpenChange={setAllocOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{t("vendorBills.actions.createAllocation")}</DialogTitle></DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <Label className="text-xs">{t("vendorBills.allocations.selectEmployee")}</Label>
                <Select value={allocEmployeeId} onValueChange={setAllocEmployeeId}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder={t("vendorBills.allocations.selectEmployee")} /></SelectTrigger>
                  <SelectContent>
                    {employees.map((emp: any) => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        {emp.fullName || emp.firstName + " " + emp.lastName} ({emp.employeeCode || emp.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {allocEmployeeId && empRevenue && (
                  <div className="mt-1 p-2 rounded bg-muted/50 text-xs">
                    <span className="text-muted-foreground">{t("vendorBills.allocations.revenueHint")}: </span>
                    <span className="font-medium">{formatAmount(revTotal)}</span>
                    {(empRevenue as any)?.breakdown?.map((b: any, i: number) => (
                      <span key={i} className="ml-2 text-muted-foreground">({b.itemType}: {formatAmount(parseFloat(b.total || "0"))})</span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Label className="text-xs">{t("vendorBills.allocations.selectInvoice")}</Label>
                <Select value={allocInvoiceId} onValueChange={setAllocInvoiceId}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder={t("vendorBills.allocations.selectInvoice")} /></SelectTrigger>
                  <SelectContent>
                    {invoices.map((inv: any) => (
                      <SelectItem key={inv.id} value={inv.id.toString()}>
                        {inv.invoiceNumber} - {inv.currency} {formatAmount(parseFloat(inv.totalAmount || "0"))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">{t("vendorBills.allocations.amountLabel")}</Label>
                <Input type="number" step="0.01" value={allocAmount} onChange={(e) => setAllocAmount(e.target.value)} className="h-8 text-sm" />
                {exceedsRevenue && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {t("vendorBills.allocations.revenueExceeded")}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-xs">{t("vendorBills.allocations.noteLabel")}</Label>
                <Input value={allocNote} onChange={(e) => setAllocNote(e.target.value)} className="h-8 text-sm" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAllocOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleCreateAlloc} disabled={createAllocMutation.isPending}>
                {createAllocMutation.isPending ? t("vendorBills.actions.creating") : t("vendorBills.actions.createAllocation")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

/* ========== Main Page Router ========== */
export default function VendorBills() {
  const [isDetail] = useRoute("/vendor-bills/:id");
  return isDetail ? <VendorBillDetail /> : <VendorBillList />;
}
