#!/usr/bin/env python3
"""probe-g12-tenses-r281.py — نقشهٔ کامل خانوادهٔ «تستهای مرور زمانها» دوازدهم
صفحات 141-147 + همهٔ بلوک‌های کلیدِ مرور زمان‌ها در g12.json (همهٔ فصل‌ها)
"""
import re
import json

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

SKIP = re.compile(
    r"^\s*(\d+\s*"
    r"|\"?جزوه\s*"
    r"|جام ــع.*|جامع.*"
    r"|زبان انگل.*"
    r"|پایه دو ازدهم.*|پایه دوازدهم.*"
    r"|“Vision Three”.*|\"Vision Three\".*"
    r"|تألیـــف.*|تألیف.*"
    r"|\"جمـــــال.*|جمال احمدی.*|همکاران\"?.*"
    r")\s*$"
)

def body(p):
    return [l.strip() for l in pages.get(p, "").split("\n") if l.strip() and not SKIP.match(l.strip())]

print("== ۱) صفحات 141-147 ==")
for p in range(141, 148):
    lines = body(p)
    print(f"--- p{p} ({len(lines)}L) ---")
    for l in lines[:10]:
        print("    |", l[:100])
    print()

print("== ۲) بلوک‌های کلید «مرور زمان» در g12.json ==")
g12 = json.load(open(G12))
GRID_PAIR = re.compile(r"(?<![\w])(\d{1,3})\s+([a-d])(?=\s|$)")
for ch in g12["chapters"]:
    for i, s in enumerate(ch["sections"]):
        joined = "\n".join(s["lines"])
        if not re.search(r"مرور\s*زمان", joined):
            continue
        pairs = {}
        for l in s["lines"]:
            for n, c in GRID_PAIR.findall(l):
                pairs.setdefault(int(n), c)
        title = next((l for l in s["lines"] if "مرور" in l), s["lines"][0] if s["lines"] else "")
        rng = f"{min(pairs)}..{max(pairs)}" if pairs else "-"
        print(f"  {ch['id']}/sec{i:2d} ({len(s['lines']):3d}L): pairs={len(pairs)} {rng} | {title[:80]}")
