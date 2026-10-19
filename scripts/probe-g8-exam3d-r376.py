# -*- coding: utf-8 -*-
# r376d — داوری پایانی: جدول واژگان درس سوم (ص۲۸) + لنگرهای دقیق horse/morning/school/nurse/fever
import re
from pathlib import Path

LAYER = Path("/home/z/my-project/booklet-extract/g8.txt").read_text(encoding="utf-8").split("\n")
PM = {}
for i, l in enumerate(LAYER):
    m = re.match(r"<<<PAGE (\d+)>>>", l)
    if m: PM[int(m.group(1))] = i

def page_lines(p):
    start = PM[p]
    end = next((v for q, v in sorted(PM.items()) if q > p), len(LAYER))
    return LAYER[start:end]

print("=== LAYER p28 (واژگان درس سوم) کامل ===")
for l in page_lines(28):
    if l.strip():
        print(l.rstrip()[:170])

print("\n=== PRECISE ANCHORS (p1-40) ===")
for pat in [r"horse", r"morning", r"school", r"nurse", r"fever", r"measles", r"mumps",
            r"sneeze", r"swim", r"running", r"riding", r"buying", r"chess", r"badminton",
            r"ping pong", r"picture", r"draw a", r"make a cake", r"take photos"]:
    hits = []
    for p in range(1, 41):
        for l in page_lines(p):
            if re.search(pat, l, re.IGNORECASE) and "PAGE" not in l:
                hits.append(f"p{p}: {l.strip()[:100]}")
    print(f"  [{pat}] {len(hits)} hits")
    for h in hits[:4]:
        print(f"      {h}")
