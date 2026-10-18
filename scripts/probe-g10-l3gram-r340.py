# -*- coding: utf-8 -*-
# r340 — پروبِ کاملِ «آزمون تشریحی گرامر درس سوم» (ص۱۳۱-۱۳۳، کلید ص۲۷۷-۲۷۸)
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

for pno in (130, 131, 132, 276, 277):
    page = doc[pno]
    txt = page.get_text("text")
    print(f"########## PAGE {pno+1} ({len(txt)} chars) ##########")
    print(txt)
    print()

def full(pno0, name, dpi=300):
    page = doc[pno0]
    pix = page.get_pixmap(matrix=fitz.Matrix(dpi / 72.0, dpi / 72.0))
    out = f"/tmp/{name}.png"
    pix.save(out)
    print(out, pix.width, "x", pix.height)

for pno, nm in [(130, "r340-p131-full"), (131, "r340-p132-full"), (132, "r340-p133-full"),
                (276, "r340-p277-full"), (277, "r340-p278-full")]:
    full(pno, nm)
