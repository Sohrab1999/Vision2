# -*- coding: utf-8 -*-
# r346 v3 — برشِ ۱۲ گریدِ باقی‌مانده برای نقطه‌گذاری/فاصله‌های ریز ترجمه‌ها
import fitz

doc = fitz.open("/home/z/my-project/upload/جزوه جامع دهم .pdf")

def grid_clip(pno, needle, name, zoom=9, nlines=2):
    page = doc[pno - 1]
    rects = [r for r in page.search_for(needle) if r.y0 > 50]
    if not rects:
        print(f"!! NOT FOUND p{pno} {needle!r}")
        return
    r = rects[0]
    clip = fitz.Rect(0, r.y0 - 22, page.rect.x1, r.y0 + 20 + 19 * nlines)
    page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), clip=clip).save(f"/tmp/r346-{name}.png")
    print(f"OK {name} y0={r.y0:.0f}")

# ص۲۸۸ — گریدهای ۲،۴،۱۰،۱۱،۱۲،۲۰،۲۱،۲۵،۲۶،۳۰،۳۱
grid_clip(288, "حیرت", "g02")       # حیرت آور؟
grid_clip(288, "ماسه", "g04")       # نقطه‌گذاری «بیابان است.»
grid_clip(288, "آینده", "g10")      # آینده تان
grid_clip(288, "محصول", "g11")      # نقطه پایانی؟
grid_clip(288, "ایده", "g12")       # ایده آل
grid_clip(288, "تحسین", "g20")      # نقطه پایانی
grid_clip(288, "روابط", "g21")      # نقطه پایانی؟
grid_clip(288, "زائر", "g25")       # ویرگول/نقطه بعد کند
grid_clip(288, "سطوح", "g26")       # آموزشگاهای
grid_clip(288, "لندن", "g30")       # احتمال/احتمایل
grid_clip(288, "تکالیف", "g31")     # وسیله کنترل
# ص۲۸۹ — گرید ۳۵
grid_clip(289, "رختخوابم", "g35")   # نقطه پایانی؟
