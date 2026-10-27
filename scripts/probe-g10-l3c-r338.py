# -*- coding: utf-8 -*-
# r338 — کلیدِ چاپیِ آزمونِ تشریحیِ واژگانِ درسِ سوم: ص۲۷۴ (سربرگ + محتوا) + ص۱۲۳ نیمهٔ بالا برایِ مرز
import fitz
from pathlib import Path

PDF = "upload/جزوه جامع دهم .pdf"
OUT = Path("/tmp")
doc = fitz.open(PDF)

# ص۲۷۴ (ایندکس ۲۷۳) — کلیدِ احتمالی
for pno, dpi, tag in [(273, 150, "key-150"), (273, 300, "key-300")]:
    page = doc[pno]
    pix = page.get_pixmap(dpi=dpi)
    out = OUT / f"r338-p{pno+1:03d}-{tag}.png"
    pix.save(out)
    print(out, pix.width, "x", pix.height)

# ص۱۲۳ نیمهٔ بالا — مرزِ آزمونِ بعدی
page = doc[122]
rect = page.rect
clip = fitz.Rect(rect.x0, rect.y0, rect.x1, rect.y0 + rect.height * 0.25)
pix = page.get_pixmap(dpi=300, clip=clip)
pix.save(OUT / "r338-p123-head-300.png")
print(OUT / "r338-p123-head-300.png", pix.width, "x", pix.height)
print("done")
