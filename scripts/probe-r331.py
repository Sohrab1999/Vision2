# -*- coding: utf-8 -*-
# r331 — پروب: «آزمون جامع تستی درس اول» ص۶۸-۷۱ + کلید ص۲۵۲+
import fitz, unicodedata

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

def norm(s):
    return s.replace("\u200c", "").replace(" ", "").replace("\n", "")

# جست‌وجوی سربرگ در سراسر سند برای یافتن صفحات دقیق
for pno in range(1, doc.page_count + 1):
    t = doc[pno - 1].get_text("text")
    if "جامع" in norm(t) and ("تستی" in norm(t) or "تشریحی" in norm(t)):
        first = [ln.strip() for ln in t.splitlines() if ln.strip()][:6]
        print(f"--- p{pno}: {first[:4]}")

print("\n==== LAYER pp68-71 ====")
for pno in range(68, 72):
    print(f"\n########## PAGE {pno} ##########")
    t = doc[pno - 1].get_text("text")
    print(t[:2600])
