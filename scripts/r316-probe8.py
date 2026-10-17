#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r316 probe8 — نگاشتِ قطعی: جفتِ (شماره، حرف) هم‌خط در لبهٔ راست هر بلوک"""
import re, json, fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
LIMIT218 = 316.0
doc = fitz.open(PDF)
W = doc[214].rect.width

d = json.load(open("/home/z/my-project/public/jozve/tests-g12.json"))
l3 = [l for l in d["lessons"] if l["lesson"] == 3][0]
qs = {q["n"]: q for q in l3["questions"]}

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

fa2en = str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789")
LET = re.compile(r"^\(?([abcd])\)?[,.;]?$", re.I)
NUMW = re.compile(r"^\(?-?([0-9]{1,3})\)?-?,?$")

mapping = {}
for i, (pno, y0, y1) in enumerate(all_blocks, start=1):
    page = doc[pno - 1]
    clip = fitz.Rect(0, y0, W, y1)
    words = page.get_text("words", clip=clip)
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
    # جفتِ هم‌خط (dy<2) با شمارهٔ ۱..۱۰۰
    pairs = []
    for a in range(len(right)):
        for b in range(a + 1, len(right)):
            ya, ta, va = right[a]
            yb, tb, vb = right[b]
            if abs(ya - yb) < 2.0 and ta != tb:
                num = va if ta == "N" else vb
                let = va if ta == "L" else vb
                if 1 <= num <= 100:
                    pairs.append((num, let))
    mapping[i] = pairs

print("blk -> (num,letter) pairs found:")
seq = []
for i in range(1, 101):
    p = mapping[i]
    json_ans = "abcd"[qs[i]["answer"]]
    mark = ""
    pick = p[0] if p else None
    if pick:
        seq.append(pick[0])
        mark = "OK" if pick[0] == i and pick[1] == json_ans else "XX"
    else:
        seq.append(None)
        mark = "??"
    print(f"blk{i:3d} pairs={p} json={i}:{json_ans} {mark}")
