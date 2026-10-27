# -*- coding: utf-8 -*-
# r324 — زومِ واژه‌ایِ ۳۰۰۰-۳۶۰۰dpi برای حروفِ قطعی: Q11/Q14/Q15/Q18/Q19 (ص۲۴۳) + Q35 (ص۲۴۴)
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# (pno0, y0, y1, x0, x1, dpi, name)
JOBS = [
    (242, 348, 372, 240, 590, 3000, "r324-w-q11"),   # ایحاد/ایجاد
    (242, 385, 410, 240, 590, 3000, "r324-w-q14"),   # اینچا / آبرای / ماهیگیری
    (242, 408, 432, 240, 590, 3000, "r324-w-q15"),   # پاهان
    (242, 533, 557, 240, 590, 3000, "r324-w-q18"),   # ششست/شصت
    (242, 555, 580, 240, 590, 3000, "r324-w-q19"),   # تولاد/تولید
    (243, 195, 245, 100, 590, 2400, "r324-w-q35"),   # پچ
]

for pno0, y0, y1, x0, x1, dpi, name in JOBS:
    page = doc[pno0]
    clip = fitz.Rect(x0, y0, x1, y1)
    pix = page.get_pixmap(matrix=fitz.Matrix(dpi / 72.0, dpi / 72.0), clip=clip)
    out = f"/tmp/{name}.png"
    pix.save(out)
    print(out, pix.width, "x", pix.height)
