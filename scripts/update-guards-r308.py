#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r308 — به‌روزرسانی گاردهای قدیمی پس از الحاق ۱۸ بانکِ «آزمون جامع ۳۶۰» به tests-g11.json
فقط دو گاردِ r275 و r278 فهرستِ درس‌های tests-g11 را قفل کرده بودند — الگوی additive r304-r307."""
from pathlib import Path
import re

ROOT = Path("/home/z/my-project")
EXTEND = (
    "// r308 — ۱۸ بانکِ «آزمون جامع ۳۶۰ واژگان» (درس ۶..۲۳) الحاق شد؛ بانکِ ۱۲ (درس ۱۷) ۲۱تستی است\n"
    "    ...Array.from({ length: 18 }, (_, i) => i + 6),"
)

def patch(path: Path, subs: list[tuple[str, str]]):
    src = path.read_text(encoding="utf-8")
    for old, new in subs:
        if old not in src:
            raise SystemExit(f"{path.name}: pattern not found: {old[:70]!r}")
        src = src.replace(old, new, 1)
    path.write_text(src, encoding="utf-8")
    print(f"patched {path.name}")

# ۱) g275 — شکلِ پنج‌درسه → بیست‌وسه‌درسه
patch(ROOT / "tests/jozve-test-bank-g11-r275.test.ts", [
    (
        "expect(bank.lessons.map((l) => l.lesson)).toEqual([1, 2, 3, 4, 5]);",
        "expect(bank.lessons.map((l) => l.lesson)).toEqual([\n      1, 2, 3, 4, 5,\n      " + EXTEND + "\n    ]);",
    ),
])

# ۲) r278 — شکل + طولِ کل
patch(ROOT / "tests/jozve-supplementary-g11-r278.test.ts", [
    (
        "expect(bank.lessons.map((l) => l.lesson)).toEqual([1, 2, 3, 4, 5]);",
        "expect(bank.lessons.map((l) => l.lesson)).toEqual([\n      1, 2, 3, 4, 5,\n      " + EXTEND + "\n    ]);",
    ),
    (
        "expect(all).toHaveLength(40 + 40 + 40 + 22 + 20);",
        "expect(all).toHaveLength(40 + 40 + 40 + 22 + 20 + 361); // +۳۶۱: جامع ۳۶۰ (r308) — با دو «۲۲۸» چاپی",
    ),
])

print("update-guards-r308: done")
