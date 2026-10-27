#!/usr/bin/env python3
"""probe-g11-supplementary-r278.py — کاوش صفحات تکمیلی یازدهم (چاپی ۲۱ و ۹۳)

هدف: یافتن خودِ سؤال‌های «۲۲تست واژگان ص۲۱» و «۲۰تست واژگان ص۹۳»
کلیدها قبلاً پیدا شده‌اند:
  - ص۲۱ → c12/sec0 خط ۸۲-۸۴ (گرید «1 a 2 a 3 d …»)
  - ص۹۳ → c14/sec0 خط ۷۱-۷۵ (گرید «1 b 6 d …»)
ایندکس PDF = صفحهٔ چاپی − ۱ (قرارداد r275: چاپی ۱۹-۲۰ → ایندکس ۱۸-۱۹)
"""
import sys

import pdfplumber

ROOT = "/home/z/my-project"
PDF = f"{ROOT}/upload/جزوه جامع یازدهم .pdf"

targets = [int(x) for x in sys.argv[1:]] or [20, 92]

with pdfplumber.open(PDF) as pdf:
    print(f"total pages: {len(pdf.pages)}")
    for idx in targets:
        page = pdf.pages[idx]
        text = page.extract_text() or ""
        lines = [l for l in text.split("\n")]
        print(f"\n{'=' * 72}\n=== PDF index {idx} (printed ~{idx + 1}) — {len(lines)} lines ===\n{'=' * 72}")
        for j, l in enumerate(lines):
            print(f"{j:3d}| {l[:118]}")
