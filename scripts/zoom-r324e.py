# -*- coding: utf-8 -*-
# r324 — زومِ ۵۰۰۰dpi واژه‌به‌واژه با مختصاتِ spanِ لایه (رندر حاکم، لایه تقطیع‌شده)
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# (pno0, needle-in-span, pad_y, name) — span containing the needle gets its bbox
TARGETS = [
    (242, "امروزه ایجاد", 1.0, "r324-z-q11"),
    (242, "اینجا رودخانه", 1.0, "r324-z-q14a"),
    (242, "آبراه یک برای", 1.0, "r324-z-q14b"),
    (242, "زیر پایمان", 1.0, "r324-z-q15"),
    (242, "طول عمر شصت", 1.0, "r324-z-q18"),
    (242, "کنیر ل تولد", 1.0, "r324-z-q19"),
    (243, "آنها در یک", 1.2, "r324-z-q35"),
]

for pno0, needle, pad, name in TARGETS:
    page = doc[pno0]
    hit = None
    for b in page.get_text("dict")["blocks"]:
        for ln in b.get("lines", []):
            for sp in ln["spans"]:
                if needle.split()[0] in sp["text"] and needle.split()[-1] in sp["text"]:
                    hit = fitz.Rect(sp["bbox"])
                    break
            if hit: break
        if hit: break
    if not hit:
        print(f"{name}: NOT FOUND ({needle})")
        continue
    r = hit + (-2 * pad, -2 * pad, 2 * pad, 2 * pad)
    pix = page.get_pixmap(matrix=fitz.Matrix(5000 / 72.0, 5000 / 72.0), clip=r)
    out = f"/tmp/{name}.png"
    pix.save(out)
    print(out, pix.width, "x", pix.height, "span_bbox=", hit)
