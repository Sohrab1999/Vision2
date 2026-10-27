# -*- coding: utf-8 -*-
# r332 — probe د: متنِ کاملِ ص۷۲ (همهٔ ناحیه) برای یافتن سربرگ و Q1
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

page = doc[71]
words = page.get_text("words")
body = [w for w in words if w[1] > 55]
body.sort(key=lambda w: (round(w[1] / 6), -w[0]))
rows = {}
for w in body:
    key = round(w[1] / 6)
    rows.setdefault(key, []).append(w)
lines = []
for k in sorted(rows.keys()):
    ws = sorted(rows[k], key=lambda w: -w[0])
    y = rows[k][0][1]
    lines.append((y, " ".join(w[4] for w in ws)))
for y, l in lines[:12]:
    print(f"y={y:6.1f}  {l[:150]}")
