#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r318 — زومِ ۲۴۰۰dpi برای ۸ موردِ پایانیِ داوریِ واژه‌به‌واژه."""
import fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
doc = fitz.open(PDF)
strips = [
    (182, 450, 482, "q43"),    # Q43
    (182, 580, 612, "q48"),    # Q48
    (183, 125, 158, "q60"),    # Q60
    (183, 152, 186, "q61"),    # Q61
    (183, 688, 722, "q78"),    # Q78
    (184, 180, 214, "q88"),    # Q88
    (184, 306, 338, "q93"),    # Q93
    (184, 496, 528, "q100"),   # Q100
]
for pno, y0, y1, tag in strips:
    page = doc[pno - 1]
    clip = fitz.Rect(0, y0 - 3, page.rect.width, y1 + 3)
    pix = page.get_pixmap(dpi=2400, clip=clip)
    out = f"/tmp/l1f-{tag}-2400.png"
    pix.save(out)
    print(out, pix.width, "x", pix.height)
doc.close()
