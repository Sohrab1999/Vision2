# -*- coding: utf-8 -*-
# r339 — پروبِ رندرِ «تست واژگان درس سوم — متوسط» (ص۱۲۳-۱۲۴، کلید ص۲۷۵-۲۷۶)
# گام ۱: سربرگ‌ها ۶۰۰dpi + کلِ صفحات ۳۰۰dpi برای بازبینیِ چشمی
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

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

def find_y(pno0, needle):
    page = doc[pno0]
    for b in page.get_text("dict")["blocks"]:
        for ln in b.get("lines", []):
            txt = "".join(sp["text"] for sp in ln["spans"])
            if needle in txt.replace(" ", ""):
                y0 = min(sp["bbox"][1] for sp in ln["spans"])
                y1 = max(sp["bbox"][3] for sp in ln["spans"])
                return (y0 + y1) / 2
    return None

def zoom(pno0, needle, name, dpi=2400, band_h=16):
    y = find_y(pno0, needle)
    if y is None:
        print(f"!! {name}: needle {needle!r} not found on page {pno0+1}")
        return
    page = doc[pno0]
    r = page.rect
    clip = fitz.Rect(r.x0, max(0, y - band_h), r.x1, min(r.y1, y + band_h))
    pix = page.get_pixmap(matrix=fitz.Matrix(dpi / 72.0, dpi / 72.0), clip=clip)
    out = f"/tmp/{name}.png"
    pix.save(out)
    print(out, pix.width, "x", pix.height)

# --- سربرگ‌ها (۶۰۰dpi)
band(122, 60, 210, "r339-p123-header")
band(274, 60, 230, "r339-p275-header")
band(275, 60, 180, "r339-p276-header")
# --- کلِ صفحات ۳۰۰dpi
full(122, "r339-p123-full")
full(123, "r339-p124-full")
full(274, "r339-p275-full")
full(275, "r339-p276-full")
