#!/usr/bin/env python3
"""update-guards-r289.py — به‌روزسازیِ صادقانهٔ گاردهای r280-r288: خانواده اکنون ۳۶ بانک / ۵۷۴ تست"""
import re

OLD_ARR = "[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]"
NEW_ARR = "Array.from({ length: 36 }, (_, i) => i + 1)"

# کامنت‌های توضیحیِ به‌روزِ هر فایل (پس از آرایه)
COMMENTS = {
    "tests/jozve-relatives-g12-r280.test.ts": "// r281-r286 بانک‌های ۳..۱۴، r287 هفت بانک تشریحی (۱۵-۲۱) و r288 بخش‌های ۸/۹ (۲۲-۲۳) را افزودند",
    "tests/jozve-tenses-g12-r281.test.ts": "// r282-r286 بانک‌های ۵..۱۴، r287 هفت بانک تشریحی (۱۵-۲۱) و r288 بخش‌های ۸/۹ (۲۲-۲۳) را افزودند",
    "tests/jozve-modals-g12-r282.test.ts": "// r285-r286 بانک‌های ۱۲-۱۴، r287 هفت بانک تشریحی و r288 بخش‌های ۸/۹ را افزودند",
    "tests/jozve-tags-g12-r283.test.ts": "// r285-r286 بانک‌های ۱۲-۱۴، r287 هفت بانک تشریحی و r288 بخش‌های ۸/۹ را افزودند",
    "tests/jozve-passive-g12-r284.test.ts": "// r285-r286 بانک‌های ۱۲-۱۴، r287 هفت بانک تشریحی و r288 بخش‌های ۸/۹ را افزودند",
    "tests/jozve-tagwrite-g12-r285.test.ts": "// r286 دو بانک کلمات ربط، r287 هفت بانک تشریحی و r288 بخش‌های ۸/۹ را افزودند",
    "tests/jozve-connectives-g12-r286.test.ts": "// r287 هفت بانک تشریحی (۱۵-۲۱) و r288 بخش‌های ۸/۹ (۲۲-۲۳) را افزود",
    "tests/jozve-diagnostic-g12-r287.test.ts": "// r288 بخش‌های ۸/۹ (۲۲-۲۳) را افزود",
}
NEW_COMMENT = "— r289 آزمون جامع درس اول (درس‌های ۲۴-۳۶) را افزود"

PAIRS_COMMON = [
    ("expect(bank.lessons.reduce((a, l) => a + l.count, 0)).toBe(515);",
     "expect(bank.lessons.reduce((a, l) => a + l.count, 0)).toBe(574); // ۵۱۵ + ۵۹ آزمون جامع r289"),
    ("expect(ids.size).toBe(515);", "expect(ids.size).toBe(574);"),
    ("23-bank family (515 ids)", "36-bank family (574 ids)"),
    ("515 ids after r288", "574 ids after r289"),
    ("expect(all).toHaveLength(515); // r284-r287 و r288 شانزده تست بخش‌های ۸/۹ را افزودند",
     "expect(all).toHaveLength(574); // r284-r288 و r289 پنجاه‌ونه تست آزمون جامع را افزودند"),
]

FILES = [
    "tests/jozve-relatives-g12-r280.test.ts",
    "tests/jozve-tenses-g12-r281.test.ts",
    "tests/jozve-modals-g12-r282.test.ts",
    "tests/jozve-tags-g12-r283.test.ts",
    "tests/jozve-passive-g12-r284.test.ts",
    "tests/jozve-tagwrite-g12-r285.test.ts",
    "tests/jozve-connectives-g12-r286.test.ts",
    "tests/jozve-diagnostic-g12-r287.test.ts",
    "tests/jozve-s89-g12-r288.test.ts",
]

for path in FILES:
    s = open(path, encoding="utf-8").read()
    n_arr = s.count(OLD_ARR)
    s = s.replace(OLD_ARR, NEW_ARR)
    if path in COMMENTS and COMMENTS[path] in s:
        s = s.replace(COMMENTS[path], COMMENTS[path][2:] + " " + NEW_COMMENT if False else COMMENTS[path], 1)
        # کامنت: افزودنِ اتصالِ کوتاهِ r289 به انتهای کامنتِ موجود
        s = s.replace(COMMENTS[path], COMMENTS[path] + "؛ r289 آزمون جامع (۲۴-۳۶) را افزود", 1)
    for old, new in PAIRS_COMMON:
        s = s.replace(old, new)
    open(path, "w", encoding="utf-8").write(s)
    print(f"OK {path} (arrays replaced: {n_arr})")

print("done")
