#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r316 probe5 — ساختار دقیق ص۲۱۵-۲۱۹: شمارش جداکننده‌ها و لنگرها"""
import fitz, re

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
doc = fitz.open(PDF)

for pno in (215, 216, 217, 218, 219):
    page = doc[pno - 1]
    d = page.get_text("dict")
    dashes, anchors, headers = [], [], []
    for blk in d["blocks"]:
        for ln in blk.get("lines", []):
            txt = "".join(sp["text"] for sp in ln["spans"]).strip()
            y = min(sp["bbox"][1] for sp in ln["spans"])
            if re.match(r"^-{10,}$", txt):
                dashes.append(y)
            m = re.match(r"^(\d{1,3})\s*-\s*", txt) or re.match(r"^-\s*\(?([abcd])\)?\s*-?\s*(\d{1,3})$", txt)
            if m and len(txt) < 12:
                anchors.append((y, txt[:20]))
            if "پاسخنامه" in txt or "ترجمه" in txt and len(txt) < 40:
                headers.append((y, txt[:40]))
    print(f"p{pno}: dashes={len(dashes)} anchors={len(anchors)}")
    print(f"   dash y-range: {min(dashes) if dashes else '-'}..{max(dashes) if dashes else '-'}")
    print(f"   headers: {headers[:6]}")
    # شماره‌های دیده‌شده در لنگرها
    nums = []
    for _, t in anchors:
        m = re.search(r"(\d{1,3})", t)
        if m: nums.append(int(m.group(1)))
    print(f"   anchor nums: {sorted(set(nums))[:30]}{'...' if len(set(nums))>30 else ''}")
