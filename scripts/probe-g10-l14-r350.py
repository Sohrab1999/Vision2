# -*- coding: utf-8 -*-
# r350 — پروبِ «تستهای متوسط و استاندارد درس ۱ تا ۴» (Grammar Tests — Vision 1 — ص۱۷۱+، کلیدِ چاپیِ ص۳۰۰+)
# طبق «کار اول جلسه بعد» r349 — آغازِ خانوادهٔ چهاردرسِ ترکیبی
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# هدفِ راند: ص۱۷۱ تا ۱۷۴ (اندیسِ ۰-مبنا: ۱۷۰-۱۷۳)
for pno in range(170, 174):
    page = doc[pno]
    txt = page.get_text("text")
    print(f"########## PAGE {pno+1} ({len(txt)} chars) ##########")
    print(txt)
    print()

# کلید چاپی: ص۳۰۰-۳۰۱ (اندیس: ۲۹۹-۳۰۰)
for pno in (299, 300):
    page = doc[pno]
    txt = page.get_text("text")
    print(f"########## KEY PAGE {pno+1} ({len(txt)} chars) ##########")
    print(txt)
    print()

# مرزها: ص۱۷۰ (پایانِ کارِ r349) و ص۱۷۵ (ادامه یا خانوادهٔ بعد)
for pno in (169, 174):
    page = doc[pno]
    txt = page.get_text("text")
    print(f"##### BOUNDARY PAGE {pno+1} ({len(txt)} chars) #####")
    print(txt[:900])
    print()
