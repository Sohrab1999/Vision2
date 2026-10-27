# -*- coding: utf-8 -*-
# r330 — پروبِ ص۶۶-۶۸ («تست گرامر درس اول»؟) و کلیدِ ص۲۴۹ — لایهٔ fitz برای ساختار
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

for pno in (66, 67, 68, 249):
    page = doc[pno - 1]
    txt = page.get_text("text")
    print(f"========== p{pno} ({len(txt)} chars) ==========")
    print(txt[:2400])
    print()
