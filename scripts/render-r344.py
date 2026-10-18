# -*- coding: utf-8 -*-
# r344 — رندرِ صفحاتِ هدف (ص۱۲۷-۱۳۰) برای داوری: بلوکِ ۴تاییِ کنکورِ ص۱۲۸، کلیدِ همان صفحه، تمرینِ ص۱۳۰
import fitz
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
OUT = Path("/tmp/r344")
OUT.mkdir(exist_ok=True)
doc = fitz.open(PDF)

# ۱) تمام‌صفحه‌های ۳۰۰dpi
for pno in (127, 128, 129, 130):
    pix = doc[pno].get_pixmap(dpi=300)
    p = OUT / f"full-p{pno+1}.png"
    pix.save(p)
    print(p, pix.width, "x", pix.height)

# ۲) نوارهای ۶۰۰dpi از ص۱۲۸ (بلوکِ تست‌ها + کلید) و ص۱۳۰ (تمرین + Answer Key)
for pno in (128, 130):
    page = doc[pno]
    W, H = page.rect.width, page.rect.height
    for band in range(4):
        clip = fitz.Rect(0, H * band / 4, W, H * (band + 1) / 4 + 6)
        pix = page.get_pixmap(dpi=600, clip=clip)
        p = OUT / f"p{pno+1}-b{band}.png"
        pix.save(p)
        print(p, pix.width, "x", pix.height)

# ۳) سربرگِ بلوکِ کنکورِ ص۱۲۸ با ۱۲۰۰dpi (تقریباً ۷۰-۷۵٪ ارتفاعِ صفحه)
page = doc[128]
W, H = page.rect.width, page.rect.height
clip = fitz.Rect(0, H * 0.55, W, H * 0.78)
pix = page.get_pixmap(dpi=1200, clip=clip)
p = OUT / "hdr-p129-testsblock.png"
pix.save(p)
print(p, pix.width, "x", pix.height)

# ۴) سربرگِ «تمرین افعال حالت و کنشی» ص۱۳۰ با ۱۲۰۰dpi
page = doc[129]
W, H = page.rect.width, page.rect.height
clip = fitz.Rect(0, H * 0.42, W, H * 0.60)
pix = page.get_pixmap(dpi=1200, clip=clip)
p = OUT / "hdr-p130-drill.png"
pix.save(p)
print(p, pix.width, "x", pix.height)
