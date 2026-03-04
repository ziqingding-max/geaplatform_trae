/**
 * Portal Leave Page
 *
 * View, create and delete leave requests for employees.
 * Includes leave balance overview and public holidays.
 */
import { useState, useMemo } from "react";
import PortalLayout from "@/components/PortalLayout";
import { portalTrpc } from "@/lib/portalTrpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/DatePicker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2,
  Loader2, Calendar, Sun, TreePalm, CheckCircle2, XCircle, Download,
} from "lucide-react";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { toast } from "sonner";
import { exportToCsv } from "@/lib/csvExport";

import { useI18n } from "@/lib/i18n";
const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  submitted: "bg-yellow-100 text-yellow-800 border-yellow-200",
  client_approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  client_rejected: "bg-red-100 text-red-800 border-red-200",
  admin_approved: "bg-green-100 text-green-800 border-green-200",
  admin_rejected: "bg-orange-100 text-orange-800 border-orange-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  locked: "bg-blue-100 text-blue-800 border-blue-200",
};

interface LeaveForm {
  employeeId: number | null;
  leaveTypeId: number | null;
  startDate: string;
  endDate: string;
  days: string;
  reason: string;
}

const emptyForm: LeaveForm = {
  employeeId: null,
  leaveTypeId: null,
  startDate: "",
  endDate: "",
  days: "",
  reason: "",
};

