/*
 * GEA Admin — Adjustments (异动薪酬)
 * Manage bonuses, allowances, reimbursements, and deductions
 * No approval workflow — submitted directly, locked after payroll cutoff
 */

import Layout from "@/components/Layout";
import { formatMonth, formatAmount } from "@/lib/format";
import { trpc } from "@/lib/trpc";
import { useState, useMemo, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { ArrowUpDown, Plus, Search, Pencil, Trash2, Lock, Upload, FileText, X, Paperclip, Eye, CheckCircle2, XCircle, Download } from "lucide-react";
import { toast } from "sonner";
import EmployeeSelector from "@/components/EmployeeSelector";
import PayrollCycleIndicator from "@/components/PayrollCycleIndicator";
import { MonthPicker } from "@/components/DatePicker";
import { exportToCsv } from "@/lib/csvExport";

import { useI18n } from "@/contexts/i18n";
const statusColors: Record<string, string> = {
  submitted: "bg-amber-50 text-amber-700 border-amber-200",
  client_approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  client_rejected: "bg-red-50 text-red-700 border-red-200",
  admin_approved: "bg-green-50 text-green-700 border-green-200",
  admin_rejected: "bg-orange-50 text-orange-700 border-orange-200",
  locked: "bg-blue-50 text-blue-700 border-blue-200",
};

const typeColors: Record<string, string> = {
  bonus: "bg-emerald-50 text-emerald-700",
  allowance: "bg-blue-50 text-blue-700",
  reimbursement: "bg-purple-50 text-purple-700",
  deduction: "bg-red-50 text-red-700",
  other: "bg-gray-50 text-gray-700",
};

const CATEGORIES = [
  "housing",
  "transport",
  "meals",
  "performance_bonus",
  "year_end_bonus",
  "overtime",
  "travel_reimbursement",
  "equipment_reimbursement",
  "absence_deduction",
  "other",
];

export default function Adjustments() {
  const { t, lang } = useI18n();
  const [viewTab, setViewTab] = useState<string>("active");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingAdj, setEditingAdj] = useState<any>(null);
  const [viewAdj, setViewAdj] = useState<any>(null);

  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = -3; i <= 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString(lang === "zh" ? "zh-CN" : "en-US", { month: "long", year: "numeric" });
      options.push({ value, label });
    }
    return options;
  }, [lang]);

  const { data, isLoading, refetch } = trpc.adjustments.list.useQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    adjustmentType: typeFilter !== "all" ? typeFilter : undefined,
    effectiveMonth: monthFilter !== "all" ? monthFilter : undefined,
    limit: 100,
  });

  // Fetch employees and customers for selectors
  const { data: employeesData } = trpc.employees.list.useQuery({ limit: 500 });
  const employeesList = employeesData?.data || [];
  const { data: customersData } = trpc.customers.list.useQuery({ limit: 200 });
  const customersList = customersData?.data || [];

  // Build employee lookup map
  const employeeMap = useMemo(() => {
    const map = new Map<number, any>();
    for (const emp of employeesList) {
      map.set(emp.id, emp);
    }
    return map;
  }, [employeesList]);

  const createMutation = trpc.adjustments.create.useMutation({
    onSuccess: () => {
      toast.success(t("adjustments.toast.submitSuccess"));
      setCreateOpen(false);
      setReceiptFile(null);
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const uploadReceiptMutation = trpc.adjustments.uploadReceipt.useMutation({
    onError: (err: any) => toast.error("Receipt upload failed: " + err.message),
  });

  const updateMutation = trpc.adjustments.update.useMutation({
    onSuccess: () => {
      toast.success(t("adjustments.toast.updateSuccess"));
      setEditOpen(false);
      setEditingAdj(null);
      setEditReceiptFile(null);
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = trpc.adjustments.delete.useMutation({
    onSuccess: () => {
      toast.success(t("adjustments.toast.deleteSuccess"));
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const adminApproveMutation = trpc.adjustments.adminApprove.useMutation({
    onSuccess: () => {
      toast.success(t("adjustments.toast.approveSuccess"));
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const adminRejectMutation = trpc.adjustments.adminReject.useMutation({
    onSuccess: () => {
      toast.success(t("adjustments.toast.rejectSuccess"));
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [formData, setFormData] = useState({
    employeeId: 0,
    adjustmentType: "bonus" as "bonus" | "allowance" | "reimbursement" | "deduction" | "other",
    category: "" as string,
    description: "",
    amount: "",
    effectiveMonth: defaultMonth,
  });

  const [editFormData, setEditFormData] = useState({
    adjustmentType: "bonus" as string,
    category: "" as string,
    description: "",
    amount: "",
    effectiveMonth: "",
  });

  // Receipt file state for create form
  const [receiptFile, setReceiptFile] = useState<{ file: File; base64: string } | null>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  // Receipt file state for edit form
  const [editReceiptFile, setEditReceiptFile] = useState<{ file: File; base64: string } | null>(null);
  const editReceiptInputRef = useRef<HTMLInputElement>(null);

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);

  // Auto-fill currency from selected employee
  const selectedEmployee = formData.employeeId ? employeeMap.get(formData.employeeId) : null;
  const autoCurrency = selectedEmployee?.salaryCurrency || "USD";

  const handleReceiptSelect = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error(t("adjustments.toast.fileTooLarge"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      if (isEdit) {
        setEditReceiptFile({ file, base64 });
      } else {
        setReceiptFile({ file, base64 });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    if (!formData.employeeId || !formData.amount) {
      toast.error(t("adjustments.toast.requiredFields"));
      return;
    }

    // Receipt is optional for all adjustment types (reimbursement is now a separate module)

    setIsUploading(true);
    try {
      let receiptFileUrl: string | undefined;
      let receiptFileKey: string | undefined;

      // Upload receipt if present
      if (receiptFile) {
        const uploadResult = await uploadReceiptMutation.mutateAsync({
          fileBase64: receiptFile.base64,
          fileName: receiptFile.file.name,
          mimeType: receiptFile.file.type || "application/octet-stream",
        });
        receiptFileUrl = uploadResult.url;
        receiptFileKey = uploadResult.fileKey;
      }

      createMutation.mutate({
        employeeId: formData.employeeId,
        adjustmentType: formData.adjustmentType,
        category: (formData.category || undefined) as any,
        description: formData.description || undefined,
        amount: formData.amount,
        effectiveMonth: formData.effectiveMonth,
        receiptFileUrl,
        receiptFileKey,
      });
    } catch {
      // Error handled by mutation onError
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (adj: any) => {
    setEditingAdj(adj);
    const effMonth = adj.effectiveMonth
      ? new Date(adj.effectiveMonth).toISOString().slice(0, 7)
      : defaultMonth;
    setEditFormData({
      adjustmentType: adj.adjustmentType,
      category: adj.category || "",
      description: adj.description || "",
      amount: adj.amount?.toString() || "",
      effectiveMonth: effMonth,
    });
    setEditReceiptFile(null);
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingAdj) return;

    // Receipt is optional for all adjustment types (reimbursement is now a separate module)

    setIsUploading(true);
    try {
      let receiptFileUrl: string | undefined;
      let receiptFileKey: string | undefined;

      if (editReceiptFile) {
        const uploadResult = await uploadReceiptMutation.mutateAsync({
          fileBase64: editReceiptFile.base64,
          fileName: editReceiptFile.file.name,
          mimeType: editReceiptFile.file.type || "application/octet-stream",
        });
        receiptFileUrl = uploadResult.url;
        receiptFileKey = uploadResult.fileKey;
      }

      updateMutation.mutate({
        id: editingAdj.id,
        data: {
          adjustmentType: editFormData.adjustmentType as any,
          category: (editFormData.category || undefined) as any,
          description: editFormData.description || undefined,
          amount: editFormData.amount,
          effectiveMonth: editFormData.effectiveMonth,
          ...(receiptFileUrl ? { receiptFileUrl, receiptFileKey } : {}),
        },
      });
    } catch {
      // Error handled by mutation onError
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this adjustment?")) {
      deleteMutation.mutate({ id });
    }
  };

  // Derive unique countries from employees for filter
  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    employeesList.forEach((e) => { if (e.country) set.add(e.country); });
    return Array.from(set).sort();
  }, [employeesList]);

  const adjustments = (data?.data || []).filter((adj: any) => {
    const emp = employeeMap.get(adj.employeeId);
    // Tab filter: active = submitted/client_approved/client_rejected/admin_rejected, history = locked/admin_approved
    const historyStatuses = ["locked", "admin_approved"];
    if (viewTab === "active" && historyStatuses.includes(adj.status)) return false;
    if (viewTab === "history" && !historyStatuses.includes(adj.status)) return false;
    if (customerFilter !== "all") {
      if (!emp || String(emp.customerId) !== customerFilter) return false;
    }
    if (countryFilter !== "all") {
      if (!emp || emp.country !== countryFilter) return false;
    }
    if (search) {
      const s = search.toLowerCase();
      const empName = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase() : "";
      const desc = (adj.description || "").toLowerCase();
      if (!empName.includes(s) && !desc.includes(s) && !adj.adjustmentType.includes(s)) return false;
    }
    return true;
  });

  // Receipt upload UI component
  const ReceiptUploadArea = ({ isEdit }: { isEdit: boolean }) => {
    const file = isEdit ? editReceiptFile : receiptFile;
    const inputRef = isEdit ? editReceiptInputRef : receiptInputRef;
    const existingUrl = isEdit && editingAdj?.receiptFileUrl ? editingAdj.receiptFileUrl : null;
    const adjType = isEdit ? editFormData.adjustmentType : formData.adjustmentType;
    const isRequired = false; // Receipt is optional for all adjustment types

    if (!isRequired && !file && !existingUrl) return null;

    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-1">
          <Paperclip className="w-3.5 h-3.5" />
          {t("adjustments.receipt.label")} {isRequired && <span className="text-red-500">*</span>}
        </Label>
        {existingUrl && !file && (
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md text-sm">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="flex-1 truncate">{t("adjustments.receipt.existing")}</span>
            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => window.open(existingUrl, "_blank")}>
              <Eye className="w-3.5 h-3.5 mr-1" /> {t("adjustments.receipt.view")}
            </Button>
          </div>
        )}
        {file && (
          <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-md text-sm">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span className="flex-1 truncate text-emerald-700" title={file.file.name}>{file.file.name}</span>
            <span className="text-xs text-emerald-600">{(file.file.size / 1024).toFixed(0)} KB</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
              if (isEdit) setEditReceiptFile(null);
              else setReceiptFile(null);
            }}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.gif,.zip,.rar,.7z,.doc,.docx,.xls,.xlsx"
          onChange={(e) => handleReceiptSelect(e, isEdit)}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          type="button"
          className="w-full"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          {file ? t("adjustments.receipt.replace") : existingUrl ? t("adjustments.receipt.upload_new") : t("adjustments.receipt.upload")}
        </Button>
        <p className="text-xs text-muted-foreground">
          {t("adjustments.receipt.hint")}
          {isRequired && " Required for reimbursement adjustments."}
        </p>
      </div>
    );
  };

  return (
    <Layout breadcrumb={["GEA", t("adjustments.title")]}>
      <div className="p-6 space-y-6 page-enter">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("adjustments.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("adjustments.subtitle")}
            </p>
          </div>
          <div className="flex-1 flex justify-center">
            <PayrollCycleIndicator compact />
          </div>
          <div className="flex gap-2">
              <Button variant="outline" disabled={adjustments.length === 0} onClick={() => {
                exportToCsv(adjustments, [
                  { header: "Type", accessor: (r: any) => t(`adjustments.type.${r.adjustmentType}`) || r.adjustmentType },
                  { header: "Employee", accessor: (r: any) => { const emp = employeeMap.get(r.employeeId); return emp ? `${emp.firstName} ${emp.lastName}` : `#${r.employeeId}`; } },
                  { header: "Category", accessor: (r: any) => t(`adjustments.category.${r.category}`) || r.category || "" },
                  { header: "Amount", accessor: (r: any) => r.amount },
                  { header: "Currency", accessor: (r: any) => r.currency },
                  { header: "Effective Month", accessor: (r: any) => r.effectiveMonth ? new Date(r.effectiveMonth).toISOString().slice(0, 7) : "" },
                  { header: "Description", accessor: (r: any) => r.description || "" },
                  { header: "Status", accessor: (r: any) => t(`adjustments.status.${r.status}`) || r.status },
                  { header: "Created", accessor: (r: any) => r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : "" },
                ], `adjustments-export-${new Date().toISOString().slice(0, 10)}.csv`);
                toast.success("CSV exported successfully");
              }}>
                <Download className="w-4 h-4 mr-2" />{t("common.export") || "Export CSV"}
              </Button>
            <Dialog open={createOpen} onOpenChange={(open) => {
              setCreateOpen(open);
              if (!open) { setReceiptFile(null); }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("adjustments.button.new")}
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("adjustments.dialog.title.new")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {/* Employee Selector with customer cascading + search */}
                <EmployeeSelector
                  value={formData.employeeId}
                  onValueChange={(id) => setFormData({ ...formData, employeeId: id })}
                  showCustomerFilter={true}
                  required
                  label={t("adjustments.form.label.employee")}
                  placeholder={t("leave.form.placeholder.employee")}
                />
                {selectedEmployee && (
                  <p className="text-xs text-muted-foreground">
                    {t("portal_adjustments.form.currency_label")}: <strong>{autoCurrency}</strong> · {t("adjustments.filters.customerPlaceholder")}: #{selectedEmployee.customerId}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("adjustments.form.label.type")} *</Label>
                    <Select
                      value={formData.adjustmentType}
                      onValueChange={(v) => setFormData({ ...formData, adjustmentType: v as any })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bonus">{t("adjustments.type.bonus")}</SelectItem>
                        <SelectItem value="allowance">{t("adjustments.type.allowance")}</SelectItem>
                        <SelectItem value="reimbursement">{t("adjustments.type.reimbursement")}</SelectItem>
                        <SelectItem value="deduction">{t("adjustments.type.deduction")}</SelectItem>
                        <SelectItem value="other">{t("adjustments.type.other")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adjustments.form.label.category")}</Label>
                    <Select
                      value={formData.category || "none"}
                      onValueChange={(v) => setFormData({ ...formData, category: v === "none" ? "" : v })}
                    >
                      <SelectTrigger><SelectValue placeholder={t("adjustments.form.label.category")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t("adjustments.category.none")}</SelectItem>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>{t(`adjustments.category.${c}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("adjustments.form.label.amount")} *</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={formData.amount}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9.]/g, "");
                        setFormData({ ...formData, amount: v });
                      }}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adjustments.form.label.effectiveMonth")} *</Label>
                    <MonthPicker
                      value={formData.effectiveMonth}
                      onChange={(v) => setFormData({ ...formData, effectiveMonth: v })}
                      placeholder={t("payroll.filters.placeholder.month")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("adjustments.form.label.description")}</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t("adjustments.form.label.description") + "..."}
                    rows={3}
                  />
                </div>

                {/* Receipt upload area — always visible for reimbursement, optional for others */}
                <ReceiptUploadArea isEdit={false} />

                {/* Payroll period info for the selected effective month */}
                {formData.effectiveMonth && (
                  <PayrollCycleIndicator month={formData.effectiveMonth} />
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>{t("common.cancel")}</Button>
                  <Button onClick={handleCreate} disabled={createMutation.isPending || isUploading}>
                    {isUploading ? "Uploading..." : createMutation.isPending ? t("leave.button.submitting") : t("common.submit")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Active / History Tabs */}
        <Tabs value={viewTab} onValueChange={(v) => { setViewTab(v); setStatusFilter("all"); }} className="w-full">
          <TabsList>
            <TabsTrigger value="active">{t("adjustments.tabs.active")}</TabsTrigger>
            <TabsTrigger value="history">{t("adjustments.tabs.history")}</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder={t("reimbursements.filters.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={customerFilter} onValueChange={setCustomerFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder={t("adjustments.filters.customerPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("adjustments.filters.allCustomers")}</SelectItem>
              {customersList.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.companyName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder={t("adjustments.filters.countryPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("adjustments.filters.allCountries")}</SelectItem>
              {availableCountries.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder={t("adjustments.form.label.type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("adjustments.filters.allTypes")}</SelectItem>
              <SelectItem value="bonus">{t("adjustments.type.bonus")}</SelectItem>
              <SelectItem value="allowance">{t("adjustments.type.allowance")}</SelectItem>
              <SelectItem value="reimbursement">{t("adjustments.type.reimbursement")}</SelectItem>
              <SelectItem value="deduction">{t("adjustments.type.deduction")}</SelectItem>
              <SelectItem value="other">{t("adjustments.type.other")}</SelectItem>
            </SelectContent>
          </Select>
          {viewTab === "active" && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder={t("adjustments.filters.statusPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("adjustments.filters.allStatuses")}</SelectItem>
                <SelectItem value="submitted">{t("adjustments.status.submitted")}</SelectItem>
                <SelectItem value="client_approved">{t("adjustments.status.client_approved")}</SelectItem>
                <SelectItem value="client_rejected">{t("adjustments.status.client_rejected")}</SelectItem>
                <SelectItem value="admin_rejected">{t("adjustments.status.admin_rejected")}</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder={t("payroll.filters.placeholder.month")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("leave.filters.allMonths")}</SelectItem>
              {monthOptions.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("adjustments.form.label.type")}</TableHead>
                  <TableHead>{t("adjustments.form.label.employee")}</TableHead>
                  <TableHead>{t("adjustments.form.label.category")}</TableHead>
                  <TableHead>{t("adjustments.form.label.amount")}</TableHead>
                  <TableHead>{t("adjustments.form.label.effectiveMonth")}</TableHead>
                  <TableHead>{t("adjustments.table.header.receipt")}</TableHead>
                  <TableHead>{t("adjustments.filters.statusPlaceholder")}</TableHead>
                  <TableHead className="w-24">{t("adjustments.table.header.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ))
                ) : adjustments.length > 0 ? (
                  adjustments.map((adj) => {
                    const emp = employeeMap.get(adj.employeeId);
                    const empLabel = emp
                      ? `${emp.firstName} ${emp.lastName}`
                      : `${t("adjustments.form.label.employee")} #${adj.employeeId}`;
                    const categoryLabel = CATEGORIES.includes(adj.category) ? t(`adjustments.category.${adj.category}`) : (adj.category || "—");
                    return (
                      <TableRow key={adj.id}>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs capitalize ${typeColors[adj.adjustmentType] || ""}`}>
                            {t(`adjustments.type.${adj.adjustmentType}`) || adj.adjustmentType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{empLabel}</TableCell>
                        <TableCell className="text-sm">{categoryLabel}</TableCell>
                        <TableCell className="text-sm font-mono">
                          {adj.currency} {formatAmount(adj.amount)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {adj.effectiveMonth ? new Date(adj.effectiveMonth).toLocaleString(lang === "zh" ? "zh-CN" : "en-US", { month: "long", year: "numeric" }) : "—"}
                        </TableCell>
                        <TableCell>
                          {adj.receiptFileUrl ? (
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => window.open(adj.receiptFileUrl!, "_blank")}>
                              <Paperclip className="w-3 h-3 mr-1" /> {t("adjustments.receipt.view")}
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${statusColors[adj.status] || ""}`}>
                            {adj.status === "locked" && <Lock className="w-3 h-3 mr-1 inline" />}
                            {t(`adjustments.status.${adj.status}`) || adj.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {adj.status === "client_approved" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                  onClick={() => adminApproveMutation.mutate({ id: adj.id })}
                                  disabled={adminApproveMutation.isPending}
                                  title={t("common.approve")}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                  onClick={() => adminRejectMutation.mutate({ id: adj.id })}
                                  disabled={adminRejectMutation.isPending}
                                  title={t("common.reject")}
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </Button>
                              </>
                            )}
                            {adj.status === "submitted" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  onClick={() => handleEdit(adj)}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDelete(adj.id)}
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setViewAdj(adj)}
                              title={t("common.view")}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <ArrowUpDown className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">{t("adjustments.table.empty")}</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {data && (
          <p className="text-xs text-muted-foreground text-right">
            Showing {adjustments.length} of {data.total} adjustments
          </p>
        )}

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) { setEditReceiptFile(null); }
        }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("adjustments.dialog.title.edit")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type *</Label>
                  <Select
                    value={editFormData.adjustmentType}
                    onValueChange={(v) => setEditFormData({ ...editFormData, adjustmentType: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bonus">{t("adjustments.form.type.bonus")}</SelectItem>
                      <SelectItem value="allowance">{t("adjustments.form.type.allowance")}</SelectItem>
                      <SelectItem value="reimbursement">{t("adjustments.form.type.reimbursement")}</SelectItem>
                      <SelectItem value="deduction">{t("adjustments.form.type.deduction")}</SelectItem>
                      <SelectItem value="other">{t("adjustments.form.type.other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("adjustments.form.label.category")}</Label>
                  <Select
                    value={editFormData.category || "none"}
                    onValueChange={(v) => setEditFormData({ ...editFormData, category: v === "none" ? "" : v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t("adjustments.form.category.none")}</SelectItem>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount *</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={editFormData.amount}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9.]/g, "");
                      setEditFormData({ ...editFormData, amount: v });
                    }}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Effective Month *</Label>
                  <MonthPicker
                    value={editFormData.effectiveMonth}
                    onChange={(v) => setEditFormData({ ...editFormData, effectiveMonth: v })}
                    placeholder="Select month"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("adjustments.form.label.description")}</Label>
                <Textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Reason for adjustment..."
                  rows={3}
                />
              </div>

              {/* Receipt upload for edit */}
              <ReceiptUploadArea isEdit={true} />

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdate} disabled={updateMutation.isPending || isUploading}>
                  {isUploading ? "Uploading..." : updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Adjustment Detail Dialog (read-only) */}
        <Dialog open={!!viewAdj} onOpenChange={(open) => { if (!open) setViewAdj(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{t("adjustments.dialog.title.details")}</DialogTitle></DialogHeader>
            {viewAdj && (
              <div className="space-y-4 mt-4">
                <div className="rounded-md bg-muted/50 p-3">
                  <p className="text-sm font-medium">
                    {(() => { const emp = employeeMap.get(viewAdj.employeeId); return emp ? `${emp.firstName} ${emp.lastName}` : `Employee #${viewAdj.employeeId}`; })()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {(() => { const emp = employeeMap.get(viewAdj.employeeId); return emp ? `${emp.country} · ${emp.salaryCurrency || 'USD'}` : ''; })()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t("adjustments.form.label.type")}</Label>
                    <Badge variant="outline" className={`text-xs capitalize ${typeColors[viewAdj.adjustmentType] || ''}`}>
                      {viewAdj.adjustmentType}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t("adjustments.form.label.category")}</Label>
                    <p className="text-sm">{CATEGORIES.find(c => c.value === viewAdj.category)?.label || viewAdj.category || '—'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t("adjustments.form.label.amount")}</Label>
                    <p className="text-sm font-mono font-semibold">
                      {viewAdj.currency} {formatAmount(viewAdj.amount)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t("adjustments.form.label.effectiveMonth")}</Label>
                    <p className="text-sm">
                      {viewAdj.effectiveMonth ? formatMonth(viewAdj.effectiveMonth) : '—'}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{t("adjustments.filters.statusPlaceholder")}</Label>
                  <Badge variant="outline" className={`text-xs ${statusColors[viewAdj.status] || ''}`}>
                    {viewAdj.status === 'locked' && <Lock className="w-3 h-3 mr-1 inline" />}
                    {statusLabels[viewAdj.status] || viewAdj.status}
                  </Badge>
                </div>

                {viewAdj.description && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t("adjustments.form.label.description")}</Label>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{viewAdj.description}</p>
                  </div>
                )}

                {viewAdj.receiptFileUrl && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t("adjustments.table.header.receipt")}</Label>
                    <Button variant="outline" size="sm" className="h-7 px-3 text-xs" onClick={() => window.open(viewAdj.receiptFileUrl!, '_blank')}>
                      <Paperclip className="w-3 h-3 mr-1" /> View Receipt
                    </Button>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button variant="outline" onClick={() => setViewAdj(null)}>{t("adjustments.button.close")}</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
