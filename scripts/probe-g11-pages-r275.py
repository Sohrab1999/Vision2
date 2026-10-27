#!/usr/bin/env python3
"""probe-g11-pages-r275.py — شمارش دقیق سؤال‌ها در صفحات ۱۹-۲۱، ۵۷-۵۹، ۹۱-۹۳ یازدهم"""
import fitz, re

ROOT = "/home/z/my-project"
doc = fitz.open(f"{ROOT}/upload/جزوه جامع یازدهم .pdf")

for label, pages in (("L1", (18, 19, 20)), ("L2", (56, 57, 58)), ("L3", (90, 91, 92))):
    print(f"===== {label} =====")
    for p in pages:
        lines = doc[p].get_text("text").splitlines()
        qnums = [int(m.group(1)) for ln in lines if (m := re.match(r"^\s*(\d{1,3})\.\s", ln))]
        first2 = " / ".join(l.strip()[:60] for l in lines[:2] if l.strip())
        print(f"  page {p+1}: {len(qnums)} q-lines | {qnums[:3]}...{qnums[-3:] if qnums else ''} | head: {first2[:70]}")
    print()

print("=== page 19 (0-idx 18) lines 22-50 ===")
for ln in doc[18].get_text("text").splitlines()[22:50]:
    print(f"  |{ln[:130]}")
