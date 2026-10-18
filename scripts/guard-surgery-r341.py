# -*- coding: utf-8 -*-
# r341 — جراحیِ گاردهای قبلی: 65→66 بانک، 828→848 آیتم، وکتورهای r326/r338 +۲۰ عضو
import re
from pathlib import Path

TESTS = Path("tests")
changed = []
for f in sorted(TESTS.glob("jozve-tests-g10-*.test.ts")):
    if "r341" in f.name:
        continue
    txt = f.read_text(encoding="utf-8")
    orig = txt
    txt = txt.replace("toHaveLength(65)", "toHaveLength(66)")
    txt = txt.replace("toBe(828)", "toBe(848)")
    if txt != orig:
        f.write_text(txt, encoding="utf-8")
        changed.append(f.name)

# وکتورهای شکلِ تجمعی — الحاقِ ۲۰ (بانکِ ۶۶)
for fname, anchor in [
    ("jozve-tests-g10-l2-r326.test.ts", "5, 10, 5, 5]);"),
    ("jozve-tests-g10-l3tashrihi-r338.test.ts", "5, 10, 5, 5]);"),
]:
    p = TESTS / fname
    txt = p.read_text(encoding="utf-8")
    if ", 20]);" in txt:
        print(f"{fname}: already patched")
        continue
    assert anchor in txt, f"anchor not found in {fname}"
    txt = txt.replace(anchor, "5, 10, 5, 5, 20]);", 1)
    p.write_text(txt, encoding="utf-8")
    changed.append(fname + " (vector+20)")

print("patched files:")
for c in changed:
    print(" -", c)
print(f"total: {len(changed)}")
