# -*- coding: utf-8 -*-
# r346 — پروبِ «۴۰ تست واژگان» درس چهارم دهم (ص۱۵۱-۱۵۲، کلید چاپی ص۲۸۸-۲۸۹) — طبق «کار اول جلسه بعد» r345
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# هدف: ص۱۵۱-۱۵۲ (اندیس ۰-مبنا: ۱۵۰-۱۵۱)
for pno in (150, 151):
    page = doc[pno]
    txt = page.get_text("text")
    print(f"########## PAGE {pno+1} ({len(txt)} chars) ##########")
    print(txt)
    print()

# مرز عقب: ص۱۵۰ (آخرین کار r345 — پایان آزمون تشریحی واژگان)
page = doc[149]
print(f"##### BOUNDARY PAGE 150 ({len(page.get_text('text'))} chars) #####")
print(page.get_text("text")[:500])
print()

# مرز جلو: ص۱۵۳ (شروع Modals — برای تثبیت مرز)
page = doc[152]
print(f"##### BOUNDARY PAGE 153 ({len(page.get_text('text'))} chars) #####")
print(page.get_text("text")[:500])
print()

# کلید چاپی: ص۲۸۸-۲۸۹ (اندیس ۰-مبنا: ۲۸۷-۲۸۸)
for pno in (287, 288):
    page = doc[pno]
    txt = page.get_text("text")
    print(f"########## KEY PAGE {pno+1} ({len(txt)} chars) ##########")
    print(txt)
    print()
