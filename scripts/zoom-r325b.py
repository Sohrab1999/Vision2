# -*- coding: utf-8 -*-
# r325b — زومِ اصلاح‌شده با عرضِ ستونِ کامل
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# (page1based, needle, zoom_dpi, name, pad_up, pad_down)
JOBS = [
    (245, "تعطیلاتمان", 6000, "r325-q2-tarikhi", 45, 35),   # Q2
    (247, "مجرد", 6000, "r325-q37-talaq", 40, 45),          # Q37
]

for pno, needle, dpi, name, up, down in JOBS:
    page = doc[pno - 1]
    hits = page.search_for(needle)
    if not hits:
        print(f"!! not found: {needle}")
        continue
    r = hits[0]
    W = page.rect
    clip = fitz.Rect(W.x0 + 40, r.y0 - up, W.x1 - 40, r.y1 + down)
    z = dpi / 72.0
    pix = page.get_pixmap(matrix=fitz.Matrix(z, z), clip=clip)
    out = f"/tmp/{name}.png"
    pix.save(out)
    print(f"{out}  {pix.width}x{pix.height}")

# باریک‌کردنِ کلیپ‌های قبلیِ بلند به ارتفاعِ منطقی (خطِ ترجمه + گزینه‌ها)
RECLIP = [
    (245, 216, 5000, "r325-q4-vaksen", 95, 85),
    (245, 662, 5000, "r325-q14-enqeraz", 50, 60),
    (245, 722, 5000, "r325-q15-ehsas", 40, 75),
    (246, 286, 5000, "r325-q23-bala", 55, 55),
    (246, 330, 5000, "r325-q24-defa", 50, 60),
    (246, 459, 5000, "r325-q27-miz", 55, 60),
    (246, 546, 5000, "r325-q29-masdu", 55, 60),
    (246, 676, 5000, "r325-q32-ra", 55, 60),
    (246, 765, 5000, "r325-q34-badqat", 50, 90),
]
for pno, y0, dpi, name, up, down in RECLIP:
    page = doc[pno - 1]
    W = page.rect
    clip = fitz.Rect(W.x0 + 40, y0 - up, W.x1 - 40, y0 + down)
    z = dpi / 72.0
    pix = page.get_pixmap(matrix=fitz.Matrix(z, z), clip=clip)
    out = f"/tmp/{name}.png"
    pix.save(out)
    print(f"{out}  {pix.width}x{pix.height}")
