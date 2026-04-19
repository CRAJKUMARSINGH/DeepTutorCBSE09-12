#!/usr/bin/env python
"""
DeepTutor CBSE Knowledge Base Setup Script
==========================================
Run this script after placing NCERT PDFs in the cbse_books/ folder.

Usage:
    python scripts/setup_cbse_kb.py

Requirements:
    - NCERT PDFs placed in cbse_books/ (see cbse_books/README.md)
    - .env file configured with OPENAI_API_KEY (or LLM_API_KEY)
    - pip install -r requirements/cli.txt && pip install -e .
"""

import asyncio
import os
import sys
from pathlib import Path

# Add project root to path
ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT))

KB_NAME = "cbse-ncert"
BOOKS_DIR = ROOT / "cbse_books"
BASE_DIR = ROOT / "data" / "knowledge_bases"

SUPPORTED_EXTENSIONS = {".pdf", ".txt", ".md", ".docx"}


def collect_pdfs(books_dir: Path) -> list[str]:
    """Recursively collect all supported files from cbse_books/."""
    files = []
    for ext in SUPPORTED_EXTENSIONS:
        files.extend([str(f) for f in books_dir.rglob(f"*{ext}")])
    return sorted(files)


async def main():
    print("=" * 60)
    print("  DeepTutor CBSE Knowledge Base Setup")
    print("=" * 60)

    # Check books directory
    if not BOOKS_DIR.exists():
        print(f"\n❌ cbse_books/ folder not found at: {BOOKS_DIR}")
        print("   Create it and add NCERT PDFs. See cbse_books/README.md")
        sys.exit(1)

    # Collect files
    doc_files = collect_pdfs(BOOKS_DIR)

    if not doc_files:
        print(f"\n⚠️  No PDF/TXT/DOCX files found in {BOOKS_DIR}")
        print("   Download NCERT PDFs from https://ncert.nic.in/textbook.php")
        print("   and place them in cbse_books/")
        sys.exit(1)

    print(f"\n📚 Found {len(doc_files)} document(s):")
    for f in doc_files:
        rel = Path(f).relative_to(ROOT)
        print(f"   • {rel}")

    print(f"\n🔧 Creating knowledge base: '{KB_NAME}'")
    print(f"   Storage: {BASE_DIR / KB_NAME}")
    print()

    # Check API key
    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("LLM_API_KEY")
    if not api_key:
        print("❌ No API key found. Set OPENAI_API_KEY in your .env file.")
        sys.exit(1)

    try:
        from deeptutor.knowledge.initializer import initialize_knowledge_base
        from deeptutor.knowledge.manager import KnowledgeBaseManager

        print("⏳ Processing documents (this may take a few minutes)...")
        print("   Embedding and indexing NCERT content...\n")

        success = await initialize_knowledge_base(
            kb_name=KB_NAME,
            source_files=doc_files,
            base_dir=str(BASE_DIR),
            api_key=api_key,
        )

        if success:
            # Set as default KB
            manager = KnowledgeBaseManager(base_dir=str(BASE_DIR))
            manager.set_default(KB_NAME)

            print("\n✅ Knowledge base created successfully!")
            print(f"   Name: {KB_NAME}")
            print(f"   Documents: {len(doc_files)}")
            print(f"   Set as default: YES")
            print()
            print("🚀 Your DeepTutor CBSE AI Tutor is ready!")
            print("   Students can now ask questions grounded in NCERT content.")
        else:
            print("\n❌ Knowledge base creation failed.")
            sys.exit(1)

    except ImportError as e:
        print(f"\n❌ Import error: {e}")
        print("   Make sure you have installed dependencies:")
        print("   pip install -r requirements/cli.txt && pip install -e .")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        raise


if __name__ == "__main__":
    # Load .env if present
    env_file = ROOT / ".env"
    if env_file.exists():
        from pathlib import Path as _P
        for line in env_file.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                os.environ.setdefault(k.strip(), v.strip())

    asyncio.run(main())
