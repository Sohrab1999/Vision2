# -*- coding: utf-8 -*-
# r332 — probe ه: متنِ کاملِ ص۷۱
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

page = doc[70]
words = page.get_text("words")
body = [w for w in words if w[1] > 55]
body.sort(key=lambda w: (round(w[1] / 6), -w[0]))
rows = {}
for w in body:
    key = round(w[1] / 6)
    rows.setdefault(key, []).append(w)
for k in sorted(rows.keys()):
    ws = sorted(rows[k], key=lambda w: -w[0])
    y = rows[k][0][1]
    print(f"y={y:6.1f}  {' '.join(w[4] for w in ws)[:150]}")
