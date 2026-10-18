# -*- coding: utf-8 -*-
# r352 — Q175/Q176 در لایه: جستجوی بدون لنگرِ خط
import fitz, re

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)
txt = ""
for pno in range(177, 194):
    txt += doc[pno].get_text("text") + "\n"
txt = re.sub(r'\d{3}\s*\n[\s\S]{0,20}?"جزوه[\s\S]*?هم.{0,12}کاران"\s*\n', "\n", txt)

for probe in ("175.", " 175", "176."):
    idxs = [m.start() for m in re.finditer(re.escape(probe), txt)]
    print(f"'{probe}' found at: {idxs[:6]}")

i = txt.find("175.")
print("===== context of first '175.' =====")
print(txt[max(0, i-400):i+500])
