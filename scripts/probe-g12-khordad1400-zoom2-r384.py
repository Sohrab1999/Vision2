#!/usr/bin/env python3
# r384 zoom: p318 q41/q46 dot-runs at 300dpi (upper half + lower half)
import fitz

PDF = "upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
OUT = "/tmp/qa-r384"
doc = fitz.open(PDF)
page = doc[317]  # p318 (1-based)
r = page.rect
mat = fitz.Matrix(300 / 72, 300 / 72)
# upper half (q39-43 dictionary) and lower half (q44-47 hydropower)
page.get_pixmap(matrix=mat, clip=fitz.Rect(0, 0, r.width, r.height * 0.62)).save(f"{OUT}/p318-top-300.png")
page.get_pixmap(matrix=mat, clip=fitz.Rect(0, r.height * 0.55, r.width, r.height)).save(f"{OUT}/p318-bottom-300.png")
doc.close()
print("done")
