# -*- coding: utf-8 -*-
# r334 — probe: «۲۰ تست دستگرمی گرامر و نگارش» ص۹۹-۱۰۰ + کلید ص۲۶۵-۲۶۶ (+ مرزها ص۱۰۱ و ص۲۶۷)
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

for pno in (99, 100, 101):
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
        print(f"y={y:6.1f}  {' '.join(w[4] for w in ws)[:170]}")
    print()

for pno in (265, 266, 267):
    page = doc[pno - 1]
    words = page.get_text("words")
    body = [w for w in words if w[1] > 40]
    body.sort(key=lambda w: (round(w[1] / 6), -w[0]))
    rows = {}
    for w in body:
        key = round(w[1] / 6)
        rows.setdefault(key, []).append(w)
    print(f"===== KEY p{pno} =====")
    for k in sorted(rows.keys()):
        ws = sorted(rows[k], key=lambda w: -w[0])
        y = rows[k][0][1]
        print(f"y={y:6.1f}  {' '.join(w[4] for w in ws)[:170]}")
    print()
