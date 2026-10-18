# -*- coding: utf-8 -*-
# r342 — رندرهای داوریِ «آزمون جامع تشریحی درس سوم» (ص۱۳۵-۱۳۷، کلیدِ ص۲۸۱-۲۸۲)
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)
OUT = "/tmp"


def crop(pno, needle, out, dpi, pad_top=30, pad_bot=30, occ=0):
    """رندرِ برشِ افقیِ دورِ اولین/nامین وقوعِ needle در صفحه"""
    page = doc[pno]
    rects = page.search_for(needle)
    if not rects:
        print(f"!! p{pno+1}: '{needle}' not found")
        return
    r = rects[min(occ, len(rects) - 1)]
    clip = fitz.Rect(0, max(0, r.y0 - pad_top), page.rect.width, min(page.rect.height, r.y1 + pad_bot))
    pix = page.get_pixmap(matrix=fitz.Matrix(dpi / 72, dpi / 72), clip=clip)
    path = f"{OUT}/{out}"
    pix.save(path)
    print(f"saved {path} ({pix.width}x{pix.height})")


# ۱) سربرگِ آزمونِ ص۱۳۵ (بالاِ صفحه) — ۶۰۰dpi
crop(134, "آزمون", "qa-r342-hdr-p135.png", 600, pad_top=0, pad_bot=140)

# ۲) بانکِ واژهٔ S2 در ص۱۳۵ — ۹۰۰dpi (شمارشِ واژه‌ها: لایه ۸ می‌دهد، دستور «یک کلمه اضافه»)
crop(134, "ashamed", "qa-r342-s2-bank-p135.png", 900, pad_top=25, pad_bot=55)

# ۳) دستورِ S2 + دستورِ S3 — ۶۰۰dpi
crop(134, "کلمات داده شده", "qa-r342-s2-instr-p135.png", 600, pad_top=20, pad_bot=60)

# ۴) گزینه‌های S6 در ص۱۳۶ — ۹۰۰dpi (لایه به‌هم‌ریخته: yourself a / b. herself / .m yself c / imself d. h)
crop(135, "photographs", "qa-r342-s6-opts-p136.png", 900, pad_top=25, pad_bot=200)

# ۵) سکشن ۱۱ در ص۱۳۷ — ۹۰۰dpi (تأکیدِ تلفظ)
crop(136, "washing the dishes", "qa-r342-s11-p137.png", 900, pad_top=25, pad_bot=80)

# ۶) سربرگِ کلیدِ ص۲۸۱ — ۶۰۰dpi
crop(280, "پاسخنامه", "qa-r342-hdr-p281.png", 600, pad_top=0, pad_bot=140)

# ۷) کلیدِ S11 در ص۲۸۲ — ۱۲۰۰dpi (نحوهٔ نشان‌دادنِ پاسخ — بولد/زیرخط؟)
crop(281, "pencil", "qa-r342-s11-key-p282.png", 1200, pad_top=25, pad_bot=80)

# ۸) کلیدِ S11-Q1 — ۱۲۰۰dpi
crop(281, "washing", "qa-r342-s11-key-q1-p282.png", 1200, pad_top=20, pad_bot=60)
