#!/usr/bin/env python3
# r393 probe: the fifteenth ministry paper — DEY 1398 sitting (pdf-p251-256, key p257-258)
# Goal: header/section layout, row counts, and the key format (paperMap: 22/10/98)
# Twin census target: gt-l93..gt-l104 in grammar-g12-topic.json (r292's rendering, if any)
import fitz, os

PDF = "upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
OUT = "/tmp/qa-r393"
os.makedirs(OUT, exist_ok=True)

doc = fitz.open(PDF)
print("pages:", doc.page_count)

# 150dpi renders p250-258
for p in range(249, 258):
    pg = doc[p]
    pix = pg.get_pixmap(dpi=150)
    pix.save(f"{OUT}/p{p+1}.png")
print("rendered p250-p258")

# text-layer dump
for p in range(249, 258):
    pg = doc[p]
    txt = pg.get_text("text")
    print(f"\n<<<PAGE {p+1}>>> ({len(txt)} chars)")
    print(txt[:3600])

doc.close()
