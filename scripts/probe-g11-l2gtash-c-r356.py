# -*- coding: utf-8 -*-
# r356 — کلیدِ چاپیِ ص۱۸۷ (پاسخنامهٔ آزمون تشریحی گرامر درس دوم)
import fitz, re

PDF = "/home/z/my-project/upload/جزوه جامع یازدهم .pdf"
doc = fitz.open(PDF)

def clean(t):
    return re.sub(r'\d{2,3}\s*\n\s*\n?\s*"جزوه[\s\S]*?همـــکاران"\s*\n', "", t)

for pno in (186, 187):
    t = clean(doc[pno].get_text("text"))
    print(f"--- p{pno+1} ch={len(t)} ---")
    print(t)
    print()
