#!/usr/bin/env python3
# r382 zooms: p330 image section (S5, rows 17-20) + p334 scrambled 33/34 + p335 scrambled 47
import fitz, os

PDF = "upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
OUT = "/tmp/qa-r382"
os.makedirs(OUT, exist_ok=True)
doc = fitz.open(PDF)

def zoom(pno, clip, name, dpi=300):
    page = doc[pno - 1]
    mat = fitz.Matrix(dpi / 72, dpi / 72)
    pix = page.get_pixmap(matrix=mat, clip=clip)
    pix.save(f"{OUT}/{name}.png")
    print(name, "saved")

r330 = doc[329].rect
zoom(330, fitz.Rect(0, r330.height * 0.24, r330.width, r330.height * 0.60), "p330-s5-pics")
zoom(330, fitz.Rect(0, r330.height * 0.24, r330.width, r330.height), "p330-full-lower")

r334 = doc[333].rect
zoom(334, fitz.Rect(0, r334.height * 0.55, r334.width, r334.height * 0.92), "p334-s11-key")

r335 = doc[334].rect
zoom(335, fitz.Rect(0, r335.height * 0.30, r335.width, r335.height * 0.62), "p335-s15-key")
doc.close()
