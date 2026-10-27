# r315 — crop full key blocks (anchor -> next anchor) from pages 220-223, numbered 1..30 sequentially
# (r314-crop-blocks.py pattern) — p223 blocks end at the «بخش دوم» grid title
import re
import fitz
from PIL import Image, ImageDraw

PDF = 'upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf'
DPI = 300
SCALE = DPI / 72

doc = fitz.open(PDF)
all_blocks = []  # (page, y0, y1)
for pno in (220, 221, 222, 223):
    page = doc[pno - 1]
    d = page.get_text('dict')
    grid_y = None
    if pno == 223:
        for blk in d['blocks']:
            for ln in blk.get('lines', []):
                txt = ''.join(sp['text'] for sp in ln['spans'])
                if 'بخش دوم' in txt:
                    grid_y = min(sp['bbox'][1] for sp in ln['spans'])
        print(f'p223 grid title y={grid_y}')
    anchors = []
    for blk in d['blocks']:
        for ln in blk.get('lines', []):
            txt = ''.join(sp['text'] for sp in ln['spans']).strip()
            if re.match(r'^\d{1,2}\s*-?\s*$', txt) or re.match(r'^\d{1,2}\s*-\s*گزینه', txt):
                y = min(sp['bbox'][1] for sp in ln['spans'])
                if 8 < y < 820 and (grid_y is None or y < grid_y - 10):
                    anchors.append(y)
    anchors.sort()
    print(f'p{pno}: {len(anchors)} anchors')
    for i, y in enumerate(anchors):
        y1 = anchors[i + 1] - 6 if i + 1 < len(anchors) else (grid_y - 6 if grid_y else 830)
        all_blocks.append((pno, y - 8, y1))

assert len(all_blocks) == 30, f'expected 30 blocks, got {len(all_blocks)}'

for pno in (220, 221, 222, 223):
    page = doc[pno - 1]
    pix = page.get_pixmap(dpi=DPI)
    img = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
    blocks = [(i, b) for i, b in enumerate(all_blocks) if b[0] == pno]
    strips = []
    for gi, (_, y0, y1) in blocks:
        top = max(0, int(y0 * SCALE))
        bot = min(img.height, int(y1 * SCALE))
        strips.append((gi + 1, img.crop((0, top, img.width, bot))))
    total_h = sum(s.height + 30 for _, s in strips)
    comp = Image.new('RGB', (img.width, total_h), (255, 255, 255))
    draw = ImageDraw.Draw(comp)
    y = 0
    for n, s in strips:
        draw.rectangle([(0, y + s.height), (170, y + s.height + 26)], fill=(255, 255, 255))
        draw.text((10, y + s.height + 4), f'== item {n} ==', fill=(0, 0, 255))
        comp.paste(s, (0, y))
        y += s.height + 30
    out = f'/tmp/r315-blocks-p{pno}.png'
    comp.save(out)
    print(out, 'items', [n for n, _ in strips], comp.size)
