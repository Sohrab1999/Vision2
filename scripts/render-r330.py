# -*- coding: utf-8 -*-
# r330 — رندرهای ص۶۶-۶۷ + کلیدِ ص۲۴۹-۲۵۱ (رندر حاکم، لایه فقط مختصات)
import fitz
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
OUT = Path("/tmp/r330"); OUT.mkdir(exist_ok=True)
doc = fitz.open(PDF)

def render(pno, dpi, name, clip=None):
    page = doc[pno - 1]
    pix = page.get_pixmap(dpi=dpi, clip=clip)
    f = OUT / f"{name}.png"
    pix.save(str(f))
    print(f"{name}: {pix.width}x{pix.height} ({pix.width*pix.height/1e6:.1f}MP)")

for p in (66, 67, 249, 250, 251):
    r = doc[p-1].rect
    if p == 66: print(f"page{p} rect={r}")
    render(p, 300, f"p{p}-full")

# نیمه‌های ۱۴۰۰dpi برای رونویسی
H = {66: 4, 67: 4, 249: 4, 250: 5, 251: 4}
for p, n in H.items():
    r = doc[p-1].rect
    h = r.height / n
    for i in range(n):
        clip = fitz.Rect(r.x0, r.y0 + i*h, r.x1, r.y0 + (i+1)*h + 6)
        render(p, 1400, f"p{p}-h{i+1}", clip)
