#!/usr/bin/env python3
# r390 probe: the twelfth ministry paper — DEY 1397 sitting (pdf-p229-233, old-header key p234-236)
# Goal: confirm header/section layout, row counts, and the OLD-STYLE key format
# (the first paper of section 4 — predates presentation-forms headers).
import fitz, os, re

PDF = "upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
OUT = "/tmp/qa-r390"
os.makedirs(OUT, exist_ok=True)

doc = fitz.open(PDF)
print("pages:", doc.page_count)

# 150dpi renders p228-237 (0-based 227..236)
for p in range(227, 237):
    if p >= doc.page_count: break
    pg = doc[p]
    pix = pg.get_pixmap(dpi=150)
    pix.save(f"{OUT}/p{p+1}.png")
    print(f"rendered p{p+1}")

# text-layer dump p228-237
for p in range(227, 237):
    if p >= doc.page_count: break
    pg = doc[p]
    txt = pg.get_text("text")
    print(f"\n<<<PAGE {p+1}>>> ({len(txt)} chars)")
    print(txt[:3200])

doc.close()
