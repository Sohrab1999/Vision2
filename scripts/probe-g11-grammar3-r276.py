#!/usr/bin/env python3
"""probe-g11-grammar3-r276.py — رفع ابهام درس ۲ (idx 68/69) + بررسی MCQ بودن همهٔ سؤال‌ها"""
import re

ROOT = "/home/z/my-project"
PDF = f"{ROOT}/upload/جزوه جامع یازدهم .pdf"

import fitz
doc = fitz.open(PDF)

QSTART = re.compile(r"^(\d{1,3})[\.\-]\s*(.+)$")

# صفحات مرزی درس ۲
for pno in (67, 68, 69):
    txt = doc[pno].get_text("text")
    lines = [l.strip() for l in txt.splitlines() if l.strip()]
    print(f"\n===== idx {pno} (physical {pno+1}) — {len(lines)} lines =====")
    for l in lines[:26]:
        print("   ", l[:105])

# بررسی گزینه‌داشتن همهٔ سؤال‌های گرامر درس ۱ (idx 35-38)
print("\n\n== lesson1: per-question option count (idx 35-38) ==")
raw = []
for pno in range(35, 39):
    raw.extend(doc[pno].get_text("text").splitlines())
lines = [l.strip() for l in raw if l.strip()]
cur = None
counts = {}
for ln in lines:
    m = QSTART.match(ln)
    if m and 1 <= int(m.group(1)) <= 60:
        cur = int(m.group(1))
        counts[cur] = 0
        continue
    if cur is None:
        continue
    if re.match(r"^[a-d]\s*\.", ln):
        # شمارش گزینه‌ها در خط (تک‌خطی چندگزینه‌ای)
        segs = re.findall(r"(?:^|\s)([a-d])\s*\.", ln)
        counts[cur] += len(segs)
bad = {n: c for n, c in counts.items() if c != 4}
print("  total parsed:", len(counts), "| non-4-option:", bad if bad else "NONE")
