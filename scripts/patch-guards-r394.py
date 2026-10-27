#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r394 — گسترشِ گاردها برای ۱۴۱ بانک/۸۵۱ آیتم (بانک‌های l129-l141):
درسِ نهادینه‌شدهٔ r389-r393 + کشفِ r393 (regexِ نهایی‌شده با فرمتِ واقعی نمی‌ساخت) و درسِ همیشگیِ
«دو رخدادِ محتمل»: رسیدِ g12nahaie15 (گاردِ r393) دقیقاً همان دمِ تازه را به‌صورتِ تک‌خطی دارد —
پس ترتیبِ First-hit-wins با اولویتِ فرمتِ B (چندخطیِ file-shape) روی C (تک‌خطیِ رسید) اعمال می‌شود.
فرمت‌های واقعی پس از r393:
  A (r380-r389): آرایهٔ تک‌خطی …«1, 5, 4],\n    );»
  B (r391/r392/r393): آرایهٔ چندخطی …«1, 5, 4,\n    ]);»
  C (r390):      آرایهٔ چندخطی …«1, 5, 4]);» (هم‌سطر)
۱) ده گاردِ r380-r389: file-shape 128→141 / 797→851 / دمِ counts
   +[4,4,4,4,3,3,4,4,2,6,6,4,6] / حلقهٔ MCQ-خالص +[129, 132, 135, 141]
   (l130/l131/l133/l134/l136/l137/l140 تایپی، l138/l139 ترکیبی — از حلقه مستثنی).
