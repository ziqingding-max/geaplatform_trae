/**
 * GEA Admin — Vendor Bill Management
 * List + Detail view for tracking payments to vendors (Accounts Payable)
 * Includes: Multi-file upload → AI parse with system context → Cross-validation → Review & confirm → Create bill + allocations
 */
import Layout from "@/components/Layout";
import CurrencySelect from "@/components/CurrencySelect";
import { formatDate, formatMonth, formatAmount } from "@/lib/format";
import { DatePicker, MonthPicker } from "@/components/DatePicker";
import { trpc } from "@/lib/trpc";
import { useState, useMemo, useRef, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  FileStack, Plus, Search, ArrowLeft, ChevronRight, DollarSign, Calendar,
  Pencil, Trash2, CheckCircle2, Clock, AlertTriangle, XCircle, Eye, Building2,
  Upload, Sparkles, FileText, Loader2, Bot, Check, X, FileUp, Info, Shield,
  ArrowRightLeft, Users, Receipt,
} from "lucide-react";
import { toast } from "sonner";

import { useI18n } from "@/lib/i18n";
const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600 border-gray-300",
  pending_approval: "bg-amber-100 text-amber-700 border-amber-300",
  approved: "bg-blue-100 text-blue-700 border-blue-300",
  paid: "bg-emerald-100 text-emerald-700 border-emerald-300",
  partially_paid: "bg-cyan-100 text-cyan-700 border-cyan-300",
  overdue: "bg-red-100 text-red-700 border-red-300",
  cancelled: "bg-gray-100 text-gray-500 border-gray-300",
  void: "bg-slate-100 text-slate-500 border-slate-300",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  pending_approval: "Pending Approval",
  approved: "Approved",
  paid: "Paid",
  partially_paid: "Partially Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
  void: "Void",
};

const categoryLabels: Record<string, string> = {
  payroll_processing: "Payroll Processing",
  social_contributions: "Social Contributions",
  tax_filing: "Tax Filing",
  legal_compliance: "Legal & Compliance",
  visa_immigration: "Visa & Immigration",
  hr_advisory: "HR Advisory",
  it_services: "IT Services",
  office_rent: "Office Rent",
  insurance: "Insurance",
  bank_charges: "Bank Charges",
  consulting: "Consulting",
  equipment: "Equipment",
  travel: "Travel",
  marketing: "Marketing",
  other: "Other",
};

const fileTypeLabels: Record<string, string> = {
  invoice: "Invoice",
  payment_receipt: "Payment Receipt / POP",
  statement: "Statement",
  other: "Other",
};

function ConfidenceBadge({ score }: { score: number }) {
  if (score >= 85) return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px] px-1.5">{score}%</Badge>;
  if (score >= 60) return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-[10px] px-1.5">{score}%</Badge>;
  return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-[10px] px-1.5">{score}%</Badge>;
}

