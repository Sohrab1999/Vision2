# -*- coding: utf-8 -*-
# r344i — برشِ برچسب‌های کنکورِ چهار تستِ ص۱۲۸ + سربرگِ بلوک + شمارشِ تیره‌ها
import fitz, re
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
OUT = Path("/tmp/r344")
doc = fitz.open(PDF)
page = doc[127]
W = page.rect.width

words = page.get_text("words")
kns = [w for w in words if "کنکور" in w[4] or "کنکور" in w[4].replace("نکنکور","")]
print("konkur tokens:")
for x0, y0, x1, y1, t, *_ in kns:
    print(f"  y={y0:.0f} x=({x0:.0f}-{x1:.0f}) {t!r}")
    clip = fitz.Rect(max(0, x0 - 30), y0 - 8, min(W, x1 + 150), y1 + 8)
    pix = page.get_pixmap(dpi=1800, clip=clip)
    p = OUT / f"tag-y{y0:.0f}.png"
    pix.save(p)
    print("  ->", p)

# سربرگِ بلوک: نوارِ y 352-372 با ۱۶۰۰dpi
words_all = sorted([w for w in words if 350 <= w[1] <= 375], key=lambda w: -w[0])
print("\nheader words:", [w[4] for w in words_all])
clip = fitz.Rect(0, 352, W, 374)
pix = page.get_pixmap(dpi=1600, clip=clip)
p = OUT / "testhdr.png"
pix.save(p)
print("->", p)

# شمارشِ تیره‌ها در ساقه‌ها (از متنِ خامِ صفحه)
raw = page.get_text("text")
for m in re.finditer(r"-{6,}", raw):
    print(f"dashes: n={len(m.group())} at offset {m.start()}")
