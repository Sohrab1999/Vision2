# -*- coding: utf-8 -*-
# r333 — probe ب: فهرستِ ص۷۵ کامل + کلیدهای ۲۶۴-۲۶۸
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

page = doc[74]
words = page.get_text("words")
body = [w for w in words if w[1] > 55]
body.sort(key=lambda w: (round(w[1] / 6), -w[0]))
rows = {}
for w in body:
    key = round(w[1] / 6)
    rows.setdefault(key, []).append(w)
print("=== p75 TOC full ===")
for k in sorted(rows.keys()):
    ws = sorted(rows[k], key=lambda w: -w[0])
    y = rows[k][0][1]
    print(f"y={y:6.1f}  {' '.join(w[4] for w in ws)[:140]}")

print()
for pno in (264, 265, 266, 267, 268):
    page = doc[pno - 1]
    words = page.get_text("words")
    body = [w for w in words if w[1] > 40]
    body.sort(key=lambda w: (round(w[1] / 6), -w[0]))
    rows = {}
    for w in body:
        key = round(w[1] / 6)
        rows.setdefault(key, []).append(w)
    print(f"===== p{pno} top =====")
    shown = 0
    for k in sorted(rows.keys()):
        ws = sorted(rows[k], key=lambda w: -w[0])
        y = rows[k][0][1]
        if y < 130 and shown < 5:
            print(f"y={y:6.1f}  {' '.join(w[4] for w in ws)[:150]}")
            shown += 1
    print()
