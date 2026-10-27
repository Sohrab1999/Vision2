#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r400 — یافتنِ همهٔ رشته‌هایِ نشت‌سنجِ برگه‌ها که بانکِ l144 به‌طورِ مشروع مصرف کرده.
الگویِ Solar power: هر رشته با بانکِ تایپیِ جدید مشروع می‌شود و از فهرستِ forbidden
حذف (با نشانِ R400-LEGIT مستند) می‌گردد. فقط گزارش — تغییری نمی‌دهد.
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
bank = json.loads((ROOT / "public/jozve/tests-g12.json").read_text(encoding="utf-8"))
l144 = next(l for l in bank["lessons"] if l["lesson"] == 144)
stems = [q["question"] for q in l144["questions"]]
opts = [o for q in l144["questions"] for o in q["options"]]
haystacks = stems + opts

FILES = [
    "jozve-tests-g12-nahaie-r380.test.ts",
    "jozve-tests-g12-shahrivar-r381.test.ts",
    "jozve-tests-g12-dey-r382.test.ts",
    "jozve-tests-g12-shahrivar1400-r383.test.ts",
    "jozve-tests-g12-khordad1400-r384.test.ts",
    "jozve-tests-g12-khordad1400m-r385.test.ts",
    "jozve-tests-g12-dey1399-r386.test.ts",
    "jozve-tests-g12-shahrivar1399-r387.test.ts",
    "jozve-tests-g12-khordad1399m-r388.test.ts",
    "jozve-tests-g12-khordad1399h-r389.test.ts",
    "jozve-tests-g12-dey1397-r390.test.ts",
    "jozve-tests-g12-khordad1398-r391.test.ts",
    "jozve-tests-g12-shahrivar1398-r392.test.ts",
    "jozve-tests-g12-dey1398-r393.test.ts",
    "jozve-tests-g12-khordad1399kharej-r394.test.ts",
]

# همهٔ رشته‌های دابل‌کوتیشنِ درونِ بلوکِ forbidden (دو سبک: «forbidden of [» و «const forbidden = [»)
STR_RE = re.compile(r'"((?:[^"\\]|\\.)+)"')
total = 0
for name in FILES:
    txt = (ROOT / "tests" / name).read_text(encoding="utf-8")
    blocks = re.findall(r"forbidden (?:of |= )\[.*?\]", txt, re.S)
    trips = []
    for blk in blocks:
        for m in STR_RE.finditer(blk):
            s = m.group(1)
            if s.startswith("//") or len(s) < 6:
                continue
            if any(s in h for h in haystacks):
                trips.append(s)
    if trips:
        total += len(trips)
        print(f"=== {name}: {len(trips)} trips")
        for t in trips:
            print(f"   {t!r}")
print(f"\nTOTAL trips: {total}")
