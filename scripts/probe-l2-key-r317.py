#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r317 — داوریِ کلیدِ l2: (الف) هدرهای چاپی در برابر JSON، (ب) گریدِ ۱۰×۱۰ ص۲۰۲ در برابر JSON."""
import re
import json
import fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
BANK = "/home/z/my-project/public/jozve/tests-g12.json"
LIMIT202 = 470.0

doc = fitz.open(PDF)
data = json.load(open(BANK))
l2 = [l for l in data["lessons"] if l["lesson"] == 2][0]
qs = {q["n"]: q for q in l2["questions"]}

fa2en = str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789")

# ---- (الف) هدرهای چاپیِ لبهٔ راست هر بلوک (نگاشتِ 1:1 اثبات‌شده) ----
PAGES = (198, 199, 200, 201, 202)
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
    tops = [14.0] + [x + 3 for x in dashes]
    bots = [x - 2 for x in dashes] + ([bottom - 4] if bottom else [830.0])
    for y0, y1 in zip(tops, bots):
        if y1 - y0 > 14:
            blocks.append((pno, y0, y1))

LET = re.compile(r"^\(?([abcd])\)?[,.;:]?$", re.I)
NUMW = re.compile(r"^\(?-?([0-9]{1,3})\)?-?,?$")

hdr = {}
hdr_miss = []
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
    pick = [p for p in pairs if p[0] == bi]
    if pick:
        hdr[bi] = pick[0][1]
    else:
        hdr_miss.append(bi)

print(f"[headers] found={len(hdr)}/100 missing={hdr_miss}")
dis = [(n, hdr[n], "abcd"[qs[n]["answer"]]) for n in sorted(hdr) if hdr[n] != "abcd"[qs[n]["answer"]]]
print(f"[headers] JSON-vs-header disagreements: {dis}")

# ---- (ب) گریدِ ۱۰×۱۰ انتهای ص۲۰۲ ----
page = doc[201]
W = page.rect.width
words = page.get_text("words", clip=fitz.Rect(0, LIMIT202, W, 800))
rows = {}
for x0, yy0, x1, yy1, wt, *_ in words:
    t = wt.strip().translate(fa2en)
    if re.match(r"^\(?[abcd]\)?$", t, re.I):
        rows.setdefault(round(yy0 / 8), []).append((x0, yy0, t.lower()))
print(f"[grid] letter-cells: {sum(len(v) for v in rows.values())}")
grid = {}
for key in sorted(rows):
    row = sorted(rows[key], key=lambda t: -t[0])  # RTL: راست به چپ
    lets = [t for _, _, t in row]
    print(f"  y~{key*8}: {lets}")
