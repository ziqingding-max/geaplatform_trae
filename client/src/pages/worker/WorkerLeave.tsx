import { useState } from "react";
import { workerTrpc } from "@/lib/workerTrpc";
import WorkerLayout from "./WorkerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CalendarDays, Plus, X } from "lucide-react";
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

export default function WorkerLeave() {
  const [page, setPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [leaveTypeId, setLeaveTypeId] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [days, setDays] = useState("");
  const [reason, setReason] = useState("");

  const utils = workerTrpc.useUtils();

  const { data: balances, isLoading: balancesLoading } = workerTrpc.leave.getBalances.useQuery();
  const { data, isLoading } = workerTrpc.leave.list.useQuery({ page, pageSize: 20 });

  const submitMutation = workerTrpc.leave.submit.useMutation({
    onSuccess: () => {
      toast.success("Leave request submitted");
      setCreateDialogOpen(false);
      resetForm();
      utils.leave.list.invalidate();
      utils.leave.getBalances.invalidate();
      utils.dashboard.getSummary.invalidate();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit leave request");
    },
  });

  const cancelMutation = workerTrpc.leave.cancel.useMutation({
    onSuccess: () => {
      toast.success("Leave request cancelled");
      utils.leave.list.invalidate();
      utils.leave.getBalances.invalidate();
      utils.dashboard.getSummary.invalidate();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to cancel leave request");
    },
  });

  const resetForm = () => {
    setLeaveTypeId("");
    setStartDate("");
    setEndDate("");
    setDays("");
    setReason("");
  };

  const handleSubmit = () => {
    if (!leaveTypeId || !startDate || !endDate || !days) {
      toast.error("Please fill in all required fields");
      return;
    }
    submitMutation.mutate({
      leaveTypeId: parseInt(leaveTypeId),
      startDate,
      endDate,
      days,
      reason: reason || undefined,
    });
  };

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <WorkerLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Leave</h1>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Request Leave
          </Button>
        </div>

        {/* Leave Balances */}
        {!balancesLoading && balances && balances.length > 0 && (
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {balances.map((b: any) => (
              <Card key={b.id}>
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-muted-foreground">{b.leaveTypeName}</p>
                  <div className="mt-1">
                    <span className="text-2xl font-bold">{b.remaining}</span>
                    <span className="text-sm text-muted-foreground ml-1">/ {b.totalEntitlement}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{b.used} used</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Leave Records */}
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : data?.items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No leave records yet.</p>
              <Button variant="outline" className="mt-3" onClick={() => setCreateDialogOpen(true)}>
                Request your first leave
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {data?.items.map((record: any) => (
                <Card key={record.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{record.startDate} - {record.endDate}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${statusStyles[record.status] || "bg-gray-100 text-gray-700"}`}>
                            {statusLabels[record.status] || record.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {record.days} day(s)
                          {record.reason && <span> — {record.reason}</span>}
                        </p>
                      </div>
                      {record.status === "submitted" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-destructive hover:text-destructive"
                          onClick={() => cancelMutation.mutate({ id: record.id })}
                          disabled={cancelMutation.isPending}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {record.clientRejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                        <strong>Rejection reason:</strong> {record.clientRejectionReason}
                      </div>
                    )}
                    {record.adminRejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                        <strong>Admin rejection:</strong> {record.adminRejectionReason}
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

        {/* Create Leave Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={(open) => { if (!open) { setCreateDialogOpen(false); resetForm(); } }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Request Leave</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Leave Type *</Label>
                <Select value={leaveTypeId} onValueChange={setLeaveTypeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {balances?.map((b: any) => (
                      <SelectItem key={b.leaveTypeId} value={b.leaveTypeId.toString()}>
                        {b.leaveTypeName} ({b.remaining} remaining)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Days *</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  placeholder="e.g. 1, 0.5, 3"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Use 0.5 for half-day leave</p>
              </div>
              <div className="space-y-2">
                <Label>Reason (optional)</Label>
                <Textarea
                  placeholder="Reason for leave..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setCreateDialogOpen(false); resetForm(); }}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitMutation.isPending || !leaveTypeId || !startDate || !endDate || !days}>
                {submitMutation.isPending ? "Submitting..." : "Submit"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </WorkerLayout>
  );
}
