# -*- coding: utf-8 -*-
# r332 — probe ج: مرزِ آغاز آزمون (پایانِ ص۷۱) + سربرگِ ص۷۲
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

for pno in (71, 72, 73, 74):
    page = doc[pno - 1]
    words = page.get_text("words")
    body = [w for w in words if w[1] > 110]
    body.sort(key=lambda w: (round(w[1] / 6), -w[0]))
    rows = {}
    for w in body:
        key = round(w[1] / 6)
        rows.setdefault(key, []).append(w)
    lines = [" ".join(w[4] for w in sorted(rows[k], key=lambda w: -w[0])) for k in sorted(rows.keys())]
    print(f"=== p{pno} ({len(body)} words, {len(lines)} lines) ===")
    if pno == 71:
        for l in lines[-14:]:
            print("   ", l[:140])
    else:
        for l in lines[:26]:
            print("   ", l[:140])
    print()
