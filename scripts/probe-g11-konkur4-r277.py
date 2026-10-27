#!/usr/bin/env python3
"""probe-g11-konkur4-r277.py — یافتن کلیدهای کنکوری L1 (در c12) و L3 (در c14)"""
import json
import re

ROOT = "/home/z/my-project"
G11 = f"{ROOT}/public/jozve/g11.json"
g11 = json.load(open(G11))

KEYPAT = re.compile(r"دستگرمی|دستگریم|کنکوری|پاسخنامه")
EXPL = re.compile(r"^\s*(\d{1,2})\s*[-ـ]\s*$|گزینه\s*\(\s*([a-d])\s*\)|\(?\s*گزینه\s*([a-d])")

for cid in ("c12", "c14"):
    ch = next(c for c in g11["chapters"] if c["id"] == cid)
    print(f"===== {cid}: {ch['title'][:60]} =====")
    for si, s in enumerate(ch["sections"]):
        t = s["title"]
        if KEYPAT.search(t) or (s["lines"] and any(KEYPAT.search(l) for l in s["lines"][:4])):
            print(f"  sec{si}: {t[:80]} ({len(s['lines'])} lines)")
            # نشان دادن اولین خطوطِ شبیه توضیح
            shown = 0
            for l in s["lines"]:
                if EXPL.search(l) or KEYPAT.search(l):
                    print(f"      | {l[:100]}")
                    shown += 1
                    if shown >= 5:
                        break
    print()
