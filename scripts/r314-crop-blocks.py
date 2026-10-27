# r314 — crop full key blocks (anchor -> next anchor) from pages 207-210, numbered 1..50 sequentially
# robust against glyph drops: numbers are assigned by ORDER, not by their (possibly broken) text
import re
import fitz
from PIL import Image, ImageDraw

PDF = 'upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf'
DPI = 300
SCALE = DPI / 72

doc = fitz.open(PDF)
all_blocks = []  # (page, y0, y1)
for pno in (207, 208, 209, 210):
    page = doc[pno - 1]
    d = page.get_text('dict')
    # y of the grid title on p210 — anchors at/below it belong to the 51-72 letter grid
    grid_y = None
    if pno == 210:
        for blk in d['blocks']:
            for ln in blk.get('lines', []):
                txt = ''.join(sp['text'] for sp in ln['spans'])
                if 'بقیه' in txt:
                    grid_y = min(sp['bbox'][1] for sp in ln['spans'])
        assert grid_y is not None, 'grid title not found on p210'
        print(f'p210 grid title y={grid_y:.0f}')
    anchors = []
    for blk in d['blocks']:
        for ln in blk.get('lines', []):
            txt = ''.join(sp['text'] for sp in ln['spans']).strip()
            if re.match(r'^\d{1,2}\s*-?\s*$', txt) or re.match(r'^\d{1,2}\s*-\s*گزینه', txt):
                y = min(sp['bbox'][1] for sp in ln['spans'])
                if 60 < y < 820 and (grid_y is None or y < grid_y - 10):
                    anchors.append(y)
    anchors.sort()
    print(f'p{pno}: {len(anchors)} anchors')
    for i, y in enumerate(anchors):
        y1 = anchors[i + 1] - 6 if i + 1 < len(anchors) else 830
        all_blocks.append((pno, y - 8, y1))

assert len(all_blocks) == 50, f'expected 50 blocks, got {len(all_blocks)}'

for pno in (207, 208, 209, 210):
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
    out = f'/tmp/r314-blocks-p{pno}.png'
    comp.save(out)
    print(out, 'items', [n for n, _ in strips], comp.size)
