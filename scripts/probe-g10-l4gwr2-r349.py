# -*- coding: utf-8 -*-
# r349b — دنبالهٔ پروب: کلیدِ ص۲۹۷-۲۹۹ + مرزِ ص۱۷۲ (خانوادهٔ بعد)
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

for pno in (296, 297, 298):
    page = doc[pno]
    txt = page.get_text("text")
    print(f"########## KEY PAGE {pno+1} ({len(txt)} chars) ##########")
    print(txt)
    print()

# مرزِ جلو: ص۱۷۲ (دومین صفحهٔ خانوادهٔ بعد — فقط برای ثبتِ مرز)
page = doc[171]
print(f"##### BOUNDARY PAGE 172 ({len(page.get_text('text'))} chars) #####")
print(page.get_text("text")[:700])
