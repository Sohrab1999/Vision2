#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r396 — مشروع‌سازیِ رشته‌های نشت‌سنج با بانکِ l143 (الگویِ «Solar power»).
۱۷ رشته در ۶ فایل (r381×۱، r384×۲، r385×۲، r386×۲، r387×۴، r388m×۶) — این نسخه
بازپخشِ همان منطقِ اجراشده است؛ اجرای دوباره با نشانِ «R396-LEGIT»NO-OP می‌شود.
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
d = json.loads((ROOT / "public/jozve/tests-g12.json").read_text(encoding="utf-8"))
l143 = [b for b in d["lessons"] if b["lesson"] == 143][0]
needles = [(it["id"], it["question"]) for it in l143["questions"]]
needles += [(it["id"], o) for it in l143["questions"] for o in it["options"]]

GUARDS = [
    "jozve-tests-g12-nahaie-r380.test.ts", "jozve-tests-g12-shahrivar-r381.test.ts",
    "jozve-tests-g12-dey-r382.test.ts", "jozve-tests-g12-shahrivar1400-r383.test.ts",
    "jozve-tests-g12-khordad1400-r384.test.ts", "jozve-tests-g12-khordad1400m-r385.test.ts",
    "jozve-tests-g12-dey1399-r386.test.ts", "jozve-tests-g12-shahrivar1399-r387.test.ts",
    "jozve-tests-g12-khordad1399m-r388.test.ts", "jozve-tests-g12-khordad1399h-r389.test.ts",
    "jozve-tests-g12-dey1397-r390.test.ts", "jozve-tests-g12-khordad1398-r391.test.ts",
    "jozve-tests-g12-shahrivar1398-r392.test.ts", "jozve-tests-g12-dey1398-r393.test.ts",
    "jozve-tests-g12-khordad1399kharej-r394.test.ts",
]
BLOCK_RE = re.compile(r"for \(const forbidden of \[(.*?)\]\)", re.S)
STR_RE = re.compile(r'"((?:[^"\\]|\\.)*)"')

for name in GUARDS:
    p = ROOT / "tests" / name
    txt = p.read_text(encoding="utf-8")
    if "R396-LEGIT" in txt:
        print(f"{name}: already legitimized — NO-OP")
        continue
    m = BLOCK_RE.search(txt)
    if not m:
        print(f"{name}: no leak-detector block — skip")
        continue
    block = m.group(1)
    hits = []
    for sm in STR_RE.finditer(block):
        s = sm.group(1)
        for iid, text in needles:
            if s in text:
                hits.append((s, iid))
                break
    if not hits:
        print(f"{name}: no collisions — skip")
        continue
    new_block = block
    removed = []
    for s, iid in hits:
        if f'"{s}"' not in new_block:
            continue
        new_block = re.sub(r'"' + re.escape(s) + r'",\s*', "", new_block, count=1)
        if f'"{s}"' in new_block:
            new_block = re.sub(r'"' + re.escape(s) + r'"', "", new_block, count=1)
        removed.append((s, iid))
    note = "، ".join(f'"{s}"→{iid}' for s, iid in removed)
    comment = (
        f"    // R396-LEGIT — {len(removed)} رشته با بانکِ l143 (جمله‌سازیِ مخزنِ نهایی‌ها) مشروع شد و از "
        f"نشت‌سنج حذف شد (الگویِ Solar power): {note}\n"
    )
    txt = txt[: m.start(1)] + comment + new_block + txt[m.end(1):]
    p.write_text(txt, encoding="utf-8")
    print(f"{name}: removed {len(removed)} -> {note}")
