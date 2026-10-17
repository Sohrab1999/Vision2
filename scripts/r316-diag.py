#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r316 diag — کالبدشکافی بلوک ۴۶-۴۸: کلمات لبهٔ راست + y خط‌چین‌ها"""
import re, fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
doc = fitz.open(PDF)
W = doc[215].rect.width
page = doc[215]  # p216
dd = page.get_text("dict")
dashes = []
for blk in dd["blocks"]:
    for ln in blk.get("lines", []):
        txt = "".join(sp["text"] for sp in ln["spans"]).strip()
        y = min(sp["bbox"][1] for sp in ln["spans"])
        if re.match(r"^-{10,}$", txt):
            dashes.append(y)
dashes.sort()
print("p216 dashes:", [f"{x:.0f}" for x in dashes])

# بلوک ۴۶ (سراسری): y0..y1
import json
LIMIT218 = 316.0
all_blocks = []
for pno in (215, 216, 217, 218):
    pg = doc[pno - 1]
    d2 = pg.get_text("dict")
    ds, bot = [], None
    for blk in d2["blocks"]:
        for ln in blk.get("lines", []):
            txt = "".join(sp["text"] for sp in ln["spans"]).strip()
            y = min(sp["bbox"][1] for sp in ln["spans"])
            if re.match(r"^-{10,}$", txt):
                ds.append(y)
            if pno == 218 and y > LIMIT218:
                bot = y if bot is None else min(bot, y)
    ds.sort()
    tops = [18.0] + [x + 3 for x in ds]
    bots2 = [x - 2 for x in ds] + ([bot - 4] if bot else [815.0])
    for y0, y1 in zip(tops, bots2):
        if y1 - y0 > 14:
            all_blocks.append((pno, y0, y1))

for bi in (45, 46, 47):
    pno, y0, y1 = all_blocks[bi - 1]
    print(f"\n=== blk{bi} p{pno} y{y0:.1f}-{y1:.1f} ===")
    words = doc[pno - 1].get_text("words", clip=fitz.Rect(0, y0, W, y1))
    right = [(yy0, x0, wt) for x0, yy0, x1, yy1, wt, *_ in words if x0 > W * 0.70]
    right.sort()
    for yy0, x0, wt in right[:14]:
        print(f"   y={yy0:6.1f} x={x0:5.0f} | {wt!r}")
