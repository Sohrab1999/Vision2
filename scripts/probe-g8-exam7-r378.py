# -*- coding: utf-8 -*-
# r378 — پروبِ «نمونه سؤالات امتحانی درس هفتم» هشتم (pdf-p72):
# (الف) رندر ۱۵۰dpi ص۷۱-۷۳ (مرزها)؛ (ب) dumpِ لایه برای تشخیص مرزِ خانواده و سکشن‌ها
# (طبق handoff r377: پایانِ کارتِ هشتم — آخرین خانواده از ۷)
import fitz, re
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه هشتم.pdf"
OUT = Path("/tmp/qa-r378"); OUT.mkdir(parents=True, exist_ok=True)
doc = fitz.open(PDF)
LAYER = Path("/home/z/my-project/booklet-extract/g8.txt").read_text(encoding="utf-8").split("\n")
PM = {}
for i, l in enumerate(LAYER):
    m = re.match(r"<<<PAGE (\d+)>>>", l)
    if m: PM[int(m.group(1))] = i

def page_lines(p):
    start = PM[p]
    end = next((v for q, v in sorted(PM.items()) if q > p), len(LAYER))
    return LAYER[start:end]

print("total pdf pages:", doc.page_count)

print("=== RENDER p71-73 (150dpi) ===")
for p in (71, 72, 73):
    page = doc[p - 1]
    pix = page.get_pixmap(dpi=150)
    pix.save(OUT / f"p{p}.png"); print(f"{OUT/f'p{p}.png'}  {pix.width}x{pix.height}")

print("\n=== LAYER p71 tail (upper boundary) ===")
for l in page_lines(71)[-12:]:
    print(l.rstrip()[:160])

print("\n=== LAYER p72 (family 7 candidate — full) ===")
for l in page_lines(72):
    print(l.rstrip()[:160])

print("\n=== LAYER p73 head (lower boundary) ===")
for l in page_lines(73)[:16]:
    print(l.rstrip()[:160])

print("\n=== two-line title search: درس + هفتم near p72 ===")
for i, l in enumerate(LAYER):
    if PM.get(72, 0) - 3 <= i <= PM.get(73, len(LAYER)) + 3:
        if "درس" in l or "هفتم" in l or "سوال" in l or "سواال" in l:
            print(i, "|", l.rstrip()[:120])
