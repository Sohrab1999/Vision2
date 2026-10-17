#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r318 — استخراجِ ساختارِ بلوک‌های «ترجمه تست» از لایهٔ متنِ ص۱۸۱-۱۸۴ (l1).

خروجی: /tmp/l1-blocks.json
  [{n, key(inline letter or None), frags[...], page, y0, y1}, ...]

الگو: هر بلوک با شمارهٔ سؤال شروع می‌شود (خطِ عددیِ مستقل یا درون‌خطیِ «-83»).
دو چیدمانِ چاپی دیده شد:
  A) چندخطی: «N» / «- (» / «b» / «)» / «:ترجمه تست "» / خطوطِ ترجمه
  B) درون‌خطی: «.متن  :ترجمه تست (a) -83»
همچنین گریدِ کلیدِ ص۱۸۴ (y>555) با جفت‌های (عدد، حرف) استخراج می‌شود.
"""
import json
import re
import fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
PAGES = (181, 182, 183, 184)
GRID_TOP = 555.0

doc = fitz.open(PDF)

# ---------- گریدِ کلیدِ ص۱۸۴ ----------
page = doc[183]
words = [w for w in page.get_text("words") if w[1] > GRID_TOP and w[1] < 800]
ws = sorted(words, key=lambda w: (round(w[1] / 12), w[0]))
rows = {}
for w in ws:
    rows.setdefault(round(w[1] / 12), []).append(w[4])
grid = {}
row_dump = []
for rk, toks in sorted(rows.items()):
    row_dump.append(" ".join(toks))
    i = 0
    while i + 1 < len(toks):
        a, b = toks[i], toks[i + 1]
        if re.fullmatch(r"\d{1,3}", a) and re.fullmatch(r"[abcd]", b):
            grid[int(a)] = b
            i += 2
        elif re.fullmatch(r"[abcd]", a) and re.fullmatch(r"\d{1,3}", b):
            grid[int(b)] = a
            i += 2
        else:
            i += 1
print("grid rows:", len(row_dump))
for r in row_dump:
    print("  row:", r)
print("grid size:", len(grid))

# ---------- بلوک‌های ترجمه ----------
def parse_page(pno):
    page = doc[pno - 1]
    d = page.get_text("dict")
    ycap = GRID_TOP if pno == 184 else 10**9  # ص۱۸۴: فقط ناحیهٔ ترجمه، نه گرید
    items = []  # (y0, x0, text)
    for blk in d.get("blocks", []):
        for ln in blk.get("lines", []):
            txt = "".join(sp["text"] for sp in ln.get("spans", [])).strip()
            if not txt:
                continue
            y = ln["bbox"][1]
            if y >= ycap:
                continue
            x = ln["bbox"][0]
            items.append((y, x, txt))
    items.sort(key=lambda t: (round(t[0], 1), t[1]))
    return items

blocks = []
cur = None
for pno in PAGES:
    items = parse_page(pno)
    for y, x, txt in items:
        # حذفِ خطوطِ تزئینیِ خط‌چین و سربرگ
        if re.fullmatch(r"[-ـ—\s]+", txt):
            continue
        if re.search(r"جزوه|جام|Vision|تألیف|گردآوری|پایه دو", txt) and len(txt) < 60:
            continue
        # B) درون‌خطی: ...ترجمه تست (X) -N  یا  ...ترجمه تست (X)-N
        m = re.search(r"ترجمه تست\s*\(?([abcd])\)?\s*-\s*(\d{1,3})\b", txt)
        if m:
            if cur:
                blocks.append(cur)
            n = int(m.group(2))
            body = txt[: m.start()].strip()
            cur = {"n": n, "key": m.group(1), "page": pno, "y0": y, "frags": [body] if body else []}
            continue
        # B2) درون‌خطی بدونِ شماره (ادامهٔ قبلیِ شماره‌دار) — «ترجمه تست (X)» خالص
        m2 = re.search(r"ترجمه تست\s*\(?([abcd])\)?\s*\"?\s*$", txt)
        if m2 and re.search(r"ترجمه تست", txt):
            if cur and not re.search(r"ترجمه تست", cur["frags"][-1] if cur["frags"] else ""):
                pass
            # خطِ آغازینِ B2: شماره در انتهایِ متنِ RTL ممکن است جدا باشد — بعداً با دنباله پر می‌شود
            if cur is None or cur.get("closed"):
                cur = {"n": None, "key": m2.group(1), "page": pno, "y0": y, "frags": []}
                body = txt[: m2.start()].strip()
                if body:
                    cur["frags"].append(body)
                blocks.append(cur)
                cur = None
                continue
        # A) شروعِ بلوک: خطِ عددیِ مستقل
        if re.fullmatch(r"(\d{1,3})\s*[-–]?\s*\(?", txt.strip()) or re.fullmatch(r"\s*(\d{1,3})\s*", txt):
            m3 = re.search(r"(\d{1,3})", txt)
            n = int(m3.group(1))
            if cur:
                blocks.append(cur)
            cur = {"n": n, "key": None, "page": pno, "y0": y, "frags": []}
            continue
        # حرفِ کلیدِ مستقل
        if re.fullmatch(r"\(?([abcd])\)?", txt.strip()) and cur is not None and cur["key"] is None:
            cur["key"] = re.fullmatch(r"\(?([abcd])\)?", txt.strip()).group(1)
            continue
        # خطوطِ ترجمه
        if cur is not None:
            clean = re.sub(r"ترجمه تست", "", txt).strip()
            if clean and not re.fullmatch(r"[:\"'\s،؛\.]+", clean):
                cur["frags"].append(clean)
if cur:
    blocks.append(cur)

print("blocks:", len(blocks))
ns = [b["n"] for b in blocks if b["n"]]
print("numbered:", len(ns), "min:", min(ns) if ns else "-", "max:", max(ns) if ns else "-")
missing = [i for i in range(1, 101) if i not in ns]
print("missing numbers:", missing)
nokey = [b["n"] for b in blocks if b.get("key") is None and b["n"]]
print("no inline key:", nokey)
empty = [b["n"] for b in blocks if not b["frags"]]
print("empty frags:", empty)

out = {"grid": grid, "blocks": blocks}
with open("/tmp/l1-blocks.json", "w") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
print("saved /tmp/l1-blocks.json")
doc.close()
