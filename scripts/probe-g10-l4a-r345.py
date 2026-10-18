# -*- coding: utf-8 -*-
# r345 — پروبِ مرزهای درس چهارم دهم (ص۱۴۱+ طبق «کار اول جلسه بعد» r344) — ساختار واقعی بلوک‌های قابل اجرا
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# هدف: ص۱۴۱-۱۴۷ (اندیس ۰-مبنا: ۱۴۰-۱۴۶) — آغاز درس چهارم
for pno in range(140, 147):
    page = doc[pno]
    txt = page.get_text("text")
    print(f"########## PAGE {pno+1} ({len(txt)} chars) ##########")
    print(txt)
    print()

# مرزِ عقب: ص۱۴۰ (آخرین کارِ r343 — تست گرامر و نگارش درس سوم)
page = doc[139]
print(f"##### BOUNDARY PAGE 140 ({len(page.get_text('text'))} chars) #####")
print(page.get_text("text")[:600])
