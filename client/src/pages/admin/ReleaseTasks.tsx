import { useState } from "react";
import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { CheckCircle, XCircle, AlertCircle, Building2, Wallet, Landmark } from "lucide-react";
import { formatCurrencyAmount } from "@/components/CurrencyAmount";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function ReleaseTasks() {
  const { t } = useI18n();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [disposition, setDisposition] = useState<"to_wallet" | "to_bank">("to_wallet");
  
  const utils = trpc.useUtils();

  // Fetch pending credit notes (deposit releases)
  // Assuming we filter by invoiceType='credit_note' and status='draft'
  // Or we might need a specific endpoint if logic is complex.
  // Using generic invoice list for now.
  const { data, isLoading } = trpc.invoices.list.useQuery({
    type: "credit_note", // or deposit_refund?
    status: "draft",
    limit: 50,
  });

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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Release Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">Approve deposit releases and credit note dispositions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CN #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : data?.data && data.data.length > 0 ? (
                  data.data.map((cn: any) => (
                    <TableRow key={cn.id}>
                      <TableCell className="font-medium">{cn.invoiceNumber}</TableCell>
                      <TableCell>{cn.customerName}</TableCell>
                      <TableCell className="font-mono text-emerald-600">
                        {formatCurrencyAmount(Math.abs(parseFloat(cn.total)), cn.currency)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {cn.notes || "Deposit Release"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(cn.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => {
                          setSelectedTask(cn);
                          setDisposition("to_wallet"); // Default
                          setShowApproveDialog(true);
                        }}>
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                      No pending release tasks
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

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
