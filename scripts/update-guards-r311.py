# -*- coding: utf-8 -*-
"""
r311 — به‌روزرسانی گاردهای قدیمیِ خانوادهٔ tests-g11 پس از الحاقِ بانک‌های
«آزمون تشریحی واژگان درس اول» (l25..l28، ۵۷ آیتم):
  • r275: قفلِ فهرستِ درس‌ها  [1..24] → [1..24, 25, 26, 27, 28]
  • r278: همان قفل + جمعِ ۵۴۳ → ۶۰۰
  • r308: جمعِ ۵۴۳ → ۶۰۰
  • r309: جمعِ ۵۴۳ → ۶۰۰
الگوی additive r304..r310 — جراحیِ هدفمند با جایگزینیِ رشتهٔ دقیق.
"""
import re
import sys
from pathlib import Path

ROOT = Path("/home/z/my-project")
T = ROOT / "tests"

OLD_LIST = """      // r309 — واژگان کنکوری درس دوم (ص۵۹) با شناسهٔ ۲۴ الحاق شد
    24,
    ]);"""
NEW_LIST = """      // r309 — واژگان کنکوری درس دوم (ص۵۹) با شناسهٔ ۲۴ الحاق شد
    24,
      // r311 — «آزمون تشریحی واژگان درس اول» (ص۱۶-۱۸، کلید واژه‌ای ص۱۷۶) — l25..l28 الحاق شد
    25, 26, 27, 28,
    ]);"""

OLD_LIST_309 = """      // r309 — واژگان کنکوری درس دوم (ص۵۹) با شناسهٔ ۲۴ (ترتیبِ JSON عددی است؛
      // ترتیبِ نمایشیِ UI با مانیفست ص۵۹ میانِ ص۲۱ و ص۹۳ می‌آید)
      24,
    ]);"""
NEW_LIST_309 = """      // r309 — واژگان کنکوری درس دوم (ص۵۹) با شناسهٔ ۲۴ (ترتیبِ JSON عددی است؛
      // ترتیبِ نمایشیِ UI با مانیفست ص۵۹ میانِ ص۲۱ و ص۹۳ می‌آید)
      24,
      // r311 — «آزمون تشریحی واژگان درس اول» (ص۱۶-۱۸، کلید واژه‌ای ص۱۷۶) — l25..l28 الحاق شد
      25, 26, 27, 28,
    ]);"""

OLD_RANGE = """expect(bank.lessons.map((l) => l.lesson)).toEqual(
      Array.from({ length: 24 }, (_, i) => i + 1)
    );"""
NEW_RANGE = """expect(bank.lessons.map((l) => l.lesson)).toEqual(
      Array.from({ length: 28 }, (_, i) => i + 1) // r311: ۲۴ → ۲۸ با بانک‌های تشریحی l25..l28
    );"""

OLD_SUM = "expect(all).toHaveLength(40 + 40 + 40 + 22 + 20 + 20 + 361)"
NEW_SUM = "expect(all).toHaveLength(40 + 40 + 40 + 22 + 20 + 20 + 361 + 57)"

def patch(path: Path, subs: list[tuple[str, str]]):
    txt = path.read_text(encoding="utf-8")
    for old, new in subs:
        n = txt.count(old)
        if n == 0 and new in txt:
            print(f"already applied: {path.name}: {new[:50]!r}")
            continue
        assert n == 1, f"{path.name}: pattern found {n}x (expected 1): {old[:60]!r}"
        txt = txt.replace(old, new)
    path.write_text(txt, encoding="utf-8")
    print(f"patched: {path.name}")

def main():
    patch(T / "jozve-test-bank-g11-r275.test.ts", [(OLD_LIST, NEW_LIST)])
    patch(T / "jozve-supplementary-g11-r278.test.ts", [(OLD_LIST, NEW_LIST), (OLD_SUM, NEW_SUM)])
    patch(T / "jozve-g11-comprehensive360-r308.test.ts", [(OLD_RANGE, NEW_RANGE), (OLD_SUM, NEW_SUM)])
    patch(T / "jozve-konkur-vocab-g11-l24-r309.test.ts", [(OLD_LIST_309, NEW_LIST_309), (OLD_SUM, NEW_SUM)])
    print("all guards updated: 24 -> 28 lessons, 543 -> 600 items")

if __name__ == "__main__":
    sys.exit(main())
