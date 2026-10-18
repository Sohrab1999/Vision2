# -*- coding: utf-8 -*-
# r333 — probe: یافتنِ «40 تست واژگان درس دوم (بخش اول)» و کلیدِ آن
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# سربرگ‌های محتمل: ص۸۰-۸۳ (آزمون؟) و کلیدِ ۲۶۴-۲۶۶
for pno in (80, 81, 82, 83, 84):
    page = doc[pno - 1]
    words = page.get_text("words")
    body = [w for w in words if w[1] > 40]
    body.sort(key=lambda w: (round(w[1] / 6), -w[0]))
    rows = {}
    for w in body:
        key = round(w[1] / 6)
        rows.setdefault(key, []).append(w)
    print(f"===== p{pno} =====")
    shown = 0
    for k in sorted(rows.keys()):
        ws = sorted(rows[k], key=lambda w: -w[0])
        y = rows[k][0][1]
        if y < 140 and shown < 6:
            print(f"y={y:6.1f}  {' '.join(w[4] for w in ws)[:150]}")
            shown += 1
    print()
