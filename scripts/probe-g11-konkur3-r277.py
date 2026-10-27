#!/usr/bin/env python3
"""probe-g11-konkur3-r277.py — یافتن بانک‌های کنکوری L1/L3 و کلیدهایشان با الگوهای گسترده"""
import re

ROOT = "/home/z/my-project"
PDF = f"{ROOT}/upload/جزوه جامع یازدهم .pdf"

import fitz
doc = fitz.open(PDF)

QSTART = re.compile(r"^(\d{1,3})[\.\-]\s*(.+)$")

print("== page headers around L1 (idx 30-35) and L3 (idx 99-104) ==")
for pno in list(range(30, 36)) + list(range(99, 105)):
    txt = doc[pno].get_text("text")
    lines = [l.strip() for l in txt.splitlines() if l.strip()]
    # اولین خط فارسی بعد از سرصفحهٔ ثابت
    body = [l for l in lines if not any(k in l for k in ("جزوه", "جام ــع", "زبان انگل", "پایه یازدهم", "Vision Two", "تألی", "احمـدی", "همــــکاران")) and not re.match(r"^\d{1,3}$", l)]
    nums = []
    for l in lines:
        m = QSTART.match(l)
        if m and 1 <= int(m.group(1)) <= 40:
            nums.append(int(m.group(1)))
    runs = []
    for n in nums:
        if runs and n == runs[-1][1] + 1:
            runs[-1][1] = n
        else:
            runs.append([n, n])
    print(f"  idx {pno} (p{pno+1}): runs={runs} | hdr: {body[0][:75] if body else '—'}")

print("\n== ALL 'کنکوری گرامر' mentions ==")
for pno in range(len(doc)):
    txt = doc[pno].get_text("text").replace("\n", " ")
    for m in re.finditer(r".{25}کنکوری\s*گرامر.{25}", txt):
        print(f"  p{pno+1}: …{m.group(0)}…")
