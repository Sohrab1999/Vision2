#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r316 probe2 — ساختار کامل ص۲۱۵-۲۱۹ + تطبیق با مانیفست"""
import fitz, re, json

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
doc = fitz.open(PDF)
for pno in range(214, 219):
    page = doc[pno]
    text = page.get_text("text")
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    print(f"\n=========== PAGE {pno+1} ({len(lines)} lines) ===========")
    for l in lines[:45]:
        print("  ", l[:110])

# مانیفست: بانک‌های واژگان ~۱۰۰ آیتمی
m = json.load(open("/home/z/my-project/public/jozve/grammar-g12-topic.json"))
print("\n\n=== MANIFEST vocab-ish banks (>=80 items) ===")
for les in m["lessons"]:
    qs = les.get("questions", [])
    if len(qs) >= 80:
        types = {}
        for q in qs:
            types[q.get("type")] = types.get(q.get("type"), 0) + 1
        print(f"  l{les['lesson']}: {les['title'][:60]} -> {len(qs)} items {types}")
