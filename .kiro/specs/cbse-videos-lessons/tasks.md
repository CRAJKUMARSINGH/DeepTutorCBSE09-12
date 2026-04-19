# Implementation Plan: Videos and Lessons for CBSE 9-12 Study Guide

## Overview

Implement YouTube video embeds and lesson study enhancements across the full stack: DB schema → OpenAPI spec → Orval codegen → Express routes → React UI. Each task builds incrementally on the previous, ending with all components wired together.

## Tasks

- [x] 1. Add `chapter_videos` Drizzle schema and DB migration
  - Create `lib/db/src/schema/chapter_videos.ts` with the `chapterVideosTable` definition (columns: `id`, `chapterId`, `youtubeVideoId`, `title`, `description`, `displayOrder`) and a unique constraint on `(chapter_id, youtube_video_id)`
  - Export `chapterVideosTable`, `insertChapterVideoSchema`, `InsertChapterVideo`, and `ChapterVideo` types from the schema file
  - Re-export `chapterVideosTable` from `lib/db/src/index.ts` alongside existing table exports
  - Run `pnpm --filter @workspace/db run push` to apply the migration to the DB
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Update OpenAPI spec with `ChapterVideo` schema and new endpoint
  - Add `ChapterVideo` schema to `lib/api-spec/openapi.yaml` components with fields: `id`, `chapterId`, `youtubeVideoId`, `title`, `description` (nullable), `displayOrder`
  - Add `videos` array field (items: `$ref: ChapterVideo`) to the `ChapterDetail` schema
  - Add `GET /cbse/chapters/{chapterId}/videos` path with operationId `listChapterVideos`, returning array of `ChapterVideo`, with 400 on invalid `chapterId`
  - Extend `ContentStats` schema with `chaptersWithVideos` (integer) and `totalVideos` (integer) fields
  - _Requirements: 2.1, 2.5, 2.6, 6.1_

- [x] 3. Run Orval codegen to regenerate API hooks and Zod validators
  - Run `pnpm --filter @workspace/api-spec run codegen` to regenerate `@workspace/api-client-react` and `@workspace/api-zod` from the updated spec
  - Verify that `useListChapterVideos`, `ListChapterVideosResponse`, and updated `GetContentStatsResponse` / `GetChapterResponse` types are present in the generated output
  - _Requirements: 2.1, 2.5, 2.6_

- [x] 4. Implement `GET /cbse/chapters/:chapterId/videos` API route
  - In `artifacts/api-server/src/routes/cbse.ts`, import `chapterVideosTable` from `@workspace/db`
  - Add a Zod schema for the path param that validates `chapterId` is a positive integer; return HTTP 400 with `ApiError` body on failure
  - Query `chapterVideosTable` with `eq(chapterVideosTable.chapterId, chapterId)` ordered by `chapterVideosTable.displayOrder` ascending
  - Return the result array (empty array when no rows) with HTTP 200, parsed through the generated Zod response schema
  - Add sandbox branch that returns an empty array
  - _Requirements: 2.2, 2.3, 2.4_

  - [ ]* 4.1 Write property test: invalid chapterId returns HTTP 400
    - **Property 3: Invalid chapterId returns HTTP 400**
    - Use `fc.oneof(fc.constant(0), fc.integer({ max: -1 }), fc.string())` as generator
    - Assert every generated value causes the route to return HTTP 400 with `ApiError` shape
    - Tag: `// Feature: cbse-videos-lessons, Property 3`
    - **Validates: Requirements 2.4**

  - [ ]* 4.2 Write property test: videos returned in displayOrder ascending
    - **Property 2: Videos returned in display_order ascending**
    - Insert N videos with arbitrary `displayOrder` values, call the endpoint, assert response is sorted ascending
    - Tag: `// Feature: cbse-videos-lessons, Property 2`
    - **Validates: Requirements 1.4, 2.2**

- [ ] 5. Extend `GET /cbse/chapters/:chapterId` to include `videos` array
  - In the existing chapter detail route handler, after fetching `keyConcepts`, also query `chapterVideosTable` for the chapter's videos ordered by `displayOrder`
  - Include the `videos` array in the `GetChapterResponse.parse(...)` call (empty array when none)
  - Update the sandbox branch to include `videos: []` in the mock response
  - _Requirements: 2.6_

  - [ ]* 5.1 Write property test: ChapterVideo response shape completeness
    - **Property 4: ChapterVideo response shape completeness**
    - For any `ChapterVideo` returned by the API, assert all required fields are present with correct types and `description` is string or null
    - Tag: `// Feature: cbse-videos-lessons, Property 4`
    - **Validates: Requirements 2.5**

