#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r316 crop — بلوک‌های ۱۰۰تایی ص۲۱۵-۲۱۸ (الگوی r315-crop-blocks)"""
import re, fitz
from PIL import Image, ImageDraw

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
DPI = 300
SCALE = DPI / 72
doc = fitz.open(PDF)

# p218: بخش ۱۰۰تایی تا y≈308 (بعدش سکشن بعدی)
LIMIT218 = 316.0

all_blocks = []  # (page, y0, y1)
for pno in (215, 216, 217, 218):
    page = doc[pno - 1]
    d = page.get_text("dict")
    dashes = []
    bottom = None
    for blk in d["blocks"]:
        for ln in blk.get("lines", []):
            txt = "".join(sp["text"] for sp in ln["spans"]).strip()
            y = min(sp["bbox"][1] for sp in ln["spans"])
            if re.match(r"^-{10,}$", txt):
                dashes.append(y)
            if pno == 218 and y > LIMIT218:
                bottom = y if bottom is None else min(bottom, y)
    dashes.sort()
    print(f"p{pno}: {len(dashes)} dashes, bottom={bottom}")
    # بلوک‌ها: [شروع صفحه یا بعد از هر خط‌چین] تا [خط‌چین بعدی - 6]
    tops = [18.0] + [dd + 3 for dd in dashes]  # بعد از خط‌چین +3pt
    bots = [dd - 2 for dd in dashes] + ([bottom - 4] if bottom else [815.0])
    for y0, y1 in zip(tops, bots):
        if y1 - y0 > 14:
            all_blocks.append((pno, y0, y1))

print(f"total blocks: {len(all_blocks)}")
for pno in (215, 216, 217, 218):
    n = sum(1 for b in all_blocks if b[0] == pno)
    print(f"  p{pno}: {n} blocks")

# ترکیب: هر صفحه در یک PNG (با برچسب شمارهٔ بلوک جهانی)
for pno in (215, 216, 217, 218):
    page = doc[pno - 1]
    pix = page.get_pixmap(dpi=DPI)
    img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    blocks = [(gi, b) for gi, b in enumerate(all_blocks) if b[0] == pno]
    strips = []
    for gi, (_, y0, y1) in blocks:
        strips.append((gi + 1, img.crop((0, max(0, int(y0 * SCALE)), img.width, min(img.height, int(y1 * SCALE))))))
    total_h = sum(s.height + 34 for _, s in strips)
    comp = Image.new("RGB", (img.width, total_h), (255, 255, 255))
    draw = ImageDraw.Draw(comp)
    y = 0
    for n, s in strips:
        draw.rectangle([(0, y + s.height), (220, y + s.height + 30)], fill=(255, 255, 255))
        draw.text((10, y + s.height + 6), f"== BLK {n} ==", fill=(0, 0, 255))
        comp.paste(s, (0, y))
        y += s.height + 34
    out = f"/tmp/r316-blocks-p{pno}.png"
    comp.save(out)
    print(out, "blocks", [n for n, _ in strips], comp.size)
