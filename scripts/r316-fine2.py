#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r316 fine2 — برشِ موضعیِ ۱۴۰۰dpi دورِ کلمهٔ هدف (جست‌وجوی x با fitz)"""
import re, sys, json, fitz
from PIL import Image, ImageDraw

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
DPI = 700
doc = fitz.open(PDF)

d = json.load(open("/home/z/my-project/public/jozve/tests-g12.json"))
l3 = [l for l in d["lessons"] if l["lesson"] == 3][0]
qs = {q["n"]: q for q in l3["questions"]}

# (item, regex روی ترجمهٔ fitz برای یافتن y/x هدف، برچسب)
TARGETS = [
    (10, r"امیز"), (20, r"هله|هوله|فود"), (22, r"فهمید|بینید|خواهید|بد"), (24, r"مصري|مصری|الکي|الکی|الكلي"),
    (40, r"پسرش|پسرهاش|پسرهاي"), (41, r"آسپ|اسپ|اسي|آسی"), (46, r"عرض|عوض|بالب"),
    (48, r"چيزهاي|چیزهای|مي کشند|می کشند"), (54, r"دي|دی"), (58, r"کيد|کبد|قهوه|کید"),
    (61, r"انواع|انوع"), (65, r"دستان|داستان|الکتريکي|الکتریکی"), (67, r"سلطان|سرطان|مي کش|می کش|دري|دری"),
    (72, r"ترکمن|ترکمنستان|هوجینا|هوجینتا"), (74, r"بيست|بیشتر|مواقع|حق"), (80, r"فواص|فاصل|مدت"),
    (87, r"ارایم|آرامي|آرامی"), (98, r"پایکز|پاک"), (99, r"چري|چربی|چری"), (56, r"کلوچه|کلوچ"),
]

results = []
for it, pat in TARGETS:
    q = qs[it]
    # y آیتم از گرید: از headers.json اگر هست؛ وگرنه از نگاشت بلوکی
    try:
        heads = json.load(open("/tmp/r316-headers.json"))
    except Exception:
        heads = None

# ساده‌تر: از نگاشت بلوکی y بگیر
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

def item_to_block(it):
    if it <= 33:
        return it
    if it in (34, 35):
        return 34
    if 36 <= it <= 88:
        return it - 1
    return it

strips = []
for it, pat in TARGETS:
    bi = item_to_block(it)
    pno, y0, y1 = all_blocks[bi - 1]
    page = doc[pno - 1]
    W = page.rect.width
    clip = fitz.Rect(0, y0 - 2, W, y1 + 2)
    words = page.get_text("words", clip=clip)
    rx = re.compile(pat)
    hits = [(x0, yy0, x1, yy1, wt) for x0, yy0, x1, yy1, wt, *_ in words if rx.search(wt)]
    if not hits:
        print(f"Q{it}: no fitz hit for {pat!r} — full-line crop")
        cx0, cx1, cy0, cy1 = W * 0.05, W * 0.95, y0, y1
    else:
        # همهٔ خطوطِ دارای hit
        ys = sorted({round(h[1]) for h in hits})
        cy0 = min(h[1] for h in hits) - 4
        cy1 = max(h[3] for h in hits) + 4
        cx0 = max(0, min(h[0] for h in hits) - 90)
        cx1 = min(W, max(h[2] for h in hits) + 90)
        # خط را کامل بگیر: کل عرض خطِ hit
        cx0, cx1 = W * 0.03, W * 0.97
    r = fitz.Rect(cx0, cy0, cx1, cy1)
    pix = page.get_pixmap(dpi=DPI, clip=r)
    img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    # نصف‌کردن افقی برای خوانایی
    w, h = img.size
    half = w // 2
    strips.append((it, img.crop((0, 0, half + 60, h))))
    strips.append((it, img.crop((half - 60, 0, w, h))))

groups = [strips[i:i+4] for i in range(0, len(strips), 4)]  # 2 آیتم = 4 نیمه در هر فایل
for gi, grp in enumerate(groups):
    maxw = max(s.width for _, s in grp)
    th = sum(s.height + 56 for _, s in grp)
    comp = Image.new("RGB", (maxw, th), (255, 255, 255))
    draw = ImageDraw.Draw(comp)
    y = 0
    for n, s in grp:
        draw.rectangle([(0, y + s.height), (380, y + s.height + 48)], fill=(255, 255, 255))
        draw.text((16, y + s.height + 6), f"== Q{n} ==", fill=(0, 0, 255))
        comp.paste(s, (0, y))
        y += s.height + 56
    out = f"/tmp/r316-fine2-{gi+1}.png"
    comp.save(out)
    print(out, [n for n, _ in grp], comp.size)
