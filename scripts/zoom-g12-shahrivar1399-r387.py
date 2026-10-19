#!/usr/bin/env python3
# r387 render arbitration at 300dpi:
#  - p287 S12 passage (scrambled layer) — bottom half of the page
#  - p286 S7 q23 "s - - - phones" dash count + S5 picture row (for the record)
#  - p290 S13 q45-48 conjunction row + S14 image-keyed q49 (for the record)
import fitz, os

PDF = "upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
OUT = "/tmp/qa-r387"
os.makedirs(OUT, exist_ok=True)
doc = fitz.open(PDF)

def zoom(pno, rect, name, dpi=300):
    page = doc[pno - 1]
    r = page.rect
    clip = fitz.Rect(r.width * rect[0], r.height * rect[1],
                     r.width * rect[2], r.height * rect[3])
    pix = page.get_pixmap(dpi=dpi, clip=clip)
    pix.save(f"{OUT}/{name}.png")
    print(name, pix.width, "x", pix.height)

# p287: S12 passage = lower ~45% of the text area (below S11 questions)
zoom(287, (0.06, 0.55, 0.98, 0.98), "p287-s12-passage")
# p286: S7 first-letter row (middle) + S5 picture row (top third)
zoom(286, (0.06, 0.28, 0.98, 0.48), "p286-s7-firstletter")
zoom(286, (0.06, 0.10, 0.98, 0.30), "p286-s5-pictures")
# p290: S13 conjunctions + S14 image-keyed
zoom(290, (0.06, 0.10, 0.98, 0.42), "p290-s13-s14")
doc.close()
