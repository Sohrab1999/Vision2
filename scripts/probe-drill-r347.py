# -*- coding: utf-8 -*-
# r347 — جست‌وجوی تمرینِ ۱۲آیتمیِ «زیر گزینه صحیح خط بکشید» (کلیدِ بخشِ ۶ ص۲۹۰) در ص۱۵۳-۱۶۰
import fitz, re

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

for pno in range(152, 160):
    page = doc[pno]
    txt = page.get_text("text")
    hits = []
    if "زیر گزینه" in txt or "زیر  گزینه" in txt or "خط بکشید" in txt:
        hits.append("UNDERLINE-DRILL")
    if re.search(r"\bin\s*/\s*at\s*/\s*on\b", txt):
        hits.append("IN-AT-ON")
    print(f"--- p{pno+1}: {len(txt)} chars {'|'.join(hits)}")
    # نمایشِ سربرگ‌های فارسی (خطوط کوتاهِ فارس)
    lines = [l.strip() for l in txt.split("\n") if l.strip()]
    fa = [l for l in lines if re.search(r"[\u0600-\u06FF]", l) and len(l) < 90][:14]
    for l in fa:
        print("   ", l)
