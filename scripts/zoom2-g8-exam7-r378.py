# -*- coding: utf-8 -*-
# r378 — لایهٔ کامل ص۶۱-۶۳ (لنگرها) + کراپ‌های ۳۰۰dpi سکشن‌های ص۷۲
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

for p in (61, 62, 63):
    print(f"--- p{p} full ---")
    for l in page_lines(p):
        s = l.rstrip()
        if s and "<<<PAGE" not in s and "جزوه کامل" not in s and "دکتر حسن" not in s:
            print(s[:150])

# 300dpi crops of p72: top (S1+S2) and bottom (S3 table)
page = doc[71]
W, H = page.rect.width, page.rect.height
crops = [("p72-top", 0.0, 0.42), ("p72-mid", 0.30, 0.72), ("p72-bot", 0.55, 1.0)]
for name, y0, y1 in crops:
    clip = fitz.Rect(0, H * y0, W, H * y1)
    pix = page.get_pixmap(dpi=300, clip=clip)
    pix.save(OUT / f"{name}.png")
    print(f"{OUT/(name + '.png')}  {pix.width}x{pix.height}")
