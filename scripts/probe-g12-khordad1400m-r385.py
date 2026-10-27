#!/usr/bin/env python3
# r385 probe: the sixth ministry paper — Khordad 1400 math-science sitting (pdf-p308-314)
# paperMap (r384): p308-312 exam + key p313-314, printed date 19/03/1400 — twin sister
# of r384's humanities paper (p315-319). Expect presentation-forms typography and
# '1.' dot-style markers (r382 pattern) — verify everything from the layer.
import fitz, re, os

PDF = "upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
OUT = "/tmp/qa-r385"
os.makedirs(OUT, exist_ok=True)
doc = fitz.open(PDF)
print("PDF pages:", doc.page_count)

LO, HI = 308, 314
for pno in range(LO, HI + 1):
    page = doc[pno - 1]
    txt = page.get_text("text")
    with open(f"{OUT}/layer-p{pno}.txt", "w", encoding="utf-8") as f:
        f.write(txt)
    pix = page.get_pixmap(dpi=150)
    pix.save(f"{OUT}/p{pno}.png")

print("\n== layer p308 (first 60 lines) ==")
lines = [l for l in open(f"{OUT}/layer-p{pno-6}.txt", encoding="utf-8").read().split("\n")]
for i, l in enumerate(lines[:60], 1):
    print(f"{i:3d}| {l.rstrip()}")

print("\n== quick header check p308-p314 ==")
for pno in range(LO, HI + 1):
    txt = open(f"{OUT}/layer-p{pno}.txt", encoding="utf-8").read()
    joined = " ".join(l.strip() for l in txt.split("\n") if l.strip())
    head = joined[:260]
    print(f"--- p{pno}: {head}")
doc.close()
