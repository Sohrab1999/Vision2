#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r303 — به‌روزسازیِ صادقانهٔ گاردهای r280-r302: ۲۲۷ بانک/۱۲۸۳ → ۲۴۷ بانک/۱۳۳۹."""
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
    "jozve-final-shahrivar99official-g12-r299.test.ts",
    "jozve-final-deaf99-g12-r300.test.ts",
    "jozve-final-dey99official-g12-r301.test.ts",
    "jozve-final-khordad1400official-g12-r302.test.ts",
]

OLD_COMMENT = (
    "r292-r302 آزمون‌های نهایی دی ۹۷، خرداد ۹۸، شهریور ۹۸، دی ۹۸، خرداد ۹۹ "
    "(دو واریانتِ رشته‌ای)، شهریور ۹۹ (چاپِ جزوه + چاپِ رسمیِ سراسری + ویژهٔ ناشنوایان)، دی ۹۹ و خرداد ۱۴۰۰ (۵۹-۲۲۷) را افزودند"
)
NEW_COMMENT = (
    "r292-r303 آزمون‌های نهایی دی ۹۷، خرداد ۹۸، شهریور ۹۸، دی ۹۸، خرداد ۹۹ "
    "(دو واریانتِ رشته‌ای)، شهریور ۹۹ (چاپِ جزوه + چاپِ رسمیِ سراسری + ویژهٔ ناشنوایان)، دی ۹۹ و خرداد ۱۴۰۰ (دو واریانتِ رشته‌ای) (۵۹-۲۴۷) را افزودند"
)

for name in FILES:
    p = ROOT / name
    s = p.read_text(encoding="utf-8")
    orig = s
    s = s.replace("length: 227", "length: 247")
    s = s.replace("1283", "1339")
    s = s.replace("two hundred twenty-seven lessons", "two hundred forty-seven lessons")
    s = s.replace("two hundred twenty-seven", "two hundred forty-seven")
    s = s.replace("whole 227-bank family", "whole 247-bank family")
    s = s.replace(OLD_COMMENT, NEW_COMMENT)
    if s != orig:
        p.write_text(s, encoding="utf-8")
        print("updated", name)
print("done")
