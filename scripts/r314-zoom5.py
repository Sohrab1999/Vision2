# r314 — final zoom: hardcoded per-item ranges (from anchor debug) -> 600dpi halves-stacked crops
import fitz
from PIL import Image, ImageDraw

PDF = 'upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf'
DPI = 600
SCALE = DPI / 72
# item -> (page, y0, y1) range that contains ONLY that item's translation line(s)
RANGES = {
    1: (207, 285, 330), 7: (207, 574, 624), 9: (207, 673, 738), 10: (207, 738, 806),
    13: (208, 124, 167), 22: (208, 544, 605), 26: (208, 768, 806),
    28: (209, 80, 123), 30: (209, 165, 212), 31: (209, 212, 277), 33: (209, 342, 405),
    35: (209, 472, 537), 39: (209, 732, 796),
    41: (210, 84, 144), 43: (210, 209, 274), 45: (210, 339, 422),
}

doc = fitz.open(PDF)


def red_extent(page, y0, y1):
    d = page.get_text('dict')
    ys = []
    for blk in d['blocks']:
        for ln in blk.get('lines', []):
            if any(sp['color'] in (0xCC0000, 0xFF0000, 0xC00000) for sp in ln['spans']):
                a0 = min(sp['bbox'][1] for sp in ln['spans'])
                a1 = max(sp['bbox'][3] for sp in ln['spans'])
                if y0 <= a0 <= y1:
                    ys.append((a0, a1))
    ys.sort()
    return ys


items = sorted(RANGES)
pixcache = {}
for ci in range(0, len(items), 4):
    chunk = items[ci:ci + 4]
    pieces = []
    for n in chunk:
        pno, y0, y1 = RANGES[n]
        if pno not in pixcache:
            pix = doc[pno - 1].get_pixmap(dpi=DPI)
            pixcache[pno] = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
        img = pixcache[pno]
        ys = red_extent(doc[pno - 1], y0, y1)
        assert ys, f'no red band in item {n} range'
        top = max(0, int((ys[0][0] - 3) * SCALE))
        bot = min(img.height, int((ys[-1][1] + 3) * SCALE))
        band = img.crop((0, top, img.width, bot))
        w2 = band.width // 2
        pieces.append((n, 'RIGHT', band.crop((w2, 0, band.width, band.height))))
        pieces.append((n, 'LEFT', band.crop((0, 0, w2, band.height))))
    W = max(p.width for _, _, p in pieces)
    H = sum(p.height + 30 for _, _, p in pieces)
    comp = Image.new('RGB', (W, H), (255, 255, 255))
    dr = ImageDraw.Draw(comp)
    y = 0
    for n, side, p in pieces:
        dr.rectangle([(0, y + p.height), (340, y + p.height + 28)], fill=(255, 255, 220))
        dr.text((12, y + p.height + 4), f'=== item {n} {side} ===', fill=(0, 0, 200))
        comp.paste(p, (0, y))
        y += p.height + 30
    out = f'/tmp/r314-final{ci // 4 + 1}.png'
    comp.save(out)
    print(out, 'items', chunk, comp.size)
