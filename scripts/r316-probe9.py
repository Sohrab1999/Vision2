#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r316 probe9 — فهرستِ قطعیِ ۱۰۰ هدر از لبهٔ راست ص۲۱۵-۲۱۸ (بدون وابستگی به خط‌چین)"""
import re, json, fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
doc = fitz.open(PDF)
W = doc[214].rect.width
fa2en = str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789")
LET = re.compile(r"^\(?([abcd])\)?[,.;:]?$", re.I)
NUMW = re.compile(r"^\(?-?([0-9]{1,3})\)?-?,?$")

headers = []  # (page, y, num, letter)
for pno in (215, 216, 217, 218):
    page = doc[pno - 1]
    words = page.get_text("words")
    right = []
    for x0, yy0, x1, yy1, wt, *_ in words:
        if x0 < W * 0.70 or yy1 < 60:  # بالای صفحه (سربرگ جزوه) را دور بریز
            continue
        t = wt.strip().translate(fa2en)
        m = LET.match(t)
        if m:
            right.append((yy0, "L", m.group(1).lower(), x0))
            continue
        m = NUMW.match(t)
        if m and 1 <= int(m.group(1)) <= 100:
            right.append((yy0, "N", int(m.group(1)), x0))
    right.sort()
    used = set()
    for i, (ya, ta, va, xa) in enumerate(right):
        for j in range(i + 1, len(right)):
            yb, tb, vb, xb = right[j]
            if abs(ya - yb) < 2.5 and ta != tb and j not in used and i not in used:
                num = va if ta == "N" else vb
                let = va if ta == "L" else vb
                if 1 <= num <= 100:
                    headers.append((pno, ya, num, let))
                    used.add(i); used.add(j)
                break

headers.sort(key=lambda h: (h[0], h[1]))
print(f"headers found: {len(headers)}")
nums = [h[2] for h in headers]
print("sequence:", nums)
ok = nums == list(range(1, 101))
print("strict 1..100:", ok)
if not ok:
    # کجا شکسته؟
    for k in range(1, len(nums)):
        if nums[k] != nums[k-1] + 1:
            print(f"  break at #{k}: {nums[k-1]} -> {nums[k]} (p{headers[k-1][0]}y{headers[k-1][1]:.0f} -> p{headers[k][0]}y{headers[k][1]:.0f})")
json.dump([(h[0], h[1], h[2], h[3]) for h in headers], open("/tmp/r316-headers.json", "w"))
print("saved /tmp/r316-headers.json")
