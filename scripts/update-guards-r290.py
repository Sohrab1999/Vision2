#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r290 — به‌روزسازیِ صادقانهٔ گاردهای r280-r289: ۳۶ بانک/۵۷۴ → ۴۶ بانک/۶۲۵ (درس r290: درسِ گاردِ پیشین باید گاردِ نویسنده را به یاد آورد)."""
import re
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
]

OLD_SUFFIX = "r289 آزمون جامع (۲۴-۳۶) را افزود"
NEW_SUFFIX = "r289 آزمون جامع درس اول (۲۴-۳۶) و r290 آزمون جامع درس دوم (۳۷-۴۶) را افزودند"

for name in FILES:
    p = ROOT / name
    s = p.read_text(encoding="utf-8")
    orig = s
    s = s.replace(OLD_SUFFIX, NEW_SUFFIX)
    s = s.replace("length: 36", "length: 46")
    s = s.replace("574", "625")
    s = s.replace("thirty-six lessons", "forty-six lessons")
    s = s.replace("whole 36-bank family", "whole 46-bank family")
    if s != orig:
        p.write_text(s, encoding="utf-8")
        print(f"updated: {name}")
    else:
        print(f"NO CHANGE: {name}")
