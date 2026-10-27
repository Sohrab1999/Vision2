#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r318 — رندرِ صفحاتِ ۱۸۱-۱۸۴: کلِ صفحه در ۳۰۰dpi برای رونویسیِ چشمی."""
import fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
doc = fitz.open(PDF)
for pno in (181, 182, 183, 184):
    page = doc[pno - 1]
    pix = page.get_pixmap(dpi=300)
    out = f"/tmp/l1-p{pno}-300.png"
    pix.save(out)
    print(out, pix.width, "x", pix.height)
doc.close()
