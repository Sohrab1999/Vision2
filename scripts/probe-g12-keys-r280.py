#!/usr/bin/env python3
"""probe-g12-keys-r280.py — یافتن همهٔ بلوک‌های کلید گرامر در g12.json (همهٔ فصل‌ها)
سه الگو: گرید ردیفی «1 b 11 b ...»، توضیحی «-Nگزینه (X)»، و «N .گزینه (X)»
"""
import json
import re

ROOT = "/home/z/my-project"
G12 = f"{ROOT}/public/jozve/g12.json"

g12 = json.load(open(G12))

# گرید ردیفی: خط‌های حاوی حداقل ۳ جفت (عدد، حرف)
GRID_ROW = re.compile(r"(\d{1,3})\s+([a-d])(?=\s|$)")
# توضیحی: -Nگزینه (X) یا N-گزینه(X) یا N.گزینه(X)
EXPL = re.compile(r"-?\s*(\d{1,3})\s*گزینه\s*\(\s*([a-d])\s*\)")

for ch in g12["chapters"]:
    for i, s in enumerate(ch["sections"]):
        lines = s["lines"]
        joined = "\n".join(lines)
        # گرید: خط‌هایی که ≥۳ جفت دارند
        grid_rows = [l for l in lines if len(GRID_ROW.findall(l)) >= 3 and re.search(r"[^\d\s a-d]", l.replace(" ", "")) is None]
        expl = EXPL.findall(joined)
        has_key_header = re.search(r"پاس\s*خ?\s*.{0,4}نامه|پاسخنامه", joined)
        if (len(grid_rows) >= 3 or len(expl) >= 5) and has_key_header:
            nums_grid = []
            for l in grid_rows:
                nums_grid += [int(n) for n, _ in GRID_ROW.findall(l)]
            uniq_g = sorted(set(nums_grid))
            uniq_e = sorted(set(int(n) for n, _ in expl))
            title = next((l for l in lines if re.search(r"پاسخنامه|پاس\s*خ", l) and len(l) > 5), lines[0] if lines else "")
            print(f"{ch['id']}/sec{i:2d} ({len(lines):3d}L): GRID rows={len(grid_rows)} keys={len(uniq_g)} {uniq_g[:3]}..{uniq_g[-3:] if uniq_g else ''} | EXPL={len(uniq_e)} {uniq_e[:5]}")
            print(f"      title: {title[:90]}")
