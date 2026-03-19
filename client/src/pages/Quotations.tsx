import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/_core/hooks/useAuth";
import { isAdmin } from "@shared/roles";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Download, Edit, FileText, Loader2, Search, ChevronDown, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateTime, formatCurrency } from "@/lib/format";
import { Link } from "wouter";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function Quotations() {
  const { t } = useI18n();
  const { user } = useAuth();
  const userIsAdmin = isAdmin(user?.role);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);
  
  // State for status change confirmation
  const [statusConfirm, setStatusConfirm] = useState<{ id: number, status: string } | null>(null);
  // State for delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data, isLoading, isError, error, refetch } = trpc.quotations.list.useQuery({
    limit,
    offset: (page - 1) * limit,
    search: debouncedSearch || undefined
  });

  const updateStatusMutation = trpc.quotations.updateStatus.useMutation({
      onSuccess: () => {
          toast.success(t("common.updated") || "Updated");
          refetch();
          setStatusConfirm(null);
      },
      onError: (err) => toast.error(err.message)
  });

  const downloadMutation = trpc.quotations.downloadPdf.useMutation({
    onSuccess: (data: any) => {
        if (data.url) {
            window.open(data.url, "_blank");
        } else if (data.content) {
            const link = document.createElement('a');
            link.href = `data:application/pdf;base64,${data.content}`;
            link.download = data.filename || 'quotation.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    },
    onError: (err) => toast.error("Download failed: " + err.message)
  });

  const deleteMutation = trpc.quotations.delete.useMutation({
    onSuccess: () => {
        toast.success(t("quotations.toast.deleted") || "Quotation deleted successfully");
        refetch();
        setDeleteConfirm(null);
    },
    onError: (err) => {
        toast.error(t("quotations.toast.delete_error") || "Failed to delete quotation");
        setDeleteConfirm(null);
    }
  });

  const handleStatusChange = (id: number, status: string) => {
      setStatusConfirm({ id, status });
  };

  const confirmStatusChange = () => {
      if (statusConfirm) {
          updateStatusMutation.mutate({ id: statusConfirm.id, status: statusConfirm.status as any });
      }
  };

  const confirmDelete = () => {
      if (deleteConfirm !== null) {
          deleteMutation.mutate({ id: deleteConfirm });
      }
  };

  // Dynamic confirmation message based on target status
  const getStatusConfirmMessage = (status: string): string => {
    switch (status) {
      case "accepted":
        return t("quotations.status.confirm_accepted") || "Are you sure you want to accept this quotation? This will cause all other pending quotations (Draft/Sent) for this lead to be automatically marked as Expired.";
      case "expired":
        return t("quotations.status.confirm_expired") || "Are you sure you want to mark this quotation as expired?";
      case "rejected":
        return t("quotations.status.confirm_rejected") || "Are you sure you want to reject this quotation?";
      case "sent":
        return t("quotations.status.confirm_sent") || "Are you sure you want to mark this quotation as sent?";
      default:
        return t("quotations.status.confirm_change") || "Are you sure you want to change the status of this quotation?";
    }
  };

  return (
    <Layout breadcrumb={["GEA", t("nav.sales"), t("nav.quotations")]}>
      <div className="p-6 space-y-6 page-enter">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("quotations.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("quotations.subtitle")}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={t("common.search") || "Search..."}
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <Link href="/quotations/new">
                <Button>
                <Plus className="w-4 h-4 mr-2" />{t("quotations.createButton")}
                </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : isError ? (
              <div className="p-12 text-center text-destructive">
                <p>Error loading quotations: {error.message}</p>
                <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
              </div>
            ) : !data || data.items.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{t("common.no_data")}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[160px]">{t("quotations.table.number")}</TableHead>
                    <TableHead className="min-w-[140px]">{t("quotations.table.customer")}</TableHead>
                    <TableHead className="w-[120px]">{t("quotations.table.total")}</TableHead>
                    <TableHead className="w-[120px]">{t("quotations.table.validUntil")}</TableHead>
                    <TableHead className="w-[130px]">{t("quotations.table.status")}</TableHead>
                    <TableHead className="text-right w-[100px]">{t("quotations.table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium font-mono text-sm">{q.quotationNumber}</TableCell>
                      <TableCell className="max-w-[200px]">
                        <span className="truncate block" title={q.customer?.companyName || q.salesLead?.companyName || "—"}>
                          {q.customer?.companyName || q.salesLead?.companyName || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(q.currency || "USD", q.totalMonthly)}
                      </TableCell>
                      <TableCell>
                        {q.validUntil ? formatDateTime(q.validUntil) : "—"}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const isTerminal = q.status === "accepted";
                          const statusColorMap: Record<string, string> = {
                            draft: "bg-slate-100 text-slate-700 border-slate-200",
                            sent: "bg-blue-100 text-blue-700 border-blue-200",
                            accepted: "bg-green-100 text-green-700 border-green-200",
                            rejected: "bg-red-100 text-red-700 border-red-200",
                            expired: "bg-orange-100 text-orange-700 border-orange-200",
                          };
                          // B5: Add expired to manual status options
                          const nextActions: { value: string; label: string }[] = [];
                          if (q.status === "draft") {
                            nextActions.push({ value: "sent", label: t("quotations.status.sent") });
                            nextActions.push({ value: "accepted", label: t("quotations.status.accepted") });
                            nextActions.push({ value: "rejected", label: t("quotations.status.rejected") });
                            nextActions.push({ value: "expired", label: t("quotations.status.expired") });
                          } else if (q.status === "sent") {
                            nextActions.push({ value: "accepted", label: t("quotations.status.accepted") });
                            nextActions.push({ value: "rejected", label: t("quotations.status.rejected") });
                            nextActions.push({ value: "expired", label: t("quotations.status.expired") });
                          }
                          // accepted, rejected, expired are all terminal states
                          if (isTerminal || q.status === "rejected" || q.status === "expired" || nextActions.length === 0) {
                            return (
                              <Badge variant="outline" className={`text-xs ${statusColorMap[q.status] || ""}`}>
                                {t(`quotations.status.${q.status}`)}
                              </Badge>
                            );
                          }
                          return (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border cursor-pointer hover:opacity-80 transition-opacity ${statusColorMap[q.status] || ""}`}>
                                  {t(`quotations.status.${q.status}`)}
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                {nextActions.map((action) => (
                                  <DropdownMenuItem key={action.value} onClick={() => handleStatusChange(q.id, action.value)}>
                                    <Badge variant="outline" className={`text-[10px] mr-2 ${statusColorMap[action.value] || ""}`}>
                                      {action.label}
                                    </Badge>
                                    {action.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {q.status === 'draft' && (
                              <Link href={`/quotations/edit/${q.id}`}>
                                <Button variant="ghost" size="icon" title={t("common.edit") || "Edit"}>
                                    <Edit className="w-4 h-4" />
                                </Button>
                              </Link>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => downloadMutation.mutate({ id: q.id })} title={t("quotations.actions.download")}>
                            {downloadMutation.isPending && (downloadMutation.variables as any)?.id === q.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                          </Button>
                          {/* B3c: Draft quotations can be deleted by anyone with CRM access; non-draft only by admin */}
                          {(q.status === 'draft' || userIsAdmin) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  if (q.status !== 'draft' && !userIsAdmin) {
                                    toast.error(t("quotations.deleteAdminOnly"));
                                    return;
                                  }
                                  setDeleteConfirm(q.id);
                                }}
                                title={t("quotations.actions.delete") || "Delete"}
                              >
                                {deleteMutation.isPending && (deleteMutation.variables as any)?.id === q.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
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

        {/* Status change confirmation dialog — B4: Dynamic warning message */}
        <AlertDialog open={!!statusConfirm} onOpenChange={(open) => !open && setStatusConfirm(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("common.confirm") || "Confirm Action"}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {statusConfirm ? getStatusConfirmMessage(statusConfirm.status) : ""}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={confirmStatusChange}
                      className={statusConfirm?.status === "rejected" || statusConfirm?.status === "expired" ? "bg-destructive hover:bg-destructive/90" : ""}
                    >
                      {t("common.confirm")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {/* Delete confirmation dialog */}
        <AlertDialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("common.delete") || "Delete"}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t("quotations.deleteConfirm") || "Are you sure you want to delete this quotation? This action cannot be undone."}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={confirmDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      {t("common.delete") || "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
