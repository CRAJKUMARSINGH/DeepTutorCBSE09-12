import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { db, chaptersTable, practiceQuestionsTable } from '@workspace/db';
import { eq, and } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths relative to project root
const GUIDE_ROOT = path.resolve(__dirname, '../../');
const LESSONS_DIR = path.join(GUIDE_ROOT, 'artifacts/lesson-studies');
const QUESTIONS_DIR = path.join(GUIDE_ROOT, 'artifacts/questions');

async function seedLessons() {
  if (!fs.existsSync(LESSONS_DIR)) {
    console.log('ℹ Lessons directory does not exist. Skipping.');
    return;
  }

  const files = fs.readdirSync(LESSONS_DIR).filter(f => f.endsWith('.json') && f !== 'manifest.json');
  console.log(`📂 Found ${files.length} lesson JSON files.`);

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(LESSONS_DIR, file), 'utf-8'));
      const { title, subject_name, grade, lesson_study, concepts, visuals } = data;

      console.log(`📖 Seeding lesson: ${subject_name} Gr${grade} - ${title}`);

      // We need to find the subject first, but since we have a join query in Python, 
      // let's assume the chapters already exist (seeded by seed-hindi.py or similar).
      // If chapter id is present in JSON, use it. Otherwise find by title/subject/grade.
      
      let chapterId = data.id;

      if (!chapterId) {
        // Fallback: This is tricky because we need the subjectId.
        // For the pilot, we expect the chapter to exist or we might need to skip.
        console.warn(`  ⚠ No ID for ${title}, skipping (or implement lookup).`);
        continue;
      }

      await db.update(chaptersTable)
        .set({
          lessonStudy: lesson_study,
          conceptsJson: JSON.stringify(concepts),
          visualsJson: visuals ? JSON.stringify(visuals) : null
        })
        .where(eq(chaptersTable.id, chapterId));

      console.log(`  ✅ Updated chapter ${chapterId}`);
    } catch (error) {
      console.error(`  ❌ Error seeding ${file}:`, error);
    }
  }
}

async function seedQuestions() {
  if (!fs.existsSync(QUESTIONS_DIR)) {
    console.log('ℹ Questions directory does not exist. Skipping.');
    return;
  }

  const files = fs.readdirSync(QUESTIONS_DIR).filter(f => f.endsWith('.json') && f !== 'manifest.json');
  console.log(`📂 Found ${files.length} question JSON files.`);

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(QUESTIONS_DIR, file), 'utf-8'));
      const { chapter_id, questions } = data;

      if (!chapter_id) {
        console.warn(`  ⚠ No chapter_id for ${file}, skipping.`);
        continue;
      }

      console.log(`❓ Seeding ${questions.length} questions for chapter ${chapter_id}`);

      for (const q of questions) {
        // Check if question already exists to avoid duplicates (naive check by question text)
        const existing = await db.select()
          .from(practiceQuestionsTable)
          .where(and(
            eq(practiceQuestionsTable.chapterId, chapter_id),
            eq(practiceQuestionsTable.question, q.question)
          ))
          .limit(1);

        if (existing.length > 0) {
          // Update existing or skip
          await db.update(practiceQuestionsTable)
            .set({
              difficulty: q.difficulty,
              type: q.type,
              options: q.options,
              answer: q.answer,
              explanation: q.explanation,
              hint: q.hint,
              stepByStepSolution: q.stepByStepSolution
            })
            .where(eq(practiceQuestionsTable.id, existing[0].id));
        } else {
          await db.insert(practiceQuestionsTable).values({
            chapterId: chapter_id,
            question: q.question,
            difficulty: q.difficulty,
            type: q.type,
            options: q.options,
            answer: q.answer,
            explanation: q.explanation,
            hint: q.hint,
            stepByStepSolution: q.stepByStepSolution
          });
        }
      }
      console.log(`  ✅ Done for chapter ${chapter_id}`);
    } catch (error) {
      console.error(`  ❌ Error seeding ${file}:`, error);
    }
  }
}

async function main() {
  console.log('🚀 Starting content seeding...');
  await seedLessons();
  await seedQuestions();
  console.log('🏁 Seeding complete.');
  process.exit(0);
}

main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
