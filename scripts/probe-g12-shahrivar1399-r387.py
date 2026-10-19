#!/usr/bin/env python3
# r387 probe: the eighth ministry paper — Shahrivar 1399 sitting (pdf-p285-292)
# paperMap (r384): p285-290 exam + key p291-292, printed date 13/06/99.
# Twin expectations: presentation-forms typography, '1.' dot-style markers.
# Verify everything from the layer.
import fitz, os

PDF = "upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
OUT = "/tmp/qa-r387"
os.makedirs(OUT, exist_ok=True)
doc = fitz.open(PDF)
print("PDF pages:", doc.page_count)

LO, HI = 285, 292
for pno in range(LO, HI + 1):
    page = doc[pno - 1]
    txt = page.get_text("text")
    with open(f"{OUT}/layer-p{pno}.txt", "w", encoding="utf-8") as f:
        f.write(txt)
    pix = page.get_pixmap(dpi=150)
    pix.save(f"{OUT}/p{pno}.png")

print("\n== layer p285 (first 70 lines) ==")
lines = open(f"{OUT}/layer-p285.txt", encoding="utf-8").read().split("\n")
for i, l in enumerate(lines[:70], 1):
    print(f"{i:3d}| {l.rstrip()}")

print("\n== quick header check p285-p292 ==")
for pno in range(LO, HI + 1):
    txt = open(f"{OUT}/layer-p{pno}.txt", encoding="utf-8").read()
    joined = " ".join(l.strip() for l in txt.split("\n") if l.strip())
    print(f"--- p{pno}: {joined[:260]}")
doc.close()
