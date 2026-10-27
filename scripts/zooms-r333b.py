# -*- coding: utf-8 -*-
# r333 — رندرِ بخش‌های S2 (ص۹۷) و S3/S4 (ص۹۸) برای رونویسیِ دقیق
import fitz
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
OUT = Path("/tmp/r333"); OUT.mkdir(exist_ok=True)
doc = fitz.open(PDF)

pix = doc[96].get_pixmap(dpi=2200, clip=fitz.Rect(35, 470, 558, 805))
pix.save(str(OUT / "p97-S2.png")); print("p97-S2", pix.width, pix.height)
pix = doc[97].get_pixmap(dpi=2200, clip=fitz.Rect(35, 20, 558, 250))
pix.save(str(OUT / "p98-S3.png")); print("p98-S3", pix.width, pix.height)
pix = doc[97].get_pixmap(dpi=2200, clip=fitz.Rect(35, 250, 558, 560))
pix.save(str(OUT / "p98-S4a.png")); print("p98-S4a", pix.width, pix.height)
pix = doc[97].get_pixmap(dpi=2200, clip=fitz.Rect(35, 555, 558, 800))
pix.save(str(OUT / "p98-S4b.png")); print("p98-S4b", pix.width, pix.height)
