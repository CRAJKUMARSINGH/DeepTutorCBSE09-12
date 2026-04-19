# Requirements Document

## Introduction

This feature adds two complementary learning modalities to the CBSE 9-12 Study Guide app:

1. **YouTube Video Embeds** — curated, chapter-specific NCERT/educational YouTube videos displayed inline on each chapter detail page.
2. **Structured Lesson Content** — rich, written lesson material (explanations, worked examples, notes) stored per chapter and rendered in the existing "Lesson Study" tab.

Currently the `lessonStudy` column exists but is populated for only 1 of 252 chapters, and the `visualsJson` column stores GeoGebra/Manim data but has no video type. This feature extends the data model, API, and frontend to surface both content types to students.

---

## Glossary

- **Chapter_Detail_Page**: The React page at `/chapters/:chapterId` that renders chapter tabs (Overview, Lesson Study, Visuals).
- **Chapter_Video**: A YouTube video associated with a specific chapter, stored with a YouTube video ID, title, and optional description.
- **Lesson_Content**: Structured Markdown text stored in the `lesson_study` column of the `chapters` table, containing explanations, worked examples, and study notes for a chapter.
- **Video_Player**: The embedded YouTube iframe component rendered within the Chapter_Detail_Page.
- **Videos_Tab**: A new tab added to the Chapter_Detail_Page tab strip dedicated to video content.
- **Lesson_Tab**: The existing "Lesson Study" tab on the Chapter_Detail_Page.
- **API_Server**: The Express 5 backend at `artifacts/api-server`.
- **DB**: The PostgreSQL database accessed via Drizzle ORM.
- **OpenAPI_Spec**: The file `lib/api-spec/openapi.yaml`, which is the source of truth for all API contracts.
- **Chapter_Videos_Table**: A new DB table `chapter_videos` that stores per-chapter YouTube video records.
- **Admin_Seed_Script**: A Node.js script used to bulk-insert video and lesson data into the DB.

---

## Requirements

### Requirement 1: Chapter Videos Data Model

**User Story:** As a developer, I want a dedicated database table for chapter videos, so that multiple videos can be associated with each chapter independently of the existing `visualsJson` column.

#### Acceptance Criteria

1. THE DB SHALL contain a `chapter_videos` table with columns: `id` (serial primary key), `chapter_id` (integer, foreign key to `chapters.id`, not null), `youtube_video_id` (text, not null), `title` (text, not null), `description` (text, nullable), `display_order` (integer, not null, default 0).
2. THE DB SHALL enforce a foreign key constraint from `chapter_videos.chapter_id` to `chapters.id`.
3. THE DB SHALL allow multiple `chapter_videos` rows per `chapter_id`.
4. THE DB SHALL order video results by `display_order` ascending when queried by chapter.

---

### Requirement 2: Chapter Videos API Endpoints

**User Story:** As a frontend developer, I want REST endpoints to retrieve videos for a chapter, so that the React app can fetch and display them without coupling to the DB schema.

#### Acceptance Criteria

1. THE OpenAPI_Spec SHALL define a `GET /cbse/chapters/{chapterId}/videos` endpoint that returns an array of `ChapterVideo` objects.
2. WHEN a valid `chapterId` is provided, THE API_Server SHALL return all `chapter_videos` rows for that chapter ordered by `display_order` ascending.
3. WHEN no videos exist for a chapter, THE API_Server SHALL return an empty array with HTTP 200.
4. IF `chapterId` is not a positive integer, THEN THE API_Server SHALL return HTTP 400 with an `ApiError` response body.
5. THE `ChapterVideo` schema in the OpenAPI_Spec SHALL include fields: `id` (integer), `chapterId` (integer), `youtubeVideoId` (string), `title` (string), `description` (string or null), `displayOrder` (integer).
6. THE OpenAPI_Spec SHALL also expose `ChapterDetail` with a `videos` array field of type `ChapterVideo`, populated in the existing `GET /cbse/chapters/{chapterId}` response.

---

### Requirement 3: Lesson Content API

**User Story:** As a frontend developer, I want the chapter detail endpoint to reliably return lesson content, so that the Lesson Study tab can render structured Markdown for any chapter that has it.

#### Acceptance Criteria

1. WHEN a chapter has a non-null, non-empty `lesson_study` value, THE API_Server SHALL include it as a non-null string in the `ChapterDetail` response.
2. WHEN a chapter has a null or empty `lesson_study` value, THE API_Server SHALL return `null` for the `lessonStudy` field in the `ChapterDetail` response.
3. THE OpenAPI_Spec SHALL declare `lessonStudy` in `ChapterDetail` as `type: ["string", "null"]` (already present — SHALL remain consistent with this definition).

