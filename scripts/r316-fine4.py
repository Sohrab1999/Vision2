#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r316 fine4 — میکرو-برش Q48 ناحیهٔ «توانات» (x از fitz)"""
import re, fitz
from PIL import Image, ImageDraw

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
doc = fitz.open(PDF)
page = doc[215]  # p216
W = page.rect.width

words = page.get_text("words", clip=fitz.Rect(0, 485, W, 508))
for x0, yy0, x1, yy1, wt, *_ in words:
    print(f"  x[{x0:5.1f},{x1:5.1f}] y{yy0:.0f} | {wt!r}")

# برش دور «توانات» (پیدا کن)
tgt = None
for x0, yy0, x1, yy1, wt, *_ in words:
    if "توانات" in wt or "توانند" in wt:
        tgt = (x0, yy0, x1, yy1)
if tgt:
    x0, yy0, x1, yy1 = tgt
    r = fitz.Rect(max(0, x0 - 120), yy0 - 6, min(W, x1 + 120), yy1 + 6)
    pix = page.get_pixmap(dpi=1600, clip=r)
    img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    img.save("/tmp/r316-fine4-q48.png")
    print("saved", img.size)
else:
    print("توانات token not found — full second line")
    r = fitz.Rect(0, 497, W, 508)
    pix = page.get_pixmap(dpi=1200, clip=r)
    img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    img.save("/tmp/r316-fine4-q48.png")
    print("saved full-line", img.size)
