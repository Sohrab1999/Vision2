# -*- coding: utf-8 -*-
# r342 — پروبِ «آزمون جامع تشریحی درس سوم» (ص۱۳۵-۱۳۷، کلیدِ ص۲۸۱-۲۸۲)
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

for pno in (134, 135, 136, 280, 281):
    page = doc[pno]
    txt = page.get_text("text")
    print(f"########## PAGE {pno+1} ({len(txt)} chars) ##########")
    print(txt)
    print()

# مرزها: ص۱۳۴ (پایانِ کار r341) و ص۱۳۸ (آغازِ خانوادهٔ بعد)
for pno in (133, 137):
    page = doc[pno]
    txt = page.get_text("text")
    print(f"##### BOUNDARY PAGE {pno+1} ({len(txt)} chars) #####")
    print(txt[:800])
    print()
