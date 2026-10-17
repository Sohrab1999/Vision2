#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r318 probe2 — ساختِ صفحاتِ ۱۷۸-۱۸۵ برای یافتنِ مرزهایِ «پاسخنامهٔ سریع» و «ترجمهٔ ۱۰۰ تست l1»."""
import re
import fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
doc = fitz.open(PDF)
for pno in range(177, 186):  # 0-based => pp178..186
    page = doc[pno]
    text = page.get_text("text") or ""
    lines = [ln.rstrip() for ln in text.splitlines() if ln.strip()]
    print(f"######## p{pno+1} ({len(lines)} lines) ########")
    for i, ln in enumerate(lines[:45]):
        print(f"  {i:3d}| {ln[:100]}")
    if len(lines) > 45:
        print(f"  ... (+{len(lines)-45} more)")
        for i, ln in enumerate(lines[-8:]):
            print(f"  tail-{i}| {ln[:100]}")
doc.close()
