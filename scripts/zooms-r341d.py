# -*- coding: utf-8 -*-
# r341 — برشِ تک‌واژه‌های مشکوک در ۸۰۰۰dpi (لایهٔ واژه → مختصات دقیق)
import fitz

doc = fitz.open("/home/z/my-project/upload/جزوه جامع دهم .pdf")

# (pno0, y_min, y_max, [candidate words], tag)
TARGETS = [
    (278, 188, 200, ["باال", "بالا"], "q2-baalaa"),
    (278, 228, 242, ["ماشیر", "ماشین"], "q3-maashin"),
    (278, 228, 242, ["درحایل", "درحالی"], "q3-darhaali"),
    (278, 232, 244, ["مین", "نل", "مینال", "مینل"], "q3-minaal"),
    (278, 270, 284, ["یگ", "یکی"], "q4-yeki"),
    (278, 270, 284, ["قدییم", "قدیمی"], "q4-ghadimi"),
    (278, 274, 286, ["ا", "م", "ام"], "q4-am"),
    (278, 311, 325, ["شکالت", "شکلات"], "q5-shokolaat"),
    (278, 315, 327, ["میر", "فت", "میرفت"], "q5-miraft"),
    (278, 394, 408, ["مایه", "ماهی"], "q7-maahi"),
    (278, 394, 408, ["سیایه", "سیاه"], "q7-siaah"),
    (278, 435, 449, ["سینماب", "سینما"], "q8-sinema"),
    (278, 476, 490, ["صداب", "صدا"], "q9-sedaa"),
    (278, 480, 492, ["رسش", "سرش"], "q9-sarash"),
    (278, 576, 590, ["بیر", "ون", "بیرون"], "q11-biroon"),
    (278, 660, 674, ["تمیر", "ن", "تمیزن"], "q13-tamiz"),
    (278, 660, 674, ["مهمه", "مهمه‌است", "مهم"], "q13-mohemme"),
    (278, 702, 716, ["تنهاب", "تنهایی"], "q14-tanhaa"),
    (279, 40, 54, ["تنهاب", "تنهایی"], "q17-tanhaa"),
    (279, 44, 56, ["یم", "شوید", "میشوید"], "q17-mishuyad"),
    (279, 82, 96, ["همکالیس", "همکلاسی"], "q18-hamkelasi"),
    (279, 86, 98, ["در", "خواست", "درخواست"], "q18-darkhaast"),
    (279, 138, 152, ["واقعأ", "واقعاً"], "q19-vaaghean"),
    (279, 142, 154, ["لباسهاب", "لباسها"], "q19-lebaas"),
    (279, 195, 209, ["پسی", "پسر"], "q20-pesar"),
    (279, 195, 209, ["خییل", "خیلی"], "q20-kheyli"),
    (279, 199, 211, ["میر", "سید", "میرسید"], "q20-miresid"),
]

for pno, ymin, ymax, cands, tag in TARGETS:
    page = doc[pno]
    found = [w for w in page.get_text("words") if ymin <= w[1] <= ymax and w[4] in cands]
    if not found:
        print(f"{tag}: NOT FOUND in layer ({cands})")
        continue
    for i, w in enumerate(found[:1]):
        x0, y0, x1, y1 = w[0], w[1], w[2], w[3]
        pix = page.get_pixmap(matrix=fitz.Matrix(8000 / 72.0, 8000 / 72.0), clip=fitz.Rect(x0 - 2, y0 - 2, x1 + 2, y1 + 3))
        out = f"/tmp/r341w-{tag}.png"
        pix.save(out)
        print(f"{tag}: {w[4]} @({x0:.0f},{y0:.0f}) → {out} {pix.width}x{pix.height}")
