# -*- coding: utf-8 -*-
# r327e — برشِ ۸۰۰۰dpi بر مبنایِ گسترهٔ واقعیِ واژه‌های هر سطر (نبوتِ عرضِ سطر)
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# (page, anchor-word, tag, dx_extra, dpi_cap)
JOBS = [
    (259, "عجایب", "e-q3", 0, 8000),        # کشف کردهاید؟
    (259, "چشمانتان", "e-q5-mid", 60, 8000), # نمیتوانید/میتواند
    (259, "عنوان", "e-q6", 0, 8000),         # دیده می شود
    (259, "ببارد", "e-q8", 0, 8000),         # پمپاژ می کند
    (259, "سرما", "e-q9-mid", 40, 8000),     # میخورید
    (259, "کامل", "e-q11", 0, 8000),         # می کند Q11
    (259, "پاتر", "e-q13", 0, 8000),         # جالب بودهاند
    (259, "وحشتناک", "e-q15-mid", 50, 8000), # میتواند اتفاق بیافتد
    (259, "کره", "e-q16", 0, 8000),          # تلسکوپ میتوانند دیده شوند
    (259, "مستقل", "e-q17", 0, 8000),        # سلول نامیده میشود
    (259, "زمانیکه", "e-q19-mid", 60, 8000), # میدهد
    (260, "بریتانیا", "e-q25", 0, 8000),     # مقایسه می شود؟
    (260, "آپارتمان", "e-q28", 0, 8000),     # شناسایی کردند
    (260, "خودت", "e-q30-mid", 60, 8000),    # تغییر میدهد
    (260, "شرکت", "e-q38-mid", 60, 8000),    # میبایستی
    (260, "مشتری", "e-q40-mid", 60, 8000),   # میکشد
    (259, "رصدخانه", "e-q12b", 0, 8000),     # می شود دوم
]

for pno, needle, tag, dx, cap in JOBS:
    page = doc[pno - 1]
    hits = page.search_for(needle)
    if not hits:
        print(f"MISS p{pno} {needle!r} ({tag})")
        continue
    r = hits[0]
    yc = (r.y0 + r.y1) / 2
    words = [w for w in page.get_text("words") if abs((w[1] + w[3]) / 2 - yc) < 5]
    if not words:
        print(f"NOWORDS p{pno} {needle!r}")
        continue
    x0 = min(w[0] for w in words) - 12 - dx
    x1 = max(w[2] for w in words) + 12 + dx
    clip = fitz.Rect(x0, r.y0 - 7, x1, r.y1 + 7)
    z = cap / 72.0
    while clip.width * z > 19000:
        z *= 0.85
    pix = page.get_pixmap(matrix=fitz.Matrix(z, z), clip=clip)
    out = f"/tmp/r327-{tag}.png"
    pix.save(out)
    print(f"{out}  {pix.width}x{pix.height}  z={z*72:.0f}dpi")

print("done")
