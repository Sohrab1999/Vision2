#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r362b — داوریِ دوگانهٔ ۲۲۸/۳۳۳ با گریدِ ص۲۰۴"""
import re
from pathlib import Path
import fitz
from collections import Counter

ROOT = Path("/home/z/my-project")
PDF = "/home/z/my-project/upload/جزوه جامع یازدهم .pdf"
doc = fitz.open(PDF)
d = doc[203].get_text("dict")
spans = []
for blk in d.get("blocks", []):
    if blk.get("type", 0) != 0:
        continue
    for ln in blk.get("lines", []):
        for sp in ln.get("spans", []):
            t = sp.get("text", "").strip()
            if not t:
                continue
            spans.append((t, round(sp.get("size", 0), 1), sp.get("color", 0), sp["bbox"][0], sp["bbox"][1]))

lets = [(x0, y0, t) for t, sz, col, x0, y0 in spans if re.fullmatch(r"[abcd]", t) and sz == 13.0 and col == 12582912]
nums = [(x0, y0, int(t)) for t, sz, col, x0, y0 in spans if re.fullmatch(r"\d{1,3}", t) and sz == 13.0 and col == 855309]
print(f"letters={len(lets)} numbers={len(nums)}")
ns = sorted(n for _, _, n in nums)
print("numbers complete 1..360:", ns == list(range(1, 361)))
if ns != list(range(1, 361)):
    print("  missing:", sorted(set(range(1, 361)) - set(ns)), "extra:", sorted(set(ns) - set(range(1, 361))))
ls_count = Counter(t for _, _, t in lets)
print("letter distribution:", dict(ls_count))

# ردیف‌بندی: مرتب‌سازی با y و خوشه‌بندی با شکافِ > 6pt
cells = sorted([(y0, x0, "n" if isinstance(t, int) else "l", t) for x0, y0, t in nums + lets])
rows = []
cur = [cells[0]]
for c in cells[1:]:
    if c[0] - cur[-1][0] > 6:
        rows.append(cur)
        cur = [c]
    else:
        cur.append(c)
rows.append(cur)
print(f"row clusters: {len(rows)}")
KEY = {}
bad = 0
for ri, row in enumerate(rows):
    nr = sorted([(x, t) for _, x, k, t in row if k == "n"])
    lr = sorted([(x, t) for _, x, k, t in row if k == "l"])
    if len(nr) != len(lr):
        print(f"  row {ri} y≈{row[0][0]:.0f}: {len(nr)}n/{len(lr)}l MISMATCH")
        bad += 1
        continue
    for (xn, n), (xl, l) in zip(nr, lr):
        if not (xl > xn):
            print(f"  row {ri}: letter {l} not right of number {n}")
            bad += 1
        KEY[n] = l
print(f"bad rows: {bad}; KEY covers: {len(KEY)}")
if len(KEY) == 360:
    print("spot: Q1=", KEY[1], "Q41=", KEY[41], "Q228=", KEY[228], "Q333=", KEY[333], "Q360=", KEY[360])
    print("print-row1 (1,41,81,121,161,201,241,281,321):", [KEY[q] for q in (1, 41, 81, 121, 161, 201, 241, 281, 321)])

# ————— گزینه‌های دو نامزدِ ۲۲۸ و آیتمِ پس از ۳۳۲ —————
OCR = (ROOT / "booklet-extract/g11.txt").read_text(encoding="utf-8")
LINES = OCR.split("\n")
def page_slice(p):
    s = next(i for i, l in enumerate(LINES) if f"<<<PAGE {p}>>>" in l)
    e = next(i for i in range(s + 1, len(LINES)) if "<<<PAGE" in LINES[i])
    return LINES[s:e]

def find_stem(label: str, pages, nth: int = 1):
    """nth-مین رخدادِ ساقهٔ با برچسبِ label در صفحات — ساقه + گزینه‌ها تا ساقهٔ بعدی"""
    seg = []
    for p in pages:
        seg += page_slice(p)
    hits = [i for i, l in enumerate(seg) if re.match(rf"^{label}\b", l.strip())]
    i = hits[nth - 1]
    chunk = []
    for l in seg[i:]:
        s = l.strip()
        if chunk and re.match(r"^\d{1,3}\s*[.\-]\s+\S", s):
            break
        if re.search(r"[\u0600-\u06FF]", s) and chunk and not re.match(rf"^{label}", s):
            break
        chunk.append(s)
    return " | ".join(x for x in chunk if x)

print("\n— 228 p128 (childcare, displaced) —")
print(find_stem("228", [128], 1))
print("\n— 228 p129 (teacher, in-sequence) —")
print(find_stem("228", [129, 130], 1))
print("\n— 332 (context) —")
print(find_stem("332", [132, 133], 1))
print("\n— 334 (labeled; physically #333) —")
print(find_stem("334", [133, 134], 1))
print("\n— 333 (should be absent) —")
seg333 = [l for p in (132, 133, 134) for l in page_slice(p) if re.match(r"^333\b", l.strip())]
print("333-label hits:", len(seg333))
