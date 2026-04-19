import { Router, type IRouter } from "express";
import { eq, count, sql, and } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  subjectsTable,
  chaptersTable,
  keyConceptsTable,
  practiceQuestionsTable,
  chapterProgressTable,
  chapterVideosTable,
} from "@workspace/db";
import fs from "fs";
import path from "path";
import {
  ListSubjectsQueryParams,
  ListSubjectsResponse,
  ListChaptersParams,
  ListChaptersResponse,
  GetChapterParams,
  GetChapterResponse,
  ListPracticeQuestionsParams,
  ListPracticeQuestionsQueryParams,
  ListPracticeQuestionsResponse,
  GetDashboardResponse,
  GetProgressQueryParams,
  GetProgressResponse,
  MarkChapterCompleteBody,
  UnmarkChapterCompleteParams,
  UnmarkChapterCompleteQueryParams,
  GetContentStatsResponse,
  ListChapterVideosParams,
  ListChapterVideosResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const IS_SANDBOX = !process.env.DATABASE_URL;
const MOCK_DB_PATH = path.join(__dirname, "..", "data", "mock-db.json");
const ARTIFACTS_DIR = path.join(__dirname, "..", "..", "..", "artifacts");

function loadMockDb() {
  if (!fs.existsSync(MOCK_DB_PATH)) return { subjects: [], chapters: [] };
  return JSON.parse(fs.readFileSync(MOCK_DB_PATH, "utf-8"));
}

router.get("/cbse/subjects", async (req, res): Promise<void> => {
  const query = ListSubjectsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  if (IS_SANDBOX) {
    const mock = loadMockDb();
    let subjects = mock.subjects;
    if (query.data.grade) {
      subjects = subjects.filter((s: any) => s.grade === query.data.grade);
    }
    res.json(ListSubjectsResponse.parse(subjects.map((s: any) => ({ ...s, chapterCount: 1 }))));
    return;
  }

  const conditions = query.data.grade
    ? eq(subjectsTable.grade, query.data.grade)
    : undefined;

  const subjects = await db
    .select({
      id: subjectsTable.id,
      name: subjectsTable.name,
      grade: subjectsTable.grade,
      description: subjectsTable.description,
      icon: subjectsTable.icon,
      color: subjectsTable.color,
      chapterCount: count(chaptersTable.id),
    })
    .from(subjectsTable)
    .leftJoin(chaptersTable, eq(chaptersTable.subjectId, subjectsTable.id))
    .where(conditions)
    .groupBy(subjectsTable.id)
    .orderBy(subjectsTable.grade, subjectsTable.name);

  res.json(ListSubjectsResponse.parse(subjects));
});

router.get("/cbse/subjects/:subjectId/chapters", async (req, res): Promise<void> => {
  const params = ListChaptersParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  if (IS_SANDBOX) {
    const mock = loadMockDb();
    const chapters = mock.chapters.filter((c: any) => c.subjectId === params.data.subjectId);
    res.json(ListChaptersResponse.parse(chapters.map((c: any) => ({ ...c, questionCount: 10, lessonStudy: "" }))));
    return;
  }

  const chapters = await db
    .select({
      id: chaptersTable.id,
      subjectId: chaptersTable.subjectId,
      title: chaptersTable.title,
      chapterNumber: chaptersTable.chapterNumber,
      summary: chaptersTable.summary,
      lessonStudy: chaptersTable.lessonStudy,
      conceptsJson: chaptersTable.conceptsJson,
      questionCount: count(practiceQuestionsTable.id),
    })
    .from(chaptersTable)
    .leftJoin(
      practiceQuestionsTable,
      eq(practiceQuestionsTable.chapterId, chaptersTable.id)
    )
    .where(eq(chaptersTable.subjectId, params.data.subjectId))
    .groupBy(chaptersTable.id)
    .orderBy(chaptersTable.chapterNumber);

  res.json(ListChaptersResponse.parse(chapters));
});

router.get("/cbse/chapters/:chapterId", async (req, res): Promise<void> => {
  const params = GetChapterParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  if (IS_SANDBOX) {
    const mock = loadMockDb();
    const chapter = mock.chapters.find((c: any) => c.id === params.data.chapterId);
    if (!chapter) {
      res.status(404).json({ error: "Chapter not found in sandbox" });
      return;
    }

    const lessonPath = path.join(ARTIFACTS_DIR, "lesson-studies", chapter.lessonStudyFile);
    let detailedData: any = {};
    if (fs.existsSync(lessonPath)) {
      detailedData = JSON.parse(fs.readFileSync(lessonPath, "utf-8"));
    }

    res.json(
      GetChapterResponse.parse({
        id: chapter.id,
        subjectId: chapter.subjectId,
        title: chapter.title,
        chapterNumber: chapter.chapterNumber,
        summary: chapter.summary,
        lessonStudy: detailedData.lesson_study || null,
        conceptsJson: detailedData.concepts ? JSON.stringify(detailedData.concepts) : null,
        keyConcepts: detailedData.concepts || [],
        questionCount: 10,
        visuals: [],
      })
    );
    return;
  }

  const [chapter] = await db
    .select({
      id: chaptersTable.id,
      subjectId: chaptersTable.subjectId,
      title: chaptersTable.title,
      chapterNumber: chaptersTable.chapterNumber,
      summary: chaptersTable.summary,
      lessonStudy: chaptersTable.lessonStudy,
      conceptsJson: chaptersTable.conceptsJson,
    })
    .from(chaptersTable)
    .where(eq(chaptersTable.id, params.data.chapterId));

  if (!chapter) {
    res.status(404).json({ error: "Chapter not found" });
    return;
  }

  const keyConcepts = await db
    .select()
    .from(keyConceptsTable)
    .where(eq(keyConceptsTable.chapterId, params.data.chapterId));

  const [{ questionCount }] = await db
    .select({ questionCount: count(practiceQuestionsTable.id) })
    .from(practiceQuestionsTable)
    .where(eq(practiceQuestionsTable.chapterId, params.data.chapterId));

  res.json(
    GetChapterResponse.parse({
      ...chapter,
      lessonStudy: chapter.lessonStudy ?? null,
      conceptsJson: chapter.conceptsJson ?? null,
      keyConcepts,
      questionCount: Number(questionCount ?? 0),
      visuals: [],
    })
  );
});

router.get("/cbse/chapters/:chapterId/questions", async (req, res): Promise<void> => {
  const params = ListPracticeQuestionsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const query = ListPracticeQuestionsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  if (IS_SANDBOX) {
    const mock = loadMockDb();
    const chapter = mock.chapters.find((c: any) => c.id === params.data.chapterId);
    if (!chapter) {
      res.json(ListPracticeQuestionsResponse.parse([]));
      return;
    }

    const questionsPath = path.join(ARTIFACTS_DIR, "questions", chapter.lessonStudyFile.replace(".json", "_questions.json"));
    if (fs.existsSync(questionsPath)) {
      const questionsData = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));
      let questions = questionsData.questions || [];
      if (query.data.difficulty) {
        questions = questions.filter((q: any) => q.difficulty === query.data.difficulty);
      }
      res.json(ListPracticeQuestionsResponse.parse(questions.map((q: any, i: number) => ({ id: i + 1, chapterId: chapter.id, ...q }))));
      return;
    }
    res.json(ListPracticeQuestionsResponse.parse([]));
    return;
  }

  const conditions = [eq(practiceQuestionsTable.chapterId, params.data.chapterId)];
  if (query.data.difficulty) {
    conditions.push(eq(practiceQuestionsTable.difficulty, query.data.difficulty));
  }

  const questions = await db
    .select()
    .from(practiceQuestionsTable)
    .where(sql`${conditions.reduce((acc, c) => sql`${acc} AND ${c}`)}`)
    .orderBy(practiceQuestionsTable.difficulty, practiceQuestionsTable.id);

  res.json(ListPracticeQuestionsResponse.parse(questions));
});


