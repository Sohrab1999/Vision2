# -*- coding: utf-8 -*-
# r327d — داوریِ ۸۰۰۰dpi فعلهای «می» و چسبیدگی‌ها — برشِ دنباله/میانهٔ هر سطر
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# (page, anchor, tag, mode, dx)  mode: tail=لبِ چپِ سطر / mid=اطرافِ لنگر
JOBS = [
    (259, "شنیدیم", "v-q1", "tail", 0),
    (259, "عجایب", "v-q3", "tail", 0),          # کشف کردهاید؟
    (259, "چشمانتان", "v-q5-mid", "mid", 150),   # نمیتوانید/میتواند
    (259, "نامیده", "v-q5-tail", "tail", 0),     # نامیده می شود (Q5 tail — نخستین نامیده y~201)
    (259, "عنوان", "v-q6", "tail", 0),           # دیده می شود
    (259, "ببارد", "v-q8", "tail", 0),           # پمپاژ می کند
    (259, "سرما", "v-q9-mid", "mid", 130),       # میخورید
    (259, "کامل", "v-q11", "tail", 0),           # می کند (Q11)
    (259, "دانشمندان", "v-q12-tail", "tail", 0), # رصدخانه نامیده (y~432)
    (259, "پاتر", "v-q13-tail", "tail", 0),      # جالب بودهاند
    (259, "مطبوع", "v-q14", "tail", 0),
    (259, "وحشتناک", "v-q15-mid", "mid", 140),   # میتواند اتفاق
    (259, "کره", "v-q16-tail", "tail", 0),       # تلسکوپ میتوانند دیده شوند (y~572)
    (259, "مستقل", "v-q17", "tail", 0),          # سلول نامیده میشود (y~542)
    (259, "زمانیکه", "v-q19-mid", "mid", 150),   # میدهد
    (259, "نیویورک", "v-q21", "tail", 0),
    (259, "دست داشت", "v-q23", "tail", 0),
    (260, "بریتانیا", "v-q25", "tail", 0),       # مقایسه می شود؟
    (260, "آپارتمان", "v-q28", "tail", 0),       # شناسایی کردند
    (260, "خودت", "v-q30-mid", "mid", 170),      # تغییر میدهد
    (260, "شرکت", "v-q38-mid", "mid", 150),      # میبایستی/می بایستی
    (260, "مشتری", "v-q40-mid", "mid", 150),     # میکشد/می کشد
]

for pno, needle, tag, mode, dx in JOBS:
    page = doc[pno - 1]
    hits = page.search_for(needle)
    if not hits:
        print(f"MISS p{pno} {needle!r} ({tag})")
        continue
    r = hits[0]
    if mode == "tail":
        x0, x1 = 30, 200
    else:
        x0, x1 = max(30, r.x0 - dx), min(page.rect.width - 30, r.x1 + dx)
    clip = fitz.Rect(x0, r.y0 - 7, x1, r.y1 + 7)
    z = 8000 / 72.0
    pix = page.get_pixmap(matrix=fitz.Matrix(z, z), clip=clip)
    out = f"/tmp/r327-{tag}.png"
    pix.save(out)
    print(f"{out}  {pix.width}x{pix.height}  y={r.y0:.0f}")

print("done")
