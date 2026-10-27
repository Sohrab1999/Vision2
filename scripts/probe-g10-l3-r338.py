# -*- coding: utf-8 -*-
# r338 — پروبِ نقشهٔ مرزِ درسِ سومِ دهم (ص۱۱۳+): رندرِ متوسط برای تشخیصِ سربرگ‌ها/بخش‌ها/کلید
import fitz
from pathlib import Path

PDF = "upload/جزوه جامع دهم .pdf"
OUT = Path("/tmp")
doc = fitz.open(PDF)
# صفحاتِ ۱۱۳ تا ۱۲۰ (ایندکسِ صفرمبنا: ۱۱۲..۱۱۹) — رندرِ ۱۵۰dpi برایِ نقشه
for pno in range(112, 120):
    page = doc[pno]
    pix = page.get_pixmap(dpi=150)
    out = OUT / f"r338-p{pno+1:03d}.png"
    pix.save(out)
    print(out, pix.width, "x", pix.height)
print("done")
