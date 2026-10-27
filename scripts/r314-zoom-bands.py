# r314 — 600dpi zoom of all 50 red translation bands, stacked into composites of ~6 bands
import re
import fitz
from PIL import Image, ImageDraw

PDF = 'upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf'
DPI = 600
SCALE = DPI / 72

doc = fitz.open(PDF)

# collect red bands per page with item assignment = nearest item anchor ABOVE,
# where anchors are ordered per page and item numbers run 1..50 across pages by order
pages = (207, 208, 209, 210)
per_page_anchors = {}
for pno in pages:
    page = doc[pno - 1]
    d = page.get_text('dict')
    grid_y = None
    if pno == 210:
        for blk in d['blocks']:
            for ln in blk.get('lines', []):
                if 'بقیه' in ''.join(sp['text'] for sp in ln['spans']):
                    grid_y = min(sp['bbox'][1] for sp in ln['spans'])
    ys = []
    for blk in d['blocks']:
        for ln in blk.get('lines', []):
            txt = ''.join(sp['text'] for sp in ln['spans']).strip()
            if re.match(r'^\d{1,2}\s*-?\s*$', txt) or re.match(r'^\d{1,2}\s*-\s*گزینه', txt):
                y = min(sp['bbox'][1] for sp in ln['spans'])
                if 60 < y < 820 and (grid_y is None or y < grid_y - 10):
                    ys.append(y)
    ys.sort()
    per_page_anchors[pno] = ys

# global item order: p207 anchors 1..10 = items 1..10; p208 first anchor = item 12 (item 11
# anchor undetected) — so anchor counts per page: 10,15,15,10 -> but booklet numbers
# 1..10,12..26,28..42?? -> unreliable. Use RED BAND ORDER + known item->page ranges instead.
# Page ranges derived from booklet print seen in composites:
# p207: 1-10, p208: 11-26, p209: 27-41(42?), p210: 41/42-50. We assign bands to items by
# sequential band order globally: 50 red bands == 50 items in order (verified by count).
bands_all = []
for pno in pages:
    page = doc[pno - 1]
    d = page.get_text('dict')
    ys = []
    for blk in d['blocks']:
        for ln in blk.get('lines', []):
            if any(sp['color'] in (0xCC0000, 0xFF0000, 0xC00000) for sp in ln['spans']):
                y0 = min(sp['bbox'][1] for sp in ln['spans'])
                y1 = max(sp['bbox'][3] for sp in ln['spans'])
                if 60 < y0 < 820:
                    ys.append((y0, y1))
    ys.sort()
    merged = []
    for y0, y1 in ys:
        if merged and y0 <= merged[-1][1] + 11:
            merged[-1] = (merged[-1][0], max(merged[-1][1], y1))
        else:
            merged.append((y0, y1))
    for y0, y1 in merged:
        bands_all.append((pno, y0, y1))

print('total red bands:', len(bands_all))
assert len(bands_all) == 50, f'expected 50 bands, got {len(bands_all)}'

# stack in chunks of 6, each band cropped at 600dpi with label
CHUNK = 6
chunk_imgs = []
for ci in range(0, 50, CHUNK):
    chunk = bands_all[ci:ci + CHUNK]
    pieces = []
    for pno, y0, y1 in chunk:
        page = doc[pno - 1]
        pix = page.get_pixmap(dpi=DPI)
        img = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
        top = max(0, int((y0 - 4) * SCALE))
        bot = min(img.height, int((y1 + 4) * SCALE))
        pieces.append(img.crop((0, top, img.width, bot)))
    W = max(p.width for p in pieces)
    H = sum(p.height + 34 for p in pieces)
    comp = Image.new('RGB', (W, H), (255, 255, 255))
    dr = ImageDraw.Draw(comp)
    y = 0
    for k, p in enumerate(pieces):
        n = ci + k + 1
        dr.rectangle([(0, y + p.height), (300, y + p.height + 32)], fill=(255, 255, 220))
        dr.text((12, y + p.height + 6), f'=== item {n} (page {chunk[k][0]}) ===', fill=(0, 0, 200))
        comp.paste(p, (0, y))
        y += p.height + 34
    out = f'/tmp/r314-zoom-{ci // CHUNK + 1}.png'
    comp.save(out)
    chunk_imgs.append(out)
    print(out, 'items', list(range(ci + 1, min(ci + CHUNK, 50) + 1)), comp.size)
