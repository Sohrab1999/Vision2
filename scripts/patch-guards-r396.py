#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r396 — گسترشِ گاردهای قدیمیِ tests-g12 برای بانکِ l143 (۱۸ آیتمِ جمله‌سازیِ مخزن).
۱۵ فایلِ گارد — در هر فایل:
  ۱) toHaveLength(142) → toHaveLength(143)            (دقیقاً ۱ رخداد)
  ۲) toHaveLength(873) → toHaveLength(891) / .toBe(873) → .toBe(891)   (هر یک ۱ رخداد)
  ۳) دمِ آرایهٔ counts (اکنون با دمِ «…, 6, 22» از r395) → افزودنِ ۱۸ — دو قالب:
     A/C: «6, 22],» → «6, 22, 18],»   B: «22,\n    ]);» → «22,\n      18,\n    ]);»
  ۴) فقط در فایلِ r394: پس از انکرِ ids[872] دو انکرِ تازهٔ l143 (ids[873]/ids[890]).
نشانِ ایدمپوتنسی: «R396-WIDENED» در سطرِ نخست.
"""
from pathlib import Path
import re

ROOT = Path("/home/z/my-project/tests")
FILES = [
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

# A/C — آرایهٔ تک‌خطی با آغازِ «[100, 100, 100, 6,» و دمِ r395 («…, 6, 22]»)
RE_SINGLE = re.compile(r"(\[100, 100, 100, 6,[^\]]*?2, 6, 6, 4, 6, 22\])(\s*,?\s*\))")
# B — آرایهٔ چندخطی: دمِ r395 روی سطرِ خودش
CLOSE_B = "22,\n    ]);"
CLOSE_B_NEW = "22,\n      18,\n    ]);"
# C — آرایهٔ چندخطیِ با بستنِ هم‌سطر (r390): «…, 6, 22]);»
CLOSE_C = "2, 6, 6, 4, 6, 22]);"
CLOSE_C_NEW = "2, 6, 6, 4, 6, 22, 18]);"

ANCHOR_OLD = 'expect(ids[872]).toBe("g12-l142-22");'
ANCHOR_NEW = (
    'expect(ids[872]).toBe("g12-l142-22");\n'
    '    expect(ids[873]).toBe("g12-l143-1");\n'
    '    expect(ids[890]).toBe("g12-l143-18");'
)

for name in FILES:
    p = ROOT / name
    txt = p.read_text(encoding="utf-8")
    if "R396-WIDENED" in txt:
        print(f"{name}: already widened — NO-OP")
        continue

    assert txt.count("toHaveLength(142)") == 1, f"{name}: len142 x{txt.count('toHaveLength(142)')}"
    txt = txt.replace("toHaveLength(142)", "/* R396-WIDENED */ toHaveLength(143)")
    assert txt.count("toHaveLength(873)") == 1, f"{name}: len873 x{txt.count('toHaveLength(873)')}"
    assert txt.count(".toBe(873)") == 1, f"{name}: toBe873 x{txt.count('.toBe(873)')}"
    txt = txt.replace("toHaveLength(873)", "toHaveLength(891)").replace(".toBe(873)", ".toBe(891)")

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
        txt = RE_SINGLE.sub(lambda m: m.group(1)[:-1] + ", 18]" + m.group(2), txt, count=1)

    if name.endswith("r394.test.ts"):
        assert txt.count(ANCHOR_OLD) == 1, f"{name}: ids[872] anchor x{txt.count(ANCHOR_OLD)}"
        txt = txt.replace(ANCHOR_OLD, ANCHOR_NEW)

    txt = "// R396-WIDENED — l143 (۱۸ آیتمِ جمله‌سازیِ مخزن): 142→143 بانک / 873→891 id / دمِ counts +18\n" + txt
    p.write_text(txt, encoding="utf-8")
    print(f"{name}: widened OK")
