#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r316 diag2 — رندرِ بلوک‌های مرزی 34/35/86/87 + JSON q34/q35/q43/q44/q87/q88"""
import re, json, fitz
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

DPI = 600
SCALE = DPI / 72
strips = []
for n in (33, 34, 35, 86, 87):
    pno, y0, y1 = all_blocks[n - 1]
    page = doc[pno - 1]
    pix = page.get_pixmap(dpi=DPI)
    img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    c = img.crop((0, max(0, int((y0 - 14) * SCALE)), img.width, min(img.height, int((y1 + 14) * SCALE))))
    strips.append((n, pno, y0, y1, c))

maxw = max(s.width for *_, s in strips)
th = sum(s.height + 60 for *_, s in strips)
comp = Image.new("RGB", (maxw, th), (255, 255, 255))
draw = ImageDraw.Draw(comp)
y = 0
for n, pno, y0, y1, s in strips:
    draw.rectangle([(0, y + s.height), (500, y + s.height + 52)], fill=(255, 255, 255))
    draw.text((20, y + s.height + 10), f"== blk{n} p{pno} y{y0:.0f}-{y1:.0f} ==", fill=(0, 0, 255))
    comp.paste(s, (0, y))
    y += s.height + 60
comp.save("/tmp/r316-boundary.png")
print("saved /tmp/r316-boundary.png", comp.size)

d = json.load(open("/home/z/my-project/public/jozve/tests-g12.json"))
l3 = [l for l in d["lessons"] if l["lesson"] == 3][0]
for n in (33, 34, 35, 36, 43, 44, 87, 88):
    q = l3["questions"][n - 1]
    print(f"\nQ{n} [{q['options'][q['answer']]}]: {q['question'][:90]}")
    print(f"   TR: {q.get('translation','—')[:130]}")
