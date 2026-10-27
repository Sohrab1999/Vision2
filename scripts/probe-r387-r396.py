#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r396 — پروبِ برگهٔ r387 (شهریور ۱۳۹۹، ص۲۸۵-۲۹۲): سکشنِ جمله‌سازی (ق۵۹-۶۲) و کلیدِ چاپی.
فقط خواندنی — دامپ به /tmp/qa-r395/."""
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
LAYER = ROOT / "booklet-extract/g12.txt"

layer = LAYER.read_text(encoding="utf-8").split("\n")
PM = {}
for i, l in enumerate(layer):
    m = re.match(r"<<<PAGE (\d+)>>>", l)
    if m:
        PM[int(m.group(1))] = i


def page_slice(p: int) -> list[str]:
    s = PM[p]
    e = next((v for q, v in sorted(PM.items()) if q > p), len(layer))
    return [x for x in layer[s:e] if not x.startswith("<<<PAGE")]


for p in range(285, 293):
    txt = page_slice(p)
    (Path("/tmp/qa-r395") / f"r387-shahrivar1399-p{p}.txt").write_text("\n".join(txt), encoding="utf-8")

# نمایهٔ ردیف‌های شماره‌دارِ صفحاتِ سؤال
for p in (289, 290):
    print(f"--- p{p} ---")
    for l in page_slice(p):
        m = re.match(r"^\s*(\d{1,2})[\.\)]\s+(.{4,})$", l)
        if m and 55 <= int(m.group(1)) <= 66:
            print(f"  {m.group(1)}. {m.group(2).strip()[:120]}")
print("--- key p291/p292 rows 59-62 ---")
for p in (291, 292):
    for l in page_slice(p):
        if re.match(r"^\s*5[9]|^\s*6[0-2]", l) and len(l.strip()) > 12:
            print(f"  p{p}: {l.strip()[:130]}")
