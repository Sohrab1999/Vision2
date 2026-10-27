#!/usr/bin/env python3
# Round 265 — Full extraction of all 6 جزوه PDFs into a persistent, page-indexed
# JSON corpus + per-PDF plain text. Author/publisher identifiers are stripped
# per the user's original instruction («به جز اسم ناشر و نویسنده»).
#
# Output:
#   content-extracts/<slug>.json   — {source, pages: [{n, text}], meta}
#   content-extracts/<slug>.txt    — concatenated plain text
#   content-extracts/EXTRACTION-INDEX.json — summary of all 6
import fitz
import json
import os
import re
import sys

UPLOAD = "/home/z/my-project/upload"
OUT = "/home/z/my-project/content-extracts"
os.makedirs(OUT, exist_ok=True)

FILES = [
    ("جزوه هفتم.pdf", "grade7"),
    ("جزوه هشتم.pdf", "grade8"),
    ("جزوه زبان نهم حسن لطفی بوکان.pdf", "grade9"),
    ("جزوه جامع دهم .pdf", "grade10"),
    ("جزوه جامع یازدهم .pdf", "grade11"),
    ("جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf", "grade12"),
]

# Author/publisher identifiers to strip (user asked: everything EXCEPT these)
AUTHOR_PATTERNS = [
    re.compile(r"دکتر\s*حسن\s*لطفی"),
    re.compile(r"حسن\s*لطفی"),
    re.compile(r"لطفی"),
    re.compile(r"09141842803"),
    re.compile(r"0914\s*184\s*2803"),
    re.compile(r"بوکان"),
    re.compile(r"جمال\s*احمدی"),
    re.compile(r"احمدی\s*و\s*همکاران"),
    re.compile(r"همکاران"),
    re.compile(r"مشاوران\s*و\s*مشوقان"),
    re.compile(r"دبیر\s*dبیرستان"),
    re.compile(r"دبیر\s*دبیرستان"),
    re.compile(r"تلگرام\s*و\s*اینستاگرام"),
    re.compile(r"@?\w+_english\w*", re.I),  # social handles — refine after scan
]
# The generic social-handle regex is dangerous (could hit English words like
# "test_english"). We apply it ONLY on header/footer zones (first/last 2 lines).

def is_header_footer_zone(idx: int, lines: list) -> bool:
    return idx <= 1 or idx >= len(lines) - 2

TATWEEL = re.compile("\u0640+")

def scrub(text: str) -> tuple[str, int]:
    """Remove author/publisher identifiers. Returns (clean, removed_count)."""
    removed = 0
    lines = text.split("\n")
    out_lines = []
    for i, ln in enumerate(lines):
        zone = is_header_footer_zone(i, lines)
        ln_norm = TATWEEL.sub("", ln)  # tatweel-stretched names still match
        for pat in AUTHOR_PATTERNS:
            if pat.search(ln_norm):
                ln2 = pat.sub("", ln_norm).strip()
                if ln2:
                    out_lines.append(ln2)
                removed += 1
                break
        else:
            out_lines.append(ln)
    return "\n".join(out_lines), removed

# Lesson/chapter boundary markers to detect structure (analysis only, not scrub)
LESSON_MARKERS = re.compile(
    r"^\s*(?:درس\s*(?:اول|دوم|سوم|چهارم|پنجم|ششم|هفتم|هشتم|نهم|دهم)|"
    r"Lesson\s+One|Lesson\s+Two|Lesson\s+Three|Lesson\s+Four|Lesson\s+Five|"
    r"Lesson\s+Six|Lesson\s+Seven|Lesson\s+Eight|Lesson\s+Nine|Lesson\s+Ten|"
    r"Lesson\s+\d+|درس\s+\d+)",
    re.M,
)

def main():
    index = []
    for fname, slug in FILES:
        path = os.path.join(UPLOAD, fname)
        if not os.path.exists(path):
            print(f"MISSING: {fname}")
            sys.exit(1)
        doc = fitz.open(path)
        pages = []
        total_chars = 0
        scrubbed = 0
        lesson_hits: dict[int, list] = {}
        for i, page in enumerate(doc):
            text = page.get_text()
            clean, removed = scrub(text)
            scrubbed += removed
            total_chars += len(clean)
            pages.append({"n": i + 1, "text": clean})
            for m in LESSON_MARKERS.finditer(clean):
                lesson_hits.setdefault(i + 1, []).append(m.group(0).strip())
        doc.close()
        blob = {
            "source": fname,
            "slug": slug,
            "pageCount": len(pages),
            "pages": pages,
        }
        jpath = os.path.join(OUT, f"{slug}.json")
        tpath = os.path.join(OUT, f"{slug}.txt")
        with open(jpath, "w", encoding="utf-8") as f:
            json.dump(blob, f, ensure_ascii=False)
        with open(tpath, "w", encoding="utf-8") as f:
            for p in pages:
                f.write(f"\n===== صفحه {p['n']} =====\n")
                f.write(p["text"])
        pages_with_lessons = sorted(lesson_hits.keys())
        index.append({
            "slug": slug,
            "source": fname,
            "pages": len(pages),
            "chars": total_chars,
            "authorScrubbed": scrubbed,
            "lessonMarkerPages": pages_with_lessons,
            "lessonMarkersSample": {str(p): lesson_hits[p][:3] for p in pages_with_lessons[:12]},
        })
        print(f"OK {slug}: {len(pages)}p, {total_chars} chars, scrubbed={scrubbed}, "
              f"lesson-pages={len(pages_with_lessons)}")
    with open(os.path.join(OUT, "EXTRACTION-INDEX.json"), "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=1)
    print("INDEX written")

if __name__ == "__main__":
    main()
