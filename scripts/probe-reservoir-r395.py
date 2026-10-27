#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r395 — پروبِ «بانکِ تایپیِ نهایی‌ها — قسمتِ افعال» از مخزنِ ۸۹ ردیفی.
برای هر برگه، صفحاتِ سکشنِ افعالِ تولیدی + صفحاتِ کلید را از لایهٔ متنیِ
booklet-extract/g12.txt به /tmp/qa-r395/ می‌ریزد و یک نمایهٔ فشرده از
ردیف‌های شماره‌دار (stems) و ردیف‌های کلید (NN. answer) چاپ می‌کند.
فقط خواندنی — هیچ فایلِ پروژه را تغییر نمی‌دهد.
"""
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
LAYER = ROOT / "booklet-extract/g12.txt"
OUT = Path("/tmp/qa-r395")
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


# (برچسب، صفحاتِ آزمون، صفحاتِ کلید، سکشنِ هدف)
PAPERS = [
    ("r381-shahrivar1401", range(343, 348), [348, 349], "س۱۰ (۳۵-۳۷) شکلِ فعلِ باز"),
    ("r382-dey1400",       range(329, 334), [334, 335], "س۱۰ شکلِ فعل"),
    ("r383-shahrivar1400", range(322, 327), [327, 328], "س۱۰ شکلِ فعل"),
    ("r384-khordad1400h",  range(315, 320), [320, 321], "س۱۰ شکلِ فعل"),
    ("r385-khordad1400m",  range(308, 313), [313, 314], "س۱۰ شکلِ فعل"),
    ("r386-dey1399",       range(301, 306), [306, 307], "س۱۱ شکلِ فعل"),
    ("r388-deaf",          range(293, 301), [299, 300], "س۶ (۲۱-۲۴) افعال"),
    ("r388m-khordad1399m", range(259, 268), [265, 266, 267], "س۹ (۳۱-۳۴) افعالِ مکالمه"),
    ("r389h-khordad1399h", range(268, 277), [274, 275, 276], "س۸ (۳۰-۳۴) شکلِ فعل"),
]

item_re = re.compile(r"^\s*(\d{1,2})[\.\)]\s+(.{4,})$")
num = 0
for label, exam_pages, key_pages, section in PAPERS:
    print(f"\n=== {label} — {section} ===")
    for p in exam_pages:
        txt = page_slice(p)
        (OUT / f"{label}-p{p}.txt").write_text("\n".join(txt), encoding="utf-8")
        for l in txt:
            m = item_re.match(l)
            if m and int(m.group(1)) <= 67:
                num += 1
                print(f"  p{p} | {m.group(1):>2}. {m.group(2).strip()[:110]}")
    for p in key_pages:
        txt = page_slice(p)
        (OUT / f"{label}-key-p{p}.txt").write_text("\n".join(txt), encoding="utf-8")
    print(f"  [keys dumped: {key_pages}]")
print(f"\nTOTAL numbered-item lines printed: {num}")
print(f"Dumps under {OUT}")
