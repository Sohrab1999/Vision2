#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r319 — پروبِ دوم: ساختارِ ص۲۲۲-۲۳۰ (ناحیهٔ پاسخنامه‌های گرامر) + جستوجوی «ترجمه» در همهٔ خط‌ها."""
import fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
doc = fitz.open(PDF)

print("=== deep sweep pp219-249 — every line containing کلید/ترجمه/ناقص/معلوم ===")
for pno in range(219, 250):
    page = doc[pno - 1]
    lines = [l.strip() for l in page.get_text().splitlines() if l.strip()]
    hits = [l for l in lines if any(k in l for k in ("کلید", "ترجمه", "ناقص", "معلوم و مجهول", "پاسخنامه"))]
    if hits:
        print(f"p{pno}: " + " || ".join(h[:80] for h in hits[:5]))

print("\n=== full preview printed p224 (first 45 lines) ===")
page = doc[224 - 1]
lines = [l.strip() for l in page.get_text().splitlines() if l.strip()]
for l in lines[:45]:
    print("   ", l[:110])

print("\n=== full preview printed p225 (first 30 lines) ===")
page = doc[225 - 1]
lines = [l.strip() for l in page.get_text().splitlines() if l.strip()]
for l in lines[:30]:
    print("   ", l[:110])