const ChapterVideosPathParams = ListChapterVideosParams.extend({
  chapterId: ListChapterVideosParams.shape.chapterId.refine((v) => v > 0, {
    message: "chapterId must be a positive integer",
  }),
});

router.get("/cbse/chapters/:chapterId/videos", async (req, res): Promise<void> => {
  const params = ChapterVideosPathParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  if (IS_SANDBOX) {
    res.json(ListChapterVideosResponse.parse([]));
    return;
  }

  const videos = await db
    .select()
    .from(chapterVideosTable)
    .where(eq(chapterVideosTable.chapterId, params.data.chapterId))
    .orderBy(chapterVideosTable.displayOrder);

  res.json(ListChapterVideosResponse.parse(videos));
});
router.get("/cbse/content-stats", async (_req, res): Promise<void> => {
  if (IS_SANDBOX) {
    const mock = loadMockDb();
    res.json(GetContentStatsResponse.parse({
      totalChapters: 252,
      chaptersWithLesson: mock.chapters.length,
      chaptersWithQuestions: mock.chapters.length,
      totalQuestions: mock.chapters.length * 10,
      coveragePercent: (mock.chapters.length / 252) * 100
    }));
    return;
  }

  const [totalChaptersResult] = await db
    .select({ count: count() })
    .from(chaptersTable);

  const [lessonsResult] = await db
    .select({ count: count() })
    .from(chaptersTable)
    .where(sql`${chaptersTable.lessonStudy} IS NOT NULL AND ${chaptersTable.lessonStudy} != ''`);

  const [chaptersWithQuestionsResult] = await db
    .select({ count: sql<number>`count(distinct ${practiceQuestionsTable.chapterId})` })
    .from(practiceQuestionsTable);

  const [totalQuestionsResult] = await db
    .select({ count: count() })
    .from(practiceQuestionsTable);

  const totalChapters = totalChaptersResult?.count ?? 0;
  const chaptersWithLesson = lessonsResult?.count ?? 0;
  const chaptersWithQuestions = Number(chaptersWithQuestionsResult?.count ?? 0);
  const totalQuestions = totalQuestionsResult?.count ?? 0;

  res.json(GetContentStatsResponse.parse({
    totalChapters,
    chaptersWithLesson,
    chaptersWithQuestions,
    totalQuestions,
    coveragePercent: totalChapters > 0 ? (chaptersWithLesson / totalChapters) * 100 : 0
  }));
});

