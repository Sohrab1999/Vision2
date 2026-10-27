#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r316 fine6 — میکرو-رندر Q9/Q51/Q68/Q69/Q70 (واژه‌های آخرِ مبهم)"""
import re, fitz
from PIL import Image, ImageDraw

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
doc = fitz.open(PDF)

LIMIT218 = 316.0
all_blocks = []
for pno in (215, 216, 217, 218):
    page = doc[pno - 1]
    dd = page.get_text("dict")
    dashes, bottom = [], None
    for blk in dd["blocks"]:
        for ln in blk.get("lines", []):
            txt = "".join(sp["text"] for sp in ln["spans"]).strip()
            y = min(sp["bbox"][1] for sp in ln["spans"])
            if re.match(r"^-{10,}$", txt):
                dashes.append(y)
            if pno == 218 and y > LIMIT218:
                bottom = y if bottom is None else min(bottom, y)
    dashes.sort()
    tops = [18.0] + [x + 3 for x in dashes]
    bots = [x - 2 for x in dashes] + ([bottom - 4] if bottom else [815.0])
    for y0, y1 in zip(tops, bots):
        if y1 - y0 > 14:
            all_blocks.append((pno, y0, y1))

def i2b(it):
    if it <= 33:
        return it
    if it in (34, 35):
        return 34
    if 36 <= it <= 88:
        return it - 1
    return it

# (item، ناحیهٔ x بر حسب pt روی صفحه)
JOBS = [
    (9, 340, 560),    # «به خودشان میکند که آرزو میکنید» — سمت راستِ خط
    (51, 60, 300),    # «به طور فرزانه ای نقش بزرگی» — سمت چپ
    (68, 330, 560),   # «یک مبت آموزشی بالقوه ... تصاویر دستگاه»
    (69, 200, 430),   # «تحلیل کردن ... به طور کلی»
    (70, 330, 560),   # «راه های افزایش آگهی»
]
strips = []
for it, x0, x1 in JOBS:
    bi = i2b(it)
    pno, y0, y1 = all_blocks[bi - 1]
    page = doc[pno - 1]
    r = fitz.Rect(x0, y0 - 2, x1, y1 + 2)
    pix = page.get_pixmap(dpi=1300, clip=r)
    img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    strips.append((it, img))

maxw = max(s.width for _, s in strips)
th = sum(s.height + 54 for _, s in strips)
comp = Image.new("RGB", (maxw, th), (255, 255, 255))
draw = ImageDraw.Draw(comp)
y = 0
for n, s in strips:
    draw.rectangle([(0, y + s.height), (360, y + s.height + 46)], fill=(255, 255, 255))
    draw.text((14, y + s.height + 6), f"== Q{n} ==", fill=(0, 0, 255))
    comp.paste(s, (0, y))
    y += s.height + 54
comp.save("/tmp/r316-fine6.png")
print("/tmp/r316-fine6.png", comp.size)
