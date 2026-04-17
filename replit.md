# CBSE Study Guide

## Overview

An AI-powered study companion for Indian CBSE students in grades 9-12. Features subject browsing, chapter exploration with key concepts, practice questions, and an AI tutor powered by GPT-5.2 with CBSE-specific context.

## Architecture

pnpm workspace monorepo using TypeScript.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/cbse-tutor), Tailwind CSS, shadcn/ui, wouter routing
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **AI**: OpenAI GPT-5.2 via Replit AI Integrations (no API key needed)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

- `artifacts/cbse-tutor` — React frontend at path `/`
- `artifacts/api-server` — Express API server at path `/api`

## Features

- Dashboard with subject counts, chapter counts, practice question totals, and chapters-completed counter
- Subject browser filtered by grade (9-12)
- Chapter detail with key concepts, practice questions, and Mark Complete button
- Progress tracking: per-subject progress bar with checkmarks on completed chapters; session tracked via localStorage UUID stored in `chapter_progress` DB table
- AI Tutor chat with SSE streaming responses, CBSE-specific system prompt
- Practice questions (MCQ + short answer) with difficulty filter
- Full conversation history for AI tutor sessions
- Complete NCERT-aligned curriculum: 252 chapters across 16 subjects for Grades 9-12

## Key Files

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth)
- `lib/db/src/schema/` — Drizzle database schemas
- `artifacts/api-server/src/routes/cbse.ts` — CBSE curriculum API routes
- `artifacts/api-server/src/routes/openai.ts` — AI tutor routes
- `artifacts/cbse-tutor/src/` — React frontend

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database Tables

- `subjects` — CBSE subjects with grade, icon, color
- `chapters` — chapters per subject with chapter number and summary
- `key_concepts` — key concepts per chapter
- `practice_questions` — MCQ and short-answer questions with difficulty
- `conversations` — AI tutor conversation threads
- `messages` — messages within each conversation
- `chapter_progress` — chapter completion records keyed by sessionId (UUID from localStorage)

## Important Notes

- The `lib/api-spec/orval.config.ts` is configured without the `schemas` option to avoid type duplication conflicts
- After codegen, `lib/api-zod/src/index.ts` is overwritten to only export from `./generated/api`
- AI integration uses `AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY` env vars (auto-provisioned by Replit)
