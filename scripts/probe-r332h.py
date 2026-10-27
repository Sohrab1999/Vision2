# -*- coding: utf-8 -*-
# r332 — probe ح: رندرِ سربرگ‌ها + بقیهٔ ص۲۵۷
import fitz
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
OUT = Path("/tmp/r332"); OUT.mkdir(exist_ok=True)
doc = fitz.open(PDF)

# سربرگ ص۲۵۴ (کلید)
pix = doc[253].get_pixmap(dpi=2400, clip=fitz.Rect(40, 25, 555, 62))
pix.save(str(OUT / "p254-keyheader.png")); print("p254-keyheader", pix.width, pix.height)

# سربرگ ص۷۲ (آزمون — بالای Q1)
pix = doc[71].get_pixmap(dpi=2400, clip=fitz.Rect(40, 25, 555, 72))
pix.save(str(OUT / "p72-header.png")); print("p72-header", pix.width, pix.height)

# بقیهٔ ص۲۵۷ (Q36-40)
page = doc[256]
words = page.get_text("words")
body = [w for w in words if w[1] > 355]
body.sort(key=lambda w: (round(w[1] / 6), -w[0]))
rows = {}
for w in body:
    key = round(w[1] / 6)
    rows.setdefault(key, []).append(w)
print("=== p257 tail ===")
for k in sorted(rows.keys()):
    ws = sorted(rows[k], key=lambda w: -w[0])
    y = rows[k][0][1]
    print(f"y={y:6.1f}  {' '.join(w[4] for w in ws)[:160]}")

# لایهٔ ص۷۲ بالای y=72 (سربرگ؟)
print("=== p72 y<72 layer ===")
w2 = [w for w in doc[71].get_text("words") if w[1] < 72]
w2.sort(key=lambda w: (round(w[1] / 5), -w[0]))
rows2 = {}
for w in w2:
    key = round(w[1] / 5)
    rows2.setdefault(key, []).append(w)
for k in sorted(rows2.keys()):
    ws = sorted(rows2[k], key=lambda w: -w[0])
    print(f"y={rows2[k][0][1]:6.1f}  {' '.join(w[4] for w in ws)[:150]}")