- [ ] 6. Extend `GET /cbse/content-stats` with video counts
  - Add two DB queries to the content-stats route: `count(distinct chapterVideosTable.chapterId)` for `chaptersWithVideos` and `count()` from `chapterVideosTable` for `totalVideos`
  - Include both values in the `GetContentStatsResponse.parse(...)` call
  - Update the sandbox branch to include `chaptersWithVideos: 0, totalVideos: 0`
  - _Requirements: 6.2, 6.3_

  - [ ]* 6.1 Write property test: content stats video counts are consistent
    - **Property 10: Content stats video counts are consistent**
    - Insert a known set of video records, call the endpoint, assert `chaptersWithVideos` equals distinct chapter count and `totalVideos` equals total row count
    - Tag: `// Feature: cbse-videos-lessons, Property 10`
    - **Validates: Requirements 6.2, 6.3**

- [ ] 7. Checkpoint — Ensure all API tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement YouTube video ID validation helper
  - Create a shared Zod refinement `youtubeVideoIdSchema` (`.regex(/^[A-Za-z0-9_-]{11}$/)`) in a utility file or inline in the route file
  - Apply this refinement in the videos route handler for any write path and in the seed script
  - _Requirements: 8.1, 8.2_

  - [ ]* 8.1 Write property test: YouTube video ID validation accepts valid and rejects invalid
    - **Property 11: YouTube video ID validation accepts valid and rejects invalid**
    - Use `fc.stringMatching(/^[A-Za-z0-9_-]{11}$/)` for valid cases and `fc.string()` filtered to non-matching for invalid cases
    - Assert validator returns success/failure accordingly
    - Tag: `// Feature: cbse-videos-lessons, Property 11`
    - **Validates: Requirements 8.1, 8.2**

- [ ] 9. Implement `seed-videos.ts` script
  - Create `artifacts/api-server/src/scripts/seed-videos.ts`
  - Read JSON file path from `process.argv[2]`; exit with non-zero code and stderr message if missing or invalid JSON
  - Parse each record, validate `youtubeVideoId` against `/^[A-Za-z0-9_-]{11}$/`; skip invalid records with a stderr warning and count them as skipped
  - Bulk insert using Drizzle `onConflictDoNothing()` targeting the unique constraint on `(chapter_id, youtube_video_id)`
  - Print `Inserted: N, Skipped: M` to stdout on completion
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 9.1 Write property test: seed script idempotency
    - **Property 12: Seed script idempotency**
    - Run seed script twice with the same `fc.array(validVideoRecord)` input; assert DB state is identical after both runs (no duplicates, no errors)
    - Tag: `// Feature: cbse-videos-lessons, Property 12`
    - **Validates: Requirements 7.3**

  - [ ]* 9.2 Write property test: seed script inserts all valid records
    - **Property 13: Seed script inserts all valid records**
    - For any `fc.array(validVideoRecord, { minLength: 1 })`, assert all records appear in the DB after the script runs
    - Tag: `// Feature: cbse-videos-lessons, Property 13`
    - **Validates: Requirements 7.2**

