# -*- coding: utf-8 -*-
# r347 — پروبِ کاملِ کلیدهای ص۲۹۰ (تشریحی گرامر) و ص۲۹۱-۲۹۲ (۲۰ تست)
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

for pno in (289, 290, 291):
    page = doc[pno]
    txt = page.get_text("text")
    print(f"########## PAGE {pno+1} ({len(txt)} chars) ##########")
    print(txt)
    print()
