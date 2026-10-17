#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r316 fine — کلیپ ۲۰۰۰dpi هر آیتم، دو نیمهٔ چپ/راست برای خواناییِ حرف‌به‌حرف"""
import re, sys, fitz
from PIL import Image, ImageDraw

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
DPI = 2000
SCALE = DPI / 72
LIMIT218 = 316.0

def get_blocks():
    doc = fitz.open(PDF)
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
    return doc, all_blocks

def item_to_block(it):
    if it <= 33:
        return it
    if it in (34, 35):
        return 34
    if 36 <= it <= 88:
        return it - 1
    return it

def main(nums):
    doc, blocks = get_blocks()
    groups = [nums[i:i+2] for i in range(0, len(nums), 2)]
    for gi, grp in enumerate(groups):
        strips = []
        for n in grp:
            bi = item_to_block(n)
            pno, y0, y1 = blocks[bi-1]
            page = doc[pno - 1]
            clip = fitz.Rect(page.rect.width*0.02, max(0, y0-3), page.rect.width*0.98, min(page.rect.height, y1+3))
            pix = page.get_pixmap(dpi=DPI, clip=clip)
            crop = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
            w, h = crop.size
            if h > 500:  # بلوک دونیمه‌ای: خط اول و دوم جدا
                mid = h // 2
                strips.append((n, crop.crop((0, 0, w, min(h, mid + 40)))))
                strips.append((n, crop.crop((0, max(0, mid - 40), w, h))))
            else:
                strips.append((n, crop))
        maxw = max(s.width for _, s in strips)
        th = sum(s.height + 60 for _, s in strips)
        comp = Image.new("RGB", (maxw, th), (255, 255, 255))
        draw = ImageDraw.Draw(comp)
        y = 0
        for n, s in strips:
            draw.rectangle([(0, y + s.height), (420, y + s.height + 52)], fill=(255, 255, 255))
            draw.text((20, y + s.height + 8), f"== Q{n} ==", fill=(0, 0, 255))
            comp.paste(s, (0, y))
            y += s.height + 60
        out = f"/tmp/r316-fine-{gi+1}.png"
        comp.save(out)
        print(out, grp, comp.size)

if __name__ == "__main__":
    main([int(x) for x in sys.argv[1:]])
