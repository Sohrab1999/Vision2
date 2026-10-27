#!/usr/bin/env python3
"""probe-g12-appositives-r283.py — کاوشِ «عبارات الحاق» (Appositives/Connective Phrases)
مسیر اولِ handoff r282: دستگرمی MCQ ص۴۴ (۲۰تستی) + کنکوری ص۴۵ (۱۵تستی) + کلید c13/sec14
"""
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

print("=" * 70)
print("PAGE 43 (tail) + PAGE 44 + PAGE 45 — سرچشمهٔ عبارات الحاق")
print("=" * 70)
for p in (43, 44, 45):
    print(f"\n----- PAGE {p} -----")
    body = [l.rstrip() for l in pages[p].split("\n") if l.strip()]
    for i, l in enumerate(body):
        print(f"{i:3d}| {l[:150]}")

print("\n" + "=" * 70)
print("c13/sec14 و همسایه‌ها — کلید گرید")
print("=" * 70)
g12 = json.load(open(G12))
for ch in g12["chapters"]:
    for i, s in enumerate(ch["sections"]):
        joined = "\n".join(s["lines"])
        if re.search(r"الحاق|appositiv", joined, re.I):
            print(f"\n### {ch['id']}/sec{i} — {len(s['lines'])}L — خط اول: {s['lines'][0][:80] if s['lines'] else ''}")
            for j, l in enumerate(s["lines"][:60]):
                print(f"  {j:3d}| {l[:130]}")
