#!/usr/bin/env python3
"""Task 154 — registry count bump 56 -> 57.

Policy (mirrors Task 152's pattern):
- lib test files: only the live assertion `toBe(56)` -> `toBe(57)`;
  historical it-titles (e.g. «رجیستری ۵۶ شد») stay as history.
- component test files: every `۵۶` is a live chip assertion/regex/comment
  describing the CURRENT denominator -> all become `۵۷`.
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
    n = t.count("toBe(56)")
    p.write_text(t.replace("toBe(56)", "toBe(57)"))
    print(f"{f}: toBe(56)->toBe(57) x{n}")
    total += n

for f in COMPONENT_FILES:
    p = pathlib.Path(f)
    t = p.read_text()
    n = t.count("۵۶")
    p.write_text(t.replace("۵۶", "۵۷"))
    print(f"{f}: ۵۶->۵۷ x{n}")
    total += n

print("TOTAL addresses:", total)
