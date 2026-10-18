# -*- coding: utf-8 -*-
# r355-2 — پروبِ کامل: کلِ ص۴۰-۴۳ بدونِ برش + کلیدِ ص۱۸۳ (و همسایه‌ها)
import fitz, re

PDF = "/home/z/my-project/upload/جزوه جامع یازدهم .pdf"
doc = fitz.open(PDF)
HEADER_RE = re.compile(r'\d{2,3}\s*\n\s*\n?\s*"جزوه[\s\S]*?هم[ـ]*کاران"\s*\n')

def show(pno, lim=8000):
    t = doc[pno].get_text("text")
    t2 = HEADER_RE.sub("", t)
    print(f"########## PAGE {pno+1} (raw={len(t)} stripped={len(t2)}) ##########")
    print(t2.strip()[:lim])
    print()

for pno in range(39, 43):
    show(pno)

print("############ KEY PAGE 183 ############")
show(182, 9000)
print("############ p184 head (check key end) ############")
t = doc[183].get_text("text")
t2 = HEADER_RE.sub("", t)
print(t2.strip()[:1500])
