#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r396 — ترمیمِ ۱۰ فایلِ گاردِ قالبِ A/C که رجکسِ patch-guards-r396.py خراب کرد:
«…, 6, 22], 18],» → «…, 6, 22, 18],» (درجِ ۱۸ پیش از براکتِ بسته، نه پس از آن).
ادعا: دقیقاً یک رخداد از الگویِ خراب در هر فایل؛ پس از ترمیم، آرایه باید با «22, 18],» بسته شود.
"""
from pathlib import Path

ROOT = Path("/home/z/my-project/tests")
FILES_A_C = [
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
]

BROKEN = "2, 6, 6, 4, 6, 22], 18],"
FIXED = "2, 6, 6, 4, 6, 22, 18],"

for name in FILES_A_C:
    p = ROOT / name
    txt = p.read_text(encoding="utf-8")
    n_broken = txt.count(BROKEN)
    n_fixed = txt.count(FIXED)
    if n_fixed == 1 and n_broken == 0:
        print(f"{name}: already repaired — NO-OP")
        continue
    assert n_broken == 1, f"{name}: broken pattern x{n_broken} — expected exactly 1"
    txt = txt.replace(BROKEN, FIXED)
    assert txt.count(FIXED) == 1
    p.write_text(txt, encoding="utf-8")
    print(f"{name}: repaired OK")
