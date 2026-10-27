# -*- coding: utf-8 -*-
# r344 — جراحیِ گاردهای قبلی: 74→76 بانک، 951→965 آیتم، وکتورهای r326/r338 +۴ و +۱۰ عضو
import re
from pathlib import Path

TESTS = Path("tests")
changed = []
for f in sorted(TESTS.glob("jozve-tests-g10-*.test.ts")):
    if "r344" in f.name:
        continue
    txt = f.read_text(encoding="utf-8")
    orig = txt
    txt = txt.replace("toHaveLength(74)", "toHaveLength(76)")
    txt = txt.replace("toBe(951)", "toBe(965)")
    if txt != orig:
        f.write_text(txt, encoding="utf-8")
        changed.append(f.name)

# وکتورهای شکلِ تجمعی — الحاقِ ۴ و ۱۰ (بانک‌های ۷۵/۷۶)
for fname in ("jozve-tests-g10-l2-r326.test.ts", "jozve-tests-g10-l3tashrihi-r338.test.ts"):
    p = TESTS / fname
    txt = p.read_text(encoding="utf-8")
    if ", 4, 10]);" in txt:
        print(f"{fname}: already patched")
        continue
    m = re.search(r"toEqual\(\[([^\]]*)\]\);", txt)
    assert m, f"shape vector not found in {fname}"
    vec = m.group(1).rstrip()
    assert vec.endswith("46"), f"unexpected vector tail in {fname}: ...{vec[-20:]}"
    txt = txt[: m.start(1)] + vec + ", 4, 10" + txt[m.end(1):]
    p.write_text(txt, encoding="utf-8")
    changed.append(fname + " (vector+4,+10)")

print("patched files:")
for c in changed:
    print(" -", c)
print(f"total: {len(changed)}")
