#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r318 — رندرِ نوارهایِ ۱۴۰۰dpi برای داوریِ واژه‌های مناقشه‌برانگیز (۱۱ نوار)."""
import fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
doc = fitz.open(PDF)

# (page, y0, y1, tag)
strips = [
    (181, 355, 440, "q12-q14"),        # Q12, Q14
    (181, 488, 575, "q17-q19"),        # Q17, Q18, Q19
    (181, 592, 655, "q21-q22"),        # Q21, Q22
    (182, 45, 90, "q29"),              # Q29
    (182, 170, 300, "q33-q37"),        # Q33, Q36, Q37
    (182, 372, 510, "q40-q44"),        # Q40, Q42, Q43, Q44
    (182, 580, 790, "q48-q54"),        # Q48, Q52, Q54
    (183, 20, 60, "q56"),              # Q56
    (183, 125, 240, "q60-q63"),        # Q60, Q61, Q63
    (183, 318, 510, "q66-q70"),        # Q66, Q68, Q69, Q70
    (183, 688, 725, "q78"),            # Q78
    (184, 180, 220, "q88"),            # Q88
    (184, 305, 340, "q93"),            # Q93
    (184, 468, 530, "q99-q100"),       # Q99, Q100
]
for pno, y0, y1, tag in strips:
    page = doc[pno - 1]
    clip = fitz.Rect(0, y0 - 4, page.rect.width, y1 + 4)
    pix = page.get_pixmap(dpi=1400, clip=clip)
    out = f"/tmp/l1z-{tag}-1400.png"
    pix.save(out)
    print(out, pix.width, "x", pix.height)
doc.close()
