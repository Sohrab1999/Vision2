# -*- coding: utf-8 -*-
# r348 — رندر و رنگ‌کاویِ «آزمون جامع تشریحی درس چهارم» دهم (ص۱۶۴-۱۶۶، کلید ص۲۹۳-۲۹۴)
# ۱) رنگِ اسپن‌ها در صفحاتِ کلید (تشخیصِ کلیدِ رنگ‌نشانه‌ایِ S10)
# ۲) رندرهای برشی برای داوریِ چشمی
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# ---- بخش ۱: رنگ‌کاویِ اسپن‌های کلیدِ ص۲۹۴ (S10 تلفظ) و ص۲۹۳ ----
for pno in (292, 293):
    page = doc[pno]
    print(f"##### SPAN COLORS PAGE {pno+1} (non-black) #####")
    d = page.get_text("dict")
    for blk in d["blocks"]:
        if blk.get("type") != 0:
            continue
        for line in blk["lines"]:
            for span in line["spans"]:
                c = span["color"]
                # black = 0; report anything else
                if c != 0:
                    t = span["text"].strip()
                    if t:
                        print(f"  color=#{c:06x} size={span['size']:.0f} text={t!r}")
    print()

# ---- بخش ۲: رندر برشی ----
# (page_index, clip_rect_pdf_points, dpi, name)
crops = [
    (163, (40, 60, 560, 200), 1000, "p164-header-s1"),      # سربرگ + دستور S1 + Q1
    (163, (40, 190, 560, 330), 1000, "p164-s2-instr-bank"),  # دستور S2 + بانک واژه
    (163, (40, 330, 560, 560), 1000, "p164-s3-s4"),          # S3 + S4
    (163, (40, 560, 560, 790), 1000, "p164-s5"),             # S5
    (164, (40, 60, 560, 340), 1000, "p165-s6"),              # S6
    (164, (40, 340, 560, 560), 1000, "p165-s7-s8"),          # S7 + S8
    (164, (40, 560, 560, 790), 1000, "p165-s9-s10"),         # S9 + S10
    (165, (40, 60, 560, 300), 1000, "p166-s11"),             # S11
    (165, (40, 300, 560, 560), 1000, "p166-s12"),            # S12
    (165, (40, 560, 560, 800), 1000, "p166-s13"),            # S13
    (292, (40, 60, 560, 400), 1000, "p293-key-head-s1-s3"),  # سربرگ کلید + S1-S3
    (292, (40, 400, 560, 790), 1000, "p293-key-s4-s8"),      # کلید S4-S8
    (293, (40, 60, 560, 500), 1000, "p294-key-s8-s13"),      # کلید S8-S13
]
for pno, clip, dpi, name in crops:
    page = doc[pno]
    pix = page.get_pixmap(dpi=dpi, clip=fitz.Rect(*clip))
    out = f"/tmp/qa-r348-{name}.png"
    pix.save(out)
    print(f"saved {out} ({pix.width}x{pix.height})")