- [ ] 10. Implement `VideoPlayer` React component
  - Create `artifacts/cbse-tutor/src/components/video-player.tsx`
  - Accept props `{ youtubeVideoId: string; title: string; description?: string | null }`
  - Render `<h3>` with `title` above the iframe
  - Render `<iframe src={\`https://www.youtube.com/embed/\${youtubeVideoId}\`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />`
  - Render `<p>` with `description` below the iframe only when `description` is non-null and non-empty
  - _Requirements: 4.4, 4.5, 4.6, 4.7, 8.3_

  - [ ]* 10.1 Write unit tests for `VideoPlayer`
    - Test iframe `src` is exactly `https://www.youtube.com/embed/{youtubeVideoId}` for a known ID
    - Test `title` is rendered above the iframe
    - Test `description` is rendered when non-null, absent when null
    - Test `allow` attribute and `allowFullScreen` are set correctly
    - _Requirements: 4.4, 4.5, 4.6, 4.7_

  - [ ]* 10.2 Write property test: VideoPlayer embed URL construction
    - **Property 7: VideoPlayer embed URL construction**
    - Use `fc.stringMatching(/^[A-Za-z0-9_-]{11}$/)` for `youtubeVideoId`; assert rendered iframe `src` is exactly `https://www.youtube.com/embed/{youtubeVideoId}`
    - Tag: `// Feature: cbse-videos-lessons, Property 7`
    - **Validates: Requirements 4.4, 8.3**

  - [ ]* 10.3 Write property test: VideoPlayer renders title and conditional description
    - **Property 8: VideoPlayer renders title and conditional description**
    - Use `fc.record({ title: fc.string({ minLength: 1 }), description: fc.option(fc.string()) })` as generator
    - Assert title always appears above iframe; description appears iff non-null
    - Tag: `// Feature: cbse-videos-lessons, Property 8`
    - **Validates: Requirements 4.6, 4.7**

- [ ] 11. Add Videos tab to `chapter-detail.tsx` and wire `useListChapterVideos`
  - Import `VideoPlayer` and `useListChapterVideos` from their respective packages
  - Change `TabsList` grid from `grid-cols-3` to `grid-cols-4`
  - Add `<TabsTrigger value="videos">Videos</TabsTrigger>` after the "Overview" trigger
  - Add `<TabsContent value="videos">` that:
    - Shows a loading spinner when `videosLoading` is true
    - Maps over `videos` (sorted by `displayOrder`) and renders `<VideoPlayer>` per item when `videos.length > 0`
    - Shows a placeholder card ("Videos coming soon for this chapter") when `videos.length === 0`
  - Call `useListChapterVideos(chapterId)` at the top of the component alongside the existing `useGetChapter` call
  - _Requirements: 4.1, 4.2, 4.3, 4.8_

  - [ ]* 11.1 Write unit tests for Videos tab states
    - Test placeholder is shown when `videos` is empty
    - Test one `VideoPlayer` is rendered per video when videos are present
    - _Requirements: 4.2, 4.3_

  - [ ]* 11.2 Write property test: Videos tab renders one player per video in order
    - **Property 9: Videos tab renders one player per video in order**
    - Use `fc.array(fc.record({ id: fc.integer(), youtubeVideoId: fc.stringMatching(/^[A-Za-z0-9_-]{11}$/), title: fc.string({ minLength: 1 }), displayOrder: fc.integer() }), { minLength: 1 })` as generator
    - Assert exactly one `VideoPlayer` per video, rendered in ascending `displayOrder`
    - Tag: `// Feature: cbse-videos-lessons, Property 9`
    - **Validates: Requirements 4.2**

- [ ] 12. Verify and fix Lesson Study tab null/empty handling
  - Confirm the existing `chapter-detail.tsx` lesson tab already handles `null` with a placeholder (it does — verify no regression)
  - Confirm the API route returns `lessonStudy: chapter.lessonStudy ?? null` (not empty string) — fix if needed
  - _Requirements: 3.1, 3.2, 5.1, 5.2, 5.3_

  - [ ]* 12.1 Write property test: lesson content round-trip
    - **Property 5: Lesson content round-trip**
    - For any `fc.string({ minLength: 1 })` stored as `lesson_study`, assert the API returns it unchanged as `lessonStudy`
    - Tag: `// Feature: cbse-videos-lessons, Property 5`
    - **Validates: Requirements 3.1**

  - [ ]* 12.2 Write property test: null/empty lessonStudy normalised to null
    - **Property 6: Null/empty lessonStudy normalised to null**
    - Use `fc.oneof(fc.constant(null), fc.constant(""))` as generator; assert API always returns `lessonStudy: null`
    - Tag: `// Feature: cbse-videos-lessons, Property 6`
    - **Validates: Requirements 3.2**

- [ ] 13. Final checkpoint — Ensure all tests pass
  - Run `pnpm run typecheck` to confirm no TypeScript errors across all packages
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec change (Task 2) before implementing routes or UI
- Property tests use **fast-check** (`fc`) with Vitest; minimum 100 iterations per property
- Each property test must include the tag comment `// Feature: cbse-videos-lessons, Property N`
- The seed script requires a live DB (`DATABASE_URL` set); it will not run in sandbox mode
