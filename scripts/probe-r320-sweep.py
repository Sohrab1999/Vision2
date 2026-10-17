#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r320 — پروبِ دوم: سوییپِ همهٔ خط‌ها در ص۱-۱۲۰ برای سربرگِ پاسخنامه + پیش‌نمایشِ ص۳۷-۳۸."""
import fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
doc = fitz.open(PDF)

print("=== sweep pp1-120 — any line containing پاسخنامه (dedup per page) ===")
for pno in range(1, 121):
    page = doc[pno - 1]
    lines = [l.strip() for l in page.get_text().splitlines() if l.strip()]
    hits = [l for l in lines if "پاسخنامه" in l or "پاســخنامه" in l.replace("ــ", "") or "پاسخـنامه" in l]
    if hits:
        uniq = list(dict.fromkeys(h[:80] for h in hits))[:3]
        print(f"p{pno}: " + " || ".join(uniq))

print("\n=== preview printed p37 (first 20) and p38 (first 25) ===")
for pno, cnt in ((37, 20), (38, 25)):
    page = doc[pno - 1]
    lines = [l.strip() for l in page.get_text().splitlines() if l.strip()]
    print(f"\n--- printed p{pno} ({len(lines)} lines):")
    for l in lines[:cnt]:
        print("   ", l[:100])
