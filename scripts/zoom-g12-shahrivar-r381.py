#!/usr/bin/env python3
# r381 zoom: 300dpi crops of p344 (image section) and p348/p349 key blocks
import fitz, os

PDF = "upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
OUT = "/tmp/qa-r381"
os.makedirs(OUT, exist_ok=True)
doc = fitz.open(PDF)

def zoom(pno, clip, name, dpi=300):
    page = doc[pno - 1]
    mat = fitz.Matrix(dpi / 72, dpi / 72)
    pix = page.get_pixmap(matrix=mat, clip=clip)
    pix.save(f"{OUT}/{name}.png")
    print(name, "->", f"{OUT}/{name}.png", "rect:", page.rect)

p344 = doc[343].rect
# section 5 (image matching, rows 19-22): mid/lower part of p344
zoom(344, fitz.Rect(0, p344.height * 0.28, p344.width, p344.height * 0.62), "p344-s5-pics")
# full page at 200dpi for context
pix = doc[343].get_pixmap(dpi=200); pix.save(f"{OUT}/p344-200.png"); print("p344-200 saved")

p348 = doc[347].rect
# key block for rows 35-37 (section 10) — lower part of p348
zoom(348, fitz.Rect(0, p348.height * 0.62, p348.width, p348.height * 0.95), "p348-s10-key")
# also section 12 (q39) block bottom
zoom(348, fitz.Rect(0, p348.height * 0.85, p348.width, p348.height), "p348-s12-key")

p349 = doc[348].rect
# key block q57-58 (section 16) — middle of p349
zoom(349, fitz.Rect(0, p349.height * 0.38, p349.width, p349.height * 0.72), "p349-s16-key")
doc.close()
