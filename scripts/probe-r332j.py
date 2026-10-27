# -*- coding: utf-8 -*-
# r332 — probe ی: یافتنِ Q17 و Q33 (بالای ص۷۳/ص۷۴)
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

for pno in (73, 74):
    page = doc[pno - 1]
    words = page.get_text("words")
    body = [w for w in words if w[1] > 35]
    body.sort(key=lambda w: (round(w[1] / 5), -w[0]))
    rows = {}
    for w in body:
        key = round(w[1] / 5)
        rows.setdefault(key, []).append(w)
    print(f"===== p{pno} top (y<100) =====")
    for k in sorted(rows.keys()):
        ws = sorted(rows[k], key=lambda w: -w[0])
        y = rows[k][0][1]
        if y < 100:
            print(f"y={y:6.1f}  {' '.join(w[4] for w in ws)[:170]}")
    print()
