# -*- coding: utf-8 -*-
# r324 — زومِ دقیق با مکان‌یابیِ متنیِ «گزینه ( N»
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

def find_item_y(pno0, needle):
    """y-center of the line containing needle on page pno0 (0-based)."""
    page = doc[pno0]
    for b in page.get_text("dict")["blocks"]:
        for ln in b.get("lines", []):
            txt = "".join(sp["text"] for sp in ln["spans"])
            if needle in txt.replace(" ", ""):
                y0 = min(sp["bbox"][1] for sp in ln["spans"])
                y1 = max(sp["bbox"][3] for sp in ln["spans"])
                return (y0 + y1) / 2
    # fallback: block-level
    for b in page.get_text("dict")["blocks"]:
        for ln in b.get("lines", []):
            txt = "".join(sp["text"] for sp in ln["spans"])
            if needle in txt:
                y0 = min(sp["bbox"][1] for sp in ln["spans"])
                y1 = max(sp["bbox"][3] for sp in ln["spans"])
                return (y0 + y1) / 2
    return None

def zoom(pno0, y, name, half_w=300, band=18, dpi=1800):
    page = doc[pno0]
    r = page.rect
    clip = fitz.Rect(r.x0 + r.width - 2 * half_w, max(0, y - band), r.x1, min(r.y1, y + band))
    pix = page.get_pixmap(matrix=fitz.Matrix(dpi / 72.0, dpi / 72.0), clip=clip)
    out = f"/tmp/{name}.png"
    pix.save(out)
    print(out, pix.width, "x", pix.height)

# p243 (0-based 242) — ترجمه‌ها RTL؛ عددِ فارسیِ «۱۴.» و غیره
for label, needle in [
    ("q13", "انقراض"), ("q14", "ماهیگیری"), ("q15", "پاهان"), ("q17", "یعیدو"),
    ("q18", "ششست"), ("q19", "تولاد"), ("q26", "آزار"), ("q27", "مکزیک"),
]:
    y = find_item_y(242, needle)
    print(label, "y=", y)
    if y:
        zoom(242, y, f"r324-k-{label}")

# p244 (0-based 243) — Q35 (پچ) و Q40
for label, needle in [("q35", "پچ"), ("q40", "نجات")]:
    y = find_item_y(243, needle)
    print(label, "y=", y)
    if y:
        zoom(243, y, f"r324-k2-{label}")

# p52 (0-based 51) — Q20 ساقه (English LTR) — «pilot»
y = find_item_y(51, "pilot")
print("q20-stem y=", y)
if y:
    page = doc[51]
    r = page.rect
    clip = fitz.Rect(r.x0, max(0, y - 16), r.x1, min(r.y1, y + 16))
    pix = page.get_pixmap(matrix=fitz.Matrix(1800 / 72.0, 1800 / 72.0), clip=clip)
    pix.save("/tmp/r324-e-q20.png")
    print("/tmp/r324-e-q20.png", pix.width, "x", pix.height)
