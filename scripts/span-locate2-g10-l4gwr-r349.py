# -*- coding: utf-8 -*-
# r349g — مکان‌یابیِ تکمیلی: ص۱۶۸ + کلیدهای ص۲۹۶-۲۹۸
import fitz

doc = fitz.open("/home/z/my-project/upload/جزوه جامع دهم .pdf")

def spans_with_y(pno, needles):
    page = doc[pno]
    r = page.rect
    d = page.get_text("dict")
    for block in d["blocks"]:
        for line in block.get("lines", []):
            for sp in line["spans"]:
                t = sp["text"]
                for nd in needles:
                    if nd in t:
                        print(f"p{pno+1} | y={sp['bbox'][1]/r.height:.3f}-{sp['bbox'][3]/r.height:.3f} x={sp['bbox'][0]/r.width:.3f}-{sp['bbox'][2]/r.width:.3f} | {t[:75]!r}")

print("=== p168 (Q26/Q46) ===")
spans_with_y(167, ["10:", "30", "Drive", "high speed"])
print("=== p296 (Q19/Q32/Q24) ===")
spans_with_y(295, ["تمیر", "رس و", "عجیت", "متا", "بیر ون", "پیاده", "کنست", "تمیز"])
print("=== p297 (Q34/Q35) ===")
spans_with_y(296, ["مشکالت", "رفی", "دسی", "آسابن", "رسعت", "سخت", "تالش زیاد", "پشت میر"])
print("=== p298 (Q48/Q49) ===")
spans_with_y(297, ["الله", "لاله", "قلت", "بیشی", "باالی", "نوید", "رسعت", "عصبابن", "زیباب"])
