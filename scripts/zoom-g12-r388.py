#!/usr/bin/env python3
# r388 render arbitration (300dpi crops):
# 1) p293 picture row (deaf paper S1: pictures (1)-(4) vs options a-e)
# 2) p260 picture row (Khordad 1399 math paper S4: pictures (16)-(19) vs options a-e)
import fitz, os

PDF = "upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
OUT = "/tmp/qa-r388"
doc = fitz.open(PDF)

def crop(pno, y0f, y1f, name):
    page = doc[pno - 1]
    r = page.rect
    clip = fitz.Rect(r.x0, r.y0 + r.height * y0f, r.x1, r.y0 + r.height * y1f)
    pix = page.get_pixmap(dpi=300, clip=clip)
    path = f"{OUT}/{name}.png"
    pix.save(path)
    print("saved", path, pix.width, "x", pix.height)

# deaf p293: picture row sits mid-page (after the five option sentences) — take 35%-75%
crop(293, 0.30, 0.80, "p293-s1-pictures")
# math p260: picture row mid-page — take 30%-85%
crop(260, 0.28, 0.85, "p260-s4-pictures")
doc.close()
