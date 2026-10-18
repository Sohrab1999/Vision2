# -*- coding: utf-8 -*-
# r332 — رندرهای انگلیسی: تگ‌های Q39/Q40 + گزینه‌های Q8/Q22/Q30/Q35 + ساقهٔ Q26
import fitz
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
OUT = Path("/tmp/r332"); OUT.mkdir(exist_ok=True)
doc = fitz.open(PDF)

Z = [
    (74, 39, "e39-tag", 620, 160),    # Q39 + tag (94 ریاض)
    (74, 47, "e40-tag", 620, 130),    # Q40 + tag (94 تجارت)
    (72, 400, "e8-opts", 700, 110),   # Q8 options
    (73, 285, "e22-opts", 700, 110),  # Q22 options
    (73, 672, "e30-opts", 640, 110),  # Q30 options
    (74, 150, "e35-opts", 640, 120),  # Q35 options
    (73, 450, "e26-stem", 620, 130),  # Q26 stem+opts
    (73, 500, "e27-opts", 620, 240),  # Q27 options (4 lines)
]
for pno, y, name, w_h, h_h in Z:
    pix = doc[pno - 1].get_pixmap(dpi=2200, clip=fitz.Rect(35, y, 558, y + h_h))
    pix.save(str(OUT / f"{name}.png"))
    print(name, pix.width, pix.height)
