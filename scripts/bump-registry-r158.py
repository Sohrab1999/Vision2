#!/usr/bin/env python3
"""Task 158 — registry count bump 58 -> 59.

Policy (mirrors Tasks 152/154/156):
- lib test files: only the live assertion `toBe(58)` -> `toBe(59)`;
  historical it-titles (e.g. «رجیستری ۵۸ شد») stay as history.
- component test files: every `۵۸` is a live chip assertion/regex/comment
  describing the CURRENT denominator -> all become `۵۹`.
- weekly-digest.test.ts is NOT in the whitelist (r152 buffer-safety lesson).
- RESTORATION: the two quick-* «current state» titles were left stale at ۵۷
  by r156 (r154 convention: they bump WITH the registry). Both are set to
  the true post-round count ۵۹ directly.
Idempotent: second run is a no-op (counts report 0).
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
# r156 staleness fix — current-state titles in quick-* (r154 convention restored)
TITLE_FIXES = [
    ("tests/quick-think.test.ts", "؛ رجیستری ۵۷", "؛ رجیستری ۵۹"),
    ("tests/quick-week.test.ts", "رجیستریِ ۵۷تایی", "رجیستریِ ۵۹تایی"),
]

total = 0
for f in LIB_FILES:
    p = pathlib.Path(f)
    t = p.read_text()
    n = t.count("toBe(58)")
    p.write_text(t.replace("toBe(58)", "toBe(59)"))
    print(f"{f}: toBe(58)->toBe(59) x{n}")
    total += n

for f in COMPONENT_FILES:
    p = pathlib.Path(f)
    t = p.read_text()
    n = t.count("۵۸")
    p.write_text(t.replace("۵۸", "۵۹"))
    print(f"{f}: ۵۸->۵۹ x{n}")
    total += n

for f, old, new in TITLE_FIXES:
    p = pathlib.Path(f)
    t = p.read_text()
    n = t.count(old)
    p.write_text(t.replace(old, new))
    print(f"{f}: title {old}->{new} x{n}")
    total += n

print("TOTAL addresses:", total)
