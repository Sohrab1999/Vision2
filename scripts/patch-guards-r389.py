#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r389 — گسترشِ گاردهای legacy برای ۸۳ بانک/۶۳۳ آیتم (بانک‌های l72-l83):
۱) toHaveLength(71) → 83   ۲) آرایهٔ counts + [1,3,2,3,3,5,4,4,4,4,4,2]
۳) toBe(594) → 633   ۴) حلقه‌های [4..71] → +[72,73,75..83] (l74 تایپی است — گاردِ خودِ r389 پوششش می‌دهد)
۵) نقشهٔ r273 [1..71] → +72..83
"""
from pathlib import Path

ROOT = Path("/home/z/my-project/tests")
FILES = [
    "jozve-tests-g12-nahaie-r380.test.ts",
    "jozve-tests-g12-dey-r382.test.ts",
    "jozve-tests-g12-shahrivar1400-r383.test.ts",
    "jozve-tests-g12-khordad1400m-r385.test.ts",
    "jozve-tests-g12-dey1399-r386.test.ts",
    "jozve-tests-g12-shahrivar1399-r387.test.ts",
    "jozve-tests-g12-khordad1399m-r388.test.ts",
]
COUNTS_TAIL = "4, 4, 4, 4, 4, 3]"
COUNTS_NEW = "4, 4, 4, 4, 4, 3, 1, 3, 2, 3, 3, 5, 4, 4, 4, 4, 4, 2]"
LOOP_TAIL = "69, 70, 71])"
LOOP_NEW = "69, 70, 71, 72, 73, 75, 76, 77, 78, 79, 80, 81, 82, 83])"

for name in FILES:
    f = ROOT / name
    s = f.read_text(encoding="utf-8")
    orig = s
    s = s.replace("toHaveLength(71)", "toHaveLength(83)")
    assert COUNTS_TAIL in s, f"{name}: counts tail not found"
    s = s.replace(COUNTS_TAIL, COUNTS_NEW)
    s = s.replace("toBe(594)", "toBe(633)")
    assert LOOP_TAIL in s, f"{name}: loop tail not found"
    s = s.replace(LOOP_TAIL, LOOP_NEW)
    if s != orig:
        f.write_text(s, encoding="utf-8")
        print(f"patched {name}")

# نقشهٔ r273
f = ROOT / "jozve-test-bank-r273.test.ts"
s = f.read_text(encoding="utf-8")
MAP_TAIL = "68, 69, 70, 71],"
MAP_NEW = "68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83],"
assert MAP_TAIL in s, "r273 map tail not found"
s = s.replace(MAP_TAIL, MAP_NEW)
f.write_text(s, encoding="utf-8")
print("patched jozve-test-bank-r273.test.ts")
print("r389 guard-widening OK")
