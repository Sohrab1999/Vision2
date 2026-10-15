#!/usr/bin/env python3
# r219 — locate the sentence-building ('جمله سازی' / 'جملات زیر را...') and
# error-correction ('اصلاح' / 'خطا') parts of the g11 diagnostic tests, plus
# the answer-key lines that score them. The MCQ/typed parts of these tests
# already landed in r217/r218; these two production parts are the remainder.
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

ORDER = re.compile(r"جمله ساز|جمله‌ساز|جمله بساز|بسازید|مرتب کنید|بهم ریخته|به هم ریخته|درست کنید|مرتب کنید|reorder|Rearrange|arrange")
ERR   = re.compile(r"اصلاح|خطا|غلط|اشتباه")

SKIP = re.compile(r'جزوه$|^زبان انگل|^ جام|کمک آموزش|"Vision|Vision Two|تألی|^"جم|و همکاران|^\)$|^\d+$')

def dump(pg_lo, pg_hi, tag):
    print(f"\n===== {tag} =====")
    for pg, s, e in pages:
        if pg_lo <= pg <= pg_hi:
            print(f"\n--- p{pg} ---")
            for j in range(s + 1, e):
                t = lines[j].strip()
                if t and not SKIP.search(t):
                    print(t)

dump(31, 31, "L1 test: sentence-building")
dump(179, 180, "L1 key")
dump(74, 75, "L2 exam sentence-building")
dump(191, 191, "L2 exam key")
dump(100, 102, "L3 test full")
dump(196, 198, "L3 test key")
dump(109, 110, "L3 exam sentence-building")
dump(201, 201, "L3 exam key")
