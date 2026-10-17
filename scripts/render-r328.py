# -*- coding: utf-8 -*-
# r328 — رندرِ ص۸۹-۹۰ (سؤالات تست واژگان درس دوم — بخش دوم، سطح استاندارد) و ص۲۶۱-۲۶۳ (کلید + ترجمهٔ چاپی) جزوهٔ دهم
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

JOBS = [
    (89, 300, "r328-p89-full", None),
    (90, 300, "r328-p90-full", None),
    (261, 300, "r328-p261-full", None),
    (262, 300, "r328-p262-full", None),
    (263, 300, "r328-p263-full", None),
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
    render(pno, dpi, f"r328-{tag}-h1", h1)
    render(pno, dpi, f"r328-{tag}-h2", h2)

for pno, tag in [(89, "p89"), (90, "p90"), (261, "p261"), (262, "p262"), (263, "p263")]:
    halves(pno, 1400, tag)

print("done")
