import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { chaptersTable } from "./chapters";

export const keyConceptsTable = pgTable("key_concepts", {
  id: serial("id").primaryKey(),
  chapterId: integer("chapter_id").notNull().references(() => chaptersTable.id),
  title: text("title").notNull(),
  explanation: text("explanation").notNull(),
});

export const insertKeyConceptSchema = createInsertSchema(keyConceptsTable).omit({ id: true });
export type InsertKeyConcept = z.infer<typeof insertKeyConceptSchema>;
export type KeyConcept = typeof keyConceptsTable.$inferSelect;
