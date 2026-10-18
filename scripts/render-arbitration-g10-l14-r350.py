# -*- coding: utf-8 -*-
# r350 — داوری‌های رندر برای «۱۰۰ تست گرامر و نگارش درس ۱ تا ۴» (ص۱۷۱-۱۷۶) و کلیدِ ص۳۰۰
# برش‌های ۹۰۰-۱۲۰۰dpi: سربرگِ جلد (سطحِ متوسط و استاندارد؟)، سربرگِ آزمون (متوسط و کنکوری؟)، کلید
import fitz
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
OUT = Path("/tmp/qa-r350")
OUT.mkdir(exist_ok=True)
doc = fitz.open(PDF)

CROPS = [
    ("A-p171-cover",    171, (0.03, 0.100, 0.99, 0.400), 900),
    ("B-p172-header",   172, (0.03, 0.055, 0.99, 0.140), 900),
    ("C-p176-q91-100",  176, (0.03, 0.700, 0.99, 0.970), 1000),
    ("D-p300-keyhdr",   300, (0.03, 0.055, 0.99, 0.130), 900),
    ("E-p300-keygrid",  300, (0.03, 0.420, 0.99, 0.720), 900),
    ("F-p173-q34",      173, (0.03, 0.590, 0.99, 0.650), 1200),
    ("G-p174-q44-45",   174, (0.03, 0.290, 0.99, 0.400), 1200),
    ("H-p174-q52-54",   174, (0.03, 0.560, 0.99, 0.690), 1200),
    ("I-p175-q61-66",   175, (0.03, 0.090, 0.99, 0.330), 1000),
    ("J-p176-q82-88",   176, (0.03, 0.080, 0.99, 0.420), 1000),
    ("K-p300-top",      300, (0.03, 0.100, 0.99, 0.240), 1000),
]

for name, pno, rel, dpi in CROPS:
    page = doc[pno - 1]
    r = page.rect
    clip = fitz.Rect(r.width * rel[0], r.height * rel[1], r.width * rel[2], r.height * rel[3])
    pix = page.get_pixmap(matrix=fitz.Matrix(dpi / 72, dpi / 72), clip=clip)
    path = OUT / f"{name}.png"
    pix.save(path)
    print(f"{name}: {pix.width}x{pix.height} -> {path}")
