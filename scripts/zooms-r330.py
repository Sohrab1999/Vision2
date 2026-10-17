# -*- coding: utf-8 -*-
# r330 — میکروزوم‌های جراحی: نقاط سرنوشت‌ساز ص۶۶-۶۷ + کلید ص۲۴۹-۲۵۱
import fitz, unicodedata
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
OUT = Path("/tmp/r330"); OUT.mkdir(exist_ok=True)
doc = fitz.open(PDF)

def norm(s):
    return s.replace("\u200c", "").replace(" ", "").replace("\n", "")

def zoom_around(pno, needle, name, dpi=2600, pad_x=130, pad_y=26, occ=0):
    """لایه فقط مختصات؛ رندر حاکم"""
    page = doc[pno - 1]
    words = page.get_text("words")
    hits = [w for w in words if needle in norm(w[4])]
    if not hits:
        print(f"!! p{pno} '{needle}' NOT FOUND")
        return
    hits = hits if occ == 0 else [hits[occ - 1]] if occ > 0 and len(hits) >= occ else hits
    w = hits[min(occ, len(hits) - 1)] if occ else hits[0]
    r = fitz.Rect(w[0] - pad_x, w[1] - pad_y, w[2] + pad_x, w[3] + pad_y) & page.rect
    pix = page.get_pixmap(dpi=dpi, clip=r)
    pix.save(str(OUT / f"{name}.png"))
    print(f"{name}: '{needle}' -> {pix.width}x{pix.height} at {r}")

# p66 سربرگ
page = doc[65]
r = fitz.Rect(40, 28, 555, 100)
pix = page.get_pixmap(dpi=2200, clip=r); pix.save(str(OUT / "p66-header.png"))
print("p66-header:", pix.width, pix.height)

# p249 سربرگ: «دستگری/دستوری» + بخش
zoom_around(249, "پاسخنامه", "p249-hdr-word", dpi=3000, pad_x=150, pad_y=30)
r = fitz.Rect(40, 28, 555, 105)
pix = doc[248].get_pixmap(dpi=2200, clip=r); pix.save(str(OUT / "p249-header.png"))
print("p249-header:", pix.width, pix.height)

# p249 Q3: ارقام ۱۶/۱۹ + «یک پس/پسر»
zoom_around(249, "ساله", "p249-q3-nums", dpi=3000, pad_x=170, pad_y=30)
zoom_around(249, "یک", "p249-q3-poss", dpi=3000, pad_x=120, pad_y=30, occ=2)
# p249 Q4: بخوند/بخرد
zoom_around(249, "جدید", "p249-q4-end", dpi=3000, pad_x=150, pad_y=30, occ=1)

# p67 برچسب کنکور Q19/Q20
zoom_around(67, "کنکور", "p67-q19-tag", dpi=3000, pad_x=110, pad_y=22)
zoom_around(67, "کنکور", "p67-q20-tag", dpi=3000, pad_x=110, pad_y=22, occ=2)

# p250 Q11: قرار/قراره + بشویم/بشوریم
zoom_around(250, "خواهرم", "p250-q11-line", dpi=3000, pad_x=260, pad_y=28)
zoom_around(250, "بشو", "p250-q11-wash", dpi=4000, pad_x=95, pad_y=24)
# p250 Q16: کمی(مداد و خودکار)
zoom_around(250, "قرض", "p250-q16-line", dpi=3000, pad_x=300, pad_y=28)
# p250 Q14: اگه (زمانیکه) + قطار
zoom_around(250, "زمانیکه", "p250-q14-line", dpi=3000, pad_x=290, pad_y=28)

# p251 برچسب (زبان تخصصی) + ترجمه‌های ۱۹/۲۰
zoom_around(251, "تخصص", "p251-q19-tag", dpi=3000, pad_x=110, pad_y=24)
zoom_around(251, "پرواز", "p251-q19-line", dpi=3000, pad_x=300, pad_y=30)
zoom_around(251, "مید", "p251-q20-line", dpi=3000, pad_x=300, pad_y=30)
zoom_around(251, "شروع", "p251-q20-end", dpi=4000, pad_x=110, pad_y=24, occ=2)
