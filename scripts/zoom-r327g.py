# -*- coding: utf-8 -*-
# r327g — برشِ RTL-درست: ادامهٔ سطر بعد از لنگر به چپ می‌رود (pl بزرگ)
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# (page, needle, hit_index, tag, pad_left, pad_right)
JOBS = [
    (259, "چشمانتان", 0, "g-q5-verbs", 170, 20),    # نمیتوانید ببینید و میتواند
    (259, "میکروب", 0, "g-q5-tail", 20, 130),       # نامیده می شود (قبل از میکروب? خیر — بعدش)
    (259, "دیده", 0, "g-q6-mishavad", 130, 20),
    (259, "پمپاژ", 0, "g-q8-mikonad", 130, 20),
    (259, "سرما", 0, "g-q9-mikhorid", 130, 20),
    (259, "کامل", 0, "g-q11-mikonad", 120, 30),
    (259, "جالب", 0, "g-q13-boodeand", 130, 20),
    (259, "اتفاق", 0, "g-q15-mitavanad", 30, 140),  # میتواند سمتِ راستِ اتفاق
    (259, "طریق", 0, "g-q16-mitavandand", 160, 20),
    (259, "نامیده", 1, "g-q17-mishavad", 130, 20),
    (259, "رخ", 0, "g-q19-midehad", 110, 20),
    (260, "مقایسه", 0, "g-q25-mishavad", 130, 20),
    (260, "شناسایی", 0, "g-q28-kardand", 130, 20),
    (260, "تغییر", 0, "g-q30-verbs", 140, 60),
    (260, "بایستی", 0, "g-q38-mibayasti", 140, 70),
    (260, "کشد", 0, "g-q40-mikeshad", 20, 120),
]

for pno, needle, idx, tag, pl, pr in JOBS:
    page = doc[pno - 1]
    hits = page.search_for(needle)
    if len(hits) <= idx:
        print(f"MISS p{pno} {needle!r} idx{idx} ({tag}) — {len(hits)} hits")
        continue
    r = hits[idx]
    x0 = max(20, r.x0 - pl)
    x1 = min(page.rect.width - 20, r.x1 + pr)
    clip = fitz.Rect(x0, r.y0 - 7, x1, r.y1 + 7)
    z = 8000 / 72.0
    while clip.width * z > 18500:
        z *= 0.9
    pix = page.get_pixmap(matrix=fitz.Matrix(z, z), clip=clip)
    out = f"/tmp/r327-{tag}.png"
    pix.save(out)
    print(f"{out}  {pix.width}x{pix.height}  z={z*72:.0f}dpi")

print("done")
