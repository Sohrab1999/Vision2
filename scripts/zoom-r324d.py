# -*- coding: utf-8 -*-
# r324 — جراحیِ واژه‌ایِ ۳۶۰۰dpi (شش واژهٔ قطعی)
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# (pno0, y0, y1, x0, x1, dpi, name)
JOBS = [
    (242, 348, 374, 400, 610, 3600, "r324-x-q11"),   # امروُه/ایحاد(ایجاد)
    (242, 419, 446, 300, 610, 3600, "r324-x-q14"),   # اینچا/آبراه/ماهیگیری
    (242, 444, 470, 300, 610, 3600, "r324-x-q15"),   # پاهان
    (242, 520, 548, 300, 610, 3600, "r324-x-q18"),   # شصت/ششست
    (242, 545, 572, 300, 610, 3600, "r324-x-q19"),   # تولاد/تولید
    (243, 210, 242, 330, 560, 3600, "r324-x-q35"),   # پچ/برج
]

for pno0, y0, y1, x0, x1, dpi, name in JOBS:
    page = doc[pno0]
    clip = fitz.Rect(x0, y0, x1, y1)
    pix = page.get_pixmap(matrix=fitz.Matrix(dpi / 72.0, dpi / 72.0), clip=clip)
    out = f"/tmp/{name}.png"
    pix.save(out)
    print(out, pix.width, "x", pix.height)
