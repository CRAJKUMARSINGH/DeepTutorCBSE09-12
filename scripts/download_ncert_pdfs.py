#!/usr/bin/env python
"""
NCERT PDF Downloader — All Classes 9–12, All Subjects
======================================================
Downloads all NCERT textbook PDFs from ncert.nic.in
and saves them into cbse_books/<classN>/<subject>.pdf

Usage:
    python scripts/download_ncert_pdfs.py

No login required — all PDFs are freely available.
"""

import os
import sys
import time
from pathlib import Path

try:
    import requests
except ImportError:
    print("Installing requests...")
    os.system(f"{sys.executable} -m pip install requests")
    import requests

ROOT = Path(__file__).parent.parent
BOOKS_DIR = ROOT / "cbse_books"

# ============================================================
# NCERT PDF direct download URLs
# Format: ncert.nic.in/textbook/pdf/<code>.zip  (chapter-wise)
# OR full book PDFs from the NCERT CDN
# ============================================================

NCERT_PDFS = {
    # ── CLASS 9 ──────────────────────────────────────────────
    "class9/science.pdf":
        "https://ncert.nic.in/textbook/pdf/iesc1dd.zip",
    "class9/maths.pdf":
        "https://ncert.nic.in/textbook/pdf/iemh1dd.zip",
    "class9/history.pdf":
        "https://ncert.nic.in/textbook/pdf/iess1dd.zip",
    "class9/geography.pdf":
        "https://ncert.nic.in/textbook/pdf/iess2dd.zip",
    "class9/civics.pdf":
        "https://ncert.nic.in/textbook/pdf/iess3dd.zip",
    "class9/economics.pdf":
        "https://ncert.nic.in/textbook/pdf/iess4dd.zip",
    "class9/english_beehive.pdf":
        "https://ncert.nic.in/textbook/pdf/iefl1dd.zip",
    "class9/hindi_kshitij.pdf":
        "https://ncert.nic.in/textbook/pdf/ihkv1dd.zip",

    # ── CLASS 10 ─────────────────────────────────────────────
    "class10/science.pdf":
        "https://ncert.nic.in/textbook/pdf/jesc1dd.zip",
    "class10/maths.pdf":
        "https://ncert.nic.in/textbook/pdf/jemh1dd.zip",
    "class10/history.pdf":
        "https://ncert.nic.in/textbook/pdf/jess1dd.zip",
    "class10/geography.pdf":
        "https://ncert.nic.in/textbook/pdf/jess2dd.zip",
    "class10/civics.pdf":
        "https://ncert.nic.in/textbook/pdf/jess3dd.zip",
    "class10/economics.pdf":
        "https://ncert.nic.in/textbook/pdf/jess4dd.zip",
    "class10/english_first_flight.pdf":
        "https://ncert.nic.in/textbook/pdf/jefl1dd.zip",
    "class10/hindi_kshitij2.pdf":
        "https://ncert.nic.in/textbook/pdf/jhkv1dd.zip",

    # ── CLASS 11 ─────────────────────────────────────────────
    "class11/physics_part1.pdf":
        "https://ncert.nic.in/textbook/pdf/keph1dd.zip",
    "class11/physics_part2.pdf":
        "https://ncert.nic.in/textbook/pdf/keph2dd.zip",
    "class11/chemistry_part1.pdf":
        "https://ncert.nic.in/textbook/pdf/kech1dd.zip",
    "class11/chemistry_part2.pdf":
        "https://ncert.nic.in/textbook/pdf/kech2dd.zip",
    "class11/biology.pdf":
        "https://ncert.nic.in/textbook/pdf/kebo1dd.zip",
    "class11/maths.pdf":
        "https://ncert.nic.in/textbook/pdf/kemh1dd.zip",
    "class11/english_hornbill.pdf":
        "https://ncert.nic.in/textbook/pdf/kefl1dd.zip",
    "class11/english_snapshots.pdf":
        "https://ncert.nic.in/textbook/pdf/kesl1dd.zip",
    "class11/hindi_aroh.pdf":
        "https://ncert.nic.in/textbook/pdf/khkv1dd.zip",
    "class11/hindi_vitan.pdf":
        "https://ncert.nic.in/textbook/pdf/khsv1dd.zip",
    "class11/accountancy_part1.pdf":
        "https://ncert.nic.in/textbook/pdf/keat1dd.zip",
    "class11/accountancy_part2.pdf":
        "https://ncert.nic.in/textbook/pdf/keat2dd.zip",
    "class11/business_studies.pdf":
        "https://ncert.nic.in/textbook/pdf/kebs1dd.zip",
    "class11/economics_statistics.pdf":
        "https://ncert.nic.in/textbook/pdf/kest1dd.zip",
    "class11/economics_indian.pdf":
        "https://ncert.nic.in/textbook/pdf/keie1dd.zip",

    # ── CLASS 12 ─────────────────────────────────────────────
    "class12/physics_part1.pdf":
        "https://ncert.nic.in/textbook/pdf/leph1dd.zip",
    "class12/physics_part2.pdf":
        "https://ncert.nic.in/textbook/pdf/leph2dd.zip",
    "class12/chemistry_part1.pdf":
        "https://ncert.nic.in/textbook/pdf/lech1dd.zip",
    "class12/chemistry_part2.pdf":
        "https://ncert.nic.in/textbook/pdf/lech2dd.zip",
    "class12/biology.pdf":
        "https://ncert.nic.in/textbook/pdf/lebo1dd.zip",
    "class12/maths_part1.pdf":
        "https://ncert.nic.in/textbook/pdf/lemh1dd.zip",
    "class12/maths_part2.pdf":
        "https://ncert.nic.in/textbook/pdf/lemh2dd.zip",
    "class12/english_flamingo.pdf":
        "https://ncert.nic.in/textbook/pdf/lefl1dd.zip",
    "class12/english_vistas.pdf":
        "https://ncert.nic.in/textbook/pdf/levs1dd.zip",
    "class12/hindi_aroh2.pdf":
        "https://ncert.nic.in/textbook/pdf/lhkv1dd.zip",
    "class12/hindi_vitan2.pdf":
        "https://ncert.nic.in/textbook/pdf/lhsv1dd.zip",
    "class12/accountancy_part1.pdf":
        "https://ncert.nic.in/textbook/pdf/leat1dd.zip",
    "class12/accountancy_part2.pdf":
        "https://ncert.nic.in/textbook/pdf/leat2dd.zip",
    "class12/business_studies_part1.pdf":
        "https://ncert.nic.in/textbook/pdf/lebs1dd.zip",
    "class12/business_studies_part2.pdf":
        "https://ncert.nic.in/textbook/pdf/lebs2dd.zip",
    "class12/economics_macro.pdf":
        "https://ncert.nic.in/textbook/pdf/leme1dd.zip",
    "class12/economics_micro.pdf":
        "https://ncert.nic.in/textbook/pdf/lemi1dd.zip",
}


