# -*- coding: utf-8 -*-
# r365 — پروبِ واژنامهٔ درس دوم نهم: جدول واژه + جدول عبارت + مکالمهٔ خودِ درس (لنگرِ کلیدِ استنتاجی)
import re
from pathlib import Path

lines = Path("/home/z/my-project/booklet-extract/g9.txt").read_text(encoding="utf-8").split("\n")
PM = {}
for i, l in enumerate(lines):
    m = re.match(r"<<<PAGE (\d+)>>>", l)
    if m:
        PM[int(m.group(1))] = i

def page_of(idx):
    p = 0
    for q, v in sorted(PM.items()):
        if v <= idx:
            p = q
        else:
            break
    return p

print("lesson-2 vocab/conv zone pages:", page_of(2260), "to", page_of(2430))
print("\n===== lines 2260-2440 (lesson-2 vocab + phrases + conversation) =====")
for i in range(2260, 2440):
    s = lines[i].strip()
    if s and not s.startswith("<<<PAGE") and s != "جزوه کامل زبان انگلیسی":
        print(f"pdf-p{page_of(i)} {i:5d} {s[:100]!r}")
