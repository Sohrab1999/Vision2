# -*- coding: utf-8 -*-
# r324 — زومِ نهاییِ ۱۱ نقطهٔ باقی‌مانده (۲۰۰۰dpi، پهنای نیمهٔ راست)
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# (pno0, y0, y1, name) — x ثابت 140-610
JOBS = [
    (242, 126, 148, "r324-f-q03"),
    (242, 180, 202, "r324-f-q05"),
    (242, 260, 282, "r324-f-q08"),
    (242, 287, 309, "r324-f-q09"),
    (242, 314, 336, "r324-f-q10"),
    (243, 176, 202, "r324-f-q26"),
    (243, 20, 52, "r324-f-q28"),
    (243, 92, 114, "r324-f-q30"),
    (243, 119, 141, "r324-f-q31"),
    (243, 198, 220, "r324-f-q34"),
    (243, 360, 392, "r324-f-q40"),
]

for pno0, y0, y1, name in JOBS:
    page = doc[pno0]
    pix = page.get_pixmap(matrix=fitz.Matrix(2000 / 72.0, 2000 / 72.0), clip=fitz.Rect(140, y0, 610, y1))
    out = f"/tmp/{name}.png"
    pix.save(out)
    print(out, pix.width, "x", pix.height)
