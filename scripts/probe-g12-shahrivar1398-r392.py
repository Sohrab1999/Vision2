#!/usr/bin/env python3
# r392 probe: the fourteenth ministry paper — SHAHRIVAR 1398 sitting (pdf-p244-248, key p249-250)
# Goal: header/section layout, row counts, and the OLD-STYLE key format (paperMap: 12/6/1398 — نزدیک‌ترین)
# Twin census target: gt-l81..gt-l92 in grammar-g12-topic.json (r292's rendering of this same paper)
import fitz, os

PDF = "upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
OUT = "/tmp/qa-r392"
os.makedirs(OUT, exist_ok=True)

doc = fitz.open(PDF)
print("pages:", doc.page_count)

# 150dpi renders p243-250
for p in range(242, 250):
    pg = doc[p]
    pix = pg.get_pixmap(dpi=150)
    pix.save(f"{OUT}/p{p+1}.png")
print("rendered p243-p250")

# text-layer dump
for p in range(242, 250):
    pg = doc[p]
    txt = pg.get_text("text")
    print(f"\n<<<PAGE {p+1}>>> ({len(txt)} chars)")
    print(txt[:3400])

doc.close()
