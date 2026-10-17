# -*- coding: utf-8 -*-
# r331 — زوم‌های «آزمون جامع تستی درس اول» ص۶۸-۷۱ + کلید ص۲۵۲-۲۵۳
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
OUT = "/tmp/r331"
import os
os.makedirs(OUT, exist_ok=True)
doc = fitz.open(PDF)

def band(pno, y0, y1, name, dpi=1400):
    page = doc[pno - 1]
    r = fitz.Rect(35, y0, 560, y1) & page.rect
    pix = page.get_pixmap(dpi=dpi, clip=r)
    pix.save(f"{OUT}/{name}.png")
    print(f"{name}: p{pno} y{y0}-{y1} -> {pix.width}x{pix.height}")

# ص۶۸: سربرگ + بخش ۱ (کلمات ناقص) + بخش ۲ (بانک واژه) + بخش ۳ (تعریف) + بخش ۴ (متفاوت)
band(68, 85, 200, "p68-s1")
band(68, 195, 330, "p68-s2-s3")
band(68, 320, 460, "p68-s4")
# ص۶۹: بخش ۵ و ۶ (چهارگزینه‌ای) + ۷ (جمله‌سازی) + ۸ (سؤال‌سازی - زیرخط!)
band(69, 85, 290, "p69-s5")
band(69, 280, 420, "p69-s6-s7")
band(69, 400, 520, "p69-s8", dpi=1600)
# ص۷۰: بخش ۹ (تصاویر) + ۱۰ (شکل افعال) + ۱۱ (آهنگ) + ۱۲ (ستون)
band(70, 85, 260, "p70-s9", dpi=1500)
band(70, 250, 380, "p70-s10-s11")
band(70, 370, 500, "p70-s12")
# ص۷۱: بخش ۱۳ (کلوز) + ۱۴ (درک مطلب)
band(71, 85, 330, "p71-s13", dpi=1300)
band(71, 320, 540, "p71-s14", dpi=1300)
# کلید ص۲۵۲: بخش ۴-۸
band(252, 240, 420, "k252-s4-s6", dpi=1300)
band(252, 400, 540, "k252-s7-s8", dpi=1300)
# کلید ص۲۵۳: بخش ۹-۱۴
band(253, 85, 200, "k253-s9-s10", dpi=1400)
band(253, 190, 380, "k253-s11-s13", dpi=1300)
band(253, 360, 480, "k253-s14", dpi=1300)
