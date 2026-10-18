# -*- coding: utf-8 -*-
# r346 v2 — برشِ گریدهای کلید با فیلترِ y (حذفِ سربرگ) — کل عرضِ گرید + ارتفاعِ ۲-۳ خط
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

def grid_clip(pno, needle, name, zoom, nlines=2, min_y=50):
    """برشِ کلِ عرضِ گریدِ حاوی needle (اولین occurrence با y>min_y)."""
    page = doc[pno - 1]
    rects = [r for r in page.search_for(needle) if r.y0 > min_y]
    if not rects:
        print(f"!! NOT FOUND p{pno} {needle!r}")
        return
    r = rects[0]
    w = page.rect.x1
    clip = fitz.Rect(0, r.y0 - 22, w, r.y0 + 20 + 19 * nlines)
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), clip=clip)
    pix.save(f"/tmp/r346-{name}.png")
    print(f"OK {name} y0={r.y0:.0f}")

# ص۲۸۸ (pno=288)
grid_clip(288, "سؤ", "kq3", 9, nlines=2)
grid_clip(288, "بی ادب", "kq5", 9, nlines=2)
grid_clip(288, "تنش", "kq6", 9, nlines=2)
grid_clip(288, "حیاط", "kq8", 9, nlines=2)
grid_clip(288, "سنت", "kq9", 9, nlines=3)      # ترجمهٔ بلند
grid_clip(288, "مد نر", "kq13", 9, nlines=2)
grid_clip(288, "رسگریم", "kq14", 9, nlines=3)  # ترجمهٔ بلند
grid_clip(288, "داخیل", "kq16", 9, nlines=2)
grid_clip(288, "توریس", "kq22", 9, nlines=2)
grid_clip(288, "احی", "kq23", 9, nlines=3)     # ترجمهٔ بلند + جین
grid_clip(288, "امواج", "kq24", 9, nlines=2)
# ص۲۸۹ (pno=289)
grid_clip(289, "شهر", "kq27", 9, nlines=2)     # دِبی
grid_clip(289, "جهی", "kq28", 9, nlines=2)     # موجهی
grid_clip(289, "مسئوالنه", "kq37", 9, nlines=2)
grid_clip(289, "تفاوت", "kq32", 9, nlines=2)   # بین ما شان
grid_clip(289, "بیشی", "kq36", 9, nlines=2)
grid_clip(289, "هله", "kq39", 9, nlines=3)     # ترجمهٔ بلند
grid_clip(289, "تقاضا", "kq40", 9, nlines=2)
