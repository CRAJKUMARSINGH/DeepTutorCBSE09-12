import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { subjectsTable } from "./subjects";

export const chaptersTable = pgTable("chapters", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull().references(() => subjectsTable.id),
  title: text("title").notNull(),
  chapterNumber: integer("chapter_number").notNull(),
  summary: text("summary").notNull(),
  lessonStudy: text("lesson_study"),
  conceptsJson: text("concepts_json"),
  visualsJson: text("visuals_json"),
});

export const insertChapterSchema = createInsertSchema(chaptersTable).omit({ id: true });
export type InsertChapter = z.infer<typeof insertChapterSchema>;
export type Chapter = typeof chaptersTable.$inferSelect;
