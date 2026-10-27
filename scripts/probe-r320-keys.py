#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r320 — پروبِ گریدِ کلیدِ چاپیِ دو بانکِ معلوم‌ومجهول (درس‌های 10/11، سؤال‌های ص۳۶-۳۸).
جستوجوی سربرگِ پاسخنامه در ص۳۹-۶۰ + پیش‌نمایشِ صفحاتِ نامزد."""
import fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
doc = fitz.open(PDF)

print("=== sweep pp39-70: lines with پاسخنامه/معلوم ===")
for pno in range(39, 71):
    page = doc[pno - 1]
    lines = [l.strip() for l in page.get_text().splitlines() if l.strip()]
    hits = [l for l in lines[:8] if ("پاسخ" in l or "معل" in l)]
    if hits:
        print(f"p{pno}: " + " || ".join(h[:70] for h in hits[:4]))

print("\n=== preview pp39-40 (first 35 lines each) ===")
for pno in (39, 40):
    page = doc[pno - 1]
    lines = [l.strip() for l in page.get_text().splitlines() if l.strip()]
    print(f"\n--- printed p{pno} ({len(lines)} lines):")
    for l in lines[:35]:
        print("   ", l[:100])