---

### Requirement 4: Videos Tab on Chapter Detail Page

**User Story:** As a student, I want a dedicated Videos tab on the chapter page, so that I can watch relevant NCERT/educational videos without leaving the study guide.

#### Acceptance Criteria

1. THE Chapter_Detail_Page SHALL display a "Videos" tab in the tab strip alongside "Overview", "Lesson Study", and "Visuals".
2. WHEN the Videos tab is selected and videos exist for the chapter, THE Chapter_Detail_Page SHALL render a Video_Player for each `ChapterVideo` in `displayOrder` order.
3. WHEN the Videos tab is selected and no videos exist for the chapter, THE Chapter_Detail_Page SHALL display a placeholder message indicating videos are coming soon for that chapter.
4. THE Video_Player SHALL embed YouTube videos using an `<iframe>` with `src` set to `https://www.youtube.com/embed/{youtubeVideoId}`.
5. THE Video_Player SHALL set `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"` and `allowFullScreen` on the iframe.
6. THE Video_Player SHALL display the video `title` above the iframe.
7. WHERE a `description` is present on a `ChapterVideo`, THE Video_Player SHALL display the description below the iframe.
8. THE Chapter_Detail_Page SHALL fetch videos using the generated API hook for `GET /cbse/chapters/{chapterId}/videos`.

---

### Requirement 5: Lesson Study Tab Enhancement

**User Story:** As a student, I want the Lesson Study tab to show rich structured content when available, so that I can read detailed explanations and worked examples for each chapter.

#### Acceptance Criteria

1. WHEN `lessonStudy` is non-null for a chapter, THE Lesson_Tab SHALL render the content using the existing `MarkdownRenderer` component.
2. WHEN `lessonStudy` is null for a chapter, THE Lesson_Tab SHALL display a placeholder card with a message indicating lesson content is coming soon.
3. THE Lesson_Tab SHALL remain the second tab in the tab strip (after "Overview").

---

### Requirement 6: Content Stats Coverage

**User Story:** As a developer, I want the content stats endpoint to report video coverage alongside lesson coverage, so that I can track how many chapters have videos populated.

#### Acceptance Criteria

1. THE OpenAPI_Spec SHALL extend the `ContentStats` schema with a `chaptersWithVideos` (integer) field and a `totalVideos` (integer) field.
2. WHEN `GET /cbse/content-stats` is called, THE API_Server SHALL return the count of distinct `chapter_id` values in `chapter_videos` as `chaptersWithVideos`.
3. WHEN `GET /cbse/content-stats` is called, THE API_Server SHALL return the total row count of `chapter_videos` as `totalVideos`.

---

### Requirement 7: Data Seeding for Videos

**User Story:** As a developer, I want a seed script to bulk-insert chapter video records, so that I can populate the database with curated YouTube video IDs for all 252 chapters without manual SQL.

#### Acceptance Criteria

1. THE Admin_Seed_Script SHALL accept a JSON input file containing an array of objects with fields: `chapterId`, `youtubeVideoId`, `title`, `description` (optional), `displayOrder` (optional, defaults to 0).
2. WHEN the Admin_Seed_Script is run, THE Admin_Seed_Script SHALL insert all records from the input file into the `chapter_videos` table.
3. IF a record with the same `chapterId` and `youtubeVideoId` already exists, THEN THE Admin_Seed_Script SHALL skip that record without error (upsert / on-conflict-do-nothing).
4. WHEN the Admin_Seed_Script completes, THE Admin_Seed_Script SHALL print a summary of inserted and skipped record counts to stdout.

---

### Requirement 8: YouTube Video ID Validation

**User Story:** As a developer, I want the API to validate YouTube video IDs before storing or returning them, so that malformed IDs do not cause broken embeds in the frontend.

#### Acceptance Criteria

1. THE API_Server SHALL validate that `youtubeVideoId` matches the pattern `^[A-Za-z0-9_-]{11}$` (standard YouTube video ID format).
2. IF a `youtubeVideoId` does not match the required pattern, THEN THE API_Server SHALL return HTTP 400 with an `ApiError` body when that ID is submitted via any write endpoint.
3. THE Video_Player SHALL construct the embed URL exclusively from the validated `youtubeVideoId` field returned by the API, not from any user-supplied string.
