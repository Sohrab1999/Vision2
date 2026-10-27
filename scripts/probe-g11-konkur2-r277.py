#!/usr/bin/env python3
"""probe-g11-konkur2-r277.py — نقشهٔ کامل سه بانک کنکوری گرامر یازدهم + محل کلیدها"""
import re

ROOT = "/home/z/my-project"
PDF = f"{ROOT}/upload/جزوه جامع یازدهم .pdf"

import fitz
doc = fitz.open(PDF)

# ۱) همهٔ سرصفحه‌های «پاسخنامه تست‌های کنکوری گرامر»
print("== konkur-grammar key headers ==")
for pno in range(len(doc)):
    txt = doc[pno].get_text("text")
    if re.search(r"پاس\s*خـ?\s*نامه\s*تست\s*های?\s*ـ?\s*کنکوری\s*گرامر", txt.replace("\n", " ")):
        for l in txt.splitlines():
            if "کنکوری" in l or "سؤاالت" in l or "سوالات" in l:
                print(f"  p{pno+1}: {l.strip()[:80]}")
        print("  ---")

# ۲) صفحات سؤال: دنبالِ «تست های گرامر و نگارش درسN» (کنکوری) بگرد
print("== konkur-bank question headers ==")
for pno in range(len(doc)):
    txt = doc[pno].get_text("text")
    if re.search(r"تست\s*های\s*گرامر\s*و\s*نگارش", txt.replace("\n", " ")) and "کنکوری" in txt:
        for l in txt.splitlines():
            if "گرامر" in l and "نگارش" in l:
                print(f"  p{pno+1}: {l.strip()[:80]}")
                break
