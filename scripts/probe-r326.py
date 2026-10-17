# -*- coding: utf-8 -*-
# r326 — پروبِ سربرگ‌های آزمونِ واژگانِ درسِ دومِ دهم (ص۵۶-۶۸) + زنجیرهٔ پاسخنامه‌ها
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

for pno in range(56, 69):
    txt = doc[pno - 1].get_text("text")
    # فقط خطوطِ سربرگ‌مانند
    lines = [l.strip() for l in txt.split("\n") if l.strip()]
    # جست‌وجوی سربرگ‌های آزمون/پاسخنامه
    hits = []
    for i, l in enumerate(lines):
        if any(k in l for k in ["آزمون", "پاسخنامه", "پاسخنامه", "تست", "سؤا", "سؤال", "درس", "بخش", "سطح"]):
            hits.append(l[:80])
    print(f"--- p{pno} ({len(txt)} chars) ---")
    for h in hits[:8]:
        print("  ", h)
