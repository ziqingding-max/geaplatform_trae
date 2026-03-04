import { useState } from "react";
import { portalTrpc } from "@/lib/portalTrpc";
import { useI18n } from "@/contexts/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, MapPin } from "lucide-react";
import PortalLayout from "@/components/PortalLayout";

export default function CountryGuide() {
  const { t, locale } = useI18n();
  const [countryCode, setCountryCode] = useState<string>("CN"); // Default to China for demo

  const { data: countries } = portalTrpc.toolkit.listCountries.useQuery();
  const { data: chapters } = portalTrpc.toolkit.listGuideChapters.useQuery({ countryCode });

  // Group chapters by part (1: Employment, 2: Business)
  const part1Chapters = chapters?.filter(c => c.part === 1) || [];
  const part2Chapters = chapters?.filter(c => c.part === 2) || [];

  return (
    <PortalLayout title={t("nav.countryGuide")}>
      <div className="p-6 h-[calc(100vh-3.5rem)] flex flex-col space-y-6">
        <div className="flex justify-between items-center flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("nav.countryGuide")}</h1>
            <p className="text-muted-foreground">Comprehensive guides for global expansion.</p>
          </div>
          <div className="w-[200px]">
            <Select value={countryCode} onValueChange={setCountryCode}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries?.map((c) => (
                  <SelectItem key={c.countryCode} value={c.countryCode}>
                    {c.countryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <Tabs defaultValue="employment" className="h-full flex flex-col">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="employment">Employment Guide</TabsTrigger>
              <TabsTrigger value="business">Business Guide</TabsTrigger>
            </TabsList>
            
            <TabsContent value="employment" className="flex-1 min-h-0 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                <ScrollArea className="md:col-span-1 h-full rounded-md border p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Chapters
                  </h3>
                  <div className="space-y-2">
                    {part1Chapters.map((chapter) => (
                      <a 
                        key={chapter.id} 
                        href={`#chapter-${chapter.id}`}
                        className="block p-2 text-sm rounded hover:bg-muted transition-colors"
                      >
                        {locale === "zh" ? chapter.titleZh : chapter.titleEn}
                      </a>
                    ))}
                    {part1Chapters.length === 0 && <p className="text-sm text-muted-foreground">No chapters available.</p>}
                  </div>
                </ScrollArea>
                
                <ScrollArea className="md:col-span-2 h-full rounded-md border p-6 bg-white/50 backdrop-blur-sm">
                  <div className="space-y-8 max-w-3xl mx-auto">
                    {part1Chapters.map((chapter) => (
                      <div key={chapter.id} id={`chapter-${chapter.id}`} className="scroll-mt-4">
                        <h2 className="text-xl font-bold mb-4 text-primary">
                          {locale === "zh" ? chapter.titleZh : chapter.titleEn}
                        </h2>
                        <div className="prose dark:prose-invert max-w-none text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                          {locale === "zh" ? chapter.contentZh : chapter.contentEn}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="business" className="flex-1 min-h-0 mt-4">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                <ScrollArea className="md:col-span-1 h-full rounded-md border p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Chapters
                  </h3>
                  <div className="space-y-2">
                    {part2Chapters.map((chapter) => (
                      <a 
                        key={chapter.id} 
                        href={`#chapter-${chapter.id}`}
                        className="block p-2 text-sm rounded hover:bg-muted transition-colors"
                      >
                        {locale === "zh" ? chapter.titleZh : chapter.titleEn}
                      </a>
                    ))}
                    {part2Chapters.length === 0 && <p className="text-sm text-muted-foreground">No chapters available.</p>}
                  </div>
                </ScrollArea>
                
                <ScrollArea className="md:col-span-2 h-full rounded-md border p-6 bg-white/50 backdrop-blur-sm">
                  <div className="space-y-8 max-w-3xl mx-auto">
                    {part2Chapters.map((chapter) => (
                      <div key={chapter.id} id={`chapter-${chapter.id}`} className="scroll-mt-4">
                        <h2 className="text-xl font-bold mb-4 text-primary">
                          {locale === "zh" ? chapter.titleZh : chapter.titleEn}
                        </h2>
                        <div className="prose dark:prose-invert max-w-none text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                          {locale === "zh" ? chapter.contentZh : chapter.contentEn}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PortalLayout>
  );
}
