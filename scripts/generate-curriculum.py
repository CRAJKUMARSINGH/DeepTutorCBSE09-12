"""
CBSE Content Generation Engine — Lesson Study Generator
========================================================
Generates 'Gold Standard' lesson studies for CBSE chapters using DeepTutor's LLM.

Usage:
    python scripts/generate-curriculum.py                          # All pending chapters
    python scripts/generate-curriculum.py --grade 9                # Grade 9 only
    python scripts/generate-curriculum.py --grade 9 --subject Science  # Grade 9 Science only
    python scripts/generate-curriculum.py --limit 5                # Process at most 5 chapters
    python scripts/generate-curriculum.py --model gpt-4o-mini      # Use a specific model
"""
import os
import json
import asyncio
import argparse
import time
import re
from pathlib import Path
from dotenv import load_dotenv

# ── DeepTutor service imports ──────────────────────────────────────────────
import sys

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(PROJECT_ROOT))

try:
    from deeptutor.services.llm import complete
    from deeptutor.services.config import load_config_with_main
except ImportError:
    print("⚠  Could not import DeepTutor services. Running in offline/stub mode.")
    complete = None

# ── Env & paths ────────────────────────────────────────────────────────────
GUIDE_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(GUIDE_ROOT / ".env")

LESSONS_DIR = GUIDE_ROOT / "artifacts" / "lesson-studies"
MANIFEST_PATH = LESSONS_DIR / "manifest.json"

LESSONS_DIR.mkdir(parents=True, exist_ok=True)

# ── System prompt ──────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are a Master CBSE Curriculum Designer with 20+ years of experience.
Your task is to create a 'Gold Standard' Lesson Study for a specific CBSE chapter.

The Lesson Study MUST include the following Markdown sections in order:
## Introduction
## Learning Objectives
## Detailed Explanation
## Key Formulas & Definitions
## Real-World Applications (Indian Context)
## Common Misconceptions
## Summary
## Practice Tips for CBSE Board Exam

Rules:
1. Highly detailed and comprehensive (minimum 1500 words).
2. Structured with clear Markdown headings.
3. Pedagogically sound — explain 'Why' before 'What'.
4. Use examples from everyday Indian life (e.g., cricket, monsoons, festivals, Indian scientists).
5. Use LaTeX ($..$ for inline, $$...$$ for block) for ALL mathematical formulas and scientific notation.
6. Engaging, encouraging, and appropriate for the target grade level.
7. If the subject is Hindi, write the content in Hindi (Devanagari script) with section headings in both Hindi and English.
8. Reference NCERT textbook page numbers or exercise numbers when possible.

Format your response as a complete Markdown document starting with a # title."""

# ── Concept extraction prompt ──────────────────────────────────────────────
CONCEPT_PROMPT = """Based on the following lesson study, extract exactly 5 key concepts.
Return ONLY a JSON array. Each element must have:
- "title": a concise concept name (max 8 words)
- "explanation": a clear 2-3 sentence explanation

Example output:
[
  {"title": "Newton's Third Law", "explanation": "For every action..."},
  ...
]

Lesson Study:
---
{lesson_text}
---

Return ONLY the JSON array, no markdown fencing."""

# ── Manifest helpers ───────────────────────────────────────────────────────
def load_manifest() -> dict:
    if MANIFEST_PATH.exists():
        return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    return {"generated": {}}

def save_manifest(manifest: dict):
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")

def chapter_key(chapter: dict) -> str:
    return f"{chapter['subject_name']}_Gr{chapter['grade']}_{chapter['chapter_number']}"

# ── Retry with exponential backoff ─────────────────────────────────────────
async def call_llm(prompt: str, system: str, model: str, max_retries: int = 3) -> str:
    if complete is None:
        raise RuntimeError("DeepTutor LLM service not available")

    for attempt in range(1, max_retries + 1):
        try:
            response = await complete(prompt, system_prompt=system, model=model)
            return response
        except Exception as e:
            wait = 2 ** attempt
            print(f"    ⚠ Attempt {attempt}/{max_retries} failed: {e}")
            if attempt < max_retries:
                print(f"    ⏳ Retrying in {wait}s...")
                await asyncio.sleep(wait)
            else:
                raise

# ── Quality validation ─────────────────────────────────────────────────────
REQUIRED_HEADINGS = ["introduction", "learning objectives", "summary"]

def validate_lesson(text: str) -> bool:
    lower = text.lower()
    found = sum(1 for h in REQUIRED_HEADINGS if h in lower)
    if found < 2:
        return False
    if len(text) < 800:
        return False
    return True

