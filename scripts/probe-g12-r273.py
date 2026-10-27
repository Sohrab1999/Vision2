#!/usr/bin/env python3
"""probe-g12-r273.py — شناسایی ساختار صفحات تست واژگان درس ۱ جزوهٔ دوازدهم (ص۲۱-۲۵)
قانون r265: اول زمین را ببین، بعد پارسر بنویس."""
import fitz, sys, re

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
doc = fitz.open(PDF)
print(f"pages={doc.page_count}")
# صفحات ۲۱ تا ۲۵ (۱-ایندکس) — و دو صفحهٔ حاشیه‌ای برای دیدن مرزها
for pno in range(19, 27):
    page = doc[pno]
    txt = page.get_text("text")
    lines = [l.rstrip() for l in txt.splitlines()]
    print(f"\n========== PAGE {pno+1} ({len(lines)} lines) ==========")
    for i, l in enumerate(lines):
        print(f"{i:03d}| {l[:120]}")
