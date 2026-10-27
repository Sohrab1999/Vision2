#!/usr/bin/env python3
"""probe-g11-konkur-keys-r277.py — کلید ص۱۸۸-۱۸۹ جزوهٔ یازدهم برای بانک‌های کنکوری گرامر"""
import re

ROOT = "/home/z/my-project"
PDF = f"{ROOT}/upload/جزوه جامع یازدهم .pdf"

import fitz
doc = fitz.open(PDF)
for pno in (185, 186, 187, 188, 189):
    txt = doc[pno].get_text("text")
    lines = [l.strip() for l in txt.splitlines() if l.strip()]
    print(f"===== idx {pno} (physical {pno+1}) — {len(lines)} lines =====")
    for l in lines[:22]:
        print("   ", l[:110])
    print()
