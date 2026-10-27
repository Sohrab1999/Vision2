#!/usr/bin/env python3
"""probe-g11-grids-r275.py — جست‌وجوی شبکه‌های کلید در همهٔ سکشن‌های g11 + شمارش الگوی ترجمه"""
import json, re

ROOT = "/home/z/my-project"
g11 = json.load(open(f"{ROOT}/public/jozve/g11.json"))
chs = g11["chapters"]

GRID = re.compile(r"(?<![A-Za-z\d])(\d{1,3})\s+([a-d])(?![A-Za-z])")
TR = re.compile(r"^\.?\s*(\d{1,3})\s*گزینه\s*\(\s*\)?\s*([a-d])\s*\)?\s*(?:ترجمه\s*تست\s*[:：]?)?\s*(.*)$")

for cid in ("c12", "c13", "c14"):
    print(f"===== {cid} =====")
    for i, s in enumerate(next(c for c in chs if c["id"]==cid)["sections"]):
        joined = " ".join(s["lines"])
        pairs = GRID.findall(joined)
        uniq = {}
        for n, l in pairs:
            uniq.setdefault(int(n), l)
        trs = [TR.match(l.strip()) for l in s["lines"] if TR.match(l.strip())]
        tag = []
        if len(uniq) >= 30:
            tag.append(f"GRID {min(uniq)}..{max(uniq)} unique={len(uniq)}")
        if trs:
            nums = sorted({int(t.group(1)) for t in trs})
            tag.append(f"TR n={len(trs)} range {nums[0]}..{nums[-1]}")
        if tag:
            print(f"  sec{i:2d} ({len(s['lines']):3d}L): {' | '.join(tag)}")
    print()
