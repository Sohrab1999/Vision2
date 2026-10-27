# -*- coding: utf-8 -*-
# r339 — زوم‌های داوریِ نهایی، نسخهٔ ۲: نیمهٔ راستِ صفحه (ترجمه‌ها راست‌چین‌اند)
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

def find_y(pno0, needle):
    page = doc[pno0]
    for b in page.get_text("dict")["blocks"]:
        for ln in b.get("lines", []):
            txt = "".join(sp["text"] for sp in ln["spans"])
            if needle in txt.replace(" ", ""):
                y0 = min(sp["bbox"][1] for sp in ln["spans"])
                y1 = max(sp["bbox"][3] for sp in ln["spans"])
                return (y0 + y1) / 2
    for b in page.get_text("dict")["blocks"]:
        for ln in b.get("lines", []):
            txt = "".join(sp["text"] for sp in ln["spans"])
            if needle in txt:
                y0 = min(sp["bbox"][1] for sp in ln["spans"])
                y1 = max(sp["bbox"][3] for sp in ln["spans"])
                return (y0 + y1) / 2
    return None

def zoom_right(pno0, needle, name, dpi=2400, band_h=11, width_pt=420):
    y = find_y(pno0, needle)
    if y is None:
        print(f"!! {name}: {needle!r} not found on page {pno0+1}")
        return
    page = doc[pno0]
    r = page.rect
    clip = fitz.Rect(max(r.x0, r.x1 - width_pt), max(0, y - band_h), r.x1, min(r.y1, y + band_h))
    pix = page.get_pixmap(matrix=fitz.Matrix(dpi / 72.0, dpi / 72.0), clip=clip)
    out = f"/tmp/{name}.png"
    pix.save(out)
    print(out, pix.width, "x", pix.height)

# p275 (0-based 274)
zoom_right(274, "چشمهایش", "r339-z2-q24")
zoom_right(274, "ضروری", "r339-z2-q28")
zoom_right(274, "خودشان", "r339-z2-q33")
# p276 (0-based 275)
zoom_right(275, "فضا", "r339-z2-q39")
zoom_right(275, "بزودی", "r339-z2-q39b")
