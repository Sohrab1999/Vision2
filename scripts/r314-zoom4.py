# r314 — targeted 600dpi zoom via ANCHOR BLOCK RANGES (verified against 300dpi composites)
# p207: 10 anchors = items 1-10 | p208: 15 anchors = 12-26 + page-top block = 11
# p209: 15 anchors = 28-40 with one stray inside item 33 (range6+7 merge)
# p210: 10 anchors = 41-50 | targets: 16 ambiguous items, halves-stacked 600dpi crops
import re
import fitz
from PIL import Image, ImageDraw

PDF = 'upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf'
DPI = 600
SCALE = DPI / 72
TARGETS = [1, 7, 9, 10, 13, 22, 26, 28, 30, 31, 33, 35, 39, 41, 43, 45]

doc = fitz.open(PDF)
item_ranges = {}  # item -> list of (page, y0, y1)
for pno, mapping in [(207, {a: a for a in range(1, 11)}),
                     (208, {**{a: a + 1 for a in range(1, 16)}, 0: 11}),  # anchor1..15 -> items 12..26; page-top -> 11
                     (210, {a: a + 40 for a in range(1, 11)})]:
    page = doc[pno - 1]
    d = page.get_text('dict')
    grid_y = None
    if pno == 210:
        for blk in d['blocks']:
            for ln in blk.get('lines', []):
                if 'بقیه' in ''.join(sp['text'] for sp in ln['spans']):
                    grid_y = min(sp['bbox'][1] for sp in ln['spans'])
    anchors = []
    for blk in d['blocks']:
        for ln in blk.get('lines', []):
            txt = ''.join(sp['text'] for sp in ln['spans']).strip()
            if re.match(r'^\d{1,2}\s*-?\s*$', txt) or re.match(r'^\d{1,2}\s*-\s*گزینه', txt):
                y = min(sp['bbox'][1] for sp in ln['spans'])
                if 60 < y < 820 and (grid_y is None or y < grid_y - 10):
                    anchors.append(y)
    anchors.sort()
    if pno == 208:
        bounds = [60.0] + anchors + [830.0]
        ids = [0] + list(range(1, 16))
    else:
        bounds = anchors + [830.0]
        ids = list(range(1, len(anchors) + 1))
    for i, aid in enumerate(ids):
        item = mapping[aid]
        item_ranges.setdefault(item, []).append((pno, bounds[i] - 6, bounds[i + 1] - 8))

# p209 manual: anchors sorted; stray index unknown -> detect by matching anchor numbers text
page = doc[209 - 1]
d = page.get_text('dict')
rows = []
for blk in d['blocks']:
    for ln in blk.get('lines', []):
        txt = ''.join(sp['text'] for sp in ln['spans']).strip()
        m = re.match(r'^(\d{1,2})\s*-?\s*$', txt) or re.match(r'^(\d{1,2})\s*-\s*گزینه', txt)
        if m:
            y = min(sp['bbox'][1] for sp in ln['spans'])
            if 60 < y < 820:
                rows.append((y, int(m.group(1))))
rows.sort()
nums = [n for _, n in rows]
print('p209 anchor number tokens in y-order:', nums)
# expected sequence 28..40; token that breaks monotonic +1 (dup or jump) is the stray
seq, cur = [], 27
for n in nums:
    if n == cur + 1:
        cur = n
        seq.append((n, False))
    else:
        seq.append((n, True))  # stray (or glyph-dropped duplicate)
bounds = [y for y, _ in rows] + [830.0]
item = 27
for i, (n, stray) in enumerate(seq):
    if not stray:
        item = n
    item_ranges.setdefault(item, []).append((209, bounds[i] - 6, bounds[i + 1] - 8))

# crop: for each target, collect red bands within its ranges, merge, halves-stack
def red_bands_in(page, y0, y1):
    d = page.get_text('dict')
    ys = []
    for blk in d['blocks']:
        for ln in blk.get('lines', []):
            if any(sp['color'] in (0xCC0000, 0xFF0000, 0xC00000) for sp in ln['spans']):
                a0 = min(sp['bbox'][1] for sp in ln['spans'])
                a1 = max(sp['bbox'][3] for sp in ln['spans'])
                if y0 - 2 <= a0 <= y1:
                    ys.append((a0, a1))
    ys.sort()
    merged = []
    for a0, a1 in ys:
        if merged and a0 <= merged[-1][1] + 6:
            merged[-1] = (merged[-1][0], max(merged[-1][1], a1))
        else:
            merged.append((a0, a1))
    return merged

pixcache = {}
for ci in range(0, len(TARGETS), 4):
    chunk = TARGETS[ci:ci + 4]
    pieces = []
    for n in chunk:
        bands = []
        for pno, y0, y1 in item_ranges[n]:
            bands += [(pno, a0, a1) for a0, a1 in red_bands_in(doc[pno - 1], y0, y1)]
        assert bands, f'no red bands for item {n}'
        if n not in pixcache:
            pno0 = bands[0][0]
            pix = doc[pno0 - 1].get_pixmap(dpi=DPI)
            pixcache[n] = (pno0, Image.frombytes('RGB', (pix.width, pix.height), pix.samples))
        pno0, img = pixcache[n]
        tops = []
        for pno, a0, a1 in bands:
            assert pno == pno0, f'item {n} bands span pages'
            tops.append((int((a0 - 3) * SCALE), int((a1 + 3) * SCALE)))
        band = img.crop((0, tops[0][0], img.width, tops[-1][1]))
        w2 = band.width // 2
        pieces.append((n, band.crop((w2, 0, band.width, band.height)), True))   # right half (start of RTL line)
        pieces.append((n, band.crop((0, 0, w2, band.height)), False))          # left half
    W = max(p.width for _, p, _ in pieces)
    H = sum(p.height + 32 for _, p, _ in pieces)
    comp = Image.new('RGB', (W, H), (255, 255, 255))
    dr = ImageDraw.Draw(comp)
    y = 0
    for n, p, right in pieces:
        tag = f'=== item {n} {"RIGHT" if right else "LEFT"} ==='
        dr.rectangle([(0, y + p.height), (330, y + p.height + 30)], fill=(255, 255, 220))
        dr.text((12, y + p.height + 4), tag, fill=(0, 0, 200))
        comp.paste(p, (0, y))
        y += p.height + 32
    out = f'/tmp/r314-zb{ci // 4 + 1}.png'
    comp.save(out)
    print(out, 'items', chunk, comp.size)
