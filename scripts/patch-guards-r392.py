#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r392 — گسترشِ گاردها برای ۱۱۴ بانک/۷۵۱ آیتم (بانک‌های l103-l114):
درسِ نهادینه‌شدهٔ r389/r390/r391: پیش از جایگزینیِ دمِ counts، «دو رخدادِ محتمل» را جدا کن —
file-shape (باید گسترش یابد) و رسیدهای راندهای قبل (هرگز نباید گسترش یابند).
Idempotent: فایلِ پچ‌شده با نشانِ NEW_TAIL شناسایی و رد می‌شود.
۱) یازده گاردِ legacy (r380-r390): file-shape 102→114 / 703→751 / دمِ counts
   +[8,2,4,3,3,4,4,2,4,6,4,4] / حلقهٔ MCQ-خالصِ r380-r389 +[105, 109, 112, 114]
   (l103/l113 ترکیبی، l104/l106/l107/l108/l110/l111 تایپی — از حلقه مستثنی)؛ r390 فقط file-shape (الگویِ r391).
۲) گاردِ r391: فقط file-shape (رسیدِ r13.bankCounts دست‌نخورده).
۳) نقشهٔ r273 + [103..114].
"""
import re
from pathlib import Path

ROOT = Path("/home/z/my-project/tests")
LEGACY = [
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
]
NEW_TAIL_MARK = "8, 2, 4, 3, 3, 4, 4, 2, 4, 6, 4, 4]"
# دمِ r391 با تحملِ شکستِ سطر و ویرگولِ دنباله — فقط در آرایه‌های file-shape ظاهر می‌شود
PAT_TAIL = re.compile(r"8,\s*2,\s*4,\s*3,\s*3,\s*4,\s*4,\s*4,\s*3,\s*3(,)?(\s*\n\s*)?\]\)")
PAT_LOOP = re.compile(r"99,\s*100,\s*101,\s*102\]\)")
LOOP_NEW = "99, 100, 101, 102, 105, 109, 112, 114])"

def widen(s: str, name: str) -> str:
    """file-shape widening با ادعای دقیقاً-یک-رخداد؛ idempotent."""
    if NEW_TAIL_MARK in s:
        print(f"skip {name} (already widened)")
        return s
    s = s.replace("toHaveLength(102)", "toHaveLength(114)")
    s2, n_tail = PAT_TAIL.subn(lambda m: "8, 2, 4, 3, 3, 4, 4, 4, 3, 3, 8, 2, 4, 3, 3, 4, 4, 2, 4, 6, 4, 4])", s)
    assert n_tail == 1, f"{name}: expected exactly 1 file-shape tail, found {n_tail}"
    s = s2
    s = s.replace("toBe(703)", "toBe(751)")
    s = s.replace("toHaveLength(703)", "toHaveLength(751)")
    return s

for name in LEGACY:
    f = ROOT / name
    s = f.read_text(encoding="utf-8")
    orig = s
    already = NEW_TAIL_MARK in s
    s = widen(s, name)
    if name != "jozve-tests-g12-dey1397-r390.test.ts" and not already:  # r390: file-shape only (الگویِ r391)
        s2, n_loop = PAT_LOOP.subn(LOOP_NEW, s)
        assert n_loop == 1, f"{name}: expected exactly 1 MCQ-pure loop tail, found {n_loop}"
        s = s2
    if s != orig:
        f.write_text(s, encoding="utf-8")
        print(f"patched {name}")

# گاردِ r391 — فقط file-shape؛ رسیدِ r13 محافظت می‌شود (دو رخدادِ محتملِ دمِ r391: file-shape چندخطی + رسیدِ تک‌خطی)
f391 = ROOT / "jozve-tests-g12-khordad1398-r391.test.ts"
s = f391.read_text(encoding="utf-8")
if "8, 2, 4, 3, 3, 4, 4, 2, 4, 6, 4, 4" not in s:
    OLD_FRAG = "4, 8, 2, 4, 3, 3, 4, 4, 4, 3, 3,\n    ])"
    NEW_FRAG = "4, 8, 2, 4, 3, 3, 4, 4, 4, 3, 3, 8, 2, 4, 3, 3, 4, 4, 2, 4, 6, 4, 4,\n    ])"
    assert s.count(OLD_FRAG) == 1, f"r391: expected exactly 1 multi-line file-shape tail, found {s.count(OLD_FRAG)}"
    s = s.replace(OLD_FRAG, NEW_FRAG)
    # رسیدِ r13 باید دست‌نخورده بماند — پیش‌کاوی
    assert 'toEqual([8, 2, 4, 3, 3, 4, 4, 4, 3, 3])' in s, "r391: r13 receipt not found (pre-check)"
    s = s.replace("toHaveLength(102)", "toHaveLength(114)")
    s = s.replace("toBe(703)", "toBe(751)")
    s = s.replace("toHaveLength(703)", "toHaveLength(751)")
    # ids[702] همچنان معتبر است (الحاق در انتهاست) — اثبات
    assert 'ids[702]).toBe("g12-l102-3")' in s, "r391: ids[702] anchor missing"
    assert 'toEqual([8, 2, 4, 3, 3, 4, 4, 4, 3, 3])' in s, "r391: r13 receipt must stay 10-entry!"
    f391.write_text(s, encoding="utf-8")
    print("patched jozve-tests-g12-khordad1398-r391.test.ts (file-shape only; r13 receipt preserved)")
else:
    print("skip jozve-tests-g12-khordad1398-r391.test.ts (already widened)")

# نقشهٔ r273
f = ROOT / "jozve-test-bank-r273.test.ts"
s = f.read_text(encoding="utf-8")
MAP_NEW_MARK = "112, 113, 114],"
if MAP_NEW_MARK not in s:
    MAP_TAIL = "100, 101, 102],"
    MAP_NEW = "100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114],"
    assert s.count(MAP_TAIL) == 1, f"r273 map tail: expected exactly 1, found {s.count(MAP_TAIL)}"
    s = s.replace(MAP_TAIL, MAP_NEW)
    f.write_text(s, encoding="utf-8")
    print("patched jozve-test-bank-r273.test.ts")
else:
    print("skip jozve-test-bank-r273.test.ts (already widened)")
print("r392 guard-widening OK")
