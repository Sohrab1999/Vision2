# -*- coding: utf-8 -*-
# r332 — probe ل: بالای ص۷۳ ریز (Q17)
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

page = doc[72]
words = page.get_text("words")
body = [w for w in words if 15 < w[1] < 70]
body.sort(key=lambda w: (round(w[1] / 3), -w[0]))
rows = {}
for w in body:
    key = round(w[1] / 3)
    rows.setdefault(key, []).append(w)
print("=== p73 top fine ===")
for k in sorted(rows.keys()):
    ws = sorted(rows[k], key=lambda w: -w[0])
    print(f"y={rows[k][0][1]:6.1f}  {' '.join(w[4] for w in ws)[:170]}")
