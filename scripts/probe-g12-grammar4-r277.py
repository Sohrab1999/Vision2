#!/usr/bin/env python3
"""probe-g12-grammar4-r277.py — دنبالهٔ بلوک کلید گرامر درس ۱ + صفحات PDF ۳۰-۳۹"""
import json
import re

ROOT = "/home/z/my-project"
G12 = f"{ROOT}/public/jozve/g12.json"
PDF = f"{ROOT}/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"

g12 = json.load(open(G12))
ch = next(c for c in g12["chapters"] if c["id"] == "c13")
s = ch["sections"][1]
print("== c13/sec1 lines 11-18 ==")
for i in range(11, len(s["lines"])):
    print(f"  {i:3d}| {s['lines'][i][:115]}")

import fitz
doc = fitz.open(PDF)
QSTART = re.compile(r"^(\d{1,3})[\.\-]\s*(.+)$")
print("\n== pages 28-40: Q-runs + grammar-headers ==")
for pno in range(27, 40):
    txt = doc[pno].get_text("text")
    lines = [l.strip() for l in txt.splitlines() if l.strip()]
    nums = []
    for l in lines:
        m = QSTART.match(l)
        if m:
            n = int(m.group(1))
            if 1 <= n <= 120:
                nums.append(n)
    runs = []
    for n in nums:
        if runs and n == runs[-1][1] + 1:
            runs[-1][1] = n
        else:
            runs.append([n, n])
    ghdr = "گرامر" in txt and ("تست" in txt or "آزمون" in txt)
    first = next((l for l in lines if "گرامر" in l), "")
    print(f"  p{pno+1}: runs={runs} | {first[:70]}")
