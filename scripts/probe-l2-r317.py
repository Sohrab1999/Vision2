#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r317 — پروبِ ساختاریِ «پاسخنامه کلیدی و ترجمهٔ ۱۰۰ تست واژگان درس دوم» ص۱۹۸-۲۰۲."""
import re
import fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
PAGES = (198, 199, 200, 201, 202)

doc = fitz.open(PDF)
for pno in PAGES:
    page = doc[pno - 1]
    dd = page.get_text("dict")
    print(f"===== PDF page {pno} (W={page.rect.width:.0f} H={page.rect.height:.0f}) =====")
    dashes = []
    for blk in dd["blocks"]:
        for ln in blk.get("lines", []):
            txt = "".join(sp["text"] for sp in ln["spans"]).strip()
            y = min(sp["bbox"][1] for sp in ln["spans"])
            if re.match(r"^-{6,}$", txt.replace(" ", "")):
                dashes.append(y)
    dashes.sort()
    print("  dashes y:", [f"{d:.0f}" for d in dashes])
    # last 6 lines of page (bottom content)
    lines = []
    for blk in dd["blocks"]:
        for ln in blk.get("lines", []):
            txt = "".join(sp["text"] for sp in ln["spans"]).strip()
            y = min(sp["bbox"][1] for sp in ln["spans"])
            lines.append((y, txt))
    lines.sort()
    print("  last 4 lines:")
    for y, t in lines[-4:]:
        print(f"    y={y:.0f}: {t[:90]}")
