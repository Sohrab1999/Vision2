#!/usr/bin/env python3
# r215 — survey teaching headers per full page (not just the first lines):
# scan each page's whole text for teaching-topic keywords, print the first
# keyword-bearing line that is NOT part of the watermark block.
import re
from pathlib import Path

BASE = Path("/home/z/my-project/booklet-extract")
KEYS = re.compile(
    r"Tense|گرامر|افعال دو|نقل قول|مجهول|شرطی|قیدهای تکرار|صفت|حرف تعریف|Passive|Reported|اسم مصدر|مصدر"
)
WM = re.compile(r"جزوه|جام|Vision|تألیف|گردآوری|احمدی|همکاران|تلگرام|Telegram|^[\d\s]*$|^[ـ\-=\s\"»«()]+$")

for f in ("g11", "g12"):
    lines = (BASE / f"{f}.txt").read_text().split("\n")
    pages = []  # (page_no, start_idx, end_idx)
    for i, l in enumerate(lines):
        m = re.match(r"<<<PAGE (\d+)>>>", l.strip())
        if m:
            pages.append([int(m.group(1)), i, None])
            if len(pages) > 1:
                pages[-2][2] = i
    pages[-1][2] = len(lines)
    for pg, s, e in pages:
        hit = None
        for j in range(s + 1, min(e, s + 60)):
            t = lines[j].strip()
            if not t or WM.search(t):
                continue
            if KEYS.search(t):
                hit = t[:95]
                break
        if hit:
            print(f, pg, "|", hit)
