#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r317 — داوریِ نهاییِ گریدِ کلیدِ ۱۰×۱۰ِ ص۲۰۲ در برابر JSON (l2)."""
import re
import json
import fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
BANK = "/home/z/my-project/public/jozve/tests-g12.json"

doc = fitz.open(PDF)
page = doc[201]  # ص۲۰۲
W = page.rect.width
words = page.get_text("words", clip=fitz.Rect(0, 210, W, 430))
fa2en = str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789")

cells = []  # (y, x, kind, val)
for x0, yy0, x1, yy1, wt, *_ in words:
    t = wt.strip().translate(fa2en)
    m = re.match(r"^\(?([abcd])[.,]?$", t, re.I)
    if m:
        cells.append((yy0, x0, "L", m.group(1).lower()))
        continue
    m = re.match(r"^\(?(\d{1,3})\)?,?$", t)
    if m:
        n = int(m.group(1))
        if 1 <= n <= 100:
            cells.append((yy0, x0, "N", n))

cells.sort(key=lambda c: (c[0], c[1]))
rows = []
for y, x, kind, val in cells:
    if rows and y - rows[-1]["y"] < 3:
        rows[-1]["cells"].append((x, kind, val))
        rows[-1]["y"] = max(rows[-1]["y"], y)
    else:
        rows.append({"y": y, "cells": [(x, kind, val)]})

print("rows:", len(rows), "sizes:", [len(r["cells"]) for r in rows])

grid = {}
for r in rows:
    seq = sorted(r["cells"], key=lambda c: -c[0])  # RTL
    i = 0
    while i + 1 < len(seq):
        (x1, k1, v1), (x2, k2, v2) = seq[i], seq[i + 1]
        if k1 == "L" and k2 == "N":
            grid[v2] = v1
            i += 2
        else:
            i += 1

print("grid:", len(grid), "/100")
print("missing:", [n for n in range(1, 101) if n not in grid])

data = json.load(open(BANK))
l2 = [l for l in data["lessons"] if l["lesson"] == 2][0]
qs = {q["n"]: q for q in l2["questions"]}
dis = [(n, grid.get(n), "abcd"[qs[n]["answer"]]) for n in range(1, 101)
       if n in grid and grid[n] != "abcd"[qs[n]["answer"]]]
print("disagreements JSON-vs-grid:", dis if dis else "NONE — 100/100 موافق")
