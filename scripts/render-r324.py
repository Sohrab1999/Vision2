# -*- coding: utf-8 -*-
# r324 — رندرِ ص۵۲-۵۳ (آزمونِ آموزشی) و ص۲۴۳-۲۴۴ (کلید و ترجمهٔ چاپی) جزوهٔ دهم
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

JOBS = [
    # (page1based, zoom, name, clip=None)
    (52, 300, "r324-p52-full", None),
    (53, 300, "r324-p53-full", None),
    (243, 300, "r324-p243-full", None),
    (244, 300, "r324-p244-full", None),
]

def render(pno, dpi, name, clip=None):
    page = doc[pno - 1]
    z = dpi / 72.0
    m = fitz.Matrix(z, z)
    pix = page.get_pixmap(matrix=m, clip=clip)
    out = f"/tmp/{name}.png"
    pix.save(out)
    print(f"{out}  {pix.width}x{pix.height}")

for pno, dpi, name, clip in JOBS:
    render(pno, dpi, name, clip)

# نیمه‌های بالایی/پایینی در dpi بالاتر برای خوانشِ ستونِ گزینه‌ها و متنِ ترجمه
def halves(pno, dpi, tag):
    page = doc[pno - 1]
    r = page.rect
    h1 = fitz.Rect(r.x0, r.y0, r.x1, r.y0 + r.height * 0.5)
    h2 = fitz.Rect(r.x0, r.y0 + r.height * 0.47, r.x1, r.y1)
    render(pno, dpi, f"r324-{tag}-h1", h1)
    render(pno, dpi, f"r324-{tag}-h2", h2)

for pno, tag in [(52, "p52"), (53, "p53"), (243, "p243"), (244, "p244")]:
    halves(pno, 1400, tag)

print("done")
