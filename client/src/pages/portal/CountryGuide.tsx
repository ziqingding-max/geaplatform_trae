import { useState, useMemo, useRef, useEffect } from "react";
import { portalTrpc } from "@/lib/portalTrpc";
import { useI18n } from "@/lib/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Globe,
  Search,
  ChevronRight,
  Building2,
  DollarSign,
  Clock,
  Briefcase,
  Shield,
  Gift,
  ArrowUp,
} from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Chapter icon mapping
const chapterIcons: Record<string, any> = {
  overview: Globe,
  hiring: Briefcase,
  compensation: DollarSign,
  "working-conditions": Clock,
  termination: Shield,
  benefits: Gift,
};

// Part labels
const partLabelsEn: Record<number, string> = {
  1: "Country Overview",
  2: "Hiring & Employment",
  3: "Compensation & Taxes",
  4: "Working Conditions & Leave",
  5: "Termination & Compliance",
  6: "Benefits & Additional Info",
};

const partLabelsZh: Record<number, string> = {
  1: "国家概览",
  2: "招聘与雇佣",
  3: "薪酬与税务",
  4: "工作条件与假期",
  5: "终止与合规",
  6: "福利与附加信息",
};

export default function CountryGuide() {
  const { t, locale } = useI18n();
  const [countryCode, setCountryCode] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChapterId, setActiveChapterId] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const { data: countries } = portalTrpc.toolkit.listCountries.useQuery();
  const { data: countriesWithGuides } =
    portalTrpc.toolkit.listCountriesWithGuides.useQuery();
  const { data: chapters, isLoading } =
    portalTrpc.toolkit.listGuideChapters.useQuery(
      { countryCode },
      { enabled: !!countryCode }
    );

  // Set default country to first country with guides
  useEffect(() => {
    if (!countryCode && countriesWithGuides && countriesWithGuides.length > 0) {
      setCountryCode(countriesWithGuides[0].countryCode);
    }
  }, [countriesWithGuides, countryCode]);

  // Track scroll position for active chapter highlighting
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const handleScroll = () => {
      setShowScrollTop(container.scrollTop > 300);

      // Find active chapter based on scroll position
      const chapterElements = container.querySelectorAll("[data-chapter-id]");
      let currentActive: number | null = null;

      chapterElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        if (rect.top <= containerRect.top + 150) {
          currentActive = Number(el.getAttribute("data-chapter-id"));
        }
      });

      if (currentActive !== null) {
        setActiveChapterId(currentActive);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [chapters]);

  // Group chapters by part
  const chaptersByPart = useMemo(() => {
    const map = new Map<number, any[]>();
    chapters?.forEach((ch) => {
      const list = map.get(ch.part) || [];
      list.push(ch);
      map.set(ch.part, list);
    });
    return map;
  }, [chapters]);

  // Get current country info
  const currentCountry = useMemo(() => {
    return countries?.find((c) => c.countryCode === countryCode);
  }, [countries, countryCode]);

  // Filter countries for selector
  const filteredCountries = useMemo(() => {
    if (!countries) return [];
    const q = searchQuery.toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.countryName.toLowerCase().includes(q) ||
        c.countryCode.toLowerCase().includes(q)
    );
  }, [countries, searchQuery]);

  const scrollToChapter = (chapterId: number) => {
    const el = document.querySelector(`[data-chapter-id="${chapterId}"]`);
    if (el && contentRef.current) {
      const containerTop = contentRef.current.getBoundingClientRect().top;
      const elTop = el.getBoundingClientRect().top;
      contentRef.current.scrollTo({
        top: contentRef.current.scrollTop + (elTop - containerTop) - 20,
        behavior: "smooth",
      });
    }
  };

  const scrollToTop = () => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const partLabels = locale === "zh" ? partLabelsZh : partLabelsEn;

  return (
    <PortalLayout title={t("nav.countryGuide")}>
      <div className="h-[calc(100vh-3.5rem)] flex flex-col">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b px-6 py-5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                {t("nav.countryGuide")}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {locale === "zh"
                  ? "全面的全球扩展指南，涵盖雇佣、薪酬、合规等关键信息"
                  : "Comprehensive guides for global expansion covering hiring, compensation, compliance and more"}
              </p>
            </div>
            <div className="w-[240px]">
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="bg-white/80 backdrop-blur-sm">
                  <SelectValue
                    placeholder={
                      locale === "zh" ? "选择国家" : "Select country"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 pb-2">
                    <Input
                      placeholder={locale === "zh" ? "搜索国家..." : "Search..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  {filteredCountries?.map((c) => (
                    <SelectItem key={c.countryCode} value={c.countryCode}>
                      <span className="flex items-center gap-2">
                        <span className="font-medium">{c.countryName}</span>
                        <span className="text-xs text-muted-foreground">
                          ({c.countryCode})
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Country Quick Info */}
          {currentCountry && chapters && chapters.length > 0 && (
            <div className="flex items-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {locale === "zh" ? "货币" : "Currency"}:
                </span>
                <span className="font-medium">
                  {currentCountry.localCurrency}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {locale === "zh" ? "章节" : "Chapters"}:
                </span>
                <span className="font-medium">{chapters.length}</span>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        {!countryCode ? (
          /* Country Selection Grid */
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="text-lg font-semibold mb-4">
              {locale === "zh" ? "选择一个国家开始浏览" : "Select a country to get started"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {countriesWithGuides?.map((c) => (
                <Card
                  key={c.countryCode}
                  className="cursor-pointer hover:bg-accent/50 hover:border-primary/30 transition-all"
                  onClick={() => setCountryCode(c.countryCode)}
                >
                  <CardContent className="p-4">
                    <div className="font-medium">{c.countryName}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {c.chapterCount} {locale === "zh" ? "章节" : "chapters"}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* Guide Content */
          <div className="flex-1 min-h-0 flex">
            {/* Sidebar Navigation */}
            <div className="w-64 border-r bg-muted/30 flex-shrink-0 overflow-y-auto p-4">
              <nav className="space-y-4">
                {Array.from(chaptersByPart.entries())
                  .sort(([a], [b]) => a - b)
                  .map(([part, partChapters]) => (
                    <div key={part}>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                        {partLabels[part] || `Part ${part}`}
                      </h3>
                      <div className="space-y-0.5">
                        {partChapters.map((chapter: any) => {
                          const Icon =
                            chapterIcons[chapter.chapterKey] || BookOpen;
                          const isActive = activeChapterId === chapter.id;
                          return (
                            <button
                              key={chapter.id}
                              onClick={() => scrollToChapter(chapter.id)}
                              className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${
                                isActive
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              }`}
                            >
                              <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate">
                                {locale === "zh"
                                  ? chapter.titleZh
                                  : chapter.titleEn}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </nav>
            </div>

            {/* Content Area */}
            <div
              ref={contentRef}
              className="flex-1 overflow-y-auto relative"
            >
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : chapters && chapters.length > 0 ? (
                <div className="max-w-4xl mx-auto px-8 py-6">
                  {/* Country Title */}
                  <div className="mb-8 pb-6 border-b">
                    <h1 className="text-3xl font-bold text-foreground">
                      {currentCountry?.countryName}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                      {locale === "zh"
                        ? `${currentCountry?.countryName}的全面雇佣指南`
                        : `Comprehensive employment guide for ${currentCountry?.countryName}`}
                    </p>
                  </div>

                  {/* Chapters */}
                  {Array.from(chaptersByPart.entries())
                    .sort(([a], [b]) => a - b)
                    .map(([part, partChapters]) => (
                      <div key={part} className="mb-10">
                        {/* Part Header */}
                        <div className="flex items-center gap-3 mb-6">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">
                              {part}
                            </span>
                          </div>
                          <h2 className="text-xl font-bold text-foreground">
                            {partLabels[part] || `Part ${part}`}
                          </h2>
                          <div className="flex-1 h-px bg-border" />
                        </div>

                        {partChapters.map((chapter: any) => (
                          <div
                            key={chapter.id}
                            data-chapter-id={chapter.id}
                            className="mb-8 scroll-mt-6"
                          >
                            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                              <ChevronRight className="h-4 w-4 text-primary" />
                              {locale === "zh"
                                ? chapter.titleZh
                                : chapter.titleEn}
                            </h3>
                            <div className="overflow-x-auto">
                              <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-headings:font-semibold prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-table:text-sm prose-th:bg-muted/50 prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2 prose-th:text-left prose-table:border prose-th:border prose-td:border prose-li:text-muted-foreground prose-ul:my-2 prose-ol:my-2 prose-a:text-primary prose-h2:text-base prose-h3:text-sm prose-h2:mt-4 prose-h3:mt-3">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {locale === "zh"
                                    ? chapter.contentZh
                                    : chapter.contentEn}
                                </ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}

                  {/* Footer */}
                  <div className="border-t pt-6 pb-12 text-center text-xs text-muted-foreground">
                    <p>
                      {locale === "zh"
                        ? "本指南仅供参考，不构成法律建议。如有具体问题，请咨询专业顾问。"
                        : "This guide is for informational purposes only and does not constitute legal advice. Please consult with a professional advisor for specific questions."}
                    </p>
                    <p className="mt-1">
                      {locale === "zh" ? "最后更新：2026年第一季度" : "Last updated: Q1 2026"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>
                      {locale === "zh"
                        ? "该国家暂无指南内容"
                        : "No guide content available for this country yet"}
                    </p>
                  </div>
                </div>
              )}

              {/* Scroll to top button */}
              {showScrollTop && (
                <button
                  onClick={scrollToTop}
                  className="fixed bottom-6 right-6 h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors z-50"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
