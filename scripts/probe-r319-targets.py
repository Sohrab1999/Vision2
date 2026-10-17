#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r319 — پروبِ هدفِ راند: آیا چاپِ جزوه برای خانوادهٔ «افعال ناقص» (ص۱۴۹ و ص۱۵۱-۱۵۲)
بخشِ «پاسخنامه کلیدی و ترجمه» دارد؟ جستوجوی سربرگ‌ها در گسترهٔ وسیع + پیش‌نمایشِ متن."""
import fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
doc = fitz.open(PDF)
print("pdf pages:", len(doc))

# ۱) جستوجوی سربرگِ کلید/ترجمهٔ افعال ناقص در کلِ سندِ پس از ص۱۳۰
print("\n=== header sweep (p131..end) — lines with ناقص/پاسخنامه کلیدی/ترجمه ===")
for pno in range(130, len(doc)):
    page = doc[pno]
    lines = [l.strip() for l in page.get_text().splitlines() if l.strip()]
    for l in lines[:6]:  # سربرگ‌ها معمولاً در ۶ خطِ اول
        if ("ناقص" in l and ("کلید" in l or "ترجمه" in l or "پاسخ" in l)) or \
           ("افعال ناقص" in l and len(l) < 90) or \
           ("پاسخنامه کلیدی" in l):
            print(f"p{pno+1:3d}: {l[:100]}")
            break

# ۲) پیش‌نمایشِ متنِ صفحاتِ خودِ خانواده (۱۴۹-۱۵۲) برای فهمِ ساختارِ سؤال‌ها
print("\n=== structure preview: printed pp149-152 ===")
for pno in (149, 150, 151, 152):
    page = doc[pno - 1]
    lines = [l.strip() for l in page.get_text().splitlines() if l.strip()]
    print(f"\n--- printed p{pno} ({len(lines)} lines) first 14:")
    for l in lines[:14]:
        print("   ", l[:110])
