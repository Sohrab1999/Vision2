# -*- coding: utf-8 -*-
# r324 — پروبِ شمارهٔ پاسخنامهٔ بخش اول (ص۵۲) + محتوای ص۵۶ + کلیدهای ص۲۴۳-۲۴۵
import re
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

print("== p52: خط‌های شامل «پاسخنامه» با بافت ==")
lines = [l.strip() for l in doc[51].get_text("text").splitlines()]
for i, l in enumerate(lines):
    if "پاسخنامه" in l or "صفحه" in l:
        ctx = lines[max(0, i-2):i+4]
        print("  ctx:", " | ".join(x.strip()[:40] for x in ctx))

print("\n== p56: اولین ۲۵ خطِ محتوا ==")
cnt = 0
for l in doc[55].get_text("text").splitlines():
    s = l.strip()
    if not s: continue
    cnt += 1
    if cnt <= 25:
        print("   ", s[:110])

print("\n== p55: آخرین ۱۲ خط ==")
tail = [l.strip() for l in doc[54].get_text("text").splitlines() if l.strip()]
for l in tail[-12:]:
    print("   ", l[:110])

print("\n== p243/244/245: خط‌های آغازینِ غیرسربرگ ==")
HDR = re.compile(r"جزوه جام|Vision One|تألیف|^\d+$|انگل|ـــ")
for p in (242, 243, 244):
    print(f"--- p{p+1} ---")
    shown = 0
    for l in doc[p].get_text("text").splitlines():
        s = l.strip()
        if not s or HDR.search(s): continue
        shown += 1
        if shown <= 30:
            print("   ", s[:100])
