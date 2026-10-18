#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r362 — پروبِ «۳۶۰ تست آموزش واژگان درس ۱ تا ۳» یازدهم (ص۱۱۸-۱۳۵، کلیدِ گریدِ ص۲۰۴)
  ۱) شمارشِ سؤال‌ها و ترتیب ۱..۳۶۰ + صفحهٔ آغازِ هر صدتایی
  ۲) هندسهٔ گریدِ کلیدِ ص۲۰۴ با fitz (رنگ/سایز/مختصاتِ ارقام و حروف)
  ۳) کوئیرک‌های لایه: جداکنندهٔ ساقه (نقطه/خط)، «؟» فارسی، شکستگی‌ها
"""
import re
from pathlib import Path
import fitz

ROOT = Path("/home/z/my-project")
OCR = (ROOT / "booklet-extract/g11.txt").read_text(encoding="utf-8")
LINES = OCR.split("\n")
PDF = "/home/z/my-project/upload/جزوه جامع یازدهم .pdf"

def page_slice(pnum: int) -> list[str]:
    start = next(i for i, l in enumerate(LINES) if f"<<<PAGE {pnum}>>>" in l)
    end = next(i for i in range(start + 1, len(LINES)) if "<<<PAGE" in LINES[i])
    return LINES[start:end]

# ————— ۱) سؤال‌ها —————
STEM_RE = re.compile(r"^(\d{1,3})\s*[.\-]\s*(.+)$")
seg: list[str] = []
for p in range(118, 136):
    seg.extend(page_slice(p))

blocks: list[tuple[int, list[str]]] = []
cur = None
for l in seg:
    s = l.strip()
    if not s:
        continue
    m = STEM_RE.match(s)
    if m:
        n = int(m.group(1))
        cur = (n, [m.group(2)])
        blocks.append(cur)
        continue
    if cur is None:
        continue
    if re.search(r"[\u0600-\u06FF]", s):
        cur = None
        continue
    cur[1].append(s)

print(f"blocks={len(blocks)}")
nums = [b[0] for b in blocks]
print("sequence 1..360 intact:", nums == list(range(1, 361)))
if nums != list(range(1, 361)):
    # یافتنِ شکست‌ها
    for i, n in enumerate(nums):
        if n != i + 1:
            print(f"  first break at idx {i}: got Q{n}")
            break
# صفحهٔ آغازِ هر بلاکِ ۱۲۰تایی
page_of = {}
pcur = None
for l in seg:
    m = re.match(r"<<<PAGE (\d+)>>>", l.strip())
    if m:
        pcur = int(m.group(1))
    s = l.strip()
    mm = STEM_RE.match(s)
    if mm and pcur and int(mm.group(1)) not in page_of:
        page_of[int(mm.group(1))] = pcur
for q in (1, 120, 121, 240, 241, 360):
    print(f"  Q{q} starts on page {page_of.get(q)}")

# ————— ۲) گریدِ ص۲۰۴ —————
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
            spans.append((t, sp.get("size", 0), sp.get("color", 0), *sp["bbox"]))
print(f"\np204 spans={len(spans)}")
from collections import Counter
cnt = Counter()
for t, sz, col, *_ in spans:
    if re.fullmatch(r"\d{1,3}", t):
        cnt[("num", round(sz, 1), col)] += 1
    elif re.fullmatch(r"[abcd]", t):
        cnt[("let", round(sz, 1), col)] += 1
print("cell-span classes:", dict(cnt))

nums_sp = [(y0, x0, int(t)) for t, sz, col, x0, y0, x1, y1 in spans
           if re.fullmatch(r"\d{1,3}", t) and y0 > 120]  # زیرِ سربرگ
lets_sp = [(y0, x0, t) for t, sz, col, x0, y0, x1, y1 in spans
           if re.fullmatch(r"[abcd]", t) and y0 > 120]
print(f"grid nums={len(nums_sp)} lets={len(lets_sp)}")
nums_set = sorted(n for _, _, n in nums_sp)
print("numbers 1..360 complete:", nums_set == list(range(1, 361)))

# ردیف‌بندی با y/5 و جفت‌سازی
rows: dict[int, list] = {}
for y, x, t in nums_sp + lets_sp:
    rows.setdefault(round(y / 5), []).append((x, t))
print(f"rows={len(rows)} (expected 40 for 360 cells)")
bad = 0
KEY = {}
for rk, cell in sorted(rows.items()):
    nums_r = sorted([(x, n) for x, n in cell if isinstance(n, int)])
    lets_r = sorted([(x, l) for x, l in cell if not isinstance(n if False else l, int)]) if False else sorted([(x, l) for x, l in cell if not isinstance(l, int)])
    if len(nums_r) != len(lets_r):
        print(f"  row {rk}: {len(nums_r)}n/{len(lets_r)}l MISMATCH")
        bad += 1
        continue
    for (xn, n), (xl, l) in zip(nums_r, lets_r):
        if xl <= xn:
            print(f"  row {rk}: letter {l} NOT right of number {n} (x_let={xl:.1f} x_num={xn:.1f})")
            bad += 1
        KEY[n] = l
print(f"pairing bad rows: {bad}")
print("KEY covers 1..360:", sorted(KEY) == list(range(1, 361)))
if sorted(KEY) == list(range(1, 361)):
    from collections import Counter as C
    print("letter distribution:", dict(C(KEY.values())))
    print("spot: Q1=", KEY[1], "Q120=", KEY[120], "Q241=", KEY[241], "Q360=", KEY[360])
    # نمونهٔ سطرِ نخستِ چاپ: 1=a 41=a 81=c 121=b 161=b 201=b 241=a 281=d 321=b (لایهٔ متنی)
    print("row1 of print:", [KEY[q] for q in (1, 41, 81, 121, 161, 201, 241, 281, 321)])

# ————— ۳) کوئیرک‌ها —————
print("\n— quirks —")
# جداکنندهٔ ساقه
dashes = sum(1 for b in blocks if re.match(r"^(\d{1,3})-\s", ""))
dots = sum(1 for b in blocks if re.match(r"^(\d{1,3})\.\s", ""))
print(f"stem separators: dash={dashes} dot={dots}")
# علامت سؤال فارسی
pq = [n for n, ls in blocks if any("؟" in x for x in ls)]
print("Persian ؟ in stems:", pq)
# بلنک‌ها: طولِ رانِ تیره
lens = Counter()
for n, ls in blocks:
    txt = re.sub(r"\s+", " ", " ".join(ls))
    for m in re.finditer(r"-{2,}", txt):
        lens[len(m.group(0))] += 1
print("dash-run lengths:", dict(sorted(lens.items())))
# آپاستروف/گیومه
odd = [n for n, ls in blocks if any(re.search(r"[“”‘’]", x) for x in ls)]
print("curly quotes in:", odd[:10])
# تکرارِ ساقه/گزینه
def norm(q): return re.sub(r"-{2,}", "—", q)
dups = []
for i in range(len(blocks)):
    for j in range(i + 1, len(blocks)):
        if norm(" ".join(blocks[i][1])) == norm(" ".join(blocks[j][1])):
            dups.append((blocks[i][0], blocks[j][0]))
print("duplicate stems:", dups[:10])
