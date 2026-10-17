# r315 — 1400dpi tight clips for the 11 last ambiguous words/phrases
import re
import fitz
from PIL import Image, ImageDraw

PDF = 'upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf'
doc = fitz.open(PDF)

# item -> (page, y0, y1) red-band range, x0, x1 (page pts) — region containing the target words
TARGETS = {
    1: (220, 'من3|من ۳', None),          # opening: «من ۳ روز» glued or spaced?
    7: (220, 'درخت', None),              # درخت / درختی + «به سمت ?»
    8: (220, 'هفته', None),              # هفتهٔ / هفته + دربارهٔ
    15: (221, 'میخواند', None),          # میخواند / میخوانند
    17: (221, 'پویل|پولی', None),        # پولی، را / پولی را
    18: (221, 'قدیمی', None),            # قدیمی‌مان / قدیمییم
    19: (222, 'مایلی', None),            # مایلیذ + ؟-نه + ساندویــج
    20: (222, 'قصد', None),              # اتاق خوابم / آنها را
    21: (222, 'حالیکه', None),           # opening «" در» + «بود، سگش»
    25: (222, 'زنگ زدی', None),          # زدی، / زدی
    30: (223, 'اسپرت', None),            # اسپرتی / اسپرت
}

BLOCKS = [(220, 147.92996215820312, 213.52999877929688), (220, 211.52999877929688, 314.9599914550781), (220, 312.9599914550781, 380.8399963378906), (220, 378.8399963378906, 445.05999755859375), (220, 443.05999755859375, 508.659912109375), (220, 506.659912109375, 610.929931640625), (220, 608.929931640625, 672.1299438476562), (220, 670.1299438476562, 734.5499267578125), (220, 732.5499267578125, 830), (221, 17.109954833984375, 121.24996948242188), (221, 119.24996948242188, 183.64999389648438), (221, 181.64999389648438, 286.1600036621094), (221, 284.1600036621094, 388.3999938964844), (221, 386.3999938964844, 463.41998291015625), (221, 461.41998291015625, 546.5799560546875), (221, 544.5799560546875, 647.5299682617188), (221, 645.5299682617188, 709.929931640625), (221, 707.929931640625, 830), (222, 17.109954833984375, 82.73001098632812), (222, 80.73001098632812, 145.12997436523438), (222, 143.12997436523438, 207.64999389648438), (222, 205.64999389648438, 336.67999267578125), (222, 334.67999267578125, 410.6199951171875), (222, 408.6199951171875, 473.0199890136719), (222, 471.0199890136719, 593.2899169921875), (222, 591.2899169921875, 656.8899536132812), (222, 654.8899536132812, 719.2899780273438), (222, 717.2899780273438, 830), (223, 17.109954833984375, 81.52999877929688), (223, 79.52999877929688, 195.76998901367188)]


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


out_files = []
for ci, (n, (pno, pat, _)) in enumerate(TARGETS.items()):
    y0, y1 = BLOCKS[n - 1][1], BLOCKS[n - 1][2]
    by0, by1 = red_band_rect(pno, y0, y1)
    page = doc[pno - 1]
    # find x of the target pattern inside the red band via word search
    words = page.get_text('words', clip=fitz.Rect(0, by0, 612, by1))
    xs = [w for w in words if re.search(pat, w[4])]
    if xs:
        cx = sum(w[0] + w[2] for w in xs) / (2 * len(xs))
        x0, x1 = max(0, cx - 150), min(612, cx + 150)
    else:
        x0, x1 = 0, 612
    clip = fitz.Rect(x0, by0, x1, by1)
    pix = page.get_pixmap(dpi=1400, clip=clip)
    img = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
    out = f'/tmp/r315-fine-{n}.png'
    img.save(out)
    out_files.append((n, out, [w[4] for w in words][:14]))
    print(out, 'item', n, 'words:', ' '.join(w[4] for w in words)[:80])
