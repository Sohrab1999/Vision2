# -*- coding: utf-8 -*-
# r344h — برشِ دقیقِ span-محور: هر spanِ نکته با bboxِ خودش + چاپِ همهٔ spanهای y 518-528 و 560-570
import fitz
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
OUT = Path("/tmp/r344")
doc = fitz.open(PDF)
page = doc[127]

d = page.get_text("dict")
targets = []
for block in d["blocks"]:
    if block.get("type") != 0:
        continue
    for line in block["lines"]:
        for span in line["spans"]:
            x0, y0, x1, y1 = span["bbox"]
            t = span["text"]
            if 516 <= y0 <= 528 or 558 <= y0 <= 570:
                print(f"y={y0:.1f} x=({x0:.0f}-{x1:.0f}) {t!r}")
                if "رد" in t or "گزینه" in t:
                    targets.append((x0, y0, x1, y1, t))

for i, (x0, y0, x1, y1, t) in enumerate(targets):
    clip = fitz.Rect(x0 - 8, y0 - 4, x1 + 8, y1 + 4)
    pix = page.get_pixmap(dpi=3000, clip=clip)
    p = OUT / f"span-{i}.png"
    pix.save(p)
    print(p, "|", t.strip()[:40], f"| bbox=({x0:.0f},{y0:.0f},{x1:.0f},{y1:.0f})")
