# -*- coding: utf-8 -*-
# r344f — برش‌های داوریِ نهایی: «باال/با فاصله»، «حتمأ»، سربرگِ کلید، و نکاتِ «(رد گزینه...)»
import fitz
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
OUT = Path("/tmp/r344")
doc = fitz.open(PDF)
page = doc[127]
W = page.rect.width
words = page.get_text("words")

def crop(word_pred, y_lo, y_hi, name, pad=90, dpi=1600, hpad=10):
    for x0, y0, x1, y1, t, *_ in words:
        if y_lo <= y0 <= y_hi and word_pred(t):
            clip = fitz.Rect(max(0, x0 - pad), y0 - hpad, min(W, x1 + pad), y1 + hpad)
            pix = page.get_pixmap(dpi=dpi, clip=clip)
            p = OUT / name
            pix.save(p)
            print(p, "| token:", t, f"| y={y0:.0f}")
            return
    print("NOT FOUND:", name)

# ۱) «باال» در key1 (y≈502) — با زمینهٔ گسترده
crop(lambda t: t == "باال", 500, 505, "w-bala-key1.png", pad=170)
# ۲) «حتمأ» در key2 (y≈543)
crop(lambda t: "حتم" in t, 541, 546, "w-hatman.png", pad=140)
# ۳) نکتهٔ دومِ key1: span «(رد گزینه2» y≈523 — برشِ عریض
crop(lambda t: t == "گزینه" , 522, 525, "w-note1b-key1.png", pad=200)
# ۴) نکتهٔ دومِ key2: «(رد گزینه3» y≈565
crop(lambda t: t == "گزینه", 564, 567, "w-note2b-key2.png", pad=200)

# ۵) سربرگِ کلید: نوارِ کاملِ y 476-492 با ۱۶۰۰dpi
clip = fitz.Rect(0, 476, W, 494)
pix = page.get_pixmap(dpi=1600, clip=clip)
p = OUT / "keyhdr-full.png"
pix.save(p)
print(p, pix.width, "x", pix.height)
