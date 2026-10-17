#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r296 — به‌روزسازیِ صادقانهٔ گاردهای r280-r295: ۱۰۴ بانک/۸۵۵ → ۱۱۹ بانک/۹۱۸."""
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
]

OLD_SUFFIX = "r289-r291 آزمون‌های جامع درس اول تا سوم (۲۴-۵۸) و r292-r295 آزمون‌های نهایی دی ۹۷، خرداد ۹۸، شهریور ۹۸ و دی ۹۸ (۵۹-۱۰۴) را افزودند"
NEW_SUFFIX = "r289-r291 آزمون‌های جامع درس اول تا سوم (۲۴-۵۸) و r292-r296 آزمون‌های نهایی دی ۹۷، خرداد ۹۸، شهریور ۹۸، دی ۹۸ و خرداد ۹۹ (۵۹-۱۱۹) را افزودند"

for name in FILES:
    p = ROOT / name
    s = p.read_text(encoding="utf-8")
    orig = s
    s = s.replace(OLD_SUFFIX, NEW_SUFFIX)
    s = s.replace("length: 104", "length: 119")
    s = s.replace("855", "918")
    s = s.replace("one hundred four lessons", "one hundred nineteen lessons")
    s = s.replace("one hundred four", "one hundred nineteen")
    s = s.replace("whole 104-bank family", "whole 119-bank family")
    if s != orig:
        p.write_text(s, encoding="utf-8")
        print(f"updated: {name}")
    else:
        print(f"NO CHANGE: {name}")
