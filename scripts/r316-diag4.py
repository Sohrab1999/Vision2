#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r316 diag4 — رندر بلوک‌های 39-44 ص۲۱۶ با شماره‌های چاپی (حل تعارض نهایی)"""
import re, fitz
from PIL import Image, ImageDraw

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
doc = fitz.open(PDF)
page = doc[215]  # p216
DPI = 450
SCALE = DPI / 72

# بلوک‌های 39..44 با مرزهای خط‌چین: 386,411,435,459,484,508,533
bounds = [(386, 411), (411, 435), (435, 459), (459, 484), (484, 508), (508, 533)]
labels = ["blk38", "blk39", "blk40", "blk41", "blk42", "blk43"]
pix = page.get_pixmap(dpi=DPI)
img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
strips = []
for (y0, y1), lab in zip(bounds, labels):
    c = img.crop((0, int((y0 - 2) * SCALE), img.width, int((y1 + 2) * SCALE)))
    strips.append((lab, c))
th = sum(s.height + 50 for _, s in strips)
comp = Image.new("RGB", (img.width, th), (255, 255, 255))
draw = ImageDraw.Draw(comp)
y = 0
for lab, s in strips:
    draw.rectangle([(0, y + s.height), (400, y + s.height + 44)], fill=(255, 255, 255))
    draw.text((12, y + s.height + 6), f"== {lab} ==", fill=(0, 0, 255))
    comp.paste(s, (0, y))
    y += s.height + 50
comp.save("/tmp/r316-diag4.png")
print("saved /tmp/r316-diag4.png", comp.size)
