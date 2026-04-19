"""
CBSE Content Generation Engine — Practice Question Generator
=============================================================
Generates 10+ practice questions per chapter from lesson study content.

Usage:
    python scripts/generate-questions.py                              # All chapters with lessons
    python scripts/generate-questions.py --grade 9 --subject Science  # Grade 9 Science only
    python scripts/generate-questions.py --per-chapter 15             # 15 questions per chapter
    python scripts/generate-questions.py --model gpt-4o-mini          # Specific model
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
QUESTIONS_DIR = GUIDE_ROOT / "artifacts" / "questions"
MANIFEST_PATH = QUESTIONS_DIR / "manifest.json"

QUESTIONS_DIR.mkdir(parents=True, exist_ok=True)

# ── System prompt ──────────────────────────────────────────────────────────
QUESTION_SYSTEM_PROMPT = """You are an expert CBSE question paper setter with 15+ years of board exam experience.

Your task is to generate practice questions for a specific CBSE chapter. You must produce questions that:
1. Follow the LATEST CBSE board exam pattern (MCQ, Short Answer, Case-Study based).
2. Cover ALL difficulty levels.
3. Include hints that guide students WITHOUT giving away the answer.
4. Include detailed step-by-step solutions with LaTeX for mathematical working.
5. Include NCERT exercise-style questions AND previous year board pattern questions.
6. For Hindi subjects, write questions in Hindi (Devanagari script).

Return ONLY a valid JSON array. Each element must have exactly these fields:
{
  "question": "The question text (may contain LaTeX)",
  "type": "mcq" or "short_answer",
  "difficulty": "easy" or "medium" or "hard",
  "options": ["Option A", "Option B", "Option C", "Option D"] or null for short_answer,
  "answer": "The correct answer text",
  "explanation": "Why this is the correct answer (2-3 sentences)",
  "hint": "A helpful nudge without revealing the answer",
  "stepByStepSolution": "Detailed solution with LaTeX formulas in Markdown"
}

Difficulty distribution for {count} questions:
- Easy: {easy} questions (direct NCERT recall, definitions, basic application)
- Medium: {medium} questions (application, reasoning, NCERT exercise level)
- Hard: {hard} questions (HOTS, case-study based, multi-step problems)

Type distribution:
- MCQ: ~60% of questions
- Short Answer: ~40% of questions

