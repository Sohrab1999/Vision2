#!/usr/bin/env python3
"""probe-g12-grammar5-r277.py — همهٔ سکشن‌های c13 + صفحهٔ PDF بلوک کلید گرامر"""
import json
import re

ROOT = "/home/z/my-project"
G12 = f"{ROOT}/public/jozve/g12.json"
PDF = f"{ROOT}/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"

g12 = json.load(open(G12))
ch = next(c for c in g12["chapters"] if c["id"] == "c13")
print(f"== c13 all sections ({len(ch['sections'])}) ==")
for si, s in enumerate(ch["sections"]):
    print(f"  sec{si}: {s['title'][:85]} ({len(s['lines'])} lines)")

import fitz
doc = fitz.open(PDF)
print("\n== PDF pages containing 'پاسخنامه تستهای گرامر' ==")
for pno in range(len(doc)):
    txt = doc[pno].get_text("text")
    if "پاسخنامه تستهای گرامر" in txt or "پاسخنامه تستهای گرام" in txt:
        first = [l.strip() for l in txt.splitlines() if "پاسخنامه" in l][0]
        print(f"  p{pno+1}: {first[:90]}")
