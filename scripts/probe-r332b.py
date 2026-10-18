# -*- coding: utf-8 -*-
# r332 — probe ب: بدنهٔ ص۷۲..۸۳ برای یافتن سربرگ آزمون‌ها
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

for pno in range(72, 84):
    page = doc[pno - 1]
    words = page.get_text("words")
    # فقط واژه‌های پایین سربرگ (y > 110)
    body = [w for w in words if w[1] > 110]
    body.sort(key=lambda w: (round(w[1]), -w[0]))
    # سطرها را بساز
    rows = {}
    for w in body:
        key = round(w[1] / 6)
        rows.setdefault(key, []).append(w)
    print(f"=== p{pno} ({len(body)} words) ===")
    out_lines = []
    for key in sorted(rows.keys()):
        ws = sorted(rows[key], key=lambda w: -w[0])
        line = " ".join(w[4] for w in ws)
        out_lines.append(line)
    for l in out_lines[:10]:
        print("   ", l[:130])
    print()
