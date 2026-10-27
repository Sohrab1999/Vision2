#!/usr/bin/env python3
# Task 165 — registry bump 61 → 62 (the 10th dual-system badge «grammar-words»).
# Two passes per the r162 lesson:
#   pass 1 — pure suites: BADGES.length).toBe(61) → 62 (the words-rush
#            describe title keeps its historical «۶۱» — Task 162's record)
#   pass 2 — component suites: every digit-boundary-guarded ۶۱ → ۶۲
#            (plain chips, regex patterns, the live contract comment)
# Census verification at the end: no unaccounted ۶۱/61 left in living
# contracts.
import re, glob

GUARD = r"(?<![0-9۰-۹])61(?![0-9۰-۹])"   # ascii 61, ascii+persian digit boundary
GUARD_FA = r"(?<![۰-۹])۶۱(?![۰-۹])"  # persian ۶۱ in chips/regexes/comments

total = 0

# pass 1 — pure suites, only the toBe(61) form
for path in ["tests/achievements.test.ts", "tests/quick-think.test.ts", "tests/quick-week.test.ts"]:
    s = open(path, encoding="utf-8").read()
    n = len(re.findall(r"BADGES\.length\)\.toBe\(61\)", s))
    s = s.replace("BADGES.length).toBe(61)", "BADGES.length).toBe(62)")
    open(path, "w", encoding="utf-8").write(s)
    total += n
    print(f"pass1 {path}: {n} × toBe(61→62)")

# pass 2 — component suites, every guarded ۶۱
for path in sorted(glob.glob("tests/*.component.test.tsx")):
    s = open(path, encoding="utf-8").read()
    if "۶۱" not in s:
        continue
    n = len(re.findall(GUARD_FA, s))
    s = re.sub(GUARD_FA, "۶۲", s)
    open(path, "w", encoding="utf-8").write(s)
    total += n
    print(f"pass2 {path}: {n} × ۶۱→۶۲")

# census — living contracts must hold no ۶۱/61 leftovers.
# Whitelisted (r165 lesson): ①describe/it title lines «رجیستری … ۶۱ شد» are
# HISTORICAL registry-size milestones — never bumped ②join-throttle.test.ts
# uses literal 61-second constants — not a badge file.
left = []
for path in sorted(glob.glob("tests/*.test.ts")) + sorted(glob.glob("tests/*.test.tsx")):
    if "join-throttle" in path:
        continue
    for i, line in enumerate(open(path, encoding="utf-8"), 1):
        if "رجیستری" in line:
            continue
        if re.search(GUARD_FA, line) or re.search(GUARD, line):
            left.append(f"{path}:{i}: {line.strip()[:90]}")
if left:
    print("LEFTOVER-61:")
    for l in left:
        print(" ", l)
    raise SystemExit(1)
print(f"BUMP-OK total={total}")
