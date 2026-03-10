import { getDb } from "../db";
import { countryGuideChapters, countriesConfig } from "../../drizzle/schema";
import { eq, and, asc } from "drizzle-orm";
import { generateCountryGuidePdf } from "./htmlPdfService";

export const countryGuidePdfService = {
  generatePdf: async (countryCode: string, locale: "en" | "zh" = "en"): Promise<Buffer | null> => {
    const db = getDb();
    if (!db) throw new Error("Database connection failed");

    // 1. Fetch Country Info
    const country = await db.query.countriesConfig.findFirst({
      where: eq(countriesConfig.countryCode, countryCode)
    });
    if (!country) return null;

    // 2. Fetch Chapters
    const chapters = await db.query.countryGuideChapters.findMany({
      where: and(
        eq(countryGuideChapters.countryCode, countryCode),
        eq(countryGuideChapters.status, "published")
      ),
      orderBy: [asc(countryGuideChapters.sortOrder)]
    });
    if (chapters.length === 0) return null;

    // 3. Generate PDF using HTML engine (supports tables, bold, headings)
    return generateCountryGuidePdf(
      { countryCode: country.countryCode, countryName: country.countryName },
      chapters.map(ch => ({
        id: ch.id,
        titleEn: ch.titleEn,
        titleZh: ch.titleZh ?? undefined,
        contentEn: ch.contentEn ?? "",
        contentZh: ch.contentZh ?? undefined,
        chapterKey: ch.chapterKey,
        sortOrder: ch.sortOrder ?? 0,
      })),
      locale
    );
  }
};
