#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r318 probe3 — متنِ کاملِ ص۱۸۱-۱۸۵ (ناحیهٔ کلید+ترجمهٔ ۱۰۰ تست واژگان l1)."""
import fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
doc = fitz.open(PDF)
for pno in range(180, 185):  # 0-based => pp181..185
    page = doc[pno]
    text = page.get_text("text") or ""
    lines = [ln.rstrip() for ln in text.splitlines() if ln.strip()]
    print(f"######## p{pno+1} ({len(lines)} lines) ########")
    for i, ln in enumerate(lines):
        print(f"  {i:3d}| {ln[:110]}")
doc.close()
