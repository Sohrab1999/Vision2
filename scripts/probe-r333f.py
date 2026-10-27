# -*- coding: utf-8 -*-
# r333 — probe و: سربرگِ آزمونِ ص۹۷ + سربرگِ بخش ۳ ص۹۸
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

for pno, ylo, yhi, step in ((97, 15, 70, 3), (98, 15, 56, 3)):
    page = doc[pno - 1]
    words = page.get_text("words")
    body = [w for w in words if ylo < w[1] < yhi]
    body.sort(key=lambda w: (round(w[1] / step), -w[0]))
    rows = {}
    for w in body:
        key = round(w[1] / step)
        rows.setdefault(key, []).append(w)
    print(f"===== p{pno} y{ylo}-{yhi} =====")
    for k in sorted(rows.keys()):
        ws = sorted(rows[k], key=lambda w: -w[0])
        print(f"y={rows[k][0][1]:6.1f}  {' '.join(w[4] for w in ws)[:165]}")
    print()
