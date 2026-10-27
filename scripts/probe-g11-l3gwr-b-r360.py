# -*- coding: utf-8 -*-
# r360-b — مرزِ بخش اول/دوم + آخرین آیتم + کلیدهای ص۱۹۸-۲۰۰
import fitz, re

PDF = "/home/z/my-project/upload/جزوه جامع یازدهم .pdf"
doc = fitz.open(PDF)

def strip_header(raw):
    lines = raw.split("\n")
    for i, ln in enumerate(lines):
        if re.search(r"هم[ـ]*کاران", ln):
            return "\n".join(lines[i + 1:])
    return raw

print("===== FULL p104 =====")
print(strip_header(doc[103].get_text("text"))[:5000])

print("\n===== FULL p105 (boundary: end of بخش اول → بخش دوم start) =====")
print(strip_header(doc[104].get_text("text"))[:5000])

print("\n===== FULL p108 (end of بخش دوم) =====")
print(strip_header(doc[107].get_text("text"))[:5000])

print("\n===== KEY p198 =====")
print(doc[197].get_text("text")[:4200])
print("\n===== KEY p199 =====")
print(doc[198].get_text("text")[:4200])
print("\n===== KEY p200 =====")
print(doc[199].get_text("text")[:4200])
