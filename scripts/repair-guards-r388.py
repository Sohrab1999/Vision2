#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ترمیمِ باگِ پچِ r388: «4] 1, 2, …» → «4, 1, 2, …» در خطِ آرایهٔ counts."""
from pathlib import Path

ROOT = Path("/home/z/my-project")
BAD = "] 1, 2, 1, 2, 3, 3, 4, 4, 4, 4, 4, 3],"
GOOD = ", 1, 2, 1, 2, 3, 3, 4, 4, 4, 4, 4, 3],"
for n in ("nahaie-r380", "shahrivar-r381", "dey-r382", "shahrivar1400-r383",
          "khordad1400-r384", "khordad1400m-r385", "dey1399-r386", "shahrivar1399-r387"):
    p = ROOT / f"tests/jozve-tests-g12-{n}.test.ts"
    src = p.read_text(encoding="utf-8")
    if BAD in src:
        p.write_text(src.replace(BAD, GOOD), encoding="utf-8")
        print(f"repaired: {n}")
    elif GOOD in src:
        print(f"already-ok: {n}")
    else:
        print(f"NOT-FOUND: {n}")
