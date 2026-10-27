# -*- coding: utf-8 -*-
# r376c — داوری نهایی: جدول واژگان درس سوم (ص۳۰-۳۳) + همهٔ تکرارهای tea/type/speak English + ص۴۱/۴۲ کامل + لنگرهای بیماری
import re
from pathlib import Path

LAYER = Path("/home/z/my-project/booklet-extract/g8.txt").read_text(encoding="utf-8").split("\n")
PM = {}
for i, l in enumerate(LAYER):
    m = re.match(r"<<<PAGE (\d+)>>>", l)
    if m: PM[int(m.group(1))] = i

def page_lines(p):
    start = PM[p]
    end = next((v for q, v in sorted(PM.items()) if q > p), len(LAYER))
    return LAYER[start:end]

def dump(p, lo=0, hi=None, tag=None):
    print(f"\n=== LAYER p{p}{' ' + tag if tag else ''} ===")
    for l in page_lines(p)[lo:hi]:
        if l.strip():
            print(l.rstrip()[:170])

# ۱) همهٔ تکرارهای کلیدواژه‌ها در کل جزوه تا ص۳۵ (شماره صفحه همراه)
print("=== ALL OCCURRENCES (p1-35) ===")
for pat in [r"make tea", r"\btea\b", r"type fast", r"\btype\b", r"speak English",
            r"do a puzzle", r"play tennis", r"search", r"web", r"Web", r"read a book",
            r"good at", r"\bcook\b", r"cooking"]:
    hits = []
    for p in range(1, 36):
        for l in page_lines(p):
            if re.search(pat, l) and "PAGE" not in l:
                hits.append(f"p{p}: {l.strip()[:110]}")
    print(f"  [{pat}] {len(hits)} hits")
    for h in hits[:6]:
        print(f"      {h}")

# ۲) جدول واژگان درس سوم (کدام صفحه؟) — ص۳۰-۳۳ کامل
dump(30, tag="(درس سوم — واژگان؟)")
dump(31, tag="(درس سوم — واژگان؟)")

# ۳) ص۴۱ و ۴۲ کامل (درس چهارم)
dump(41, tag="(درس چهارم کامل)")
dump(42, tag="(مرز پایینی)")
