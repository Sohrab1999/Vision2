#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r314 — به‌روزسازیِ صادقانهٔ گاردهای خانوادهٔ موضوعیِ دوازدهم: ۳۲۶ درس/۱۵۸۷ → ۳۳۰ درس/۱۶۵۹.
چهار بانکِ «۷۲ تست جمله‌های شرطی» (l327..l330) به grammar-g12-topic.json افزودند."""
import re
from pathlib import Path

ROOT = Path("/home/z/my-project/tests")

OLD_TAIL = (
    "و r310 دو بانکِ دستگریمی/تخصیصِ ضمایر موصولی (۳۲۵-۳۲۶) را افزودند"
)
NEW_TAIL = (
    "و r310 دو بانکِ دستگریمی/تخصیصِ ضمایر موصولی (۳۲۵-۳۲۶) و r314 چهار بانکِ "
    "«۷۲ تست جمله‌های شرطی» (۳۲۷-۳۳۰) را افزودند"
)

changed = 0
for f in sorted(ROOT.glob("jozve-*.test.ts")):
    text = f.read_text(encoding="utf-8")
    orig = text
    # ۱) قفلِ طولِ توالیِ درس‌ها: ۳۲۶ → ۳۳۰
    text = text.replace(
        "Array.from({ length: 326 }, (_, i) => i + 1)",
        "Array.from({ length: 330 }, (_, i) => i + 1)",
    )
    # ۲) قفلِ جمعِ خانواده: ۱۵۸۷ → ۱۶۵۹
    text = re.sub(r"\b1587\b", "1659", text)
    # ۳) یادداشتِ راند در کامنت‌های انتها
    text = text.replace(OLD_TAIL, NEW_TAIL)
    # ۴) عنوان‌های انگلیسی
    text = text.replace("three hundred twenty six lessons", "three hundred thirty lessons")
    if text != orig:
        f.write_text(text, encoding="utf-8")
        changed += 1
        print("updated:", f.name)
print(f"--- {changed} files updated")
