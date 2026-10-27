#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r316 probe — «پاسخنامه کلیدی و ترجمهٔ ۱۰۰ تست واژگان» ص۲۱۵+ (سربرگِ دیده‌شده در پروب r315)"""
import fitz, re, sys

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
doc = fitz.open(PDF)
print(f"total pages: {doc.page_count}")

# ۱) جست‌وجوی سربرگ در ص۲۱۰-۲۴۰
pat = re.compile(r"واژگان|ترجمه|پاسخنامه|کلیدی")
for pno in range(209, min(240, doc.page_count)):
    page = doc[pno]
    text = page.get_text("text")
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    heads = [l for l in lines if pat.search(l) and len(l) < 80]
    if heads:
        print(f"\n=== PAGE {pno+1} ===")
        for h in heads[:8]:
            print("  H:", h)
