#!/usr/bin/env python3
# r217 — survey the grade-11 (Vision Two) jame booklet for the drill/exercise
# sets inside the teaching sections (p24-28 quantifiers/numbers, p59-63 present
# perfect, p65-67 phrasal, p67-68+97-99 gerund, p93-94 conditional, p95
# -ed/-ing) and the answer-key pages 188-191. Goal: attach the booklet's own
# self-check drills to the 7 grade-11 topics of the 'درسنامهٔ جامع' tab
# (g10 has 31 drills, g12 has 6, g11 has 0 — this round completes the set).
import re
from pathlib import Path

BASE = Path("/home/z/my-project/booklet-extract")
lines = (BASE / "g11.txt").read_text().split("\n")

pages = []  # [num, start_idx, end_idx]
for i, l in enumerate(lines):
    m = re.match(r"<<<PAGE (\d+)>>>", l.strip())
    if m:
        pages.append([int(m.group(1)), i, None])
        if len(pages) > 1:
            pages[-2][2] = i
pages[-1][2] = len(lines)

def dump(pg_lo, pg_hi, maxlines=400):
    for pg, s, e in pages:
        if pg_lo <= pg <= pg_hi:
            print(f"===== p{pg} =====")
            n = 0
            for j in range(s + 1, e):
                t = lines[j].strip()
                if not t:
                    continue
                print(t[:150])
                n += 1
                if n >= maxlines:
                    print("...TRUNC...")
                    break

if __name__ == "__main__":
    import sys
    lo, hi = int(sys.argv[1]), int(sys.argv[2])
    dump(lo, hi)
