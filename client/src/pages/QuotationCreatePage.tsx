import { useI18n } from "@/lib/i18n";
import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/DatePicker";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Trash2, Calculator, Info, ArrowLeft, DollarSign, Globe, BookOpen } from "lucide-react";
import CountrySelect from "@/components/CountrySelect";
import { MultiSelect, type Option } from "@/components/ui/multi-select";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

// ── V2 Interfaces ──
interface ServiceFeeItem {
  countries: string[];
  serviceType: "eor" | "visa_eor" | "aor";
  serviceFee: number;
  oneTimeFee?: number;
  headcount: number;
}

interface CostEstimationItem {
  countryCode: string;
  regionCode?: string;
  salary: number;
  currency: string;
  headcount: number;
  exchangeRate?: number;
  // Computed
  employerCost?: number;
  totalEmploymentCostLocal?: number;
  totalEmploymentCostUsd?: number;
}

interface CountryGuideItem {
  countryCode: string;
}

// ── V1 Interface (backward compat for edit mode) ──
interface QuotationItemV1 {
  countryCode: string;
  regionCode?: string;
  serviceType: "eor" | "visa_eor" | "aor";
  headcount: number;
  salary: number;
  currency: string;
  exchangeRate?: number;
  serviceFee: number;
  oneTimeFee?: number;
  employerCost?: number;
  totalMonthly?: number;
  totalOneTime?: number;
}

