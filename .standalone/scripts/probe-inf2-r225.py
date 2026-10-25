#!/usr/bin/env python3
# r225 — dump the g11 'مصدر با to' teaching ranges: p79 (TOC hit?) and p97+ (the real درسنامه).
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

def dump(pg_lo, pg_hi):
    for pg, s, e in pages:
        if pg_lo <= pg <= pg_hi:
            print(f"\n--- p{pg} ---")
            for li in range(s, e):
                t = lines[li].rstrip()
                if t.strip():
                    print(f"L{li}: {t[:120]}")

dump(97, 99)
