# -*- coding: utf-8 -*-
# r344j — برچسب‌ها با گسترشِ به چپ (ادامهٔ متنِ RTL)
import fitz
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
OUT = Path("/tmp/r344")
doc = fitz.open(PDF)
page = doc[127]
W = page.rect.width
words = page.get_text("words")

for y0t, name in ((325, "tagQ1"), (343, "tagQ2"), (398, "tagQ3"), (448, "tagQ4")):
    for x0, y0, x1, y1, t, *_ in words:
        if abs(y0 - y0t) < 3 and "کنکور" in t:
            clip = fitz.Rect(max(0, x0 - 175), y0 - 9, min(W, x1 + 25), y1 + 9)
            pix = page.get_pixmap(dpi=1800, clip=clip)
            p = OUT / f"{name}.png"
            pix.save(p)
            print(p)
            break

# سربرگِ بلوک — نوارِ درستِ y 285-312
clip = fitz.Rect(0, 284, W, 313)
pix = page.get_pixmap(dpi=1600, clip=clip)
p = OUT / "testhdr2.png"
pix.save(p)
print(p)
