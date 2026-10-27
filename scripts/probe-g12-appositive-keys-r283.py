#!/usr/bin/env python3
"""probe-g12-appositive-keys-r283.py — یافتن کلیدهای عبارات الحاق (ص۱۸۷ و ص۱۸۹-۱۹۱)"""
import re

ROOT = "/home/z/my-project"
TXT = f"{ROOT}/booklet-extract/g12.txt"

raw = open(TXT, encoding="utf-8").read()
pages = {}
for m in re.finditer(r"<<<PAGE (\d+)>>>\n", raw):
    start = m.end()
    nxt = re.search(r"<<<PAGE \d+>>>\n", raw[start:])
    end = start + nxt.start() if nxt else len(raw)
    pages[int(m.group(1))] = raw[start:end]

for p in (186, 187, 188, 189, 190, 191, 192):
    if p not in pages:
        print(f"PAGE {p}: MISSING")
        continue
    print(f"\n----- PAGE {p} -----")
    body = [l.rstrip() for l in pages[p].split("\n") if l.strip()]
    for i, l in enumerate(body):
        print(f"{i:3d}| {l[:150]}")

# همچنین در JSON: هر سکشنی که «۱۸۷» یا «۱۸۹» + پاسخنامه دارد
import json
g12 = json.load(open(f"{ROOT}/public/jozve/g12.json"))
print("\n" + "=" * 70)
print("SECTIONS mentioning الحاق near پاسخنامه")
print("=" * 70)
for ch in g12["chapters"]:
    for i, s in enumerate(ch["sections"]):
        joined = "\n".join(s["lines"])
        if re.search(r"الحاق", joined) and re.search(r"پاسخنامه|پاسخ نام|پاس خنامه", joined):
            print(f"\n### {ch['id']}/sec{i} — {len(s['lines'])}L")
            for j, l in enumerate(s["lines"][:45]):
                print(f"  {j:3d}| {l[:130]}")
