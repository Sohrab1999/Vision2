#!/usr/bin/env python3
"""probe-g12-grammar-r277.py — پروب بانک‌های «جمع‌بندی گرامر» جزوهٔ دوازدهم
هدف: یافتن شبکه‌های «پاسخنامه کلیدی Nتست گرامر و نگارش» در فصل‌های کلید g12
(معادل c12-c14 یازدهم) + صفحات سؤال‌های گرامر هر درس.
"""
import json
import re

ROOT = "/home/z/my-project"
G12 = f"{ROOT}/public/jozve/g12.json"

g12 = json.load(open(G12))
print("== g12 chapters ==")
for c in g12["chapters"]:
    t = c["title"][:78]
    print(f"  {c['id']}: {t} | {len(c['sections'])} secs")

GRID_ANCHOR = re.compile(r"پاسخنامه\s*کلیدی\s*\d*\s*تست")
print("\n== sections containing grammar-key anchors ==")
for c in g12["chapters"]:
    for si, s in enumerate(c["sections"]):
        joined = " ".join(s["lines"][:6])
        if GRID_ANCHOR.search(s["title"]) or any(GRID_ANCHOR.search(l) for l in s["lines"][:8]):
            print(f"  {c['id']}/sec{si}: {s['title'][:70]}")
            for l in s["lines"][:16]:
                print("     ", l[:105])
            print()
