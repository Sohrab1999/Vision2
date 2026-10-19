# -*- coding: utf-8 -*-
# r369 — پروبِ «سؤالات امتحانی درس ششم» نهم (pdf-p95+):
# (الف) مرزِ دقیقِ خانواده: سربرگِ امتحانیِ درس ششم کجاست و تا کجا؟ (پایانِ کارت؟ بخشِ بعدی؟)
# (ب) رندر ۱۵۰dpi برای داوریِ چیدمانِ چاپی
# (ج) لایهٔ متنیِ کاملِ بازه
# (د) لنگرهای درس ششم: واژگانِ p89 (سلامتی و آسیب‌ها) + photo dictionary p90 + مکالمهٔ p91+
import fitz
import re
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه زبان نهم حسن لطفی بوکان.pdf"
OUT = Path("/tmp/qa-r369")
OUT.mkdir(parents=True, exist_ok=True)
doc = fitz.open(PDF)

LAYER = Path("/home/z/my-project/booklet-extract/g9.txt").read_text(encoding="utf-8").split("\n")
PM = {}
for i, l in enumerate(LAYER):
    m = re.match(r"<<<PAGE (\d+)>>>", l)
    if m:
        PM[int(m.group(1))] = i

def page_lines(p: int) -> list[str]:
    start = PM[p]
    end = next((v for q, v in sorted(PM.items()) if q > p), len(LAYER))
    return LAYER[start:end]

# ————— مرزِ خانواده —————
for p in range(93, 118):
    seg = page_lines(p)
    joined = "\n".join(seg)
    marks = []
    if re.search(r"سوا?الت امتحانی درس ششم", joined):
        marks.append("EXAM6-HEADER")
    if re.search(r"Lesson\s*7|درس هفتم", joined, re.I):
        marks.append("L7?")
    if re.search(r"پاسخنامه|کلید", joined):
        marks.append("KEY?")
    if re.search(r"جمع|تست.*(چند|۳۶۰|360)|آزمون جامع", joined):
        marks.append("SUMMARY/COMPREHENSIVE?")
    print(f"pdf-p{p}: {marks if marks else '-'}")

print("\n=== RENDER ===")
for pno in range(94, 118):
    page = doc[pno - 1]
    pix = page.get_pixmap(dpi=150)
    f = OUT / f"p{pno}.png"
    pix.save(f)
    print(f"{f}  {pix.width}x{pix.height}")

print("\n=== LAYER ===")
for p in range(94, 118):
    seg = page_lines(p)
    print(f"\n===== pdf-p{p} ({len(seg)} lines) =====")
    for j, s in enumerate(seg):
        print(f"{j:03d}| {s}")
