#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r316 diag3 — کلمات لبهٔ راست p218 در y440-660 (ریشهٔ عددهای تکراری)"""
import re, fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
doc = fitz.open(PDF)
W = doc[217].rect.width
page = doc[217]
words = page.get_text("words")
rows = {}
for x0, yy0, x1, yy1, wt, *_ in words:
    if yy0 < 60:
        continue
    key = round(yy0 / 4) * 4
    rows.setdefault(key, []).append((x0, wt))
for key in sorted(rows):
    if 400 <= key <= 680:
        ws = sorted(rows[key], reverse=True)
        line = " | ".join(f"{w}@{int(x)}" for x, w in ws[:12])
        print(f"y~{key:4d}: {line[:170]}")
