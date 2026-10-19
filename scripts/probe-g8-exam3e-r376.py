# -*- coding: utf-8 -*-
# r376e — زوم ۳۰۰dpi س۴ ص۳۵ (فرگمنت‌ها) + س۱/س۵ (تأییدِ تصویری) + جستجوی speak در کل لایه
import fitz, re
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه هشتم.pdf"
OUT = Path("/tmp/qa-r376")
doc = fitz.open(PDF)

# ص۳۵: clip برحسب pt (صفحه = 595x842pt؛ ۱px@150dpi = 0.48pt)
page = doc[34]
pix = page.get_pixmap(dpi=300, clip=fitz.Rect(0, 545, 595, 615))
pix.save(OUT / "p35-s4-frag-zoom.png")
print(f"s4 frags: {OUT/'p35-s4-frag-zoom.png'} {pix.width}x{pix.height}")

# س۱ (تصاویر اصطلاحی) برای مستندسازی مستثنی
pix = page.get_pixmap(dpi=300, clip=fitz.Rect(0, 110, 595, 232))
pix.save(OUT / "p35-s1-pics-zoom.png")
print(f"s1 pics: {OUT/'p35-s1-pics-zoom.png'} {pix.width}x{pix.height}")

# س۵ (سؤالات تصویری)
pix = page.get_pixmap(dpi=300, clip=fitz.Rect(0, 576, 595, 760))
pix.save(OUT / "p35-s5-pics-zoom.png")
print(f"s5 pics: {OUT/'p35-s5-pics-zoom.png'} {pix.width}x{pix.height}")

# ص۴۱: س۳ (دو ناهماهنگ) و س۵ (تلفظ) — تأییدِ چاپ
page41 = doc[40]
pix = page41.get_pixmap(dpi=300)
pix.save(OUT / "p41-300.png")
print(f"p41 full 300dpi: {OUT/'p41-300.png'} {pix.width}x{pix.height}")

# speak در کل لایه؟
LAYER = Path("/home/z/my-project/booklet-extract/g8.txt").read_text(encoding="utf-8").split("\n")
PM = {}
for i, l in enumerate(LAYER):
    m = re.match(r"<<<PAGE (\d+)>>>", l)
    if m: PM[int(m.group(1))] = i
def page_lines(p):
    start = PM[p]
    end = next((v for q, v in sorted(PM.items()) if q > p), len(LAYER))
    return LAYER[start:end]
print("\n=== 'speak' occurrences p1-40 ===")
for p in range(1, 41):
    for l in page_lines(p):
        if re.search(r"speak", l, re.IGNORECASE) and "PAGE" not in l:
            print(f"  p{p}: {l.strip()[:120]}")
