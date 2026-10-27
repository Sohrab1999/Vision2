#!/usr/bin/env python3
# r383 zooms: p323 image section (S5, rows 17-20) + p327 scrambled 33/34 + p328 scrambled 47/48
import fitz, os

PDF = "upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
OUT = "/tmp/qa-r383"
os.makedirs(OUT, exist_ok=True)
doc = fitz.open(PDF)

def zoom(pno, clip, name, dpi=300):
    page = doc[pno - 1]
    mat = fitz.Matrix(dpi / 72, dpi / 72)
    pix = page.get_pixmap(matrix=mat, clip=clip)
    pix.save(f"{OUT}/{name}.png")
    print(name, "saved")

# p323: S5 images live between the instruction and section 6 (upper-middle band)
r323 = doc[322].rect
zoom(323, fitz.Rect(0, r323.height * 0.18, r323.width, r323.height * 0.52), "p323-s5-pics")
zoom(323, fitz.Rect(0, r323.height * 0.18, r323.width, r323.height * 0.75), "p323-full-mid")

# p327: S11 scrambled key blocks (lower third)
r327 = doc[326].rect
zoom(327, fitz.Rect(0, r327.height * 0.60, r327.width, r327.height * 0.95), "p327-s11-key")

# p328: S15 scrambled key blocks (middle band)
r328 = doc[327].rect
zoom(328, fitz.Rect(0, r328.height * 0.28, r328.width, r328.height * 0.62), "p328-s15-key")
doc.close()
