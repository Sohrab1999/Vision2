#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r318 probe4 — دمِ ص۱۸۴ (گریدِ کلید) و متنِ کاملِ ص۱۸۵."""
import fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
doc = fitz.open(PDF)

# tail of p184 with coordinates
page = doc[183]
words = page.get_text("words")  # x0,y0,x1,y1,word,block,line,word_no
print("### p184 last 60 words (y-sorted, y>560) ###")
ws = sorted([w for w in words if w[1] > 560], key=lambda w: (round(w[1]), w[0]))
for w in ws[-80:]:
    print(f"  y={w[1]:.0f} x={w[0]:.0f} | {w[4]}")

page = doc[184]
text = page.get_text("text") or ""
lines = [ln.rstrip() for ln in text.splitlines() if ln.strip()]
print(f"\n######## p185 FULL ({len(lines)} lines) ########")
for i, ln in enumerate(lines):
    print(f"  {i:3d}| {ln[:110]}")
doc.close()
