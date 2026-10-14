#!/usr/bin/env python3
# Task 162 — registry bump 60 -> 61, byte-precise (the 152/154/156/158/160
# convention: python byte replacement, NEVER sed/rg -e with regex dialects).
#
# PASS 1 surfaces (measured with rg beforehand):
#   - BADGES.length).toBe(60) ×11 (achievements.test.ts ×9, quick-think ×1,
#     quick-week ×1) — the EXACT `BADGES.length` form only; the non-registry
#     toBe(60)s (duelSpeedAvg r1379, speedy-chain pct r1580, grammar-map,
#     duel-ledger winRate) stay untouched.
#   - «؛ رجیستری ۶۰"» ×1 in quick-think.test.ts it-title (current-state)
#   - «رجیستریِ ۶۰تایی» ×1 in quick-week.test.ts describe-title (current-state)
# PROTECTED (left as-is): achievements.test.ts r2029 «رجیستری ۶۰ شد» —
# task 160's BIRTH title (historical narration, same rule as 158's).
import sys

edits = [
    ("tests/achievements.test.ts", 'expect(BADGES.length).toBe(60);', 'expect(BADGES.length).toBe(61);'),
    ("tests/quick-think.test.ts", 'expect(BADGES.length).toBe(60);', 'expect(BADGES.length).toBe(61);'),
    ("tests/quick-week.test.ts", 'expect(BADGES.length).toBe(60);', 'expect(BADGES.length).toBe(61);'),
    ("tests/quick-think.test.ts", 'برقِ فکر طلا/BrainCircuit؛ رجیستری ۶۰"', 'برقِ فکر طلا/BrainCircuit؛ رجیستری ۶۱"'),
    ("tests/quick-week.test.ts", 'سیم‌کشیِ خانوادهٔ هفتهٔ چابک — رجیستریِ ۶۰تایی', 'سیم‌کشیِ خانوادهٔ هفتهٔ چابک — رجیستریِ ۶۱تایی'),
]

total = 0
for path, old, new in edits:
    s = open(path, encoding="utf-8").read()
    n = s.count(old)
    if n == 0:
        print(f"ABORT: {path} zero matches for {old[:48]!r}")
        sys.exit(1)
    s = s.replace(old, new)
    open(path, "w", encoding="utf-8").write(s)
    total += n
    print(f"{path}: {n}x  {old[:40]!r}")
print(f"PASS1-TOTAL {total} (expected 13 = 11 toBe + 2 titles)")
