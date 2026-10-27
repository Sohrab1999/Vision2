#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r293 — به‌روزسازیِ صادقانهٔ گاردهای r280-r292: ۶۸ بانک/۷۲۰ → ۸۰ بانک/۷۷۱."""
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
]

OLD_SUFFIX = "r289-r291 آزمون‌های جامع درس اول تا سوم (۲۴-۵۸) و r292 آزمون نهایی دی ۹۷ (۵۹-۶۸) را افزودند"
NEW_SUFFIX = "r289-r291 آزمون‌های جامع درس اول تا سوم (۲۴-۵۸) و r292-r293 آزمون‌های نهایی دی ۹۷ و خرداد ۹۸ (۵۹-۸۰) را افزودند"

for name in FILES:
    p = ROOT / name
    s = p.read_text(encoding="utf-8")
    orig = s
    s = s.replace(OLD_SUFFIX, NEW_SUFFIX)
    s = s.replace("length: 68", "length: 80")
    s = s.replace("720", "771")
    s = s.replace("sixty-eight lessons", "eighty lessons")
    s = s.replace("sixty-eight", "eighty")
    s = s.replace("whole 68-bank family", "whole 80-bank family")
    if s != orig:
        p.write_text(s, encoding="utf-8")
        print(f"updated: {name}")
    else:
        print(f"NO CHANGE: {name}")
