# -*- coding: utf-8 -*-
# r372 — زومِ ۳۰۰dpi بلنکِ b-B سکشن۱ ص۹۰ + جست‌وجوی لنگرِ چاپی پوشاک/رنگ در کل لایه
import fitz, re
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه هفتم.pdf"
OUT = Path("/tmp/qa-r372"); OUT.mkdir(parents=True, exist_ok=True)
doc = fitz.open(PDF)

# (الف) زوم: p90 ناحیهٔ سکشن ۱ (نیمهٔ بالایی، سمت چپ = ستون B)
page = doc[89]
r = page.rect
clip = fitz.Rect(r.x0, r.y0 + r.height * 0.12, r.x1, r.y0 + r.height * 0.42)
pix = page.get_pixmap(dpi=300, clip=clip)
f = OUT / "p90-s1-zoom.png"; pix.save(f)
print(f"{f}  {pix.width}x{pix.height}")

LAYER = Path("/home/z/my-project/booklet-extract/g7.txt").read_text(encoding="utf-8").split("\n")

# (ب) لنگرِ چاپیِ پوشاک — کلیدهای کاندید س۵ خ۵
print("\n=== CLOTHING ANCHORS (chador/scarf/shawl/shoe/suit...) ===")
pats = ["chador","scarf","shawl","shoe","suit","clothes","hat","dress","coat","trousers","slipper","manteau"]
hits = 0
for i, l in enumerate(LAYER):
    for w in pats:
        if re.search(rf"\b{w}\b", l, re.I):
            pg = "?"
            for j in range(i, -1, -1):
                m = re.match(r"<<<PAGE (\d+)>>>", LAYER[j])
                if m: pg = m.group(1); break
            print(f"p{pg}| {l.strip()[:120]}")
            hits += 1
if not hits: print("(no hit)")

# (ج) لنگرِ چاپیِ رنگ‌ها — کلیدهای س۴ خ۵
print("\n=== COLOR ANCHORS (yellow/blue/black/brown...) ===")
for i, l in enumerate(LAYER):
    if re.search(r"\b(yellow|blue|black|brown)\b", l, re.I):
        pg = "?"
        for j in range(i, -1, -1):
            m = re.match(r"<<<PAGE (\d+)>>>", LAYER[j])
            if m: pg = m.group(1); break
        print(f"p{pg}| {l.strip()[:120]}")
