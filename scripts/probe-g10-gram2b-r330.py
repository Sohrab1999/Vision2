# -*- coding: utf-8 -*-
# r330 — پروبِ کاملِ ص۶۶ (بقیهٔ سؤالات) + کلیدِ ص۲۴۹-۲۵۱ + ص۶۹ (پایان جامع؟)
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

for pno in (66, 249, 250, 251):
    page = doc[pno - 1]
    txt = page.get_text("text")
    print(f"========== p{pno} ({len(txt)} chars) ==========")
    print(txt)
    print()
