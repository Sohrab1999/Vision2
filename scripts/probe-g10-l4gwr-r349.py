# -*- coding: utf-8 -*-
# r349 — پروبِ «تست گرامر و نگارش درس چهارم - پایه دهم» استاندارد (ص۱۶۷+، کلیدِ چاپیِ ص۲۹۵)
# طبق «کار اول جلسه بعد» r348 — ادامهٔ خانوادهٔ درس چهارم به الگوی r343 (l3gwr)
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# هدفِ راند: ص۱۶۷ تا ص۱۷۰ (اندیسِ ۰-مبنا: ۱۶۶-۱۶۹) + کلیدِ ص۲۹۵-۲۹۶ (اندیس: ۲۹۴-۲۹۵)
for pno in range(166, 171):
    page = doc[pno]
    txt = page.get_text("text")
    print(f"########## PAGE {pno+1} ({len(txt)} chars) ##########")
    print(txt)
    print()

# کلید چاپی: ص۲۹۵-۲۹۶
for pno in (294, 295):
    page = doc[pno]
    txt = page.get_text("text")
    print(f"########## KEY PAGE {pno+1} ({len(txt)} chars) ##########")
    print(txt)
    print()

# مرزها: ص۱۶۶ (پایانِ کارِ r348 — جامع چهارم) و ص۱۷۱ (آغازِ خانوادهٔ بعد: متوسط و استاندارد ۱-۴)
for pno in (165, 170):
    page = doc[pno]
    txt = page.get_text("text")
    print(f"##### BOUNDARY PAGE {pno+1} ({len(txt)} chars) #####")
    print(txt[:900])
    print()
