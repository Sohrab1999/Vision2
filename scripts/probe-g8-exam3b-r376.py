# -*- coding: utf-8 -*-
# r376b — داوری: لایهٔ درس سوم (ص۲۹-۳۴: لنگرهای اصطلاحی/واژگانی) + ص۳۶-۳۷ (مرز) + ص۴۱ کامل + ص۴۲-۴۳ (درس چهارم)
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
    lines = page_lines(p)[lo:hi]
    for l in lines:
        if l.strip():
            print(l.rstrip()[:160])

# لایهٔ درس سوم: لنگرهای اصطلاح (tennis/web/tea/book) و افعال (do puzzle/speak/cook/type)
print("=== ANCHOR SEARCH lesson-3 zone (p29-34) ===")
zone = "\n".join(sum((page_lines(p) for p in range(29, 35)), []))
for pat in [r"play tennis", r"tennis", r"surf", r"web", r"make tea", r"tea", r"read", r"book",
            r"do a puzzle", r"puzzle", r"speak", r"cook", r"type", r"ride", r"horse", r"picture", r"draw"]:
    for m in re.finditer(rf"^.*{pat}.*$", zone, re.MULTILINE | re.IGNORECASE):
        line = m.group(0).strip()[:150]
        if line and "PAGE" not in line and "35" not in line[:6]:
            print(f"  [{pat}] {line}")
        break  # فقط نخستین تکرار هر الگو

dump(36, tag="(بعد از خانوادهٔ سوم)")
dump(37, tag="(واژگان درس چهارم؟)")
dump(41, tag="(درس چهارم کامل)")
dump(42, tag="(درس چهارم ادامه/مرز)")
