import { useI18n } from "@/contexts/i18n";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/DatePicker";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Trash2, Calculator, Info } from "lucide-react";
import CountrySelect from "@/components/CountrySelect";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";

import { Checkbox } from "@/components/ui/checkbox";

interface QuotationItem {
  countryCode: string;
  regionCode?: string;
  serviceType: "eor" | "visa_eor" | "aor";
  headcount: number;
  salary: number;
  currency: string;
  serviceFee: number;
  // Computed fields
  employerCost?: number;
  totalMonthly?: number;
}

export default function QuotationCreateDialog({ open, onOpenChange, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; onSuccess: () => void }) {
  const { t } = useI18n();
  const [leadId, setLeadId] = useState<number | undefined>();
  const [customerId, setCustomerId] = useState<number | undefined>();
  const [validUntil, setValidUntil] = useState<string>("");
  const [items, setItems] = useState<QuotationItem[]>([
    { countryCode: "", serviceType: "eor", headcount: 1, salary: 0, currency: "USD", serviceFee: 0 }
  ]);
  const [showCostPreview, setShowCostPreview] = useState(false);
  const [includeCountryGuide, setIncludeCountryGuide] = useState(false);

  const { data: leads } = trpc.sales.list.useQuery({ limit: 100 });
  const { data: customers } = trpc.customers.list.useQuery({ limit: 100 });
  const calculateMutation = trpc.calculation.calculateContributions.useMutation();
  const { data: guideChapters } = trpc.countryGuides.listChapters.useQuery(
    { countryCode: items[0].countryCode || "CN" },
    { enabled: !!items[0].countryCode && items.length === 1 }
  );

  const createMutation = trpc.quotations.create.useMutation({
    onSuccess: () => {
      toast.success(t("common.create") + " ✓");
      onOpenChange(false);
      onSuccess();
    },
    onError: (err) => toast.error(err.message)
  });

  const handleAddItem = () => {
    setItems([...items, { countryCode: "", serviceType: "eor", headcount: 1, salary: 0, currency: "USD", serviceFee: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof QuotationItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    // Reset computed fields when inputs change
    if (["countryCode", "salary", "headcount", "serviceFee"].includes(field)) {
        newItems[index].employerCost = undefined;
        newItems[index].totalMonthly = undefined;
    }
    setItems(newItems);
  };

  const handleCalculateCosts = async () => {
    const updatedItems = [...items];
    let hasError = false;

    for (let i = 0; i < updatedItems.length; i++) {
        const item = updatedItems[i];
        if (item.countryCode && item.salary > 0) {
            try {
                const result = await calculateMutation.mutateAsync({
                    countryCode: item.countryCode,
                    salary: item.salary,
                    year: 2025,
                    regionCode: item.regionCode
                });
                
                const employerCost = parseFloat(result.totalEmployer);
                updatedItems[i].employerCost = employerCost;
                updatedItems[i].totalMonthly = (item.salary + employerCost + item.serviceFee) * item.headcount;
            } catch (err) {
                console.error(`Failed to calculate for item ${i}`, err);
                hasError = true;
            }
        }
    }

    setItems(updatedItems);
    setShowCostPreview(true);
    if (!hasError) toast.success(t("quotations.create.calc_success"));
    else toast.warning(t("quotations.create.calc_warning"));
  };

  const handleSubmit = () => {
    if (!leadId && !customerId) {
        toast.error(t("quotations.create.select_customer_error"));
        return;
    }
    // Basic validation
    if (items.some(i => !i.countryCode || i.salary <= 0)) {
        toast.error(t("quotations.create.fill_details_error"));
        return;
    }

    createMutation.mutate({
      leadId,
      customerId,
      validUntil: validUntil || undefined,
      includeCountryGuide,
      items: items.map(i => ({
        ...i,
        currency: "USD" // Forcing USD for now as per schema default
      }))
    });
  };

  const totalQuotationValue = items.reduce((sum, item) => sum + (item.totalMonthly || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("quotations.create.title")}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-6 mt-4">
          <div className="col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label>{t("quotations.create.customerLabel")}</Label>
                <Select 
                    value={leadId ? `lead-${leadId}` : customerId ? `cust-${customerId}` : ""} 
                    onValueChange={(val) => {
                        if (val.startsWith("lead-")) {
                            setLeadId(parseInt(val.split("-")[1]));
                            setCustomerId(undefined);
                        } else {
                            setCustomerId(parseInt(val.split("-")[1]));
                            setLeadId(undefined);
                        }
                    }}
                >
                    <SelectTrigger><SelectValue placeholder={t("quotations.create.select_placeholder")} /></SelectTrigger>
                    <SelectContent>
                        {leads?.data.map((l: any) => (
                            <SelectItem key={`lead-${l.id}`} value={`lead-${l.id}`}>{t("quotations.create.lead_prefix")} {l.companyName}</SelectItem>
                        ))}
                        {customers?.data.map((c: any) => (
                            <SelectItem key={`cust-${c.id}`} value={`cust-${c.id}`}>{t("quotations.create.customer_prefix")} {c.companyName}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                </div>
                <div className="space-y-2">
                <Label>{t("quotations.create.validUntil")}</Label>
                <DatePicker value={validUntil} onChange={setValidUntil} />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-medium">{t("quotations.items.title")}</h3>
                    <Button variant="outline" size="sm" onClick={handleAddItem}><Plus className="w-4 h-4 mr-2" />{t("quotations.items.add")}</Button>
                </div>
                
                {items.map((item, index) => (
                    <div key={index} className="border p-4 rounded-md bg-muted/20 space-y-3">
                        <div className="grid grid-cols-12 gap-3 items-end">
                            <div className="col-span-3 space-y-1">
                                <Label className="text-xs">{t("quotations.items.country")}</Label>
                                <CountrySelect value={item.countryCode} onValueChange={(v) => updateItem(index, "countryCode", v)} />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <Label className="text-xs">{t("quotations.items.serviceType")}</Label>
                                <Select value={item.serviceType} onValueChange={(v) => updateItem(index, "serviceType", v)}>
                                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="eor">{t("quotations.create.service_eor")}</SelectItem>
                                        <SelectItem value="visa_eor">{t("quotations.create.service_visa_eor")}</SelectItem>
                                        <SelectItem value="aor">{t("quotations.create.service_aor")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-2 space-y-1">
                                <Label className="text-xs">{t("quotations.items.salary")}</Label>
                                <Input type="number" className="h-9" value={item.salary} onChange={(e) => updateItem(index, "salary", parseFloat(e.target.value))} />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <Label className="text-xs">{t("quotations.items.fee")}</Label>
                                <Input type="number" className="h-9" value={item.serviceFee} onChange={(e) => updateItem(index, "serviceFee", parseFloat(e.target.value))} />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <Label className="text-xs">{t("quotations.items.headcount")}</Label>
                                <Input type="number" className="h-9" min={1} value={item.headcount} onChange={(e) => updateItem(index, "headcount", parseInt(e.target.value))} />
                            </div>
                            <div className="col-span-1">
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => handleRemoveItem(index)} disabled={items.length === 1}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        
                        {item.countryCode === "CN" && (
                             <div className="grid grid-cols-4 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">{t("quotations.create.city_region")}</Label>
                                    <Select value={item.regionCode} onValueChange={(v) => updateItem(index, "regionCode", v)}>
                                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={t("quotations.create.select_city")} /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CN-BJ">Beijing</SelectItem>
                                            <SelectItem value="CN-SH">Shanghai</SelectItem>
                                            <SelectItem value="CN-SZ">Shenzhen</SelectItem>
                                            <SelectItem value="CN-GZ">Guangzhou</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                             </div>
                        )}

                        {item.employerCost !== undefined && (
                            <div className="bg-white/50 p-2 rounded text-xs flex justify-between items-center text-muted-foreground">
                                <span>{t("quotations.create.employer_cost")}: {formatCurrency(item.currency, item.employerCost)}</span>
                                <span className="font-medium text-foreground">{t("quotations.create.total_monthly")}: {formatCurrency(item.currency, item.totalMonthly || 0)}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
                <Button variant="secondary" size="sm" onClick={handleCalculateCosts} disabled={calculateMutation.isPending}>
                    {calculateMutation.isPending ? <Calculator className="w-4 h-4 mr-2 animate-spin" /> : <Calculator className="w-4 h-4 mr-2" />}
                    {t("quotations.create.preview_costs")}
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
                    <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                        {createMutation.isPending ? t("common.loading") : t("common.create")}
                    </Button>
                </div>
            </div>
          </div>

          {/* Right Panel: Summary & Guide */}
          <div className="space-y-6">
             <Card className="bg-primary/5 border-primary/10">
                <CardContent className="p-4 space-y-4">
                    <h3 className="font-medium text-sm flex items-center gap-2">
                        <Info className="w-4 h-4 text-primary" />
                        {t("quotations.create.summary_title")}
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t("quotations.create.total_headcount")}</span>
                            <span>{items.reduce((sum, i) => sum + i.headcount, 0)}</span>
                        </div>
                        {showCostPreview && (
                            <div className="flex justify-between font-bold pt-2 border-t border-primary/10">
                                <span>{t("quotations.create.est_monthly_total")}</span>
                                <span>{formatCurrency("USD", totalQuotationValue)}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2 pt-4 border-t border-primary/10">
                        <Checkbox 
                            id="include-guide" 
                            checked={includeCountryGuide} 
                            onCheckedChange={(checked) => setIncludeCountryGuide(!!checked)} 
                        />
                        <label 
                            htmlFor="include-guide" 
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                            {t("quotations.create.include_guide")}
                        </label>
                    </div>
                </CardContent>
             </Card>

             {items.length === 1 && items[0].countryCode && guideChapters && guideChapters.length > 0 && (
                 <div className="space-y-3">
                    <h3 className="font-medium text-sm text-muted-foreground">{t("quotations.create.guide_preview")}: {items[0].countryCode}</h3>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                        {guideChapters.slice(0, 3).map(chapter => (
                            <Card key={chapter.id} className="text-xs">
                                <CardContent className="p-3">
                                    <div className="font-medium mb-1">{chapter.titleEn}</div>
                                    <div className="text-muted-foreground line-clamp-3">{chapter.contentEn}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                 </div>
             )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
