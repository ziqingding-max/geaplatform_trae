import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { countryGuideChapters } from "../../drizzle/schema";
import { eq, and, asc } from "drizzle-orm";

export const countryGuideRouter = router({
  listChapters: protectedProcedure
    .input(z.object({ countryCode: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      if (!db) throw new Error("Database connection failed");
      
      return await db
        .select()
        .from(countryGuideChapters)
        .where(
          and(
            eq(countryGuideChapters.countryCode, input.countryCode),
            eq(countryGuideChapters.status, "published")
          )
        )
        .orderBy(asc(countryGuideChapters.sortOrder));
    }),

  getChapter: protectedProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const db = getDb();
      if (!db) throw new Error("Database connection failed");
      
      const chapter = await db.query.countryGuideChapters.findFirst({
        where: eq(countryGuideChapters.id, input)
      });
      return chapter;
    }),
    
  // Admin only
  upsertChapter: protectedProcedure
    .input(z.object({
        id: z.number().optional(),
        countryCode: z.string(),
        part: z.number(),
        chapterKey: z.string(),
        titleEn: z.string(),
        titleZh: z.string(),
        contentEn: z.string(),
        contentZh: z.string(),
        sortOrder: z.number().default(0),
        version: z.string().default("2026-Q1"),
        status: z.enum(["draft", "review", "published", "archived"]).default("draft")
    }))
    .mutation(async ({ input }) => {
        const db = getDb();
        if (!db) throw new Error("Database connection failed");
        
        if (input.id) {
            await db.update(countryGuideChapters)
                .set({
                    ...input,
                    updatedAt: new Date()
                })
                .where(eq(countryGuideChapters.id, input.id));
            return { id: input.id };
        } else {
            const [res] = await db.insert(countryGuideChapters).values(input).returning({ id: countryGuideChapters.id });
            return res;
        }
    })
});
