# -*- coding: utf-8 -*-
# r327c — رندرِ تک‌خطیِ ۲۶۰۰dpi برای داوریِ فاصله‌ها/چسبیدگی‌های باقی‌ماندهٔ ترجمه‌ها
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# (page, anchor, tag, y_extra_for_two_lines)
JOBS = [
    (259, "صداهایی", "t-q1", 0),
    (259, "قطرات باران", "t-q2", 0),
    (259, "عجایب", "t-q3", 0),
    (259, "ضعف میان", "t-q6", 0),
    (259, "سنگین ببارد", "t-q8", 0),
    (259, "آنفولانزا", "t-q9", 0),
    (259, "رنگ بزند", "t-q10", 0),
    (259, "ماهواره", "t-q11", 0),
    (259, "دانشمندان", "t-q12", 12),
    (259, "مطبوع", "t-q14", 0),
    (259, "وحشتناک", "t-q15", 0),
    (259, "جزئیات", "t-q16", 0),
    (259, "مستقل", "t-q17", 0),
    (259, "هواپیماهای", "t-q18", 0),
    (259, "شمعیها", "t-q20", 0),
    (259, "نیویورک", "t-q21", 0),
    (259, "وضعیت", "t-q23", 0),
    (260, "بریتانیا", "t-q25", 0),
    (260, "مسأله", "t-q26", 0),
    (260, "دسته", "t-q27", 0),
    (260, "آپارتمان", "t-q28", 0),
    (260, "قلبی", "t-q29", 0),
    (260, "کیفیت باال", "t-q32", 0),
    (260, "منظم", "t-q33", 0),
    (260, "خواه", "t-q34", 0),
    (260, "جاذبه", "t-q35", 0),
    (260, "شرکت", "t-q38", 0),
    (260, "مشتری", "t-q40", 0),
]

for pno, needle, tag, ext in JOBS:
    page = doc[pno - 1]
    hits = page.search_for(needle)
    if not hits:
        print(f"MISS p{pno} {needle!r} ({tag})")
        continue
    r = hits[0]
    clip = fitz.Rect(30, r.y0 - 13, page.rect.width - 30, r.y1 + 13 + ext)
    z = 2600 / 72.0
    pix = page.get_pixmap(matrix=fitz.Matrix(z, z), clip=clip)
    out = f"/tmp/r327-{tag}.png"
    pix.save(out)
    print(f"{out}  {pix.width}x{pix.height}")

print("done")
