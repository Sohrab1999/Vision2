#!/usr/bin/env python3
# r388 render arbitration (300dpi crop): p294 early-humans passage (deaf paper S9)
# arbitrate: «To provide themselves, with fuel they cut trees» (layer) vs r387's
# re-joined «To provide themselves with fuel, they cut trees»
import fitz, os

PDF = "upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
OUT = "/tmp/qa-r388"
doc = fitz.open(PDF)

def crop(pno, y0f, y1f, name):
    page = doc[pno - 1]
    r = page.rect
    clip = fitz.Rect(r.x0, r.y0 + r.height * y0f, r.x1, r.y0 + r.height * y1f)
    pix = page.get_pixmap(dpi=300, clip=clip)
    path = f"{OUT}/{name}.png"
    pix.save(path)
    print("saved", path, pix.width, "x", pix.height)

# the passage occupies the mid-lower half of p294
crop(294, 0.42, 0.72, "p294-s9-passage")
doc.close()
