#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r306 — به‌روزسازیِ صادقانهٔ گاردهای r280-r305: ۲۸۴ بانک/۱۴۴۱ → ۳۰۴ بانک/۱۴۹۴."""
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
    "jozve-final-khordad1400humanities-g12-r303.test.ts",
    "jozve-final-shahrivar1400official-g12-r304.test.ts",
    "jozve-final-dey1400official-g12-r305.test.ts",
]

OLD_COMMENT = (
    "r292-r305 آزمون‌های نهایی دی ۹۷، خرداد ۹۸، شهریور ۹۸، دی ۹۸، خرداد ۹۹ "
    "(دو واریانتِ رشته‌ای)، شهریور ۹۹ (چاپِ جزوه + چاپِ رسمیِ سراسری + ویژهٔ ناشنوایان)، دی ۹۹، خرداد ۱۴۰۰ (دو واریانتِ رشته‌ای)، شهریور ۱۴۰۰ و دی ۱۴۰۰ (۵۹-۲۸۴) را افزودند"
)
NEW_COMMENT = (
    "r292-r306 آزمون‌های نهایی دی ۹۷، خرداد ۹۸، شهریور ۹۸، دی ۹۸، خرداد ۹۹ "
    "(دو واریانتِ رشته‌ای)، شهریور ۹۹ (چاپِ جزوه + چاپِ رسمیِ سراسری + ویژهٔ ناشنوایان)، دی ۹۹، خرداد ۱۴۰۰ (دو واریانتِ رشته‌ای)، شهریور ۱۴۰۰، دی ۱۴۰۰ و خرداد ۱۴۰۱ (۵۹-۳۰۴) را افزودند"
)

for name in FILES:
    p = ROOT / name
    s = p.read_text(encoding="utf-8")
    orig = s
    s = s.replace("length: 284", "length: 304")
    s = s.replace("1441", "1494")
    s = s.replace("two hundred eighty-four lessons", "three hundred four lessons")
    s = s.replace("two hundred eighty-four", "three hundred four")
    s = s.replace("whole 284-bank family", "whole 304-bank family")
    s = s.replace(OLD_COMMENT, NEW_COMMENT)
    if s != orig:
        p.write_text(s, encoding="utf-8")
        print("updated", name)
print("done")