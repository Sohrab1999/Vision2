# -*- coding: utf-8 -*-
# r375 — پروبِ «نمونه سؤالات امتحانی درس دوم» هشتم (pdf-p27):
# (الف) رندر ۱۵۰dpi ص۲۶-۲۸ (مرزها)؛ (ب) زوم ۳۰۰dpi برای سکشن‌های مشکوکِ تصویری؛
# (ج) dumpِ لایهٔ ص۲۷ و همسایه‌ها برای تشخیص مرزِ خانواده و سکشن‌ها
import fitz, re
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه هشتم.pdf"
OUT = Path("/tmp/qa-r375"); OUT.mkdir(parents=True, exist_ok=True)
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

print("=== RENDER p26-28 (150dpi) ===")
for p in (26, 27, 28):
    page = doc[p - 1]
    pix = page.get_pixmap(dpi=150)
    pix.save(OUT / f"p{p}.png"); print(f"{OUT/f'p{p}.png'}  {pix.width}x{pix.height}")

print("\n=== LAYER p27 ===")
for l in page_lines(27):
    print(l.rstrip()[:150])

print("\n=== LAYER p26 tail / p28 head (family boundaries) ===")
print("--- p26 (last 12 lines) ---")
for l in page_lines(26)[-12:]:
    print(l.rstrip()[:150])
print("--- p28 (first 12 lines) ---")
for l in page_lines(28)[:12]:
    print(l.rstrip()[:150])
