# -*- coding: utf-8 -*-
# r376 — پروبِ «نمونه سؤالات امتحانی درس سوم» هشتم (pdf-p35):
# (الف) رندر ۱۵۰dpi ص۳۴-۳۶ (مرزها)؛ (ب) dumpِ لایهٔ ص۳۵ و همسایه‌ها برای تشخیص مرزِ خانواده و سکشن‌ها
# (طبق handoff r375: اگر لاغر بود → جفت با درس چهارم ص۴۱ — پس ص۴۰-۴۲ هم dump می‌شود)
import fitz, re
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه هشتم.pdf"
OUT = Path("/tmp/qa-r376"); OUT.mkdir(parents=True, exist_ok=True)
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

print("=== RENDER p34-36 (150dpi) ===")
for p in (34, 35, 36):
    page = doc[p - 1]
    pix = page.get_pixmap(dpi=150)
    pix.save(OUT / f"p{p}.png"); print(f"{OUT/f'p{p}.png'}  {pix.width}x{pix.height}")

print("\n=== LAYER p35 (family 3 candidate) ===")
for l in page_lines(35):
    print(l.rstrip()[:160])

print("\n=== LAYER p34 tail (upper boundary) ===")
for l in page_lines(34)[-10:]:
    print(l.rstrip()[:160])

print("\n=== LAYER p36 head (lower boundary) ===")
for l in page_lines(36)[:14]:
    print(l.rstrip()[:160])

print("\n=== LAYER p41 (family 4 candidate — pair if p35 is lean) ===")
for l in page_lines(41):
    print(l.rstrip()[:160])
print("--- p40 tail ---")
for l in page_lines(40)[-6:]:
    print(l.rstrip()[:160])
print("--- p42 head ---")
for l in page_lines(42)[:10]:
    print(l.rstrip()[:160])
