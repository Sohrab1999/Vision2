#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r400 — گسترشِ گاردهای قدیمیِ tests-g12 برای بانکِ l144 (۵۱ آیتمِ پاسخِ مدلِ مخزن).
۱۷ فایلِ گارد (۱۵ برگه‌ای r380-r394 + دو رسیدِ typedres r395/r396):
  ۱) toHaveLength(143) → toHaveLength(144)               (دقیقاً ۱ رخداد)
  ۲) toHaveLength(891) → toHaveLength(942) / .toBe(891) → .toBe(942)
  ۳) دمِ آرایهٔ counts (+51) — سه قالبِ r396 (A تک‌خطی / B چندخطی / C هم‌سطر)
  ۴) انکرهای ids در فایلِ r394: پس از ids[890] دو انکرِ l144 (ids[891]/ids[941])
  ۵) r395/r396: counts.slice(-2) [22,18] → slice(-3) [22,18,51]
  ۶) r273: نقشهٔ [1..143] → [1..144]
نشانِ ایدمپوتنسی: «R400-WIDENED» در سطرِ نخست.
"""
from pathlib import Path
import re

ROOT = Path("/home/z/my-project/tests")
PAPER_FILES = [
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
    "jozve-tests-g12-khordad1398-r391.test.ts",
    "jozve-tests-g12-shahrivar1398-r392.test.ts",
    "jozve-tests-g12-dey1398-r393.test.ts",
    "jozve-tests-g12-khordad1399kharej-r394.test.ts",
]
ALL = PAPER_FILES + [
    "jozve-tests-g12-typedres-r395.test.ts",
    "jozve-tests-g12-typedres2-r396.test.ts",
]

# A — آرایهٔ تک‌خطی با دمِ r396 («…, 6, 22, 18],»)
RE_SINGLE = re.compile(r"(\[100, 100, 100, 6,[^\]]*?2, 6, 6, 4, 6, 22, 18\])(\s*,?\s*\))")
# B — آرایهٔ چندخطی: دمِ r396 روی سطرِ خودش
CLOSE_B = "18,\n    ]);"
CLOSE_B_NEW = "18,\n      51,\n    ]);"
# C — آرایهٔ چندخطیِ با بستنِ هم‌سطر (r390): «…, 6, 22, 18]);»
CLOSE_C = "2, 6, 6, 4, 6, 22, 18]);"
CLOSE_C_NEW = "2, 6, 6, 4, 6, 22, 18, 51]);"

ANCHOR_OLD = 'expect(ids[890]).toBe("g12-l143-18");'
ANCHOR_NEW = (
    'expect(ids[890]).toBe("g12-l143-18");\n'
    '    expect(ids[891]).toBe("g12-l144-1");\n'
    '    expect(ids[941]).toBe("g12-l144-51");'
)

for name in ALL:
    p = ROOT / name
    txt = p.read_text(encoding="utf-8")
    if "R400-WIDENED" in txt:
        print(f"{name}: already widened — NO-OP")
        continue

    n143 = txt.count("toHaveLength(143)")
    is_typedres = name.endswith("typedres-r395.test.ts") or name.endswith("typedres2-r396.test.ts")
    expected143 = 2 if is_typedres else 1
    assert n143 == expected143, f"{name}: len143 x{n143} (expected {expected143})"
    txt = txt.replace("toHaveLength(143)", "/* R400-WIDENED */ toHaveLength(144)")
    assert txt.count("toHaveLength(891)") == 1, f"{name}: len891 x{txt.count('toHaveLength(891)')}"
    assert txt.count(".toBe(891)") == 1, f"{name}: toBe891 x{txt.count('.toBe(891)')}"
    txt = txt.replace("toHaveLength(891)", "toHaveLength(942)").replace(".toBe(891)", ".toBe(942)")

    if name.endswith("typedres-r395.test.ts") or name.endswith("typedres2-r396.test.ts"):
        assert txt.count("expect(counts.slice(-2)).toEqual([22, 18]);") == 1, name
        txt = txt.replace(
            "expect(counts.slice(-2)).toEqual([22, 18]);",
            "expect(counts.slice(-3)).toEqual([22, 18, 51]);",
        )
    else:
        hits = []
        if CLOSE_B in txt:
            hits.append("B")
        if CLOSE_C in txt:
            hits.append("C")
        m_single = RE_SINGLE.search(txt)
        if m_single:
            hits.append("A/C")
        assert len(hits) == 1, f"{name}: counts-tail closings {hits} — expected exactly one"
        if hits[0] == "B":
            txt = txt.replace(CLOSE_B, CLOSE_B_NEW)
        elif hits[0] == "C":
            txt = txt.replace(CLOSE_C, CLOSE_C_NEW)
        else:
            txt = RE_SINGLE.sub(lambda m: m.group(1)[:-1] + ", 51]" + m.group(2), txt, count=1)

    if name.endswith("r394.test.ts"):
        assert txt.count(ANCHOR_OLD) == 1, f"{name}: ids[890] anchor x{txt.count(ANCHOR_OLD)}"
        txt = txt.replace(ANCHOR_OLD, ANCHOR_NEW)

    txt = "// R400-WIDENED — l144 (۵۱ آیتمِ پاسخِ مدلِ مخزن): 143→144 بانک / 891→942 id / دمِ counts +51\n" + txt
    p.write_text(txt, encoding="utf-8")
    print(f"{name}: widened OK")

# ——— r273: نقشهٔ درس‌ها [1..143] → [1..144] ———
p = ROOT / "jozve-test-bank-r273.test.ts"
txt = p.read_text(encoding="utf-8")
assert "R400-WIDENED" not in txt, "r273 already widened"
old_tail = "140, 141, 142, 143],"
assert txt.count(old_tail) == 1, f"r273 map tail x{txt.count(old_tail)}"
txt = txt.replace(old_tail, "140, 141, 142, 143, 144],")
old_cmt = "// افزودند — گاردهای خودشان شمارشان را پیمان می‌کنند؛ r395 ل142 (افعال) و r396 ل143 (جمله‌سازی) را افزودند"
assert txt.count(old_cmt) == 1, "r273 comment"
txt = txt.replace(
    old_cmt,
    "// افزودند — گاردهای خودشان شمارشان را پیمان می‌کنند؛ r395 ل142 (افعال)، r396 ل143 (جمله‌سازی)\n"
    "    // و r400 ل144 (پاسخ‌هایِ مدل — قسطِ پایانیِ مخزن) را افزودند",
)
txt = "// R400-WIDENED — l144: نقشهٔ درس‌ها +144\n" + txt
p.write_text(txt, encoding="utf-8")
print("jozve-test-bank-r273.test.ts: widened OK")
