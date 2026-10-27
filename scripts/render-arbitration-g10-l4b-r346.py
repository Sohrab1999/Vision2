# -*- coding: utf-8 -*-
# r346 — رندرهای داوری ۶۰۰-۳۰۰۰dpi برای «۴۰ تست واژگان» دهم (ص۱۵۱-۱۵۲ + کلید ص۲۸۸-۲۸۹)
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)
OUT = "/tmp"

def clip_render(pno, needle, name, zoom, pad_y=26, pad_x=8, nth=0):
    """برشِ پیرامونِ nامینِ occurrence از needle در صفحهٔ pno (۱-مبنا)."""
    page = doc[pno - 1]
    rects = page.search_for(needle)
    if not rects:
        print(f"!! NOT FOUND: p{pno} {needle!r}")
        return
    if nth >= len(rects):
        print(f"!! nth={nth} > {len(rects)-1}: p{pno} {needle!r}")
        return
    r = rects[nth]
    clip = fitz.Rect(max(0, r.x0 - pad_x), max(0, r.y0 - pad_y),
                     min(page.rect.x1, r.x1 + pad_x), min(page.rect.y1, r.y1 + pad_y))
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), clip=clip)
    path = f"{OUT}/r346-{name}.png"
    pix.save(path)
    print(f"OK {path} ({pix.width}x{pix.height}) from p{pno} {needle!r}#{nth}")

def top_banner(pno, name, zoom, h=120):
    page = doc[pno - 1]
    w = page.rect.x1
    clip = fitz.Rect(0, 55, w, 55 + h)
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), clip=clip)
    path = f"{OUT}/r346-{name}.png"
    pix.save(path)
    print(f"OK {path} ({pix.width}x{pix.height}) banner p{pno}")

# ---------- سربرگ‌ها ----------
top_banner(151, "banner-exam", 7)      # تست واژگان درس چهارم — ارقام پاسخنامه؟
top_banner(288, "banner-key", 7)       # کلید و ترجمه — (سؤالات: صفحه ۱۵۱ تا ۱۵۲)؟

# ---------- ساقه‌های انگلیسی کوئیرک‌دار ----------
clip_render(151, "looked quite", "q11-stem", 9, pad_y=14)          # 11.The چسبیده + ران ۲۳
clip_render(151, "TV performances", "q14-stem", 9, pad_y=14)       # دو فاصله بعد comma
clip_render(152, "couldn", "q24-stem", 9, pad_y=14)                # couldn't با ' مستقیم
clip_render(152, "want to get up", "q35-stem", 9, pad_y=14)        # بدون نقطه پایانی؟
clip_render(152, "low value", "q39-stem", 9, pad_y=14)             # بدون نقطه پایانی؟
clip_render(152, "summer", "q40-stem", 9, pad_y=14)                # نه — tourist -------------------
clip_render(152, "tourist", "q40b-stem", 9, pad_y=14)
clip_render(151, "represent another", "q7-stem", 9, pad_y=30)      # دوسطری + ران ۷تیره
clip_render(152, "complained that", "q28-stem", 9, pad_y=14)       # ران ۱۳تیره
clip_render(152, "coach do to", "q38-stem", 9, pad_y=30)           # شکستگی چاپی

# ---------- ترجمه‌های مشکوک ص۲۸۸ ----------
clip_render(288, "قصد دارد", "kq1", 20, pad_y=20, pad_x=120)
clip_render(288, "سؤ", "kq3", 20, pad_y=20, pad_x=120)             # سؤ االتی
clip_render(288, "بی ادب", "kq5", 20, pad_y=20, pad_x=120)         # بی ادب انه
clip_render(288, "تنش", "kq6", 20, pad_y=20, pad_x=120)            # بیر ن الملیل
clip_render(288, "حیاط", "kq8", 20, pad_y=20, pad_x=120)           # جلوئی
clip_render(288, "سنت", "kq9", 20, pad_y=20, pad_x=120)            # سنت،،
clip_render(288, "رسگریم", "kq14", 20, pad_y=20, pad_x=120)        # برنامه‌های زنده
clip_render(288, "داخیل", "kq16", 20, pad_y=20, pad_x=120)         # درونی داخلی؟
clip_render(288, "مد نر", "kq13", 20, pad_y=20, pad_x=120)         # مدرن
clip_render(288, "امواج", "kq24", 20, pad_y=20, pad_x=120)
clip_render(288, "توریس", "kq22", 20, pad_y=20, pad_x=120)         # توریستی
clip_render(288, "احی", "kq23", 20, pad_y=20, pad_x=120)           # احترام؟
clip_render(288, "جین", "kq23b", 20, pad_y=20, pad_x=120)

# ---------- ترجمه‌های مشکوک ص۲۸۹ ----------
clip_render(289, "دیب", "kq27", 20, pad_y=20, pad_x=120)           # دِبی
clip_render(289, "مؤ", "kq28", 20, pad_y=20, pad_x=120)            # موجهی
clip_render(289, "مسئول", "kq37", 20, pad_y=20, pad_x=120)
clip_render(289, "مسئوالنه", "kq37b", 20, pad_y=20, pad_x=120)
clip_render(289, "تفاوت", "kq32", 20, pad_y=20, pad_x=120)         # بین ما شان
clip_render(289, "بیشی", "kq36", 20, pad_y=20, pad_x=120)          # بیشترِ بیابان؟
clip_render(289, "هله", "kq39", 20, pad_y=20, pad_x=120)           # (بی‌ارزش)؟
clip_render(289, "تقاضا", "kq40", 20, pad_y=20, pad_x=120)         # نقطه وسط؟
