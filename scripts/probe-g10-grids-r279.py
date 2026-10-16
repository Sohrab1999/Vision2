#!/usr/bin/env python3
"""probe-g10-grids-r279.py — جست‌وجوی گریدهای کلید در c17..c20 گ دهم + نگاشت به بخش‌های بی‌کلید ۶۸۳تایی

می‌داند از r273: ۶۸۳ سؤالِ بخش‌های کنکوری دهم کلیدِ گرید دارند. این پروب:
  ۱) همهٔ گریدهای (عدد،حرف) در هر سکشن c17-c20 را با لنگر «پاسخنامه» می‌یابد
  ۲) رده‌بندی گریدها: واژگانی (۱..۱۰۰ و…) در برابر کنکوری
  ۳) همچنین سرنخ‌های «پاسخنامه» بدون گرید (توضیحی)
"""
import json
import re

ROOT = "/home/z/my-project"
g10 = json.load(open(f"{ROOT}/public/jozve/g10.json"))

GRID = re.compile(r"(?<![A-Za-z\d])(\d{1,3})\s+([a-d])(?![A-Za-z])")
ANCHOR = re.compile(r"پاسخنامه|کلید")

print("== گریدهای (عدد،حرف) در سکشن‌های c16..c20 ==")
for ch in g10["chapters"]:
    if ch["id"] not in ("c16", "c17", "c18", "c19", "c20"):
        continue
    for i, s in enumerate(ch["sections"]):
        joined = " ".join(s["lines"])
        pairs = GRID.findall(joined)
        uniq = {}
        for n, l in pairs:
            uniq.setdefault(int(n), l)
        has_anchor = bool(ANCHOR.search(joined))
        if len(uniq) >= 10:
            print(f"  {ch['id']}/sec{i:2d} ({len(s['lines']):3d}L): GRID {min(uniq)}..{max(uniq)} uniq={len(uniq)} anchor={has_anchor} | {s['lines'][0][:55]}")
        elif has_anchor and len(uniq) >= 4:
            print(f"  {ch['id']}/sec{i:2d} ({len(s['lines']):3d}L): small-grid {min(uniq)}..{max(uniq)} uniq={len(uniq)} | {s['lines'][0][:55]}")

print("\n== سرنخ‌های «پاسخنامه تستهای گرامر/کنکوری» بدون گرید بزرگ ==")
K2 = re.compile(r"پاسخنامه\s*(?:تستهای\s*)?(?:گرامر|کنکوری|تست)")
for ch in g10["chapters"]:
    if ch["id"] not in ("c16", "c17", "c18", "c19", "c20"):
        continue
    for i, s in enumerate(ch["sections"]):
        joined = "\n".join(s["lines"])
        m = K2.search(joined)
        if m:
            print(f"  {ch['id']}/sec{i:2d}: «{s['lines'][0][:70]}»")