# ── Core generation ────────────────────────────────────────────────────────
async def generate_lesson(chapter: dict, model: str) -> tuple[str, list[dict]]:
    """Returns (lesson_markdown, concepts_list)."""
    prompt = (
        f"Create a Gold Standard Lesson Study for:\n"
        f"- Chapter: '{chapter['title']}'\n"
        f"- Subject: '{chapter['subject_name']}'\n"
        f"- Grade: {chapter['grade']}\n"
        f"- Chapter Number: {chapter['chapter_number']}\n"
    )
    if chapter["subject_name"].lower() == "hindi":
        prompt += "\nIMPORTANT: Write the entire lesson in Hindi (Devanagari script)."

    lesson = await call_llm(prompt, SYSTEM_PROMPT, model)

    # Extract concepts
    concepts = []
    try:
        concept_resp = await call_llm(
            CONCEPT_PROMPT.format(lesson_text=lesson[:3000]),
            "You are a JSON extraction assistant. Return only valid JSON.",
            model,
        )
        # Strip markdown fencing if present
        cleaned = re.sub(r"```json?\s*", "", concept_resp)
        cleaned = re.sub(r"```\s*$", "", cleaned).strip()
        concepts = json.loads(cleaned)
        if not isinstance(concepts, list):
            concepts = []
    except Exception as e:
        print(f"    ⚠ Concept extraction failed: {e}")

    return lesson, concepts


# ── Chapter source ─────────────────────────────────────────────────────────
def get_chapters_from_db(grade: int | None, subject: str | None, limit: int) -> list[dict]:
    """Try to fetch chapters from DB; fall back to built-in pilot batch."""
    try:
        import psycopg2
        from psycopg2.extras import RealDictCursor

        db_url = os.environ.get("DATABASE_URL")
        if not db_url:
            raise ValueError("DATABASE_URL not set")

        conn = psycopg2.connect(db_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)

        where_clauses = ["(c.lesson_study IS NULL OR c.lesson_study = '')"]
        params: list = []
        if grade is not None:
            where_clauses.append("s.grade = %s")
            params.append(grade)
        if subject is not None:
            where_clauses.append("LOWER(s.name) = LOWER(%s)")
            params.append(subject)

        query = f"""
            SELECT c.id, c.title, c.chapter_number, s.name as subject_name, s.grade
            FROM chapters c
            JOIN subjects s ON c.subject_id = s.id
            WHERE {' AND '.join(where_clauses)}
            ORDER BY s.grade, s.name, c.chapter_number
            LIMIT %s
        """
        params.append(limit)
        cur.execute(query, params)
        chapters = cur.fetchall()
        conn.close()
        return [dict(ch) for ch in chapters]

    except Exception as e:
        print(f"  ℹ Database unavailable ({e}), using built-in pilot batch.")
        return get_pilot_batch(grade, subject, limit)


def get_pilot_batch(grade: int | None, subject: str | None, limit: int) -> list[dict]:
    """Built-in chapter list for offline development."""
    PILOT = [
        # Grade 9 Science
        {"id": 1, "title": "Matter in Our Surroundings", "chapter_number": 1, "subject_name": "Science", "grade": 9},
        {"id": 2, "title": "Is Matter Around Us Pure", "chapter_number": 2, "subject_name": "Science", "grade": 9},
        {"id": 3, "title": "Atoms and Molecules", "chapter_number": 3, "subject_name": "Science", "grade": 9},
        {"id": 4, "title": "Structure of the Atom", "chapter_number": 4, "subject_name": "Science", "grade": 9},
        {"id": 5, "title": "The Fundamental Unit of Life", "chapter_number": 5, "subject_name": "Science", "grade": 9},
        {"id": 6, "title": "Tissues", "chapter_number": 6, "subject_name": "Science", "grade": 9},
        {"id": 7, "title": "Motion", "chapter_number": 7, "subject_name": "Science", "grade": 9},
        {"id": 8, "title": "Force and Laws of Motion", "chapter_number": 8, "subject_name": "Science", "grade": 9},
        {"id": 9, "title": "Gravitation", "chapter_number": 9, "subject_name": "Science", "grade": 9},
        {"id": 10, "title": "Work and Energy", "chapter_number": 10, "subject_name": "Science", "grade": 9},
        {"id": 11, "title": "Sound", "chapter_number": 11, "subject_name": "Science", "grade": 9},
        {"id": 12, "title": "Improvement in Food Resources", "chapter_number": 12, "subject_name": "Science", "grade": 9},
        # Grade 9 Mathematics
        {"id": 13, "title": "Number Systems", "chapter_number": 1, "subject_name": "Mathematics", "grade": 9},
        {"id": 14, "title": "Polynomials", "chapter_number": 2, "subject_name": "Mathematics", "grade": 9},
        {"id": 15, "title": "Coordinate Geometry", "chapter_number": 3, "subject_name": "Mathematics", "grade": 9},
        {"id": 16, "title": "Linear Equations in Two Variables", "chapter_number": 4, "subject_name": "Mathematics", "grade": 9},
        {"id": 17, "title": "Introduction to Euclid's Geometry", "chapter_number": 5, "subject_name": "Mathematics", "grade": 9},
        {"id": 18, "title": "Lines and Angles", "chapter_number": 6, "subject_name": "Mathematics", "grade": 9},
        {"id": 19, "title": "Triangles", "chapter_number": 7, "subject_name": "Mathematics", "grade": 9},
        {"id": 20, "title": "Quadrilaterals", "chapter_number": 8, "subject_name": "Mathematics", "grade": 9},
        {"id": 21, "title": "Circles", "chapter_number": 9, "subject_name": "Mathematics", "grade": 9},
        {"id": 22, "title": "Heron's Formula", "chapter_number": 10, "subject_name": "Mathematics", "grade": 9},
        {"id": 23, "title": "Surface Areas and Volumes", "chapter_number": 11, "subject_name": "Mathematics", "grade": 9},
        {"id": 24, "title": "Statistics", "chapter_number": 12, "subject_name": "Mathematics", "grade": 9},
        # Grade 9 Hindi
        {"id": 25, "title": "Do Bailon Ki Katha", "chapter_number": 1, "subject_name": "Hindi", "grade": 9},
        {"id": 26, "title": "Lhasa Ki Aur", "chapter_number": 2, "subject_name": "Hindi", "grade": 9},
    ]

    filtered = PILOT
    if grade is not None:
        filtered = [c for c in filtered if c["grade"] == grade]
    if subject is not None:
        filtered = [c for c in filtered if c["subject_name"].lower() == subject.lower()]
    return filtered[:limit]


