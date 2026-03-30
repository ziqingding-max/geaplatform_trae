/**
 * Hiring Compliance Cheat Sheet
 * Quick reference for key hiring compliance metrics by country.
 * Backend returns a single flat record per country with fields like
 * probationRulesEn, noticePeriodRulesEn, etc.
 */

import { useState } from "react";
import Layout from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Plus, Info, AlertTriangle, FileText } from "lucide-react";
import { toast } from "sonner";
import { AddToProposalButton } from "@/components/AddToProposalButton";

interface ComplianceSection {
  key: string;
  labelKey: string;
  icon: string;
  riskLevel: "low" | "medium" | "high";
  enField: string;
  zhField: string;
}

const COMPLIANCE_SECTIONS: ComplianceSection[] = [
  { key: "probation", labelKey: "compliance.probation", icon: "📋", riskLevel: "low", enField: "probationRulesEn", zhField: "probationRulesZh" },
  { key: "notice_period", labelKey: "compliance.notice_period", icon: "⏰", riskLevel: "medium", enField: "noticePeriodRulesEn", zhField: "noticePeriodRulesZh" },
  { key: "background_check", labelKey: "compliance.background_check", icon: "🔍", riskLevel: "medium", enField: "backgroundCheckRulesEn", zhField: "backgroundCheckRulesZh" },
  { key: "severance", labelKey: "compliance.severance", icon: "💰", riskLevel: "high", enField: "severanceRulesEn", zhField: "severanceRulesZh" },
  { key: "non_compete", labelKey: "compliance.non_compete", icon: "🚫", riskLevel: "medium", enField: "nonCompeteRulesEn", zhField: "nonCompeteRulesZh" },
  { key: "work_permit", labelKey: "compliance.work_permit", icon: "🛂", riskLevel: "high", enField: "workPermitRulesEn", zhField: "workPermitRulesZh" },
  { key: "additional", labelKey: "compliance.additional_notes", icon: "📝", riskLevel: "low", enField: "additionalNotesEn", zhField: "additionalNotesZh" },
];

export default function HiringCompliance() {
  const { t, locale: language } = useI18n();
  const [countryCode, setCountryCode] = useState("");

  const { data: countries } = trpc.toolkitEnhanced.getActiveCountries.useQuery();
  const { data: complianceData, isLoading } = trpc.toolkitEnhanced.getComplianceByCountry.useQuery(
    { countryCode },
    { enabled: !!countryCode }
  );

  const selectedCountry = countries?.find((c: any) => c.countryCode === countryCode);



  const getRiskBadge = (level: string) => {
    switch (level) {
      case "high":
        return <Badge variant="destructive" className="flex items-center gap-1 text-xs"><AlertTriangle className="h-3 w-3" />{t("compliance.high_risk")}</Badge>;
      case "medium":
        return <Badge variant="outline" className="flex items-center gap-1 border-orange-400 text-orange-600 text-xs"><AlertTriangle className="h-3 w-3" />{t("compliance.medium_risk")}</Badge>;
      case "low":
        return <Badge variant="secondary" className="text-xs">{t("compliance.low_risk")}</Badge>;
      default:
        return null;
    }
  };

  // Filter sections that have data
  const activeSections = complianceData
    ? COMPLIANCE_SECTIONS.filter((s) => {
        const val = (complianceData as any)[s.enField] || (complianceData as any)[s.zhField];
        return val && val.trim().length > 0;
      })
    : [];

  return (
    <Layout title={t("toolkit_compliance.title")}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              {t("toolkit_compliance.title")}
            </h1>
            <p className="text-muted-foreground mt-1">{t("toolkit_compliance.subtitle")}</p>
          </div>
          {complianceData && selectedCountry ? (
            <AddToProposalButton
              type="compliance"
              countryCode={countryCode}
              countryName={selectedCountry.countryName}
            />
          ) : null}
        </div>

        {/* Country Selector */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-md">
          <CardContent className="pt-6">
            <div className="max-w-sm">
              <label className="text-sm font-medium mb-2 block">{t("compliance.country_label")}</label>
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

        {/* Compliance Cards */}
        {countryCode && complianceData && activeSections.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSections.map((section) => {
              const content = language === "zh"
                ? (complianceData as any)[section.zhField] || (complianceData as any)[section.enField]
                : (complianceData as any)[section.enField] || (complianceData as any)[section.zhField];
              return (
                <Card key={section.key} className="border-0 shadow-lg bg-white/90 backdrop-blur-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="text-lg">{section.icon}</span>
                        {t(section.labelKey)}
                      </CardTitle>
                      {getRiskBadge(section.riskLevel)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {content}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {countryCode && !isLoading && !complianceData && (
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-md">
            <CardContent className="py-12 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t("compliance.no_data")}</p>
            </CardContent>
          </Card>
        )}

        {/* Source Info */}
        {complianceData && (
          <div className="bg-muted/50 p-3 rounded-lg flex gap-2 text-xs text-muted-foreground">
            <Info className="w-4 h-4 flex-shrink-0" />
            <div className="space-y-1">
              <p>{t("compliance.source")}: <Badge variant="outline" className="text-xs ml-1">{(complianceData as any).source || "ai_generated"}</Badge></p>
              {(complianceData as any).lastVerifiedAt && (
                <p>{t("compliance.last_verified")}: {new Date((complianceData as any).lastVerifiedAt).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
