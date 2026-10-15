#!/usr/bin/env python3
# r225 — does the g11 booklet TEACH infinitives (مصدر / to + verb / infinitive)?
# r219 honestly parked 11 sentence-building items from p102/p110 because no
# infinitive topic card existed. If the booklet has its own infinitive teaching
# layer, a faithful topic card (bg-infinitive) can host them.
import re
from pathlib import Path

BASE = Path("/home/z/my-project/booklet-extract")

def pages_of(txt):
    lines = txt.split("\n")
    pages = []
    for i, l in enumerate(lines):
        m = re.match(r"<<<PAGE (\d+)>>>", l.strip())
        if m:
            pages.append([int(m.group(1)), i, None])
            if len(pages) > 1:
                pages[-2][2] = i
    if pages:
        pages[-1][2] = len(lines)
    return lines, pages

for grade, fname in [("g11", "g11.txt"), ("g10", "g10.txt"), ("g12", "g12.txt")]:
    lines, pages = pages_of((BASE / fname).read_text())
    print(f"\n########## {grade} — مصدر/infinitive hits ##########")
    hits = []
    for pg, s, e in pages:
        for li in range(s, e):
            t = lines[li]
            if re.search(r"مصدر|infinitive|Infinitive", t):
                hits.append((pg, li, t.strip()))
    for pg, li, t in hits[:40]:
        print(f"p{pg} L{li}: {t[:110]}")
    print(f"— total {len(hits)} hits in {grade}")
