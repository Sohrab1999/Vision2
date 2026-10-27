# -*- coding: utf-8 -*-
# r350 — برش‌های داوریِ دقیق برای کوئیرک‌های مشکوک (با مکان‌یابیِ span)
import fitz
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
OUT = Path("/tmp/qa-r350")
OUT.mkdir(exist_ok=True)
doc = fitz.open(PDF)

# (نام، صفحهٔ ۱-مبنا، عبارتِ لنگر، ارتفاعِ بالا/پایین بر حسبِ pt)
CROPS = [
    ("Q28-own-s",   172, "by his own",    16, 42),
    ("Q42-oneof",   174, "one of",        16, 44),
    ("Q44-father",  174, "good manager",  16, 44),
    ("Q64-marry",   175, "e-mail to Marry", 16, 44),
    ("Q88-village", 176, "village",       16, 48),
    ("Q96-wrong",   176, "grammatically", 20, 90),
    ("Q34-cap",     173, "Swimming",      16, 44),
]

for name, pno, anchor, up, down in CROPS:
    page = doc[pno - 1]
    hits = page.search_for(anchor)
    if not hits:
        print(f"{name}: ANCHOR NOT FOUND on p{pno}")
        continue
    r = hits[0]
    clip = fitz.Rect(30, max(0, r.y0 - up), page.rect.width - 30, min(page.rect.height, r.y1 + down))
    pix = page.get_pixmap(matrix=fitz.Matrix(1200 / 72, 1200 / 72), clip=clip)
    path = OUT / f"{name}.png"
    pix.save(path)
    print(f"{name}: {pix.width}x{pix.height} -> {path}")
