# -*- coding: utf-8 -*-
# r327 — رندرِ ص۸۷-۸۹ (تست واژگان درس دوم — سطح متوسط + ابتدای بخش دوم) و ص۲۵۹-۲۶۰ (کلید) جزوهٔ دهم
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

JOBS = [
    (87, 300, "r327-p87-full", None),
    (88, 300, "r327-p88-full", None),
    (259, 300, "r327-p259-full", None),
    (260, 300, "r327-p260-full", None),
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
    render(pno, dpi, f"r327-{tag}-h1", h1)
    render(pno, dpi, f"r327-{tag}-h2", h2)

for pno, tag in [(87, "p87"), (88, "p88"), (259, "p259"), (260, "p260")]:
    halves(pno, 1400, tag)

print("done")
