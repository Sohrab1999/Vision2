#!/usr/bin/env python3
"""probe-g12-missing-tr-r274.py — اصالت‌سنجی ترجمه‌های غایب c15 + متن کامل Q65"""
import json, re

ROOT = "/home/z/my-project"
g12 = json.load(open(f"{ROOT}/public/jozve/g12.json"))
ch = {c["id"]: c for c in g12["chapters"]}

MISS_L3 = [5, 10, 20, 28, 29, 33, 43, 53, 55, 68, 77, 83]
s0 = ch["c15"]["sections"][0]["lines"]
print(f"c15 sec0: {len(s0)} lines — جست‌وجوی شماره‌های غایب در هر شکلی:")
for want in MISS_L3:
    hits = [ln for ln in s0 if re.search(rf"[-(\[]\s*{want}\b|{want}\s*[-)\]]", ln)]
    print(f"  #{want}: {'HIT → ' + hits[0][:90] if hits else 'REAL-ABSENT'}")

print("\nQ65 translation full text (from sec0 of c15):")
for i, ln in enumerate(s0):
    m = re.match(r"^[\s\u0600-\u06FF(){}\[\]\"'«»]*([a-d])[\s()\[\]]*-\s*65\s*(.*)$", ln.strip())
    if m:
        print(f"  line {i}: |{ln.strip()}")
        for j in range(i + 1, min(i + 3, len(s0))):
            print(f"    cont: |{s0[j].strip()[:120]}")

# آیا Q5 درس ۲ (c14) هم واقعاً غایب است؟
s0_14 = ch["c14"]["sections"][0]["lines"]
hits5 = [ln for ln in s0_14 if re.search(r"[-(\[]\s*5\b|\b5\s*[-)\]]", ln)]
print(f"\nc14 sec0 #5: {'HIT → ' + hits5[0][:90] if hits5 else 'REAL-ABSENT'} | sec0 lines: {len(s0_14)}")
