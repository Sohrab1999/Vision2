# r315 — 1400dpi word-level clips (±55pt), stacked vertically per composite
import re
import fitz
from PIL import Image, ImageDraw

PDF = 'upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf'
doc = fitz.open(PDF)

BLOCKS = [(220, 147.92996215820312, 213.52999877929688), (220, 211.52999877929688, 314.9599914550781), (220, 312.9599914550781, 380.8399963378906), (220, 378.8399963378906, 445.05999755859375), (220, 443.05999755859375, 508.659912109375), (220, 506.659912109375, 610.929931640625), (220, 608.929931640625, 672.1299438476562), (220, 670.1299438476562, 734.5499267578125), (220, 732.5499267578125, 830), (221, 17.109954833984375, 121.24996948242188), (221, 119.24996948242188, 183.64999389648438), (221, 181.64999389648438, 286.1600036621094), (221, 284.1600036621094, 388.3999938964844), (221, 386.3999938964844, 463.41998291015625), (221, 461.41998291015625, 546.5799560546875), (221, 544.5799560546875, 647.5299682617188), (221, 645.5299682617188, 709.929931640625), (221, 707.929931640625, 830), (222, 17.109954833984375, 82.73001098632812), (222, 80.73001098632812, 145.12997436523438), (222, 143.12997436523438, 207.64999389648438), (222, 205.64999389648438, 336.67999267578125), (222, 334.67999267578125, 410.6199951171875), (222, 408.6199951171875, 473.0199890136719), (222, 471.0199890136719, 593.2899169921875), (222, 591.2899169921875, 656.8899536132812), (222, 654.8899536132812, 719.2899780273438), (222, 717.2899780273438, 830), (223, 17.109954833984375, 81.52999877929688), (223, 79.52999877929688, 195.76998901367188)]

SPOTS = [
    (1, r'3 روز|من3|من ۳', 'i1-man-3rooz'),
    (7, r'درخت', 'i7-darakht'),
    (7, r'سمت', 'i7-samt'),
    (8, r'هفته', 'i8-hafte'),
    (8, r'درباره', 'i8-darbare'),
    (15, r'میخوان', 'i15-mikhanad'),
    (17, r'پویل|پولی', 'i17-pooli'),
    (18, r'قدیمی', 'i18-ghadimi'),
    (19, r'ساندوی', 'i19-sandwich'),
    (19, r'مایلی', 'i19-open'),
    (20, r'اتاق|قصد', 'i20-otagh'),
    (21, r'حالیکه', 'i21-open'),
    (21, r'بود', 'i21-bod-sagash'),
    (25, r'زمانیکه', 'i25-open'),
    (25, r'زدی', 'i25-zadi'),
    (30, r'اسپرت', 'i30-sporti'),
]


def red_band_rect(pno, y0, y1):
    page = doc[pno - 1]
    d = page.get_text('dict')
    ys = []
    for blk in d['blocks']:
        for ln in blk.get('lines', []):
            if any(sp['color'] in (0xCC0000, 0xFF0000, 0xC00000) for sp in ln['spans']):
                a0 = min(sp['bbox'][1] for sp in ln['spans'])
                a1 = max(sp['bbox'][3] for sp in ln['spans'])
                if y0 <= a0 <= y1 and a0 < 800:
                    ys.append((a0, a1))
    ys.sort()
    last = ys[-1]
    group = [last]
    for b in reversed(ys[:-1]):
        if last[0] - b[1] <= 16:
            group.insert(0, b)
        else:
            break
    return group[0][0] - 3, group[-1][1] + 3


clips = []
for n, pat, label in SPOTS:
    pno, y0, y1 = BLOCKS[n - 1]
    by0, by1 = red_band_rect(pno, y0, y1)
    page = doc[pno - 1]
    words = page.get_text('words', clip=fitz.Rect(0, by0, 612, by1))
    xs = [w for w in words if re.search(pat, w[4])]
    if not xs:
        # برای i21 «بود» چندین تطبیق دارد — نخستین را بگیر
        print(f'!! no match item {n} pat {pat!r}: words:', ' '.join(w[4] for w in words)[:110])
        continue
    w0 = xs[0]
    cx = (w0[0] + w0[2]) / 2
    x0, x1 = max(0, cx - 55), min(612, cx + 55)
    clip = fitz.Rect(x0, by0 - 2, x1, by1 + 2)
    pix = page.get_pixmap(dpi=1400, clip=clip)
    img = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
    clips.append((label, img))
    print(label, img.size)

# stack into composites of 3
for ci in range(0, len(clips), 3):
    chunk = clips[ci:ci + 3]
    W = max(p.width for _, p in chunk)
    H = sum(p.height + 30 for _, p in chunk)
    comp = Image.new('RGB', (W, H), (255, 255, 255))
    dr = ImageDraw.Draw(comp)
    y = 0
    for label, p in chunk:
        dr.rectangle([(0, y + p.height), (280, y + p.height + 28)], fill=(255, 255, 220))
        dr.text((10, y + p.height + 4), f'== {label} ==', fill=(0, 0, 200))
        comp.paste(p, (0, y))
        y += p.height + 30
    out = f'/tmp/r315-f2-{ci // 3 + 1}.png'
    comp.save(out)
    print(out, [l for l, _ in chunk], comp.size)
