#!/usr/bin/env python3
# r217 — locate drill/exercise MCQ sets inside the g11 teaching pages.
# Look for exercise markers ('تست', 'تمرین', 'گزینه', 'Choose', 'a)' 'b)' ...)
# per page, print hit counts + first samples so we can page-by-page read the
# candidate exercise blocks.
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

EX = re.compile(r"گزینه|Choose|choose|a\)|b\)|c\)|d\)|\(\s*a\s*\)|\(\s*b\s*\)|تمرین|آزمون|تست")
TEACH = re.compile(r"مجهول|نقل قول|موصولی|الحاق|گذشتهٔ کامل|گذشته کامل|شرطی|اسم مصدر|gerund|Gerund|صفات|کمّی|کمی|اعداد|حال کامل|دو کلمه|phrasal")

print("pg | ex-hits | teach-hits | first-ex-sample")
for pg, s, e in pages:
    ex_n = 0
    te_n = 0
    sample = None
    for j in range(s + 1, e):
        t = lines[j].strip()
        if not t or t in ('"جزوه', 'زبان انگلــییس'):
            continue
        if EX.search(t):
            ex_n += 1
            if sample is None and re.search(r"a\)|b\)|c\)|d\)|\(\s*a\s*\)|\(\s*b\s*\)", t):
                sample = t[:100]
        if TEACH.search(t):
            te_n += 1
    if ex_n >= 3:
        print(f"p{pg:3d} | {ex_n:3d} | {te_n:3d} | {sample}")
