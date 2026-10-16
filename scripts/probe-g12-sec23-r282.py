#!/usr/bin/env python3
"""probe-g12-sec23-r282.py — نقشهٔ سه گرید باقی‌ماندهٔ sec23 + صفحات ۱۴۹-۱۵۲

handoff r281: «سه گریدِ تازه‌کشف‌شدهٔ sec23 (۲۰تست افعال ناقص ص۱۴۹ + ۲۰تست
معلوم/مجهول ص۱۵۰ + ۴۰تست افعال ناقص تخصصی ص۱۵۱-۱۵۲ = ۸۰ تست با کلید گرید —
سؤال‌ها باید در صفحات متن پیدا شوند)».
"""
import json, re

ROOT = "/home/z/my-project"
TXT = f"{ROOT}/booklet-extract/g12.txt"
G12 = f"{ROOT}/public/jozve/g12.json"

raw = open(TXT, encoding="utf-8").read()
pages = {}
for m in re.finditer(r"<<<PAGE (\d+)>>>\n", raw):
    start = m.end()
    nxt = re.search(r"<<<PAGE \d+>>>\n", raw[start:])
    end = start + nxt.start() if nxt else len(raw)
    pages[int(m.group(1))] = raw[start:end]

g12 = json.load(open(G12))
c15 = g12["chapters"][14]["sections"]
sec23 = c15[23]["lines"]
print("=== c15/sec23: ALL lines with numbering ===")
for i, l in enumerate(sec23):
    print(f"{i:3d}| {l[:110]}")

print("\n=== PAGE 149 body ===")
for l in pages[149].split("\n"):
    if l.strip():
        print("  ", l.strip()[:110])
print("\n=== PAGE 150 body ===")
for l in pages[150].split("\n"):
    if l.strip():
        print("  ", l.strip()[:110])
print("\n=== PAGE 151 body (first 40 non-empty) ===")
cnt = 0
for l in pages[151].split("\n"):
    if l.strip():
        print("  ", l.strip()[:110]); cnt += 1
        if cnt >= 40: break
print("\n=== PAGE 152 body (first 40 non-empty) ===")
cnt = 0
for l in pages[152].split("\n"):
    if l.strip():
        print("  ", l.strip()[:110]); cnt += 1
        if cnt >= 40: break
