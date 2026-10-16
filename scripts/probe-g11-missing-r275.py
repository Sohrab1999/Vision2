#!/usr/bin/env python3
"""probe-g11-missing-r275.py — کالبدشکافی Q40 درس ۲ و Q37-39 درس ۳ یازدهم"""
import fitz, json, re

ROOT = "/home/z/my-project"
doc = fitz.open(f"{ROOT}/upload/جزوه جامع یازدهم .pdf")

print("=== page 58 (0-idx 57) last 25 lines ===")
for ln in doc[57].get_text("text").splitlines()[-25:]:
    print(f"  |{ln[:125]}")

print("\n=== page 92 (0-idx 91) lines 20-60 ===")
for ln in doc[91].get_text("text").splitlines()[20:60]:
    print(f"  |{ln[:125]}")

g11 = json.load(open(f"{ROOT}/public/jozve/g11.json"))
s0 = next(c for c in g11["chapters"] if c["id"] == "c13")["sections"][0]["lines"]
TR = re.compile(r"^[\s\u0600-\u06FF(){}.'\"«»،:؛-]*\.?(\d{1,3})\s*گزینه\s*\(\s*\)?\s*([a-d])\s*\)?\s*(?:ترجمه\s*تست\s*[:：]?)?\s*(.*)$")
print("\n=== c13 sec0 hits for 39/40 ===")
for i, ln in enumerate(s0):
    m = TR.match(ln.strip())
    if m and m.group(1) in ("39", "40"):
        print(f"  {i}: |{ln.strip()[:110]}")
