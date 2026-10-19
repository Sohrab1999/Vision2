#!/usr/bin/env python3
# r384 render arbitration at 300dpi:
#  (a) p316 S5 pictures (q16-19) — which sentence belongs to which picture
#  (b) p316 q26 idiom letter-shape 'Easy c - - - , easy go'
#  (c) p320 scrambled key blocks rows 32-33 (RTL column scramble)
import fitz, os

PDF = "upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
OUT = "/tmp/qa-r384"
doc = fitz.open(PDF)

def render(pno, dpi, name, clip=None):
    page = doc[pno - 1]
    mat = fitz.Matrix(dpi / 72, dpi / 72)
    pix = page.get_pixmap(matrix=mat, clip=clip)
    path = f"{OUT}/{name}"
    pix.save(path)
    print(name, pix.width, "x", pix.height)

# full pages at 300dpi
render(316, 300, "p316-300.png")
render(320, 300, "p320-300.png")

# zooms: page height
r316 = doc[315].rect
r320 = doc[319].rect
print("p316 rect:", r316, " p320 rect:", r320)
doc.close()
