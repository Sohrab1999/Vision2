# -*- coding: utf-8 -*-
# r377 — داوری: زوم ۳۰۰dpi از س۳ ص۵۰ (نقشهٔ قطب‌نما؟) + س۱ ص۵۰ و س۱/س۲ ص۶۰ (برای مستندسازیِ تصویری‌بودن)
import fitz
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه هشتم.pdf"
OUT = Path("/tmp/qa-r377"); OUT.mkdir(parents=True, exist_ok=True)
doc = fitz.open(PDF)

def zoom(p, rect, name, dpi=300):
    page = doc[p - 1]
    pix = page.get_pixmap(dpi=dpi, clip=rect)
    pix.save(OUT / name); print(f"{OUT/name}  {pix.width}x{pix.height}")

# کل صفحه برای سنجش نسبت‌ها
for p in (50, 60):
    page = doc[p - 1]
    print(f"p{p} page rect = {page.rect}")

# س۳ ص۵۰: بعد از بانکِ جهت‌ها — نیمهٔ پایینی صفحه (احتمالاً نقشه)
zoom(50, fitz.Rect(0, 0.52*doc[49].rect.height, doc[49].rect.width, doc[49].rect.height), "p50-s3-zoom.png")
# س۱ ص۵۰: بالای صفحه (۵ تصویر)
zoom(50, fitz.Rect(0, 0.10*doc[49].rect.height, doc[49].rect.width, 0.40*doc[49].rect.height), "p50-s1-zoom.png")
# س۱/س۲ ص۶۰: بدنهٔ تصویری
zoom(60, fitz.Rect(0, 0.08*doc[59].rect.height, doc[59].rect.width, 0.75*doc[59].rect.height), "p60-s12-zoom.png")
# س۴ ص۵۰: تلفظ th — برای رونویسی دقیق فهرست
zoom(50, fitz.Rect(0, 0.78*doc[49].rect.height, doc[49].rect.width, doc[49].rect.height), "p50-s4-zoom.png")
