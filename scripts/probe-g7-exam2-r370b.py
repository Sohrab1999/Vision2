# -*- coding: utf-8 -*-
# r370b — پروبِ «نمونه سؤالات امتحانی درس دوم» هفتم (pdf-p56-64): مرز + لایه
import re
from pathlib import Path

LAYER = Path("/home/z/my-project/booklet-extract/g7.txt").read_text(encoding="utf-8").split("\n")
PM = {}
for i, l in enumerate(LAYER):
    m = re.match(r"<<<PAGE (\d+)>>>", l)
    if m:
        PM[int(m.group(1))] = i

def page_lines(p: int) -> list[str]:
    start = PM[p]
    end = next((v for q, v in sorted(PM.items()) if q > p), len(LAYER))
    return LAYER[start:end]

print("=== FAMILY-2 BOUNDARY SCAN (p55-66) ===")
for p in range(55, 66):
    joined = "\n".join(page_lines(p))
    marks = []
    if re.search(r"نمونه سواالت امتحانی درس دوم", joined):
        marks.append("EXAM2-HEADER")
    if re.search(r"نمونه سواالت امتحانی درس سوم", joined):
        marks.append("EXAM3-HEADER")
    if re.search(r"درس سوم", joined):
        marks.append("L3?")
    print(f"pdf-p{p}: {marks if marks else '-'}")

print("\n=== LAYER p56-64 ===")
for p in range(56, 65):
    seg = page_lines(p)
    print(f"\n===== pdf-p{p} ({len(seg)} lines) =====")
    for j, s in enumerate(seg):
        print(f"{j:03d}| {s}")
