#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r317 — برش‌های ریزِ ۹۰۰-۱۶۰۰dpi برای آیتم‌های مبهمِ l2 (بعد از کراس‌چکِ لایه)."""
import sys
import fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"

# item -> (page, y0, y1, dpi, tag)
CLIPS = {
    3:  (198, 105, 131, 900, "tasiir-spacing"),
    6:  (198, 196, 223, 1200, "digits30"),
    12: (198, 398, 445, 900, "barjaste-lotfan"),
    13: (198, 449, 475, 1200, "vahshnak"),
    15: (198, 529, 555, 1200, "asasi-asli"),
    17: (198, 609, 635, 900, "shoke-barayash"),
    18: (198, 639, 685, 1200, "salarium"),
    23: (199, 14, 43, 1200, "ahanruba"),
    25: (199, 78, 123, 900, "darasl-salmon"),
    42: (199, 633, 659, 1200, "fazayande"),
    49: (200, 47, 74, 1200, "nagahan-raman"),
    51: (200, 108, 133, 1200, "azhad-barroyi"),
    53: (200, 168, 194, 1200, "nemidunam"),
    56: (200, 259, 285, 1200, "sangin"),
    60: (200, 379, 405, 1200, "hadaf-matn"),
    61: (200, 409, 436, 900, "gushgir"),
    67: (200, 649, 695, 900, "motasfane"),
    68: (200, 699, 745, 1200, "taki"),
    69: (200, 749, 775, 1200, "kolj-baed"),
    74: (201, 108, 135, 1200, "yakhi70"),
    77: (201, 199, 245, 900, "colon-msl"),
    82: (201, 370, 397, 1200, "pishrafte"),
    86: (201, 492, 518, 1200, "digits20"),
    90: (201, 614, 640, 1200, "taraftar"),
    99: (202, 108, 133, 1200, "ziest"),
    100:(202, 137, 195, 1200, "vaghean"),
}

doc = fitz.open(PDF)
only = [int(a) for a in sys.argv[1:]] or list(CLIPS)
for it in only:
    pno, y0, y1, dpi, tag = CLIPS[it]
    page = doc[pno - 1]
    pix = page.get_pixmap(dpi=dpi, clip=fitz.Rect(0, y0, page.rect.width, y1))
    out = f"/tmp/r317-f{it:03d}-{tag}.png"
    pix.save(out)
    print(out, pix.width, "x", pix.height)
