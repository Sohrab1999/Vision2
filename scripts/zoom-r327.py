# -*- coding: utf-8 -*-
# r327 — جراحیِ میکروزوم: نقاطِ سرنوشت‌سازِ کلید/ترجمه و سطرهای گزینهٔ Q3/Q4
# الگوی r325: سطر در 2600dpi، واژه/حرف در 4000-8000dpi (کلیپِ باریک — OOM نکن)
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# (page, anchor-substring, dpi, tag, pad_y, x0, x1)
JOBS = [
    # p87 — سطرهای گزینهٔ Q3 و Q4 (برچسبِ دوتاییِ c)
    (87, "wonders", 3000, "q3-opts", 10, None, None),
    (87, "collecting", 3000, "q4-opts", 10, None, None),
    # p259 — کلید و ترجمه‌های سرنوشت‌ساز
    (259, "جمع آوری", 2600, "k-q4", 12, None, None),
    (259, "پاتر", 2600, "k-q13", 12, None, None),
    (259, "پتر شود", 2600, "k-q19", 12, None, None),
    (259, "پلاسما", 2600, "k-q22", 12, None, None),
    (259, "موجود زنده", 2600, "k-q5", 12, None, None),
    (259, "منظومه", 2600, "k-q7", 12, None, None),
    (259, "عطارد", 2600, "k-q7b", 12, None, None),
    # p260 — ادامهٔ ترجمه‌ها
    (260, "لیوان", 2600, "k-q31", 12, None, None),
    (260, "دهه", 2600, "k-q37", 12, None, None),
    (260, "مراقبت", 2600, "k-q39", 12, None, None),
    (260, "عامل", 2600, "k-q36", 12, None, None),
    (260, "برریس", 2600, "k-q24", 12, None, None),
    (260, "خودت", 2600, "k-q30", 12, None, None),
]

for pno, needle, dpi, tag, pad, fx0, fx1 in JOBS:
    page = doc[pno - 1]
    hits = page.search_for(needle)
    if not hits:
        print(f"MISS p{pno} {needle!r} ({tag})")
        continue
    r = hits[0]
    W = page.rect.width
    x0 = fx0 if fx0 is not None else max(20, r.x0 - 260)
    x1 = fx1 if fx1 is not None else min(W - 20, r.x1 + 260)
    clip = fitz.Rect(x0, r.y0 - pad, x1, r.y1 + pad)
    z = dpi / 72.0
    pix = page.get_pixmap(matrix=fitz.Matrix(z, z), clip=clip)
    out = f"/tmp/r327-{tag}.png"
    pix.save(out)
    print(f"{out}  {pix.width}x{pix.height}  anchor={needle!r} y={r.y0:.1f}-{r.y1:.1f}")

print("done")
