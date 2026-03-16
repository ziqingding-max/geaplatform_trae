import { useState } from "react";
import { workerTrpc } from "@/lib/workerTrpc";
import WorkerLayout from "./WorkerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Receipt, Plus, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const categoryOptions = [
  { value: "travel", label: "Travel" },
  { value: "equipment", label: "Equipment" },
  { value: "meals", label: "Meals" },
  { value: "transportation", label: "Transportation" },
  { value: "medical", label: "Medical" },
  { value: "education", label: "Education" },
  { value: "office_supplies", label: "Office Supplies" },
  { value: "communication", label: "Communication" },
  { value: "other", label: "Other" },
];

const statusStyles: Record<string, string> = {
  submitted: "bg-yellow-100 text-yellow-700",
  client_approved: "bg-blue-100 text-blue-700",
  client_rejected: "bg-red-100 text-red-700",
  admin_approved: "bg-green-100 text-green-700",
  admin_rejected: "bg-red-100 text-red-700",
  locked: "bg-green-100 text-green-700",
};

const statusLabels: Record<string, string> = {
  submitted: "Pending",
  client_approved: "Client Approved",
  client_rejected: "Rejected",
  admin_approved: "Approved",
  admin_rejected: "Rejected",
  locked: "Locked",
};

const categoryLabels: Record<string, string> = {
  travel: "Travel",
  equipment: "Equipment",
  meals: "Meals",
  transportation: "Transportation",
  medical: "Medical",
  education: "Education",
  office_supplies: "Office Supplies",
  communication: "Communication",
  other: "Other",
};

export default function WorkerReimbursements() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [category, setCategory] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [effectiveMonth, setEffectiveMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const utils = workerTrpc.useUtils();

  const { data, isLoading } = workerTrpc.reimbursements.list.useQuery({
    page,
    pageSize: 20,
    status: statusFilter === "all" ? undefined : statusFilter as any,
  });

  const submitMutation = workerTrpc.reimbursements.submit.useMutation({
    onSuccess: () => {
      toast.success("Reimbursement submitted");
      setCreateDialogOpen(false);
      resetForm();
      utils.reimbursements.list.invalidate();
      utils.dashboard.getSummary.invalidate();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit reimbursement");
    },
  });

  const cancelMutation = workerTrpc.reimbursements.cancel.useMutation({
    onSuccess: () => {
      toast.success("Reimbursement cancelled");
      utils.reimbursements.list.invalidate();
      utils.dashboard.getSummary.invalidate();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to cancel reimbursement");
    },
  });

  const resetForm = () => {
    setCategory("");
    setAmount("");
    setCurrency("USD");
    setDescription("");
    setReceiptUrl("");
  };

  const handleSubmit = () => {
    if (!category || !amount || !effectiveMonth) {
      toast.error("Please fill in all required fields");
      return;
    }
    submitMutation.mutate({
      category: category as any,
      amount,
      currency,
      description: description || undefined,
      receiptFileUrl: receiptUrl || undefined,
      effectiveMonth: effectiveMonth + "-01",
    });
  };

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  const statusFilterOptions = [
    { value: "all", label: "All Statuses" },
    { value: "submitted", label: "Pending" },
    { value: "client_approved", label: "Client Approved" },
    { value: "client_rejected", label: "Rejected" },
    { value: "admin_approved", label: "Approved" },
    { value: "locked", label: "Locked" },
  ];

  return (
    <WorkerLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Expenses</h1>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                {statusFilterOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">New Expense</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : data?.items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No expenses found.</p>
              <Button variant="outline" className="mt-3" onClick={() => setCreateDialogOpen(true)}>
                Submit your first expense
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {data?.items.map((item: any) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700">
                            {categoryLabels[item.category] || item.category}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${statusStyles[item.status] || "bg-gray-100 text-gray-700"}`}>
                            {statusLabels[item.status] || item.status}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm mt-1 line-clamp-2">{item.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>{item.effectiveMonth}</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          {item.receiptFileUrl && (
                            <a href={item.receiptFileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                              <ExternalLink className="w-3 h-3" />
                              Receipt
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <p className="font-bold">
                          {parseFloat(item.amount || "0").toLocaleString("en-US", { style: "currency", currency: item.currency || "USD" })}
                        </p>
                        {item.status === "submitted" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive h-8 w-8"
                            onClick={() => cancelMutation.mutate({ id: item.id })}
                            disabled={cancelMutation.isPending}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {item.clientRejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                        <strong>Rejection reason:</strong> {item.clientRejectionReason}
                      </div>
                    )}
                    {item.adminRejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                        <strong>Admin rejection:</strong> {item.adminRejectionReason}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Create Reimbursement Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={(open) => { if (!open) { setCreateDialogOpen(false); resetForm(); } }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Submit Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Amount *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} maxLength={3} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Effective Month *</Label>
                <Input type="month" value={effectiveMonth} onChange={(e) => setEffectiveMonth(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  placeholder="Describe the expense..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Receipt URL (optional)</Label>
                <Input
                  placeholder="https://storage.example.com/receipt.pdf"
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Upload your receipt first, then paste the URL here.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setCreateDialogOpen(false); resetForm(); }}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitMutation.isPending || !category || !amount || !effectiveMonth}>
                {submitMutation.isPending ? "Submitting..." : "Submit"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </WorkerLayout>
  );
}
