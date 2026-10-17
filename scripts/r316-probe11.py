#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r316 probe11 — توکن‌های fitz برای آیتم‌های باقی‌مانده (ترتیب y-سورت، RTL خام)"""
import re, fitz, json

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
LIMIT218 = 316.0
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

def item_to_block(it):
    if it <= 33:
        return it
    if it in (34, 35):
        return 34
    if 36 <= it <= 88:
        return it - 1
    return it

d = json.load(open("/home/z/my-project/public/jozve/tests-g12.json"))
l3 = [l for l in d["lessons"] if l["lesson"] == 3][0]

for it in (22, 24, 40, 48, 54, 58, 67, 72, 74):
    bi = item_to_block(it)
    pno, y0, y1 = all_blocks[bi - 1]
    page = doc[pno - 1]
    W = page.rect.width
    words = page.get_text("words", clip=fitz.Rect(0, y0 - 2, W, y1 + 2))
    # خطی: سورت بر (y, x معکوس برای RTL)
    lines = {}
    for x0, yy0, x1, yy1, wt, *_ in words:
        key = round(yy0)
        lines.setdefault(key, []).append((x0, wt))
    print(f"\n=== Q{it} (blk{bi} p{pno} y{y0:.0f}-{y1:.0f}) ===")
    for key in sorted(lines):
        row = sorted(lines[key], key=lambda t: -t[0])
        print("   " + " | ".join(w for _, w in row))
