#!/usr/bin/env python3
# r220 — attribute the g12 booklet grammar topics to the booklet's own lessons
# (درس اول/دوم/سوم page boundaries) so the درسنامه↔درس links are booklet-native,
# not invented. Also print the g11 boundaries as a cross-check for r215's mapping.
import re
from pathlib import Path

BASE = Path("/home/z/my-project/booklet-extract")

def page_map(txt):
    lines = txt.split("\n")
    pages = []  # (page, start_line, end_line)
    for i, l in enumerate(lines):
        m = re.match(r"<<<PAGE (\d+)>>>", l.strip())
        if m:
            pages.append([int(m.group(1)), i, None])
            if len(pages) > 1:
                pages[-2][2] = i
    pages[-1][2] = len(lines)
    return lines, pages

def line_to_page(pages, ln):
    for pg, s, e in pages:
        if s <= ln < e:
            return pg
    return None

for grade in ("g12", "g11"):
    lines, pages = page_map((BASE / f"{grade}.txt").read_text())
    print(f"\n===== {grade} — lesson headers with page numbers =====")
    for i, l in enumerate(lines):
        if re.search(r"درس اول---|درس دوم---|درس سوم---|درس وم س|آزمون تش\s*ییح گرامر", l):
            pg = line_to_page(pages, i)
            print(f"p{pg:3d} | {l.strip()[:80]}")
    print(f"----- {grade} — grammar topic pages -----")
    TOPICS = re.compile(r"مجهول|عبارات الحاق|حروف ربط|موصولی|شرطی نوع دوم|شرطی نوع|گذشتهٔ کامل|گذشته کامل|افعال ناقص|نقل قول|Future|آینده")
    seen = set()
    for i, l in enumerate(lines):
        if TOPICS.search(l):
            pg = line_to_page(pages, i)
            key = (pg, l.strip()[:50])
            if key not in seen:
                seen.add(key)
                print(f"p{pg:3d} | {l.strip()[:80]}")
