# -*- coding: utf-8 -*-
# r341 — پروبِ «۲۰ تست گرامر و نگارش درس سوم» (ص۱۳۴، کلیدِ ص۲۷۹-۲۸۲)
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

for pno in (133, 134, 278, 279, 280, 281):
    page = doc[pno]
    txt = page.get_text("text")
    print(f"########## PAGE {pno+1} ({len(txt)} chars) ##########")
    print(txt)
    print()

# صفحه‌های بعد/قبل برای تعیینِ مرزِ خانواده
for pno in (132, 135):
    page = doc[pno]
    txt = page.get_text("text")
    print(f"##### BOUNDARY PAGE {pno+1} ({len(txt)} chars) #####")
    print(txt[:1200])
    print()
