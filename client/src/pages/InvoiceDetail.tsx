import { useParams, useLocation } from "wouter";
import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft, Download, FileText, CreditCard, Calendar,
  Hash, Clock, CheckCircle2, AlertTriangle,
  Receipt, CircleDollarSign, Info, ExternalLink,
  ArrowRight, Link2, Trash2, Edit, Save, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  pending_review: "bg-blue-50 text-blue-700 border-blue-200",
  sent: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  overdue: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
  void: "bg-gray-100 text-gray-500 border-gray-200",
};

export default function InvoiceDetail() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const invoiceId = parseInt(params.id || "0", 10);
  const [isEditing, setIsEditing] = useState(false);

  const { data: invoice, isLoading: isLoadingInvoice, refetch: refetchInvoice } = trpc.invoices.get.useQuery(
    { id: invoiceId },
    { enabled: !!invoiceId }
  );

  const { data: items, isLoading: isLoadingItems, refetch: refetchItems } = trpc.invoices.getItems.useQuery(
    { invoiceId },
    { enabled: !!invoiceId }
  );

  const isLoading = isLoadingInvoice || isLoadingItems;

  const refetch = () => {
    refetchInvoice();
    refetchItems();
  };

  const updateMutation = trpc.invoices.update.useMutation({
    onSuccess: () => {
      toast.success("Invoice updated");
      setIsEditing(false);
      refetch();
    }
  });

  const updateStatusMutation = trpc.invoices.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated");
      refetch();
    }
  });
  
  const updateItemMutation = trpc.invoices.updateItem.useMutation({
    onSuccess: () => {
        // toast.success("Item updated");
        refetch();
    }
  });

  const deleteItemMutation = trpc.invoices.deleteItem.useMutation({
    onSuccess: () => {
      toast.success("Item deleted");
      refetch();
    }
  });
  
  const addItemMutation = trpc.invoices.addItem.useMutation({
    onSuccess: () => {
        toast.success("Item added");
        refetch();
    }
  });

  const [notes, setNotes] = useState("");
  
  useEffect(() => {
    if (invoice) {
        setNotes(invoice.notes || "");
    }
  }, [invoice]);

  const handleSave = () => {
    updateMutation.mutate({
      id: invoiceId,
      data: {
        notes: notes,
      }
    });
  };

  const handleDeleteItem = (itemId: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
        deleteItemMutation.mutate({ id: itemId, invoiceId });
    }
  };

  const handleAddItem = () => {
    // Simple add item for now
    addItemMutation.mutate({
        invoiceId: invoiceId,
        description: "New Item",
        quantity: "1",
        unitPrice: "0",
        amount: "0",
        localAmount: "0",
        localCurrency: invoice?.currency || "USD",
        itemType: "consulting_fee"
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  if (!invoice) {
    return (
      <Layout>
        <div className="p-6">
            <Button variant="ghost" onClick={() => setLocation("/invoices")}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Invoices
            </Button>
            <div className="mt-8 text-center">
                <h2 className="text-xl font-bold">Invoice not found</h2>
            </div>
        </div>
      </Layout>
    );
  }

  const isDraft = invoice.status === "draft";

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/invoices")}
          className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight font-mono">
                {invoice.invoiceNumber || `INV-${invoice.id}`}
              </h1>
              <Badge variant="outline" className={cn("text-sm px-3 py-1", statusColors[invoice.status])}>
                {invoice.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {invoice.invoiceType}
            </p>
          </div>
          <div className="flex gap-2">
            {isDraft && (
                <>
                {isEditing ? (
                    <Button onClick={handleSave} className="gap-2">
                        <Save className="w-4 h-4" /> Save Changes
                    </Button>
                ) : (
                    <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                        <Edit className="w-4 h-4" /> Edit Notes
                    </Button>
                )}
                <Button 
                    variant="default"
                    onClick={() => updateStatusMutation.mutate({ id: invoiceId, status: "pending_review" })}
                >
                    Submit for Review
                </Button>
                </>
            )}
            <Button variant="outline" onClick={() => window.print()} className="gap-2">
              <Download className="w-4 h-4" /> PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <MetaField icon={Calendar} label="Issue Date" value={formatDate(invoice.sentDate)} />
                  <MetaField icon={Clock} label="Due Date" value={formatDate(invoice.dueDate)} />
                  <MetaField icon={CircleDollarSign} label="Currency" value={invoice.currency || "USD"} />
                  <MetaField icon={Hash} label="Reference" value={invoice.invoiceNumber || "-"} mono />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-muted-foreground" />
                  Line Items
                </CardTitle>
                {isDraft && (
                    <Button size="sm" variant="outline" onClick={handleAddItem}>
                        <Plus className="w-4 h-4 mr-2" /> Add Item
                    </Button>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="pl-6">Description</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right pr-6">Amount</TableHead>
                        {isDraft && <TableHead className="w-10"></TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(items || []).map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="pl-6">
                            {isDraft ? (
                                <Input 
                                    defaultValue={item.description} 
                                    className="h-8"
                                    onBlur={(e) => {
                                        if (e.target.value !== item.description) {
                                            updateItemMutation.mutate({
                                                id: item.id,
                                                invoiceId: invoiceId,
                                                data: { description: e.target.value }
                                            });
                                        }
                                    }}
                                />
                            ) : (
                                <span className="font-medium">{item.description}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {isDraft ? (
                                <Input 
                                    defaultValue={item.quantity} 
                                    className="h-8 w-20 ml-auto text-right"
                                    onBlur={(e) => {
                                        if (e.target.value !== item.quantity) {
                                            updateItemMutation.mutate({
                                                id: item.id,
                                                invoiceId: invoiceId,
                                                data: { quantity: e.target.value }
                                            });
                                        }
                                    }}
                                />
                            ) : item.quantity}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(invoice.currency, item.unitPrice)}
                          </TableCell>
                          <TableCell className="text-right font-mono pr-6">
                            {formatCurrency(invoice.currency, item.amount)}
                          </TableCell>
                          {isDraft && (
                            <TableCell>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => handleDeleteItem(item.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="w-4 h-4 text-muted-foreground" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Input 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)} 
                        className="w-full"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes || "No notes"}</p>
                  )}
                </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-muted/10">
                <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-mono">{formatCurrency(invoice.currency, invoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax</span>
                        <span className="font-mono">{formatCurrency(invoice.currency, invoice.tax)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="font-mono">{formatCurrency(invoice.currency, invoice.total)}</span>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function MetaField({ icon: Icon, label, value, mono }: any) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <p className={cn("text-sm font-medium", mono && "font-mono")}>{value}</p>
    </div>
  );
}
