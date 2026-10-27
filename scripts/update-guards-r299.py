#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r299 — به‌روزسازیِ صادقانهٔ گاردهای r280-r298: ۱۵۳ بانک/۱۰۴۲ → ۱۷۱ بانک/۱۱۰۳."""
from pathlib import Path

ROOT = Path("/home/z/my-project/tests")
FILES = [
    "jozve-relatives-g12-r280.test.ts",
    "jozve-tenses-g12-r281.test.ts",
    "jozve-modals-g12-r282.test.ts",
    "jozve-tags-g12-r283.test.ts",
    "jozve-passive-g12-r284.test.ts",
    "jozve-tagwrite-g12-r285.test.ts",
    "jozve-connectives-g12-r286.test.ts",
    "jozve-diagnostic-g12-r287.test.ts",
    "jozve-s89-g12-r288.test.ts",
    "jozve-comprehensive-g12-r289.test.ts",
    "jozve-comprehensive2-g12-r290.test.ts",
    "jozve-comprehensive3-g12-r291.test.ts",
    "jozve-final97-g12-r292.test.ts",
    "jozve-final98-g12-r293.test.ts",
    "jozve-final-shahrivar98-g12-r294.test.ts",
    "jozve-final-dey98-g12-r295.test.ts",
    "jozve-final-khordad99-g12-r296.test.ts",
    "jozve-final-khordad99h-g12-r297.test.ts",
    "jozve-final-shahrivar99-g12-r298.test.ts",
]

for name in FILES:
    p = ROOT / name
    s = p.read_text(encoding="utf-8")
    orig = s
    s = s.replace("length: 153", "length: 171")
    s = s.replace("1042", "1103")
    s = s.replace("one hundred fifty-three lessons", "one hundred seventy-one lessons")
    s = s.replace("one hundred fifty-three", "one hundred seventy-one")
    s = s.replace("whole 153-bank family", "whole 171-bank family")
    s = s.replace(
        "r292-r298 آزمون‌های نهایی دی ۹۷، خرداد ۹۸، شهریور ۹۸، دی ۹۸، خرداد ۹۹ (دو واریانتِ رشته‌ای) و شهریور ۹۹ (۵۹-۱۵۳) را افزودند",
        "r292-r299 آزمون‌های نهایی دی ۹۷، خرداد ۹۸، شهریور ۹۸، دی ۹۸، خرداد ۹۹ (دو واریانتِ رشته‌ای)، شهریور ۹۹ و چاپِ رسمیِ سراسریِ آن (۵۹-۱۷۱) را افزودند",
    )
    if s != orig:
        p.write_text(s, encoding="utf-8")
        print("updated", name)
print("done")
