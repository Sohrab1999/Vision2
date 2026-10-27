#!/usr/bin/env python3
"""probe-noblank-r276.py — بازبینی ساقه‌های بدون جاخالی + جست‌وجوی همهٔ گزینه‌های بی‌نقطه"""
import re
import importlib.util

ROOT = "/home/z/my-project"
_spec = importlib.util.spec_from_file_location("p", f"{ROOT}/scripts/jozve-g11-grammar-r276.py")

# اسکن همهٔ سؤال‌های سه بانک برای الگوی «حرفِ بی‌نقطه»
import fitz
doc = fitz.open(PDF := f"{ROOT}/upload/جزوه جامع یازدهم .pdf")

PAGES = {1: range(35, 39), 2: range(69, 73), 3: range(104, 108)}
for les, rng in PAGES.items():
    for pno in rng:
        txt = doc[pno].get_text("text")
        for l in txt.splitlines():
            s = l.strip()
            # خط گزینه که حرف اولش نقطه ندارد اما بقیهٔ خط گزینه‌های نقطه‌دار دارند
            if re.match(r"^[a-d]\s{1,4}\S", s) and re.search(r"\s[b-d]\s*\.", s) and not re.match(r"^[a-d]\s*\.", s):
                print(f"L{les} idx{pno} MISSING-DOT: {s[:110]}")
