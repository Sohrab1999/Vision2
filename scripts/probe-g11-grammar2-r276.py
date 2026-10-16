#!/usr/bin/env python3
"""probe-g11-grammar2-r276.py — یافتن مرزهای دقیق سؤال‌های گرامر + شبکه‌های کلید"""
import json
import re

ROOT = "/home/z/my-project"
PDF = f"{ROOT}/upload/جزوه جامع یازدهم .pdf"
G11 = f"{ROOT}/public/jozve/g11.json"

import fitz
doc = fitz.open(PDF)

QSTART = re.compile(r"^(\d{1,3})[\.\-]\s*(.+)$")

# اسکن صفحات ۳۴-۴۲ برای ردگیری Q1..Q60 درس ۱
print("== lesson-1 grammar question pages scan (idx 34..42) ==")
for pno in range(34, 43):
    txt = doc[pno].get_text("text")
    lines = [l.strip() for l in txt.splitlines() if l.strip()]
    nums = []
    for l in lines:
        m = QSTART.match(l)
        if m:
            n = int(m.group(1))
            if 1 <= n <= 70:
                nums.append(n)
    # دنباله‌های پیوسته
    runs = []
    for n in nums:
        if runs and n == runs[-1][1] + 1:
            runs[-1][1] = n
        else:
            runs.append([n, n])
    hdr = "۶۰" in txt or "تست جمع بندی" in txt
    print(f"  idx {pno}: Q-runs={runs} header60={hdr}")

# همان کار برای درس ۲ (۷۰-۷۳ فیزیکی = idx 69..72) و درس ۳ (۱۰۵-۱۰۸ فیزیکی = idx 104..107)
for label, rng in (("lesson2", range(68, 77)), ("lesson3", range(103, 112))):
    print(f"\n== {label} pages scan ==")
    for pno in rng:
        txt = doc[pno].get_text("text")
        lines = [l.strip() for l in txt.splitlines() if l.strip()]
        nums = []
        for l in lines:
            m = QSTART.match(l)
            if m:
                n = int(m.group(1))
                if 1 <= n <= 70:
                    nums.append(n)
        runs = []
        for n in nums:
            if runs and n == runs[-1][1] + 1:
                runs[-1][1] = n
            else:
                runs.append([n, n])
        hdr = "تست جمع بندی" in txt or "گرامر" in txt
        print(f"  idx {pno}: Q-runs={runs} grammar-hdr={hdr}")

# شبکه‌های کلید: c12 sec12، c13 sec14، c14 sec29
g11 = json.load(open(G11))
for ch_id, si in (("c12", 12), ("c13", 14), ("c14", 29)):
    ch = next(c for c in g11["chapters"] if c["id"] == ch_id)
    if si < len(ch["sections"]):
        s = ch["sections"][si]
        print(f"\n== {ch_id} sec{si}: {s['title'][:70]} ({len(s['lines'])} lines) ==")
        for l in s["lines"][:24]:
            print("   ", l[:110])
