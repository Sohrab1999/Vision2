#!/usr/bin/env python3
"""Task 156 — registry count bump 57 -> 58.

Policy (mirrors Tasks 152/154):
- lib test files: only the live assertion `toBe(57)` -> `toBe(58)`;
  historical it-titles (e.g. «رجیستری ۵۷ شد») stay as history.
- component test files: every `۵۷` is a live chip assertion/regex/comment
  describing the CURRENT denominator -> all become `۵۸`.
- weekly-digest.test.ts is NOT in the whitelist: its `toBe(57)` is a
  coincidental reviews sum (50 + 7), not a registry address — the r152
  buffer-safety lesson.
Idempotent: second run is a no-op.
"""
import pathlib

LIB_FILES = [
    "tests/achievements.test.ts",
    "tests/quick-think.test.ts",
    "tests/quick-week.test.ts",
]
COMPONENT_FILES = [
    "tests/badges.component.test.tsx",
    "tests/speed-badges.component.test.tsx",
    "tests/trust-badges.component.test.tsx",
    "tests/rival-badges.component.test.tsx",
    "tests/quick-think-badges.component.test.tsx",
    "tests/quick-week-badges.component.test.tsx",
]

total = 0
for f in LIB_FILES:
    p = pathlib.Path(f)
    t = p.read_text()
    n = t.count("toBe(57)")
    p.write_text(t.replace("toBe(57)", "toBe(58)"))
    print(f"{f}: toBe(57)->toBe(58) x{n}")
    total += n

for f in COMPONENT_FILES:
    p = pathlib.Path(f)
    t = p.read_text()
    n = t.count("۵۷")
    p.write_text(t.replace("۵۷", "۵۸"))
    print(f"{f}: ۵۷->۵۸ x{n}")
    total += n

print("TOTAL addresses:", total)
