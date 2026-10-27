#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r317 — dump لایهٔ fitz هر ۱۰۰ بلوکِ ترجمهٔ l2 (مرتبِ RTL) برای پایهٔ رونویسیِ چشمی."""
import re
import fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
PAGES = (198, 199, 200, 201, 202)
LIMIT202 = 195.0  # ترجمه‌های ص۲۰۲ تا قبل از سربرگِ گرید (سربرگ ~y200)

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
    if pno == 202:
        dashes = [d for d in dashes if d < LIMIT202]
    tops = [14.0] + [x + 3 for x in dashes]
    bots = [x - 2 for x in dashes] + ([bottom - 4] if bottom else [830.0])
    for y0, y1 in zip(tops, bots):
        if y1 - y0 > 14:
            blocks.append((pno, y0, y1))

assert len(blocks) == 100, f"expected 100 blocks, got {len(blocks)}"

for bi, (pno, y0, y1) in enumerate(blocks, 1):
    page = doc[pno - 1]
    W = page.rect.width
    words = page.get_text("words", clip=fitz.Rect(0, max(0, y0 - 2), W, min(y1 + 2, page.rect.height)))
    lines = {}
    for x0, yy0, x1, yy1, wt, *_ in words:
        lines.setdefault(round(yy0), []).append((x0, wt))
    parts = []
    for key in sorted(lines):
        row = sorted(lines[key], key=lambda t: -t[0])
        parts.append(" ".join(w for _, w in row))
    print(f"Q{bi:03d} [p{pno} y{y0:.0f}-{y1:.0f}] " + " / ".join(parts))
