#!/usr/bin/env python3
"""probe-g12-grammar2-r277.py — نقشهٔ کامل گرامر دوازدهم: سرصفحه‌های تست + بلوک‌های کلید"""
import json
import re

ROOT = "/home/z/my-project"
PDF = f"{ROOT}/upload/جزوه جامع دوازدهم 1.pdf"
import os
if not os.path.exists(PDF):
    cands = [f for f in os.listdir(f"{ROOT}/upload") if "دوازدهم" in f]
    print("candidates:", cands)
    PDF = f"{ROOT}/upload/{cands[0]}"
print("PDF:", PDF)

import fitz
doc = fitz.open(PDF)
print("pages:", len(doc))

# ۱) سرصفحه‌های بانک تست گرامر در کل PDF
HEAD = re.compile(r"تست\s*های?\s*گرامر|گرامر\s*و\s*نگارش|دستگرمی\s*گرامر")
print("\n== grammar-test headers per page ==")
for pno in range(len(doc)):
    txt = doc[pno].get_text("text")
    for m in HEAD.finditer(txt):
        s = max(0, m.start() - 40)
        ctx = txt[s:m.end() + 45].replace("\n", " ")
        print(f"  p{pno+1}: …{ctx}…")
        break  # یکی در هر صفحه کافی است
