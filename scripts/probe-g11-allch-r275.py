#!/usr/bin/env python3
"""probe-g11-allch-r275.py — اسکن همهٔ فصل‌های g11 برای شبکه‌های ۱..۴۰ و ترجمه‌ها"""
import json, re

ROOT = "/home/z/my-project"
g11 = json.load(open(f"{ROOT}/public/jozve/g11.json"))

GRID = re.compile(r"(?<![A-Za-z\d])(\d{1,3})\s+([a-d])(?![A-Za-z])")
TR = re.compile(r"^[\s\u0600-\u06FF(){}.'\"«»،:؛-]*\.?(\d{1,3})\s*گزینه\s*\(\s*\)?\s*([a-d])\s*\)?\s*(?:ترجمه\s*تست\s*[:：]?)?\s*(.*)$")

for c in g11["chapters"]:
    cid, title = c["id"], c.get("title", "")[:50]
    for i, s in enumerate(c["sections"]):
        joined = " ".join(s["lines"])
        pairs = GRID.findall(joined)
        uniq = {}
        for n, l in pairs:
            uniq.setdefault(int(n), l)
        trs = [TR.match(l.strip()) for l in s["lines"] if TR.match(l.strip())]
        tag = []
        if len(uniq) >= 20 and min(uniq) <= 5:
            tag.append(f"GRID {min(uniq)}..{max(uniq)} u={len(uniq)}")
        if len(trs) >= 10:
            tag.append(f"TR n={len(trs)}")
        if tag:
            print(f"  {cid} sec{i:2d} ({len(s['lines']):3d}L): {' | '.join(tag)}   «{title}»")
