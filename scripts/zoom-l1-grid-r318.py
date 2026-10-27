#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r318 — زومِ گریدِ کلیدِ ص۱۸۴ (دو نیمه: سطرهای 1-50 و 51-100)."""
import fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
doc = fitz.open(PDF)
page = doc[183]
r = page.rect
# گرید: y ~ 555..775 — نیمهٔ بالا (سطر 1..5) و پایین (6..10)
clip1 = fitz.Rect(0, 550, r.width, 665)
pix = page.get_pixmap(dpi=700, clip=clip1)
pix.save("/tmp/l1-grid-top-700.png")
print("top:", pix.width, pix.height)
clip2 = fitz.Rect(0, 660, r.width, 780)
pix = page.get_pixmap(dpi=700, clip=clip2)
pix.save("/tmp/l1-grid-bot-700.png")
print("bot:", pix.width, pix.height)
doc.close()
