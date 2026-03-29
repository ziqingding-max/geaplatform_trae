/**
 * Hiring Compliance Cheat Sheet
 * Quick reference for key hiring compliance metrics by country.
 */

import { useState } from "react";
import Layout from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, Plus, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function HiringCompliance() {
  const { t, language } = useI18n();
  const [countryCode, setCountryCode] = useState("");

  const { data: countries } = trpc.toolkitEnhanced.getActiveCountries.useQuery();
  const { data: complianceItems, isLoading } = trpc.toolkitEnhanced.getComplianceByCountry.useQuery(
    { countryCode },
    { enabled: !!countryCode }
  );

  const selectedCountry = countries?.find((c: any) => c.countryCode === countryCode);

  const handleAddToProposal = () => {
    if (!complianceItems?.length) return;
    const item = {
      type: "compliance" as const,
      country: selectedCountry?.countryName || countryCode,
      countryCode,
      data: complianceItems,
    };
    const existing = JSON.parse(localStorage.getItem("proposalCart") || "[]");
    existing.push(item);
    localStorage.setItem("proposalCart", JSON.stringify(existing));
    toast.success(t("compliance.added_to_proposal"));
  };

  const getRiskBadge = (level: string | null) => {
    switch (level) {
      case "high":
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{t("compliance.high_risk")}</Badge>;
      case "medium":
        return <Badge variant="outline" className="flex items-center gap-1 border-orange-400 text-orange-600"><AlertTriangle className="h-3 w-3" />{t("compliance.medium_risk")}</Badge>;
      case "low":
        return <Badge variant="secondary" className="flex items-center gap-1 text-green-600"><CheckCircle className="h-3 w-3" />{t("compliance.low_risk")}</Badge>;
      default:
        return <Badge variant="outline">—</Badge>;
    }
  };

  // Group by category
  const grouped = complianceItems?.reduce((acc: Record<string, any[]>, item: any) => {
    const cat = item.category || "general";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, any[]>) || {};

  const categoryLabels: Record<string, string> = {
    probation: t("compliance.cat_probation"),
    notice_period: t("compliance.cat_notice"),
    termination: t("compliance.cat_termination"),
    background_check: t("compliance.cat_background"),
    working_hours: t("compliance.cat_working_hours"),
    leave: t("compliance.cat_leave"),
    general: t("compliance.cat_general"),
  };

  return (
    <Layout title={t("compliance.title")}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              {t("compliance.title")}
            </h1>
            <p className="text-muted-foreground mt-1">{t("compliance.subtitle")}</p>
          </div>
          {complianceItems?.length ? (
            <Button variant="outline" onClick={handleAddToProposal}>
              <Plus className="mr-2 h-4 w-4" />
              {t("compliance.add_to_proposal")}
            </Button>
          ) : null}
        </div>

        {/* Country Selector */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-md">
          <CardContent className="pt-6">
            <div className="max-w-sm">
              <label className="text-sm font-medium mb-2 block">{t("compliance.select_country")}</label>
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger>
                  <SelectValue placeholder={t("compliance.country_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {countries?.map((c: any) => (
                    <SelectItem key={c.countryCode} value={c.countryCode}>
                      {c.countryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Cards by Category */}
        {Object.entries(grouped).map(([category, items]) => (
          <Card key={category} className="border-0 shadow-lg bg-white/90 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg">
                {categoryLabels[category] || category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">{t("compliance.metric")}</TableHead>
                    <TableHead>{t("compliance.value")}</TableHead>
                    <TableHead className="w-[120px]">{t("compliance.risk_level")}</TableHead>
                    <TableHead>{t("compliance.notes")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(items as any[]).map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {language === "zh" ? item.metricNameZh : item.metricNameEn}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {language === "zh" ? item.metricValueZh : item.metricValueEn}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getRiskBadge(item.riskLevel)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs">
                        {language === "zh" ? item.notesZh : item.notesEn}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}

        {/* Disclaimer */}
        {complianceItems?.length ? (
          <div className="bg-muted/50 p-3 rounded-lg flex gap-2 text-xs text-muted-foreground">
            <Info className="w-4 h-4 flex-shrink-0" />
            <p>{t("compliance.disclaimer")}</p>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
