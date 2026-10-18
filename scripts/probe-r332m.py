# -*- coding: utf-8 -*-
# r332 — probe م: پایینِ ص۲۵۵ (Q20-22) + بالای ص۲۵۶ (Q22 ادامه؟)
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

page = doc[254]
words = page.get_text("words")
body = [w for w in words if w[1] > 600]
body.sort(key=lambda w: (round(w[1] / 5), -w[0]))
rows = {}
for w in body:
    key = round(w[1] / 5)
    rows.setdefault(key, []).append(w)
print("=== p255 tail (y>600) ===")
for k in sorted(rows.keys()):
    ws = sorted(rows[k], key=lambda w: -w[0])
    print(f"y={rows[k][0][1]:6.1f}  {' '.join(w[4] for w in ws)[:160]}")

page = doc[255]
words = page.get_text("words")
body = [w for w in words if w[1] < 60]
body.sort(key=lambda w: (round(w[1] / 5), -w[0]))
rows = {}
for w in body:
    key = round(w[1] / 5)
    rows.setdefault(key, []).append(w)
print("=== p256 top (y<60) ===")
for k in sorted(rows.keys()):
    ws = sorted(rows[k], key=lambda w: -w[0])
    print(f"y={rows[k][0][1]:6.1f}  {' '.join(w[4] for w in ws)[:160]}")
