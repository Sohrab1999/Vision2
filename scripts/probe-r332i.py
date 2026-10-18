# -*- coding: utf-8 -*-
# r332 — probe ط: سطر به سطرِ ص۷۲-۷۴ (آزمون)
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

for pno in (72, 73, 74):
    page = doc[pno - 1]
    words = page.get_text("words")
    body = [w for w in words if w[1] > 60]
    body.sort(key=lambda w: (round(w[1] / 7), -w[0]))
    rows = {}
    for w in body:
        key = round(w[1] / 7)
        rows.setdefault(key, []).append(w)
    print(f"===== p{pno} =====")
    for k in sorted(rows.keys()):
        ws = sorted(rows[k], key=lambda w: -w[0])
        y = rows[k][0][1]
        print(f"y={y:6.1f}  {' '.join(w[4] for w in ws)[:170]}")
    print()
