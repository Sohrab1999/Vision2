#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r316 zoom — رندرِ ۹۰۰dpi بلوک‌های مبهم (تا ۴ بلوک در هر تصویر)"""
import re, sys, fitz
from PIL import Image, ImageDraw

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
DPI = 900
SCALE = DPI / 72
LIMIT218 = 316.0

def get_blocks():
    doc = fitz.open(PDF)
    all_blocks = []
    for pno in (215, 216, 217, 218):
        page = doc[pno - 1]
        d = page.get_text("dict")
        dashes, bottom = [], None
        for blk in d["blocks"]:
            for ln in blk.get("lines", []):
                txt = "".join(sp["text"] for sp in ln["spans"]).strip()
                y = min(sp["bbox"][1] for sp in ln["spans"])
                if re.match(r"^-{10,}$", txt):
                    dashes.append(y)
                if pno == 218 and y > LIMIT218:
                    bottom = y if bottom is None else min(bottom, y)
        dashes.sort()
        tops = [18.0] + [dd + 3 for dd in dashes]
        bots = [dd - 2 for dd in dashes] + ([bottom - 4] if bottom else [815.0])
        for y0, y1 in zip(tops, bots):
            if y1 - y0 > 14:
                all_blocks.append((pno, y0, y1))
    return doc, all_blocks

def item_to_block(it):
    """نگاشتِ قطعی آیتم→بلوک (از هدرهای چاپی probe8):"""
    if it <= 33:
        return it
    if it == 34 or it == 35:
        return 34
    if 36 <= it <= 88:
        return it - 1
    return it  # 89..100 (blk88..100 = items 88..100 → blk=it)

def main(nums):
    doc, blocks = get_blocks()
    assert len(blocks) == 100, len(blocks)
    groups = [nums[i:i+4] for i in range(0, len(nums), 4)]
    for gi, grp in enumerate(groups):
        strips = []
        for n in grp:
            bi = item_to_block(n)
            pno, y0, y1 = blocks[bi-1]
            page = doc[pno - 1]
            pix = page.get_pixmap(dpi=DPI)
            img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
            crop = img.crop((0, max(0, int(y0*SCALE)), img.width, min(img.height, int(y1*SCALE))))
            # برشِ حاشیهٔ چپ/راست آبی: فقط 2.2% از هر طرف
            w = crop.width
            crop = crop.crop((int(w*0.022), 0, int(w*0.978), crop.height))
            strips.append((n, crop))
        maxw = max(s.width for _, s in strips)
        total_h = sum(s.height + 56 for _, s in strips)
        comp = Image.new("RGB", (maxw, total_h), (255, 255, 255))
        draw = ImageDraw.Draw(comp)
        y = 0
        for n, s in strips:
            draw.rectangle([(0, y + s.height), (400, y + s.height + 48)], fill=(255, 255, 255))
            draw.text((20, y + s.height + 10), f"== Q{n} ==", fill=(0, 0, 255))
            comp.paste(s, (0, y))
            y += s.height + 56
        out = f"/tmp/r316-zoom-{gi+1}.png"
        comp.save(out)
        print(out, [n for n, _ in strips], comp.size)

if __name__ == "__main__":
    nums = [int(x) for x in sys.argv[1:]]
    main(nums)
