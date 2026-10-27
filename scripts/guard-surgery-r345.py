# -*- coding: utf-8 -*-
# r345 — جراحیِ گاردهای قبلی: ۷۶→۸۰ بانک، ۹۶۵→۱۰۲۲ آیتم (و توصیف‌های کهنهٔ «74 banks, 951 items»)
import re
from pathlib import Path

TESTS = Path("tests")
files = sorted(TESTS.glob("jozve-tests-g10-*.test.ts"))
touched = 0
for f in files:
    if "r345" in f.name:
        continue
    src = f.read_text(encoding="utf-8")
    out = src
    out = out.replace("toHaveLength(76)", "toHaveLength(80)")
    out = out.replace("toBe(965)", "toBe(1022)")
    out = out.replace("76 banks, 965 items", "80 banks, 1022 items")
    out = out.replace("74 banks, 951 items", "80 banks, 1022 items")
    if out != src:
        f.write_text(out, encoding="utf-8")
        n = len(re.findall(r"toHaveLength\(80\)|toBe\(1022\)|80 banks, 1022 items", out)) - len(
            re.findall(r"toHaveLength\(80\)|toBe\(1022\)|80 banks, 1022 items", src))
        touched += 1
        print(f"patched {f.name}")
print(f"--- {touched} files patched")
