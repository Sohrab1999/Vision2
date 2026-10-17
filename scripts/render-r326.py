# -*- coding: utf-8 -*-
# r326 — رندرِ ص۸۴-۸۶ (آزمون تشریحی واژگان درس دوم) و ص۲۵۸ (کلید واژه‌ای) جزوهٔ دهم
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

JOBS = [
    (84, 300, "r326-p84-full", None),
    (85, 300, "r326-p85-full", None),
    (86, 300, "r326-p86-full", None),
    (258, 300, "r326-p258-full", None),
]

def render(pno, dpi, name, clip=None):
    page = doc[pno - 1]
    z = dpi / 72.0
    pix = page.get_pixmap(matrix=fitz.Matrix(z, z), clip=clip)
    out = f"/tmp/{name}.png"
    pix.save(out)
    print(f"{out}  {pix.width}x{pix.height}")

for pno, dpi, name, clip in JOBS:
    render(pno, dpi, name, clip)

def halves(pno, dpi, tag):
    page = doc[pno - 1]
    r = page.rect
    h1 = fitz.Rect(r.x0, r.y0, r.x1, r.y0 + r.height * 0.5)
    h2 = fitz.Rect(r.x0, r.y0 + r.height * 0.47, r.x1, r.y1)
    render(pno, dpi, f"r326-{tag}-h1", h1)
    render(pno, dpi, f"r326-{tag}-h2", h2)

for pno, tag in [(84, "p84"), (85, "p85"), (86, "p86"), (258, "p258")]:
    halves(pno, 1400, tag)

print("done")
