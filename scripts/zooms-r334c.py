# -*- coding: utf-8 -*-
# r334 — اولترازوم ۱۲x برای نقاطِ ریزِ سرنوشت‌ساز
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)
OUT = "/tmp"

R = [
    ("z18", 266, (600, 620)),   # Q18 ترجمه: آلمانی/فتنگ/سیکلرت
    ("z12", 266, (104, 124)),   # Q12 ترجمه: گربهٔ/آسیای/دارد
    ("z06", 265, (478, 500)),   # Q6 ترجمه: خوشمزه ایه
    ("z14", 266, (290, 314)),   # Q14 ترجمه: زندگی بالانویس؟ چوبی/قدیمی
    ("z15", 266, (388, 410)),   # Q15 ترجمه: قدیمی بالانویس؟
    ("z20", 266, (694, 742)),   # Q20 توضیح کامل + ترجمه
    ("z08", 265, (584, 606)),   # Q8 ترجمه: زندگی بالانویس دقیق
]

for label, pno, (y0, y1) in R:
    page = doc[pno - 1]
    pix = page.get_pixmap(matrix=fitz.Matrix(12, 12), clip=fitz.Rect(20, y0, page.rect.width - 20, y1))
    pix.save(f"{OUT}/r334-{label}.png")
    print(label, pix.width, pix.height)
