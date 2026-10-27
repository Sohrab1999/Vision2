#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r310 — به‌روزسازیِ صادقانهٔ گاردهای خانوادهٔ موضوعیِ دوازدهم: ۳۲۴ درس/۱۵۵۶ → ۳۲۶ درس/۱۵۸۷.
دو بانکِ دستگریمی/تخصیصِ ضمایر موصولی (۳۲۵-۳۲۶) به grammar-g12-topic.json افزودند."""
import re
from pathlib import Path

ROOT = Path("/home/z/my-project/tests")

OLD_TAIL = "شهریور ۱۴۰۱ و شهریور ۱۴۰۱ (۵۹-۳۲۴) را افزودند"
NEW_TAIL = "شهریور ۱۴۰۱ و شهریور ۱۴۰۱ (۵۹-۳۲۴) و r310 دو بانکِ دستگریمی/تخصیصِ ضمایر موصولی (۳۲۵-۳۲۶) را افزودند"

changed = 0
for f in sorted(ROOT.glob("jozve-*.test.ts")):
    text = f.read_text(encoding="utf-8")
    orig = text
    # ۱) قفلِ طولِ توالیِ درس‌ها: ۳۲۴ → ۳۲۶
    text = text.replace("Array.from({ length: 324 }, (_, i) => i + 1)", "Array.from({ length: 326 }, (_, i) => i + 1)")
    # ۲) قفلِ جمعِ خانواده: ۱۵۵۶ → ۱۵۸۷
    text = re.sub(r"\b1556\b", "1587", text)
    # ۳) یادداشتِ راند در کامنت‌های انتها
    text = text.replace(OLD_TAIL, NEW_TAIL)
    # ۴) عنوان‌های انگلیسی «three hundred twenty four lessons» → twenty six
    text = text.replace("three hundred twenty four lessons", "three hundred twenty six lessons")
    if text != orig:
        f.write_text(text, encoding="utf-8")
        changed += 1
        print("updated:", f.name)
print(f"--- {changed} files updated")
