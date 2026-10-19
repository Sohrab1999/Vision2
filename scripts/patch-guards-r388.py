#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r388 — گسترشِ گاردهای legacy برای ۷۱ بانک/۵۹۴ آیتم (پس از افزودن ناشنوایان l60-63 و
خرداد ۱۳۹۹ ریاضی-تجربی l64-71) — patch مکانیکی و idempotent."""
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
FILES = [f"tests/jozve-tests-g12-{n}.test.ts" for n in
         ("nahaie-r380", "shahrivar-r381", "dey-r382", "shahrivar1400-r383",
          "khordad1400-r384", "khordad1400m-r385", "dey1399-r386", "shahrivar1399-r387")]

COUNTS_TAIL_OLD = "6, 6, 3, 3, 6, 4, 4, 4, 4, 4],"
COUNTS_TAIL_NEW = "6, 6, 3, 3, 6, 4, 4, 4, 4, 4, 1, 2, 1, 2, 3, 3, 4, 4, 4, 4, 4, 3],"
LOOP_TAIL_OLD = "58, 59])"
LOOP_TAIL_NEW = "58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71])"

for rel in FILES:
    p = ROOT / rel
    src = p.read_text(encoding="utf-8")
    orig = src
    # ۱) شکلِ فایل
    src = src.replace("expect(bank.lessons).toHaveLength(59);", "expect(bank.lessons).toHaveLength(71);")
    src = src.replace("expect(ids).toHaveLength(559);", "expect(ids).toHaveLength(594);")
    src = src.replace("expect(new Set(ids).size).toBe(559);", "expect(new Set(ids).size).toBe(594);")
    # ۲) آرایهٔ counts (فقط خطِ حاوی 100, 100, 100)
    lines = src.split("\n")
    for i, l in enumerate(lines):
        if "100, 100, 100," in l and l.strip().startswith("["):
            assert l.rstrip().endswith("],"), rel
            lines[i] = l.rstrip()[:-1]  # strip trailing ]
            # بازسازی: افزودن ۱۲ عدد تازه پیش از ]
            assert lines[i].endswith(COUNTS_TAIL_OLD[:-1]), (rel, lines[i][-40:])
            lines[i] = lines[i] + COUNTS_TAIL_NEW[len(COUNTS_TAIL_OLD)-1:]
    src = "\n".join(lines)
    # ۳) حلقهٔ ترجمه — فقط خطِ بلندِ بانک‌های ۴..۵۹
    src = re.sub(
        r"for \(const bn of \[4, 5, 6(, \d+)*\]\)",
        lambda m: m.group(0).replace(LOOP_TAIL_OLD, LOOP_TAIL_NEW) if m.group(0).endswith(LOOP_TAIL_OLD) else m.group(0),
        src,
    )
    # جایگزینِ ساده‌ترِ مطمئن: دنبالهٔ کاملِ حلقه
    full_old = "for (const bn of [" + ", ".join(str(n) for n in range(4, 60)) + "])"
    full_new = "for (const bn of [" + ", ".join(str(n) for n in range(4, 72)) + "])"
    src = src.replace(full_old, full_new)
    if src != orig:
        p.write_text(src, encoding="utf-8")
        print(f"patched: {rel}")
    else:
        print(f"NO-OP: {rel}")

# ————— r273: فهرستِ درس‌ها ۱..۵۹ → ۱..۷۱ —————
p = ROOT / "tests/jozve-test-bank-r273.test.ts"
src = p.read_text(encoding="utf-8")
old = ", ".join(str(n) for n in range(1, 60)) + "]"
new = ", ".join(str(n) for n in range(1, 72)) + "]"
if old in src:
    src = src.replace(old, new, 1)
    p.write_text(src, encoding="utf-8")
    print("patched: tests/jozve-test-bank-r273.test.ts")
else:
    print("NO-OP: r273 (already wide?)")
