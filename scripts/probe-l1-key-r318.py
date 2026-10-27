#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r318 probe — یافتنِ «پاسخنامه کلیدی و ترجمهٔ ۱۰۰ تست واژگان درس اول» در جزوهٔ جامع دوازدهم.
الگوی r316/r317: l2=ص۱۹۸-۲۰۲، l3=ص۲۱۵-۲۱۸. انتظار: l1 پیش از آن‌ها (ص~۱۷۸-۱۹۷).
اسکنِ سربرگ‌های ص۱۷۵-۲۰۰ + شمارشِ ردیف‌های ترجمه در هر صفحه.
"""
import re
import fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"

doc = fitz.open(PDF)
print("total pages:", len(doc))
for pno in range(174, 201):  # 0-based => pp175..201 (1-based)
    if pno >= len(doc):
        break
    page = doc[pno]
    text = page.get_text("text") or ""
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    # صفحهٔ خالی نیست؟
    head = lines[:3] if lines else []
    # جست‌وجوی سربرگِ مرتبط
    hits = []
    for ln in lines:
        if re.search(r"واژگان|پاسخنامه|ترجمهٔ|ترجمه |درس اول|درس اول |کلیدی", ln):
            if len(ln) < 90:
                hits.append(ln)
    n_trans = sum(1 for ln in lines if re.search(r"\.$|\?$", ln) and len(ln) > 25)
    print(f"--- p{pno+1}: lines={len(lines)} sentlike={n_trans}")
    if head:
        print("    head:", " | ".join(h[:70] for h in head))
    for h in hits[:6]:
        print("    hit:", h[:85])
doc.close()
