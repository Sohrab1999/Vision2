#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r316 fine3 — میکرو-برش ۱۴۰۰dpi با xِ دقیق از کلمات fitz"""
import re, sys, fitz
from PIL import Image, ImageDraw

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
DPI = 1400
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

def norm(s):
    # نرمال‌سازی برای فازی: حذف اعراب/نیم‌فاصله/تطویل + یکسان‌سازی ی/ی عربی و ک/ک
    s = re.sub(r"[\u064B-\u065F\u0670\u0640]", "", s)
    return (s.replace("\u200c", "").replace("ي", "ی").replace("ك", "ک")
             .replace("ئ", "ی").replace("أ", "ا").replace("آ", "ا"))

# (item، الگو روی کلمات fitz نرمال‌شده)
TARGETS = [
    (20, r"هله|هوله|هول"), (22, r"خواهید|فهمید|بینید|^بد$|برد|بدانید"), (24, r"مصری|مصرف|^الکی$|الکلی"),
    (40, r"شنید|شدید|پسرش|پسرهاش|پسرهایش"), (41, r"اسپ|اسیب|آسیب|برسام|برسانم"),
    (48, r"چیزهای|چیزهایی|کشند|کشد"), (54, r"پایین|پلاگین|درایو|دریلو"), (58, r"قهوه|الکل"),
    (61, r"انواع|انوع"), (65, r"دستان|داستان|خیری|خبری|الکتریکی|هنرهای"),
    (67, r"سلطان|سرطان|^دری$|دردی|کش$|کشد"), (72, r"هوجینا|هوجینتا"), (74, r"حق|منابع"), (80, r"فواص|فاصل|فواصل|فرصت"),
]

NORM = {k: norm(k) for k in "آأيكيئ"}
strips = []
for it, pat in TARGETS:
    bi = item_to_block(it)
    pno, y0, y1 = all_blocks[bi - 1]
    page = doc[pno - 1]
    W = page.rect.width
    words = page.get_text("words", clip=fitz.Rect(0, y0 - 2, W, y1 + 2))
    rx = re.compile(pat)
    hits = [(x0, yy0, x1, yy1, wt) for x0, yy0, x1, yy1, wt, *_ in words if rx.search(norm(wt))]
    if not hits:
        print(f"Q{it}: NO fitz hit for {pat!r}")
        continue
    cx0 = max(0, min(h[0] for h in hits) - 70)
    cx1 = min(W, max(h[2] for h in hits) + 70)
    cy0 = min(h[1] for h in hits) - 5
    cy1 = max(h[3] for h in hits) + 5
    r = fitz.Rect(cx0, cy0, cx1, cy1)
    pix = page.get_pixmap(dpi=DPI, clip=r)
    img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    strips.append((it, img))
    print(f"Q{it}: hits={[h[4] for h in hits][:6]} x[{cx0:.0f},{cx1:.0f}]")

# هر آیتم یک فایل
groups = [strips[i:i+4] for i in range(0, len(strips), 4)]
for gi, grp in enumerate(groups):
    maxw = max(s.width for _, s in grp)
    th = sum(s.height + 54 for _, s in grp)
    comp = Image.new("RGB", (maxw, th), (255, 255, 255))
    draw = ImageDraw.Draw(comp)
    y = 0
    for n, s in grp:
        draw.rectangle([(0, y + s.height), (360, y + s.height + 46)], fill=(255, 255, 255))
        draw.text((14, y + s.height + 6), f"== Q{n} ==", fill=(0, 0, 255))
        comp.paste(s, (0, y))
        y += s.height + 54
    out = f"/tmp/r316-fine3-{gi+1}.png"
    comp.save(out)
    print(out, [n for n, _ in grp], comp.size)
