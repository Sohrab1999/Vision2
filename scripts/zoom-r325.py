# -*- coding: utf-8 -*-
# r325 — جراحیِ نقاط سرنوشت‌ساز کلیدِ ص۲۴۵-۲۴۷ با زومِ ۵۰۰۰-۸۰۰۰dpi
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# (page1based, needle, zoom_dpi, name, pad_up, pad_down)
JOBS = [
    (245, "تاریخی", 6000, "r325-q2-tarikhi", 30, 40),          # Q2: تاریخی های؟
    (245, "واکسن", 6000, "r325-q4-vaksen", 60, 60),            # Q4: واکسنها + کوویران + کرونا + جدی
    (245, "شکارچیان", 6000, "r325-q14-enqeraz", 40, 40),       # Q14: انقراضی؟
    (245, "احساس خوب", 6000, "r325-q15-ehsas", 40, 40),        # Q15: احساس خوبی؟
    (246, "صدایم", 6000, "r325-q23-bala", 45, 45),             # Q23: بلا ببریم؟
    (246, "سیستم دفاع", 6000, "r325-q24-defa", 40, 45),        # Q24: دفاع از خود از خودش؟
    (246, "تولد", 6000, "r325-q27-miz", 45, 45),               # Q27: میز پشت ما؟
    (246, "ناحیه پا", 6000, "r325-q29-masdu", 45, 45),         # Q29: مصدومیت + ترتیب
    (246, "همسایه", 6000, "r325-q32-ra", 45, 45),              # Q32: را دوبل؟
    (246, "اوضاع", 6000, "r325-q34-badqat", 45, 45),           # Q34: به طور با دقت + با ادبانه
    (247, "طلاق", 6000, "r325-q37-talaq", 40, 40),             # Q37: گرفته ان؟
]

for pno, needle, dpi, name, up, down in JOBS:
    page = doc[pno - 1]
    hits = page.search_for(needle)
    if not hits:
        print(f"!! needle not found p{pno}: {needle}")
        continue
    r = hits[0]
    clip = fitz.Rect(r.x0 - 5, r.y0 - up, r.x1 + 5, r.y1 + down)
    z = dpi / 72.0
    pix = page.get_pixmap(matrix=fitz.Matrix(z, z), clip=clip)
    out = f"/tmp/{name}.png"
    pix.save(out)
    print(f"{out}  {pix.width}x{pix.height}  needle_y={r.y0:.0f}")
