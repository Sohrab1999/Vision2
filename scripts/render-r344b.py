# -*- coding: utf-8 -*-
# r344b — رندرِ درست: بلوکِ ۴تاییِ کنکور + کلیدِ آن در صفحهٔ ۱۲۸ (pno=127) و تمرینِ صفحهٔ ۱۳۰ (pno=129)
import fitz
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
OUT = Path("/tmp/r344")
OUT.mkdir(exist_ok=True)
doc = fitz.open(PDF)

# نوارهای ۶۰۰dpi از ص۱۲۸ (بلوکِ تست‌ها + کلید) و ص۱۳۰ (تمرین + Answer Key)
for pno in (127, 129):
    page = doc[pno]
    W, H = page.rect.width, page.rect.height
    for band in range(4):
        clip = fitz.Rect(0, H * band / 4, W, H * (band + 1) / 4 + 6)
        pix = page.get_pixmap(dpi=600, clip=clip)
        p = OUT / f"pg{pno+1}-b{band}.png"
        pix.save(p)
        print(p, pix.width, "x", pix.height)

# سربرگِ بلوکِ کنکورِ ص۱۲۸ با ۱۲۰۰dpi (ناحیهٔ ۵۵-۷۸٪ ارتفاع)
page = doc[127]
W, H = page.rect.width, page.rect.height
clip = fitz.Rect(0, H * 0.55, W, H * 0.78)
pix = page.get_pixmap(dpi=1200, clip=clip)
p = OUT / "hdr-pg128-testsblock.png"
pix.save(p)
print(p, pix.width, "x", pix.height)
