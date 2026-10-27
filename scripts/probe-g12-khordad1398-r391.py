#!/usr/bin/env python3
# r391 probe: the thirteenth ministry paper — KHORDAD 1398 sitting (pdf-p237-241, old-header key p242-243)
# Goal: header/section layout, row counts, and the OLD-STYLE key format (paperMap: 13/3/1398)
import fitz, os

PDF = "upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
OUT = "/tmp/qa-r391"
os.makedirs(OUT, exist_ok=True)

doc = fitz.open(PDF)
print("pages:", doc.page_count)

# 150dpi renders p236-243
for p in range(235, 243):
    pg = doc[p]
    pix = pg.get_pixmap(dpi=150)
    pix.save(f"{OUT}/p{p+1}.png")
print("rendered p236-p243")

# text-layer dump
for p in range(236, 243):
    pg = doc[p]
    txt = pg.get_text("text")
    print(f"\n<<<PAGE {p+1}>>> ({len(txt)} chars)")
    print(txt[:3400])

doc.close()
