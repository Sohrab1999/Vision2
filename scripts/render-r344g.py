# -*- coding: utf-8 -*-
# r344g — میکرو-برشِ ۳۰۰۰dpiِ واژهٔ «باال/با فاصله» + «حتمأ» + نکته‌های «گزینه۲» / «گزینه۳»
import fitz
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
OUT = Path("/tmp/r344")
doc = fitz.open(PDF)
page = doc[127]
words = page.get_text("words")

def micro(token, y_lo, y_hi, name, before=40, after=40, dpi=3000):
    for x0, y0, x1, y1, t, *_ in words:
        if y_lo <= y0 <= y_hi and t == token:
            clip = fitz.Rect(x0 - before, y0 - 6, x1 + after, y1 + 6)
            pix = page.get_pixmap(dpi=dpi, clip=clip)
            p = OUT / name
            pix.save(p)
            print(p, "|", t, f"| bbox=({x0:.1f},{y0:.1f},{x1:.1f},{y1:.1f})")
            return
    print("NOT FOUND:", name)

micro("باال", 500, 505, "micro-bala.png", before=55, after=55)
micro("حتمأ", 541, 546, "micro-hatman.png", before=45, after=45)
micro("گزینه", 522, 525, "micro-note1b.png", before=45, after=75)
micro("گزینه", 564, 567, "micro-note2b.png", before=45, after=75)
