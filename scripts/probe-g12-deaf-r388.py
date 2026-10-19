#!/usr/bin/env python3
# r388 probe: the deaf-special ministry paper — Shahrivar 1399 for hearing-impaired (pdf-p293-300)
# paperMap (r384): p293-298 exam + key p299-300. First deaf-oriented paper.
# Expectations: presentation-forms typography variants, possible picture-heavy sections.
# Verify everything from the layer.
import fitz, os

PDF = "upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
OUT = "/tmp/qa-r388"
os.makedirs(OUT, exist_ok=True)
doc = fitz.open(PDF)
print("PDF pages:", doc.page_count)

LO, HI = 293, 300
for pno in range(LO, HI + 1):
    page = doc[pno - 1]
    txt = page.get_text("text")
    with open(f"{OUT}/layer-p{pno}.txt", "w", encoding="utf-8") as f:
        f.write(txt)
    pix = page.get_pixmap(dpi=150)
    pix.save(f"{OUT}/p{pno}.png")

print("\n== layer p293 (first 80 lines) ==")
lines = open(f"{OUT}/layer-p293.txt", encoding="utf-8").read().split("\n")
for i, l in enumerate(lines[:80], 1):
    print(f"{i:3d}| {l.rstrip()}")

print("\n== quick header check p293-p300 ==")
for pno in range(LO, HI + 1):
    txt = open(f"{OUT}/layer-p{pno}.txt", encoding="utf-8").read()
    joined = " ".join(l.strip() for l in txt.split("\n") if l.strip())
    print(f"--- p{pno}: {joined[:300]}")
doc.close()
