#!/usr/bin/env python3
"""probe-g11-konkur5-r277.py — اسکن دنبالهٔ PDF برای کلیدهای دستگرمی/کنکوری L1 و L3"""
import re

ROOT = "/home/z/my-project"
PDF = f"{ROOT}/upload/جزوه جامع یازدهم .pdf"

import fitz
doc = fitz.open(PDF)

print("== mentions of دستگرمی / پاسخنامه in whole PDF (deduped per page) ==")
for pno in range(len(doc)):
    txt = doc[pno].get_text("text")
    hits = []
    for l in txt.splitlines():
        s = l.strip()
        if re.search(r"دستگرمی|دستگریم", s) and "پاسخنامه" not in s:
            hits.append(s[:85])
        elif re.search(r"پاسخنامه", s) and re.search(r"دستگرمی|کنکوری|گرامر", s):
            hits.append("KEY→ " + s[:85])
    if hits:
        print(f"  p{pno+1}:")
        for h in hits[:4]:
            print(f"     {h}")
