# r315 — 900dpi zoom of red translation bands for ambiguous items, 3 per composite (r314-zoom5 pattern)
import fitz
from PIL import Image, ImageDraw

PDF = 'upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf'
BLOCKS = [(220, 147.92996215820312, 213.52999877929688), (220, 211.52999877929688, 314.9599914550781), (220, 312.9599914550781, 380.8399963378906), (220, 378.8399963378906, 445.05999755859375), (220, 443.05999755859375, 508.659912109375), (220, 506.659912109375, 610.929931640625), (220, 608.929931640625, 672.1299438476562), (220, 670.1299438476562, 734.5499267578125), (220, 732.5499267578125, 830), (221, 17.109954833984375, 121.24996948242188), (221, 119.24996948242188, 183.64999389648438), (221, 181.64999389648438, 286.1600036621094), (221, 284.1600036621094, 388.3999938964844), (221, 386.3999938964844, 463.41998291015625), (221, 461.41998291015625, 546.5799560546875), (221, 544.5799560546875, 647.5299682617188), (221, 645.5299682617188, 709.929931640625), (221, 707.929931640625, 830), (222, 17.109954833984375, 82.73001098632812), (222, 80.73001098632812, 145.12997436523438), (222, 143.12997436523438, 207.64999389648438), (222, 205.64999389648438, 336.67999267578125), (222, 334.67999267578125, 410.6199951171875), (222, 408.6199951171875, 473.0199890136719), (222, 471.0199890136719, 593.2899169921875), (222, 591.2899169921875, 656.8899536132812), (222, 654.8899536132812, 719.2899780273438), (222, 717.2899780273438, 830), (223, 17.109954833984375, 81.52999877929688), (223, 79.52999877929688, 195.76998901367188)]
TARGETS = [2, 3, 4, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24, 25, 26, 27, 29, 30]

doc = fitz.open(PDF)


def red_extent(page, y0, y1):
    d = page.get_text('dict')
    ys = []
    for blk in d['blocks']:
        for ln in blk.get('lines', []):
            if any(sp['color'] in (0xCC0000, 0xFF0000, 0xC00000) for sp in ln['spans']):
                a0 = min(sp['bbox'][1] for sp in ln['spans'])
                a1 = max(sp['bbox'][3] for sp in ln['spans'])
                if y0 <= a0 <= y1 and a0 < 800:  # فوترِ قرمزِ صفحه حذف
                    ys.append((a0, a1))
    ys.sort()
    return ys


def clip_line(pno, y0, y1):
    page = doc[pno - 1]
    ys = red_extent(page, y0, y1)
    assert ys, f'no red band item near {y0}'
    # ترجمه = واپسین نوارِ قرمزِ بلوک (کلیدواژه‌های قرمزِ شرح بالاترند)؛
    # اگر نوارِ پیشین در ۱۶pt واپسین باشد، جزء همان ترجمهٔ چندخطی است
    last = ys[-1]
    group = [last]
    for b in reversed(ys[:-1]):
        if last[0] - b[1] <= 16:
            group.insert(0, b)
        else:
            break
    top, bot = group[0][0], group[-1][1]
    clip = fitz.Rect(0, max(0, top - 3), 612, min(842, bot + 3))
    pix = page.get_pixmap(dpi=900, clip=clip)
    return Image.frombytes('RGB', (pix.width, pix.height), pix.samples)


for ci in range(0, len(TARGETS), 3):
    chunk = TARGETS[ci:ci + 3]
    pieces = []
    for n in chunk:
        pno, y0, y1 = BLOCKS[n - 1]
        band = clip_line(pno, y0, y1)
        w = band.width
        ov = int(w * 0.32)
        pieces.append((n, 'R', band.crop((ov, 0, w, band.height))))
        pieces.append((n, 'L', band.crop((0, 0, w - ov, band.height))))
    W = max(p.width for _, _, p in pieces)
    H = sum(p.height + 26 for _, _, p in pieces)
    comp = Image.new('RGB', (W, H), (255, 255, 255))
    dr = ImageDraw.Draw(comp)
    y = 0
    for n, side, p in pieces:
        dr.rectangle([(0, y + p.height), (300, y + p.height + 24)], fill=(255, 255, 220))
        dr.text((10, y + p.height + 2), f'== item {n} {side} ==', fill=(0, 0, 200))
        comp.paste(p, (0, y))
        y += p.height + 26
    out = f'/tmp/r315-z{ci // 3 + 1}.png'
    comp.save(out)
    print(out, chunk, comp.size)
