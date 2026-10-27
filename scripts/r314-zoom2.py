# r314 — 600dpi two-column zoom of all 50 red translation bands (adaptive per-page merging)
# expected items per page: p207=1..10 (10), p208=11..26 (16), p209=27..40 (14), p210=41..50 (10)
import re
import fitz
from PIL import Image, ImageDraw

PDF = 'upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf'
DPI = 600
SCALE = DPI / 72
EXPECT = {207: 10, 208: 16, 209: 14, 210: 10}

doc = fitz.open(PDF)
page_bands = {}
for pno in (207, 208, 209, 210):
    page = doc[pno - 1]
    d = page.get_text('dict')
    ymax = 820
    if pno == 210:
        for blk in d['blocks']:
            for ln in blk.get('lines', []):
                if 'بقیه' in ''.join(sp['text'] for sp in ln['spans']):
                    ymax = min(sp['bbox'][1] for sp in ln['spans']) - 10
    ys = []
    for blk in d['blocks']:
        for ln in blk.get('lines', []):
            if any(sp['color'] in (0xCC0000, 0xFF0000, 0xC00000) for sp in ln['spans']):
                y0 = min(sp['bbox'][1] for sp in ln['spans'])
                y1 = max(sp['bbox'][3] for sp in ln['spans'])
                if 60 < y0 < ymax:
                    ys.append((y0, y1))
    ys.sort()
    gaps = sorted(ys[i + 1][0] - ys[i][1] for i in range(len(ys) - 1))
    nmerge = len(ys) - EXPECT[pno]
    assert nmerge >= 0, f'p{pno}: fewer bands ({len(ys)}) than items ({EXPECT[pno]})'
    T = (gaps[nmerge - 1] + 0.1) if nmerge else -1e9
    merged = []
    for y0, y1 in ys:
        if merged and y0 - merged[-1][1] <= T:
            merged[-1] = (merged[-1][0], max(merged[-1][1], y1))
        else:
            merged.append((y0, y1))
    assert len(merged) == EXPECT[pno], f'p{pno}: merged {len(merged)} != {EXPECT[pno]} (T={T:.1f})'
    page_bands[pno] = merged
    print(f'p{pno}: {len(ys)} raw -> {len(merged)} bands (T={T:.1f})')

# render composites: per page, each band split into left/right halves stacked (2-col trick)
for pno, bands in page_bands.items():
    page = doc[pno - 1]
    pix = page.get_pixmap(dpi=DPI)
    img = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
    first_item = {207: 1, 208: 11, 209: 27, 210: 41}[pno]
    strips = []
    for bi, (y0, y1) in enumerate(bands):
        n = first_item + bi
        top = max(0, int((y0 - 3) * SCALE))
        bot = min(img.height, int((y1 + 3) * SCALE))
        band = img.crop((0, top, img.width, bot))
        w2 = band.width // 2
        strips.append((n, band.crop((w2, 0, band.width, band.height))))   # left half = second in RTL reading? keep order: right half first
        strips.append((n, band.crop((0, 0, w2, band.height))))
    # note: strips order per band = [right-half, left-half] — RTL text starts at right
    H = sum(s.height + 30 for _, s in strips)
    comp = Image.new('RGB', (max(s.width for _, s in strips), H), (255, 255, 255))
    dr = ImageDraw.Draw(comp)
    y = 0
    for n, s in strips:
        dr.rectangle([(0, y + s.height), (260, y + s.height + 28)], fill=(255, 255, 220))
        dr.text((10, y + s.height + 4), f'-- item {n} --', fill=(0, 0, 200))
        comp.paste(s, (0, y))
        y += s.height + 30
    out = f'/tmp/r314-zoom2-p{pno}.png'
    comp.save(out)
    print(out, comp.size)
