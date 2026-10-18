# -*- coding: utf-8 -*-
# r339 — زوم‌های داوریِ نهایی: Q22 حقیقتی/حقیقی، Q24 در۴شنبه، Q37 هنگامی‌که، Q21 زگهواره، Q28/Q33 نقطهٔ پایانی
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

def zoom(pno0, needle, name, dpi=3600, band_h=10):
    y = find_y(pno0, needle)
    if y is None:
        print(f"!! {name}: {needle!r} not found on page {pno0+1}")
        return
    page = doc[pno0]
    r = page.rect
    clip = fitz.Rect(r.x0, max(0, y - band_h), r.x1, min(r.y1, y + band_h))
    pix = page.get_pixmap(matrix=fitz.Matrix(dpi / 72.0, dpi / 72.0), clip=clip)
    out = f"/tmp/{name}.png"
    pix.save(out)
    print(out, pix.width, "x", pix.height)

# p275 (0-based 274)
zoom(274, "حقیقت", "r339-z-q22")
zoom(274, "4شنبه", "r339-z-q24")
zoom(274, "زگهواره", "r339-z-q21")
zoom(274, "تلاوت", "r339-z-q28")
zoom(274, "اعتماد", "r339-z-q33")
# p276 (0-based 275)
zoom(275, "هنگام", "r339-z-q37")
zoom(275, "دانشی", "r339-z-q39")
zoom(275, "1397", "r339-z-q34")
zoom(275, "بیر", "r339-z-q31")
