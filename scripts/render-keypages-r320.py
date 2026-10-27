#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r320 — رندرِ صفحاتِ کلید: ص۱۸۵-۱۸۶ (تشریحیِ l10 با ترجمهٔ تست) و ص۱۸۷ (گریدِ ۴۰ کلیدِ l11)."""
import fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
doc = fitz.open(PDF)
for pno in (185, 186, 187):
    page = doc[pno - 1]
    out = f"/tmp/r320-p{pno}-full.png"
    page.get_pixmap(matrix=fitz.Matrix(300/72, 300/72)).save(out)
    print("saved", out)
