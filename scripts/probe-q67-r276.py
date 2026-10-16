#!/usr/bin/env python3
"""probe-q67-r276.py — رفع گم‌شدن گزینه‌های Q67 درس ۲ + بازبینی ساقه‌های بدون جاخالی"""
import re

ROOT = "/home/z/my-project"
PDF = f"{ROOT}/upload/جزوه جامع یازدهم .pdf"

import fitz
doc = fitz.open(PDF)

# Q67 درس ۲: کدام صفحه؟ idx 71 = Q40-58، idx 72 = Q59-70 → Q67 در idx 72
for pno in (71, 72):
    txt = doc[pno].get_text("text")
    lines = [l.strip() for l in txt.splitlines() if l.strip()]
    print(f"===== idx {pno} =====")
    show = False
    for l in lines:
        m = re.match(r"^6[5-9][\.\-]\s*(.*)$", l)
        if m:
            show = True
        if show:
            print("   ", l[:120])
        if re.match(r"^70[\.\-]", l):
            show = False
    print()
