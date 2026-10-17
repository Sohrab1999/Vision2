# -*- coding: utf-8 -*-
# r324 — زومِ نهاییِ Q22/Q23/Q26/Q27 (پایینِ ص۲۴۳)
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

JOBS = [
    (242, 638, 660, "r324-h-q22"),
    (242, 665, 687, "r324-h-q23"),
    (242, 743, 780, "r324-h-q26"),
    (242, 785, 808, "r324-h-q27"),
]
for pno0, y0, y1, name in JOBS:
    page = doc[pno0]
    pix = page.get_pixmap(matrix=fitz.Matrix(2200 / 72.0, 2200 / 72.0), clip=fitz.Rect(100, y0, 610, y1))
    out = f"/tmp/{name}.png"
    pix.save(out)
    print(out, pix.width, "x", pix.height)
