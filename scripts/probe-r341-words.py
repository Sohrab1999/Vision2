# -*- coding: utf-8 -*-
# r341 — نقشهٔ y سطرهای «ترجمه تست» ص۲۷۹-۲۸۰ با لایهٔ واژه‌محور
import fitz

doc = fitz.open("/home/z/my-project/upload/جزوه جامع دهم .pdf")

for pno in (278, 279):
    page = doc[pno]
    words = page.get_text("words")  # x0,y0,x1,y1,word,block,line,word_no
    print(f"########## PAGE {pno+1} word-layer ({len(words)} words) ##########")
    # گروه‌بندی بر اساس سطر (y0 rounded)
    rows = {}
    for w in words:
        key = round(w[1], 0)
        rows.setdefault(key, []).append(w)
    for y in sorted(rows):
        ws = sorted(rows[y], key=lambda w: -w[0])  # RTL visual order
        text = " ".join(w[4] for w in ws)
        if any(k in text for k in ("ترجمه", "گزینه", "استفاده", "ضمیر", "حذف", "توصیف")):
            print(f"y={y:6.1f}  {text[:150]}")
    print()
