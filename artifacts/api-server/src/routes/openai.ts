import { Router, type IRouter } from "express";
import { resolveChapter } from "../data/cbse-syllabus";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { conversations as conversationsTable, messages as messagesTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  CreateOpenaiConversationBody,
  GetOpenaiConversationParams,
  DeleteOpenaiConversationParams,
  ListOpenaiMessagesParams,
  SendOpenaiMessageParams,
  SendOpenaiMessageBody,
  ListOpenaiConversationsResponse,
  GetOpenaiConversationResponse,
  ListOpenaiMessagesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const IS_SANDBOX = !process.env.DATABASE_URL;

const CBSE_SYSTEM_PROMPT = `You are DeepTutor, an AI tutor exclusively for CBSE students in Classes 9, 10, 11, and 12.

Your job:
- Teach strictly according to CBSE and NCERT curriculum
- If the student has not mentioned their class, subject, or chapter, ask for it before answering
- Give step-by-step explanations for Maths and Science problems
- For theory subjects (History, Geography, Civics, Economics, English, Hindi), provide concise, exam-ready answers
- Use simple language first, then offer a deeper explanation if the student wants more
- Stay within CBSE syllabus unless the student explicitly asks for extension topics
- When relevant, structure your response as:
  1. Concept explanation
  2. Example (preferably from Indian context)
  3. Likely exam question on this topic
  4. Short revision notes
- After explaining a concept, ask one check-for-understanding question to encourage active learning
- Reference NCERT textbooks and CBSE board patterns when helpful
- Be patient, encouraging, and supportive — learning through mistakes is normal
- Never behave like a generic chatbot; always behave like a dedicated, patient CBSE tutor
- If asked about topics outside CBSE Classes 9–12 syllabus, politely redirect to relevant CBSE content`;

router.get("/openai/conversations", async (_req, res): Promise<void> => {
  if (IS_SANDBOX) {
    res.json(ListOpenaiConversationsResponse.parse([]));
    return;
  }

  const conversations = await db
    .select()
    .from(conversationsTable)
    .orderBy(conversationsTable.createdAt);

  res.json(ListOpenaiConversationsResponse.parse(conversations));
});

router.post("/openai/conversations", async (req, res): Promise<void> => {
  const parsed = CreateOpenaiConversationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [conversation] = await db
    .insert(conversationsTable)
    .values({ title: parsed.data.title })
    .returning();

  res.status(201).json(conversation);
});

router.get("/openai/conversations/:id", async (req, res): Promise<void> => {
  const params = GetOpenaiConversationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [conversation] = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, params.data.id));

  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const msgs = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, params.data.id))
    .orderBy(messagesTable.createdAt);

  res.json(GetOpenaiConversationResponse.parse({ ...conversation, messages: msgs }));
});

router.delete("/openai/conversations/:id", async (req, res): Promise<void> => {
  const params = DeleteOpenaiConversationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(conversationsTable)
    .where(eq(conversationsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/openai/conversations/:id/messages", async (req, res): Promise<void> => {
  const params = ListOpenaiMessagesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const msgs = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, params.data.id))
    .orderBy(messagesTable.createdAt);

  res.json(ListOpenaiMessagesResponse.parse(msgs));
});

router.post("/openai/conversations/:id/messages", async (req, res): Promise<void> => {
  const params = SendOpenaiMessageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = SendOpenaiMessageBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [conversation] = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, params.data.id));

  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  if (IS_SANDBOX) {
      const history = await db
        .select()
        .from(messagesTable)
        .where(eq(messagesTable.conversationId, params.data.id))
        .orderBy(messagesTable.createdAt);
  }
  
  const history = IS_SANDBOX ? [] : await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, params.data.id))
    .orderBy(messagesTable.createdAt);

  await db.insert(messagesTable).values({
    conversationId: params.data.id,
    role: "user",
    content: body.data.content,
  });

  // Auto-detect class/subject/chapter from message and inject syllabus context
  const msg = body.data.content;
  const gradeMatch = msg.match(/class\s*(9|10|11|12)|grade\s*(9|10|11|12)/i);
  const chapterMatch = msg.match(/chapter\s*(\d+)/i);
  const subjectMatch = msg.match(/\b(science|maths|math|mathematics|physics|chemistry|biology|english|hindi|social science|history|geography|civics|economics)\b/i);

  let syllabusContext = "";
  if (gradeMatch && chapterMatch && subjectMatch) {
    const grade = parseInt(gradeMatch[1] || gradeMatch[2]);
    const chapter = parseInt(chapterMatch[1]);
    const subject = subjectMatch[1].toLowerCase().replace(/^math$/, "maths").replace(/^mathematics$/, "maths");
    const chapterName = resolveChapter(grade, subject, chapter);
    if (chapterName) {
      syllabusContext = `\n\n[CONTEXT: Student is asking about Class ${grade} ${subject.charAt(0).toUpperCase() + subject.slice(1)}, Chapter ${chapter}: "${chapterName}". Teach this chapter thoroughly.]`;
    }
  }

  const chatMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: CBSE_SYSTEM_PROMPT + syllabusContext },
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: body.data.content },
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";

  const stream = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: chatMessages,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      fullResponse += content;
      res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }
  }

  if (!IS_SANDBOX) {
    await db.insert(messagesTable).values({
      conversationId: params.data.id,
      role: "assistant",
      content: fullResponse,
    });
  }

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

export default router;
