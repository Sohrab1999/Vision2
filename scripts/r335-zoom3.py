# -*- coding: utf-8 -*-
# r335 — v3: word-centered zoom crops with absolute x anchors
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

def crop_abs(pno, y, out, x0, x1, zoom=11, ypad=13):
    page = doc[pno]
    clip = fitz.Rect(x0, y - ypad, x1, y + ypad)
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), clip=clip)
    pix.save(out)
    print(f"{out} {pix.width}x{pix.height}")

# y values from v2 search hits (line y0+6)
crop_abs(266, 530, "/tmp/r335-z-q4bashi.png", 40, 390)      # Q4 بشی/بیشی
crop_abs(267, 69, "/tmp/r335-z-q6bashi.png", 170, 520)      # Q6 بشی + شگفت انگیزه
crop_abs(267, 171, "/tmp/r335-z-q7kam.png", 250, 580)       # Q7 کم/کمی بیشی
crop_abs(267, 458, "/tmp/r335-z-q10line.png", 90, 580)      # Q10 full line
crop_abs(267, 505, "/tmp/r335-z-q11nazar.png", 180, 560)    # Q11 نظرآسان
crop_abs(267, 674, "/tmp/r335-z-q14ziba.png", 330, 580)     # Q14 زیبای/زیبایی
crop_abs(268, 193, "/tmp/r335-z-q19tail.png", 280, 580)     # Q19 ابریشمی زیبا
crop_abs(268, 295, "/tmp/r335-z-q21toop.png", 130, 500)     # Q21 توپ آب/آبی
crop_abs(268, 346, "/tmp/r335-z-q22ghablan.png", 140, 540)  # Q22 قبلا/قبأل
crop_abs(268, 416, "/tmp/r335-z-q23tail.png", 40, 400)      # Q23 tail
crop_abs(268, 466, "/tmp/r335-z-q24honari.png", 40, 440)    # Q24 (هنی/هنری)
crop_abs(268, 554, "/tmp/r335-z-q25asil.png", 60, 440)      # Q25 اصیل/اصل
crop_abs(268, 640, "/tmp/r335-z-q26pas.png", 350, 580)      # Q26 پس + الان
crop_abs(270, 423, "/tmp/r335-z-q44horse.png", 260, 580)    # Q44 سریعتی
crop_abs(270, 512, "/tmp/r335-z-q45boxer.png", 100, 540)    # Q45 boxer line
crop_abs(267, 409, "/tmp/r335-z-refer.png", 290, 580)       # رجوع شماره
doc.close()
