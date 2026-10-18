# -*- coding: utf-8 -*-
# r338 — پروبِ ص۱۲۰-۱۲۴: آزمونِ تشریحیِ واژگانِ درسِ سوم + کلیدِ چاپی
import fitz
from pathlib import Path

PDF = "upload/جزوه جامع دهم .pdf"
OUT = Path("/tmp")
doc = fitz.open(PDF)
# ۱۵۰dpi برای نقشهٔ سکشن‌ها + ۳۰۰dpi برای سربرگ‌ها
for pno in range(119, 124):
    page = doc[pno]
    pix = page.get_pixmap(dpi=150)
    out = OUT / f"r338-p{pno+1:03d}-150.png"
    pix.save(out)
    print(out, pix.width, "x", pix.height)
# سربرگِ ص۱۲۰ با ۳۰۰dpi (نیمهٔ بالا)
page = doc[119]
rect = page.rect
clip = fitz.Rect(rect.x0, rect.y0, rect.x1, rect.y0 + rect.height * 0.45)
pix = page.get_pixmap(dpi=300, clip=clip)
pix.save(OUT / "r338-p120-head-300.png")
print(OUT / "r338-p120-head-300.png", pix.width, "x", pix.height)
print("done")
