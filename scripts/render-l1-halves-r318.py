#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r318 — رندرِ نیم‌صفحه‌ایِ ۷۰۰dpi برای رونویسیِ چشمیِ ۱۰۰ ترجمهٔ l1 (ص۱۸۱-۱۸۴)."""
import fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
doc = fitz.open(PDF)
for pno in (181, 182, 183, 184):
    page = doc[pno - 1]
    r = page.rect
    mid = r.height / 2
    for half, (y0, y1) in (("a", (0, mid + 12)), ("b", (mid - 12, r.height))):
        clip = fitz.Rect(0, y0, r.width, y1)
        pix = page.get_pixmap(dpi=700, clip=clip)
        out = f"/tmp/l1-p{pno}-{half}-700.png"
        pix.save(out)
        print(out, pix.width, "x", pix.height)
doc.close()
