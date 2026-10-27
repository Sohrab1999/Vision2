#!/usr/bin/env python3
# Task 162 — registry bump 60 -> 61, SECOND pass: the Persian-digit chip
# surface in component tests (the «از ۶۰» family). First pass (bump-r162.py)
# covered the BADGES.length toBe(60) + current-state titles.
#
# ALL ۶۰ occurrences in these six files are registry references (census:
# 69 = speed 13, trust 10, rival 9, quick-think-badges 10, badges.component
# 16, quick-week-badges 11) — replaced with a digit-boundary guard
# (?<![۰-۹])۶۰(?![۰-۹]) so the non-registry neighbours survive untouched:
#   - weekly-report «۱۶۰۰ms» (EXCLUDED file entirely)
#   - quick-think-badges «فکرِ ۶۰۰ms»
# The regex-guard pattern is new this round; r160 used blind replace on
# files pre-cleared by census — the guard makes the same result safe.
import re
import sys

FILES = [
    "tests/speed-badges.component.test.tsx",
    "tests/trust-badges.component.test.tsx",
    "tests/rival-badges.component.test.tsx",
    "tests/quick-think-badges.component.test.tsx",
    "tests/badges.component.test.tsx",
    "tests/quick-week-badges.component.test.tsx",
]
PAT = re.compile(r"(?<![۰-۹])۶۰(?![۰-۹])")

total = 0
for path in FILES:
    s = open(path, encoding="utf-8").read()
    n = len(PAT.findall(s))
    if n == 0:
        print(f"ABORT: {path} zero registry ۶۰ — census drift")
        sys.exit(1)
    s2 = PAT.sub("۶۱", s)
    open(path, "w", encoding="utf-8").write(s2)
    total += n
    print(f"{path}: {n}")
print(f"PASS2-TOTAL {total} (expected 69)")
