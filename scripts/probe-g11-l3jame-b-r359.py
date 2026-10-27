# -*- coding: utf-8 -*-
# r359 — دامپِ کاملِ ص۱۰۹-۱۱۲ (آزمون جامع درس سوم) + کلیدِ چاپیِ ص۲۰۱-۲۰۲
import fitz, re

PDF = "/home/z/my-project/upload/جزوه جامع یازدهم .pdf"
doc = fitz.open(PDF)

for pno in (108, 109, 110, 111):
    raw = doc[pno].get_text("text")
    lines = raw.split("\n")
    for i, ln in enumerate(lines):
        if re.search(r"هم[ـ]*کاران", ln):
            lines = lines[i + 1:]
            break
    print(f"############ PAGE {pno+1} ({len(lines)} lines) ############")
    for j, ln in enumerate(lines):
        print(f"{j+1:3d}| {ln.rstrip()}")
    print()

for pno in (200, 201):
    raw = doc[pno].get_text("text")
    print(f"############ KEY PAGE {pno+1} ############")
    print(raw)
    print()
