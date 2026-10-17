# r314 — 600dpi full-width zoom for the 16 ambiguous items, 4 per composite
import re
import fitz
from PIL import Image, ImageDraw

PDF = 'upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf'
DPI = 600
SCALE = DPI / 72
EXPECT = {207: 10, 208: 16, 209: 14, 210: 10}
FIRST = {207: 1, 208: 11, 209: 27, 210: 41}
TARGETS = [1, 7, 9, 10, 13, 22, 26, 28, 30, 31, 33, 35, 39, 41, 43, 45]

doc = fitz.open(PDF)
item_band = {}
for pno in (207, 208, 209, 210):
    page = doc[pno - 1]
    d = page.get_text('dict')
    ymax = 820
    if pno == 210:
        for blk in d['blocks']:
            for ln in blk.get('lines', []):
                if 'بقیه' in ''.join(sp['text'] for sp in ln['spans']):
                    ymax = min(sp['bbox'][1] for sp in ln['spans']) - 10
    ys = []
    for blk in d['blocks']:
        for ln in blk.get('lines', []):
            if any(sp['color'] in (0xCC0000, 0xFF0000, 0xC00000) for sp in ln['spans']):
                y0 = min(sp['bbox'][1] for sp in ln['spans'])
                y1 = max(sp['bbox'][3] for sp in ln['spans'])
                if 60 < y0 < ymax:
                    ys.append((y0, y1))
    ys.sort()
    gaps = sorted(ys[i + 1][0] - ys[i][1] for i in range(len(ys) - 1))
    nmerge = len(ys) - EXPECT[pno]
    T = (gaps[nmerge - 1] + 0.1) if nmerge else -1e9
    merged = []
    for y0, y1 in ys:
        if merged and y0 - merged[-1][1] <= T:
            merged[-1] = (merged[-1][0], max(merged[-1][1], y1))
        else:
            merged.append((y0, y1))
    assert len(merged) == EXPECT[pno]
    for bi, (y0, y1) in enumerate(merged):
        item_band[FIRST[pno] + bi] = (pno, y0, y1)

# also include the item's SECOND band when a translation wraps (item anchor offsets):
# detect by gap: if next band on same page starts within 60pt, treat as continuation
for pno in (207, 208, 209, 210):
    bands = []
    for bi, (y0, y1) in enumerate([(b[1], b[2]) for b in [item_band[FIRST[pno] + k] for k in range(EXPECT[pno])]]):
        pass  # merged already; continuation handled by merge tolerance

pixcache = {}
for ci in range(0, len(TARGETS), 4):
    chunk = TARGETS[ci:ci + 4]
    pieces = []
    for n in chunk:
        pno, y0, y1 = item_band[n]
        if pno not in pixcache:
            pix = doc[pno - 1].get_pixmap(dpi=DPI)
            pixcache[pno] = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
        img = pixcache[pno]
        top = max(0, int((y0 - 3) * SCALE))
        bot = min(img.height, int((y1 + 3) * SCALE))
        pieces.append((n, img.crop((0, top, img.width, bot))))
    W = max(p.width for _, p in pieces)
    H = sum(p.height + 34 for _, p in pieces)
    comp = Image.new('RGB', (W, H), (255, 255, 255))
    dr = ImageDraw.Draw(comp)
    y = 0
    for n, p in pieces:
        dr.rectangle([(0, y + p.height), (300, y + p.height + 32)], fill=(255, 255, 220))
        dr.text((12, y + p.height + 6), f'=== item {n} ===', fill=(0, 0, 200))
        comp.paste(p, (0, y))
        y += p.height + 34
    out = f'/tmp/r314-zoom-a{ci // 4 + 1}.png'
    comp.save(out)
    print(out, 'items', chunk, comp.size)
