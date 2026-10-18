# -*- coding: utf-8 -*-
# r342 — رندرهای داوریِ دوم: متنِ کلوزهای S12/S13 + کلیدهای S9/S10/S12/S13
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)
OUT = "/tmp"


def band(pno, y0, y1, out, dpi):
    """رندرِ باندِ عمودیِ مشخص (مختصاتِ pt)"""
    page = doc[pno]
    clip = fitz.Rect(0, y0, page.rect.width, y1)
    pix = page.get_pixmap(matrix=fitz.Matrix(dpi / 72, dpi / 72), clip=clip)
    path = f"{OUT}/{out}"
    pix.save(path)
    print(f"saved {path} ({pix.width}x{pix.height})")


def crop(pno, needle, out, dpi, pad_top=30, pad_bot=30, occ=0):
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


# متنِ S12 (طاهره صفارزاده) — کلِ باند: از دستور تا جعبه‌های پاسخ
crop(136, "Saffarzadeh", "qa-r342-s12-text-p137.png", 600, pad_top=60, pad_bot=120)

# متنِ S13 (Knowledge is power) — کلِ باند
crop(136, "Knowledge is power", "qa-r342-s13-text-p137.png", 600, pad_top=60, pad_bot=140)

# کلیدِ S9 (ص۲۸۲) — ضمایر تأکیدی
crop(281, "myself bought it", "qa-r342-s9-key-p282.png", 900, pad_top=40, pad_bot=60)

# کلیدِ S10 (ص۲۸۲) — شکلِ افعال
crop(281, "saw/were", "qa-r342-s10-key-p282.png", 700, pad_top=35, pad_bot=90)

# کلیدِ S12+S13 (ص۲۸۲)
crop(281, "translator", "qa-r342-s1213-key-p282.png", 600, pad_top=40, pad_bot=200)

# واژه‌های مشکوکِ S13: «to dated» و «kinds on earth» — ۱۲۰۰dpi
crop(136, "to dated", "qa-r342-s13-dated-p137.png", 1200, pad_top=10, pad_bot=25)
crop(136, "kinds on earth", "qa-r342-s13-kinds-p137.png", 1200, pad_top=25, pad_bot=40)
