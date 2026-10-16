#!/usr/bin/env python3
"""probe-g11-keys-r275.py — ساختار کلید/ترجمهٔ c12/c13/c11 جزوهٔ یازدهم"""
import fitz, json, re

ROOT = "/home/z/my-project"
G11 = f"{ROOT}/public/jozve/g11.json"
g11 = json.load(open(G11))
ch = {c["id"]: c for c in g11["chapters"]}

# c12: sec12 (شبکهٔ کلید؟) و sec0 (ترجمه‌ها؟)
s12 = ch["c12"]["sections"][12]
print("=== c12 sec12 (90L) first 12 lines ===")
for ln in s12["lines"][:12]:
    print(f"  |{ln[:110]}")
s0 = ch["c12"]["sections"][0]
print("\n=== c12 sec0 (134L) first 10 lines ===")
for ln in s0["lines"][:10]:
    print(f"  |{ln[:110]}")

# c13: sec0 ترجمه‌ها با فرمت «.Nگزینه (X)ترجمه تست»
s0 = ch["c13"]["sections"][0]
print("\n=== c13 sec0 (128L) first 8 lines ===")
for ln in s0["lines"][:8]:
    print(f"  |{ln[:110]}")

# c14: sec0
s0 = ch["c14"]["sections"][0]
print("\n=== c14 sec0 (133L) first 6 lines ===")
for ln in s0["lines"][:6]:
    print(f"  |{ln[:110]}")

# شمارش الگوی ترجمهٔ یازدهم: «.Nگزینه (X)» یا «Nگزینه (X)»
pat = re.compile(r"^\.?\s*(\d{1,3})\s*گزینه\s*\(\s*([a-d])\s*\)\s*ترجمه")
for cid in ("c12", "c13", "c14"):
    s0 = ch[cid]["sections"][0]
    hits = [int(pat.match(l.strip()).group(1)) for l in s0["lines"] if pat.match(l.strip())]
    print(f"{cid} sec0 translation-pattern hits: {len(hits)} | unique {len(set(hits))} | range {min(hits) if hits else '-'}..{max(hits) if hits else '-'}")
