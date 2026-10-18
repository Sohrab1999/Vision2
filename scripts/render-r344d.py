# -*- coding: utf-8 -*-
# r344d — برشِ دقیقِ واژه‌محورِ نکاتِ سرخِ «(رد گزینه ...)» در کلیدِ ص۱۲۸ + جدولِ رنگِ گزینه‌های تمرینِ ص۱۳۰
import fitz
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
OUT = Path("/tmp/r344")
doc = fitz.open(PDF)
page = doc[127]

# واژه‌های «رد» را در لایه پیدا کن و دور هر «(رد ... )» یک برشِ ۱۴۰۰dpi بگیر
words = page.get_text("words")  # x0,y0,x1,y1,word,block,line,word_no
rd_words = [w for w in words if w[4] in ("رد", "(رد", "«رد")]
print("found", len(rd_words), "«رد» tokens")
for i, w in enumerate(rd_words):
    x0, y0, x1, y1 = w[0], w[1], w[2], w[3]
    clip = fitz.Rect(max(0, x0 - 60), max(0, y0 - 14), min(page.rect.width, x0 + 240), y1 + 14)
    pix = page.get_pixmap(dpi=1400, clip=clip)
    p = OUT / f"note-{i}.png"
    pix.save(p)
    print(p, "->", w[4], f"y={y0:.0f}")

# رنگِ اسپن‌های نکات (سرخ یا سیاه؟) — دیکشنریِ رنگی
d = page.get_text("dict")
for block in d["blocks"]:
    if block.get("type") != 0:
        continue
    for line in block["lines"]:
        for span in line["spans"]:
            t = span["text"]
            if "رد گزینه" in t or "گزینه" in t:
                c = span["color"]
                r, g, b = (c >> 16) & 255, (c >> 8) & 255, c & 255
                print(f"SPAN color=#{r:02x}{g:02x}{b:02x} | {t[:70]!r}")
