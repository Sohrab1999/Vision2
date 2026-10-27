#!/usr/bin/env python3
# Task 160 — registry bump 59 -> 60, byte-precise (the 152/154/156/158
# convention: python byte replacement, NEVER sed/rg -e with regex dialects).
#
# Surfaces (measured with rg beforehand):
#   - toBe(59) ×11  (achievements.test.ts ×9, quick-think.test.ts ×1,
#                    quick-week.test.ts ×1)  — «وضعیتِ فعلی» assertions
#   - «؛ رجیستری ۵۹"» ×1 in quick-think.test.ts it-title (current-state)
#   - «رجیستریِ ۵۹تایی» ×1 in quick-week.test.ts describe-title (current-state)
#
# NOT touched (historical/birth titles, unrelated numbers):
#   - achievements.test.ts:1904 «رجیستری ۵۹ شد» (birth title of task 158)
#   - achievements.test.ts:1376/1382/1385 (speed-bolt ۶۰/۵۹٫۹ averaging)
#   - quick-week.test.ts:11 comment «رجیستریِ ۵۵تایی» (historical)
import sys, re

EDITS = [
    ("tests/achievements.test.ts", [("expect(BADGES.length).toBe(59)", "expect(BADGES.length).toBe(60)", 9)]),
    ("tests/quick-think.test.ts", [
        ("expect(BADGES.length).toBe(59)", "expect(BADGES.length).toBe(60)", 1),
        ("؛ رجیستری ۵۹\"", "؛ رجیستری ۶۰\"", 1),
    ]),
    ("tests/quick-week.test.ts", [
        ("expect(BADGES.length).toBe(59)", "expect(BADGES.length).toBe(60)", 1),
        ("رجیستریِ ۵۹تایی", "رجیستریِ ۶۰تایی", 1),
    ]),
]

ok = True
for path, subs in EDITS:
    with open(path, encoding="utf-8") as f:
        s = f.read()
    for old, new, expected in subs:
        n = s.count(old)
        if n != expected:
            print(f"ABORT {path}: {old!r} count={n} expected={expected}")
            ok = False
            continue
    if not ok:
        sys.exit(1)
    for old, new, expected in subs:
        s = s.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(s)
    print(f"OK {path}: {sum(e[2] for e in subs)} replacements")

# digital-neighborhood safety buffer (152 lesson): no stray forms survive
stray = []
for path, _ in EDITS:
    with open(path, encoding="utf-8") as f:
        s = f.read()
    for pat in ["toBe(59)", "toBe(590", "toBe(159", "رجیستریِ ۵۹تایی", "؛ رجیستری ۵۹\""]:
        c = s.count(pat)
        if c:
            stray.append(f"{path}: {pat!r} ×{c}")
if stray:
    print("STRAY-FOUND:", "; ".join(stray))
    sys.exit(1)
print("BUFFER-CLEAN")
