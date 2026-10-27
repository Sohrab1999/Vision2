# r313 — crop red translation lines from key pages 203/204/205/206 for visual transcription
import fitz
from PIL import Image

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
    # drop page header (y<60) and footer (y>800)
    return [(y0, y1) for y0, y1 in merged if 60 < y0 and y1 < 800]

doc = fitz.open(PDF)
for pno in (203, 204, 205, 206):
    page = doc[pno - 1]
    bands = red_bands(page)
    pix = page.get_pixmap(dpi=DPI)
    img = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
    strips = []
    for y0, y1 in bands:
        top = max(0, int((y0 - 6) * SCALE))
        bot = min(img.height, int((y1 + 6) * SCALE))
        strips.append(img.crop((0, top, img.width, bot)))
    total_h = sum(s.height + 14 for s in strips)
    comp = Image.new('RGB', (img.width, total_h), (255, 255, 255))
    y = 0
    for s in strips:
        comp.paste(s, (0, y))
        y += s.height + 14
    out = f'/tmp/r313-red-p{pno}.png'
    comp.save(out)
    print(out, len(strips), 'strips', comp.size)
