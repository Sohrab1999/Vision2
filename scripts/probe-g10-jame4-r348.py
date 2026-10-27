# -*- coding: utf-8 -*-
# r348 — پروبِ «آزمون جامع تشریحی درس چهارم» دهم (ص۱۶۴-۱۶۶، کلید چاپی ص۲۹۳-۲۹۴) — طبق «کار اول جلسه بعد» r347
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

for pno in (163, 164, 165):
    page = doc[pno]
    txt = page.get_text("text")
    print(f"########## PAGE {pno+1} ({len(txt)} chars) ##########")
    print(txt)
    print()

# کلید چاپی: ص۲۹۳-۲۹۴
for pno in (292, 293):
    page = doc[pno]
    txt = page.get_text("text")
    print(f"########## KEY PAGE {pno+1} ({len(txt)} chars) ##########")
    print(txt)
    print()

# مرز جلو: ص۱۶۷ (آغاز تست استاندارد)
page = doc[166]
print(f"##### BOUNDARY PAGE 167 ({len(page.get_text('text'))} chars) #####")
print(page.get_text("text")[:600])
