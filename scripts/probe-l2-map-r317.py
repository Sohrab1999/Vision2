#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r317 — نگاشتِ بلوک↔آیتمِ l2 از هدرهای چاپیِ (N - حرف) لبهٔ راست."""
import re
import fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
PAGES = (198, 199, 200, 201, 202)
LIMIT202 = 470.0  # گریدِ کلیدِ ص۲۰۲ از این y شروع می‌شود

doc = fitz.open(PDF)
blocks = []
for pno in PAGES:
    page = doc[pno - 1]
    dd = page.get_text("dict")
    dashes, bottom = [], None
    for blk in dd["blocks"]:
        for ln in blk.get("lines", []):
            txt = "".join(sp["text"] for sp in ln["spans"]).strip()
            y = min(sp["bbox"][1] for sp in ln["spans"])
            if re.match(r"^-{6,}$", txt.replace(" ", "")):
                dashes.append(y)
            if pno == 202 and y > LIMIT202:
                bottom = y if bottom is None else min(bottom, y)
    dashes = sorted(set(round(d) for d in dashes))
    dashes = sorted(set(dashes))
    tops = [14.0] + [x + 3 for x in dashes]
    bots = [x - 2 for x in dashes] + ([bottom - 4] if bottom else [830.0])
    for y0, y1 in zip(tops, bots):
        if y1 - y0 > 14:
            blocks.append((pno, y0, y1))

print(f"total blocks: {len(blocks)}")

fa2en = str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789")
LET = re.compile(r"^\(?([abcd])\)?[,.;:]?$", re.I)
NUMW = re.compile(r"^\(?-?([0-9]{1,3})\)?-?,?$")

seen = []
for bi, (pno, y0, y1) in enumerate(blocks, 1):
    page = doc[pno - 1]
    W = page.rect.width
    words = page.get_text("words", clip=fitz.Rect(0, max(0, y0 - 2), W, y1 + 2))
    right = []
    for x0, yy0, x1, yy1, wt, *_ in words:
        if x0 < W * 0.70:
            continue
        t = wt.strip().translate(fa2en)
        m = LET.match(t)
        if m:
            right.append((yy0, "L", m.group(1).lower()))
            continue
        m = NUMW.match(t)
        if m and 1 <= int(m.group(1)) <= 100:
            right.append((yy0, "N", int(m.group(1))))
    right.sort()
    pairs = []
    for a in range(len(right)):
        for b in range(a + 1, len(right)):
            ya, ta, va = right[a]
            yb, tb, vb = right[b]
            if abs(ya - yb) < 2.5 and ta != tb:
                num = va if ta == "N" else vb
                let = va if ta == "L" else vb
                if 1 <= num <= 100:
                    pairs.append((num, let))
    first_line = ""
    if words:
        lines = {}
        for x0, yy0, x1, yy1, wt, *_ in words:
            lines.setdefault(round(yy0), []).append((x0, wt))
        top_key = sorted(lines)[0]
        row = sorted(lines[top_key], key=lambda t: -t[0])
        first_line = " ".join(w for _, w in row)[:70]
    print(f"blk{bi:02d} p{pno} y{y0:.0f}-{y1:.0f} headers={pairs[:4]} | {first_line}")
