
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, CalendarDays, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DatePicker } from "@/components/DatePicker";
import { formatDate, formatCurrency } from "@/lib/format";

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  paid: "bg-blue-50 text-blue-700 border-blue-200",
  cancelled: "bg-gray-50 text-gray-700 border-gray-200",
};

export default function ContractorMilestones() {
  const { t } = useI18n();
  const [selectedContractorId, setSelectedContractorId] = useState<string>("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<any>(null);

  // Load contractors
  const { data: contractorsData, isLoading: isLoadingContractors } = trpc.contractors.list.useQuery({
    status: "active",
    limit: 100,
  });
  const contractors = contractorsData?.data || [];

  // Load milestones for selected contractor
  const { data: milestones, isLoading: isLoadingMilestones, refetch } = trpc.contractors.milestones.list.useQuery(
    { contractorId: parseInt(selectedContractorId) },
    { enabled: !!selectedContractorId }
  );

  const createMutation = trpc.contractors.milestones.create.useMutation({
    onSuccess: () => {
      toast.success("Milestone created");
      setCreateOpen(false);
      refetch();
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.contractors.milestones.update.useMutation({
    onSuccess: () => {
      toast.success("Milestone updated");
      setEditOpen(false);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.contractors.milestones.delete.useMutation({
    onSuccess: () => {
      toast.success("Milestone deleted");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    currency: "USD",
    dueDate: "",
  });

  function resetForm() {
    setFormData({
      title: "",
      description: "",
      amount: "",
      currency: "USD",
      dueDate: "",
    });
  }

  function handleCreate() {
    if (!selectedContractorId) return;
    if (!formData.title || !formData.amount) {
      toast.error(t("common.required"));
      return;
    }
    createMutation.mutate({
      contractorId: parseInt(selectedContractorId),
      title: formData.title,
      description: formData.description,
      amount: formData.amount,
      currency: formData.currency,
      dueDate: formData.dueDate || undefined,
    });
  }

  function handleEdit(milestone: any) {
    setEditingMilestone(milestone);
    setFormData({
      title: milestone.title,
      description: milestone.description || "",
      amount: milestone.amount,
      currency: milestone.currency,
      dueDate: milestone.dueDate || "",
    });
    setEditOpen(true);
  }

  function handleUpdate() {
    if (!editingMilestone) return;
    updateMutation.mutate({
      id: editingMilestone.id,
      data: {
        title: formData.title,
        description: formData.description,
        amount: formData.amount,
        dueDate: formData.dueDate || undefined,
      },
    });
  }

  function handleDelete(id: number) {
    if (confirm(t("common.confirm"))) {
      deleteMutation.mutate({ id });
    }
  }

  // Determine currency from selected contractor
  const selectedContractor = useMemo(() => {
    return contractors.find(c => String(c.id) === selectedContractorId);
  }, [selectedContractorId, contractors]);

  // Update currency when contractor changes
  useMemo(() => {
    if (selectedContractor) {
      setFormData(prev => ({ ...prev, currency: selectedContractor.currency || "USD" }));
    }
  }, [selectedContractor]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">{t("milestones.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("milestones.description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedContractorId} onValueChange={setSelectedContractorId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder={t("milestones.table.header.contractor")} />
            </SelectTrigger>
            <SelectContent>
              {contractors.map((c: any) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.firstName} {c.lastName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button disabled={!selectedContractorId} onClick={() => { resetForm(); setCreateOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> {t("milestones.button.new")}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {!selectedContractorId ? (
            <div className="text-center py-12">
              <CalendarDays className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Select a contractor to view milestones</p>
            </div>
          ) : isLoadingMilestones ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("milestones.table.header.title")}</TableHead>
                  <TableHead>{t("milestones.table.header.amount")}</TableHead>
                  <TableHead>{t("milestones.table.header.dueDate")}</TableHead>
                  <TableHead>{t("milestones.table.header.status")}</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {milestones && milestones.length > 0 ? (
                  milestones.map((m: any) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="font-medium">{m.title}</div>
                        {m.description && <div className="text-xs text-muted-foreground">{m.description}</div>}
                      </TableCell>
                      <TableCell>{formatCurrency(parseFloat(m.amount), m.currency)}</TableCell>
                      <TableCell>{m.dueDate ? formatDate(m.dueDate) : "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[m.status] || ""}>
                          {t(`milestones.status.${m.status}`) || m.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {m.status === "pending" && (
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(m)}>
                              <Pencil className="w-4 h-4 text-blue-500" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No milestones found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("milestones.dialog.title.new")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("milestones.table.header.title")} *</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t("milestones.table.header.amount")} *</Label>
              <div className="flex gap-2">
                <div className="w-20 pt-2 text-sm font-mono bg-muted text-center rounded-md border">{formData.currency}</div>
                <Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("milestones.table.header.dueDate")}</Label>
              <DatePicker value={formData.dueDate ? new Date(formData.dueDate) : undefined} onChange={(d) => setFormData({ ...formData, dueDate: d ? d.toISOString() : "" })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>{createMutation.isPending ? "Creating..." : t("common.create")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("milestones.dialog.title.edit")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("milestones.table.header.title")} *</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t("milestones.table.header.amount")} *</Label>
              <div className="flex gap-2">
                <div className="w-20 pt-2 text-sm font-mono bg-muted text-center rounded-md border">{formData.currency}</div>
                <Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("milestones.table.header.dueDate")}</Label>
              <DatePicker value={formData.dueDate ? new Date(formData.dueDate) : undefined} onChange={(d) => setFormData({ ...formData, dueDate: d ? d.toISOString() : "" })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>{updateMutation.isPending ? "Saving..." : t("common.save")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
