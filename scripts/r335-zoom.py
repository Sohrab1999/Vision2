# -*- coding: utf-8 -*-
# r335 — v2: robust zoom crops (half-width bands, fallback needles from layer text)
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

def line_crop(pno, needles, out, zoom=10, ypad=16, half="full", xanchor=None):
    page = doc[pno]
    rects = []
    for nd in needles:
        rects = page.search_for(nd)
        if rects:
            break
    if not rects:
        print(f"!! NOT FOUND p{pno+1}: {needles[0]}")
        return
    r = rects[0]
    pw = page.rect.width
    if half == "full":
        x0, x1 = pw * 0.03, pw * 0.97
    elif half == "right":
        x0, x1 = pw * 0.45, pw * 0.99
    elif half == "left":
        x0, x1 = pw * 0.02, pw * 0.55
    if xanchor:  # (frac_start, frac_end) of page width
        x0, x1 = pw * xanchor[0], pw * xanchor[1]
    clip = fitz.Rect(x0, r.y0 - ypad, x1, r.y1 + ypad)
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), clip=clip)
    pix.save(out)
    print(f"{out}: y={r.y0:.0f}-{r.y1:.0f} x={r.x0:.0f}-{r.x1:.0f} {pix.width}x{pix.height}")

# A. Q4 «بشی» p267 — layer: «خانه ای است که آنها بیشی از 30 ساله»
line_crop(266, ["ساله که در آن", "آنها بیش", "بشی"], "/tmp/r335-z-q4bashi.png", zoom=10, half="right")
# B. Q6 «بشی» p268 — layer: «هدیه تولدی که من بیشی از همه دوست دارم»
line_crop(267, ["دوست دارم", "هدیه تولدی"], "/tmp/r335-z-q6bashi.png", zoom=10, half="right")
# C. Q7 «کم/کمی بیشی» p268
line_crop(267, ["دو قرن گذشته", "قرن گذشته"], "/tmp/r335-z-q7kam.png", zoom=10, half="right")
# D. Q10 line p268
line_crop(267, ["خریده است", "قشنگ خریده"], "/tmp/r335-z-q10line.png", zoom=10, half="full")
# E. Q11 «نظرآسان» p268
line_crop(267, ["آسان نمی", "به نظر"], "/tmp/r335-z-q11nazar.png", zoom=10, half="right")
# F. Q14 «زیبای» p268 — layer: «فنجان چاب مرصی کوچک زیباب»
line_crop(267, ["گنجه", "موقعیت های خاص"], "/tmp/r335-z-q14ziba.png", zoom=10, half="right")
# G. Q19 tail p269 — layer: «سی رنگ ابریشیم زیبا به نظر نیم رسید»
line_crop(268, ["به نظر نمی رسید", "خانم در آن لباس"], "/tmp/r335-z-q19tail.png", zoom=10, half="full")
# I. Q21 «توپ» p269
line_crop(268, ["روز تولدم", "خوشم آمد"], "/tmp/r335-z-q21toop.png", zoom=10, half="right")
# J. Q22 «قبلا» p269 — layer: «قبال بر روی آن غذا»
line_crop(268, ["بر روی آن غذا", "فراموش نکرده"], "/tmp/r335-z-q22ghablan.png", zoom=10, half="full")
# K. Q23 tail p269
line_crop(268, ["زیر خنده", "ترسیده اش"], "/tmp/r335-z-q23tail.png", zoom=10, half="right")
# L. Q24 «(هنی/هنری)» p269 — layer: «اولی شکل ن (هیی)»
line_crop(268, ["توسعه پیدا", "ارتباط برقرار"], "/tmp/r335-z-q24honari.png", zoom=10, half="full")
# M. Q25 «اصیل» p269
line_crop(268, ["معموال", "پرحرف نیست"], "/tmp/r335-z-q25asil.png", zoom=10, half="full")
# N. Q26 «پس»+«الان» p269
line_crop(268, ["محسن یک", "قد بلند"], "/tmp/r335-z-q26pas.png", zoom=10, half="full")
# P. Q44 «سریعتی» p271 — layer: «یک اسب رسرعت بزرگ جدید»
line_crop(270, ["ورزشی بخرد", "می خواهد یک اسب", "اسب"], "/tmp/r335-z-q44horse.png", zoom=10, half="full")
# Q. Q45 translation p271
line_crop(270, ["قوی تر بود", "رقیبانش"], "/tmp/r335-z-q45boxer.png", zoom=10, half="full")
# U. Q6 «شگفت انگیزه» p268
line_crop(267, ["ساعت دیواری", "چوب ایتالی"], "/tmp/r335-z-q6shgefat.png", zoom=10, half="right")
# T. «رجوع به توضیحات تست شماره» p268
line_crop(267, ["توضیحات تست شماره", "رجوع به"], "/tmp/r335-z-refer.png", zoom=12, half="left")
doc.close()