IMPORTANT: Return ONLY the JSON array. No markdown fencing. No extra text."""

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

# ── Manifest helpers ───────────────────────────────────────────────────────
def load_manifest() -> dict:
    if MANIFEST_PATH.exists():
        return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    return {"generated": {}}

def save_manifest(manifest: dict):
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")

def chapter_key(chapter: dict) -> str:
    return f"{chapter['subject_name']}_Gr{chapter['grade']}_{chapter['chapter_number']}"

# ── Question validation ────────────────────────────────────────────────────
REQUIRED_FIELDS = {"question", "type", "difficulty", "answer", "explanation"}

def validate_questions(questions: list[dict]) -> tuple[list[dict], int]:
    """Validate and clean questions. Returns (valid_questions, rejected_count)."""
    valid = []
    rejected = 0
    for q in questions:
        if not isinstance(q, dict):
            rejected += 1
            continue
        if not REQUIRED_FIELDS.issubset(q.keys()):
            rejected += 1
            continue
        if q["type"] not in ("mcq", "short_answer"):
            q["type"] = "mcq" if q.get("options") else "short_answer"
        if q["difficulty"] not in ("easy", "medium", "hard"):
            q["difficulty"] = "medium"
        if q["type"] == "mcq" and (not q.get("options") or len(q["options"]) < 2):
            q["type"] = "short_answer"
            q["options"] = None
        # Ensure optional fields exist
        q.setdefault("hint", None)
        q.setdefault("stepByStepSolution", None)
        q.setdefault("options", None)
        valid.append(q)
    return valid, rejected

# ── Core generation ────────────────────────────────────────────────────────
async def generate_questions(chapter: dict, lesson_text: str, count: int, model: str) -> list[dict]:
    """Generate practice questions for a chapter."""
    easy = max(1, round(count * 0.3))
    hard = max(1, round(count * 0.3))
    medium = count - easy - hard

    system = QUESTION_SYSTEM_PROMPT.format(count=count, easy=easy, medium=medium, hard=hard)

    prompt = (
        f"Generate exactly {count} practice questions for:\n"
        f"- Chapter: '{chapter['title']}'\n"
        f"- Subject: '{chapter['subject_name']}'\n"
        f"- Grade: {chapter['grade']}\n\n"
        f"Lesson Study (use this as source material):\n"
        f"---\n{lesson_text[:4000]}\n---\n\n"
        f"Return a JSON array of {count} questions."
    )

    if chapter["subject_name"].lower() == "hindi":
        prompt += "\n\nIMPORTANT: Write all questions, options, answers, and explanations in Hindi (Devanagari script)."

    response = await call_llm(prompt, system, model)

    # Parse JSON from response
    # Strip markdown fencing if present
    cleaned = re.sub(r"```json?\s*", "", response)
    cleaned = re.sub(r"```\s*$", "", cleaned).strip()

    # Try to find JSON array in the response
    try:
        questions = json.loads(cleaned)
    except json.JSONDecodeError:
        # Try extracting array from surrounding text
        match = re.search(r'\[.*\]', cleaned, re.DOTALL)
        if match:
            questions = json.loads(match.group())
        else:
            raise ValueError("Could not parse questions JSON from LLM response")

    if not isinstance(questions, list):
        raise ValueError(f"Expected JSON array, got {type(questions)}")

    return questions


# ── Find chapters with lessons ─────────────────────────────────────────────
def find_lesson_files(grade: int | None, subject: str | None) -> list[dict]:
    """Scan the lesson-studies directory for available lesson JSONs."""
    chapters = []
    if not LESSONS_DIR.exists():
        return chapters

    for json_file in sorted(LESSONS_DIR.glob("*.json")):
        if json_file.name == "manifest.json":
            continue
        try:
            data = json.loads(json_file.read_text(encoding="utf-8"))
            if grade is not None and data.get("grade") != grade:
                continue
            if subject is not None and data.get("subject_name", "").lower() != subject.lower():
                continue
            data["_source_file"] = str(json_file)
            chapters.append(data)
        except Exception:
            continue

    return chapters


# ── Main ───────────────────────────────────────────────────────────────────
async def main():
    parser = argparse.ArgumentParser(description="CBSE Practice Question Generator")
    parser.add_argument("--grade", type=int, help="Filter by grade (9, 10, 11, 12)")
    parser.add_argument("--subject", type=str, help="Filter by subject name")
    parser.add_argument("--per-chapter", type=int, default=10, help="Questions per chapter (default: 10)")
    parser.add_argument("--model", type=str, default="gpt-4o", help="LLM model (default: gpt-4o)")
    parser.add_argument("--force", action="store_true", help="Regenerate even if already done")
    parser.add_argument("--limit", type=int, default=50, help="Max chapters to process")
    args = parser.parse_args()

    print("=" * 60)
    print("  ❓ CBSE Practice Question Generator")
    print(f"  Model: {args.model}  |  {args.per_chapter} Q/chapter")
    print(f"  Grade: {args.grade or 'All'}  |  Subject: {args.subject or 'All'}")
    print("=" * 60)

    manifest = load_manifest()
    chapters = find_lesson_files(args.grade, args.subject)

    if not chapters:
        print("\n⚠  No lesson study files found. Run generate-curriculum.py first!")
        return

    # Filter already-generated
    if not args.force:
        pending = [c for c in chapters if chapter_key(c) not in manifest.get("generated", {})]
    else:
        pending = chapters

    pending = pending[:args.limit]
    print(f"\n📋 Found {len(chapters)} chapters with lessons, {len(pending)} pending question generation.\n")

    total_questions = 0
    success_count = 0
    fail_count = 0

    for i, chapter in enumerate(pending, 1):
        key = chapter_key(chapter)
        safe_title = chapter["title"].replace(" ", "_").replace("/", "-").replace("'", "")
        out_filename = f"{chapter['subject_name']}_Gr{chapter['grade']}_{safe_title}_questions.json"

        print(f"[{i}/{len(pending)}] ❓ {chapter['subject_name']} Gr{chapter['grade']} — {chapter['title']}")

        lesson_text = chapter.get("lesson_study", "")
        if not lesson_text:
            print("    ⚠ No lesson text found. Skipping.")
            fail_count += 1
            continue

        try:
            start = time.time()
            raw_questions = await generate_questions(chapter, lesson_text, args.per_chapter, args.model)
            valid_questions, rejected = validate_questions(raw_questions)
            elapsed = time.time() - start

            if len(valid_questions) == 0:
                print(f"    ❌ All questions failed validation. Skipping.")
                fail_count += 1
                continue

            # Save questions JSON
            out_data = {
                "chapter_id": chapter.get("id"),
                "title": chapter["title"],
                "subject_name": chapter["subject_name"],
                "grade": chapter["grade"],
                "chapter_number": chapter["chapter_number"],
                "questions": valid_questions,
            }
            out_path = QUESTIONS_DIR / out_filename
            out_path.write_text(json.dumps(out_data, indent=2, ensure_ascii=False), encoding="utf-8")

            # Update manifest
            manifest.setdefault("generated", {})[key] = {
                "file": out_filename,
                "question_count": len(valid_questions),
                "rejected_count": rejected,
                "difficulty_dist": {
                    "easy": sum(1 for q in valid_questions if q["difficulty"] == "easy"),
                    "medium": sum(1 for q in valid_questions if q["difficulty"] == "medium"),
                    "hard": sum(1 for q in valid_questions if q["difficulty"] == "hard"),
                },
                "generated_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
            }
            save_manifest(manifest)

            total_questions += len(valid_questions)
            success_count += 1
            print(f"    ✅ {len(valid_questions)} questions ({rejected} rejected) in {elapsed:.1f}s")
            print(f"       Easy:{sum(1 for q in valid_questions if q['difficulty']=='easy')} "
                  f"Med:{sum(1 for q in valid_questions if q['difficulty']=='medium')} "
                  f"Hard:{sum(1 for q in valid_questions if q['difficulty']=='hard')}\n")

        except Exception as e:
            print(f"    ❌ ERROR: {e}\n")
            fail_count += 1

    print("=" * 60)
    print(f"  ✅ Chapters: {success_count}  |  ❌ Failed: {fail_count}")
    print(f"  📊 Total questions generated: {total_questions}")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
