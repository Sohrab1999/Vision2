#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r400 — پروبِ قسطِ سومِ مخزنِ تایپیِ نهایی‌ها: ۵۱ ردیفِ «پاسخِ مدل».
برای هر برگه، صفحاتِ سکشنِ هدف + صفحاتِ کلید را از لایهٔ متنیِ
booklet-extract/g12.txt به /tmp/qa-r400/ می‌ریزد و ردیف‌های شماره‌دارِ
هدف (stems) و ردیف‌های کلید را چاپ می‌کند. فقط خواندنی.
"""
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
LAYER = ROOT / "booklet-extract/g12.txt"
OUT = Path("/tmp/qa-r400")
OUT.mkdir(parents=True, exist_ok=True)

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


# (برچسب، صفحاتِ آزمون، صفحاتِ کلید، ردیف‌های هدف — شمارهٔ چاپِ خودِ برگه)
PAPERS = [
    ("r380-khordad1402",   range(336, 341), [341, 342], [43, 44, 47, 48]),
    ("r381-shahrivar1401", range(343, 348), [348, 349], [39, 45, 46, 47, 52, 57, 58]),
    ("r382-dey1400",       range(329, 334), [334, 335], [40, 43, 44, 47, 48]),
    ("r383-shahrivar1400", range(322, 327), [327, 328], [40, 47, 48]),
    ("r384-khordad1400h",  range(315, 320), [320, 321], [34, 38, 42, 43]),
    ("r385-khordad1400m",  range(308, 313), [313, 314], [34, 43]),
    ("r386-dey1399",       range(301, 306), [306, 307], [44, 45, 50, 51]),
    ("r387-shahrivar1399", range(285, 291), [291, 292], [43, 44]),
    ("r390-dey1397",       range(229, 234), [234, 235, 236], [37, 38, 55, 56, 57, 60]),
    ("r391-khordad1398",   range(237, 242), [242, 243], [35, 36, 48, 49, 53, 54, 55]),
    ("r392-shahrivar1398", range(244, 249), [249, 250], [49]),
    ("r393-dey1398",       range(251, 257), [257, 258], [1, 2, 3, 4, 5, 6]),
]

item_re = re.compile(r"^\s*(\d{1,2})[\.\)]\s+(.{4,})$")
total = 0
for label, exam_pages, key_pages, targets in PAPERS:
    print(f"\n=== {label} — targets {targets} ===")
    for p in exam_pages:
        txt = page_slice(p)
        (OUT / f"{label}-p{p}.txt").write_text("\n".join(txt), encoding="utf-8")
        for l in txt:
            m = item_re.match(l)
            if m and int(m.group(1)) in targets:
                total += 1
                print(f"  p{p} | {m.group(1):>2}. {m.group(2).strip()[:130]}")
    for p in key_pages:
        txt = page_slice(p)
        (OUT / f"{label}-key-p{p}.txt").write_text("\n".join(txt), encoding="utf-8")
    print(f"  [keys dumped: {key_pages}]")
print(f"\nTOTAL targeted stem lines: {total}")
print(f"Dumps under {OUT}")
