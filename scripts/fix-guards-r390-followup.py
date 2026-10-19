#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r390-followup — ترمیمِ دو خطای مکانیکیِ patch-guards-r390.py (درسِ تکرارشدهٔ r389):
۱) COUNTS_NEW یک «4» اضافه داشت → دمِ ۱۰تاییِ خراب «2,4,4,4,4,4,4,4,2,4]» در آرایه‌های file-shape
   به دمِ ۹تاییِ درست «2,4,4,4,4,4,4,2,4]» (l84=2, l85-l90=4, l91=2, l92=4) تبدیل می‌شود.
۲) جایگزینیِ کور، رسیدِ r11 خودِ گاردِ r389 را هم گسترش داده بود → بازگرداندنِ
   r11.bankCounts به [1,3,2,3,3,5,4,4,4,4,4,2] (پیش از گامِ ۱ تا رشته‌اش تداخل نکند).
idempotent.
"""
import re
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

# گام ۱ — بازگرداندنِ رسیدِ r11 (فقط r389؛ رشتهٔ کامل و یکتا)
f389 = ROOT / "jozve-tests-g12-khordad1399h-r389.test.ts"
s = f389.read_text(encoding="utf-8")
BAD_RECEIPT = "toEqual([1, 3, 2, 3, 3, 5, 4, 4, 4, 4, 4, 2, 2, 4, 4, 4, 4, 4, 4, 4, 2, 4])"
GOOD_RECEIPT = "toEqual([1, 3, 2, 3, 3, 5, 4, 4, 4, 4, 4, 2])"
if BAD_RECEIPT in s:
    s = s.replace(BAD_RECEIPT, GOOD_RECEIPT)
    f389.write_text(s, encoding="utf-8")
    print("r389: r11.bankCounts restored")
elif GOOD_RECEIPT in s:
    print("r389: r11.bankCounts already OK")
else:
    raise SystemExit("r389: receipt assertion not found at all!")

# گام ۲ — دمِ خرابِ file-shape در هر ده فایل (با تحملِ شکستِ سطر)
pat = re.compile(r"2,\s*4,\s*4,\s*4,\s*4,\s*4,\s*4,\s*4,\s*2,\s*4\]")
for name in FILES:
    f = ROOT / name
    s = f.read_text(encoding="utf-8")
    s2, n = pat.subn("2, 4, 4, 4, 4, 4, 4, 2, 4]", s)
    if n:
        f.write_text(s2, encoding="utf-8")
        print(f"{name}: fixed {n} damaged tail(s)")
    else:
        ok = re.search(r"2,\s*4,\s*4,\s*4,\s*4,\s*4,\s*4,\s*2,\s*4\]", s2)
        assert ok, f"{name}: neither damaged nor fixed tail found!"
        print(f"{name}: already OK")
print("r390-followup OK")
