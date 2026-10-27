# -*- coding: utf-8 -*-
# r343 — رندرِ صفحاتِ آزمون (ص۱۳۸-۱۴۰) و کلیدِ (ص۲۸۳-۲۸۶) برای داوری
import fitz
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
OUT = Path("/tmp/r343")
OUT.mkdir(exist_ok=True)
doc = fitz.open(PDF)

# ۱) تمام‌صفحه‌های ۳۰۰dpi برای گزینش‌ها/ساقه‌ها/برچسب‌ها
for pno in (137, 138, 139, 282, 283, 284, 285):
    pix = doc[pno].get_pixmap(dpi=300)
    p = OUT / f"full-p{pno+1}.png"
    pix.save(p)
    print(p, pix.width, "x", pix.height)

# ۲) نوارهای ۶۰۰dpi از صفحاتِ کلید (هر نوار حدودِ ۹۵۰x۱۳۰۰ → خوانا در نمایش)
for pno in (282, 283, 284, 285):
    page = doc[pno]
    W, H = page.rect.width, page.rect.height
    for band in range(4):
        clip = fitz.Rect(0, H * band / 4, W, H * (band + 1) / 4 + 6)
        pix = page.get_pixmap(dpi=600, clip=clip)
        p = OUT / f"key-p{pno+1}-b{band}.png"
        pix.save(p)
        print(p, pix.width, "x", pix.height)

# ۳) سربرگِ آزمونِ ص۱۳۸ و سربرگِ کلیدِ ص۲۸۳ با ۱۲۰۰dpi
for pno, ytop, h in ((137, 0.06, 0.14), (282, 0.06, 0.14)):
    page = doc[pno]
    W, H = page.rect.width, page.rect.height
    clip = fitz.Rect(0, H * ytop, W, H * (ytop + h))
    pix = page.get_pixmap(dpi=1200, clip=clip)
    p = OUT / f"hdr-p{pno+1}.png"
    pix.save(p)
    print(p, pix.width, "x", pix.height)
