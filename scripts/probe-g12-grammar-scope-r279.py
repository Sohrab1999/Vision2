#!/usr/bin/env python3
"""probe-g12-grammar-scope-r279.py — نقشهٔ کامل خانوادهٔ «آزمون تشریحی گرامر و نگارش» دوازدهم

سه‌سویه:
  ۱) سؤال‌ها: صفحه‌های g12.txt با اجرهای «N.» (ساقه) + گزینه‌ها
  ۲) کلیدها: بلوک‌های «پاسخنامه تستهای گرامر» در g12.json (c13/c14/c15) با شمارش «-Nگزینه»
  ۳) ترجمه‌ها: سکشن‌های «ترجمه تست :» / «ترجمه :»
خروجی: نقشهٔ درس‌به‌درس (بازهٔ سؤال، صفحهٔ PDF، تعداد کلید، تعداد ترجمه)
"""
import json
import re

ROOT = "/home/z/my-project"
TXT = f"{ROOT}/booklet-extract/g12.txt"
G12 = f"{ROOT}/public/jozve/g12.json"

# ---------- ۱) متن صفحه‌بندی‌شده ----------
raw = open(TXT, encoding="utf-8").read()
pages = {}
for m in re.finditer(r"<<<PAGE (\d+)>>>\n", raw):
    start = m.end()
    nxt = re.search(r"<<<PAGE \d+>>>\n", raw[start:])
    end = start + nxt.start() if nxt else len(raw)
    pages[int(m.group(1))] = raw[start:end]

NUM_DOT = re.compile(r"(?<![\d.])(\d{1,3})\s*\.\s+(?=[A-Za-z'\"(])")
NUM_DASH = re.compile(r"(?<![\d-])(\d{1,3})\s*-\s+(?=[A-Za-z'\"(])")

print("== ۱) اجرهای سؤال در صفحه‌ها (هر دو جداکنندهٔ N. و N-) ==")
for p in range(28, 260):
    t = pages.get(p, "")
    if not t:
        continue
    if not re.search(r"گرامر|گرامری", t):
        continue
    nums_dot = [int(n) for n in NUM_DOT.findall(t)]
    nums_dash = [int(n) for n in NUM_DASH.findall(t)]
    tag = []
    if nums_dot:
        tag.append(f"dot {min(nums_dot)}..{max(nums_dot)} n={len(set(nums_dot))}")
    if nums_dash:
        tag.append(f"dash {min(nums_dash)}..{max(nums_dash)} n={len(set(nums_dash))}")
    if tag:
        print(f"  p{p:3d}: {' | '.join(tag)}")

# ---------- ۲) کلیدها در g12.json ----------
print("\n== ۲) بلوک‌های «پاسخنامه تستهای گرامر» در g12.json ==")
g12 = json.load(open(G12))
KEYH = re.compile(r"پاسخنامه\s*(?:تستهای|تست‌های)?\s*گرامر")
KITEM = re.compile(r"(?:^|[\s‌-])-(\d{1,3})\s*گزینه\s*\(\s*\)?\s*([a-d])\s*\)?")
for ch in g12["chapters"]:
    if ch["id"] not in ("c13", "c14", "c15"):
        continue
    for i, s in enumerate(ch["sections"]):
        joined = "\n".join(s["lines"])
        if not KEYH.search(joined):
            continue
        items = KITEM.findall(joined)
        uniq = {}
        for n, l in items:
            uniq.setdefault(int(n), l)
        rng = f"{min(uniq)}..{max(uniq)}" if uniq else "-"
        print(f"  {ch['id']}/sec{i:2d} ({len(s['lines']):3d}L): keys={len(uniq)} {rng} | {s['lines'][0][:60]}")

# ---------- ۳) ترجمه‌ها ----------
print("\n== ۳) سکشن‌های ترجمهٔ گرامر (ترجمه تست / ترجمه :) ==")
for ch in g12["chapters"]:
    if ch["id"] not in ("c13", "c14", "c15"):
        continue
    tr_secs = []
    for i, s in enumerate(ch["sections"]):
        first = s["lines"][0] if s["lines"] else ""
        if re.match(r"^ترجمه(?:\s*تست)?\s*[:：]", first.strip()):
            tr_secs.append(i)
    print(f"  {ch['id']}: {len(tr_secs)} sec ترجمه → {tr_secs}")
