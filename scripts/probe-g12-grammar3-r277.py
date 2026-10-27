#!/usr/bin/env python3
"""probe-g12-grammar3-r277.py — dump کامل c13/sec1 + سکشن‌های درس c3 (گرامر درس ۱)"""
import json
import re

ROOT = "/home/z/my-project"
G12 = f"{ROOT}/public/jozve/g12.json"
g12 = json.load(open(G12))

ch = next(c for c in g12["chapters"] if c["id"] == "c13")
s = ch["sections"][1]
print(f"== c13/sec1: {s['title'][:80]} ({len(s['lines'])} lines) ==")
KEYHDR = re.compile(r"پاسخنامه|تستهای گرامر|دستگرمی")
for i, l in enumerate(s["lines"]):
    if KEYHDR.search(l) or re.match(r"^\s*\d{1,3}\s+[a-d]\s+\d{1,3}\s+[a-d]", l):
        print(f"  {i:3d}| {l[:108]}")

print("\n== c3 (درس اول) sections ==")
c3 = next(c for c in g12["chapters"] if c["id"] == "c3")
for si, sec in enumerate(c3["sections"]):
    print(f"  sec{si}: {sec['title'][:75]} ({len(sec['lines'])} lines)")
