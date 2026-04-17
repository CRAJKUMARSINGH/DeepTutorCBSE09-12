import { Router, type IRouter } from "express";
import { eq, count, sql, and, inArray } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  subjectsTable,
  chaptersTable,
  keyConceptsTable,
  practiceQuestionsTable,
  chapterProgressTable,
} from "@workspace/db";
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
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/cbse/subjects", async (req, res): Promise<void> => {
  const query = ListSubjectsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
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

  const chapters = await db
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

  const [chapter] = await db
    .select({
      id: chaptersTable.id,
      subjectId: chaptersTable.subjectId,
      title: chaptersTable.title,
      chapterNumber: chaptersTable.chapterNumber,
      summary: chaptersTable.summary,
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
      keyConcepts,
      questionCount: questionCount ?? 0,
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

router.get("/cbse/dashboard", async (_req, res): Promise<void> => {
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

  const rows = await db
    .select({ chapterId: chapterProgressTable.chapterId })
    .from(chapterProgressTable)
    .where(eq(chapterProgressTable.sessionId, query.data.sessionId));

  res.json(GetProgressResponse.parse({ completedChapterIds: rows.map(r => r.chapterId) }));
});

router.post("/cbse/progress", async (req, res): Promise<void> => {
  const body = MarkChapterCompleteBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const { sessionId, chapterId } = body.data;

  const existing = await db
    .select()
    .from(chapterProgressTable)
    .where(and(eq(chapterProgressTable.sessionId, sessionId), eq(chapterProgressTable.chapterId, chapterId)));

  if (existing.length === 0) {
    await db.insert(chapterProgressTable).values({ sessionId, chapterId });
  }

  const rows = await db
    .select({ chapterId: chapterProgressTable.chapterId })
    .from(chapterProgressTable)
    .where(eq(chapterProgressTable.sessionId, sessionId));

  res.status(201).json(GetProgressResponse.parse({ completedChapterIds: rows.map(r => r.chapterId) }));
});

router.delete("/cbse/progress/:chapterId", async (req, res): Promise<void> => {
  const params = UnmarkChapterCompleteParams.safeParse(req.params);
  const queryParams = UnmarkChapterCompleteQueryParams.safeParse(req.query);
  if (!params.success || !queryParams.success) {
    res.status(400).json({ error: "Invalid parameters" });
    return;
  }

  const { chapterId } = params.data;
  const { sessionId } = queryParams.data;

  await db
    .delete(chapterProgressTable)
    .where(and(eq(chapterProgressTable.sessionId, sessionId), eq(chapterProgressTable.chapterId, chapterId)));

  const rows = await db
    .select({ chapterId: chapterProgressTable.chapterId })
    .from(chapterProgressTable)
    .where(eq(chapterProgressTable.sessionId, sessionId));

  res.json(GetProgressResponse.parse({ completedChapterIds: rows.map(r => r.chapterId) }));
});

export default router;
