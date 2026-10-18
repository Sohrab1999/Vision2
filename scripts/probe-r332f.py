# -*- coding: utf-8 -*-
# r332 — probe و: کلیدِ ص۲۵۴-۲۵۷
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

for pno in (254, 255, 256, 257):
    page = doc[pno - 1]
    words = page.get_text("words")
    body = [w for w in words if w[1] > 55]
    body.sort(key=lambda w: (round(w[1] / 6), -w[0]))
    rows = {}
    for w in body:
        key = round(w[1] / 6)
        rows.setdefault(key, []).append(w)
    print(f"===== p{pno} ({len(body)} words) =====")
    for k in sorted(rows.keys()):
        ws = sorted(rows[k], key=lambda w: -w[0])
        y = rows[k][0][1]
        print(f"y={y:6.1f}  {' '.join(w[4] for w in ws)[:160]}")
    print()
