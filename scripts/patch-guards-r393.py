#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r393 — گسترشِ گاردها برای ۱۲۸ بانک/۷۹۷ آیتم (بانک‌های l115-l128):
درسِ نهادینه‌شدهٔ r389-r392 (و کشفِ این راند: regexِ نهایی‌شدهٔ r392 با فرمتِ «],\n    );»
نمی‌ساخت — نشانِ idempotency آن را پنهان کرده بود؛ این اسکریپت با انکرهای واقعیِ هر فرمت کار می‌کند):
  فرمت A (r380-r389): آرایهٔ تک‌خطی …«4, 6, 4, 4],\n    );»
  فرمت B (r391/r392): آرایهٔ چندخطی …«4, 6, 4, 4,\n    ]);»
  فرمت C (r390):      آرایهٔ چندخطی …«4, 6, 4, 4]);» (هم‌سطر)
۱) ده گاردِ r380-r389: file-shape 114→128 / 751→797 / دمِ counts
   +[3,2,3,2,4,4,4,4,4,2,4,1,5,4] / حلقهٔ MCQ-خالص +[119, 120, 121, 123, 126, 128]
   (l115/l127 ترکیبی، l116/l117/l118/l122/l124/l125 تایپی — از حلقه مستثنی).
۲) گاردهای r390/r391: فقط file-shape (الگویِ r391/r392 — حلقه‌هایشان محدود به بانک‌های خودشان است).
۳) گاردِ r392: فقط file-shape (رسیدِ r14 محافظت می‌شود).
۴) نقشهٔ r273 + [115..128].
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
NO_LOOP = ["jozve-tests-g12-dey1397-r390.test.ts", "jozve-tests-g12-khordad1398-r391.test.ts"]
NEW_TAIL_MARK = "3, 2, 3, 2, 4, 4, 4, 4, 4, 2, 4, 1, 5, 4"
OLD_TAIL = "8, 2, 4, 3, 3, 4, 4, 2, 4, 6, 4, 4"
LOOP_OLD = "105, 109, 112, 114])"
LOOP_NEW = "105, 109, 112, 114, 119, 120, 121, 123, 126, 128])"

def widen(s: str, name: str) -> str:
    """file-shape widening با ادعای دقیقاً-یک-رخداد روی فرمتِ واقعی؛ idempotent."""
    if NEW_TAIL_MARK in s:
        print(f"skip {name} (already widened)")
        return None
    hits = 0
    for old_frag, new_frag in [
        (OLD_TAIL + "],\n    );", OLD_TAIL + ", " + NEW_TAIL_MARK + "],\n    );"),   # A
        (OLD_TAIL + ",\n    ]);", OLD_TAIL + ", " + NEW_TAIL_MARK + ",\n    ]);"),   # B
        (OLD_TAIL + "]);",       OLD_TAIL + ", " + NEW_TAIL_MARK + "]);"),           # C
    ]:
        c = s.count(old_frag)
        if c:
            assert c == 1, f"{name}: fragment {old_frag!r} found {c} times"
            s = s.replace(old_frag, new_frag)
            hits += 1
    assert hits == 1, f"{name}: expected exactly 1 file-shape tail variant, found {hits}"
    assert s.count("toHaveLength(114)") == 1, f"{name}: toHaveLength(114) not unique"
    s = s.replace("toHaveLength(114)", "toHaveLength(128)")
    assert s.count("toBe(751)") == 1 and s.count("toHaveLength(751)") == 1, f"{name}: 751 anchors not unique"
    s = s.replace("toBe(751)", "toBe(797)").replace("toHaveLength(751)", "toHaveLength(797)")
    return s

for name in LEGACY:
    f = ROOT / name
    s = f.read_text(encoding="utf-8")
    orig = s
    s2 = widen(s, name)
    if s2 is None:
        continue
    s = s2
    if not NEW_TAIL_MARK + "]" in orig:  # حلقهٔ MCQ فقط برای r380-r389
        c = s.count(LOOP_OLD)
        assert c == 1, f"{name}: expected exactly 1 MCQ-pure loop tail, found {c}"
        s = s.replace(LOOP_OLD, LOOP_NEW)
    f.write_text(s, encoding="utf-8")
    print(f"patched {name}")

# گاردهای file-shape-only (r390/r391) — بدونِ حلقه
for name in NO_LOOP:
    f = ROOT / name
    s = f.read_text(encoding="utf-8")
    s2 = widen(s, name)
    if s2 is None:
        continue
    f.write_text(s2, encoding="utf-8")
    print(f"patched {name} (file-shape only)")

# گاردِ r392 — فقط file-shape؛ رسیدِ r14 محافظت می‌شود (دو رخدادِ محتملِ دم: file-shape چندخطی + رسیدِ تک‌خطی)
f392 = ROOT / "jozve-tests-g12-shahrivar1398-r392.test.ts"
s = f392.read_text(encoding="utf-8")
if NEW_TAIL_MARK not in s:
    OLD_FRAG = OLD_TAIL + ",\n    ]);"
    NEW_FRAG = OLD_TAIL + ", " + NEW_TAIL_MARK + ",\n    ]);"
    assert s.count(OLD_FRAG) == 1, f"r392: expected exactly 1 multi-line file-shape tail, found {s.count(OLD_FRAG)}"
    s = s.replace(OLD_FRAG, NEW_FRAG)
    # رسیدِ r14 باید دست‌نخورده بماند — پیش‌کاوی و اثبات
    assert "toEqual([8, 2, 4, 3, 3, 4, 4, 2, 4, 6, 4, 4]);" in s, "r392: r14 receipt not found (pre-check)"
    assert s.count("toHaveLength(114)") == 1, "r392: toHaveLength(114) not unique"
    s = s.replace("toHaveLength(114)", "toHaveLength(128)")
    assert s.count("toBe(751)") == 1 and s.count("toHaveLength(751)") == 1, "r392: 751 anchors not unique"
    s = s.replace("toBe(751)", "toBe(797)").replace("toHaveLength(751)", "toHaveLength(797)")
    # ids[750] همچنان معتبر است (الحاق در انتهاست) — اثبات
    assert 'ids[750]).toBe("g12-l114-4")' in s, "r392: ids[750] anchor missing"
    assert "toEqual([8, 2, 4, 3, 3, 4, 4, 2, 4, 6, 4, 4]);" in s, "r392: r14 receipt must stay 12-entry!"
    f392.write_text(s, encoding="utf-8")
    print("patched jozve-tests-g12-shahrivar1398-r392.test.ts (file-shape only; r14 receipt preserved)")
else:
    print("skip jozve-tests-g12-shahrivar1398-r392.test.ts (already widened)")

# نقشهٔ r273
f = ROOT / "jozve-test-bank-r273.test.ts"
s = f.read_text(encoding="utf-8")
MAP_NEW_MARK = "127, 128],"
if MAP_NEW_MARK not in s:
    MAP_TAIL = "112, 113, 114],"
    MAP_NEW = "112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128],"
    assert s.count(MAP_TAIL) == 1, f"r273 map tail: expected exactly 1, found {s.count(MAP_TAIL)}"
    s = s.replace(MAP_TAIL, MAP_NEW)
    f.write_text(s, encoding="utf-8")
    print("patched jozve-test-bank-r273.test.ts")
else:
    print("skip jozve-test-bank-r273.test.ts (already widened)")
print("r393 guard-widening OK")
