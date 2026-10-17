#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r301 — به‌روزسازیِ صادقانهٔ گاردهای r280-r300: ۱۹۰ بانک/۱۱۶۶ → ۲۰۸ بانک/۱۲۲۷."""
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
]

for name in FILES:
    p = ROOT / name
    s = p.read_text(encoding="utf-8")
    orig = s
    s = s.replace("length: 190", "length: 208")
    s = s.replace("1166", "1227")
    s = s.replace("one hundred ninety lessons", "two hundred eight lessons")
    s = s.replace("one hundred ninety", "two hundred eight")
    s = s.replace("whole 190-bank family", "whole 208-bank family")
    s = s.replace(
        "r292-r300 آزمون‌های نهایی دی ۹۷، خرداد ۹۸، شهریور ۹۸، دی ۹۸، خرداد ۹۹ (دو واریانتِ رشته‌ای)، شهریور ۹۹ (چاپِ جزوه + چاپِ رسمیِ سراسری) و ویژهٔ ناشنوایان (۵۹-۱۹۰) را افزودند",
        "r292-r301 آزمون‌های نهایی دی ۹۷، خرداد ۹۸، شهریور ۹۸، دی ۹۸، خرداد ۹۹ (دو واریانتِ رشته‌ای)، شهریور ۹۹ (چاپِ جزوه + چاپِ رسمیِ سراسری + ویژهٔ ناشنوایان) و دی ۹۹ (۵۹-۲۰۸) را افزودند",
    )
    if s != orig:
        p.write_text(s, encoding="utf-8")
        print("updated", name)
print("done")
