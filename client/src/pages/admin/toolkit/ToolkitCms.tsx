/**
 * Toolkit CMS — Admin-only content management for Benefits, Compliance, and Templates.
 * Follows the existing KnowledgeBaseAdmin pattern: Tabs + Sheet for CRUD.
 */

import { useState } from "react";
import Layout from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DatabaseZap, Gift, ShieldCheck, FolderOpen, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

// ─── Benefits Tab ───────────────────────────────────────────────────────
function BenefitsTab() {
  const { t } = useI18n();
  const utils = trpc.useUtils();
  const [countryCode, setCountryCode] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form, setForm] = useState({
    countryCode: "", category: "statutory", nameEn: "", nameZh: "",
    descriptionEn: "", descriptionZh: "", costIndication: "",
    pitchCardEn: "", pitchCardZh: "", source: "ai_generated", sortOrder: 0,
  });

  const { data: countries } = trpc.toolkitEnhanced.getActiveCountries.useQuery();
  const { data: benefits, isLoading } = trpc.toolkitEnhanced.getBenefitsByCountry.useQuery(
    { countryCode },
    { enabled: !!countryCode }
  );

  const createMutation = trpc.toolkitEnhanced.createBenefit.useMutation({
    onSuccess: () => { utils.toolkitEnhanced.getBenefitsByCountry.invalidate(); setSheetOpen(false); toast.success(t("cms.saved")); },
    onError: (err) => toast.error(err.message),
  });
  const updateMutation = trpc.toolkitEnhanced.updateBenefit.useMutation({
    onSuccess: () => { utils.toolkitEnhanced.getBenefitsByCountry.invalidate(); setSheetOpen(false); toast.success(t("cms.saved")); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.toolkitEnhanced.deleteBenefit.useMutation({
    onSuccess: () => { utils.toolkitEnhanced.getBenefitsByCountry.invalidate(); toast.success(t("cms.deleted")); },
    onError: (err) => toast.error(err.message),
  });

  const openCreate = () => {
    setEditingItem(null);
    setForm({ countryCode: countryCode || "", category: "statutory", nameEn: "", nameZh: "", descriptionEn: "", descriptionZh: "", costIndication: "", pitchCardEn: "", pitchCardZh: "", source: "ai_generated", sortOrder: 0 });
    setSheetOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setForm({
      countryCode: item.countryCode, category: item.category, nameEn: item.nameEn || "", nameZh: item.nameZh || "",
      descriptionEn: item.descriptionEn || "", descriptionZh: item.descriptionZh || "", costIndication: item.costIndication || "",
      pitchCardEn: item.pitchCardEn || "", pitchCardZh: item.pitchCardZh || "", source: item.source || "ai_generated", sortOrder: item.sortOrder || 0,
    });
    setSheetOpen(true);
  };

  const handleSave = () => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={countryCode} onValueChange={setCountryCode}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t("cms.select_country")} />
            </SelectTrigger>
            <SelectContent>
              {countries?.map((c: any) => (
                <SelectItem key={c.countryCode} value={c.countryCode}>{c.countryName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate} disabled={!countryCode}>
          <Plus className="mr-2 h-4 w-4" /> {t("cms.add")}
        </Button>
      </div>

      {countryCode && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("cms.name_en")}</TableHead>
              <TableHead>{t("cms.name_zh")}</TableHead>
              <TableHead>{t("cms.category")}</TableHead>
              <TableHead>{t("cms.source")}</TableHead>
              <TableHead className="w-[100px]">{t("cms.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {benefits?.map((b: any) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.nameEn}</TableCell>
                <TableCell>{b.nameZh}</TableCell>
                <TableCell><Badge variant={b.category === "statutory" ? "default" : "secondary"}>{b.category}</Badge></TableCell>
                <TableCell><Badge variant="outline" className="text-xs">{b.source}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(b)}><Pencil className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("cms.confirm_delete")}</AlertDialogTitle>
                          <AlertDialogDescription>{t("cms.confirm_delete_desc")}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("cms.cancel")}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate({ id: b.id })}>{t("cms.delete")}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!benefits?.length && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">{t("cms.no_data")}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingItem ? t("cms.edit") : t("cms.add")} {t("cms.benefit")}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("cms.country")}</Label>
                <Select value={form.countryCode} onValueChange={(v) => setForm({ ...form, countryCode: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {countries?.map((c: any) => (
                      <SelectItem key={c.countryCode} value={c.countryCode}>{c.countryName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("cms.category")}</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="statutory">Statutory</SelectItem>
                    <SelectItem value="customary">Customary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("cms.name_en")}</Label>
                <Input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("cms.name_zh")}</Label>
                <Input value={form.nameZh} onChange={(e) => setForm({ ...form, nameZh: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("cms.description_en")}</Label>
              <Textarea value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>{t("cms.description_zh")}</Label>
              <Textarea value={form.descriptionZh} onChange={(e) => setForm({ ...form, descriptionZh: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>{t("cms.cost_indication")}</Label>
              <Input value={form.costIndication} onChange={(e) => setForm({ ...form, costIndication: e.target.value })} placeholder="e.g. 8.33% of base salary" />
            </div>
            <div className="space-y-2">
              <Label>{t("cms.pitch_card_en")}</Label>
              <Textarea value={form.pitchCardEn} onChange={(e) => setForm({ ...form, pitchCardEn: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>{t("cms.pitch_card_zh")}</Label>
              <Textarea value={form.pitchCardZh} onChange={(e) => setForm({ ...form, pitchCardZh: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("cms.source")}</Label>
                <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gea_official">GEA Official</SelectItem>
                    <SelectItem value="ai_generated">AI Generated</SelectItem>
                    <SelectItem value="gov_crawled">Gov Crawled</SelectItem>
                    <SelectItem value="manual_input">Manual Input</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("cms.sort_order")}</Label>
                <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("cms.save")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Compliance Tab ─────────────────────────────────────────────────────
function ComplianceTab() {
  const { t } = useI18n();
  const utils = trpc.useUtils();
  const [countryCode, setCountryCode] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form, setForm] = useState({
    countryCode: "", category: "general", metricNameEn: "", metricNameZh: "",
    metricValueEn: "", metricValueZh: "", riskLevel: "low" as string,
    notesEn: "", notesZh: "", source: "ai_generated", sortOrder: 0,
  });

  const { data: countries } = trpc.toolkitEnhanced.getActiveCountries.useQuery();
  const { data: complianceItems } = trpc.toolkitEnhanced.getComplianceByCountry.useQuery(
    { countryCode },
    { enabled: !!countryCode }
  );

  const createMutation = trpc.toolkitEnhanced.createCompliance.useMutation({
    onSuccess: () => { utils.toolkitEnhanced.getComplianceByCountry.invalidate(); setSheetOpen(false); toast.success(t("cms.saved")); },
    onError: (err) => toast.error(err.message),
  });
  const updateMutation = trpc.toolkitEnhanced.updateCompliance.useMutation({
    onSuccess: () => { utils.toolkitEnhanced.getComplianceByCountry.invalidate(); setSheetOpen(false); toast.success(t("cms.saved")); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.toolkitEnhanced.deleteCompliance.useMutation({
    onSuccess: () => { utils.toolkitEnhanced.getComplianceByCountry.invalidate(); toast.success(t("cms.deleted")); },
    onError: (err) => toast.error(err.message),
  });

  const openCreate = () => {
    setEditingItem(null);
    setForm({ countryCode: countryCode || "", category: "general", metricNameEn: "", metricNameZh: "", metricValueEn: "", metricValueZh: "", riskLevel: "low", notesEn: "", notesZh: "", source: "ai_generated", sortOrder: 0 });
    setSheetOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setForm({
      countryCode: item.countryCode, category: item.category || "general", metricNameEn: item.metricNameEn || "", metricNameZh: item.metricNameZh || "",
      metricValueEn: item.metricValueEn || "", metricValueZh: item.metricValueZh || "", riskLevel: item.riskLevel || "low",
      notesEn: item.notesEn || "", notesZh: item.notesZh || "", source: item.source || "ai_generated", sortOrder: item.sortOrder || 0,
    });
    setSheetOpen(true);
  };

  const handleSave = () => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={countryCode} onValueChange={setCountryCode}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("cms.select_country")} />
          </SelectTrigger>
          <SelectContent>
            {countries?.map((c: any) => (
              <SelectItem key={c.countryCode} value={c.countryCode}>{c.countryName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={openCreate} disabled={!countryCode}>
          <Plus className="mr-2 h-4 w-4" /> {t("cms.add")}
        </Button>
      </div>

      {countryCode && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("cms.metric_en")}</TableHead>
              <TableHead>{t("cms.value_en")}</TableHead>
              <TableHead>{t("cms.category")}</TableHead>
              <TableHead>{t("cms.risk_level")}</TableHead>
              <TableHead>{t("cms.source")}</TableHead>
              <TableHead className="w-[100px]">{t("cms.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complianceItems?.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.metricNameEn}</TableCell>
                <TableCell>{item.metricValueEn}</TableCell>
                <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                <TableCell>
                  <Badge variant={item.riskLevel === "high" ? "destructive" : item.riskLevel === "medium" ? "outline" : "secondary"}>
                    {item.riskLevel}
                  </Badge>
                </TableCell>
                <TableCell><Badge variant="outline" className="text-xs">{item.source}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("cms.confirm_delete")}</AlertDialogTitle>
                          <AlertDialogDescription>{t("cms.confirm_delete_desc")}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("cms.cancel")}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate({ id: item.id })}>{t("cms.delete")}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!complianceItems?.length && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">{t("cms.no_data")}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingItem ? t("cms.edit") : t("cms.add")} {t("cms.compliance_item")}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("cms.country")}</Label>
                <Select value={form.countryCode} onValueChange={(v) => setForm({ ...form, countryCode: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {countries?.map((c: any) => (
                      <SelectItem key={c.countryCode} value={c.countryCode}>{c.countryName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("cms.category")}</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="probation">Probation</SelectItem>
                    <SelectItem value="notice_period">Notice Period</SelectItem>
                    <SelectItem value="termination">Termination</SelectItem>
                    <SelectItem value="background_check">Background Check</SelectItem>
                    <SelectItem value="working_hours">Working Hours</SelectItem>
                    <SelectItem value="leave">Leave</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("cms.metric_en")}</Label>
                <Input value={form.metricNameEn} onChange={(e) => setForm({ ...form, metricNameEn: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("cms.metric_zh")}</Label>
                <Input value={form.metricNameZh} onChange={(e) => setForm({ ...form, metricNameZh: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("cms.value_en")}</Label>
                <Input value={form.metricValueEn} onChange={(e) => setForm({ ...form, metricValueEn: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("cms.value_zh")}</Label>
                <Input value={form.metricValueZh} onChange={(e) => setForm({ ...form, metricValueZh: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("cms.risk_level")}</Label>
              <Select value={form.riskLevel} onValueChange={(v) => setForm({ ...form, riskLevel: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("cms.notes_en")}</Label>
              <Textarea value={form.notesEn} onChange={(e) => setForm({ ...form, notesEn: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>{t("cms.notes_zh")}</Label>
              <Textarea value={form.notesZh} onChange={(e) => setForm({ ...form, notesZh: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("cms.source")}</Label>
                <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gea_official">GEA Official</SelectItem>
                    <SelectItem value="ai_generated">AI Generated</SelectItem>
                    <SelectItem value="gov_crawled">Gov Crawled</SelectItem>
                    <SelectItem value="manual_input">Manual Input</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("cms.sort_order")}</Label>
                <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("cms.save")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Templates Tab ──────────────────────────────────────────────────────
function TemplatesTab() {
  const { t } = useI18n();
  const utils = trpc.useUtils();
  const [countryCode, setCountryCode] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form, setForm] = useState({
    countryCode: "", templateType: "employment_contract", titleEn: "", titleZh: "",
    descriptionEn: "", descriptionZh: "", fileUrl: "", fileFormat: "pdf",
    version: "1.0", source: "ai_generated",
  });

  const { data: countries } = trpc.toolkitEnhanced.getActiveCountries.useQuery();
  const { data: templates } = trpc.toolkitEnhanced.getDocumentTemplates.useQuery(
    { countryCode: countryCode || undefined },
    { enabled: true }
  );

  const createMutation = trpc.toolkitEnhanced.createTemplate.useMutation({
    onSuccess: () => { utils.toolkitEnhanced.getDocumentTemplates.invalidate(); setSheetOpen(false); toast.success(t("cms.saved")); },
    onError: (err) => toast.error(err.message),
  });
  const updateMutation = trpc.toolkitEnhanced.updateTemplate.useMutation({
    onSuccess: () => { utils.toolkitEnhanced.getDocumentTemplates.invalidate(); setSheetOpen(false); toast.success(t("cms.saved")); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.toolkitEnhanced.deleteTemplate.useMutation({
    onSuccess: () => { utils.toolkitEnhanced.getDocumentTemplates.invalidate(); toast.success(t("cms.deleted")); },
    onError: (err) => toast.error(err.message),
  });

  const openCreate = () => {
    setEditingItem(null);
    setForm({ countryCode: countryCode || "", templateType: "employment_contract", titleEn: "", titleZh: "", descriptionEn: "", descriptionZh: "", fileUrl: "", fileFormat: "pdf", version: "1.0", source: "ai_generated" });
    setSheetOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setForm({
      countryCode: item.countryCode || "", templateType: item.templateType, titleEn: item.titleEn || "", titleZh: item.titleZh || "",
      descriptionEn: item.descriptionEn || "", descriptionZh: item.descriptionZh || "", fileUrl: item.fileUrl || "",
      fileFormat: item.fileFormat || "pdf", version: item.version || "1.0", source: item.source || "ai_generated",
    });
    setSheetOpen(true);
  };

  const handleSave = () => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  const filteredTemplates = countryCode
    ? templates?.filter((t: any) => t.countryCode === countryCode)
    : templates;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={countryCode} onValueChange={setCountryCode}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("cms.all_countries")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t("cms.all_countries")}</SelectItem>
            {countries?.map((c: any) => (
              <SelectItem key={c.countryCode} value={c.countryCode}>{c.countryName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> {t("cms.add")}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("cms.title_en")}</TableHead>
            <TableHead>{t("cms.country")}</TableHead>
            <TableHead>{t("cms.template_type")}</TableHead>
            <TableHead>{t("cms.format")}</TableHead>
            <TableHead>{t("cms.source")}</TableHead>
            <TableHead className="w-[100px]">{t("cms.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTemplates?.map((tpl: any) => (
            <TableRow key={tpl.id}>
              <TableCell className="font-medium">{tpl.titleEn}</TableCell>
              <TableCell>{tpl.countryCode || "GLOBAL"}</TableCell>
              <TableCell><Badge variant="outline">{tpl.templateType}</Badge></TableCell>
              <TableCell><Badge variant="secondary" className="uppercase text-xs">{tpl.fileFormat}</Badge></TableCell>
              <TableCell><Badge variant="outline" className="text-xs">{tpl.source}</Badge></TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(tpl)}><Pencil className="h-4 w-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("cms.confirm_delete")}</AlertDialogTitle>
                        <AlertDialogDescription>{t("cms.confirm_delete_desc")}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("cms.cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate({ id: tpl.id })}>{t("cms.delete")}</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {!filteredTemplates?.length && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">{t("cms.no_data")}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingItem ? t("cms.edit") : t("cms.add")} {t("cms.template")}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("cms.country")}</Label>
                <Select value={form.countryCode} onValueChange={(v) => setForm({ ...form, countryCode: v })}>
                  <SelectTrigger><SelectValue placeholder="Global" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Global</SelectItem>
                    {countries?.map((c: any) => (
                      <SelectItem key={c.countryCode} value={c.countryCode}>{c.countryName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("cms.template_type")}</Label>
                <Select value={form.templateType} onValueChange={(v) => setForm({ ...form, templateType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employment_contract">Employment Contract</SelectItem>
                    <SelectItem value="offer_letter">Offer Letter</SelectItem>
                    <SelectItem value="nda">NDA</SelectItem>
                    <SelectItem value="ip_assignment">IP Assignment</SelectItem>
                    <SelectItem value="employee_handbook">Employee Handbook</SelectItem>
                    <SelectItem value="termination_letter">Termination Letter</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("cms.title_en")}</Label>
                <Input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("cms.title_zh")}</Label>
                <Input value={form.titleZh} onChange={(e) => setForm({ ...form, titleZh: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("cms.description_en")}</Label>
              <Textarea value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>{t("cms.description_zh")}</Label>
              <Textarea value={form.descriptionZh} onChange={(e) => setForm({ ...form, descriptionZh: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>{t("cms.file_url")}</Label>
              <Input value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t("cms.format")}</Label>
                <Select value={form.fileFormat} onValueChange={(v) => setForm({ ...form, fileFormat: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="docx">DOCX</SelectItem>
                    <SelectItem value="xlsx">XLSX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("cms.version")}</Label>
                <Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("cms.source")}</Label>
                <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gea_official">GEA Official</SelectItem>
                    <SelectItem value="ai_generated">AI Generated</SelectItem>
                    <SelectItem value="manual_input">Manual Input</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("cms.save")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Main CMS Page ──────────────────────────────────────────────────────
export default function ToolkitCms() {
  const { t } = useI18n();

  return (
    <Layout title={t("cms.title")}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DatabaseZap className="h-6 w-6 text-primary" />
            {t("cms.title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("cms.subtitle")}</p>
        </div>

        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-md">
          <CardContent className="pt-6">
            <Tabs defaultValue="benefits">
              <TabsList className="grid w-full max-w-lg grid-cols-3">
                <TabsTrigger value="benefits" className="flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  {t("cms.benefits_tab")}
                </TabsTrigger>
                <TabsTrigger value="compliance" className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  {t("cms.compliance_tab")}
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  {t("cms.templates_tab")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="benefits" className="mt-6">
                <BenefitsTab />
              </TabsContent>
              <TabsContent value="compliance" className="mt-6">
                <ComplianceTab />
              </TabsContent>
              <TabsContent value="templates" className="mt-6">
                <TemplatesTab />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
