#!/usr/bin/env python3
# r390 zoom arbitration: six ambiguous layer points of the Dey-1397 paper
import fitz, os

PDF = "upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
OUT = "/tmp/qa-r390"
os.makedirs(OUT, exist_ok=True)
doc = fitz.open(PDF)

def zoom(page0, clip, name, dpi=300):
    pg = doc[page0]
    r = pg.rect
    cl = fitz.Rect(r.width*clip[0], r.height*clip[1], r.width*clip[2], r.height*clip[3])
    pix = pg.get_pixmap(dpi=dpi, clip=cl)
    pix.save(f"{OUT}/{name}.png")
    print(name, "->", f"{OUT}/{name}.png", pix.width, "x", pix.height)

# 1) p229 header — the «سواالت.پاسخنامه ندارد» note near the بارم column (top area)
zoom(228, (0.0, 0.10, 1.0, 0.22), "z1-header-note")
# 2) p230 vocab cloze line with 'birds stray apostrophe (mid page)
zoom(229, (0.0, 0.28, 1.0, 0.44), "z2-birds-line")
# 3) p230 collocation B column «e d. no pains» (left column, mid-lower)
zoom(229, (0.0, 0.44, 0.62, 0.62), "z3-nopains")
# 4) p231 mcq options «d: which» / «d: didn't she» (full width upper-mid)
zoom(230, (0.0, 0.18, 1.0, 0.52), "z4-dcolon")
# 5) p233 teachers reading «first lime» + «"then"» quotes
zoom(232, (0.0, 0.40, 1.0, 0.75), "z5-lime-then")
# 6) p234 key header + first rows (verify old-style key header)
zoom(233, (0.0, 0.08, 1.0, 0.30), "z6-key-header")

doc.close()
