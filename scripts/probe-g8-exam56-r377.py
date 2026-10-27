# -*- coding: utf-8 -*-
# r377 — پروبِ «نمونه سؤالات امتحانی درس پنجم» هشتم (pdf-p50) + درس ششم (pdf-p60):
# (الف) رندر ۱۵۰dpi ص۴۹-۵۱ و ص۵۹-۶۱ (مرزها)؛ (ب) dumpِ لایه برای تشخیص مرزِ خانواده و سکشن‌ها
# (طبق handoff r376: جفتِ خانوادهٔ پنجم و ششم — و اگر یکی لاغر بود، دیگری پشتیبان است)
import fitz, re
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه هشتم.pdf"
OUT = Path("/tmp/qa-r377"); OUT.mkdir(parents=True, exist_ok=True)
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

print("=== RENDER p49-51 + p59-61 (150dpi) ===")
for p in (49, 50, 51, 59, 60, 61):
    page = doc[p - 1]
    pix = page.get_pixmap(dpi=150)
    pix.save(OUT / f"p{p}.png"); print(f"{OUT/f'p{p}.png'}  {pix.width}x{pix.height}")

print("\n=== LAYER p50 (family 5 candidate) ===")
for l in page_lines(50):
    print(l.rstrip()[:160])

print("\n=== LAYER p49 tail (upper boundary) ===")
for l in page_lines(49)[-10:]:
    print(l.rstrip()[:160])

print("\n=== LAYER p51 head (lower boundary) ===")
for l in page_lines(51)[:14]:
    print(l.rstrip()[:160])

print("\n=== LAYER p60 (family 6 candidate) ===")
for l in page_lines(60):
    print(l.rstrip()[:160])

print("--- p59 tail ---")
for l in page_lines(59)[-8:]:
    print(l.rstrip()[:160])
print("--- p61 head ---")
for l in page_lines(61)[:12]:
    print(l.rstrip()[:160])
