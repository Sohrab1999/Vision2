#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r318 — زومِ ۹۰۰dpi برای Q74 و Q79 (داوریِ کلیدِ درون‌خطی در برابر گرید)."""
import fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
doc = fitz.open(PDF)

# Q74: p183, block y0~615 (pt) — clip 605..665
page = doc[182]
r = page.rect
clip = fitz.Rect(0, 600, r.width, 670)
pix = page.get_pixmap(dpi=900, clip=clip)
pix.save("/tmp/l1-q74-900.png")
print("q74:", pix.width, pix.height)

# Q79: p183, block y0~694..746? Q78 y694, Q80 y746 — clip 680..760
clip = fitz.Rect(0, 680, r.width, 760)
pix = page.get_pixmap(dpi=900, clip=clip)
pix.save("/tmp/l1-q79-900.png")
print("q79:", pix.width, pix.height)
doc.close()
