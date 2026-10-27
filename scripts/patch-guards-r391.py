#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r391 — گسترشِ گاردها برای ۱۰۲ بانک/۷۰۳ آیتم (بانک‌های l93-l102):
درسِ تکرارشدهٔ r389/r390: پیش از جایگزینیِ دمِ counts، «دو رخدادِ محتمل» را جدا کن —
file-shape (باید گسترش یابد) و رسیدهای راندهای قبل (هرگز نباید گسترش یابند).
۱) ده گاردِ legacy (r380-r389): file-shape 92→102 / 665→703 / دمِ counts +[8,2,4,3,3,4,4,4,3,3] /
   حلقهٔ MCQ-خالص +[93, 95, 96, 99-102] (l94/l97/l98 تایپی‌اند).
۲) گاردِ r390: فقط file-shape (رسیدِ r12.bankCounts دست‌نخورده).
۳) نقشهٔ r273 + [93..102].
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
]
NEW_TAIL = "2, 4, 4, 4, 4, 4, 4, 2, 4, 8, 2, 4, 3, 3, 4, 4, 4, 3, 3]"
# دمِ r390 با تحملِ شکستِ سطر — فقط در آرایه‌های file-shape ظاهر می‌شود
PAT_TAIL = re.compile(r"2,\s*4,\s*4,\s*4,\s*4,\s*4,\s*4,\s*2,\s*4\]")
PAT_LOOP = re.compile(r"89,\s*90,\s*91,\s*92\]\)")

for name in LEGACY:
    f = ROOT / name
    s = f.read_text(encoding="utf-8")
    orig = s
    s = s.replace("toHaveLength(92)", "toHaveLength(102)")
    s2, n_tail = PAT_TAIL.subn(NEW_TAIL, s)
    assert n_tail == 1, f"{name}: expected exactly 1 file-shape tail, found {n_tail}"
    s = s2
    s = s.replace("toBe(665)", "toBe(703)")
    s = s.replace("toHaveLength(665)", "toHaveLength(703)")
    s2, n_loop = PAT_LOOP.subn("89, 90, 91, 92, 93, 95, 96, 99, 100, 101, 102])", s)
    assert n_loop == 1, f"{name}: expected exactly 1 MCQ-pure loop tail, found {n_loop}"
    s = s2
    if s != orig:
        f.write_text(s, encoding="utf-8")
        print(f"patched {name} (tail={n_tail}, loop={n_loop})")

# گاردِ r390 — فقط file-shape؛ رسیدِ r12 محافظت می‌شود
f390 = ROOT / "jozve-tests-g12-dey1397-r390.test.ts"
s = f390.read_text(encoding="utf-8")
assert "toEqual([2, 4, 4, 4, 4, 4, 4, 2, 4])" in s, "r390: r12 receipt not found (pre-check)"
# file-shape چندخطیِ r390: دمِ «...4, 4,\n      2, 4,» — جایگزینیِ دقیقِ همان قطعه
OLD_FRAG = "2, 1, 2, 3, 3, 4, 4, 4, 4, 4, 3, 1, 3, 2, 3, 3, 5, 4, 4, 4, 4, 4, 2, 2, 4, 4, 4, 4, 4, 4,\n      2, 4,"
NEW_FRAG = "2, 1, 2, 3, 3, 4, 4, 4, 4, 4, 3, 1, 3, 2, 3, 3, 5, 4, 4, 4, 4, 4, 2, 2, 4, 4, 4, 4, 4, 4,\n      2, 4, 8, 2, 4, 3, 3, 4, 4, 4, 3, 3,"
assert OLD_FRAG in s, "r390: multi-line file-shape tail fragment not found"
s = s.replace(OLD_FRAG, NEW_FRAG)
s = s.replace("toHaveLength(92)", "toHaveLength(102)")
s = s.replace("toHaveLength(665)", "toHaveLength(703)")
s = s.replace("toBe(665)", "toBe(703)")
assert "toEqual([2, 4, 4, 4, 4, 4, 4, 2, 4])" in s, "r390: r12 receipt must stay 9-entry!"
f390.write_text(s, encoding="utf-8")
print("patched jozve-tests-g12-dey1397-r390.test.ts (file-shape only; r12 receipt preserved)")

# نقشهٔ r273
f = ROOT / "jozve-test-bank-r273.test.ts"
s = f.read_text(encoding="utf-8")
MAP_TAIL = "88, 89, 90, 91, 92],"
MAP_NEW = "88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102],"
assert MAP_TAIL in s, "r273 map tail not found"
s = s.replace(MAP_TAIL, MAP_NEW)
f.write_text(s, encoding="utf-8")
print("patched jozve-test-bank-r273.test.ts")
print("r391 guard-widening OK")
