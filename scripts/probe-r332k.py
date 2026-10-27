# -*- coding: utf-8 -*-
# r332 — probe ک: ساقه‌های Q17 و Q33
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

for pno in (72, 73, 74):
    page = doc[pno - 1]
    words = page.get_text("words")
    hits = [w for w in words if "17" in w[4] or "33" in w[4]]
    for w in hits:
        print(f"p{pno} y={w[1]:.1f} x={w[0]:.1f} word='{w[4]}'")

# پایینِ ص۷۲ — همهٔ سطرها تا فوتر
page = doc[71]
words = page.get_text("words")
body = [w for w in words if 780 < w[1] < 812]
body.sort(key=lambda w: (round(w[1] / 3), -w[0]))
rows = {}
for w in body:
    key = round(w[1] / 3)
    rows.setdefault(key, []).append(w)
print("=== p72 bottom y780-812 ===")
for k in sorted(rows.keys()):
    ws = sorted(rows[k], key=lambda w: -w[0])
    print(f"y={rows[k][0][1]:6.1f}  {' '.join(w[4] for w in ws)[:170]}")

# بالای ص۷۴ — سطرهای y35-78 با فاصلهٔ ۲
page = doc[73]
words = page.get_text("words")
body = [w for w in words if 20 < w[1] < 78]
body.sort(key=lambda w: (round(w[1] / 3), -w[0]))
rows = {}
for w in body:
    key = round(w[1] / 3)
    rows.setdefault(key, []).append(w)
print("=== p74 top y20-78 (fine) ===")
for k in sorted(rows.keys()):
    ws = sorted(rows[k], key=lambda w: -w[0])
    print(f"y={rows[k][0][1]:6.1f}  {' '.join(w[4] for w in ws)[:170]}")
