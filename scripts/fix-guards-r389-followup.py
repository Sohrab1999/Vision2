#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r389 follow-up — دو خطای مکانیکیِ پچِ گاردِ cron-commit را ترمیم می‌کند:
(۱) در ۹ گاردِ legacy فقط `toBe(594)` پچ شده بود ولی جفتِ `toHaveLength(594)`
    جا مانده بود → به ۶۳۳ گسترش می‌یابد.
(۲) در r388، جایگزینیِ کورِ COUNTS_TAIL به‌اشتباه آرایهٔ bankCountsِ خودِ رسیدِ
    r10 را هم گسترش داده بود ([3,3,4,4,4,4,4,3] توصیفِ ۸ بانکِ l64-l71 است و
    بیشتر نمی‌شود) → بازگردانی.
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
]

for name in FILES:
    f = ROOT / name
    s = f.read_text(encoding="utf-8")
    if "expect(ids).toHaveLength(594);" in s:
        s = s.replace("expect(ids).toHaveLength(594);", "expect(ids).toHaveLength(633);")
        f.write_text(s, encoding="utf-8")
        print(f"fixed len 594->633: {name}")
    else:
        print(f"no stale len:      {name}")

# (۲) بازگردانیِ bankCountsِ رسیدِ r10 در گاردِ r388
f = ROOT / "jozve-tests-g12-khordad1399m-r388.test.ts"
s = f.read_text(encoding="utf-8")
BAD = "expect(r10.bankCounts).toEqual([3, 3, 4, 4, 4, 4, 4, 3, 1, 3, 2, 3, 3, 5, 4, 4, 4, 4, 4, 2]);"
GOOD = "expect(r10.bankCounts).toEqual([3, 3, 4, 4, 4, 4, 4, 3]);"
if BAD in s:
    s = s.replace(BAD, GOOD)
    f.write_text(s, encoding="utf-8")
    print("restored r10.bankCounts to the round's own 8 banks")
else:
    assert GOOD in s, "r10.bankCounts neither corrupted nor restored?!"
    print("r10.bankCounts already restored")

# (۳) r381/r384 — هرگز در فهرستِ گسترشِ راندهای قبلی نبودند: کامل‌سازیِ چهارتایی
LOOP_TAIL = "69, 70, 71])"
LOOP_NEW = "69, 70, 71, 72, 73, 75, 76, 77, 78, 79, 80, 81, 82, 83])"
COUNTS_TAIL = "4, 4, 4, 4, 4, 3],"
COUNTS_NEW = "4, 4, 4, 4, 4, 3, 1, 3, 2, 3, 3, 5, 4, 4, 4, 4, 4, 2],"
for name in ["jozve-tests-g12-shahrivar-r381.test.ts", "jozve-tests-g12-khordad1400-r384.test.ts"]:
    f = ROOT / name
    s = f.read_text(encoding="utf-8")
    assert "expect(bank.lessons).toHaveLength(71);" in s, f"{name}: lessons len missing"
    s = s.replace("expect(bank.lessons).toHaveLength(71);", "expect(bank.lessons).toHaveLength(83);")
    assert COUNTS_TAIL in s, f"{name}: counts tail missing"
    s = s.replace(COUNTS_TAIL, COUNTS_NEW)
    assert "expect(new Set(ids).size).toBe(594);" in s, f"{name}: set size missing"
    s = s.replace("expect(new Set(ids).size).toBe(594);", "expect(new Set(ids).size).toBe(633);")
    assert LOOP_TAIL in s, f"{name}: loop tail missing"
    s = s.replace(LOOP_TAIL, LOOP_NEW)
    f.write_text(s, encoding="utf-8")
    print(f"fully widened: {name}")
print("r389 follow-up OK")
