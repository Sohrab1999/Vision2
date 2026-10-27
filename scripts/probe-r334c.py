# -*- coding: utf-8 -*-
# r334 — probe ۳: x-coord ردیف‌های Q12-15 در ص۹۹ (صفحهٔ درست doc[98])
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

page = doc[98]  # p99
words = page.get_text("words")

for lo, hi, tag in [(533, 592, "Q12+13"), (592, 700, "Q14"), (700, 800, "Q15+16")]:
    print(f"=== p99 {tag} (y {lo}-{hi}) ===")
    ws = [w for w in words if lo < w[1] < hi]
    ws.sort(key=lambda w: (round(w[1]), -w[0]))
    cur = None
    for w in ws:
        yy = round(w[1])
        if yy != cur:
            print(f"  -- y={yy}")
            cur = yy
        print(f"     x1={w[0]:7.2f}  {w[4]}")
    print()
