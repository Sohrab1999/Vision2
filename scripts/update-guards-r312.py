# -*- coding: utf-8 -*-
"""
r312 — به‌روزرسانی گاردهای قدیمیِ خانوادهٔ tests-g11 پس از الحاقِ بانک‌های
«آزمون تشریحی واژگان درس دوم و سوم» (l29..l36، ۱۱۴ آیتم):
  • r275: قفلِ فهرستِ درس‌ها  [...25, 26, 27, 28] → [...29..36]
  • r278: همان قفل + جمعِ ۶۰۰ → ۷۱۴
  • r308: length 28 → 36 + جمعِ ۶۰۰ → ۷۱۴
  • r309: همان قفل + جمعِ ۶۰۰ → ۷۱۴
الگوی additive r304..r311 — جراحیِ هدفمند با جایگزینیِ رشتهٔ دقیق.
"""
import sys
from pathlib import Path

ROOT = Path("/home/z/my-project")
T = ROOT / "tests"

OLD_LIST = """      // r311 — «آزمون تشریحی واژگان درس اول» (ص۱۶-۱۸، کلید واژه‌ای ص۱۷۶) — l25..l28 الحاق شد
    25, 26, 27, 28,
    ]);"""
NEW_LIST = """      // r311 — «آزمون تشریحی واژگان درس اول» (ص۱۶-۱۸، کلید واژه‌ای ص۱۷۶) — l25..l28 الحاق شد
    25, 26, 27, 28,
      // r312 — «آزمون تشریحی واژگان درس دوم/سوم» (ص۵۴-۵۶/ص۸۸-۹۰، کلیدهای ص۱۸۴/ص۱۹۳) — l29..l36 الحاق شد
    29, 30, 31, 32, 33, 34, 35, 36,
    ]);"""

OLD_LIST_309 = """      // r311 — «آزمون تشریحی واژگان درس اول» (ص۱۶-۱۸، کلید واژه‌ای ص۱۷۶) — l25..l28 الحاق شد
      25, 26, 27, 28,
    ]);"""
NEW_LIST_309 = """      // r311 — «آزمون تشریحی واژگان درس اول» (ص۱۶-۱۸، کلید واژه‌ای ص۱۷۶) — l25..l28 الحاق شد
      25, 26, 27, 28,
      // r312 — «آزمون تشریحی واژگان درس دوم/سوم» (ص۵۴-۵۶/ص۸۸-۹۰، کلیدهای ص۱۸۴/ص۱۹۳) — l29..l36 الحاق شد
      29, 30, 31, 32, 33, 34, 35, 36,
    ]);"""

OLD_RANGE = """      Array.from({ length: 28 }, (_, i) => i + 1) // r311: ۲۴ → ۲۸ با بانک‌های تشریحی l25..l28"""
NEW_RANGE = """      Array.from({ length: 36 }, (_, i) => i + 1) // r312: ۲۸ → ۳۶ با بانک‌های تشریحی l29..l36 (r311: l25..l28)"""

OLD_SUM = "expect(all).toHaveLength(40 + 40 + 40 + 22 + 20 + 20 + 361 + 57);"
NEW_SUM = "expect(all).toHaveLength(40 + 40 + 40 + 22 + 20 + 20 + 361 + 57 + 114);"


def patch(path: Path, subs):
    txt = path.read_text(encoding="utf-8")
    for old, new in subs:
        n = txt.count(old)
        if n == 0 and new in txt:
            print(f"already applied: {path.name}")
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
    print("all guards updated: 28 -> 36 lessons, 600 -> 714 items")


if __name__ == "__main__":
    sys.exit(main())
