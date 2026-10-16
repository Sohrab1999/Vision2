#!/usr/bin/env python3
"""probe-g12-pages-r274.py — شمارش سؤال‌ها و نمونهٔ متن صفحات PDF درس ۲/۳"""
import fitz, re

ROOT = "/home/z/my-project"
PDF = f"{ROOT}/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
doc = fitz.open(PDF)

for label, pages in (("L2 (74-78)", range(73, 78)), ("L3 (132-136)", range(131, 136))):
    print(f"########## {label} ##########")
    all_lines = []
    for p in pages:
        all_lines.extend(doc[p].get_text("text").splitlines())
    # شماره‌سؤال‌های یافت‌شده
    qnums = [int(m.group(1)) for ln in all_lines if (m := re.match(r"^\s*(\d{1,3})\.\s", ln))]
    print("question numbers found:", len(qnums), "| first/last:", qnums[:5], qnums[-5:] if qnums else [])
    # توالی
    seen, dups = set(), []
    for n in qnums:
        if n in seen:
            dups.append(n)
        seen.add(n)
    print("unique:", len(seen), "dups:", dups[:10])
    missing = [n for n in range(1, 101) if n not in seen]
    print("missing from 1..100:", missing[:20])
    print("--- page first 30 lines ---")
    for ln in doc[pages[0]].get_text("text").splitlines()[:30]:
        print(f"  |{ln}")
    print("--- page last 12 lines ---")
    for ln in doc[pages[0]].get_text("text").splitlines()[-12:]:
        print(f"  |{ln}")
    print()
