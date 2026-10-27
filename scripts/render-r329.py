# -*- coding: utf-8 -*-
# r329 — رندرِ ص۵۹-۶۱ (آزمون گرامر درس اول + شروعِ بعدی) و ص۲۴۸-۲۴۹ (کلیدها) جزوهٔ دهم
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

JOBS = [
    (59, 300, "r329-p59-full", None),
    (60, 300, "r329-p60-full", None),
    (61, 300, "r329-p61-full", None),
    (248, 300, "r329-p248-full", None),
    (249, 300, "r329-p249-full", None),
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
print("done")
