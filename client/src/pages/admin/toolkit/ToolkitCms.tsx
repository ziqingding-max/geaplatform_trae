/**
 * Toolkit CMS — Admin-only content management for Benefits, Compliance, and Templates.
 * Follows the existing KnowledgeBaseAdmin pattern: Tabs + Sheet for CRUD.
 *
 * Field name alignment:
 * - Benefits: benefitType + category (both required by backend)
 * - Compliance: flat record per country (probationRulesEn, noticePeriodRulesEn, etc.)
 * - Templates: documentType (not templateType), fileName (required)
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
    countryCode: "",
    benefitType: "statutory" as "statutory" | "customary",
    category: "social_security" as string,
    nameEn: "", nameZh: "",
    descriptionEn: "", descriptionZh: "",
    costIndication: "",
    pitchCardEn: "", pitchCardZh: "",
    source: "ai_generated",
    sortOrder: 0,
  });

  const { data: countries } = trpc.toolkitEnhanced.getActiveCountries.useQuery();
  const { data: benefits } = trpc.toolkitEnhanced.getBenefitsByCountry.useQuery(
    { countryCode },
    { enabled: !!countryCode }
  );

  const createMutation = trpc.toolkitEnhanced.createBenefit.useMutation({
    onSuccess: () => { utils.toolkitEnhanced.getBenefitsByCountry.invalidate(); setSheetOpen(false); toast.success(t("toolkit_cms.save_success")); },
    onError: (err) => toast.error(err.message),
  });
  const updateMutation = trpc.toolkitEnhanced.updateBenefit.useMutation({
    onSuccess: () => { utils.toolkitEnhanced.getBenefitsByCountry.invalidate(); setSheetOpen(false); toast.success(t("toolkit_cms.save_success")); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.toolkitEnhanced.deleteBenefit.useMutation({
    onSuccess: () => { utils.toolkitEnhanced.getBenefitsByCountry.invalidate(); toast.success(t("toolkit_cms.delete_success")); },
    onError: (err) => toast.error(err.message),
  });

  const openCreate = () => {
    setEditingItem(null);
    setForm({
      countryCode: countryCode || "", benefitType: "statutory", category: "social_security",
      nameEn: "", nameZh: "", descriptionEn: "", descriptionZh: "",
      costIndication: "", pitchCardEn: "", pitchCardZh: "",
      source: "ai_generated", sortOrder: 0,
    });
    setSheetOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setForm({
      countryCode: item.countryCode,
      benefitType: item.benefitType || "statutory",
      category: item.category || "social_security",
      nameEn: item.nameEn || "", nameZh: item.nameZh || "",
      descriptionEn: item.descriptionEn || "", descriptionZh: item.descriptionZh || "",
      costIndication: item.costIndication || "",
      pitchCardEn: item.pitchCardEn || "", pitchCardZh: item.pitchCardZh || "",
      source: item.source || "ai_generated", sortOrder: item.sortOrder || 0,
    });
    setSheetOpen(true);
  };

  const handleSave = () => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...form } as any);
    } else {
      createMutation.mutate(form as any);
    }
  };

  const BENEFIT_CATEGORIES = [
    "social_security", "health_insurance", "pension", "paid_leave",
    "parental", "housing", "meal_transport", "bonus", "insurance",
    "equity", "wellness", "education", "other",
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={countryCode} onValueChange={setCountryCode}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("toolkit_cms.country_filter")} />
          </SelectTrigger>
          <SelectContent>
            {countries?.map((c: any) => (
              <SelectItem key={c.countryCode} value={c.countryCode}>{c.countryName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={openCreate} disabled={!countryCode}>
          <Plus className="mr-2 h-4 w-4" /> {t("toolkit_cms.add_benefit")}
        </Button>
      </div>

      {countryCode && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name (EN)</TableHead>
              <TableHead>Name (ZH)</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>{t("toolkit_cms.source")}</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {benefits?.map((b: any) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.nameEn}</TableCell>
                <TableCell>{b.nameZh}</TableCell>
                <TableCell><Badge variant={b.benefitType === "statutory" ? "default" : "secondary"}>{b.benefitType}</Badge></TableCell>
                <TableCell><Badge variant="outline">{b.category}</Badge></TableCell>
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
                          <AlertDialogTitle>{t("toolkit_cms.delete_confirm")}</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate({ id: b.id })}>{t("toolkit_cms.delete")}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!benefits?.length && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No data</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingItem ? t("toolkit_cms.edit") : t("toolkit_cms.add_benefit")}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country</Label>
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
                <Label>Benefit Type</Label>
                <Select value={form.benefitType} onValueChange={(v: any) => setForm({ ...form, benefitType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="statutory">Statutory</SelectItem>
                    <SelectItem value="customary">Customary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BENEFIT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name (EN)</Label>
                <Input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Name (ZH)</Label>
                <Input value={form.nameZh} onChange={(e) => setForm({ ...form, nameZh: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description (EN)</Label>
              <Textarea value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Description (ZH)</Label>
              <Textarea value={form.descriptionZh} onChange={(e) => setForm({ ...form, descriptionZh: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Cost Indication</Label>
              <Input value={form.costIndication} onChange={(e) => setForm({ ...form, costIndication: e.target.value })} placeholder="e.g. 8.33% of base salary" />
            </div>
            <div className="space-y-2">
              <Label>Pitch Card (EN)</Label>
              <Textarea value={form.pitchCardEn} onChange={(e) => setForm({ ...form, pitchCardEn: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Pitch Card (ZH)</Label>
              <Textarea value={form.pitchCardZh} onChange={(e) => setForm({ ...form, pitchCardZh: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("toolkit_cms.source")}</Label>
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
                <Label>Sort Order</Label>
                <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Compliance Tab ─────────────────────────────────────────────────────
// Backend stores compliance as a single flat record per country.
// CMS edits the entire record at once.
function ComplianceTab() {
  const { t } = useI18n();
  const utils = trpc.useUtils();
  const [countryCode, setCountryCode] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  const defaultForm = {
    countryCode: "",
    probationRulesEn: "", probationRulesZh: "",
    noticePeriodRulesEn: "", noticePeriodRulesZh: "",
    backgroundCheckRulesEn: "", backgroundCheckRulesZh: "",
    severanceRulesEn: "", severanceRulesZh: "",
    nonCompeteRulesEn: "", nonCompeteRulesZh: "",
    workPermitRulesEn: "", workPermitRulesZh: "",
    additionalNotesEn: "", additionalNotesZh: "",
    source: "ai_generated",
  };
  const [form, setForm] = useState(defaultForm);

  const { data: countries } = trpc.toolkitEnhanced.getActiveCountries.useQuery();
  const { data: complianceData } = trpc.toolkitEnhanced.getComplianceByCountry.useQuery(
    { countryCode },
    { enabled: !!countryCode }
  );

  const createMutation = trpc.toolkitEnhanced.createCompliance.useMutation({
    onSuccess: () => { utils.toolkitEnhanced.getComplianceByCountry.invalidate(); setSheetOpen(false); toast.success(t("toolkit_cms.save_success")); },
    onError: (err) => toast.error(err.message),
  });
  const updateMutation = trpc.toolkitEnhanced.updateCompliance.useMutation({
    onSuccess: () => { utils.toolkitEnhanced.getComplianceByCountry.invalidate(); setSheetOpen(false); toast.success(t("toolkit_cms.save_success")); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.toolkitEnhanced.deleteCompliance.useMutation({
    onSuccess: () => { utils.toolkitEnhanced.getComplianceByCountry.invalidate(); toast.success(t("toolkit_cms.delete_success")); },
    onError: (err) => toast.error(err.message),
  });

  const openEdit = () => {
    if (complianceData) {
      setForm({
        countryCode: (complianceData as any).countryCode || countryCode,
        probationRulesEn: (complianceData as any).probationRulesEn || "",
        probationRulesZh: (complianceData as any).probationRulesZh || "",
        noticePeriodRulesEn: (complianceData as any).noticePeriodRulesEn || "",
        noticePeriodRulesZh: (complianceData as any).noticePeriodRulesZh || "",
        backgroundCheckRulesEn: (complianceData as any).backgroundCheckRulesEn || "",
        backgroundCheckRulesZh: (complianceData as any).backgroundCheckRulesZh || "",
        severanceRulesEn: (complianceData as any).severanceRulesEn || "",
        severanceRulesZh: (complianceData as any).severanceRulesZh || "",
        nonCompeteRulesEn: (complianceData as any).nonCompeteRulesEn || "",
        nonCompeteRulesZh: (complianceData as any).nonCompeteRulesZh || "",
        workPermitRulesEn: (complianceData as any).workPermitRulesEn || "",
        workPermitRulesZh: (complianceData as any).workPermitRulesZh || "",
        additionalNotesEn: (complianceData as any).additionalNotesEn || "",
        additionalNotesZh: (complianceData as any).additionalNotesZh || "",
        source: (complianceData as any).source || "ai_generated",
      });
    } else {
      setForm({ ...defaultForm, countryCode });
    }
    setSheetOpen(true);
  };

  const handleSave = () => {
    if (complianceData && (complianceData as any).id) {
      updateMutation.mutate({ id: (complianceData as any).id, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  const COMPLIANCE_FIELDS = [
    { label: "Probation Rules", enKey: "probationRulesEn", zhKey: "probationRulesZh" },
    { label: "Notice Period Rules", enKey: "noticePeriodRulesEn", zhKey: "noticePeriodRulesZh" },
    { label: "Background Check Rules", enKey: "backgroundCheckRulesEn", zhKey: "backgroundCheckRulesZh" },
    { label: "Severance Rules", enKey: "severanceRulesEn", zhKey: "severanceRulesZh" },
    { label: "Non-Compete Rules", enKey: "nonCompeteRulesEn", zhKey: "nonCompeteRulesZh" },
    { label: "Work Permit Rules", enKey: "workPermitRulesEn", zhKey: "workPermitRulesZh" },
    { label: "Additional Notes", enKey: "additionalNotesEn", zhKey: "additionalNotesZh" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={countryCode} onValueChange={setCountryCode}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("toolkit_cms.country_filter")} />
          </SelectTrigger>
          <SelectContent>
            {countries?.map((c: any) => (
              <SelectItem key={c.countryCode} value={c.countryCode}>{c.countryName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          {complianceData && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm"><Trash2 className="mr-2 h-4 w-4 text-destructive" /> Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("toolkit_cms.delete_confirm")}</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteMutation.mutate({ id: (complianceData as any).id })}>
                    {t("toolkit_cms.delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button onClick={openEdit} disabled={!countryCode}>
            <Pencil className="mr-2 h-4 w-4" /> {complianceData ? t("toolkit_cms.edit") : t("toolkit_cms.add_compliance")}
          </Button>
        </div>
      </div>

      {/* Display current compliance data as a summary */}
      {countryCode && complianceData && (
        <div className="space-y-3">
          {COMPLIANCE_FIELDS.map((field) => {
            const enVal = (complianceData as any)[field.enKey];
            const zhVal = (complianceData as any)[field.zhKey];
            if (!enVal && !zhVal) return null;
            return (
              <Card key={field.enKey} className="border shadow-sm">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-medium">{field.label}</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  {enVal && <p className="text-sm text-muted-foreground mb-1"><Badge variant="outline" className="mr-2 text-xs">EN</Badge>{enVal}</p>}
                  {zhVal && <p className="text-sm text-muted-foreground"><Badge variant="outline" className="mr-2 text-xs">ZH</Badge>{zhVal}</p>}
                </CardContent>
              </Card>
            );
          })}
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span>{t("toolkit_cms.source")}: <Badge variant="outline" className="text-xs">{(complianceData as any).source}</Badge></span>
            {(complianceData as any).lastVerifiedAt && (
              <span>{t("toolkit_cms.last_verified")}: {new Date((complianceData as any).lastVerifiedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      )}

      {countryCode && !complianceData && (
        <div className="text-center text-muted-foreground py-8">
          No compliance data for this country. Click the button above to add.
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{complianceData ? "Edit Compliance Data" : "Add Compliance Data"}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4">
            {COMPLIANCE_FIELDS.map((field) => (
              <div key={field.enKey} className="space-y-2 border-b pb-4">
                <Label className="font-medium">{field.label}</Label>
                <div className="grid grid-cols-1 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">English</Label>
                    <Textarea
                      value={(form as any)[field.enKey]}
                      onChange={(e) => setForm({ ...form, [field.enKey]: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Chinese</Label>
                    <Textarea
                      value={(form as any)[field.zhKey]}
                      onChange={(e) => setForm({ ...form, [field.zhKey]: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="space-y-2">
              <Label>{t("toolkit_cms.source")}</Label>
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
          </div>
          <SheetFooter>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
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
    countryCode: "",
    documentType: "employment_contract" as string,
    titleEn: "", titleZh: "",
    descriptionEn: "", descriptionZh: "",
    fileUrl: "", fileName: "",
    version: "1.0",
    source: "ai_generated",
  });

  const { data: countries } = trpc.toolkitEnhanced.getActiveCountries.useQuery();
  const { data: templates } = trpc.toolkitEnhanced.getDocumentTemplates.useQuery(
    { countryCode: countryCode || undefined },
    { enabled: true }
  );

  const createMutation = trpc.toolkitEnhanced.createTemplate.useMutation({
    onSuccess: () => { utils.toolkitEnhanced.getDocumentTemplates.invalidate(); setSheetOpen(false); toast.success(t("toolkit_cms.save_success")); },
    onError: (err) => toast.error(err.message),
  });
  const updateMutation = trpc.toolkitEnhanced.updateTemplate.useMutation({
    onSuccess: () => { utils.toolkitEnhanced.getDocumentTemplates.invalidate(); setSheetOpen(false); toast.success(t("toolkit_cms.save_success")); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.toolkitEnhanced.deleteTemplate.useMutation({
    onSuccess: () => { utils.toolkitEnhanced.getDocumentTemplates.invalidate(); toast.success(t("toolkit_cms.delete_success")); },
    onError: (err) => toast.error(err.message),
  });

  const openCreate = () => {
    setEditingItem(null);
    setForm({
      countryCode: countryCode || "", documentType: "employment_contract",
      titleEn: "", titleZh: "", descriptionEn: "", descriptionZh: "",
      fileUrl: "", fileName: "", version: "1.0", source: "ai_generated",
    });
    setSheetOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setForm({
      countryCode: item.countryCode || "",
      documentType: item.documentType || "employment_contract",
      titleEn: item.titleEn || "", titleZh: item.titleZh || "",
      descriptionEn: item.descriptionEn || "", descriptionZh: item.descriptionZh || "",
      fileUrl: item.fileUrl || "", fileName: item.fileName || "",
      version: item.version || "1.0", source: item.source || "ai_generated",
    });
    setSheetOpen(true);
  };

  const handleSave = () => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...form } as any);
    } else {
      createMutation.mutate(form as any);
    }
  };

  const filteredTemplates = countryCode
    ? templates?.filter((t: any) => t.countryCode === countryCode)
    : templates;

  const DOC_TYPES = [
    { value: "employment_contract", label: "Employment Contract" },
    { value: "offer_letter", label: "Offer Letter" },
    { value: "nda", label: "NDA" },
    { value: "termination_letter", label: "Termination Letter" },
    { value: "employee_handbook", label: "Employee Handbook" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={countryCode} onValueChange={setCountryCode}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("toolkit_cms.all_countries")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t("toolkit_cms.all_countries")}</SelectItem>
            {countries?.map((c: any) => (
              <SelectItem key={c.countryCode} value={c.countryCode}>{c.countryName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> {t("toolkit_cms.add_template")}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title (EN)</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>File</TableHead>
            <TableHead>{t("toolkit_cms.source")}</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTemplates?.map((tpl: any) => (
            <TableRow key={tpl.id}>
              <TableCell className="font-medium">{tpl.titleEn}</TableCell>
              <TableCell>{tpl.countryCode}</TableCell>
              <TableCell><Badge variant="outline">{tpl.documentType}</Badge></TableCell>
              <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">{tpl.fileName}</TableCell>
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
                        <AlertDialogTitle>{t("toolkit_cms.delete_confirm")}</AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate({ id: tpl.id })}>{t("toolkit_cms.delete")}</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {!filteredTemplates?.length && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No templates</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingItem ? t("toolkit_cms.edit") : t("toolkit_cms.add_template")}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country</Label>
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
                <Label>Document Type</Label>
                <Select value={form.documentType} onValueChange={(v) => setForm({ ...form, documentType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DOC_TYPES.map((dt) => (
                      <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title (EN)</Label>
                <Input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Title (ZH)</Label>
                <Input value={form.titleZh} onChange={(e) => setForm({ ...form, titleZh: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description (EN)</Label>
              <Textarea value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Description (ZH)</Label>
              <Textarea value={form.descriptionZh} onChange={(e) => setForm({ ...form, descriptionZh: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>File URL</Label>
              <Input value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>File Name</Label>
              <Input value={form.fileName} onChange={(e) => setForm({ ...form, fileName: e.target.value })} placeholder="e.g. SG_Employment_Contract_v1.pdf" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Version</Label>
                <Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("toolkit_cms.source")}</Label>
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
            </div>
          </div>
          <SheetFooter>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
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
    <Layout title={t("toolkit_cms.title")}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DatabaseZap className="h-6 w-6 text-primary" />
            {t("toolkit_cms.title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("toolkit_cms.subtitle")}</p>
        </div>
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-md">
          <CardContent className="pt-6">
            <Tabs defaultValue="benefits">
              <TabsList className="grid w-full max-w-lg grid-cols-3">
                <TabsTrigger value="benefits" className="flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  {t("toolkit_cms.tab_benefits")}
                </TabsTrigger>
                <TabsTrigger value="compliance" className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  {t("toolkit_cms.tab_compliance")}
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  {t("toolkit_cms.tab_templates")}
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
