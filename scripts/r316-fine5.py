#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r316 fine5 — Q48 خط دوم: برشِ x0-210pt در ۱۶۰۰dpi"""
import fitz
from PIL import Image

doc = fitz.open("/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf")
page = doc[215]
r = fitz.Rect(0, 488, 210, 509)
pix = page.get_pixmap(dpi=1600, clip=r)
img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
img.save("/tmp/r316-fine5-q48.png")
print("saved", img.size)
r2 = fitz.Rect(60, 488, 300, 509)
pix2 = page.get_pixmap(dpi=1600, clip=r2)
img2 = Image.frombytes("RGB", (pix2.width, pix2.height), pix2.samples)
img2.save("/tmp/r316-fine5-q48b.png")
print("saved2", img2.size)
