#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r390 — گسترشِ گاردهای legacy برای ۹۲ بانک/۶۶۵ آیتم (بانک‌های l84-l92):
۱) toHaveLength(83) → 92   ۲) آرایهٔ counts + [2,4,4,4,4,4,4,2,4]
۳) toBe(633)/toHaveLength(633) → 665   ۴) حلقهٔ MCQ-خالص + [84..87, 89..92] (l88 تایپی است — گاردِ خودِ r390 پوششش می‌دهد)
۵) نقشهٔ r273 + [84..92]
"""
from pathlib import Path

ROOT = Path("/home/z/my-project/tests")
FILES = [
    "jozve-tests-g12-nahaie-r380.test.ts",
    "jozve-tests-g12-shahrivar-r381.test.ts",
    "jozve-tests-g12-dey-r382.test.ts",
    "jozve-tests-g12-shahrivar1400-r383.test.ts",
    "jozve-tests-g12-khordad1400-r384.test.ts",
    "jozve-tests-g12-khordad1400m-r385.test.ts",
    "jozve-tests-g12-dey1399-r386.test.ts",
    "jozve-tests-g12-shahrivar1399-r387.test.ts",
    "jozve-tests-g12-khordad1399m-r388.test.ts",
    "jozve-tests-g12-khordad1399h-r389.test.ts",
]
COUNTS_TAIL = "3, 3, 5, 4, 4, 4, 4, 4, 2]"
COUNTS_NEW = "3, 3, 5, 4, 4, 4, 4, 4, 2, 2, 4, 4, 4, 4, 4, 4, 4, 2, 4]"
LOOP_TAIL = "80, 81, 82, 83])"
LOOP_NEW = "80, 81, 82, 83, 84, 85, 86, 87, 89, 90, 91, 92])"

for name in FILES:
    f = ROOT / name
    s = f.read_text(encoding="utf-8")
    orig = s
    s = s.replace("toHaveLength(83)", "toHaveLength(92)")
    assert COUNTS_TAIL in s, f"{name}: counts tail not found"
    s = s.replace(COUNTS_TAIL, COUNTS_NEW)
    s = s.replace("toBe(633)", "toBe(665)")
    s = s.replace("toHaveLength(633)", "toHaveLength(665)")
    assert LOOP_TAIL in s, f"{name}: loop tail not found"
    s = s.replace(LOOP_TAIL, LOOP_NEW)
    if s != orig:
        f.write_text(s, encoding="utf-8")
        print(f"patched {name}")

# نقشهٔ r273
f = ROOT / "jozve-test-bank-r273.test.ts"
s = f.read_text(encoding="utf-8")
MAP_TAIL = "80, 81, 82, 83],"
MAP_NEW = "80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92],"
assert MAP_TAIL in s, "r273 map tail not found"
s = s.replace(MAP_TAIL, MAP_NEW)
f.write_text(s, encoding="utf-8")
print("patched jozve-test-bank-r273.test.ts")
print("r390 guard-widening OK")
