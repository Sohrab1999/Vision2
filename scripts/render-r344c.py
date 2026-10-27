# -*- coding: utf-8 -*-
# r344c — کلیدِ تشریحیِ ص۱۲۸ با ۱۲۰۰dpi (داوریِ نکاتِ سرخِ «(رد گزینه ...)») + آیتم‌های ۱-۶ تمرینِ ص۱۳۰
import fitz
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
OUT = Path("/tmp/r344")
doc = fitz.open(PDF)

# کلیدِ ص۱۲۸: از «پاسخنامه تشریحی ۴ تست بالا:» تا پایانِ صفحه — ناحیهٔ ~۶۳-۹۶٪ ارتفاع
page = doc[127]
W, H = page.rect.width, page.rect.height
# سه نوارِ همپوشانِ ۱۲۰۰dpi روی ناحیهٔ کلید
for i, (y0, y1) in enumerate(((0.62, 0.75), (0.72, 0.85), (0.82, 0.97))):
    clip = fitz.Rect(0, H * y0, W, H * y1)
    pix = page.get_pixmap(dpi=1200, clip=clip)
    p = OUT / f"key128-z{i}.png"
    pix.save(p)
    print(p, pix.width, "x", pix.height)

# آیتم‌های ۱-۶ تمرینِ ص۱۳۰ با ۱۲۰۰dpi (رنگِ گزینه‌ها)
page = doc[129]
W, H = page.rect.width, page.rect.height
clip = fitz.Rect(0, H * 0.555, W, H * 0.72)
pix = page.get_pixmap(dpi=1200, clip=clip)
p = OUT / "drill130-items16.png"
pix.save(p)
print(p, pix.width, "x", pix.height)