# ── Main ───────────────────────────────────────────────────────────────────
async def main():
    parser = argparse.ArgumentParser(description="CBSE Lesson Study Generator")
    parser.add_argument("--grade", type=int, help="Filter by grade (9, 10, 11, 12)")
    parser.add_argument("--subject", type=str, help="Filter by subject name (e.g., Science, Mathematics)")
    parser.add_argument("--limit", type=int, default=50, help="Max chapters to process (default: 50)")
    parser.add_argument("--model", type=str, default="gpt-4o", help="LLM model to use (default: gpt-4o)")
    parser.add_argument("--force", action="store_true", help="Regenerate even if already in manifest")
    args = parser.parse_args()

    print("=" * 60)
    print("  📚 CBSE Lesson Study Generator")
    print(f"  Model: {args.model}  |  Grade: {args.grade or 'All'}  |  Subject: {args.subject or 'All'}")
    print("=" * 60)

    manifest = load_manifest()
    chapters = get_chapters_from_db(args.grade, args.subject, args.limit)

    if not chapters:
        print("\n✅ No chapters to process. Everything is up to date!")
        return

    # Filter out already-generated (unless --force)
    if not args.force:
        pending = [c for c in chapters if chapter_key(c) not in manifest.get("generated", {})]
    else:
        pending = chapters

    print(f"\n📋 Found {len(chapters)} total chapters, {len(pending)} pending generation.\n")

    success_count = 0
    fail_count = 0

    for i, chapter in enumerate(pending, 1):
        key = chapter_key(chapter)
        safe_title = chapter["title"].replace(" ", "_").replace("/", "-").replace("'", "")
        md_filename = f"{chapter['subject_name']}_Gr{chapter['grade']}_{safe_title}.md"
        json_filename = f"{chapter['subject_name']}_Gr{chapter['grade']}_{safe_title}.json"

        print(f"[{i}/{len(pending)}] 📖 {chapter['subject_name']} Gr{chapter['grade']} — {chapter['title']}")

        try:
            start = time.time()
            lesson, concepts = await generate_lesson(chapter, args.model)
            elapsed = time.time() - start

            # Validate
            if not validate_lesson(lesson):
                print(f"    ❌ FAILED validation (too short or missing headings). Skipping.")
                fail_count += 1
                continue

            # Save .md
            md_path = LESSONS_DIR / md_filename
            md_path.write_text(lesson, encoding="utf-8")
            print(f"    📄 Saved {md_filename}")

            # Save .json (lesson + concepts for seeding)
            json_data = {
                "id": chapter.get("id"),
                "title": chapter["title"],
                "subject_name": chapter["subject_name"],
                "grade": chapter["grade"],
                "chapter_number": chapter["chapter_number"],
                "lesson_study": lesson,
                "concepts": concepts,
            }
            json_path = LESSONS_DIR / json_filename
            json_path.write_text(json.dumps(json_data, indent=2, ensure_ascii=False), encoding="utf-8")
            print(f"    📊 Saved {json_filename} ({len(concepts)} concepts)")

            # Update manifest
            manifest.setdefault("generated", {})[key] = {
                "md_file": md_filename,
                "json_file": json_filename,
                "concepts_count": len(concepts),
                "word_count": len(lesson.split()),
                "generated_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
            }
            save_manifest(manifest)

            success_count += 1
            print(f"    ✅ Done in {elapsed:.1f}s ({len(lesson.split())} words)\n")

        except Exception as e:
            print(f"    ❌ ERROR: {e}\n")
            fail_count += 1

    print("=" * 60)
    print(f"  ✅ Generated: {success_count}  |  ❌ Failed: {fail_count}  |  Total: {len(pending)}")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
