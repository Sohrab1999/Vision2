#!/usr/bin/env python3
# r389 probe: the eleventh ministry paper — Khordad 1399 HUMANITIES sitting (pdf-p268-276)
# paperMap: math twin was p259-265 exam + key p266-267 (r388); humanities = p268-276 per r385 map.
# Expectations: presentation-forms typography, twin-overlap with r388 math paper, possibly old-style key header.
import fitz, os

PDF = "upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
OUT = "/tmp/qa-r389"
os.makedirs(OUT, exist_ok=True)
doc = fitz.open(PDF)

LO, HI = 268, 276
for pno in range(LO, HI + 1):
    page = doc[pno - 1]
    txt = page.get_text("text")
    with open(f"{OUT}/layer-p{pno}.txt", "w", encoding="utf-8") as f:
        f.write(txt)
    pix = page.get_pixmap(dpi=150)
    pix.save(f"{OUT}/p{pno}.png")

print("\n== quick header check p268-p276 ==")
for pno in range(LO, HI + 1):
    txt = open(f"{OUT}/layer-p{pno}.txt", encoding="utf-8").read()
    joined = " ".join(l.strip() for l in txt.split("\n") if l.strip())
    print(f"--- p{pno}: {joined[:300]}")
doc.close()
