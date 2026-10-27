# -*- coding: utf-8 -*-
# r349f — مکان‌یابیِ y نسبیِ برش‌های هدف برای داوری رندر
import fitz, re

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
                        print(f"p{pno+1} | y={sp['bbox'][1]/r.height:.3f}-{sp['bbox'][3]/r.height:.3f} x={sp['bbox'][0]/r.width:.3f}-{sp['bbox'][2]/r.width:.3f} | {t[:70]!r}")

print("=== p167 (exam) ===")
spans_with_y(166, ["تست گرامر", "استاندارد", "پاسخنامه", "I am not sure", "10: 30", "keep it secret"])
print("=== p169 (tags) ===")
spans_with_y(168, ["would react", "bus drivers", "leave early", "95", "98"])
print("=== p295 (key header) ===")
spans_with_y(294, ["پاسخنامه", "سؤا", "البته", "منطف", "عصبابن", "خصوض", "سمیرا", "سمیر ا"])
print("=== p296 ===")
spans_with_y(295, ["نگراف", "نگران", "سمیر", "مشکالت", "رفی", "دسی", "رس و", "عجیت"])
print("=== p297 ===")
spans_with_y(296, ["رسد", "آچه", "میر نان", "اسی", "طواالب", "عصب", "لاالله", "الله", "لاله", "قلت", "بیشی"])
print("=== p299 ===")
spans_with_y(298, ["رسد", "آچه", "میر نان", "اسی", "طواالب", "عصب", "قلت", "بیشی", "رسعت", "باالی"])
