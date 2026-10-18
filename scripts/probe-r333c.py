# -*- coding: utf-8 -*-
# r333 — probe ج: آزمونِ تشریحیِ گرامر «انواع صفات» ص۹۷-۹۸ + کلید ص۲۶۴
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

for pno in (97, 98, 264):
    page = doc[pno - 1]
    words = page.get_text("words")
    body = [w for w in words if w[1] > 40]
    body.sort(key=lambda w: (round(w[1] / 6), -w[0]))
    rows = {}
    for w in body:
        key = round(w[1] / 6)
        rows.setdefault(key, []).append(w)
    print(f"===== p{pno} =====")
    for k in sorted(rows.keys()):
        ws = sorted(rows[k], key=lambda w: -w[0])
        y = rows[k][0][1]
        print(f"y={y:6.1f}  {' '.join(w[4] for w in ws)[:160]}")
    print()
