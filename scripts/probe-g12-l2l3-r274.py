#!/usr/bin/env python3
"""probe-g12-l2l3-r274.py — کاوش ساختار c14/c15 و صفحات PDF درس ۲/۳ (پیش‌نیاز پارسر r274)"""
import fitz, json, re

ROOT = "/home/z/my-project"
PDF = f"{ROOT}/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
G12 = f"{ROOT}/public/jozve/g12.json"

g12 = json.load(open(G12))
ch_by_id = {c["id"]: c for c in g12["chapters"]}

for cid in ("c14", "c15"):
    ch = ch_by_id[cid]
    print(f"=== {cid}: {len(ch['sections'])} sections ===")
    for i, s in enumerate(ch["sections"]):
        head = " / ".join(s["lines"][:2])[:110] if s["lines"] else "(empty)"
        print(f"  sec{i} ({len(s['lines'])} lines): {head}")

doc = fitz.open(PDF)
for label, p0 in (("L2", 73), ("L3", 131)):
    print(f"\n=== PDF page {p0+1} ({label}) first 25 lines ===")
    for ln in doc[p0].get_text("text").splitlines()[:25]:
        print(f"  |{ln}")
