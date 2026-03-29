/**
 * Enhanced Salary Benchmark
 * Multi-dimensional salary data with visualization.
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
import { BarChart3, Plus, Info, TrendingUp, Filter } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { toast } from "sonner";

const COLORS = ["hsl(221, 83%, 53%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)"];

export default function SalaryBenchmark() {
  const { t, language } = useI18n();
  const [countryCode, setCountryCode] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [seniorityLevel, setSeniorityLevel] = useState("");
  const [industry, setIndustry] = useState("");

  const { data: countries } = trpc.toolkitEnhanced.getActiveCountries.useQuery();
  const { data: benchmarks, isLoading } = trpc.toolkitEnhanced.getSalaryBenchmarks.useQuery(
    { countryCode, jobTitle: jobTitle || undefined, seniorityLevel: seniorityLevel || undefined, industry: industry || undefined },
    { enabled: !!countryCode }
  );

  const selectedCountry = countries?.find((c: any) => c.countryCode === countryCode);

  // Extract unique filter options from data
  const jobTitles = [...new Set(benchmarks?.map((b: any) => b.jobTitle).filter(Boolean) || [])];
  const seniorityLevels = [...new Set(benchmarks?.map((b: any) => b.seniorityLevel).filter(Boolean) || [])];
  const industries = [...new Set(benchmarks?.map((b: any) => b.industry).filter(Boolean) || [])];

  // Prepare chart data
  const chartData = benchmarks?.map((b: any) => ({
    name: `${b.jobTitle}${b.seniorityLevel ? ` (${b.seniorityLevel})` : ""}`,
    p25: b.p25Salary ? parseFloat(b.p25Salary) : null,
    p50: b.medianSalary ? parseFloat(b.medianSalary) : null,
    p75: b.p75Salary ? parseFloat(b.p75Salary) : null,
  })).slice(0, 10) || [];

  const handleAddToProposal = () => {
    if (!benchmarks?.length) return;
    const item = {
      type: "salary_benchmark" as const,
      country: selectedCountry?.countryName || countryCode,
      countryCode,
      filters: { jobTitle, seniorityLevel, industry },
      data: benchmarks,
    };
    const existing = JSON.parse(localStorage.getItem("proposalCart") || "[]");
    existing.push(item);
    localStorage.setItem("proposalCart", JSON.stringify(existing));
    toast.success(t("salary_benchmark.added_to_proposal"));
  };

  const formatSalary = (val: string | number | null) => {
    if (!val) return "—";
    const num = typeof val === "string" ? parseFloat(val) : val;
    return new Intl.NumberFormat("en-US", { style: "currency", currency: selectedCountry?.localCurrency || "USD", maximumFractionDigits: 0 }).format(num);
  };

  return (
    <Layout title={t("salary_benchmark.title")}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              {t("salary_benchmark.title")}
            </h1>
            <p className="text-muted-foreground mt-1">{t("salary_benchmark.subtitle")}</p>
          </div>
          {benchmarks?.length ? (
            <Button variant="outline" onClick={handleAddToProposal}>
              <Plus className="mr-2 h-4 w-4" />
              {t("salary_benchmark.add_to_proposal")}
            </Button>
          ) : null}
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {t("salary_benchmark.filters")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("salary_benchmark.country")}</label>
                <Select value={countryCode} onValueChange={(v) => { setCountryCode(v); setJobTitle(""); setSeniorityLevel(""); setIndustry(""); }}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("salary_benchmark.country_placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {countries?.map((c: any) => (
                      <SelectItem key={c.countryCode} value={c.countryCode}>{c.countryName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("salary_benchmark.job_title")}</label>
                <Select value={jobTitle} onValueChange={setJobTitle}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("salary_benchmark.all")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t("salary_benchmark.all")}</SelectItem>
                    {jobTitles.map((jt: string) => (
                      <SelectItem key={jt} value={jt}>{jt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("salary_benchmark.seniority")}</label>
                <Select value={seniorityLevel} onValueChange={setSeniorityLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("salary_benchmark.all")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t("salary_benchmark.all")}</SelectItem>
                    {seniorityLevels.map((sl: string) => (
                      <SelectItem key={sl} value={sl}>{sl}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("salary_benchmark.industry")}</label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("salary_benchmark.all")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t("salary_benchmark.all")}</SelectItem>
                    {industries.map((ind: string) => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart */}
        {chartData.length > 0 && (
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t("salary_benchmark.chart_title")}
              </CardTitle>
              <CardDescription>{t("salary_benchmark.chart_desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-30} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => formatSalary(value)} />
                  <Legend />
                  <Bar dataKey="p25" name="P25" fill={COLORS[0]} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="p50" name="P50 (Median)" fill={COLORS[1]} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="p75" name="P75" fill={COLORS[2]} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Data Table */}
        {benchmarks?.length ? (
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg">{t("salary_benchmark.data_table")}</CardTitle>
              <CardDescription>{benchmarks.length} {t("salary_benchmark.records")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("salary_benchmark.job_title")}</TableHead>
                    <TableHead>{t("salary_benchmark.seniority")}</TableHead>
                    <TableHead>{t("salary_benchmark.industry")}</TableHead>
                    <TableHead className="text-right">P25</TableHead>
                    <TableHead className="text-right">P50</TableHead>
                    <TableHead className="text-right">P75</TableHead>
                    <TableHead>{t("salary_benchmark.source")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {benchmarks.map((b: any) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.jobTitle}</TableCell>
                      <TableCell>
                        {b.seniorityLevel ? <Badge variant="secondary">{b.seniorityLevel}</Badge> : "—"}
                      </TableCell>
                      <TableCell>{b.industry || "—"}</TableCell>
                      <TableCell className="text-right">{formatSalary(b.p25Salary)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatSalary(b.medianSalary)}</TableCell>
                      <TableCell className="text-right">{formatSalary(b.p75Salary)}</TableCell>
                      <TableCell>
                        <Badge variant={b.source === "gea_official" ? "default" : "outline"} className="text-xs">
                          {b.source || "ai_generated"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : null}

        {/* Disclaimer */}
        {benchmarks?.length ? (
          <div className="bg-muted/50 p-3 rounded-lg flex gap-2 text-xs text-muted-foreground">
            <Info className="w-4 h-4 flex-shrink-0" />
            <p>{t("salary_benchmark.disclaimer")}</p>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
