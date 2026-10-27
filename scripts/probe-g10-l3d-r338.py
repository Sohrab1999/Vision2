# -*- coding: utf-8 -*-
# r338 — داوریِ رندرهای ۶۰۰dpi: سربرگِ ص۱۲۰، Q1/Q9 ص۱۲۱، Q23 ص۱۲۲، سربرگِ کلیدِ ص۲۷۴
import fitz
from pathlib import Path

PDF = "upload/جزوه جامع دهم .pdf"
OUT = Path("/tmp")
doc = fitz.open(PDF)


def crop(pno0, top, bottom, dpi, name):
    page = doc[pno0]
    rect = page.rect
    clip = fitz.Rect(rect.x0, rect.y0 + rect.height * top, rect.x1, rect.y0 + rect.height * bottom)
    pix = page.get_pixmap(dpi=dpi, clip=clip)
    out = OUT / name
    pix.save(out)
    print(out, pix.width, "x", pix.height)


# سربرگِ ص۱۲۰ (نوارِ عنوان + دستورِ سکشن‌۱) — ۱۴٪ اول
crop(119, 0.00, 0.14, 600, "r338-p120-hdr600.png")
# ص۱۲۱: دستورِ سکشن‌۳ + بانکِ تعریف‌ها (۱۰٪ اول)
crop(120, 0.00, 0.10, 600, "r338-p121-hdr600.png")
# ص۱۲۱: Q1 و Q2 سکشن‌۴ (۴۰-۵۵٪)
crop(120, 0.38, 0.52, 600, "r338-p121-q1-600.png")
# ص۱۲۱: Q9 سکشن‌۴ (۹۲-۱۰۰٪)
crop(120, 0.90, 1.00, 600, "r338-p121-q9-600.png")
# ص۱۲۲: Q23 (۷۲-۸۰٪)
crop(121, 0.70, 0.82, 600, "r338-p122-q23-600.png")
# ص۲۷۴: سربرگِ کلید + گریدِ سکشن‌۱ (۱۴٪ اول)
crop(273, 0.00, 0.14, 600, "r338-p274-hdr600.png")
# ص۲۷۴: گریدِ کلیدِ MCQ با «1.Experimentig» (۴۸-۶۲٪)
crop(273, 0.47, 0.62, 600, "r338-p274-mcqgrid600.png")
# ص۲۷۴: جعبهٔ Note (۷۶-۹۰٪)
crop(273, 0.74, 0.92, 600, "r338-p274-note600.png")
print("done")
