# -*- coding: utf-8 -*-
# r343 — پروبِ «تست گرامر و نگارش درس سوم - پایه دهم» (ص۱۳۸-۱۴۰، کلیدِ چاپیِ ص۲۸۳-۲۸۶)
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# هدفِ راند: ص۱۳۸-۱۴۰ (اندیسِ ۰-مبنا: ۱۳۷-۱۳۹) + کلیدِ ص۲۸۳-۲۸۶ (اندیس: ۲۸۲-۲۸۵)
for pno in (137, 138, 139, 282, 283, 284, 285):
    page = doc[pno]
    txt = page.get_text("text")
    print(f"########## PAGE {pno+1} ({len(txt)} chars) ##########")
    print(txt)
    print()

# مرزها: ص۱۳۷ (پایانِ کارِ r342) و ص۱۴۱ (آغازِ خانوادهٔ بعد)
for pno in (136, 140):
    page = doc[pno]
    txt = page.get_text("text")
    print(f"##### BOUNDARY PAGE {pno+1} ({len(txt)} chars) #####")
    print(txt[:900])
    print()
