#!/usr/bin/env python3
# r394 probe: the LAST remaining finals paper — the broken-layer sheet pdf-p277-284
# Goal: assess how broken the text layer is (chars/page, presentation-forms garbage?),
#       render p276-286 at 150dpi for vision reading, dump layer text.
import fitz, os, unicodedata

PDF = "upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
OUT = "/tmp/qa-r394"
os.makedirs(OUT, exist_ok=True)

doc = fitz.open(PDF)
print("pages:", doc.page_count)

for p in range(275, 286):
    pg = doc[p]
    pix = pg.get_pixmap(dpi=150)
    pix.save(f"{OUT}/p{p+1}.png")

for p in range(275, 286):
    pg = doc[p]
    txt = pg.get_text("text")
    # measure presentation-forms pollution
    pforms = sum(1 for c in txt if 0xFB50 <= ord(c) <= 0xFEFF)
    total = len(txt.strip())
    print(f"\n<<<PAGE {p+1}>>> chars={total} presentation_forms={pforms}")
    print(txt[:2600])

doc.close()