export default function QuotationCreatePage({ params }: { params?: { id?: string } }) {
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const editId = params?.id ? parseInt(params.id) : undefined;
  const isEditMode = !!editId;

  // ── Basic Info State ──
  const [leadId, setLeadId] = useState<number | undefined>();
  const [customerId, setCustomerId] = useState<number | undefined>();
  const [validUntil, setValidUntil] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // ── V2 State ──
  const [serviceFees, setServiceFees] = useState<ServiceFeeItem[]>([
    { countries: [], serviceType: "eor", serviceFee: 0, headcount: 1 }
  ]);
  const [costEstimations, setCostEstimations] = useState<CostEstimationItem[]>([]);
  const [countryGuides, setCountryGuides] = useState<CountryGuideItem[]>([]);

  // ── V1 State (for editing old quotations) ──
  const [isV1Mode, setIsV1Mode] = useState(false);
  const [v1Items, setV1Items] = useState<QuotationItemV1[]>([
    { countryCode: "", serviceType: "eor", headcount: 1, salary: 0, currency: "USD", serviceFee: 0, exchangeRate: 1 }
  ]);
  const [includeCountryGuide, setIncludeCountryGuide] = useState(false);
  const [showCostPreview, setShowCostPreview] = useState(false);

  // ── Queries ──
  const { data: leads } = trpc.sales.list.useQuery({ limit: 100 });
  const { data: customers } = trpc.customers.list.useQuery({ limit: 100 });
  const { data: dbCountries } = trpc.countries.list.useQuery();
  const { data: existingQuotation, isLoading: isLoadingQuotation } = trpc.quotations.get.useQuery(
    { id: editId || 0 },
    { enabled: isEditMode }
  );

  // Build country options for MultiSelect
  const countryOptions: Option[] = useMemo(() => {
    if (!dbCountries) return [];
    return (dbCountries as any[])
      .filter((c: any) => c.isActive)
      .map((c: any) => ({ value: c.countryCode, label: `${c.countryCode} — ${c.countryName}` }))
      .sort((a: Option, b: Option) => a.label.localeCompare(b.label));
  }, [dbCountries]);

  // ── Load existing quotation data ──
  useEffect(() => {
    if (isEditMode && existingQuotation) {
      setLeadId(existingQuotation.leadId || undefined);
      setCustomerId(existingQuotation.customerId || undefined);
      setValidUntil(existingQuotation.validUntil ? new Date(existingQuotation.validUntil).toISOString().split("T")[0] : "");

      const snapshot = existingQuotation.snapshotData as any;
      if (snapshot?.version === 2) {
        // V2 data
        setIsV1Mode(false);
        if (snapshot.serviceFees?.length) setServiceFees(snapshot.serviceFees);
        if (snapshot.costEstimations?.length) setCostEstimations(snapshot.costEstimations);
        if (snapshot.countryGuides?.length) setCountryGuides(snapshot.countryGuides);
        if (snapshot.notes) setNotes(snapshot.notes);
      } else {
        // V1 data - load into V1 mode
        setIsV1Mode(true);
        const parsedItems = typeof existingQuotation.countries === 'string'
          ? JSON.parse(existingQuotation.countries)
          : existingQuotation.countries;

        if (Array.isArray(parsedItems)) {
          setV1Items(parsedItems.map((i: any) => ({
            countryCode: i.countryCode,
            regionCode: i.regionCode,
            serviceType: i.serviceType,
            headcount: i.headcount,
            salary: i.salary,
            currency: i.currency,
            exchangeRate: i.exchangeRate || 1,
            serviceFee: i.serviceFee,
            oneTimeFee: i.oneTimeFee,
            employerCost: i.employerCost,
            totalMonthly: i.totalMonthly,
            totalOneTime: i.totalOneTime
          })));
          setShowCostPreview(true);
        }
      }
    }
  }, [isEditMode, existingQuotation]);

  const calculateMutation = trpc.calculation.calculateContributions.useMutation();
  const utils = trpc.useUtils();

  const createMutation = trpc.quotations.create.useMutation({
    onSuccess: () => {
      toast.success(t("common.create") + " ✓");
      setLocation("/quotations");
    },
    onError: (err) => toast.error(err.message)
  });

  const updateMutation = trpc.quotations.update.useMutation({
    onSuccess: () => {
      toast.success(t("common.updated") || "Updated ✓");
      setLocation("/quotations");
    },
    onError: (err) => toast.error(err.message)
  });

  // ── V2 Handlers: Service Fees ──
  const addServiceFee = () => {
    setServiceFees([...serviceFees, { countries: [], serviceType: "eor", serviceFee: 0, headcount: 1 }]);
  };

  const removeServiceFee = (index: number) => {
    setServiceFees(serviceFees.filter((_, i) => i !== index));
  };

  const updateServiceFee = (index: number, updates: Partial<ServiceFeeItem>) => {
    const newFees = [...serviceFees];
    newFees[index] = { ...newFees[index], ...updates };
    setServiceFees(newFees);
  };

  // When countries change in a service fee, auto-load default rate from first country
  const handleServiceFeeCountriesChange = async (index: number, countries: string[]) => {
    updateServiceFee(index, { countries });
    // If this is the first country being added, fetch the default rate
    if (countries.length > 0 && serviceFees[index].countries.length === 0) {
      try {
        const config = await utils.countries.get.fetch({ countryCode: countries[0] });
        if (config) {
          const st = serviceFees[index].serviceType;
          const rate = st === "aor"
            ? parseFloat((config as any).standardAorRate || "0")
            : st === "visa_eor"
              ? parseFloat(config.standardVisaEorRate || "0")
              : parseFloat(config.standardEorRate || "0");
          const oneTimeFee = st === "visa_eor" ? parseFloat(config.visaEorSetupFee || "0") : undefined;
          updateServiceFee(index, { countries, serviceFee: rate, oneTimeFee });
        }
      } catch (err) {
        console.error("Failed to fetch country config", err);
      }
    }
  };

  const handleServiceTypeChange = async (index: number, serviceType: "eor" | "visa_eor" | "aor") => {
    updateServiceFee(index, { serviceType });
    // Re-fetch rate if countries exist
    const countries = serviceFees[index].countries;
    if (countries.length > 0) {
      try {
        const config = await utils.countries.get.fetch({ countryCode: countries[0] });
        if (config) {
          const rate = serviceType === "aor"
            ? parseFloat((config as any).standardAorRate || "0")
            : serviceType === "visa_eor"
              ? parseFloat(config.standardVisaEorRate || "0")
              : parseFloat(config.standardEorRate || "0");
          const oneTimeFee = serviceType === "visa_eor" ? parseFloat(config.visaEorSetupFee || "0") : undefined;
          updateServiceFee(index, { serviceType, serviceFee: rate, oneTimeFee });
        }
      } catch (err) {
        console.error("Failed to fetch country config", err);
      }
    }
  };

  // ── V2 Handlers: Cost Estimations ──
  const addCostEstimation = () => {
    setCostEstimations([...costEstimations, { countryCode: "", salary: 0, currency: "USD", headcount: 1 }]);
  };

  const removeCostEstimation = (index: number) => {
    setCostEstimations(costEstimations.filter((_, i) => i !== index));
  };

  const updateCostEstimation = (index: number, updates: Partial<CostEstimationItem>) => {
    const newItems = [...costEstimations];
    newItems[index] = { ...newItems[index], ...updates };
    // Reset computed fields when inputs change
    if ('countryCode' in updates || 'salary' in updates || 'headcount' in updates) {
      newItems[index].employerCost = undefined;
      newItems[index].totalEmploymentCostLocal = undefined;
      newItems[index].totalEmploymentCostUsd = undefined;
    }
    setCostEstimations(newItems);
  };

  const handleCostCountryChange = async (index: number, countryCode: string) => {
    const defaultRegion = countryCode === "CN" ? "CN-SH" : undefined;
    updateCostEstimation(index, { countryCode, regionCode: defaultRegion, currency: "USD", exchangeRate: 1 });

    if (countryCode) {
      try {
        const config = await utils.countries.get.fetch({ countryCode });
        if (config) {
          const localCurrency = config.localCurrency || "USD";
          let exchangeRate = 1;
          if (localCurrency !== "USD") {
            const rateData = await utils.exchangeRates.get.fetch({ from: "USD", to: localCurrency });
            if (rateData && rateData.rate) {
              exchangeRate = Number(rateData.rate);
            }
          }
          setCostEstimations(current => {
            const updated = [...current];
            updated[index] = { ...updated[index], countryCode, regionCode: defaultRegion, currency: localCurrency, exchangeRate };
            return updated;
          });
        }
      } catch (err) {
        console.error("Failed to fetch country config", err);
      }
    }
  };

  const handleCalculateAllCosts = async () => {
    const updated = [...costEstimations];
    let hasError = false;

    for (let i = 0; i < updated.length; i++) {
      const item = updated[i];
      if (item.countryCode && item.salary > 0) {
        try {
          const result = await calculateMutation.mutateAsync({
            countryCode: item.countryCode,
            salary: item.salary,
            year: new Date().getFullYear(),
            regionCode: item.regionCode
          });
          const employerCost = parseFloat(result.totalEmployer);
          updated[i].employerCost = employerCost;
          const localTotal = item.salary + employerCost;
          updated[i].totalEmploymentCostLocal = localTotal;
          const rate = item.exchangeRate || 1;
          updated[i].totalEmploymentCostUsd = localTotal / rate;
        } catch (err) {
          console.error(`Failed to calculate for item ${i}`, err);
          hasError = true;
        }
      }
    }

    setCostEstimations(updated);
    if (!hasError) toast.success(t("quotations.create.calc_success"));
    else toast.warning(t("quotations.create.calc_warning"));
  };

  // ── V2 Handlers: Country Guides ──
  const addCountryGuide = () => {
    setCountryGuides([...countryGuides, { countryCode: "" }]);
  };

  const removeCountryGuide = (index: number) => {
    setCountryGuides(countryGuides.filter((_, i) => i !== index));
  };

  const updateCountryGuide = (index: number, countryCode: string) => {
    const newGuides = [...countryGuides];
    newGuides[index] = { countryCode };
    setCountryGuides(newGuides);
  };

  // ── V1 Handlers (backward compat) ──
  const handleAddV1Item = () => {
    setV1Items([...v1Items, { countryCode: "", serviceType: "eor", headcount: 1, salary: 0, currency: "USD", serviceFee: 0 }]);
  };

  const handleRemoveV1Item = (index: number) => {
    setV1Items(v1Items.filter((_, i) => i !== index));
  };

  const updateV1Item = (index: number, field: keyof QuotationItemV1, value: any) => {
    const newItems = [...v1Items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (["countryCode", "salary", "headcount", "serviceFee"].includes(field)) {
      newItems[index].employerCost = undefined;
      newItems[index].totalMonthly = undefined;
    }
    setV1Items(newItems);
  };

  const handleV1CountryChange = async (index: number, countryCode: string) => {
    const defaultRegion = countryCode === "CN" ? "CN-SH" : undefined;
    const newItems = [...v1Items];
    newItems[index] = { ...newItems[index], countryCode, regionCode: defaultRegion, employerCost: undefined, totalMonthly: undefined, exchangeRate: 1 };
    setV1Items(newItems);

    if (countryCode) {
      try {
        const config = await utils.countries.get.fetch({ countryCode });
        if (config) {
          const localCurrency = config.localCurrency || "USD";
          let exchangeRate = 1;
          if (localCurrency !== "USD") {
            const rateData = await utils.exchangeRates.get.fetch({ from: "USD", to: localCurrency });
            if (rateData && rateData.rate) exchangeRate = Number(rateData.rate);
          }
          setV1Items(current => {
            const updated = [...current];
            const st = updated[index].serviceType;
            updated[index] = {
              ...updated[index],
              currency: localCurrency,
              exchangeRate,
              serviceFee: st === "aor"
                ? parseFloat((config as any).standardAorRate || "0")
                : st === "visa_eor"
                  ? parseFloat(config.standardVisaEorRate || "0")
                  : parseFloat(config.standardEorRate || "0"),
              oneTimeFee: st === "visa_eor" ? parseFloat(config.visaEorSetupFee || "0") : undefined
            };
            return updated;
          });
        }
      } catch (err) {
        console.error("Failed to fetch country config", err);
      }
    }
  };

  const handleV1ServiceTypeChange = async (index: number, serviceType: "eor" | "visa_eor" | "aor") => {
    const newItems = [...v1Items];
    newItems[index] = { ...newItems[index], serviceType, employerCost: undefined, totalMonthly: undefined };
    setV1Items(newItems);
    const countryCode = v1Items[index].countryCode;
    if (countryCode) {
      try {
        const config = await utils.countries.get.fetch({ countryCode });
        if (config) {
          setV1Items(current => {
            const updated = [...current];
            updated[index] = {
              ...updated[index],
              serviceFee: serviceType === "aor"
                ? parseFloat((config as any).standardAorRate || "0")
                : serviceType === "visa_eor"
                  ? parseFloat(config.standardVisaEorRate || "0")
                  : parseFloat(config.standardEorRate || "0"),
              oneTimeFee: serviceType === "visa_eor" ? parseFloat(config.visaEorSetupFee || "0") : undefined
            };
            return updated;
          });
        }
      } catch (err) {
        console.error("Failed to fetch country config", err);
      }
    }
  };

  const handleV1CalculateCosts = async () => {
    const updatedItems = [...v1Items];
    let hasError = false;
    for (let i = 0; i < updatedItems.length; i++) {
      const item = updatedItems[i];
      if (item.countryCode && item.salary > 0) {
        if (item.serviceType === "aor") {
          updatedItems[i].employerCost = undefined;
          const rate = item.exchangeRate || 1;
          const usdContractorCost = item.salary / rate;
          updatedItems[i].totalMonthly = (usdContractorCost + item.serviceFee) * item.headcount;
        } else {
          try {
            const result = await calculateMutation.mutateAsync({
              countryCode: item.countryCode,
              salary: item.salary,
              year: new Date().getFullYear(),
              regionCode: item.regionCode
            });
            const employerCost = parseFloat(result.totalEmployer);
            updatedItems[i].employerCost = employerCost;
            const localTotal = item.salary + employerCost;
            const rate = item.exchangeRate || 1;
            const usdEmploymentCost = localTotal / rate;
            updatedItems[i].totalMonthly = (usdEmploymentCost + item.serviceFee) * item.headcount;
          } catch (err) {
            console.error(`Failed to calculate for item ${i}`, err);
            hasError = true;
          }
        }
      }
    }
    setV1Items(updatedItems);
    setShowCostPreview(true);
    if (!hasError) toast.success(t("quotations.create.calc_success"));
    else toast.warning(t("quotations.create.calc_warning"));
  };

  // ── Submit ──
  const handleSubmit = () => {
    if (!leadId && !customerId) {
      toast.error(t("quotations.create.select_customer_error"));
      return;
    }

    if (isV1Mode) {
      // V1 submit
      if (v1Items.some(i => !i.countryCode || i.salary <= 0)) {
        toast.error(t("quotations.create.fill_details_error"));
        return;
      }
      const payload = {
        leadId,
        customerId,
        validUntil: validUntil || undefined,
        includeCountryGuide,
        items: v1Items.map(i => ({ ...i, currency: i.currency || "USD" }))
      };
      if (isEditMode && editId) {
        updateMutation.mutate({ ...payload, id: editId });
      } else {
        createMutation.mutate(payload);
      }
    } else {
      // V2 submit
      if (serviceFees.length === 0 || serviceFees.some(sf => sf.countries.length === 0)) {
        toast.error("Please add at least one service fee with countries selected.");
        return;
      }
      const payload = {
        leadId,
        customerId,
        validUntil: validUntil || undefined,
        version: 2 as const,
        serviceFees: serviceFees.map(sf => ({
          countries: sf.countries,
          serviceType: sf.serviceType,
          serviceFee: sf.serviceFee,
          oneTimeFee: sf.oneTimeFee,
          headcount: sf.headcount,
        })),
        costEstimations: costEstimations.filter(ce => ce.countryCode).map(ce => ({
          countryCode: ce.countryCode,
          regionCode: ce.regionCode,
          salary: ce.salary,
          currency: ce.currency,
          headcount: ce.headcount,
        })),
        countryGuides: countryGuides.filter(cg => cg.countryCode),
        notes: notes || undefined,
      };
      if (isEditMode && editId) {
        updateMutation.mutate({ ...payload, id: editId });
      } else {
        createMutation.mutate(payload);
      }
    }
  };

  // ── Computed Summaries ──
  const totalServiceFeesMonthly = serviceFees.reduce((sum, sf) => sum + sf.serviceFee * sf.headcount, 0);
  const totalOneTimeFees = serviceFees.reduce((sum, sf) => sum + (sf.oneTimeFee || 0) * sf.headcount, 0);
  const totalEmploymentCostsUsd = costEstimations.reduce((sum, ce) => sum + (ce.totalEmploymentCostUsd || 0) * ce.headcount, 0);
  const grandTotalMonthly = totalServiceFeesMonthly + totalEmploymentCostsUsd;
  const totalHeadcountServiceFees = serviceFees.reduce((sum, sf) => sum + sf.headcount, 0);
  const totalHeadcountCostEstimations = costEstimations.reduce((sum, ce) => sum + ce.headcount, 0);

  const v1TotalQuotationValue = v1Items.reduce((sum, item) => sum + (item.totalMonthly || 0), 0);

  // ── Render ──
  if (isEditMode && isLoadingQuotation) {
    return (
      <Layout breadcrumb={["GEA", t("nav.sales"), t("nav.quotations"), "Loading..."]}>
        <div className="p-6 flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout breadcrumb={["GEA", t("nav.sales"), t("nav.quotations"), isEditMode ? "Edit Quotation" : t("quotations.create.title")]}>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/quotations")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditMode ? "Edit Quotation" : t("quotations.create.title")}
          </h1>
          {isV1Mode && (
            <Badge variant="outline" className="text-xs">V1 Legacy</Badge>
          )}
        </div>

        {/* ── V1 Mode (editing old quotations) ── */}
        {isV1Mode ? (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("quotations.create.basic_info")}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("quotations.create.customerLabel")}</Label>
                    <Select
                      value={leadId ? `lead-${leadId}` : customerId ? `cust-${customerId}` : ""}
                      onValueChange={(val) => {
                        if (val.startsWith("lead-")) { setLeadId(parseInt(val.split("-")[1])); setCustomerId(undefined); }
                        else { setCustomerId(parseInt(val.split("-")[1])); setLeadId(undefined); }
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder={t("quotations.create.select_placeholder")} /></SelectTrigger>
                      <SelectContent>
                        {leads?.data.filter((l: any) => l.status !== "closed_won" && l.status !== "closed_lost").map((l: any) => (
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
                </CardContent>
              </Card>

              {/* V1 Items */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-lg">{t("quotations.items.title")}</h3>
                  <Button variant="outline" size="sm" onClick={handleAddV1Item}>
                    <Plus className="w-4 h-4 mr-2" />{t("quotations.items.add")}
                  </Button>
                </div>
                {v1Items.map((item, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border/50">
                        <span className="text-xs font-medium text-muted-foreground">Item #{index + 1}</span>
                        <Button variant="ghost" size="sm" className="text-destructive h-7 px-2 text-xs" onClick={() => handleRemoveV1Item(index)} disabled={v1Items.length === 1}>
                          <Trash2 className="w-3.5 h-3.5 mr-1" />{t("common.delete")}
                        </Button>
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">{t("quotations.items.country")}</Label>
                            <CountrySelect value={item.countryCode} onValueChange={(v) => handleV1CountryChange(index, v)} />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">{t("quotations.items.serviceType")}</Label>
                            <Select value={item.serviceType} onValueChange={(v) => handleV1ServiceTypeChange(index, v as any)}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="eor">{t("quotations.create.service_eor")}</SelectItem>
                                <SelectItem value="visa_eor">{t("quotations.create.service_visa_eor")}</SelectItem>
                                <SelectItem value="aor">{t("quotations.create.service_aor")}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">{t("quotations.items.headcount")}</Label>
                            <Input type="number" min={1} value={item.headcount} onChange={(e) => updateV1Item(index, "headcount", parseInt(e.target.value))} />
                          </div>
                        </div>
                        {item.countryCode === "CN" && (
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">{t("quotations.create.city_region")}</Label>
                              <Select value={item.regionCode} onValueChange={(v) => updateV1Item(index, "regionCode", v)}>
                                <SelectTrigger><SelectValue placeholder={t("quotations.create.select_city")} /></SelectTrigger>
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
                        <div className={`grid gap-4 ${item.serviceType === "visa_eor" ? "grid-cols-3" : "grid-cols-2"}`}>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground truncate block">
                              {item.serviceType === "aor" ? t("quotations.create.contractor_rate") : t("quotations.items.salary")}
                            </Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">{item.currency || "USD"}</span>
                              <Input type="number" className="pl-14" value={item.salary} onChange={(e) => updateV1Item(index, "salary", parseFloat(e.target.value))} />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground truncate block">{t("quotations.items.fee")}</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">USD</span>
                              <Input type="number" className="pl-14" value={item.serviceFee} onChange={(e) => updateV1Item(index, "serviceFee", parseFloat(e.target.value))} />
                            </div>
                          </div>
                          {item.serviceType === "visa_eor" && (
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">One Time Fee</Label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">USD</span>
                                <Input type="number" className="pl-14" value={item.oneTimeFee || 0} onChange={(e) => updateV1Item(index, "oneTimeFee", parseFloat(e.target.value))} />
                              </div>
                            </div>
                          )}
                        </div>
                        {item.serviceType === "aor" && item.totalMonthly !== undefined && (
                          <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg text-sm flex justify-between items-center border border-green-200/50 dark:border-green-800/30">
                            <span className="text-xs text-muted-foreground">{t("quotations.create.aor_no_employer_cost")}</span>
                            <span className="font-semibold text-green-700 dark:text-green-400">{t("quotations.create.total_monthly")}: <span className="font-mono">{formatCurrency("USD", item.totalMonthly || 0)}</span></span>
                          </div>
                        )}
                        {item.serviceType !== "aor" && item.employerCost !== undefined && (
                          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg text-sm flex justify-between items-center border border-blue-200/50 dark:border-blue-800/30">
                            <span className="text-muted-foreground">{t("quotations.create.employer_cost")}: <span className="font-mono font-medium text-foreground">{formatCurrency(item.currency, item.employerCost)}</span></span>
                            <span className="font-semibold text-blue-700 dark:text-blue-400">{t("quotations.create.total_monthly")}: <span className="font-mono">{formatCurrency("USD", item.totalMonthly || 0)}</span></span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex justify-start pt-4">
                <Button variant="secondary" onClick={handleV1CalculateCosts} disabled={calculateMutation.isPending}>
                  {calculateMutation.isPending ? <Calculator className="w-4 h-4 mr-2 animate-spin" /> : <Calculator className="w-4 h-4 mr-2" />}
                  {t("quotations.create.preview_costs")}
                </Button>
              </div>
            </div>

            {/* V1 Right Panel */}
            <div className="space-y-6">
              <Card className="border-primary/20 shadow-sm sticky top-6">
                <CardHeader className="bg-primary/5 pb-3 border-b border-primary/10">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    {t("quotations.create.summary_title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("quotations.create.total_headcount")}</span>
                      <span className="font-medium">{v1Items.reduce((sum, i) => sum + i.headcount, 0)}</span>
                    </div>
                    {showCostPreview && (
                      <div className="flex justify-between items-end pt-3 border-t border-border">
                        <span className="font-medium">{t("quotations.create.est_monthly_total")}</span>
                        <span className="text-xl font-bold text-primary">{formatCurrency("USD", v1TotalQuotationValue)}</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setLocation("/quotations")}>{t("common.cancel")}</Button>
                    <Button className="flex-1" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                      {createMutation.isPending || updateMutation.isPending ? t("common.loading") : (isEditMode ? "Update" : t("common.create"))}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* ── V2 Mode (three-part quotation) ── */
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("quotations.create.basic_info")}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("quotations.create.customerLabel")}</Label>
                    <Select
                      value={leadId ? `lead-${leadId}` : customerId ? `cust-${customerId}` : ""}
                      onValueChange={(val) => {
                        if (val.startsWith("lead-")) { setLeadId(parseInt(val.split("-")[1])); setCustomerId(undefined); }
                        else { setCustomerId(parseInt(val.split("-")[1])); setLeadId(undefined); }
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder={t("quotations.create.select_placeholder")} /></SelectTrigger>
                      <SelectContent>
                        {leads?.data.filter((l: any) => l.status !== "closed_won" && l.status !== "closed_lost").map((l: any) => (
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
                </CardContent>
              </Card>

              {/* ── Part 1: Service Fee Pricing ── */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{t("quotations.v2.part1_title")}</CardTitle>
                        <CardDescription className="text-xs mt-0.5">{t("quotations.v2.part1_desc")}</CardDescription>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={addServiceFee}>
                      <Plus className="w-4 h-4 mr-2" />{t("quotations.v2.add_service_fee")}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {serviceFees.map((sf, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4 bg-muted/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Service Fee #{index + 1}</span>
                        <Button variant="ghost" size="sm" className="text-destructive h-7 px-2 text-xs" onClick={() => removeServiceFee(index)} disabled={serviceFees.length === 1}>
                          <Trash2 className="w-3.5 h-3.5 mr-1" />{t("common.delete")}
                        </Button>
                      </div>

                      {/* Countries multi-select */}
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">{t("quotations.v2.countries")}</Label>
                        <MultiSelect
                          options={countryOptions}
                          selected={sf.countries}
                          onChange={(selected) => handleServiceFeeCountriesChange(index, selected)}
                          placeholder={t("quotations.v2.select_countries")}
                        />
                      </div>

                      {/* Service Type + Service Fee + Headcount */}
                      <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">{t("quotations.items.serviceType")}</Label>
                          <Select value={sf.serviceType} onValueChange={(v) => handleServiceTypeChange(index, v as any)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="eor">{t("quotations.create.service_eor")}</SelectItem>
                              <SelectItem value="visa_eor">{t("quotations.create.service_visa_eor")}</SelectItem>
                              <SelectItem value="aor">{t("quotations.create.service_aor")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">{t("quotations.v2.service_fee_per_person")}</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">USD</span>
                            <Input type="number" className="pl-14" value={sf.serviceFee} onChange={(e) => updateServiceFee(index, { serviceFee: parseFloat(e.target.value) || 0 })} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">{t("quotations.items.headcount")}</Label>
                          <Input type="number" min={1} value={sf.headcount} onChange={(e) => updateServiceFee(index, { headcount: parseInt(e.target.value) || 1 })} />
                        </div>
                        {sf.serviceType === "visa_eor" && (
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">{t("quotations.v2.one_time_fee")}</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">USD</span>
                              <Input type="number" className="pl-14" value={sf.oneTimeFee || 0} onChange={(e) => updateServiceFee(index, { oneTimeFee: parseFloat(e.target.value) || 0 })} />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Subtotal */}
                      <div className="text-xs text-right text-muted-foreground">
                        Subtotal: <span className="font-mono font-medium text-foreground">{formatCurrency("USD", sf.serviceFee * sf.headcount)}</span>/month
                        {sf.oneTimeFee ? <span className="ml-3">+ <span className="font-mono font-medium text-foreground">{formatCurrency("USD", sf.oneTimeFee * sf.headcount)}</span> one-time</span> : null}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* ── Part 2: Employer Cost Estimation ── */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Calculator className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{t("quotations.v2.part2_title")}</CardTitle>
                        <CardDescription className="text-xs mt-0.5">{t("quotations.v2.part2_desc")}</CardDescription>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={addCostEstimation}>
                      <Plus className="w-4 h-4 mr-2" />{t("quotations.v2.add_cost_estimation")}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {costEstimations.length === 0 ? (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                      {t("quotations.v2.no_items")}
                    </div>
                  ) : (
                    <>
                      {costEstimations.map((ce, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-4 bg-muted/10">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">Cost Estimation #{index + 1}</span>
                            <Button variant="ghost" size="sm" className="text-destructive h-7 px-2 text-xs" onClick={() => removeCostEstimation(index)}>
                              <Trash2 className="w-3.5 h-3.5 mr-1" />{t("common.delete")}
                            </Button>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">{t("quotations.items.country")}</Label>
                              <CountrySelect value={ce.countryCode} onValueChange={(v) => handleCostCountryChange(index, v)} />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">{t("quotations.v2.gross_salary")}</Label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">{ce.currency || "USD"}</span>
                                <Input type="number" className="pl-14" value={ce.salary} onChange={(e) => updateCostEstimation(index, { salary: parseFloat(e.target.value) || 0 })} />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">{t("quotations.items.headcount")}</Label>
                              <Input type="number" min={1} value={ce.headcount} onChange={(e) => updateCostEstimation(index, { headcount: parseInt(e.target.value) || 1 })} />
                            </div>
                          </div>

                          {/* China region selector */}
                          {ce.countryCode === "CN" && (
                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">{t("quotations.create.city_region")}</Label>
                                <Select value={ce.regionCode} onValueChange={(v) => updateCostEstimation(index, { regionCode: v })}>
                                  <SelectTrigger><SelectValue placeholder={t("quotations.create.select_city")} /></SelectTrigger>
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

                          {/* Cost result */}
                          {ce.employerCost !== undefined && (
                            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg text-sm border border-green-200/50 dark:border-green-800/30">
                              <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                  <div className="text-xs text-muted-foreground">
                                    {t("quotations.v2.employer_cost_result")}: <span className="font-mono font-medium text-foreground">{formatCurrency(ce.currency, ce.employerCost)}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {t("quotations.v2.total_employment_cost")} ({ce.currency}): <span className="font-mono font-medium text-foreground">{formatCurrency(ce.currency, ce.totalEmploymentCostLocal || 0)}</span>
                                  </div>
                                  {ce.exchangeRate && ce.exchangeRate !== 1 && (
                                    <div className="text-xs text-muted-foreground">
                                      {t("quotations.v2.exchange_rate")}: 1 USD = {ce.exchangeRate.toFixed(4)} {ce.currency}
                                    </div>
                                  )}
                                </div>
                                <span className="font-semibold text-green-700 dark:text-green-400">
                                  {formatCurrency("USD", (ce.totalEmploymentCostUsd || 0) * ce.headcount)}/mo
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      <div className="flex justify-start">
                        <Button variant="secondary" onClick={handleCalculateAllCosts} disabled={calculateMutation.isPending}>
                          {calculateMutation.isPending ? <Calculator className="w-4 h-4 mr-2 animate-spin" /> : <Calculator className="w-4 h-4 mr-2" />}
                          {t("quotations.v2.calculate_costs")}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* ── Part 3: Country Guides ── */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{t("quotations.v2.part3_title")}</CardTitle>
                        <CardDescription className="text-xs mt-0.5">{t("quotations.v2.part3_desc")}</CardDescription>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={addCountryGuide}>
                      <Plus className="w-4 h-4 mr-2" />{t("quotations.v2.add_country_guide")}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {countryGuides.length === 0 ? (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                      {t("quotations.v2.no_items")}
                    </div>
                  ) : (
                    countryGuides.map((cg, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="flex-1">
                          <CountrySelect value={cg.countryCode} onValueChange={(v) => updateCountryGuide(index, v)} />
                        </div>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeCountryGuide(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("quotations.create.notes")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t("quotations.v2.notes_placeholder")}
                    rows={3}
                  />
                </CardContent>
              </Card>
            </div>

            {/* ── V2 Right Panel: Summary ── */}
            <div className="space-y-6">
              <Card className="border-primary/20 shadow-sm sticky top-6">
                <CardHeader className="bg-primary/5 pb-3 border-b border-primary/10">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    {t("quotations.create.summary_title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-3 text-sm">
                    {/* Service Fees Summary */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <DollarSign className="w-3 h-3" />
                        {t("quotations.v2.part1_title")}
                      </div>
                      <div className="flex justify-between pl-5">
                        <span className="text-muted-foreground">{t("quotations.create.total_headcount")}</span>
                        <span className="font-medium">{totalHeadcountServiceFees}</span>
                      </div>
                      <div className="flex justify-between pl-5">
                        <span className="text-muted-foreground">{t("quotations.v2.total_service_fees")}</span>
                        <span className="font-mono font-medium">{formatCurrency("USD", totalServiceFeesMonthly)}/mo</span>
                      </div>
                      {totalOneTimeFees > 0 && (
                        <div className="flex justify-between pl-5">
                          <span className="text-muted-foreground">{t("quotations.v2.one_time_fee")}</span>
                          <span className="font-mono font-medium">{formatCurrency("USD", totalOneTimeFees)}</span>
                        </div>
                      )}
                    </div>

                    {/* Cost Estimations Summary */}
                    {costEstimations.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-border">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          <Calculator className="w-3 h-3" />
                          {t("quotations.v2.part2_title")}
                        </div>
                        <div className="flex justify-between pl-5">
                          <span className="text-muted-foreground">{t("quotations.create.total_headcount")}</span>
                          <span className="font-medium">{totalHeadcountCostEstimations}</span>
                        </div>
                        <div className="flex justify-between pl-5">
                          <span className="text-muted-foreground">{t("quotations.v2.total_employment_costs")}</span>
                          <span className="font-mono font-medium">{formatCurrency("USD", totalEmploymentCostsUsd)}/mo</span>
                        </div>
                      </div>
                    )}

                    {/* Country Guides Summary */}
                    {countryGuides.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-border">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          <BookOpen className="w-3 h-3" />
                          {t("quotations.v2.part3_title")}
                        </div>
                        <div className="flex justify-between pl-5">
                          <span className="text-muted-foreground">{t("quotations.v2.countries")}</span>
                          <span className="font-medium">{countryGuides.filter(cg => cg.countryCode).length}</span>
                        </div>
                      </div>
                    )}

                    {/* Grand Total */}
                    <div className="flex justify-between items-end pt-3 border-t-2 border-primary/20">
                      <span className="font-medium">{t("quotations.v2.grand_total")}</span>
                      <span className="text-xl font-bold text-primary">{formatCurrency("USD", grandTotalMonthly)}</span>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setLocation("/quotations")}>{t("common.cancel")}</Button>
                    <Button className="flex-1" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                      {createMutation.isPending || updateMutation.isPending ? t("common.loading") : (isEditMode ? "Update" : t("common.create"))}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
