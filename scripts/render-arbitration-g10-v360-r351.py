# -*- coding: utf-8 -*-
# r351 — داوری‌های رندر برای «۳۶۰ تست واژگان درس ۱ تا ۴» (ص۱۷۸+) و کلیدِ ص۳۰۱
import fitz
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
OUT = Path("/tmp/qa-r351")
OUT.mkdir(exist_ok=True)
doc = fitz.open(PDF)

CROPS = [
    ("A-p178-header",  178, (0.03, 0.050, 0.99, 0.135), 900),
    ("B-p179-switch",  179, (0.03, 0.720, 0.99, 0.970), 1100),  # Q39-43: نقطه → پرانتز
    ("C-p178-q24",     179, (0.03, 0.180, 0.99, 0.260), 1200),  # Q24 split blank? روی ص۱۷۹
    ("D-p300-keyhdr",  301, (0.03, 0.050, 0.99, 0.130), 900),
    ("E-p301-keygrid", 301, (0.03, 0.130, 0.99, 0.430), 900),
]

for name, pno, rel, dpi in CROPS:
    page = doc[pno - 1]
    r = page.rect
    clip = fitz.Rect(r.width * rel[0], r.height * rel[1], r.width * rel[2], r.height * rel[3])
    pix = page.get_pixmap(matrix=fitz.Matrix(dpi / 72, dpi / 72), clip=clip)
    path = OUT / f"{name}.png"
    pix.save(path)
    print(f"{name}: {pix.width}x{pix.height} -> {path}")
