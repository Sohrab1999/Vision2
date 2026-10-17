#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r319 — رندرِ ص۲۲۴ (پاسخنامه‌های سه بانکِ افعال ناقص/معلوم‌مجهول): صفحهٔ کامل ۳۰۰dpi
+ سه برشِ زوم‌شده بر اساس موقعیتِ سربرگ‌ها در لایه."""
import fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
doc = fitz.open(PDF)
page = doc[224 - 1]
W, H = page.rect.width, page.rect.height
print("page size:", W, H)

# موقعیتِ سربرگ‌های سه بخش را از لایه بگیر
anchors = {}
for x0, y0, x1, y1, text, *_ in page.get_text("blocks"):
    t = text.strip()
    if "کارب" in t and "ناق" in t and "149" in t:
        anchors.setdefault("b1", y0)
    if "معل" in t and "مج" in t and "150" in t:
        anchors.setdefault("b2", y0)
    if "تخص" in t and "Modals" in t.replace(" ", ""):
        anchors.setdefault("b3", y0)
print("anchors:", anchors)

page.get_pixmap(matrix=fitz.Matrix(300/72, 300/72)).save("/tmp/r319-p224-full.png")
print("saved full 300dpi")

# برش‌های بر اساس لنگرها (fallback: سه‌سومِ صفحه)
z = 1400/72
if anchors:
    ys = sorted(anchors.values())
    zones = []
    for i, y in enumerate(ys):
        y_end = ys[i+1] if i+1 < len(ys) else H - 20
        zones.append((f"b{i+1}", 0, max(0, y-15), W, min(H, y_end+10)))
else:
    zones = [("b1", 0, H*0.05, W, H*0.38), ("b2", 0, H*0.38, W, H*0.66), ("b3", 0, H*0.66, W, H)]
for name, x0, y0, x1, y1 in zones:
    clip = fitz.Rect(x0, y0, x1, y1)
    pix = page.get_pixmap(matrix=fitz.Matrix(z, z), clip=clip)
    out = f"/tmp/r319-p224-{name}.png"
    pix.save(out)
    print("saved", out, f"clip=({y0:.0f}..{y1:.0f})")
