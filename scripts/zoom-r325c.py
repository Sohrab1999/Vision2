# -*- coding: utf-8 -*-
# r325c — زومِ حافظه‌ایِ ایمن (کلیپِ باریک، dpi متعادل، اجرایِ گروهی)
import sys
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# (page1based, needle|y0, dpi, name, up, down, x0, x1)  — مختصات در pt
JOBS = [
    (245, "تعطیلاتمان", 2600, "r325-q2-tarikhi", 30, 22, 60, 500),
    (247, "مجرد", 2600, "r325-q37-talaq", 26, 26, 60, 500),
    (245, 216, 2600, "r325-q4-vaksen", 60, 55, 55, 530),
    (245, 662, 2600, "r325-q14-enqeraz", 30, 38, 55, 530),
    (245, 722, 2600, "r325-q15-ehsas", 22, 48, 55, 530),
    (246, 286, 2600, "r325-q23-bala", 32, 32, 55, 530),
    (246, 330, 2600, "r325-q24-defa", 30, 36, 55, 530),
    (246, 459, 2600, "r325-q27-miz", 32, 36, 55, 530),
    (246, 546, 2600, "r325-q29-masdu", 32, 36, 55, 530),
    (246, 676, 2600, "r325-q32-ra", 32, 36, 55, 530),
    (246, 765, 2600, "r325-q34-badqat", 28, 55, 55, 530),
]

start = int(sys.argv[1]) if len(sys.argv) > 1 else 0
end = int(sys.argv[2]) if len(sys.argv) > 2 else len(JOBS)

for pno, ref, dpi, name, up, down, x0, x1 in JOBS[start:end]:
    page = doc[pno - 1]
    if isinstance(ref, str):
        hits = page.search_for(ref)
        if not hits:
            print(f"!! not found: {ref}")
            continue
        y0 = hits[0].y0
    else:
        y0 = ref
    clip = fitz.Rect(x0, y0 - up, x1, y0 + down)
    z = dpi / 72.0
    pix = page.get_pixmap(matrix=fitz.Matrix(z, z), clip=clip)
    out = f"/tmp/{name}.png"
    pix.save(out)
    print(f"{out}  {pix.width}x{pix.height}")
