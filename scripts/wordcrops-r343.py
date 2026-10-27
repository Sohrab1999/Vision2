# -*- coding: utf-8 -*-
# r343 — کراپ‌های داوریِ واژه‌سطح از صفحاتِ کلید (ترجمه‌های چاپی)
import fitz
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
OUT = Path("/tmp/r343")
doc = fitz.open(PDF)

# (صفحه، الگویِ جست‌وجو، نام، dpi، بالای/پایینِ خط به نقاط)
TARGETS = [
    (282, "باران", "t1-shoroohangi", 1600, 3.0),     # Q1 ترجمه: هنگامی + شروع
    (282, "مطالعه", "t4-hangi", 1600, 3.0),          # Q4 ترجمه: هنگامی
    (282, "علف", "t5-morteza", 1600, 3.0),           # Q5 ترجمه: آیا داشتی + مرتضی
    (283, "پررسعت", "t15-porsorat", 1600, 3.0),      # Q15: پرسرعت/پرسعت + وقتی
    (283, "کاترین", "t20-chatri", 1600, 3.0),        # Q20: چتر/چتری + بهتر
    (284, "خوشحال", "t26-danim", 1600, 3.0),         # Q26: می دانیم/دانی + جین
    (284, "بفهمانم", "t28-tavajjohi", 1600, 3.0),    # Q28: سعی + توجهی/توجه
    (285, "مینا", "t36-kejast", 1600, 3.0),          # Q36: کجاست/کجا است
    (285, "ایتالیا", "t43-darhali", 2400, 3.0),      # Q43: درحالی/درحایل (نقطهٔ ی)
    (282, "شام", "t2-vaghti", 1600, 3.0),            # Q2: وقتی/وقت
    (283, "زیبا", "t10-vaghti", 1600, 3.0),          # Q10: وقتی/وقت
    (284, "کنار", "t33-ali", 1600, 3.0),             # Q33: علی + وقتی (کلیدِ Q33 در ص۲۸۵)
]

for pno, needle, name, dpi, pad in TARGETS:
    page = doc[pno]
    d = page.get_text("dict")
    hits = []
    for blk in d["blocks"]:
        for ln in blk.get("lines", []):
            ln_txt = "".join(sp["text"] for sp in ln["spans"])
            if needle in ln_txt:
                hits.append(fitz.Rect(ln["bbox"]))
    assert hits, f"{name}: no line with {needle!r} on page {pno+1}"
    r = hits[0]
    clip = fitz.Rect(max(0, r.x0 - 8), max(0, r.y0 - pad), min(page.rect.width, r.x1 + 8), min(page.rect.height, r.y1 + pad))
    pix = page.get_pixmap(dpi=dpi, clip=clip)
    pix.save(OUT / f"w-{name}.png")
    print(name, "line:", round(r.y0, 1), "->", f"w-{name}.png", pix.width, "x", pix.height)
