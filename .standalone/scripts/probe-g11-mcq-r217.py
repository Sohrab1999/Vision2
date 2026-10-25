#!/usr/bin/env python3
# r217 — find 4-option MCQ exercise sets (a) b) c) d) style) inside the g11
# teaching pages, distinct from the konkur quiz bank (already mined in r212)
# and from the binary/production sets. Print page + the a/b/c/d-bearing lines.
import re
from pathlib import Path

BASE = Path("/home/z/my-project/booklet-extract")
lines = (BASE / "g11.txt").read_text().split("\n")

pages = []
for i, l in enumerate(lines):
    m = re.match(r"<<<PAGE (\d+)>>>", l.strip())
    if m:
        pages.append([int(m.group(1)), i, None])
        if len(pages) > 1:
            pages[-2][2] = i
pages[-1][2] = len(lines)

OPT = re.compile(r"(?:^|\s)[abcd]\s*[\)\.\-]\s*\S")
NUMQ = re.compile(r"^\s*\d{1,2}\s*[\.\-\)]")

for pg, s, e in pages:
    if not (20 <= pg <= 110):  # teaching range
        continue
    hits = []
    for j in range(s + 1, e):
        t = lines[j].strip()
        if OPT.search(t):
            hits.append(t[:130])
    if len(hits) >= 3:
        print(f"===== p{pg} ({len(hits)} option-lines) =====")
        for h in hits[:8]:
            print("   ", h)
