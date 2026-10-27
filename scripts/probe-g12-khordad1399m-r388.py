#!/usr/bin/env python3
# r388 probe (pair paper): the ninth ministry paper — Khordad 1399 math-sciences sitting (pdf-p259-267)
# paperMap (r384): p259-265 exam + key p266-267, printed date 05/04/99.
# Expectations: presentation-forms typography, picture sections, scrambled reading layers.
import fitz, os

PDF = "upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
OUT = "/tmp/qa-r388"
os.makedirs(OUT, exist_ok=True)
doc = fitz.open(PDF)

LO, HI = 259, 267
for pno in range(LO, HI + 1):
    page = doc[pno - 1]
    txt = page.get_text("text")
    with open(f"{OUT}/layer-p{pno}.txt", "w", encoding="utf-8") as f:
        f.write(txt)
    pix = page.get_pixmap(dpi=150)
    pix.save(f"{OUT}/p{pno}.png")

print("\n== quick header check p259-p267 ==")
for pno in range(LO, HI + 1):
    txt = open(f"{OUT}/layer-p{pno}.txt", encoding="utf-8").read()
    joined = " ".join(l.strip() for l in txt.split("\n") if l.strip())
    print(f"--- p{pno}: {joined[:280]}")
doc.close()
