# -*- coding: utf-8 -*-
# r332 — زوم‌های تکمیلی (۵ موردِ نیافته)
import fitz
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
OUT = Path("/tmp/r332"); OUT.mkdir(exist_ok=True)
doc = fitz.open(PDF)

ZOOMS = [
    (254, "مادرش", "t12-q12", 300),
    (255, "قطعا", "t17-q17", 320),
    (257, "نداده", "t32-q32", 300),
    (257, "پیاده", "t34-q34", 300),
    (257, "حوصله", "t38-q38", 300),
]
for pno, needle, name, pad_x in ZOOMS:
    page = doc[pno - 1]
    def norm(s):
        return s.replace("\u200c", "").replace(" ", "").replace("\n", "")
    hits = [w for w in page.get_text("words") if needle in norm(w[4])]
    if not hits:
        print(f"!! p{pno} '{needle}' NOT FOUND"); continue
    w = hits[0]
    r = fitz.Rect(w[0] - pad_x, w[1] - 20, w[2] + pad_x, w[3] + 22) & page.rect
    pix = page.get_pixmap(dpi=3000, clip=r)
    pix.save(str(OUT / f"{name}.png"))
    print(f"{name}: p{pno} '{needle}' -> {pix.width}x{pix.height}")
