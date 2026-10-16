#!/usr/bin/env python3
"""probe-g11-grammar-r276.py — پروب ساختار بانک‌های گرامر جزوهٔ یازدهم
هدف: صفحات سؤال‌های گرامر (۳۶-۳۹ / ۷۰-۷۳ / ۱۰۵-۱۰۸) + شبکه‌های کلید چاپی
(sec12/sec14/sec29 طبق یادداشت r275) — قبل از نوشتن پارسر اصلی r276.
"""
import json
import re

ROOT = "/home/z/my-project"
PDF = f"{ROOT}/upload/جزوه جامع یازدهم .pdf"
G11 = f"{ROOT}/public/jozve/g11.json"

g11 = json.load(open(G11))
print("== chapters ==")
for c in g11["chapters"]:
    secs = [s["type"] for s in c["sections"]]
    print(f"  {c['id']}: {c['title'][:60]} | {len(c['sections'])} sections | zone={c.get('zone','')}")

import fitz
doc = fitz.open(PDF)
print(f"\n== PDF pages: {len(doc)} ==")

# صفحات سؤال گرامر — نمونهٔ اول
for pno in (35, 36, 37):
    txt = doc[pno].get_text("text")
    lines = [l.strip() for l in txt.splitlines() if l.strip()][:18]
    print(f"\n-- page idx {pno} (physical {pno+1}) first lines --")
    for l in lines[:14]:
        print("   ", l[:100])
