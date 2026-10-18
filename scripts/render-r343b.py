# -*- coding: utf-8 -*-
# r343 — نوارهای باریکِ صفحاتِ کلید (برشِ ستونِ متن) + کراپ‌های داوری از صفحاتِ آزمون
import fitz
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
OUT = Path("/tmp/r343")
OUT.mkdir(exist_ok=True)
doc = fitz.open(PDF)

# —— نوارهای ۶۰۰dpi با برشِ ستونِ متن (x: 30..565pt) — ۶ نوار به ازای هر صفحهٔ کلید
for pno in (282, 283, 284, 285):
    page = doc[pno]
    W, H = page.rect.width, page.rect.height
    for band in range(6):
        y0 = H * band / 6
        clip = fitz.Rect(30, y0, 565, min(H, y0 + H / 6 + 4))
        pix = page.get_pixmap(dpi=600, clip=clip)
        p = OUT / f"k-p{pno+1}-b{band}.png"
        pix.save(p)
print("key bands done")

# —— سربرگ‌ها با برشِ ستون: آزمونِ ص۱۳۸ و کلیدِ ص۲۸۳
for pno, ytop, h, name in ((137, 0.05, 0.13, "examhdr"), (282, 0.05, 0.13, "keyhdr")):
    page = doc[pno]
    W, H = page.rect.width, page.rect.height
    clip = fitz.Rect(30, H * ytop, 565, H * (ytop + h))
    pix = page.get_pixmap(dpi=900, clip=clip)
    pix.save(OUT / f"{name}-p{pno+1}.png")
print("headers done")

# —— کراپ‌های داوریِ آزمون (x کامل برای شمارهٔ سؤال) — (صفحه، y0، y1، نام)
CROPS = [
    (137, 0.415, 0.455, "q7d"),          # گزینهٔ d سؤال ۷ — پرانتز؟
    (137, 0.255, 0.300, "q4a"),          # Q4-a «While /was watching»
    (137, 0.700, 0.760, "q12b"),         # Q12-b «was not work/ called»
    (138, 0.015, 0.075, "q16"),          # Q16 «any help. I can»
    (138, 0.600, 0.680, "q28num"),       # Q28 «28 I» بدونِ تیره؟
    (139, 0.585, 0.640, "q41a"),         # Q41-a «themselves/ themselves»
    (139, 0.630, 0.690, "q42c"),         # Q42-c «is looking/ her»
    (139, 0.635, 0.860, "tags"),         # برچسب‌های کنکور Q43-46
    (137, 0.030, 0.085, "p138hdr"),      # سربرگِ آزمونِ ص۱۳۸ (تکرارِ ۹۰۰dpi)
]
for pno, y0, y1, name in CROPS:
    page = doc[pno]
    W, H = page.rect.width, page.rect.height
    clip = fitz.Rect(25, H * y0, 570, H * y1)
    pix = page.get_pixmap(dpi=1200, clip=clip)
    pix.save(OUT / f"z-{name}.png")
print("exam crops done")
