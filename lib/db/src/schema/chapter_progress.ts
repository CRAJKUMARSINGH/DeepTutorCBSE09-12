import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { chaptersTable } from "./chapters";

export const chapterProgressTable = pgTable("chapter_progress", {
  id: serial("id").primaryKey(),
  chapterId: integer("chapter_id").notNull().references(() => chaptersTable.id),
  sessionId: text("session_id").notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

export type ChapterProgress = typeof chapterProgressTable.$inferSelect;