def download_file(url: str, dest: Path, label: str) -> bool:
    """Download a file with progress indicator. Handles both PDF and ZIP."""
    import zipfile
    import io

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        resp = requests.get(url, headers=headers, timeout=60, stream=True)

        if resp.status_code == 404:
            print(f"  ⚠️  Not found (404): {label}")
            return False

        resp.raise_for_status()
        content = b""
        total = int(resp.headers.get("content-length", 0))
        downloaded = 0

        for chunk in resp.iter_content(chunk_size=8192):
            content += chunk
            downloaded += len(chunk)
            if total:
                pct = int(downloaded / total * 100)
                print(f"\r  ⬇️  {label}: {pct}%", end="", flush=True)

        print(f"\r  ✅ {label}: done ({len(content)//1024} KB)        ")

        # If it's a ZIP, extract the PDF from it
        if url.endswith(".zip"):
            try:
                with zipfile.ZipFile(io.BytesIO(content)) as zf:
                    pdf_files = [n for n in zf.namelist() if n.lower().endswith(".pdf")]
                    if pdf_files:
                        # Merge all PDFs in zip into one file (or just take first)
                        pdf_data = zf.read(pdf_files[0])
                        dest.write_bytes(pdf_data)
                        return True
                    else:
                        print(f"  ⚠️  No PDF found inside ZIP for {label}")
                        return False
            except zipfile.BadZipFile:
                # Maybe it's actually a PDF despite .zip extension
                dest.write_bytes(content)
                return True
        else:
            dest.write_bytes(content)
            return True

    except requests.exceptions.ConnectionError:
        print(f"  ❌ Connection error: {label}")
        return False
    except Exception as e:
        print(f"  ❌ Failed {label}: {e}")
        return False


def main():
    print("=" * 60)
    print("  NCERT PDF Downloader — Classes 9–12, All Subjects")
    print("=" * 60)
    print(f"\n📁 Saving to: {BOOKS_DIR}\n")

    # Create directories
    for cls in ["class9", "class10", "class11", "class12"]:
        (BOOKS_DIR / cls).mkdir(parents=True, exist_ok=True)

    success_count = 0
    fail_count = 0
    skip_count = 0
    total = len(NCERT_PDFS)

    for i, (rel_path, url) in enumerate(NCERT_PDFS.items(), 1):
        dest = BOOKS_DIR / rel_path
        label = rel_path

        print(f"[{i}/{total}] {label}")

        if dest.exists() and dest.stat().st_size > 10_000:
            print(f"  ⏭️  Already exists, skipping")
            skip_count += 1
            continue

        ok = download_file(url, dest, label)
        if ok:
            success_count += 1
        else:
            fail_count += 1

        time.sleep(0.5)  # Be polite to NCERT server

    print("\n" + "=" * 60)
    print(f"  ✅ Downloaded: {success_count}")
    print(f"  ⏭️  Skipped (already exist): {skip_count}")
    print(f"  ❌ Failed: {fail_count}")
    print("=" * 60)

    if success_count + skip_count > 0:
        print("\n🚀 Next step — build the knowledge base:")
        print("   python scripts/setup_cbse_kb.py")
    else:
        print("\n⚠️  No files downloaded.")
        print("   Check your internet connection or download manually from:")
        print("   https://ncert.nic.in/textbook.php")


if __name__ == "__main__":
    main()
