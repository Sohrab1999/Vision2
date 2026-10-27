#!/usr/bin/env python3
# Task 160 — registry bump 59 -> 60, SECOND pass: the Persian-digit chip
# surface in component tests (the «از ۵۹» family). First pass (bump-r160.py)
# covered the toBe(59) + current-state titles; the component tests assert
# the faNum(BADGES.length) chip as a hardcoded Persian literal.
#
# ALL ۵۹ occurrences in these six files are registry references:
#   - /N\s*از\s*۵۹/ chip regexes + «از ۵۹» literal chips
#   - «رجیستری ۵۹» current-state it-titles (badges.component:369,385)
#   - «۵۹تایی» / «= ۵۹ (۵۹ + ...» comments (registry narration)
# EXCLUDED files (their ۵۹s are NOT registry): achievements.test.ts
# (speed-bolt ۵۹٫۹ averaging + 158's birth title), due-pill (راند ۵۹/۷۳),
# join-throttle (۵۹ ثانیه).
import sys

FILES = [
    "tests/badges.component.test.tsx",
    "tests/quick-think-badges.component.test.tsx",
    "tests/quick-week-badges.component.test.tsx",
    "tests/rival-badges.component.test.tsx",
    "tests/speed-badges.component.test.tsx",
    "tests/trust-badges.component.test.tsx",
]
# NOTE: rg -c counts MATCHING LINES, not occurrences — line 399 of
# badges.component.test.tsx carries two ۵۹s. Counts here are measured
# dynamically; every ۵۹ in these six files was inspected and is a
# registry reference (chip regexes, رجیستری titles, narration comments).

total = 0
for path in FILES:
    with open(path, encoding="utf-8") as f:
        s = f.read()
    n = s.count("۵۹")
    if n == 0:
        print(f"ABORT {path}: no ۵۹ found (already bumped?)")
        sys.exit(1)
    total += n
    s = s.replace("۵۹", "۶۰")
    with open(path, "w", encoding="utf-8") as f:
        f.write(s)
    print(f"OK {path}: {n} replacements")
print(f"TOTAL: {total} Persian-digit replacements across {len(FILES)} files")

# buffer: no ۵۹ survives in the six files; excluded files keep theirs
for path in FILES:
    with open(path, encoding="utf-8") as f:
        if "۵۹" in f.read():
            print(f"STRAY {path}")
            sys.exit(1)
with open("tests/achievements.test.ts", encoding="utf-8") as f:
    a = f.read()
assert "رجیستری ۵۹ شد" in a, "158 birth title must survive"
assert "۵۹٫۹" in a and "۵۹ از ۶۰" in a, "speed-bolt averaging must survive"
print("BUFFER-CLEAN (excluded files intact)")
