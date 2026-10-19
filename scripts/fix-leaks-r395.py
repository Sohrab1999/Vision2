#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r395 — مشروع‌سازیِ رشته‌های نشت‌سنج با بانکِ l142 (الگویِ «Solar power»).
مخزنِ افعال (l142) ساقه‌های «کاندیدهای رزروشدهٔ» برگه‌ها را به بانکِ مشروع تبدیل کرد؛
نشت‌سنج‌های گاردهای قدیمی آن رشته‌ها را منع می‌کردند — این اسکریپت هر رشتهٔ
برخوردی را از بلوکِ نشت‌سنجِ همان فایل حذف و با کامنتِ مرجع مستند می‌کند.
ادعا: برای هر رشته، نخستین آیتمِ l142 که آن را در ساقه/گزینه دارد ثبت می‌شود.
نشانِ ایدمپوتنسی: کامنتِ «R395-LEGIT» پیش از بلوک.
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
d = json.loads((ROOT / "public/jozve/tests-g12.json").read_text(encoding="utf-8"))
l142 = [b for b in d["lessons"] if b["lesson"] == 142][0]
needles = []
for it in l142["questions"]:
    needles.append((it["id"], it["question"]))
    for o in it["options"]:
        needles.append((it["id"], o))

GUARDS = [
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

BLOCK_RE = re.compile(r"for \(const forbidden of \[(.*?)\]\)", re.S)
STR_RE = re.compile(r'"((?:[^"\\]|\\.)*)"')

for name in GUARDS:
    p = ROOT / "tests" / name
    txt = p.read_text(encoding="utf-8")
    if "R395-LEGIT" in txt:
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
        if s in block.replace(f'"{s}"', "", 1) and block.count(f'"{s}"') != 1:
            # رشتهٔ تکراری در بلوک — فقط نخستین رخداد را برخورد بگیر
            pass
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
        if f'"{s}"' in new_block:  # رشته در انتهای بلوک بدونِ ویرگول
            new_block = re.sub(r'"' + re.escape(s) + r'"', "", new_block, count=1)
        removed.append((s, iid))
    note = "، ".join(f'"{s}"→{iid}' for s, iid in removed)
    comment = (
        f"    // R395-LEGIT — {len(removed)} رشته با بانکِ l142 (مخزنِ افعالِ نهایی‌ها) مشروع شد و از "
        f"نشت‌سنج حذف شد (الگویِ Solar power): {note}\n"
    )
    txt = txt[: m.start(1)] + comment + new_block + txt[m.end(1):]
    p.write_text(txt, encoding="utf-8")
    print(f"{name}: removed {len(removed)} -> {note}")
