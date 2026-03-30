/**
 * Global Start Date Predictor
 * Calculates earliest realistic onboarding date based on notice period,
 * public holidays, and EOR setup SLA.
 */

import { useState } from "react";
import Layout from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarCheck, CalendarDays, Loader2, Plus, Info, ArrowRight } from "lucide-react";
import { format, parseISO, eachDayOfInterval, isWithinInterval } from "date-fns";
import { toast } from "sonner";
import { AddToProposalButton } from "@/components/AddToProposalButton";

export default function StartDatePredictor() {
  const { t } = useI18n();
  const [countryCode, setCountryCode] = useState("");
  const [resignationDate, setResignationDate] = useState<Date | undefined>();
  const [eorSla, setEorSla] = useState("10");
  const [customNotice, setCustomNotice] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { data: countries } = trpc.toolkitEnhanced.getActiveCountries.useQuery();
  const predictMutation = trpc.toolkitEnhanced.predictStartDate.useMutation({
    onError: (err) => toast.error(err.message),
  });

  const selectedCountry = countries?.find((c: any) => c.countryCode === countryCode);

  const handlePredict = () => {
    if (!countryCode || !resignationDate) return;
    predictMutation.mutate({
      countryCode,
      resignationDate: format(resignationDate, "yyyy-MM-dd"),
      eorOnboardingSla: parseInt(eorSla) || 10,
      customNoticePeriodDays: customNotice ? parseInt(customNotice) : undefined,
    });
  };

  const result = predictMutation.data;

  // Build calendar modifiers for visual timeline
  const calendarModifiers = result ? (() => {
    const noticeEnd = parseISO(result.noticePeriodEndDate);
    const eorReady = parseISO(result.eorReadyDate);
    const startDate = parseISO(result.earliestStartDate);
    const holidays = result.holidaysInRange.map((h: any) => parseISO(typeof h === 'string' ? h : h.date));

    const noticeDays = resignationDate ? eachDayOfInterval({
      start: resignationDate,
      end: noticeEnd,
    }) : [];

    const eorDays = eachDayOfInterval({
      start: noticeEnd,
      end: eorReady,
    });

    return {
      notice: noticeDays,
      eor: eorDays,
      holiday: holidays,
      start: [startDate],
    };
  })() : undefined;

  const calendarModifiersStyles = {
    notice: { backgroundColor: "hsl(var(--chart-1) / 0.2)", borderRadius: "0" },
    eor: { backgroundColor: "hsl(var(--chart-2) / 0.2)", borderRadius: "0" },
    holiday: { backgroundColor: "hsl(var(--destructive) / 0.3)", borderRadius: "50%", fontWeight: "bold" },
    start: { backgroundColor: "hsl(var(--primary))", color: "white", borderRadius: "50%", fontWeight: "bold" },
  };

  return (
    <Layout title={t("start_date.title")}>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-primary" />
            {t("start_date.title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("start_date.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Card */}
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg">{t("start_date.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Country Select */}
              <div className="space-y-2">
                <Label>{t("start_date.country_label")}</Label>
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("start_date.country_placeholder")} />
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

              {/* Resignation Date */}
              <div className="space-y-2">
                <Label>{t("start_date.resignation_date")}</Label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {resignationDate ? format(resignationDate, "yyyy-MM-dd") : t("start_date.resignation_placeholder")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={resignationDate}
                      onSelect={(d) => { setResignationDate(d || undefined); setCalendarOpen(false); }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* EOR SLA */}
              <div className="space-y-2">
                <Label>{t("start_date.eor_sla")}</Label>
                <Input
                  type="number"
                  value={eorSla}
                  onChange={(e) => setEorSla(e.target.value)}
                  placeholder={t("start_date.eor_sla_placeholder")}
                  min={1}
                />
              </div>

              {/* Custom Notice */}
              <div className="space-y-2">
                <Label>{t("start_date.custom_notice")}</Label>
                <Input
                  type="number"
                  value={customNotice}
                  onChange={(e) => setCustomNotice(e.target.value)}
                  placeholder={t("start_date.custom_notice_placeholder")}
                  min={0}
                />
              </div>

              {/* Country Info */}
              {selectedCountry && (
                <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("start_date.notice_period")} ({t("start_date.business_days")})</span>
                    <Badge variant="secondary">{selectedCountry.noticePeriodDays || "N/A"}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("start_date.working_days_week")}</span>
                    <Badge variant="secondary">{selectedCountry.workingDaysPerWeek || 5}</Badge>
                  </div>
                </div>
              )}

              <Button
                onClick={handlePredict}
                disabled={predictMutation.isPending || !countryCode || !resignationDate}
                className="w-full"
              >
                {predictMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarCheck className="mr-2 h-4 w-4" />}
                {t("start_date.predict")}
              </Button>
            </CardContent>
          </Card>

          {/* Result Card */}
          {result && (
            <div className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
                <CardHeader className="bg-primary/5 pb-4">
                  <CardTitle className="text-primary flex items-center gap-2">
                    <CalendarCheck className="h-5 w-5" />
                    {t("start_date.result_title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {/* Timeline Steps */}
                  <div className="space-y-3">
                    <TimelineStep
                      label={t("start_date.resignation")}
                      date={resignationDate ? format(resignationDate, "yyyy-MM-dd") : ""}
                      color="bg-muted"
                    />
                    <div className="flex items-center gap-2 pl-4 text-xs text-muted-foreground">
                      <ArrowRight className="h-3 w-3" />
                      <span>{t("start_date.notice_period")}: {result.noticePeriodDays} {t("start_date.business_days")}</span>
                    </div>
                    <TimelineStep
                      label={t("start_date.notice_end")}
                      date={result.noticePeriodEndDate}
                      color="bg-chart-1/20"
                    />
                    <div className="flex items-center gap-2 pl-4 text-xs text-muted-foreground">
                      <ArrowRight className="h-3 w-3" />
                      <span>{t("start_date.eor_setup")}: {result.eorOnboardingSla} {t("start_date.business_days")}</span>
                    </div>
                    <TimelineStep
                      label={t("start_date.eor_ready")}
                      date={result.eorReadyDate}
                      color="bg-chart-2/20"
                    />
                    <TimelineStep
                      label={t("start_date.earliest_start")}
                      date={result.earliestStartDate}
                      color="bg-primary"
                      highlight
                    />
                  </div>

                  {/* Holidays Info */}
                  <div className="bg-muted/50 p-3 rounded-lg text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("start_date.holidays_in_range")}</span>
                      <Badge variant="destructive">{result.holidaysInRange.length}</Badge>
                    </div>
                  </div>

                  {/* Add to Proposal */}
                  {selectedCountry && (
                    <AddToProposalButton
                      type="start_date"
                      countryCode={countryCode}
                      countryName={selectedCountry.countryName}
                      variant="outline"
                      className="w-full"
                    />
                  )}
                </CardContent>
              </Card>

              {/* Visual Calendar */}
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
                <CardHeader>
                  <CardTitle className="text-lg">{t("start_date.calendar_title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    numberOfMonths={2}
                    defaultMonth={resignationDate}
                    modifiers={calendarModifiers}
                    modifiersStyles={calendarModifiersStyles}
                    className="rounded-md border"
                  />
                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 mt-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--chart-1) / 0.4)" }} />
                      <span>{t("start_date.legend_notice")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--chart-2) / 0.4)" }} />
                      <span>{t("start_date.legend_eor")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--destructive) / 0.5)" }} />
                      <span>{t("start_date.legend_holiday")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span>{t("start_date.legend_start")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function TimelineStep({ label, date, color, highlight }: { label: string; date: string; color: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${color} ${highlight ? "text-white font-bold text-lg" : ""}`}>
      <span>{label}</span>
      <span className={highlight ? "text-xl" : "font-medium"}>{date}</span>
    </div>
  );
}
