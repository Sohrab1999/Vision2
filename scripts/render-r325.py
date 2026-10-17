# -*- coding: utf-8 -*-
# r325 — رندرِ ص۵۴-۵۵ (بخش دوم — سطح استاندارد) و ص۲۴۵-۲۴۷ (کلید + ترجمهٔ چاپی) جزوهٔ دهم
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

JOBS = [
    (54, 300, "r325-p54-full", None),
    (55, 300, "r325-p55-full", None),
    (245, 300, "r325-p245-full", None),
    (246, 300, "r325-p246-full", None),
    (247, 300, "r325-p247-full", None),
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

def halves(pno, dpi, tag):
    page = doc[pno - 1]
    r = page.rect
    h1 = fitz.Rect(r.x0, r.y0, r.x1, r.y0 + r.height * 0.5)
    h2 = fitz.Rect(r.x0, r.y0 + r.height * 0.47, r.x1, r.y1)
    render(pno, dpi, f"r325-{tag}-h1", h1)
    render(pno, dpi, f"r325-{tag}-h2", h2)

for pno, tag in [(54, "p54"), (55, "p55"), (245, "p245"), (246, "p246"), (247, "p247")]:
    halves(pno, 1400, tag)

# لایهٔ متنیِ کاملِ ص۵۵ (بخشِ Q29-40) برای مختصات
print("\n===== PAGE 55 REST =====")
print(doc[54].get_text("text")[2200:5135])
print("\n===== PAGE 245 REST =====")
print(doc[244].get_text("text")[1600:4200])