/* ========== Multi-File AI Upload & Parse Dialog ========== */
function AIUploadDialog({
  open,
  onOpenChange,
  vendors,
  onBillCreated,
  onVendorAutoCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendors: any[];
  onBillCreated: () => void;
  onVendorAutoCreated: () => void;
}) {
  const { t } = useI18n();
  const [step, setStep] = useState<"upload" | "parsing" | "review">("upload");
  const [dragOver, setDragOver] = useState(false);
  const [serviceMonth, setServiceMonth] = useState("");
  const [pendingFiles, setPendingFiles] = useState<Array<{ file: File; type: "invoice" | "payment_receipt" | "statement" | "other"; uploaded?: { url: string; key: string } }>>([]);
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<number>(0);
  const [editedBill, setEditedBill] = useState<any>({});
  const [editedItems, setEditedItems] = useState<any[]>([]);
  const [editedAllocations, setEditedAllocations] = useState<any[]>([]);
  const [editedPayment, setEditedPayment] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.pdfParsing.uploadFile.useMutation();
  const parseMultiMutation = trpc.pdfParsing.parseMultiFile.useMutation();
  const applyMutation = trpc.pdfParsing.applyMultiFileParse.useMutation();

  function resetState() {
    setStep("upload");
    setServiceMonth("");
    setPendingFiles([]);
    setParsedResult(null);
    setSelectedVendorId(0);
    setEditedBill({});
    setEditedItems([]);
    setEditedAllocations([]);
    setEditedPayment(null);
  }

  function handleOpenChange(open: boolean) {
    if (!open) resetState();
    onOpenChange(open);
  }

  function addFiles(fileList: FileList | File[]) {
    const maxSize = 16 * 1024 * 1024;
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"];
    const newFiles: typeof pendingFiles = [];

    for (const file of Array.from(fileList)) {
      if (file.size > maxSize) {
        toast.error(`"${file.name}" is too large (max 16MB). Skipped.`);
        continue;
      }
      if (!allowedTypes.includes(file.type)) {
        toast.error(`"${file.name}" is not a supported format. Skipped.`);
        continue;
      }
      if (pendingFiles.length + newFiles.length >= 10) {
        toast.error("Maximum 10 files allowed.");
        break;
      }
      // Auto-detect file type from name
      const nameLower = file.name.toLowerCase();
      let type: "invoice" | "payment_receipt" | "statement" | "other" = "invoice";
      if (nameLower.includes("pop") || nameLower.includes("receipt") || nameLower.includes("payment") || nameLower.includes("proof")) {
        type = "payment_receipt";
      } else if (nameLower.includes("statement") || nameLower.includes("bank")) {
        type = "statement";
      }
      newFiles.push({ file, type });
    }

    if (newFiles.length > 0) {
      setPendingFiles([...pendingFiles, ...newFiles]);
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }, [pendingFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  function removeFile(idx: number) {
    setPendingFiles(pendingFiles.filter((_, i) => i !== idx));
  }

  function updateFileType(idx: number, type: "invoice" | "payment_receipt" | "statement" | "other") {
    const updated = [...pendingFiles];
    updated[idx] = { ...updated[idx], type };
    setPendingFiles(updated);
  }

  async function handleStartAnalysis() {
    if (!serviceMonth) {
      toast.error("Please select a service month.");
      return;
    }
    if (pendingFiles.length === 0) {
      toast.error("Please add at least one file.");
      return;
    }

    setStep("parsing");

    try {
      // Step 1: Upload all files to S3
      const uploadedFiles: Array<{ fileUrl: string; fileKey: string; fileName: string; fileType: "invoice" | "payment_receipt" | "statement" | "other" }> = [];

      for (const pf of pendingFiles) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(pf.file);
        });

        const uploadResult = await uploadMutation.mutateAsync({
          fileName: pf.file.name,
          fileBase64: base64,
          contentType: pf.file.type,
        });

        uploadedFiles.push({
          fileUrl: uploadResult.url,
          fileKey: uploadResult.key,
          fileName: pf.file.name,
          fileType: pf.type as "invoice" | "payment_receipt" | "statement" | "other",
        });
      }

      // Step 2: Call multi-file AI parse
      const result = await parseMultiMutation.mutateAsync({
        files: uploadedFiles,
        serviceMonth,
      });

      setParsedResult(result);
      const p = result.parsed;

      // Pre-fill vendor
      if (p.vendorMatch?.vendor?.id) {
        setSelectedVendorId(p.vendorMatch.vendor.id);
      }
      if (p.vendorMatch?.status === "auto_created") {
        onVendorAutoCreated();
      }

      // Pre-fill bill data
      setEditedBill({
        billNumber: p.bill?.invoiceNumber || "",
        billDate: p.bill?.invoiceDate || "",
        dueDate: p.bill?.dueDate || "",
        billMonth: p.bill?.serviceMonth || serviceMonth,
        currency: p.bill?.currency || "USD",
        subtotal: p.bill?.subtotal?.toString() || "",
        tax: p.bill?.tax?.toString() || "0",
        totalAmount: p.bill?.totalAmount?.toString() || "",
        category: p.bill?.category || "other",
        billType: p.bill?.billType || "operational",
        description: p.bill?.description || "",
      });

      // Pre-fill line items
      if (p.lineItems?.length > 0) {
        setEditedItems(p.lineItems.map((item: any) => ({
          description: item.description || "",
          quantity: item.quantity?.toString() || "1",
          unitPrice: item.unitPrice?.toString() || "0",
          amount: item.amount?.toString() || "0",
          relatedEmployeeId: item.matchedEmployeeId || undefined,
          relatedCustomerId: item.matchedCustomerId || undefined,
          relatedCountryCode: item.countryCode || "",
          employeeName: item.employeeName || "",
          confidence: item.confidence || 0,
        })));
      }

      // Pre-fill allocation suggestions
      if (p.lineItems?.length > 0) {
        const allocs = p.lineItems
          .filter((item: any) => item.allocationSuggestion)
          .map((item: any) => ({
            ...item.allocationSuggestion,
            allocatedAmount: item.allocationSuggestion.allocatedAmount?.toString() || "0",
            enabled: true,
          }));
        setEditedAllocations(allocs);
      }

      // Pre-fill payment info
      if (p.payment) {
        setEditedPayment({
          paidDate: p.payment.paymentDate || "",
          paidAmount: p.payment.localAmount?.toString() || p.bill?.totalAmount?.toString() || "",
          bankReference: p.payment.transactionReference || "",
          bankName: p.payment.bankName || "",
          bankFee: p.payment.bankFee?.toString() || "0",
        });
      }

      setStep("review");
      toast.success(`AI analysis complete! ${p.crossValidation?.documentsAnalyzed || pendingFiles.length} document(s) analyzed.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze documents");
      setStep("upload");
    }
  }

  async function handleConfirmCreate() {
    if (!selectedVendorId) {
      toast.error("Please select a vendor");
      return;
    }
    if (!editedBill.billNumber?.trim()) {
      toast.error("Bill number is required");
      return;
    }
    if (!editedBill.totalAmount) {
      toast.error("Total amount is required");
      return;
    }

    try {
      const payload: any = {
        vendorId: selectedVendorId,
        billNumber: editedBill.billNumber,
        billDate: editedBill.billDate,
        dueDate: editedBill.dueDate || undefined,
        billMonth: editedBill.billMonth || undefined,
        currency: editedBill.currency || "USD",
        subtotal: editedBill.subtotal || editedBill.totalAmount,
        tax: editedBill.tax || "0",
        totalAmount: editedBill.totalAmount,
        category: editedBill.category || "other",
        billType: editedBill.billType || "operational",
        description: editedBill.description || undefined,
        items: editedItems.length > 0 ? editedItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
          relatedEmployeeId: item.relatedEmployeeId || undefined,
          relatedCustomerId: item.relatedCustomerId || undefined,
          relatedCountryCode: item.relatedCountryCode || undefined,
        })) : undefined,
      };

      // Add payment info if available
      if (editedPayment && editedPayment.paidDate) {
        payload.paymentInfo = editedPayment;
      }

      // Add enabled allocations
      const enabledAllocs = editedAllocations.filter((a) => a.enabled);
      if (enabledAllocs.length > 0) {
        payload.allocations = enabledAllocs.map((a) => ({
          invoiceId: a.invoiceId,
          employeeId: a.employeeId,
          allocatedAmount: a.allocatedAmount,
          description: a.reason || t("vendorBills.review.aiSuggestedAllocation"),
        }));
      }

      const result = await applyMutation.mutateAsync(payload);

      const msg = [t("vendorBills.toast.billCreatedWithId", { id: String(result.id) })];
      if (result.itemsCreated > 0) msg.push(t("vendorBills.toast.itemsCreated", { count: String(result.itemsCreated) }));
      if (result.allocationsCreated > 0) msg.push(t("vendorBills.toast.allocationsCreated", { count: String(result.allocationsCreated) }));
      toast.success(msg.join(", "));

      handleOpenChange(false);
      onBillCreated();
    } catch (err: any) {
      toast.error(err.message || t("vendorBills.toast.createFailed"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {step === "upload" && t("vendorBills.aiUpload.title")}
            {step === "parsing" && t("vendorBills.aiUpload.parsingTitle")}
            {step === "review" && t("vendorBills.review.title")}
          </DialogTitle>
          <DialogDescription>
            {step === "upload" && t("vendorBills.aiUpload.prompt")}
            {step === "parsing" && t("vendorBills.aiUpload.parsingDescription")}
            {step === "review" && t("vendorBills.review.description")}
          </DialogDescription>
        </DialogHeader>

        {/* ===== Step 1: Upload ===== */}
        {step === "upload" && (
          <div className="space-y-5">
            {/* Guidance Banner */}
            <div className="flex gap-3 p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-medium">{t("vendorBills.aiUpload.singleVendorTitle")}</p>
                <p className="text-blue-600 text-xs">{t("vendorBills.aiUpload.singleVendorHint")}</p>
              </div>
            </div>

            {/* Service Month Selection */}
            <div className="space-y-2">
              <Label className="font-medium">{t("vendorBills.aiUpload.serviceMonthLabel")}</Label>
              <MonthPicker
                value={serviceMonth}
                onChange={setServiceMonth}
                placeholder={t("vendorBills.aiUpload.serviceMonthHint")}
              />
            </div>

            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                dragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                multiple
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <FileUp className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
              <h3 className="text-base font-semibold mb-1">{t("vendorBills.aiUpload.dropzone")}</h3>
              <p className="text-xs text-muted-foreground">{t("vendorBills.aiUpload.dropzoneHint")}</p>
            </div>

            {/* File List */}
            {pendingFiles.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("vendorBills.aiUpload.filesReady", { count: String(pendingFiles.length) })}</Label>
                <div className="space-y-1.5">
                  {pendingFiles.map((pf, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/30">
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm truncate flex-1 min-w-0" title={pf.file.name}>{pf.file.name}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">{(pf.file.size / 1024).toFixed(0)} KB</span>
                      <Select value={pf.type} onValueChange={(v) => updateFileType(idx, v as "invoice" | "payment_receipt" | "statement" | "other")}>
                        <SelectTrigger className="w-[140px] h-7 text-xs flex-shrink-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(fileTypeLabels).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeFile(idx)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>{t("common.cancel")}</Button>
              <Button
                onClick={handleStartAnalysis}
                disabled={pendingFiles.length === 0 || !serviceMonth}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Analyze {pendingFiles.length} File{pendingFiles.length !== 1 ? "s" : ""} with AI
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* ===== Step 2: Parsing Animation ===== */}
        {step === "parsing" && (
          <div className="py-16 text-center space-y-6">
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
              <div className="absolute inset-2 rounded-full border-4 border-primary/30 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Bot className="w-10 h-10 text-primary animate-bounce" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">{t("vendorBills.review.aiAnalyzingDocs").replace("{count}", String(pendingFiles.length))}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t("vendorBills.aiUpload.parsingCrossReference")}</p>
            </div>
            <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t("vendorBills.aiUpload.parsingTimeEstimate")}</span>
            </div>
          </div>
        )}

        {/* ===== Step 3: Review Results ===== */}
        {step === "review" && parsedResult?.parsed && (() => {
          const p = parsedResult.parsed;
          const cv = p.crossValidation;
          const vm = p.vendorMatch;

          return (
            <div className="space-y-5">
              {/* Overall Confidence + Cross-Validation Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Confidence Score */}
                <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                  p.overallConfidence >= 85 ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
                  p.overallConfidence >= 60 ? "bg-amber-50 border-amber-200 text-amber-800" :
                  "bg-red-50 border-red-200 text-red-800"
                }`}>
                  <Shield className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Overall Confidence: {p.overallConfidence}%</p>
                    <p className="text-xs opacity-80">{cv?.documentsAnalyzed || 0} document(s) analyzed</p>
                  </div>
                </div>

                {/* Cross-Validation */}
                <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                  cv?.warnings?.length > 0 ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"
                }`}>
                  <ArrowRightLeft className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">
                      {cv?.lineItemsSumMatchesTotal ? "Line items match total ✓" : "Line items mismatch ⚠"}
                      {cv?.invoiceVsPaymentMatch === true && " · Payment verified ✓"}
                      {cv?.invoiceVsPaymentMatch === false && " · Payment mismatch ⚠"}
                    </p>
                    {cv?.warnings?.length > 0 && (
                      <p className="text-xs opacity-80">{cv.warnings.length} warning(s)</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {cv?.warnings?.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-1">
                  {cv.warnings.map((w: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-amber-800">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Vendor Match Status */}
              <div>
                <Label className="text-sm font-medium">{t("vendorBills.review.vendorLabel")}</Label>
                {vm?.status === "auto_created" && (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-xs mb-2">
                    <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{t("vendorBills.review.vendorAutoCreated").replace("{vendorName}", vm.vendor?.name || "").replace("{country}", vm.vendor?.country || "-")}</span>
                  </div>
                )}
                {vm?.status === "matched" && (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{t("vendorBills.review.vendorMatched").replace("{vendorName}", vm.vendor?.name || "").replace("{vendorCode}", vm.vendor?.vendorCode || "-")}</span>
                  </div>
                )}
                {vm?.status === "not_found" && (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs mb-2">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{t("vendorBills.review.vendorNotFound")}</span>
                  </div>
                )}
                <Select
                  value={selectedVendorId ? String(selectedVendorId) : ""}
                  onValueChange={(v) => setSelectedVendorId(parseInt(v))}
                >
                  <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                  <SelectContent>
                    {vendors.map((v) => (
                      <SelectItem key={v.id} value={String(v.id)}>{v.name} ({v.vendorCode})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bill Details */}
              <div>
                <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Receipt className="w-4 h-4" /> Bill Details
                  {p.bill?.confidence != null && <ConfidenceBadge score={p.bill.confidence} />}
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">{t("vendorBills.details.billNumberLabel")} *</Label>
                    <Input value={editedBill.billNumber || ""} onChange={(e) => setEditedBill({ ...editedBill, billNumber: e.target.value })} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">{t("vendorBills.details.categoryLabel")}</Label>
                    <Select value={editedBill.category || "other"} onValueChange={(v) => setEditedBill({ ...editedBill, category: v })}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">{t("vendorBills.details.billTypeLabel")}</Label>
                    <Select value={editedBill.billType || "operational"} onValueChange={(v) => setEditedBill({ ...editedBill, billType: v })}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operational">{t("vendorBills.details.billTypeOperational")}</SelectItem>
                        <SelectItem value="deposit">{t("vendorBills.details.billTypeDeposit")}</SelectItem>
                        <SelectItem value="deposit_refund">{t("vendorBills.details.billTypeDepositRefund")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">{t("vendorBills.details.currencyLabel")}</Label>
                    <CurrencySelect value={editedBill.currency || "USD"} onValueChange={(v) => setEditedBill({ ...editedBill, currency: v })} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">{t("vendorBills.details.billDateLabel")}</Label>
                    <DatePicker value={editedBill.billDate || ""} onChange={(d) => setEditedBill({ ...editedBill, billDate: d })} placeholder="Bill date" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">{t("vendorBills.details.dueDateLabel")}</Label>
                    <DatePicker value={editedBill.dueDate || ""} onChange={(d) => setEditedBill({ ...editedBill, dueDate: d })} placeholder="Due date" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">{t("vendorBills.details.serviceMonthLabel")}</Label>
                    <MonthPicker value={editedBill.billMonth || ""} onChange={(m) => setEditedBill({ ...editedBill, billMonth: m })} placeholder="Service month" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">{t("vendorBills.details.subtotalLabel")}</Label>
                    <Input type="number" step="0.01" value={editedBill.subtotal || ""} onChange={(e) => setEditedBill({ ...editedBill, subtotal: e.target.value })} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">{t("vendorBills.details.taxLabel")}</Label>
                    <Input type="number" step="0.01" value={editedBill.tax || "0"} onChange={(e) => setEditedBill({ ...editedBill, tax: e.target.value })} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">{t("vendorBills.details.totalAmountLabel")}</Label>
                    <Input type="number" step="0.01" value={editedBill.totalAmount || ""} onChange={(e) => setEditedBill({ ...editedBill, totalAmount: e.target.value })} className={`h-8 text-sm font-semibold ${!editedBill.totalAmount ? "border-amber-400" : ""}`} />
                  </div>
                </div>
                {editedBill.description && (
                  <div className="mt-2">
                    <Label className="text-xs text-muted-foreground">{t("vendorBills.details.descriptionLabel")}</Label>
                    <Textarea value={editedBill.description} onChange={(e) => setEditedBill({ ...editedBill, description: e.target.value })} rows={2} className="text-sm" />
                  </div>
                )}
              </div>

              {/* Payment Info (from POP) */}
              {editedPayment && (
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4" /> {t("vendorBills.payment.title")}
                    {p.payment?.confidence != null && <ConfidenceBadge score={p.payment.confidence} />}
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-3 rounded-lg bg-emerald-50/50 border border-emerald-200/50">
                    <div>
                      <Label className="text-xs text-muted-foreground">{t("vendorBills.payment.dateLabel")}</Label>
                      <DatePicker value={editedPayment.paidDate || ""} onChange={(d) => setEditedPayment({ ...editedPayment, paidDate: d })} placeholder={t("vendorBills.payment.datePlaceholder")} />
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
              {editedItems.length > 0 && (
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4" /> {t("vendorBills.lineItems.title")} ({editedItems.length})
                  </Label>
                  <div className="rounded-lg border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">{t("vendorBills.details.descriptionLabel")}</TableHead>
                          <TableHead className="text-xs text-right w-16">{t("vendorBills.lineItems.quantityHeader")}</TableHead>
                          <TableHead className="text-xs text-right w-24">{t("vendorBills.lineItems.unitPriceHeader")}</TableHead>
                          <TableHead className="text-xs text-right w-24">{t("vendorBills.lineItems.amountHeader")}</TableHead>
                          <TableHead className="text-xs w-28">{t("vendorBills.lineItems.employeeHeader")}</TableHead>
                          <TableHead className="text-xs w-16">{t("vendorBills.lineItems.countryHeader")}</TableHead>
                          <TableHead className="text-xs w-12">{t("vendorBills.lineItems.confidenceHeader")}</TableHead>
                          <TableHead className="w-8"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {editedItems.map((item, idx) => (
                          <TableRow key={idx} className={item.confidence < 60 ? "bg-amber-50/50" : ""}>
                            <TableCell>
                              <Input value={item.description} onChange={(e) => {
                                const n = [...editedItems]; n[idx] = { ...n[idx], description: e.target.value }; setEditedItems(n);
                              }} className="h-7 text-xs" />
                            </TableCell>
                            <TableCell>
                              <Input type="number" value={item.quantity} onChange={(e) => {
                                const n = [...editedItems]; n[idx] = { ...n[idx], quantity: e.target.value }; setEditedItems(n);
                              }} className="h-7 text-xs text-right" />
                            </TableCell>
                            <TableCell>
                              <Input type="number" step="0.01" value={item.unitPrice} onChange={(e) => {
                                const n = [...editedItems]; n[idx] = { ...n[idx], unitPrice: e.target.value }; setEditedItems(n);
                              }} className="h-7 text-xs text-right" />
                            </TableCell>
                            <TableCell>
                              <Input type="number" step="0.01" value={item.amount} onChange={(e) => {
                                const n = [...editedItems]; n[idx] = { ...n[idx], amount: e.target.value }; setEditedItems(n);
                              }} className="h-7 text-xs text-right font-medium" />
                            </TableCell>
                            <TableCell>
                              <div className="text-xs truncate max-w-[120px]" title={item.employeeName || "—"}>
                                {item.employeeName || "—"}
                                {item.relatedEmployeeId && <span className="text-emerald-600 ml-1">✓</span>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Input value={item.relatedCountryCode || ""} onChange={(e) => {
                                const n = [...editedItems]; n[idx] = { ...n[idx], relatedCountryCode: e.target.value }; setEditedItems(n);
                              }} className="h-7 text-xs" placeholder="—" />
                            </TableCell>
                            <TableCell><ConfidenceBadge score={item.confidence || 0} /></TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditedItems(editedItems.filter((_, i) => i !== idx))}>
                                <X className="w-3 h-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

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
                              <input
                                type="checkbox"
                                checked={alloc.enabled}
                                onChange={(e) => {
                                  const n = [...editedAllocations];
                                  n[idx] = { ...n[idx], enabled: e.target.checked };
                                  setEditedAllocations(n);
                                }}
                                className="h-4 w-4 rounded border-gray-300"
                              />
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

              {/* Notes from AI */}
              {cv?.notes?.length > 0 && (
                <div className="p-3 rounded-lg bg-muted/50 border space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">{t("vendorBills.review.aiNotes")}</p>
                  {cv.notes.map((n: string, i: number) => (
                    <p key={i} className="text-xs text-muted-foreground">• {n}</p>
                  ))}
                </div>
              )}

              <DialogFooter className="gap-2">
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
              </DialogFooter>
            </div>
          );
        })()}
      </DialogContent>
    </Dialog>
  );
}

/* ========== Vendor Bill List ========== */
function VendorBillList() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [vendorFilter, setVendorFilter] = useState<string>("all");
  const [, setLocation] = useLocation();
  const [createOpen, setCreateOpen] = useState(false);
  const [aiUploadOpen, setAiUploadOpen] = useState(false);

  const { data, isLoading, refetch } = trpc.vendorBills.list.useQuery({
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    vendorId: vendorFilter !== "all" ? parseInt(vendorFilter) : undefined,
    limit: 100,
  });

  const { data: vendorsData, refetch: refetchVendors } = trpc.vendors.list.useQuery({ status: "active", limit: 200 });
  const vendors = useMemo(() => vendorsData?.data || [], [vendorsData]);

  const createMutation = trpc.vendorBills.create.useMutation({
    onSuccess: () => {
      toast.success(t("vendorBills.toast.createdSuccess"));
      setCreateOpen(false);
      refetch();
      setFormData(defaultForm);
    },
    onError: (err) => toast.error(err.message),
  });

  const defaultForm = {
    vendorId: 0, billNumber: "", billDate: "", dueDate: "", billMonth: "",
    currency: "USD", subtotal: "", tax: "0", totalAmount: "",
    status: "draft" as const, category: "other" as const, description: "", internalNotes: "",
  };
  const [formData, setFormData] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

  function validateAndCreate() {
    const errors: Record<string, boolean> = {};
    if (!formData.vendorId) errors.vendorId = true;
    if (!formData.billNumber.trim()) errors.billNumber = true;
    if (!formData.billDate) errors.billDate = true;
    if (!formData.totalAmount) errors.totalAmount = true;
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fill in all required fields");
      return;
    }
    setFormErrors({});
    const sub = formData.subtotal || formData.totalAmount;
    createMutation.mutate({
      ...formData,
      subtotal: sub,
      dueDate: formData.dueDate || undefined,
      billMonth: formData.billMonth || undefined,
    });
  }

  // Summary stats
  const stats = useMemo(() => {
    if (!data) return { total: 0, paid: 0, pending: 0, overdue: 0 };
    const bills = data.data || [];
    return {
      total: data.total,
      paid: bills.filter((b) => b.status === "paid").length,
      pending: bills.filter((b) => ["draft", "pending_approval", "approved"].includes(b.status)).length,
      overdue: bills.filter((b) => b.status === "overdue").length,
    };
  }, [data]);

  return (
    <Layout breadcrumb={["GEA", "Vendor Bills"]}>
      <div className="p-6 space-y-6 page-enter">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("vendorBills.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("vendorBills.description")}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* AI Upload Button - Primary CTA */}
            <Button
              variant="default"
              onClick={() => setAiUploadOpen(true)}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Upload & AI Parse
            </Button>

            {/* Manual Create Button */}
            <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) setFormErrors({}); }}>
              <DialogTrigger asChild>
                <Button variant="outline"><Plus className="w-4 h-4 mr-2" />{t("vendorBills.actions.manualEntry")}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t("vendorBills.createBill.manualTitle")}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="col-span-2">
                    <Label className={formErrors.vendorId ? "text-destructive" : ""}>{t("vendorBills.review.vendorLabel")}</Label>
                    <Select value={formData.vendorId ? String(formData.vendorId) : ""} onValueChange={(v) => {
                      const vid = parseInt(v);
                      const vendor = vendors.find((vn) => vn.id === vid);
                      setFormData({ ...formData, vendorId: vid, currency: vendor?.currency || formData.currency });
                    }}>
                      <SelectTrigger className={formErrors.vendorId ? "border-destructive" : ""}><SelectValue placeholder="Select vendor" /></SelectTrigger>
                      <SelectContent>
                        {vendors.map((v) => <SelectItem key={v.id} value={String(v.id)}>{v.name} ({v.vendorCode})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className={formErrors.billNumber ? "text-destructive" : ""}>{t("vendorBills.details.billNumberLabel")} *</Label>
                    <Input value={formData.billNumber} onChange={(e) => setFormData({ ...formData, billNumber: e.target.value })} placeholder="Vendor's invoice number" className={formErrors.billNumber ? "border-destructive" : ""} />
                  </div>
                  <div>
                    <Label>{t("vendorBills.details.categoryLabel")}</Label>
                    <Select value={formData.category} onValueChange={(v: any) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className={formErrors.billDate ? "text-destructive" : ""}>{t("vendorBills.details.billDateLabel")}</Label>
                    <DatePicker value={formData.billDate} onChange={(date) => setFormData({ ...formData, billDate: date })} placeholder="Select bill date" className={formErrors.billDate ? "border-destructive" : ""} />
                  </div>
                  <div>
                    <Label>{t("vendorBills.details.dueDateLabel")}</Label>
                    <DatePicker value={formData.dueDate} onChange={(date) => setFormData({ ...formData, dueDate: date })} placeholder="Select due date" />
                  </div>
                  <div>
                    <Label>{t("vendorBills.details.serviceMonthLabel")}</Label>
                    <MonthPicker value={formData.billMonth} onChange={(month) => setFormData({ ...formData, billMonth: month })} placeholder="Select service month" />
                  </div>
                  <div>
                    <Label>{t("vendorBills.details.currencyLabel")}</Label>
                    <CurrencySelect value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })} />
                  </div>
                  <div>
                    <Label className={formErrors.totalAmount ? "text-destructive" : ""}>{t("vendorBills.details.totalAmountLabel")}</Label>
                    <Input type="number" step="0.01" value={formData.totalAmount} onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value, subtotal: e.target.value })} placeholder="0.00" className={formErrors.totalAmount ? "border-destructive" : ""} />
                  </div>
                  <div>
                    <Label>{t("vendorBills.details.taxLabel")}</Label>
                    <Input type="number" step="0.01" value={formData.tax} onChange={(e) => setFormData({ ...formData, tax: e.target.value })} placeholder="0.00" />
                  </div>
                  <div className="col-span-2">
                    <Label>{t("vendorBills.details.descriptionLabel")}</Label>
                    <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} placeholder="Optional description..." />
                  </div>
                  <div className="col-span-2">
                    <Label>{t("vendorBills.details.internalNotes")}</Label>
                    <Textarea value={formData.internalNotes} onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })} rows={2} placeholder="Internal notes..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>{t("common.cancel")}</Button>
                  <Button onClick={validateAndCreate} disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creating..." : "Create Bill"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Bills", value: stats.total, icon: FileStack, color: "text-foreground" },
            { label: t("vendorBills.table.paidHeader"), value: stats.paid, icon: CheckCircle2, color: "text-emerald-600" },
            { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-600" },
            { label: "Overdue", value: stats.overdue, icon: AlertTriangle, color: "text-red-600" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className={`w-5 h-5 ${s.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search bills..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder={t("vendorBills.table.statusHeader")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("vendorBills.filters.allStatuses")}</SelectItem>
              {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder={t("vendorBills.details.categoryLabel")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("vendorBills.filters.allCategories")}</SelectItem>
              {Object.entries(categoryLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={vendorFilter} onValueChange={setVendorFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder={t("vendorBills.table.vendorHeader")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("vendorBills.filters.allVendors")}</SelectItem>
              {vendors.map((v) => <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Bills Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("vendorBills.details.billNumberLabel")}</TableHead>
                  <TableHead>{t("vendorBills.table.vendorHeader")}</TableHead>
                  <TableHead>{t("vendorBills.details.categoryLabel")}</TableHead>
                  <TableHead>{t("common.date")}</TableHead>
                  <TableHead>{t("vendorBills.details.serviceMonthLabel")}</TableHead>
                  <TableHead className="text-right">{t("vendorBills.lineItems.amountHeader")}</TableHead>
                  <TableHead>{t("vendorBills.table.statusHeader")}</TableHead>
                  <TableHead className="w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : data && data.data && data.data.length > 0 ? (
                  data.data.map((bill) => {
                    return (
                      <TableRow
                        key={bill.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setLocation(`/vendor-bills/${bill.id}`)}
                      >
                        <TableCell className="font-medium">{bill.billNumber}</TableCell>
                        <TableCell>{vendors.find((v) => v.id === bill.vendorId)?.name || "—"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">{categoryLabels[bill.category] || bill.category}</Badge>
                            {bill.billType && bill.billType !== 'operational' && (
                              <Badge variant="outline" className={`text-xs ${bill.billType === 'deposit' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                                {bill.billType === 'deposit' ? 'DEP' : 'REF'}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(bill.billDate)}</TableCell>
                        <TableCell className="text-sm">{bill.billMonth ? formatMonth(bill.billMonth) : "—"}</TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {bill.currency} {formatAmount(bill.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[bill.status] || ""}>
                            {statusLabels[bill.status] || bill.status}
                          </Badge>
                        </TableCell>
                        <TableCell><ChevronRight className="w-4 h-4 text-muted-foreground" /></TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-16 text-muted-foreground">
                      <div className="space-y-3">
                        <FileStack className="w-10 h-10 mx-auto opacity-30" />
                        <div>{t("vendorBills.empty.simple")}</div>
                        <Button variant="outline" size="sm" onClick={() => setAiUploadOpen(true)} className="gap-2">
                          <Sparkles className="w-3.5 h-3.5" />Upload your first bill
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* AI Upload Dialog */}
        {aiUploadOpen && (
          <AIUploadDialog
            open={aiUploadOpen}
            onOpenChange={setAiUploadOpen}
            vendors={vendors}
            onBillCreated={() => refetch()}
            onVendorAutoCreated={() => refetchVendors()}
          />
        )}
      </div>
    </Layout>
  );
}

/* ========== Vendor Bill Detail ========== */
function VendorBillDetail({ id }: { id: number }) {
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const [editOpen, setEditOpen] = useState(false);
  const [allocOpen, setAllocOpen] = useState(false);
  const [allocForm, setAllocForm] = useState({ invoiceId: "", employeeId: "", amount: "", description: "" });

  const { data: bill, isLoading, refetch } = trpc.vendorBills.get.useQuery({ id });

  // Cost Allocation queries (only for client_related vendors)
  const allocQuery = trpc.allocations.listByBill.useQuery({ vendorBillId: id }, { enabled: !!bill });
  const summaryQuery = trpc.allocations.billSummary.useQuery({ vendorBillId: id }, { enabled: !!bill });
  const invoicesQuery = trpc.invoices.list.useQuery({ limit: 200 }, { enabled: allocOpen });
  // Filter invoices for allocation based on vendor bill type
  // - Regular (operational) bills: exclude deposit, credit_note, deposit_refund
  // - Deposit bills: only show deposit invoices (without applied credit notes)
  const filteredInvoices = useMemo(() => {
    const raw = (invoicesQuery.data as any)?.data || [];
    const billType = bill?.billType || 'operational';
    return raw.filter((inv: any) => {
      // Always exclude credit notes and deposit refunds
      if (inv.invoiceType === 'credit_note' || inv.invoiceType === 'deposit_refund') return false;
      // Only show paid or sent invoices (active invoices that can receive cost allocation)
      if (!['paid', 'sent'].includes(inv.status)) return false;
      
      if (billType === 'deposit') {
        // Deposit vendor bills can only be allocated to deposit invoices
        if (inv.invoiceType !== 'deposit') return false;
        // Exclude deposits that have been fully consumed by credit notes
        // (creditApplied >= total means the deposit funds have been redirected)
        const creditApplied = parseFloat(inv.creditApplied || '0');
        const total = parseFloat(inv.total || '0');
        if (total > 0 && creditApplied >= total) return false;
      } else {
        // Operational vendor bills should not be allocated to deposits
        if (inv.invoiceType === 'deposit') return false;
      }
      return true;
    });
  }, [invoicesQuery.data, bill?.billType]);
  const employeesQuery = trpc.employees.list.useQuery({ limit: 500 }, { enabled: allocOpen });

  const createAllocMutation = trpc.allocations.create.useMutation();
  const deleteAllocMutation = trpc.allocations.delete.useMutation();
  const utils = trpc.useUtils();

  const isClientRelated = bill?.vendor?.vendorType === "client_related";
  const allocations = allocQuery.data || [];
  const summary = summaryQuery.data;

  const updateMutation = trpc.vendorBills.update.useMutation({
    onSuccess: () => { toast.success("Bill updated"); setEditOpen(false); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const [editData, setEditData] = useState<any>({});

  function openEdit() {
    if (!bill) return;
    setEditData({
      billNumber: bill.billNumber,
      category: bill.category,
      billDate: bill.billDate ? new Date(bill.billDate).toISOString().split("T")[0] : "",
      dueDate: bill.dueDate ? new Date(bill.dueDate).toISOString().split("T")[0] : "",
      paidDate: bill.paidDate ? new Date(bill.paidDate).toISOString().split("T")[0] : "",
      billMonth: bill.billMonth ? new Date(bill.billMonth).toISOString().slice(0, 7) : "",
      currency: bill.currency,
      subtotal: bill.subtotal?.toString() || "",
      tax: bill.tax?.toString() || "0",
      totalAmount: bill.totalAmount?.toString() || "",
      paidAmount: bill.paidAmount?.toString() || "0",
      status: bill.status,
      description: bill.description || "",
      internalNotes: bill.internalNotes || "",
    });
    setEditOpen(true);
  }

  async function handleCreateAlloc() {
    if (!allocForm.employeeId || !allocForm.invoiceId || !allocForm.amount) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await createAllocMutation.mutateAsync({
        vendorBillId: id,
        invoiceId: parseInt(allocForm.invoiceId),
        employeeId: parseInt(allocForm.employeeId),
        allocatedAmount: allocForm.amount,
        description: allocForm.description || undefined,
      });
      toast.success("Allocation created");
      setAllocOpen(false);
      setAllocForm({ invoiceId: "", employeeId: "", amount: "", description: "" });
      allocQuery.refetch();
      summaryQuery.refetch();
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to create allocation");
    }
  }

  async function handleDeleteAlloc(allocId: number) {
    try {
      await deleteAllocMutation.mutateAsync({ id: allocId });
      toast.success("Allocation deleted");
      allocQuery.refetch();
      summaryQuery.refetch();
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete allocation");
    }
  }

  if (isLoading) {
    return (
      <Layout breadcrumb={["GEA", "Vendor Bills", "Loading..."]}>
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!bill) {
    return (
      <Layout breadcrumb={["GEA", "Vendor Bills", "Not Found"]}>
        <div className="p-6 text-center py-20">
          <XCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">{t("vendorBills.detail.notFound")}</p>
          <Button variant="link" onClick={() => setLocation("/vendor-bills")}>← {t("vendorBills.actions.backToList")}</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout breadcrumb={["GEA", "Vendor Bills", bill.billNumber]}>
      <div className="p-6 space-y-6 page-enter">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/vendor-bills")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{bill.billNumber}</h1>
              <p className="text-sm text-muted-foreground">{bill.vendor?.name || "Unknown Vendor"}</p>
            </div>
            <Badge variant="outline" className={statusColors[bill.status] || ""}>
              {statusLabels[bill.status] || bill.status}
            </Badge>
            <Badge variant="outline" className="text-xs">{categoryLabels[bill.category] || bill.category}</Badge>
            {bill.billType && bill.billType !== 'operational' && (
              <Badge variant="outline" className={`text-xs ${bill.billType === 'deposit' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                {bill.billType === 'deposit' ? 'Deposit' : 'Deposit Refund'}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Approval workflow buttons */}
            {bill.status === "draft" && (
              <Button
                size="sm"
                variant="outline"
                className="text-amber-600 border-amber-300 hover:bg-amber-50"
                onClick={() => {
                  updateMutation.mutate({ id, status: "pending_approval" });
                }}
                disabled={updateMutation.isPending}
              >
                <Upload className="w-4 h-4 mr-1" />Submit for Approval
              </Button>
            )}
            {bill.status === "pending_approval" && (
              <>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => {
                    updateMutation.mutate({ id, status: "approved" });
                  }}
                  disabled={updateMutation.isPending}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                  onClick={() => {
                    updateMutation.mutate({ id, status: "draft" });
                  }}
                  disabled={updateMutation.isPending}
                >
                  <XCircle className="w-4 h-4 mr-1" />Reject
                </Button>
              </>
            )}
            {bill.status === "approved" && (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  updateMutation.mutate({ id, status: "paid", paidDate: new Date().toISOString().split("T")[0], paidAmount: bill.totalAmount?.toString() || "0" });
                }}
                disabled={updateMutation.isPending}
              >
                <DollarSign className="w-4 h-4 mr-1" />Mark as Paid
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={openEdit}>
              <Pencil className="w-4 h-4 mr-2" />Edit
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Amount */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />Amount
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between font-semibold"><span>{t("vendorBills.table.totalHeader")}</span><span className="font-mono">{bill.currency} {formatAmount(bill.totalAmount)}</span></div>
              {bill.paidAmount && parseFloat(bill.paidAmount.toString()) > 0 && (
                <div className="flex justify-between text-emerald-600"><span className="text-sm">{t("vendorBills.table.paidHeader")}</span><span className="font-mono">{bill.currency} {formatAmount(bill.paidAmount)}</span></div>
              )}
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div><div className="text-xs text-muted-foreground">{t("vendorBills.table.billDateHeader")}</div><div className="font-medium">{formatDate(bill.billDate)}</div></div>
              <div><div className="text-xs text-muted-foreground">{t("vendorBills.details.dueDateLabel")}</div><div className="font-medium">{bill.dueDate ? formatDate(bill.dueDate) : "—"}</div></div>
              <div><div className="text-xs text-muted-foreground">{t("vendorBills.payment.dateLabel")}</div><div className="font-medium">{bill.paidDate ? formatDate(bill.paidDate) : "—"}</div></div>
              <div><div className="text-xs text-muted-foreground">{t("vendorBills.details.serviceMonthLabel")}</div><div className="font-medium">{bill.billMonth ? formatMonth(bill.billMonth) : "—"}</div></div>
            </CardContent>
          </Card>

          {/* Vendor Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4" />Vendor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div><div className="text-xs text-muted-foreground">{t("common.name")}</div><div className="font-medium">{bill.vendor?.name || "—"}</div></div>
              <div><div className="text-xs text-muted-foreground">{t("common.code")}</div><div className="font-medium">{bill.vendor?.vendorCode || "—"}</div></div>
              <div><div className="text-xs text-muted-foreground">{t("common.country")}</div><div className="font-medium">{bill.vendor?.country || "—"}</div></div>
              {bill.vendor && (
                <Button variant="link" className="p-0 h-auto text-xs" onClick={() => setLocation(`/vendors/${bill.vendorId}`)}>
                  View Vendor Details →
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Description & Notes */}
        {(bill.description || bill.internalNotes) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bill.description && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">{t("vendorBills.details.descriptionLabel")}</CardTitle></CardHeader>
                <CardContent><p className="text-sm whitespace-pre-wrap">{bill.description}</p></CardContent>
              </Card>
            )}
            {bill.internalNotes && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">{t("vendorBills.details.internalNotes")}</CardTitle></CardHeader>
                <CardContent><p className="text-sm whitespace-pre-wrap">{bill.internalNotes}</p></CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Line Items */}
        {bill.items && bill.items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{t("vendorBills.lineItems.title")}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("vendorBills.details.descriptionLabel")}</TableHead>
                    <TableHead className="text-right">{t("vendorBills.lineItems.quantityHeader")}</TableHead>
                    <TableHead className="text-right">{t("vendorBills.lineItems.unitPriceHeader")}</TableHead>
                    <TableHead className="text-right">{t("vendorBills.lineItems.amountHeader")}</TableHead>
                    <TableHead>{t("vendorBills.allocations.customerHeader")}</TableHead>
                    <TableHead>{t("common.country")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bill.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right font-mono">{item.quantity}</TableCell>
                      <TableCell className="text-right font-mono">{formatAmount(item.unitPrice)}</TableCell>
                      <TableCell className="text-right font-mono">{formatAmount(item.amount)}</TableCell>
                      <TableCell>{item.relatedCustomerId || "—"}</TableCell>
                      <TableCell>{item.relatedCountryCode || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Cost Allocation Section (only for client_related vendors) */}
        {isClientRelated && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">{t("vendorBills.allocations.costAllocation")}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">{t("vendorBills.allocations.linkHint")}</p>
              </div>
              <Button size="sm" onClick={() => setAllocOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />New Allocation
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Allocation Summary */}
              {summary && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">{t("vendorBills.allocations.billTotal")}</p>
                    <p className="text-lg font-bold font-mono">{bill.currency} {formatAmount(summary.totalAmount)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">{t("vendorBills.allocations.allocated")}</p>
                    <p className="text-lg font-bold font-mono text-primary">{bill.currency} {formatAmount(summary.allocatedTotal)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">{t("vendorBills.allocations.unallocatedLabel")}</p>
                    <p className={`text-lg font-bold font-mono ${summary.unallocatedAmount > 0 ? "text-amber-500" : "text-emerald-500"}`}>
                      {bill.currency} {formatAmount(summary.unallocatedAmount)}
                    </p>
                  </div>
                </div>
              )}

              {/* Allocations Table */}
              {allocations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("vendorBills.lineItems.employeeHeader")}</TableHead>
                      <TableHead>{t("common.invoice")}</TableHead>
                      <TableHead className="text-right">{t("vendorBills.lineItems.amountHeader")}</TableHead>
                      <TableHead>{t("common.note")}</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allocations.map((alloc: any) => (
                      <TableRow key={alloc.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">
                              {alloc.employee ? `${alloc.employee.firstName} ${alloc.employee.lastName}` : "\u2014"}
                            </p>
                            <p className="text-xs text-muted-foreground">{alloc.employee?.country || ""}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{alloc.invoice?.invoiceNumber || "\u2014"}</p>
                            <p className="text-xs text-muted-foreground">
                              {alloc.invoice ? `${bill.currency} ${formatAmount(alloc.invoice.total)}` : ""}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {bill.currency} {formatAmount(alloc.allocatedAmount)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {alloc.description || "\u2014"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteAlloc(alloc.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No allocations yet. Click "New Allocation" to link this bill to invoices.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Operational cost notice */}
        {!isClientRelated && bill?.vendor?.vendorType === "operational" && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">{t("vendorBills.allocations.operationalHint")}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-xs text-muted-foreground">
          Created: {formatDate(bill.createdAt)} · Updated: {formatDate(bill.updatedAt)}
        </div>

        {/* Create Allocation Dialog */}
        <Dialog open={allocOpen} onOpenChange={setAllocOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("vendorBills.allocations.createTitle")}</DialogTitle>
              <DialogDescription>{t("vendorBills.allocations.createDescription")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("vendorBills.lineItems.employeeHeader")} *</Label>
                <Select value={allocForm.employeeId} onValueChange={(v) => setAllocForm({ ...allocForm, employeeId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select an employee" /></SelectTrigger>
                  <SelectContent>
                    {((employeesQuery.data as any)?.data || []).map((e: any) => (
                      <SelectItem key={e.id} value={String(e.id)}>
                        {e.firstName} {e.lastName} — {e.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("common.invoice")} *</Label>
                <Select value={allocForm.invoiceId} onValueChange={(v) => setAllocForm({ ...allocForm, invoiceId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select an invoice" /></SelectTrigger>
                  <SelectContent>
                    {filteredInvoices.map((inv: any) => (
                      <SelectItem key={inv.id} value={String(inv.id)}>
                        {inv.invoiceNumber} — {inv.currency} {formatAmount(inv.total)} ({statusLabels[inv.status] || inv.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount ({bill.currency}) *</Label>
                <Input type="number" step="0.01" min="0" placeholder="0.00" value={allocForm.amount} onChange={(e) => setAllocForm({ ...allocForm, amount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("vendorBills.details.descriptionLabel")}</Label>
                <Input placeholder="Optional note..." value={allocForm.description} onChange={(e) => setAllocForm({ ...allocForm, description: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAllocOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleCreateAlloc} disabled={createAllocMutation.isPending}>
                {createAllocMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Allocation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("vendorBills.edit.title")}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label>{t("vendorBills.details.billNumberLabel")}</Label>
                <Input value={editData.billNumber || ""} onChange={(e) => setEditData({ ...editData, billNumber: e.target.value })} />
              </div>
              <div>
                <Label>{t("vendorBills.details.categoryLabel")}</Label>
                <Select value={editData.category || "other"} onValueChange={(v) => setEditData({ ...editData, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("vendorBills.table.billDateHeader")}</Label>
                <DatePicker value={editData.billDate || ""} onChange={(date) => setEditData({ ...editData, billDate: date })} placeholder="Select bill date" />
              </div>
              <div>
                <Label>{t("vendorBills.details.dueDateLabel")}</Label>
                <DatePicker value={editData.dueDate || ""} onChange={(date) => setEditData({ ...editData, dueDate: date })} placeholder="Select due date" />
              </div>
              <div>
                <Label>{t("vendorBills.payment.dateLabel")}</Label>
                <DatePicker value={editData.paidDate || ""} onChange={(date) => setEditData({ ...editData, paidDate: date })} placeholder="Select paid date" />
              </div>
              <div>
                <Label>{t("vendorBills.details.serviceMonthLabel")}</Label>
                <MonthPicker value={editData.billMonth || ""} onChange={(month) => setEditData({ ...editData, billMonth: month })} placeholder="Select service month" />
              </div>
              <div>
                <Label>{t("vendorBills.details.currencyLabel")}</Label>
                <CurrencySelect value={editData.currency || "USD"} onValueChange={(v) => setEditData({ ...editData, currency: v })} />
              </div>
              <div>
                <Label>{t("vendorBills.table.statusHeader")}</Label>
                <Select value={editData.status || "draft"} onValueChange={(v) => setEditData({ ...editData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("vendorBills.details.totalAmountLabel")}</Label>
                <Input type="number" step="0.01" value={editData.totalAmount || ""} onChange={(e) => setEditData({ ...editData, totalAmount: e.target.value, subtotal: e.target.value })} />
              </div>
              <div>
                <Label>{t("vendorBills.details.taxLabel")}</Label>
                <Input type="number" step="0.01" value={editData.tax || "0"} onChange={(e) => setEditData({ ...editData, tax: e.target.value })} />
              </div>
              <div>
                <Label>{t("vendorBills.payment.paidAmountLabel")}</Label>
                <Input type="number" step="0.01" value={editData.paidAmount || "0"} onChange={(e) => setEditData({ ...editData, paidAmount: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label>{t("vendorBills.details.descriptionLabel")}</Label>
                <Textarea value={editData.description || ""} onChange={(e) => setEditData({ ...editData, description: e.target.value })} rows={2} />
              </div>
              <div className="col-span-2">
                <Label>{t("vendorBills.details.internalNotes")}</Label>
                <Textarea value={editData.internalNotes || ""} onChange={(e) => setEditData({ ...editData, internalNotes: e.target.value })} rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={() => {
                const payload: any = { id, ...editData };
                if (!payload.dueDate) payload.dueDate = null;
                if (!payload.paidDate) payload.paidDate = null;
                if (!payload.billMonth) payload.billMonth = null;
                updateMutation.mutate(payload);
              }} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

/* ========== Main Component ========== */
export default function VendorBills() {
  const [match, params] = useRoute("/vendor-bills/:id");
  if (match && params?.id) {
    return <VendorBillDetail id={parseInt(params.id)} />;
  }
  return <VendorBillList />;
}
