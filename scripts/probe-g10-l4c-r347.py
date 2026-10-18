# -*- coding: utf-8 -*-
# r347 — پروبِ ادامهٔ خانوادهٔ درس چهارم دهم: آزمون تشریحی گرامر (ص۱۶۱-۱۶۲) و «۲۰ تست دستگریمی» (ص۱۶۳)
# طبق «کار اول جلسه بعد» r346
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# هدف: ص۱۶۱-۱۶۳ (اندیس ۰-مبنا: ۱۶۰-۱۶۲)
for pno in (160, 161, 162):
    page = doc[pno]
    txt = page.get_text("text")
    print(f"########## PAGE {pno+1} ({len(txt)} chars) ##########")
    print(txt)
    print()

# مرز عقب: ص۱۶۰ (قیدهای حالت — پیش از این راند)
page = doc[159]
print(f"##### BOUNDARY PAGE 160 ({len(page.get_text('text'))} chars) #####")
print(page.get_text("text")[:600])
print()

# مرز جلو: ص۱۶۴ (آزمون جامع؟)
page = doc[163]
print(f"##### BOUNDARY PAGE 164 ({len(page.get_text('text'))} chars) #####")
print(page.get_text("text")[:600])
print()

# کلید چاپی محتمل: ص۲۸۷+ (پس از گریدهای r345) — ص۲۹۰ به بعد را ببین
for pno in (289, 290, 291):
    page = doc[pno]
    txt = page.get_text("text")
    print(f"########## KEY CANDIDATE PAGE {pno+1} ({len(txt)} chars) ##########")
    print(txt[:1500])
    print()