router.get("/cbse/dashboard", async (_req, res): Promise<void> => {
  if (IS_SANDBOX) {
    const mock = loadMockDb();
    res.json(GetDashboardResponse.parse({
      totalSubjects: mock.subjects.length,
      totalChapters: mock.chapters.length,
      totalQuestions: mock.chapters.length * 10,
      gradeSummaries: [
        { grade: 9, subjectCount: mock.subjects.filter((s:any)=>s.grade===9).length, totalChapters: mock.chapters.filter((c:any)=>mock.subjects.find((s:any)=>s.id===c.subjectId)?.grade===9).length },
        { grade: 10, subjectCount: mock.subjects.filter((s:any)=>s.grade===10).length, totalChapters: 0 },
      ],
      recentChapters: mock.chapters.map((c: any) => ({ ...c, questionCount: 10 })),
    }));
    return;
  }

  const [subjectCountResult] = await db
    .select({ count: count() })
    .from(subjectsTable);

  const [chapterCountResult] = await db
    .select({ count: count() })
    .from(chaptersTable);

  const [questionCountResult] = await db
    .select({ count: count() })
    .from(practiceQuestionsTable);

  const gradeSummaries = await db
    .select({
      grade: subjectsTable.grade,
      subjectCount: count(subjectsTable.id),
    })
    .from(subjectsTable)
    .groupBy(subjectsTable.grade)
    .orderBy(subjectsTable.grade);

  const gradeSummariesWithChapters = await Promise.all(
    gradeSummaries.map(async (gs) => {
      const [{ totalChapters }] = await db
        .select({ totalChapters: count(chaptersTable.id) })
        .from(chaptersTable)
        .innerJoin(subjectsTable, eq(chaptersTable.subjectId, subjectsTable.id))
        .where(eq(subjectsTable.grade, gs.grade));
      return { ...gs, totalChapters: totalChapters ?? 0 };
    })
  );

  const recentChapters = await db
    .select({
      id: chaptersTable.id,
      subjectId: chaptersTable.subjectId,
      title: chaptersTable.title,
      chapterNumber: chaptersTable.chapterNumber,
      summary: chaptersTable.summary,
      questionCount: count(practiceQuestionsTable.id),
    })
    .from(chaptersTable)
    .leftJoin(
      practiceQuestionsTable,
      eq(practiceQuestionsTable.chapterId, chaptersTable.id)
    )
    .groupBy(chaptersTable.id)
    .orderBy(chaptersTable.id)
    .limit(6);

  res.json(
    GetDashboardResponse.parse({
      totalSubjects: subjectCountResult?.count ?? 0,
      totalChapters: chapterCountResult?.count ?? 0,
      totalQuestions: questionCountResult?.count ?? 0,
      gradeSummaries: gradeSummariesWithChapters,
      recentChapters,
    })
  );
});

router.get("/cbse/progress", async (req, res): Promise<void> => {
  const query = GetProgressQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  if (IS_SANDBOX) {
    res.json(GetProgressResponse.parse({ completedChapterIds: [] }));
    return;
  }
  const rows = await db
    .select({ chapterId: chapterProgressTable.chapterId })
    .from(chapterProgressTable)
    .where(eq(chapterProgressTable.sessionId, query.data.sessionId));
  res.json(GetProgressResponse.parse({ completedChapterIds: rows.map(r => r.chapterId) }));
});

export default router;
