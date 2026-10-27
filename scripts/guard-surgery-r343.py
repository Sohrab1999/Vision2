# -*- coding: utf-8 -*-
# r343 — جراحیِ گاردهای قبلی: 73→74 بانک، 905→951 آیتم، وکتورهای r326/r338 +۴۶ عضو
import re
from pathlib import Path

TESTS = Path("tests")
changed = []
for f in sorted(TESTS.glob("jozve-tests-g10-*.test.ts")):
    if "r343" in f.name:
        continue
    txt = f.read_text(encoding="utf-8")
    orig = txt
    txt = txt.replace("toHaveLength(73)", "toHaveLength(74)")
    txt = txt.replace("toBe(905)", "toBe(951)")
    if txt != orig:
        f.write_text(txt, encoding="utf-8")
        changed.append(f.name)

# وکتورهای شکلِ تجمعی — الحاقِ ۴۶ (بانکِ ۷۴)
for fname in ("jozve-tests-g10-l2-r326.test.ts", "jozve-tests-g10-l3tashrihi-r338.test.ts"):
    p = TESTS / fname
    txt = p.read_text(encoding="utf-8")
    if ", 46]);" in txt:
        print(f"{fname}: already patched")
        continue
    m = re.search(r"toEqual\(\[([^\]]*)\]\);", txt)
    assert m, f"shape vector not found in {fname}"
    vec = m.group(1).rstrip()
    assert vec.endswith("7"), f"unexpected vector tail in {fname}: ...{vec[-20:]}"
    txt = txt[:m.start(1)] + vec + ", 46" + txt[m.end(1):]
    p.write_text(txt, encoding="utf-8")
    changed.append(fname + " (vector+46)")

print("patched files:")
for c in changed:
    print(" -", c)
print(f"total: {len(changed)}")
