# -*- coding: utf-8 -*-
# r344 — پروبِ «ضمایرِ انعکاسی/تأکیدی و نگارشِ درس سوم» (ص۱۲۷-۱۳۱ طبق فهرستِ جلدِ ص۱۱۳) + کلیدِ چاپی
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# هدفِ راند: ص۱۲۷-۱۳۱ (اندیسِ ۰-مبنا: ۱۲۶-۱۳۰) + کلیدِ احتمالیِ ص۲۷۳-۲۷۸ (اندیس: ۲۷۲-۲۷۷)
for pno in (126, 127, 128, 129, 130):
    page = doc[pno]
    txt = page.get_text("text")
    print(f"########## PAGE {pno+1} ({len(txt)} chars) ##########")
    print(txt)
    print()

# کلیدهای اطراف — r340 کلیدِ ص۲۷۷-۲۷۸ را داشت؛ پس کلیدِ این خانواده قبل از آن است
for pno in (272, 273, 274, 275, 276):
    page = doc[pno]
    txt = page.get_text("text")
    print(f"##### KEY PAGE {pno+1} ({len(txt)} chars) #####")
    print(txt)
    print()

# مرزها: ص۱۲۶ (پایانِ کارِ r340: آزمون تشریحی گرامر درس سوم) و ص۱۳۲ (آغازِ r341: ۲۰ تست)
for pno in (125, 131):
    page = doc[pno]
    txt = page.get_text("text")
    print(f"##### BOUNDARY PAGE {pno+1} ({len(txt)} chars) #####")
    print(txt[:900])
    print()
