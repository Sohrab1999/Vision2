# -*- coding: utf-8 -*-
# r327b — زومِ واژه‌محور: برچسبِ گزینهٔ چهارمِ Q3/Q4 + سطرهای ازدست‌رفته (Q19/Q22/Q36)
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# word-level label zooms — only the label+word of the 4th option
JOBS = [
    # (page, needle, dpi, tag, dx0, dx1, pad)
    (87, "types", 8000, "q3-types-label", 14, 60, 4),      # label «c.» + types
    (87, "collecting", 8000, "q4-coll-label", 14, 60, 4),  # label «c.» + collecting
    (87, "wonders", 8000, "q3-wond-label", 14, 60, 4),     # 3rd option label for contrast
    # missed lines — new anchors
    (259, "جالب خواهد بود", 2600, "k-q19", 300, 300, 12),
    (259, "زردنگ", 2600, "k-q22", 300, 300, 12),
    (260, "تقسیم", 2600, "k-q36", 300, 300, 12),
    # key-letter chips that matter: Q23 (b?) and Q37 (d?) already seen at 300dpi
    (259, "زمانیکه", 2600, "k-q19-alt", 300, 300, 12),
]

for pno, needle, dpi, tag, dx0, dx1, pad in JOBS:
    page = doc[pno - 1]
    hits = page.search_for(needle)
    if not hits:
        print(f"MISS p{pno} {needle!r} ({tag})")
        continue
    r = hits[0]
    x0 = max(20, r.x0 - dx0)
    x1 = min(page.rect.width - 20, r.x1 + dx1)
    clip = fitz.Rect(x0, r.y0 - pad, x1, r.y1 + pad)
    z = dpi / 72.0
    pix = page.get_pixmap(matrix=fitz.Matrix(z, z), clip=clip)
    out = f"/tmp/r327-{tag}.png"
    pix.save(out)
    print(f"{out}  {pix.width}x{pix.height}  y={r.y0:.1f}-{r.y1:.1f}")

print("done")
