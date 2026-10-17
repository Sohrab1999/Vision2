# -*- coding: utf-8 -*-
# r324 — پروبِ ادامهٔ خطِ درس‌بندیِ دهم: ص۵۲-۶۰ (آزمون‌های واژگان درس یکم/دوم)
#        + زنجیرهٔ کلیدهای چاپی (ص۲۴۲-۲۵۲) — الگوی r322/r323 handoff
import re
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)
print("pages:", doc.page_count)

def header(pno, nlines=6):
    page = doc[pno]
    lines = [l.strip() for l in page.get_text("text").splitlines() if l.strip()]
    return lines[:nlines]

print("\n== سرصفحه‌های ص۵۲-۶۰ (1-based) ==")
for p in range(51, 60):
    print(f"--- p{p+1} ---")
    for l in header(p):
        print("   ", l[:90])

print("\n== سرصفحه‌های ص۲۴۲-۲۵۲ (کلیدها) ==")
for p in range(241, min(252, doc.page_count)):
    print(f"--- p{p+1} ---")
    for l in header(p):
        print("   ", l[:90])

print("\n== جست‌وجوی لنگر «پاسخنامه» در ص۵۰-۷۵ ==")
for p in range(49, 75):
    txt = doc[p].get_text("text")
    for line in txt.splitlines():
        if "پاسخنامه" in line or "کلید" in line:
            print(f"  p{p+1}: {line.strip()[:90]}")
