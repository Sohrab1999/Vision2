# -*- coding: utf-8 -*-
# r333 — probe د: کلیدِ کاملِ ص۲۶۴ + بالای ص۹۸ (سربرگِ بخش ۳؟) + پایانِ آزمون در ص۹۹
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

for pno, ylo, yhi in ((98, 30, 60), (99, 40, 130)):
    page = doc[pno - 1]
    words = page.get_text("words")
    body = [w for w in words if ylo < w[1] < yhi]
    body.sort(key=lambda w: (round(w[1] / 4), -w[0]))
    rows = {}
    for w in body:
        key = round(w[1] / 4)
        rows.setdefault(key, []).append(w)
    print(f"===== p{pno} y{ylo}-{yhi} =====")
    for k in sorted(rows.keys()):
        ws = sorted(rows[k], key=lambda w: -w[0])
        print(f"y={rows[k][0][1]:6.1f}  {' '.join(w[4] for w in ws)[:160]}")
    print()

page = doc[263]
words = page.get_text("words")
body = [w for w in words if w[1] > 40]
body.sort(key=lambda w: (round(w[1] / 6), -w[0]))
rows = {}
for w in body:
    key = round(w[1] / 6)
    rows.setdefault(key, []).append(w)
print("===== p264 FULL =====")
for k in sorted(rows.keys()):
    ws = sorted(rows[k], key=lambda w: -w[0])
    y = rows[k][0][1]
    print(f"y={y:6.1f}  {' '.join(w[4] for w in ws)[:165]}")
