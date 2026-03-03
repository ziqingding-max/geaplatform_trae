import { getDb } from "../db";
import { countryGuideChapters, countriesConfig } from "../../drizzle/schema";
import { eq, and, asc } from "drizzle-orm";
import { createBrandedPdfDocument, drawCoverPage, drawHeader, drawFooter, drawMarkdown } from "./pdfBrandTemplateService";

export const countryGuidePdfService = {
  generatePdf: async (countryCode: string): Promise<Buffer | null> => {
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

    // 3. Create PDF
    const { doc, cjkFontPath } = await createBrandedPdfDocument();

    return new Promise<Buffer>((resolve, reject) => {
      const buffers: Buffer[] = [];
      doc.on("data", chunk => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      // Cover Page
      drawCoverPage(
        doc,
        "Country Guide",
        country.countryName,
        new Date().toLocaleDateString(),
        cjkFontPath
      );

      // Content Pages
      let pageNum = 1;

      // Table of Contents (Simple)
      drawHeader(doc, `Country Guide: ${country.countryName}`);
      doc.fontSize(16).font("Helvetica-Bold").text("Table of Contents");
      doc.moveDown();
      
      chapters.forEach((chapter, index) => {
        doc.fontSize(12).font("Helvetica").text(`${index + 1}. ${chapter.titleEn}`);
        doc.moveDown(0.5);
      });
      
      drawFooter(doc, pageNum++);
      doc.addPage();

      // Chapters
      chapters.forEach((chapter, index) => {
        drawHeader(doc, `Country Guide: ${country.countryName}`);
        
        // Chapter Title
        doc.fontSize(18).font("Helvetica-Bold").fillColor("#1B5E20");
        doc.text(chapter.titleEn);
        doc.moveDown();

        // Content
        drawMarkdown(doc, chapter.contentEn, cjkFontPath);
        
        drawFooter(doc, pageNum++);
        
        if (index < chapters.length - 1) {
          doc.addPage();
        }
      });

      doc.end();
    });
  }
};
