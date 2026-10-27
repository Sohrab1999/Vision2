#!/usr/bin/env python3
# r391 zoom arbitration: three ambiguous points of the Khordad-1398 paper
import fitz, os

PDF = "upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
OUT = "/tmp/qa-r391"
os.makedirs(OUT, exist_ok=True)
doc = fitz.open(PDF)

def zoom(page0, clip, name, dpi=300):
    pg = doc[page0]
    r = pg.rect
    cl = fitz.Rect(r.width*clip[0], r.height*clip[1], r.width*clip[2], r.height*clip[3])
    pix = pg.get_pixmap(dpi=dpi, clip=cl)
    pix.save(f"{OUT}/{name}.png")
    print(name, "->", f"{OUT}/{name}.png", pix.width, "x", pix.height)

# 1) p242 key — q26 truncated "26. hu" (first-letter cloze row, س۸)
zoom(241, (0.0, 0.42, 1.0, 0.58), "z1-q26")
# 2) p239 grammar MCQ options layout q31-34 (reversed d,c,b,a?)
zoom(238, (0.0, 0.42, 1.0, 0.72), "z2-mcq-opts")
# 3) p243 water-paragraph roles table (44/42/43/47/46/45 pairing)
zoom(242, (0.0, 0.10, 1.0, 0.42), "z3-water-table")

doc.close()
