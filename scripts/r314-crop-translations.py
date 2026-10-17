# r314 — crop red translation lines from key pages 207/208/209/210 for visual transcription
# same engine as r313-crop-translations.py + per-item mapping (nearest item anchor above each band)
import re
import fitz
from PIL import Image, ImageDraw

PDF = 'upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf'
DPI = 300
SCALE = DPI / 72


def red_bands(page):
    d = page.get_text('dict')
    ys = []
    for blk in d['blocks']:
        for ln in blk.get('lines', []):
            line_red = any(sp['color'] in (0xCC0000, 0xFF0000, 0xC00000) for sp in ln['spans'])
            if line_red:
                y0 = min(sp['bbox'][1] for sp in ln['spans'])
                y1 = max(sp['bbox'][3] for sp in ln['spans'])
                ys.append((y0, y1))
    ys.sort()
    merged = []
    for y0, y1 in ys:
        if merged and y0 <= merged[-1][1] + 3:
            merged[-1] = (merged[-1][0], max(merged[-1][1], y1))
        else:
            merged.append((y0, y1))
    return [(y0, y1) for y0, y1 in merged if 60 < y0 and y1 < 800]


def item_anchors(page):
    """y of each item number anchor (a standalone 1-50 token on its own line, or 'N -' pattern)."""
    ys = {}
    d = page.get_text('dict')
    for blk in d['blocks']:
        for ln in blk.get('lines', []):
            txt = ''.join(sp['text'] for sp in ln['spans']).strip()
            m = re.match(r'^(\d{1,2})\s*-?\s*$', txt) or re.match(r'^(\d{1,2})\s*-\s*گزینه', txt)
            if m and ln['spans']:
                n = int(m.group(1))
                if 1 <= n <= 50 and n not in ys:
                    ys[n] = min(sp['bbox'][1] for sp in ln['spans'])
    return ys


doc = fitz.open(PDF)
for pno in (207, 208, 209, 210):
    page = doc[pno - 1]
    bands = red_bands(page)
    anchors = item_anchors(page)
    pix = page.get_pixmap(dpi=DPI)
    img = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
    strips = []
    for y0, y1 in bands:
        # nearest anchor above (or 0 if none)
        cands = [(ay, n) for n, ay in anchors.items() if ay <= y0 + 14]
        n = max(cands)[1] if cands else 0
        top = max(0, int((y0 - 6) * SCALE))
        bot = min(img.height, int((y1 + 6) * SCALE))
        strips.append((n, img.crop((0, top, img.width, bot))))
    total_h = sum(s.height + 26 for _, s in strips)
    comp = Image.new('RGB', (img.width, total_h), (255, 255, 255))
    draw = ImageDraw.Draw(comp)
    y = 0
    for n, s in strips:
        draw.text((8, y + s.height + 4), f'== item {n} ==', fill=(0, 0, 255))
        comp.paste(s, (0, y))
        y += s.height + 26
    out = f'/tmp/r314-red-p{pno}.png'
    comp.save(out)
    print(out, len(strips), 'strips ->', [n for n, _ in strips])
