# -*- coding: utf-8 -*-
# r340 — پروبِ «استاندارد — تست واژگان درس سوم» (ص۱۲۵-۱۲۶، کلید ص۲۷۷-۲۷۸)
# گام ۱: لایهٔ متنی + سربرگ‌ها ۶۰۰dpi + کلِ صفحات ۳۰۰dpi
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

for pno in (124, 125, 276, 277):  # 0-based → ص۱۲۵، ص۱۲۶، ص۲۷۷، ص۲۷۸
    page = doc[pno]
    txt = page.get_text("text")
    print(f"===== PAGE {pno+1} ({len(txt)} chars) =====")
    print(txt[:2200])
    print("...TAIL...")
    print(txt[-600:])

def band(pno0, y0, y1, name, dpi=600):
    page = doc[pno0]
    r = page.rect
    clip = fitz.Rect(r.x0, max(0, y0), r.x1, min(r.y1, y1))
    pix = page.get_pixmap(matrix=fitz.Matrix(dpi / 72.0, dpi / 72.0), clip=clip)
    out = f"/tmp/{name}.png"
    pix.save(out)
    print(out, pix.width, "x", pix.height)

def full(pno0, name, dpi=300):
    page = doc[pno0]
    pix = page.get_pixmap(matrix=fitz.Matrix(dpi / 72.0, dpi / 72.0))
    out = f"/tmp/{name}.png"
    pix.save(out)
    print(out, pix.width, "x", pix.height)

# سربرگ‌ها و کلِ صفحات برای بازبینی چشمی
band(124, 60, 210, "r340-p125-header")
band(125, 60, 210, "r340-p126-header")
band(276, 60, 230, "r340-p277-header")
band(277, 60, 180, "r340-p278-header")
full(124, "r340-p125-full")
full(125, "r340-p126-full")
full(276, "r340-p277-full")
full(277, "r340-p278-full")
