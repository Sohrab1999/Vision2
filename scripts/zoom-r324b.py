# -*- coding: utf-8 -*-
# r324 — نوارهای افقیِ ۱۵۰۰dpi برای آیتم‌های مشکوک ص۲۴۳-۲۴۴
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

BANDS = [
    (242, 340, 425, "r324-b-q12-14"),   # p243: Q12-14
    (242, 420, 515, "r324-b-q15-19"),   # p243: Q15-19
    (242, 510, 620, "r324-b-q20-24"),   # p243: Q20-24
    (242, 615, 705, "r324-b-q25-27"),   # p243: Q25-27
    (243, 240, 345, "r324-b2-q33-35"),  # p244: Q33-35
    (243, 300, 380, "r324-b2-q36-40"),  # p244: Q36-40 overlap
]

for pno0, y0, y1, name in BANDS:
    page = doc[pno0]
    r = page.rect
    clip = fitz.Rect(r.x0, y0, r.x1, y1)
    pix = page.get_pixmap(matrix=fitz.Matrix(1500 / 72.0, 1500 / 72.0), clip=clip)
    out = f"/tmp/{name}.png"
    pix.save(out)
    print(out, pix.width, "x", pix.height)
