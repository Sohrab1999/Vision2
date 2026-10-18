# -*- coding: utf-8 -*-
# r341 — رندرهای داوری ص۱۳۴ (آزمون) و ص۲۷۹-۲۸۰ (کلید)
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

def full(pno0, name, dpi=600):
    page = doc[pno0]
    pix = page.get_pixmap(matrix=fitz.Matrix(dpi / 72.0, dpi / 72.0))
    out = f"/tmp/{name}.png"
    pix.save(out)
    print(out, pix.width, "x", pix.height)

full(133, "r341-p134-full")
full(278, "r341-p279-full")
full(279, "r341-p280-full")

# برش‌های زوم برای داوریِ سربرگ و ترجمه‌های حساس
def crop(pno0, name, rect, dpi=1200):
    page = doc[pno0]
    pix = page.get_pixmap(matrix=fitz.Matrix(dpi / 72.0, dpi / 72.0), clip=fitz.Rect(*rect))
    out = f"/tmp/{name}.png"
    pix.save(out)
    print(out, pix.width, "x", pix.height)

page = doc[133]
w, h = page.rect.width, page.rect.height
# سربرگِ آزمون (بالای صفحه)
crop(133, "r341-p134-header", (0, 0.06 * h, w, 0.16 * h))

# ترجمه‌های کلیدِ حساس — ص۲۷۹: Q3 (ماشیر ن/مین نل)، Q4 (یگ/قدییم/ا م)، Q7 (مایه/سیایه)
page279 = doc[278]
w2, h2 = page279.rect.width, page279.rect.height
crop(278, "r341-p279-top", (0, 0.05 * h2, w2, 0.22 * h2))     # سربرگ + شیوهٔ کلی
crop(278, "r341-p279-q3", (0, 0.28 * h2, w2, 0.36 * h2))
crop(278, "r341-p279-q4", (0, 0.36 * h2, w2, 0.44 * h2))
crop(278, "r341-p279-q7", (0, 0.58 * h2, w2, 0.68 * h2))

# ص۲۸۰: Q13 (مهمه)، Q16 (!!!)، Q17 (یم شوید)، Q18 (همکالیس/در خواست)، Q19 (واقعأ/لباسهاب)، Q20 (پسی/خییل/میر سید)
crop(279, "r341-p280-q13", (0, 0.13 * h2, w2, 0.23 * h2))
crop(279, "r341-p280-q16", (0, 0.33 * h2, w2, 0.43 * h2))
crop(279, "r341-p280-q17", (0, 0.43 * h2, w2, 0.53 * h2))
crop(279, "r341-p280-q18", (0, 0.53 * h2, w2, 0.63 * h2))
crop(279, "r341-p280-q19", (0, 0.63 * h2, w2, 0.73 * h2))
crop(279, "r341-p280-q20", (0, 0.73 * h2, w2, 0.85 * h2))
