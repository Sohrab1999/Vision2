#!/usr/bin/env python3
# r385 zoom: 300dpi arbitrations — S11 scrambled key block (p313) + S5 picture row (p309)
import fitz, os

PDF = "upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
OUT = "/tmp/qa-r385"
os.makedirs(OUT, exist_ok=True)
doc = fitz.open(PDF)

# p313: key page — S11 block sits around row 11 (q32-33 model answers)
p = doc[313 - 1]
r = p.rect
print("p313 rect:", r)
# full page 300dpi
p.get_pixmap(dpi=300).save(f"{OUT}/p313-300.png")
# zoom bottom-half (S11 block near section 11 marker, lower half of the page)
clip = fitz.Rect(0, r.height * 0.45, r.width, r.height * 0.85)
p.get_pixmap(dpi=300, clip=clip).save(f"{OUT}/p313-s11-zoom.png")

# p309: exam page — S5 picture row at top of content area
p = doc[309 - 1]
r = p.rect
p.get_pixmap(dpi=300).save(f"{OUT}/p309-300.png")
clip = fitz.Rect(0, r.height * 0.10, r.width, r.height * 0.45)
p.get_pixmap(dpi=300, clip=clip).save(f"{OUT}/p309-s5-zoom.png")

doc.close()
print("saved:", os.listdir(OUT))
