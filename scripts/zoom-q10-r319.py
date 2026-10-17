#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r319 — زومِ داوری: خانهٔ n=10 گریدِ سومِ ص۲۲۴ + سؤالِ ۱۰ در ص۱۵۱ (بررسیِ کلیدِ درون‌خطی)."""
import fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
doc = fitz.open(PDF)

# --- ص۲۲۴: ناحیهٔ گریدِ سوم (زیرِ سربرگِ «تخص») — از لایه، yِ سربرگِ سوم را بگیر
p224 = doc[223]
b3_y = None
for x0, y0, x1, y1, text, *_ in p224.get_text("blocks"):
    if "تخص" in text and ("151" in text or "۱۵۱" in text or "152" in text or "۱۵۲" in text):
        b3_y = y0
if b3_y is None:
    b3_y = 224 * 0.0  # fallback
print("b3 header y:", b3_y, "page H:", p224.rect.height)

# کلِ ناحیهٔ گریدِ سوم با ۱۴۰۰dpi (برای دیدنِ همهٔ خانه‌ها با کیفیت)
clip3 = fitz.Rect(0, b3_y - 5, p224.rect.width, p224.rect.height * 0.88)
p224.get_pixmap(matrix=fitz.Matrix(1400/72, 1400/72), clip=clip3).save("/tmp/r319-p224-b3-zoom.png")
print("saved /tmp/r319-p224-b3-zoom.png")

# --- ص۱۵۱: سؤالِ ۱۰ — پیدا کردنِ yِ خطِ "10." و برشِ آن ناحیه
p151 = doc[150]
qy = None
for x0, y0, x1, y1, text, *_ in p151.get_text("blocks"):
    t = text.strip()
    if t.startswith("10.") or t.startswith("10 .") or " 10." in t[:12]:
        qy = y0
        print("q10 block y:", y0, "| text:", t[:80])
if qy is not None:
    clip = fitz.Rect(0, max(0, qy - 10), p151.rect.width, min(p151.rect.height, qy + 62))
    p151.get_pixmap(matrix=fitz.Matrix(1600/72, 1600/72), clip=clip).save("/tmp/r319-p151-q10-zoom.png")
    print("saved /tmp/r319-p151-q10-zoom.png")
else:
    p151.get_pixmap(matrix=fitz.Matrix(300/72, 300/72)).save("/tmp/r319-p151-full.png")
    print("q10 not found in layer — saved full p151 300dpi")
