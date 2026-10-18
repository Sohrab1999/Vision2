# -*- coding: utf-8 -*-
# r356 — متنِ کاملِ ص۶۳-۶۴ (تشریحی گرامر د۲) + جست‌وجوی کلیدِ چاپی در ناحیهٔ پاسخنامه‌ها
import fitz, re

PDF = "/home/z/my-project/upload/جزوه جامع یازدهم .pdf"
doc = fitz.open(PDF)

def clean(t):
    return re.sub(r'\d{2,3}\s*\n\s*\n?\s*"جزوه[\s\S]*?همـــکاران"\s*\n', "", t)

print("===== FULL TEXT pp63-64 =====")
for pno in (62, 63):
    t = clean(doc[pno].get_text("text"))
    print(f"--- p{pno+1} ch={len(t)} ---")
    print(t)
    print()

print("===== SEARCH «پاسخنامه» headers pp170-204 =====")
for pno in range(169, doc.page_count):
    t = doc[pno].get_text("text")
    for ln in t.split("\n"):
        s = ln.strip()
        if "پاسخنامه" in s and len(s) < 80:
            print(f"p{pno+1:3d} «{s}»")
