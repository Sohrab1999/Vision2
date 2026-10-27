# -*- coding: utf-8 -*-
# r378 — داوری: زوم ۳۰۰dpi سکشن‌های تصویری ص۷۲ + لنگرهای واژگانی درس ۷ (ص۶۱-۷۱)
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

# 300dpi full page + section crops
page = doc[71]
pix = page.get_pixmap(dpi=300)
pix.save(OUT / "p72-300.png"); print(f"{OUT/'p72-300.png'}  {pix.width}x{pix.height}")

# vocab anchor hunt in lesson-7 pages (p61..71)
terms = ["magazine", "poem", "gymnasium", "reading", "searching", "shopping", "hobby",
         "باشگاه", "مجله", "شعر", "خرید", "خواندن", "جستجو", "جست‌وجو"]
print("\n=== anchor hunt p61-71 ===")
for p in range(61, 72):
    lines = page_lines(p)
    for l in lines:
        for t in terms:
            if t in l:
                print(f"p{p}: [{t}] {l.strip()[:130]}")
                break

print("\n=== full layer p66-71 (tail of lesson 7 — vocab tables & any grammar notes) ===")
for p in range(66, 72):
    print(f"--- p{p} ---")
    for l in page_lines(p):
        s = l.rstrip()
        if s and "<<<PAGE" not in s and "جزوه کامل" not in s and "دکتر حسن" not in s:
            print(s[:150])
