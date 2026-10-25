#!/usr/bin/env python3
# r226 — fidelity tour: dump the g12 TOC (فهرست مطالب) grammar entries and the
# g10 TOC, to cross-check every teaching item against the 32 shipped topics.
# The r225 method (TOC as witness) caught g11's مصدر با to — repeat for g12/g10.
import re
from pathlib import Path

BASE = Path("/home/z/my-project/booklet-extract")
lines = (BASE / "g12.txt").read_text().split("\n")
pages = []
for i, l in enumerate(lines):
    m = re.match(r"<<<PAGE (\d+)>>>", l.strip())
    if m:
        pages.append([int(m.group(1)), i, None])
        if len(pages) > 1:
            pages[-2][2] = i
pages[-1][2] = len(lines)

def dump(pg_lo, pg_hi):
    for pg, s, e in pages:
        if pg_lo <= pg <= pg_hi:
            print(f"\n--- p{pg} ---")
            for li in range(s, e):
                t = lines[li].rstrip()
                if t.strip():
                    print(f"L{li}: {t[:115]}")

dump(2, 5)
