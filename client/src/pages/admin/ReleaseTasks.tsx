import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { usePermissions } from "@/lib/usePermissions";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle, XCircle, AlertCircle, Building2, Wallet, Landmark, Eye, Clock, CheckCircle2, ExternalLink, Search, Download, Loader2, FilterX } from "lucide-react";
import { useLocation } from "wouter";
import { formatCurrencyAmount } from "@/components/CurrencyAmount";
import { formatDate } from "@/lib/format";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { exportToCsv } from "@/lib/csvExport";

export default function ReleaseTasks() {
  const { t } = useI18n();
  const { canReview, canExport } = usePermissions();
  const [, setLocation] = useLocation();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [disposition, setDisposition] = useState<"to_wallet" | "to_bank">("to_wallet");
  
  // Search and filter state
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);

  const utils = trpc.useUtils();

  const [tab, setTab] = useState<"pending" | "history">("pending");

  const { data: creditNoteData, isLoading: isLoadingCN } = trpc.invoices.list.useQuery({
    invoiceType: "credit_note",
    limit: 10000,
  });
  const { data: depositRefundData, isLoading: isLoadingDR } = trpc.invoices.list.useQuery({
    invoiceType: "deposit_refund",
    limit: 10000,
  });

  const isLoading = isLoadingCN || isLoadingDR;
  
  // Derive unique customers from data for filter
  const availableCustomers = useMemo(() => {
    const combined = [
      ...((creditNoteData as any)?.data || []),
      ...((depositRefundData as any)?.data || []),
    ];
    const map = new Map<number, string>();
    combined.forEach((t: any) => {
      if (t.customerId && t.customerName) {
        map.set(t.customerId, t.customerName);
      }
    });
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [creditNoteData, depositRefundData]);

  const allTasks = useMemo(() => {
    const combined = [
      ...((creditNoteData as any)?.data || []),
      ...((depositRefundData as any)?.data || []),
    ];
    
    // Filter by tab
    const pending = ["draft", "sent", "pending_approval"];
    const history = ["paid", "applied", "cancelled"];
    
    let filtered = combined.filter(t => 
      tab === "pending" ? pending.includes(t.status) : history.includes(t.status)
    );

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(t => t.invoiceType === typeFilter);
    }

    // Apply customer filter
    if (customerFilter !== "all") {
      filtered = filtered.filter(t => String(t.customerId) === customerFilter);
    }

    // Apply search filter
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(t => 
        (t.invoiceNumber || "").toLowerCase().includes(s) ||
        (t.customerName || "").toLowerCase().includes(s) ||
        (t.notes || "").toLowerCase().includes(s)
      );
    }

    return filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [creditNoteData, depositRefundData, tab, typeFilter, customerFilter, search]);

  const hasActiveFilters = typeFilter !== "all" || customerFilter !== "all" || search !== "";

  const clearAllFilters = () => {
    setTypeFilter("all");
    setCustomerFilter("all");
    setSearch("");
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Fetch ALL data for export
      const [cnResult, drResult] = await Promise.all([
        utils.invoices.list.fetch({ invoiceType: "credit_note", limit: 10000, offset: 0 }),
        utils.invoices.list.fetch({ invoiceType: "deposit_refund", limit: 10000, offset: 0 }),
      ]);
      const combined = [
        ...((cnResult as any)?.data || []),
        ...((drResult as any)?.data || []),
      ];

      // Apply same filters as display
      const pending = ["draft", "sent", "pending_approval"];
      const history = ["paid", "applied", "cancelled"];
      
      let exportData = combined.filter((t: any) => 
        tab === "pending" ? pending.includes(t.status) : history.includes(t.status)
      );

      if (typeFilter !== "all") {
        exportData = exportData.filter((t: any) => t.invoiceType === typeFilter);
      }
      if (customerFilter !== "all") {
        exportData = exportData.filter((t: any) => String(t.customerId) === customerFilter);
      }
      if (search) {
        const s = search.toLowerCase();
        exportData = exportData.filter((t: any) => 
          (t.invoiceNumber || "").toLowerCase().includes(s) ||
          (t.customerName || "").toLowerCase().includes(s) ||
          (t.notes || "").toLowerCase().includes(s)
        );
      }

      exportToCsv(exportData, [
        { header: "Invoice #", accessor: (r: any) => r.invoiceNumber },
        { header: "Type", accessor: (r: any) => r.invoiceType === "deposit_refund" ? "Deposit Refund" : "Credit Note" },
        { header: "Customer", accessor: (r: any) => r.customerName || "" },
        { header: "Amount", accessor: (r: any) => formatCurrencyAmount(Math.abs(parseFloat(r.total)), r.currency) },
        { header: "Currency", accessor: (r: any) => r.currency },
        { header: "Reason/Notes", accessor: (r: any) => r.notes || "Deposit Release" },
        { header: "Status", accessor: (r: any) => r.status },
        { header: "Disposition", accessor: (r: any) => r.creditNoteDisposition || "" },
        { header: "Date Created", accessor: (r: any) => r.createdAt ? formatDate(r.createdAt) : "" },
      ], `release-tasks-${tab}-${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success(`CSV exported successfully - ${exportData.length} records`);
    } catch (err) {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const approveMut = trpc.invoices.approveCreditNote.useMutation({
    onSuccess: () => {
      toast.success("Deposit release approved");
      utils.invoices.list.invalidate();
      setShowApproveDialog(false);
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Layout breadcrumb={["GEA", "Release Tasks"]}>
      <div className="p-6 space-y-6 page-enter">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Release Tasks</h1>
            <p className="text-sm text-muted-foreground mt-1">Approve deposit releases and credit note dispositions</p>
          </div>
          <div className="flex gap-2">
            {canExport && (
              <Button variant="outline" size="sm" disabled={isExporting || allTasks.length === 0} onClick={handleExport}>
                {isExporting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Download className="w-4 h-4 mr-1" />} Export CSV
              </Button>
            )}
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="w-4 h-4" /> Pending Approval
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <CheckCircle2 className="w-4 h-4" /> History
            </TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4 space-y-4">
            {/* Search and Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by invoice #, customer, notes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="credit_note">Credit Note</SelectItem>
                  <SelectItem value="deposit_refund">Deposit Refund</SelectItem>
                </SelectContent>
              </Select>
              <Select value={customerFilter} onValueChange={setCustomerFilter}>
                <SelectTrigger className="w-[200px] h-9">
                  <SelectValue placeholder="All Customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {availableCustomers.map(([id, name]) => (
                    <SelectItem key={id} value={String(id)}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-9 text-muted-foreground">
                  <FilterX className="w-4 h-4 mr-1" /> Clear
                </Button>
              )}
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">
                  {tab === "pending" ? "Pending Approvals" : "Processed Tasks"} ({allTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="pl-6">Invoice #</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 8 }).map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : allTasks.length > 0 ? (
                      allTasks.map((cn: any) => (
                        <TableRow key={cn.id}>
                          <TableCell className="pl-6 font-medium font-mono">{cn.invoiceNumber}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn.invoiceType === 'deposit_refund' ? 'text-amber-700 border-amber-200 bg-amber-50' : 'text-purple-700 border-purple-200 bg-purple-50'}>
                              {cn.invoiceType === 'deposit_refund' ? 'Deposit Refund' : 'Credit Note'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm font-medium">{cn.customerName}</TableCell>
                          <TableCell className="font-mono text-emerald-600 font-medium">
                            {formatCurrencyAmount(Math.abs(parseFloat(cn.total)), cn.currency)}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground" title={cn.notes}>
                            {cn.notes || "Deposit Release"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(cn.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge variant="secondary" className="text-xs font-normal">
                                {cn.status}
                              </Badge>
                              {cn.status === 'paid' && cn.creditNoteDisposition === 'to_wallet' && (
                                <Badge className="text-xs font-normal bg-blue-100 text-blue-800 border-blue-200 gap-1">
                                  <Wallet className="w-3 h-3" /> To Wallet
                                </Badge>
                              )}
                              {cn.status === 'paid' && cn.creditNoteDisposition === 'to_bank' && (
                                <Badge className="text-xs font-normal bg-amber-100 text-amber-800 border-amber-200 gap-1">
                                  <Landmark className="w-3 h-3" /> To Bank
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex justify-end gap-2">
                              {canReview && tab === "pending" && (
                                <Button size="sm" onClick={() => {
                                  setSelectedTask(cn);
                                  setDisposition("to_wallet");
                                  setShowApproveDialog(true);
                                }}>
                                  Review
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setLocation(`/invoices/${cn.id}`)} title="View Details">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-16 text-muted-foreground">
                          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                          <p>{hasActiveFilters ? "No matching release tasks found" : `No ${tab} release tasks found`}</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Approval Dialog */}
        <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Deposit Release</DialogTitle>
              <DialogDescription>
                Decide how to process this credit note for <b>{selectedTask?.customerName}</b>.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="bg-slate-50 p-3 rounded-md border text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Credit Note:</span>
                  <span className="font-medium">{selectedTask?.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-bold text-emerald-600">
                    {selectedTask && formatCurrencyAmount(Math.abs(parseFloat(selectedTask.total)), selectedTask.currency)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Disposition Method</Label>
                <RadioGroup value={disposition} onValueChange={(v: any) => setDisposition(v)}>
                  <div className={`flex items-center space-x-3 border p-3 rounded-md cursor-pointer transition-colors ${disposition === 'to_wallet' ? 'border-primary bg-primary/5' : 'hover:bg-slate-50'}`}>
                    <RadioGroupItem value="to_wallet" id="r1" />
                    <Label htmlFor="r1" className="flex-1 cursor-pointer flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-primary" />
                      <div>
                        <div className="font-medium">Credit to Main Wallet</div>
                        <div className="text-xs text-muted-foreground">Funds become available balance for future invoices.</div>
                      </div>
                    </Label>
                  </div>
                  
                  <div className={`flex items-center space-x-3 border p-3 rounded-md cursor-pointer transition-colors ${disposition === 'to_bank' ? 'border-primary bg-primary/5' : 'hover:bg-slate-50'}`}>
                    <RadioGroupItem value="to_bank" id="r2" />
                    <Label htmlFor="r2" className="flex-1 cursor-pointer flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-primary" />
                      <div>
                        <div className="font-medium">Refund to Bank</div>
                        <div className="text-xs text-muted-foreground">Mark as refunded externally. No wallet credit.</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              {disposition === 'to_bank' && (
                <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-2 rounded text-xs">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  <span>Note: This action only records the refund in the system. You must manually process the bank transfer.</span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApproveDialog(false)}>Cancel</Button>
              <Button onClick={() => approveMut.mutate({ 
                creditNoteId: selectedTask.id,
                disposition 
              })} disabled={approveMut.isPending}>
                {approveMut.isPending ? "Processing..." : "Confirm & Process"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