export default function PortalLeave() {
  const { t, lang } = useI18n();
  const { user } = usePortalAuth();
  const isHrOrAdmin = user && ["admin", "hr_manager"].includes(user.portalRole);

  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [form, setForm] = useState<LeaveForm>({ ...emptyForm });
  const [selectedBalanceEmp, setSelectedBalanceEmp] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("requests");

  const utils = portalTrpc.useUtils();

  const { data, isLoading } = portalTrpc.leave.list.useQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
    page,
    pageSize,
  });

  // Get employees for the selector
  const { data: empData } = portalTrpc.employees.list.useQuery({ page: 1, pageSize: 100 });
  const employees = empData?.items ?? [];

  // Get leave types for the selected employee's country
  const selectedEmp = employees.find((e: any) => e.id === form.employeeId);
  const { data: leaveTypes } = portalTrpc.employees.leaveTypesByCountry.useQuery(
    { countryCode: selectedEmp?.country || "" },
    { enabled: !!selectedEmp?.country }
  );

  // Get leave balances for selected employee
  const { data: balances } = portalTrpc.leave.balances.useQuery(
    { employeeId: selectedBalanceEmp || 0 },
    { enabled: !!selectedBalanceEmp }
  );

  // Get public holidays
  const { data: holidays } = portalTrpc.leave.publicHolidays.useQuery(
    { year: new Date().getFullYear() },
    { enabled: activeTab === "holidays" }
  );

  const createMutation = portalTrpc.leave.create.useMutation({
    onSuccess: () => {
      toast.success(t("portal_leave.toasts.request_submitted"));
      setShowCreate(false);
      setForm({ ...emptyForm });
      utils.leave.list.invalidate();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = portalTrpc.leave.delete.useMutation({
    onSuccess: () => {
      toast.success(t("portal_leave.toasts.request_deleted"));
      setDeleteId(null);
      utils.leave.list.invalidate();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const approveMutation = portalTrpc.leave.approve.useMutation({
    onSuccess: () => {
      toast.success(t("portal_leave.toasts.request_approved"));
      utils.leave.list.invalidate();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const rejectMutation = portalTrpc.leave.reject.useMutation({
    onSuccess: () => {
      toast.success(t("portal_leave.toasts.request_rejected"));
      setRejectId(null);
      setRejectReason("");
      utils.leave.list.invalidate();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  // Auto-calculate days when dates change
  function updateDates(field: "startDate" | "endDate", value: string) {
    const newForm = { ...form, [field]: value };
    if (newForm.startDate && newForm.endDate) {
      const start = new Date(newForm.startDate);
      const end = new Date(newForm.endDate);
      if (end >= start) {
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        newForm.days = String(diffDays);
      }
    }
    setForm(newForm);
  }

  function handleCreate() {
    if (!form.employeeId || !form.leaveTypeId || !form.startDate || !form.endDate || !form.days) {
      toast.error(t("portal_leave.toasts.fill_required_fields"));
      return;
    }
    createMutation.mutate({
      employeeId: form.employeeId,
      leaveTypeId: form.leaveTypeId,
      startDate: form.startDate,
      endDate: form.endDate,
      days: form.days,
      reason: form.reason || undefined,
    });
  }

  return (
    <PortalLayout title={t("portal_leave.title")}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("portal_leave.header.title")}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t("portal_leave.header.description")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={items.length === 0}
              onClick={() => {
                exportToCsv(items, [
                  { header: "Employee", accessor: (r: any) => r.employeeName || "" },
                  { header: "Leave Type", accessor: (r: any) => r.leaveType || "" },
                  { header: "Start Date", accessor: (r: any) => r.startDate ? new Date(r.startDate).toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US") : "" },
                  { header: "End Date", accessor: (r: any) => r.endDate ? new Date(r.endDate).toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US") : "" },
                  { header: "Days", accessor: (r: any) => r.totalDays ?? "" },
                  { header: "Status", accessor: (r: any) => t(`portal_leave.status.${r.status}`) || r.status || "" },
                  { header: "Reason", accessor: (r: any) => r.reason || "" },
                ], `leave-requests-${new Date().toISOString().slice(0, 10)}.csv`);
              }}
            >
              <Download className="w-4 h-4 mr-1" /> {t("common.export") || "Export CSV"}
            </Button>
            <Button onClick={() => { setForm({ ...emptyForm }); setShowCreate(true); }}>
              <Plus className="w-4 h-4 mr-2" /> {t("portal_leave.buttons.new_request")}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="requests">{t("portal_leave.tabs.requests")}</TabsTrigger>
            <TabsTrigger value="balances">{t("portal_leave.tabs.balances")}</TabsTrigger>
            <TabsTrigger value="holidays">{t("portal_leave.tabs.holidays")}</TabsTrigger>
          </TabsList>

          {/* Leave Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("portal_leave.filters.all_statuses")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("portal_leave.filters.all_statuses")}</SelectItem>
                  <SelectItem value="submitted">{t("portal_leave.statuses.pending_review")}</SelectItem>
                  <SelectItem value="client_approved">{t("portal_leave.statuses.approved")}</SelectItem>
                  <SelectItem value="client_rejected">{t("portal_leave.statuses.rejected")}</SelectItem>
                  <SelectItem value="admin_approved">{t("portal_leave.statuses.confirmed")}</SelectItem>
                  <SelectItem value="admin_rejected">{t("portal_leave.statuses.admin_rejected")}</SelectItem>
                  <SelectItem value="locked">{t("portal_leave.statuses.locked")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-4 space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <CalendarDays className="w-10 h-10 mb-3" />
                    <p className="text-lg font-medium">{t("portal_leave.empty_states.no_requests")}</p>
                    <p className="text-sm mt-1">{t("portal_leave.empty_states.create_hint")}</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("portal_leave.table_headers.employee")}</TableHead>
                        <TableHead>{t("portal_leave.table_headers.leave_type")}</TableHead>
                        <TableHead>{t("portal_leave.create_dialog.start_date")}</TableHead>
                        <TableHead>{t("portal_leave.create_dialog.end_date")}</TableHead>
                        <TableHead>{t("portal_leave.table_headers.days")}</TableHead>
                        <TableHead>{t("portal_leave.table_headers.status")}</TableHead>
                        <TableHead>{t("portal_leave.table_headers.reason")}</TableHead>
                        <TableHead className="text-right">{t("portal_leave.table_headers.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((leave: any) => (
                        <TableRow key={leave.id}>
                          <TableCell className="font-medium">
                            {leave.employeeFirstName} {leave.employeeLastName}
                          </TableCell>
                          <TableCell className="capitalize">
                            {leave.leaveTypeName || "-"}
                          </TableCell>
                          <TableCell>
                            {leave.startDate ? new Date(leave.startDate).toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US") : "-"}
                          </TableCell>
                          <TableCell>
                            {leave.endDate ? new Date(leave.endDate).toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US") : "-"}
                          </TableCell>
                          <TableCell>{leave.days ?? "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColors[leave.status] || ""}>
                              {t(`portal_leave.status.${leave.status}`) || leave.status}
                            </Badge>
                            {leave.clientRejectionReason && leave.status === "client_rejected" && (
                              <p className="text-xs text-red-600 mt-1 max-w-[200px] truncate" title={leave.clientRejectionReason}>
                                {leave.clientRejectionReason}
                              </p>
                            )}
                            {leave.adminRejectionReason && leave.status === "admin_rejected" && (
                              <p className="text-xs text-orange-600 mt-1 max-w-[200px] truncate" title={leave.adminRejectionReason}>
                                {leave.adminRejectionReason}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                            {leave.reason || "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {leave.status === "submitted" && isHrOrAdmin && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                    onClick={() => approveMutation.mutate({ id: leave.id })}
                                    disabled={approveMutation.isPending}
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => { setRejectId(leave.id); setRejectReason(""); }}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              {leave.status === "submitted" && (
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(leave.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm">Page {page} of {totalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Leave Balances Tab */}
          <TabsContent value="balances" className="space-y-4">
            <div className="flex gap-3">
              <Select
                value={selectedBalanceEmp ? String(selectedBalanceEmp) : ""}
                onValueChange={(v) => setSelectedBalanceEmp(Number(v))}
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder={t("portal_leave.balances.select_employee_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp: any) => (
                    <SelectItem key={emp.id} value={String(emp.id)}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!selectedBalanceEmp ? (
              <Card>
                <CardContent className="py-16">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <TreePalm className="w-10 h-10 mb-3" />
                    <p className="text-lg font-medium">{t("portal_leave.balances.select_employee_title")}</p>
                    <p className="text-sm mt-1">{t("portal_leave.balances.select_employee_hint")}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(balances || []).length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="py-12">
                      <p className="text-center text-muted-foreground">{t("portal_leave.balances.no_balances")}</p>
                    </CardContent>
                  </Card>
                ) : (
                  (balances || []).map((b: any) => (
                    <Card key={b.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-medium text-sm">{b.leaveTypeName || "Leave"}</p>
                          <Badge variant="outline">{b.year}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-2xl font-bold text-primary">{b.totalEntitlement}</p>
                            <p className="text-xs text-muted-foreground">{t("portal_leave.balances.entitled")}</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-amber-600">{b.used}</p>
                            <p className="text-xs text-muted-foreground">{t("portal_leave.balances.used")}</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-emerald-600">{b.remaining}</p>
                            <p className="text-xs text-muted-foreground">{t("portal_leave.balances.remaining")}</p>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${Math.min(100, (Number(b.used) / Math.max(1, Number(b.totalEntitlement))) * 100)}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          {/* Public Holidays Tab */}
          <TabsContent value="holidays" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                {!holidays || holidays.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Sun className="w-10 h-10 mb-3" />
                    <p className="text-lg font-medium">{t("portal_leave.holidays.empty_title")}</p>
                    <p className="text-sm mt-1">{t("portal_leave.holidays.empty_hint")}</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("portal_leave.holidays.date")}</TableHead>
                        <TableHead>{t("portal_leave.holidays.header_holiday")}</TableHead>
                        <TableHead>{t("portal_leave.holidays.header_country")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {holidays.map((h: any) => (
                        <TableRow key={h.id}>
                          <TableCell className="font-mono text-sm">
                            {new Date(h.holidayDate).toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                          </TableCell>
                          <TableCell className="font-medium">{h.holidayName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{h.countryCode}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Leave Dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => {
        if (!open) { setShowCreate(false); setForm({ ...emptyForm }); }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("portal_leave.buttons.new_request")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("portal_leave.create_dialog.label_employee")} <span className="text-destructive">*</span></Label>
              <Select value={form.employeeId ? String(form.employeeId) : ""} onValueChange={(v) => setForm((f) => ({ ...f, employeeId: Number(v), leaveTypeId: null }))}>
                <SelectTrigger><SelectValue placeholder={t("portal_leave.create_dialog.placeholder_employee")} /></SelectTrigger>
                <SelectContent>
                  {employees.map((emp: any) => (
                    <SelectItem key={emp.id} value={String(emp.id)}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("portal_leave.table_headers.leave_type")} <span className="text-destructive">*</span></Label>
              <Select
                value={form.leaveTypeId ? String(form.leaveTypeId) : ""}
                onValueChange={(v) => setForm((f) => ({ ...f, leaveTypeId: Number(v) }))}
                disabled={!form.employeeId}
              >
                <SelectTrigger><SelectValue placeholder={form.employeeId ? t("portal_leave.create_dialog.placeholder_leave_type") : t("portal_leave.create_dialog.placeholder_select_employee_first")} /></SelectTrigger>
                <SelectContent>
                  {(leaveTypes || []).map((lt: any) => (
                    <SelectItem key={lt.id} value={String(lt.id)}>
                      {lt.leaveTypeName} ({lt.annualEntitlement} days/year)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("portal_leave.create_dialog.start_date")} <span className="text-destructive">*</span></Label>
                <DatePicker
                  value={form.startDate}
                  onChange={(v) => updateDates("startDate", v)}
                  placeholder={t("portal_leave.create_dialog.placeholder_start_date")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("portal_leave.create_dialog.end_date")} <span className="text-destructive">*</span></Label>
                <DatePicker
                  value={form.endDate}
                  onChange={(v) => updateDates("endDate", v)}
                  placeholder={t("portal_leave.create_dialog.placeholder_end_date")}
                  minDate={form.startDate}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("portal_leave.table_headers.days")} <span className="text-destructive">*</span></Label>
              <Input type="number" step="0.5" value={form.days} onChange={(e) => setForm((f) => ({ ...f, days: e.target.value }))} placeholder={t("portal_leave.create_dialog.placeholder_days")} />
              <p className="text-xs text-muted-foreground">{t("portal_leave.create_dialog.days_helper_text")}</p>
            </div>
            <div className="space-y-2">
              <Label>{t("portal_leave.table_headers.reason")}</Label>
              <Textarea value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder={t("portal_leave.create_dialog.placeholder_reason")} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreate(false); setForm({ ...emptyForm }); }}>
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("portal_leave.create_dialog.button_submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("portal_leave.delete_dialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("portal_leave.delete_dialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel") || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t("common.delete") || "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <Dialog open={rejectId !== null} onOpenChange={(open) => { if (!open) { setRejectId(null); setRejectReason(""); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("portal_leave.reject_dialog.title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("portal_leave.reject_dialog.reason_label")}</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t("portal_leave.reject_dialog.placeholder_reason")}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectId(null); setRejectReason(""); }}>{t("common.cancel") || "Cancel"}</Button>
            <Button
              variant="destructive"
              onClick={() => rejectId && rejectMutation.mutate({ id: rejectId, reason: rejectReason || undefined })}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("common.reject") || "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}