۲) گاردهای r390/r391/r392: فقط file-shape.
۳) گاردِ r393: فقط file-shape (رسیدِ r15 محافظت می‌شود).
۴) نقشهٔ r273 + [129..141].
Idempotent: فایلِ پچ‌شده با نشانِ NEW_TAIL شناسایی و رد می‌شود.
"""
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
NO_LOOP = [
    "jozve-tests-g12-dey1397-r390.test.ts",
    "jozve-tests-g12-khordad1398-r391.test.ts",
    "jozve-tests-g12-shahrivar1398-r392.test.ts",
]
NEW_TAIL_MARK = "4, 4, 4, 4, 3, 3, 4, 4, 2, 6, 6, 4, 6"
OLD_TAIL = "3, 2, 3, 2, 4, 4, 4, 4, 4, 2, 4, 1, 5, 4"
LOOP_OLD = "105, 109, 112, 114, 119, 120, 121, 123, 126, 128])"
LOOP_NEW = "105, 109, 112, 114, 119, 120, 121, 123, 126, 128, 129, 132, 135, 141])"

def widen(s: str, name: str) -> str:
    """file-shape widening با First-hit-wins روی فرمتِ واقعی؛ idempotent."""
    if NEW_TAIL_MARK in s:
        print(f"skip {name} (already widened)")
        return None
    hits = 0
    for old_frag, new_frag in [
        (OLD_TAIL + "],\n    );", OLD_TAIL + ", " + NEW_TAIL_MARK + "],\n    );"),   # A
        (OLD_TAIL + ",\n    ]);", OLD_TAIL + ", " + NEW_TAIL_MARK + ",\n    ]);"),   # B (اولویت روی C)
        (OLD_TAIL + "]);",       OLD_TAIL + ", " + NEW_TAIL_MARK + "]);"),           # C
    ]:
        c = s.count(old_frag)
        if c:
            assert c == 1, f"{name}: fragment {old_frag!r} found {c} times"
            s = s.replace(old_frag, new_frag)
            hits += 1
            break  # First-hit-wins — رسیدهای تک‌خطیِ هم‌دم پس از file-shape دست‌نخورده می‌مانند
    assert hits == 1, f"{name}: expected exactly 1 file-shape tail variant, found {hits}"
    assert s.count("toHaveLength(128)") == 1, f"{name}: toHaveLength(128) not unique"
    s = s.replace("toHaveLength(128)", "toHaveLength(141)")
    assert s.count("toBe(797)") == 1 and s.count("toHaveLength(797)") == 1, f"{name}: 797 anchors not unique"
    s = s.replace("toBe(797)", "toBe(851)").replace("toHaveLength(797)", "toHaveLength(851)")
    return s

for name in LEGACY:
    f = ROOT / name
    s = f.read_text(encoding="utf-8")
    s2 = widen(s, name)
    if s2 is None:
        continue
    s = s2
    c = s.count(LOOP_OLD)
    assert c == 1, f"{name}: expected exactly 1 MCQ-pure loop tail, found {c}"
    s = s.replace(LOOP_OLD, LOOP_NEW)
    f.write_text(s, encoding="utf-8")
    print(f"patched {name}")

# گاردهای file-shape-only (r390/r391/r392) — بدونِ حلقه
for name in NO_LOOP:
    f = ROOT / name
    s = f.read_text(encoding="utf-8")
    s2 = widen(s, name)
    if s2 is None:
        continue
    f.write_text(s2, encoding="utf-8")
    print(f"patched {name} (file-shape only)")

# گاردِ r393 — فقط file-shape؛ رسیدِ r15 محافظت می‌شود (B قبل از C — درسِ «دو رخدادِ محتمل»)
f393 = ROOT / "jozve-tests-g12-dey1398-r393.test.ts"
s = f393.read_text(encoding="utf-8")
if NEW_TAIL_MARK not in s:
    OLD_FRAG = OLD_TAIL + ",\n    ]);"
    NEW_FRAG = OLD_TAIL + ", " + NEW_TAIL_MARK + ",\n    ]);"
    assert s.count(OLD_FRAG) == 1, f"r393: expected exactly 1 multi-line file-shape tail, found {s.count(OLD_FRAG)}"
    s = s.replace(OLD_FRAG, NEW_FRAG)
    # رسیدِ r15 باید دست‌نخورده بماند — پیش‌کاوی و اثبات (تک‌خطی با «]);»)
    R15_RECEIPT = "toEqual([3, 2, 3, 2, 4, 4, 4, 4, 4, 2, 4, 1, 5, 4]);"
    assert R15_RECEIPT in s, "r393: r15 receipt not found (pre-check)"
    assert s.count("toHaveLength(128)") == 1, "r393: toHaveLength(128) not unique"
    s = s.replace("toHaveLength(128)", "toHaveLength(141)")
    assert s.count("toBe(797)") == 1 and s.count("toHaveLength(797)") == 1, "r393: 797 anchors not unique"
    s = s.replace("toBe(797)", "toBe(851)").replace("toHaveLength(797)", "toHaveLength(851)")
    # ids[796] همچنان معتبر است (الحاق در انتهاست) — اثبات
    assert 'ids[796]).toBe("g12-l128-4")' in s, "r393: ids[796] anchor missing"
    assert R15_RECEIPT in s, "r393: r15 receipt must stay 14-entry!"
    f393.write_text(s, encoding="utf-8")
    print("patched jozve-tests-g12-dey1398-r393.test.ts (file-shape only; r15 receipt preserved)")
else:
    print("skip jozve-tests-g12-dey1398-r393.test.ts (already widened)")

# نقشهٔ r273
f = ROOT / "jozve-test-bank-r273.test.ts"
s = f.read_text(encoding="utf-8")
MAP_NEW_MARK = "141],"
if MAP_NEW_MARK not in s:
    MAP_TAIL = "127, 128],"
    MAP_NEW = ("127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141],")
    assert s.count(MAP_TAIL) == 1, f"r273 map tail: expected exactly 1, found {s.count(MAP_TAIL)}"
    s = s.replace(MAP_TAIL, MAP_NEW)
    f.write_text(s, encoding="utf-8")
    print("patched jozve-test-bank-r273.test.ts")
else:
    print("skip jozve-test-bank-r273.test.ts (already widened)")
print("r394 guard-widening OK")
