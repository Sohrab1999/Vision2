# -*- coding: utf-8 -*-
# r325 — پروبِ ص۵۴-۵۵ («بخش دوم — سطح تستها استاندارد») و صفحاتِ کلیدِ ۲۴۵+ جزوهٔ دهم
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)
print("pages:", doc.page_count)

# 1) لایهٔ متنیِ ص۵۴-۵۶ برای شناساییِ سربرگ و شمارشِ سؤال‌ها
for pno in (54, 55, 56):
    page = doc[pno - 1]
    txt = page.get_text("text")
    print(f"\n===== PAGE {pno} TEXT ({len(txt)} chars) =====")
    print(txt[:2200])

# 2) سربرگِ صفحاتِ کلیدِ ۲۴۵-۲۴۷
for pno in (245, 246, 247):
    page = doc[pno - 1]
    txt = page.get_text("text")
    print(f"\n===== KEY PAGE {pno} TEXT ({len(txt)} chars) =====")
    print(txt[:1600])
