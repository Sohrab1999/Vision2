#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r395 — گسترشِ گاردهای قدیمیِ tests-g12 برای بانکِ l142 (۲۲ آیتمِ تایپیِ مخزنِ افعال).
۱۵ فایلِ گاردِ راندهای r380..r394 — در هر فایل:
  ۱) toHaveLength(141)  → toHaveLength(142)            (دقیقاً ۱ رخداد)
  ۲) toHaveLength(851)  → toHaveLength(873)            (دقیقاً ۱ رخداد)
     .toBe(851)         → .toBe(873)                   (دقیقاً ۱ رخداد)
  ۳) دمِ آرایهٔ counts: «…, 2, 6, 6, 4, 6» + بسته‌شدن در یکی از سه قالبِ شناخته‌شده
     (A: «6],» / B: «6,\n    ]);» / C: «6]);») → افزودنِ ۲۲   (دقیقاً ۱ رخداد)
  ۴) فقط در فایلِ r394: پس از انکرِ ids[850] دو انکرِ تازهٔ l142 (ids[851]/ids[872]).
نشانِ ایدمپوتنسی: کامنتِ «R395-WIDENED» در سطرِ نخستِ هر فایل.
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

TAIL = "2, 6, 6, 4, 6"
# B — آرایهٔ چندخطی (r391-r394): دم + «,\n    ]);»
CLOSE_B = TAIL + ",\n    ]);"
CLOSE_B_NEW = TAIL + ",\n      22,\n    ]);"
# A/C — آرایهٔ تک‌خطی که با «[100, 100, 100, 6,» آغاز می‌شود (بسته‌شدن «],\n    );» یا «]);»)؛
# پیشوندِ 100x3 تلافیِ bankCountsِ رسید («[4, 4, 4, 4, 3, 3, …]») را منتفی می‌کند.
RE_SINGLE = re.compile(r"(\[100, 100, 100, 6,[^\]]*?" + re.escape(TAIL) + r"\])(\s*,?\s*\))")

ANCHOR_OLD = 'expect(ids[850]).toBe("g12-l141-6");'
ANCHOR_NEW = (
    'expect(ids[850]).toBe("g12-l141-6");\n'
    '    expect(ids[851]).toBe("g12-l142-1");\n'
    '    expect(ids[872]).toBe("g12-l142-22");'
)

for name in FILES:
    p = ROOT / name
    txt = p.read_text(encoding="utf-8")
    if "R395-WIDENED" in txt:
        print(f"{name}: already widened — NO-OP")
        continue

    assert txt.count("toHaveLength(141)") == 1, f"{name}: toHaveLength(141) x{txt.count('toHaveLength(141)')}"
    txt = txt.replace("toHaveLength(141)", "/* R395-WIDENED */ toHaveLength(142)")
    assert txt.count("toHaveLength(851)") == 1, f"{name}: len851 x{txt.count('toHaveLength(851)')}"
    assert txt.count(".toBe(851)") == 1, f"{name}: toBe851 x{txt.count('.toBe(851)')}"
    txt = txt.replace("toHaveLength(851)", "toHaveLength(873)").replace(".toBe(851)", ".toBe(873)")

    hits = []
    if CLOSE_B in txt:
        hits.append("B")
    m_single = RE_SINGLE.search(txt)
    if m_single:
        hits.append("A/C")
    assert len(hits) == 1, f"{name}: counts-tail closings {hits} — expected exactly one"
    if hits[0] == "B":
        txt = txt.replace(CLOSE_B, CLOSE_B_NEW)
    else:
        txt = RE_SINGLE.sub(lambda m: m.group(1) + ", 22]" + m.group(2), txt, count=1)

    if name.endswith("r394.test.ts"):
        assert txt.count(ANCHOR_OLD) == 1, f"{name}: ids[850] anchor x{txt.count(ANCHOR_OLD)}"
        txt = txt.replace(ANCHOR_OLD, ANCHOR_NEW)

    txt = "// R395-WIDENED — l142 (۲۲ آیتمِ تایپیِ مخزنِ افعال): 141→142 بانک / 851→873 id / دمِ counts +22\n" + txt
    p.write_text(txt, encoding="utf-8")
    print(f"{name}: widened OK")
