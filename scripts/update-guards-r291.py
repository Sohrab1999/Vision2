#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r291 — به‌روزسازیِ صادقانهٔ گاردهای r280-r290: ۴۶ بانک/۶۲۵ → ۵۸ بانک/۶۷۸."""
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
]

OLD_SUFFIX = "r289 آزمون جامع درس اول (۲۴-۳۶) و r290 آزمون جامع درس دوم (۳۷-۴۶) را افزودند"
NEW_SUFFIX = "r289/r290 آزمون‌های جامع درس اول و دوم (۲۴-۴۶) و r291 آزمون جامع درس سوم (۴۷-۵۸) را افزودند"

for name in FILES:
    p = ROOT / name
    s = p.read_text(encoding="utf-8")
    orig = s
    s = s.replace(OLD_SUFFIX, NEW_SUFFIX)
    s = s.replace("length: 46", "length: 58")
    s = s.replace("625", "678")
    s = s.replace("forty-six lessons", "fifty-eight lessons")
    s = s.replace("whole 46-bank family", "whole 58-bank family")
    if s != orig:
        p.write_text(s, encoding="utf-8")
        print(f"updated: {name}")
    else:
        print(f"NO CHANGE: {name}")
