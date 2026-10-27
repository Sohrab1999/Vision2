# -*- coding: utf-8 -*-
# r327f — برشِ واژه-محلیِ ۸۰۰۰dpi (±55pt) برای داوریِ نهاییِ فعلها
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# (page, needle, hit_index, tag, pad_left, pad_right)
JOBS = [
    (259, "کرده", 0, "f-q3-karde", 30, 90),      # کردهاید؟
    (259, "چشمانتان", 0, "f-q5-nemitavanid", 20, 150),
    (259, "میکروب", 0, "f-q5-tail", 20, 130),     # نامیده می شود
    (259, "دیده", 0, "f-q6-dideh", 20, 130),
    (259, "پمپاژ", 0, "f-q8-pomp", 20, 130),
    (259, "سرما", 0, "f-q9-mikhorid", 20, 130),
    (259, "کامل", 0, "f-q11-mikonad", 30, 120),
    (259, "جالب", 0, "f-q13-boodeand", 20, 130),
    (259, "اتفاق", 0, "f-q15-mitavanad", 110, 130),
    (259, "طریق", 0, "f-q16-mitavandand", 30, 150),
    (259, "نامیده", 1, "f-q17-tail", 20, 130),    # دومین نامیده = Q17
    (259, "رخ", 0, "f-q19-midehad", 60, 100),
    (260, "مقایسه", 0, "f-q25-mishavad", 20, 130),
    (260, "شناسایی", 0, "f-q28-kardand", 20, 130),
    (260, "تغییر", 0, "f-q30-midehad", 20, 130),
    (260, "بایستی", 0, "f-q38-mibayasti", 60, 130),
    (260, "کشد", 0, "f-q40-mikeshad", 60, 110),
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
