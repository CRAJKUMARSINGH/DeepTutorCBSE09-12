import { pgTable, text, serial, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { chaptersTable } from "./chapters";

export const chapterVideosTable = pgTable("chapter_videos", {
  id: serial("id").primaryKey(),
  chapterId: integer("chapter_id").notNull().references(() => chaptersTable.id),
  youtubeVideoId: text("youtube_video_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  displayOrder: integer("display_order").notNull().default(0),
}, (table) => [
  uniqueIndex("chapter_videos_chapter_id_youtube_video_id_idx").on(table.chapterId, table.youtubeVideoId)
]);

export const insertChapterVideoSchema = createInsertSchema(chapterVideosTable).omit({ id: true });
export type InsertChapterVideo = z.infer<typeof insertChapterVideoSchema>;
export type ChapterVideo = typeof chapterVideosTable.$inferSelect;
