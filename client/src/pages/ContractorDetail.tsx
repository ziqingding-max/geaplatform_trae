import Layout from "@/components/Layout";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Calendar, DollarSign, User, Briefcase, FileText, Settings, CreditCard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrencyAmount } from "@/components/CurrencyAmount";
import CurrencySelect from "@/components/CurrencySelect";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format";

function InvoiceDetailDialog({ invoiceId, open, onOpenChange }: { invoiceId: number | null, open: boolean, onOpenChange: (o: boolean) => void }) {
  const { data: invoice, isLoading } = trpc.contractors.invoices.get.useQuery(
    { id: invoiceId! },
    { enabled: !!invoiceId && open }
  );

  if (!invoiceId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Invoice {invoice?.invoiceNumber}</DialogTitle>
          <DialogDescription>
            {invoice ? `${formatDate(invoice.invoiceDate)} · ${invoice.status}` : "Loading..."}
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : invoice ? (
          <div className="space-y-6">
             <div className="flex justify-between text-sm">
               <div>
                 <div className="text-muted-foreground">From:</div>
                 <div className="font-medium">{invoice.contractorName}</div>
               </div>
               <div className="text-right">
                 <div className="text-muted-foreground">To:</div>
                 <div className="font-medium">{invoice.customerName}</div>
               </div>
             </div>

             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Description</TableHead>
                   <TableHead className="text-right">Quantity</TableHead>
                   <TableHead className="text-right">Unit Price</TableHead>
                   <TableHead className="text-right">Amount</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {invoice.items?.map((item: any) => (
                   <TableRow key={item.id}>
                     <TableCell>{item.description}</TableCell>
                     <TableCell className="text-right">{item.quantity}</TableCell>
                     <TableCell className="text-right">{formatCurrencyAmount(item.unitPrice, invoice.currency)}</TableCell>
                     <TableCell className="text-right font-medium">{formatCurrencyAmount(item.amount, invoice.currency)}</TableCell>
                   </TableRow>
                 ))}
                 <TableRow>
                   <TableCell colSpan={3} className="text-right font-bold">Total</TableCell>
                   <TableCell className="text-right font-bold text-lg">
                     {formatCurrencyAmount(invoice.totalAmount, invoice.currency)}
                   </TableCell>
                 </TableRow>
               </TableBody>
             </Table>
             
             <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                <Button onClick={() => window.print()}>Download PDF</Button>
             </div>
          </div>
        ) : (
          <div>Not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function ContractorDetail() {
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const id = params?.id ? parseInt(params.id, 10) : 0;
  const [activeTab, setActiveTab] = useState("overview");

  const { data: contractor, isLoading, refetch } = trpc.contractors.get.useQuery({ id }, { enabled: !!id });
  const { data: milestones, refetch: refetchMilestones } = trpc.contractors.milestones.list.useQuery({ contractorId: id }, { enabled: !!id && activeTab === "milestones" });
  const { data: adjustments, refetch: refetchAdjustments } = trpc.contractors.adjustments.list.useQuery({ contractorId: id }, { enabled: !!id && activeTab === "adjustments" });
  const { data: invoices, refetch: refetchInvoices } = trpc.contractors.invoices.list.useQuery({ contractorId: id }, { enabled: !!id && activeTab === "invoices" });
  
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  const createMilestoneMutation = trpc.contractors.milestones.create.useMutation({
    onSuccess: () => {
      toast.success("Milestone created");
      setMilestoneOpen(false);
      refetchMilestones();
    },
    onError: (err) => toast.error(err.message),
  });

  const createAdjustmentMutation = trpc.contractors.adjustments.create.useMutation({
    onSuccess: () => {
      toast.success("Adjustment created");
      setAdjustmentOpen(false);
      refetchAdjustments();
    },
    onError: (err) => toast.error(err.message),
  });

  const [milestoneOpen, setMilestoneOpen] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({
    title: "",
    description: "",
    amount: "",
    currency: "USD",
    dueDate: "",
  });

  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [adjustmentForm, setAdjustmentForm] = useState({
    type: "bonus" as "bonus" | "expense" | "deduction",
    description: "",
    amount: "",
    currency: "USD",
    date: new Date().toISOString().split('T')[0],
  });

  if (isLoading) return <Layout>Loading...</Layout>;
  if (!contractor) return <Layout>Not Found</Layout>;

  return (
    <Layout breadcrumb={["GEA", "People", "Contractors", `${contractor.firstName} ${contractor.lastName}`]}>
      <div className="p-6 space-y-6 page-enter">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/people?tab=contractors")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{contractor.firstName} {contractor.lastName}</h1>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span className="font-mono">{contractor.contractorCode}</span>
              <span>·</span>
              <span>{contractor.jobTitle}</span>
            </div>
          </div>
          <Badge variant="outline" className="capitalize">{contractor.status}</Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">{t("contractors.detail.tabs.overview")}</TabsTrigger>
            <TabsTrigger value="milestones">{t("contractors.detail.tabs.milestones")}</TabsTrigger>
            <TabsTrigger value="adjustments">{t("contractors.detail.tabs.adjustments") || "Adjustments"}</TabsTrigger>
            <TabsTrigger value="invoices">{t("contractors.detail.tabs.invoices")}</TabsTrigger>
            <TabsTrigger value="settings">{t("contractors.detail.tabs.settings")}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4" /> {t("contractors.overview.personalInfo")}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <InfoRow label="Email" value={contractor.email} />
                  <InfoRow label="Phone" value={contractor.phone} />
                  <InfoRow label="Nationality" value={contractor.nationality} />
                  <InfoRow label="Country" value={contractor.country} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Briefcase className="w-4 h-4" /> {t("contractors.overview.serviceInfo")}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <InfoRow label="Job Title" value={contractor.jobTitle} />
                  <InfoRow label="Department" value={contractor.department} />
                  <InfoRow label="Start Date" value={formatDate(contractor.startDate)} />
                  <InfoRow label="End Date" value={formatDate(contractor.endDate)} />
                  <InfoRow label="Default Approver" value={contractor.defaultApproverName} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4" /> {t("contractors.overview.financialConfig")}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <InfoRow label="Currency" value={contractor.currency} />
                  <InfoRow label="Payment Frequency" value={contractor.paymentFrequency} />
                  <InfoRow label="Rate Type" value={contractor.rateType} />
                  <InfoRow label="Rate Amount" value={contractor.rateAmount ? formatCurrencyAmount(contractor.rateAmount, contractor.currency) : "—"} />
                  <InfoRow label="Next Payment Date" value={formatDate(contractor.nextPaymentDate)} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">{t("contractors.milestones.title")}</h3>
              <Dialog open={milestoneOpen} onOpenChange={setMilestoneOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="w-4 h-4 mr-2" />{t("contractors.milestones.add")}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{t("contractors.milestones.add")}</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input value={milestoneForm.title} onChange={e => setMilestoneForm({...milestoneForm, title: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input value={milestoneForm.description} onChange={e => setMilestoneForm({...milestoneForm, description: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input type="number" value={milestoneForm.amount} onChange={e => setMilestoneForm({...milestoneForm, amount: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <CurrencySelect value={milestoneForm.currency} onValueChange={v => setMilestoneForm({...milestoneForm, currency: v})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Input type="date" value={milestoneForm.dueDate} onChange={e => setMilestoneForm({...milestoneForm, dueDate: e.target.value})} />
                    </div>
                    <Button className="w-full" onClick={() => createMilestoneMutation.mutate({...milestoneForm, contractorId: id})} disabled={createMilestoneMutation.isPending}>
                      {createMilestoneMutation.isPending ? "Creating..." : "Create Milestone"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Approved By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {milestones?.length ? milestones.map(m => (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="font-medium">{m.title}</div>
                          <div className="text-xs text-muted-foreground">{m.description}</div>
                        </TableCell>
                        <TableCell className="font-mono">{m.currency} {m.amount}</TableCell>
                        <TableCell>{formatDate(m.dueDate)}</TableCell>
                        <TableCell><Badge variant="outline">{m.status}</Badge></TableCell>
                        <TableCell className="text-sm">
                          {m.approverName ? (
                            <div>
                              <div>{m.approverName}</div>
                              {m.approvedAt && <div className="text-xs text-muted-foreground">{formatDate(m.approvedAt)}</div>}
                            </div>
                          ) : "—"}
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">{t("contractors.milestones.empty")}</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Adjustments Tab */}
          <TabsContent value="adjustments" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">{t("contractors.adjustments.title") || "Adjustments"}</h3>
              <Dialog open={adjustmentOpen} onOpenChange={setAdjustmentOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="w-4 h-4 mr-2" />Add Adjustment</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Adjustment</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={adjustmentForm.type} onValueChange={(v: any) => setAdjustmentForm({...adjustmentForm, type: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bonus">Bonus</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                          <SelectItem value="deduction">Deduction</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input value={adjustmentForm.description} onChange={e => setAdjustmentForm({...adjustmentForm, description: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input type="number" value={adjustmentForm.amount} onChange={e => setAdjustmentForm({...adjustmentForm, amount: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <CurrencySelect value={adjustmentForm.currency} onValueChange={v => setAdjustmentForm({...adjustmentForm, currency: v})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" value={adjustmentForm.date} onChange={e => setAdjustmentForm({...adjustmentForm, date: e.target.value})} />
                    </div>
                    <Button className="w-full" onClick={() => createAdjustmentMutation.mutate({...adjustmentForm, contractorId: id})} disabled={createAdjustmentMutation.isPending}>
                      {createAdjustmentMutation.isPending ? "Creating..." : "Create Adjustment"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adjustments?.length ? adjustments.map(adj => (
                      <TableRow key={adj.id}>
                        <TableCell className="capitalize font-medium">{adj.type}</TableCell>
                        <TableCell>{adj.description}</TableCell>
                        <TableCell className={adj.type === 'deduction' ? "text-red-500 font-mono" : "text-green-600 font-mono"}>
                          {adj.type === 'deduction' ? "-" : "+"}{adj.currency} {adj.amount}
                        </TableCell>
                        <TableCell>{formatDate(adj.date)}</TableCell>
                        <TableCell><Badge variant="outline">{adj.status}</Badge></TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No adjustments found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-4">
            <h3 className="text-lg font-medium">{t("contractors.invoices.title")}</h3>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices?.length ? invoices.map(inv => (
                      <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedInvoiceId(inv.id); setInvoiceOpen(true); }}>
                        <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                        <TableCell>{formatDate(inv.invoiceDate)}</TableCell>
                        <TableCell className="font-mono">{inv.currency} {inv.totalAmount}</TableCell>
                        <TableCell><Badge variant="outline">{inv.status}</Badge></TableCell>
                        <TableCell><FileText className="w-4 h-4 text-muted-foreground" /></TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{t("contractors.invoices.empty")}</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <InvoiceDetailDialog 
              invoiceId={selectedInvoiceId} 
              open={invoiceOpen} 
              onOpenChange={setInvoiceOpen} 
            />
          </TabsContent>

          {/* Settings Tab - Placeholder for now */}
          <TabsContent value="settings">
            <Card>
              <CardHeader><CardTitle>{t("contractors.settings.title")}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Contractor settings and configuration coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </Layout>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between py-1 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </div>
  );
}
