import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { chaptersTable } from "./chapters";

export const practiceQuestionsTable = pgTable("practice_questions", {
  id: serial("id").primaryKey(),
  chapterId: integer("chapter_id").notNull().references(() => chaptersTable.id),
  question: text("question").notNull(),
  difficulty: text("difficulty").notNull(),
  type: text("type").notNull(),
  options: text("options").array(),
  answer: text("answer").notNull(),
  explanation: text("explanation").notNull(),
  hint: text("hint"),
  stepByStepSolution: text("step_by_step_solution"),
});

export const insertPracticeQuestionSchema = createInsertSchema(practiceQuestionsTable).omit({ id: true });
export type InsertPracticeQuestion = z.infer<typeof insertPracticeQuestionSchema>;
export type PracticeQuestion = typeof practiceQuestionsTable.$inferSelect;
