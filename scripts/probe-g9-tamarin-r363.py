# -*- coding: utf-8 -*-
# r363 — رندرِ صفحاتِ تمرینِ جزوهٔ نهم (ص۱۷/۳۱/۵۱/۶۵/۸۳/۹۶) برای داوریِ چیدمانِ چاپی:
# آیا تمرین‌ها کادرِ خالی (فرم) دارند یا دیالوگِ الگوییِ کامل‌اند؟ (درسِ r362: بلنک در لایه نامرئی است)
import fitz
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه زبان نهم حسن لطفی بوکان.pdf"
OUT = Path("/tmp/qa-r363")
OUT.mkdir(parents=True, exist_ok=True)
doc = fitz.open(PDF)

# صفحاتِ تمرین + چند صفحهٔ همسایه برای مرزها
PAGES = [17, 31, 51, 65, 83, 96]
for pno in PAGES:
    page = doc[pno - 1]
    pix = page.get_pixmap(dpi=150)
    f = OUT / f"p{pno}.png"
    pix.save(f)
    print(f"{f}  {pix.width}x{pix.height}")

# پراکندگیِ ناحیه‌های ترسیمی (rectهای سفید/کادر) — نشانهٔ کادرِ خالیِ چاپی
print("\n===== DRAWINGS per page (rect-like fills) =====")
for pno in PAGES:
    page = doc[pno - 1]
    drawings = page.get_drawings()
    rects = [d for d in drawings if d.get("fill") is not None]
    print(f"p{pno}: total_drawings={len(drawings)} filled={len(rects)}")
    for d in rects[:8]:
        r = d["rect"]
        print(f"   fill={d['fill']} rect=({r.x0:.0f},{r.y0:.0f})-({r.x1:.0f},{r.y1:.0f})")
print("\n===== text spans around Q&A lines (p17) — font/size/color =====")
page = doc[16]
d = page.get_text("dict")
count = 0
for blk in d.get("blocks", []):
    for ln in blk.get("lines", []):
        for sp in ln.get("spans", []):
            t = sp.get("text", "").strip()
            if "hard-working" in t or "Yes, I am" in t or "Is he clever" in t:
                print(f"  font={sp['font']} sz={sp['size']:.1f} color=#{sp['color']:06x} flags={sp['flags']} text={t[:60]!r}")
                count += 1
if count == 0:
    print("  (no matching spans on p17 — Q&A might span differently)")
