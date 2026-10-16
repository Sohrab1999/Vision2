#!/usr/bin/env python3
"""probe-g12-passive-r284.py — کاوشِ «معلوم و مجهول» ص۳۶-۳۸ + هویتِ گرید c13/sec1
مسیر اولِ handoff r283: ۲۰ تست بخش اول (ص۳۶) + ۴۰ تست بخش دوم (ص۳۷-۳۸)؛
کلید بخش دوم = گرید ۴۰کلیدی ص۱۸۷ (کشف r283)؛ کلید بخش اول = ؟ (احتمالاً توضیحی ص۱۸۵-۱۸۶ یا گرید c13/sec1)"""
import json
import re

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

for p in (36, 37, 38):
    print(f"\n----- PAGE {p} -----")
    body = [l.rstrip() for l in pages[p].split("\n") if l.strip()]
    for i, l in enumerate(body):
        print(f"{i:3d}| {l[:150]}")

print("\n" + "=" * 70)
print("c13/sec1 — گرید ۱۰۰کلیدی (اعتبارسنجی هویت)")
print("=" * 70)
g12 = json.load(open(G12))
ch13 = next(c for c in g12["chapters"] if c["id"] == "c13")
s1 = ch13["sections"][1]
print(f"c13/sec1 — {len(s1['lines'])}L")
for j, l in enumerate(s1["lines"][:70]):
    print(f"  {j:3d}| {l[:130]}")

print("\n----- PAGE 185 (کلید توضیحی بخش اول؟ آیتم‌های ۱-۱۰) -----")
body = [l.rstrip() for l in pages[185].split("\n") if l.strip()]
for i, l in enumerate(body[:80]):
    print(f"{i:3d}| {l[:140]}")
