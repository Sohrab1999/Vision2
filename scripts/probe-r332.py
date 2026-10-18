# -*- coding: utf-8 -*-
# r332 — probe: «تست گرامر و نگارش درس اول — استاندارد/متوسط» ص۷۲+ و کلید ص۲۵۴-۲۵۷
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# سربرگ‌های ص۷۲..۸۳ برای یافتن مرزهای آزمون
for pno in range(72, 84):
    page = doc[pno - 1]
    txt = page.get_text("text").strip()
    lines = [l.strip() for l in txt.split("\n") if l.strip()][:6]
    print(f"=== p{pno} ===")
    for l in lines:
        print("   ", l[:110])
    print()
