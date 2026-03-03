import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";
import os from "os";

// --- Constants ---
const DEFAULT_BRAND_COLOR = "#1B5E20";

/**
 * Merges multiple PDF buffers into a single PDF document.
 * 
 * @param buffers Array of PDF Buffers to merge
 * @param options Options for merging
 * @returns Promise<Buffer> Merged PDF Buffer
 */
export async function mergePdfs(buffers: Buffer[], options: {
  addPageNumbers?: boolean;
  metadata?: { title?: string; author?: string; subject?: string };
} = {}): Promise<Buffer> {
  if (buffers.length === 0) {
    throw new Error("No PDF buffers provided to merge");
  }

  // Create a new PDF Document
  const mergedPdf = await PDFDocument.create();

  // Set Metadata
  if (options.metadata) {
    if (options.metadata.title) mergedPdf.setTitle(options.metadata.title);
    if (options.metadata.author) mergedPdf.setAuthor(options.metadata.author);
    if (options.metadata.subject) mergedPdf.setSubject(options.metadata.subject);
  }
  mergedPdf.setCreator("GEA Platform (Powered by pdf-lib)");
  mergedPdf.setProducer("GEA Platform");

  let totalPageCount = 0;

  for (const buffer of buffers) {
    try {
      const pdf = await PDFDocument.load(buffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
        totalPageCount++;
      });
    } catch (err) {
      console.error("[ContentMerge] Failed to merge a PDF buffer:", err);
      // Skip this buffer but continue merging others if possible
      // In production, we might want to throw or return a partial result with warnings
    }
  }

  // Add Page Numbers (Optional)
  // Note: pdf-lib doesn't support complex layout easily, so we add simple text
  if (options.addPageNumbers) {
    const pages = mergedPdf.getPages();
    const { width, height } = pages[0].getSize();
    const fontSize = 10;
    
    pages.forEach((page, idx) => {
      // Skip cover page (usually page 1) if we assume cover is first
      if (idx === 0) return; 

      page.drawText(`${idx + 1} / ${totalPageCount}`, {
        x: width - 50,
        y: 20,
        size: fontSize,
        color: { type: 'RGB', r: 0.4, g: 0.4, b: 0.4 }, // Grey
      });
    });
  }

  const mergedPdfBytes = await mergedPdf.save();
  return Buffer.from(mergedPdfBytes);
}
