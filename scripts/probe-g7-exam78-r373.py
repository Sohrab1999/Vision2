# -*- coding: utf-8 -*-
# r373 — پروبِ «نمونه سؤالات امتحانی درس هفتم» هفتم (pdf-p97) و همتای درس هشتم (pdf-p103):
# (الف) مرزِ دقیقِ خانوادهٔ هفتم/هشتم؛ (ب) رندر ۱۵۰dpi ص۹۷ و ص۱۰۳؛ (ج) زوم ۳۰۰dpi برای داوریِ کلیدِ
#   سکشن‌های مشکوک: ص۹۷-س۲ (فرگمنت‌های املا)، ص۱۰۳-س۴ (علامتِ سرگردانِ «b.»)، ص۱۰۳-س۵ (نقطه‌چینِ فارسی)
import fitz, re
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه هفتم.pdf"
OUT = Path("/tmp/qa-r373"); OUT.mkdir(parents=True, exist_ok=True)
doc = fitz.open(PDF)
LAYER = Path("/home/z/my-project/booklet-extract/g7.txt").read_text(encoding="utf-8").split("\n")
PM = {}
for i, l in enumerate(LAYER):
    m = re.match(r"<<<PAGE (\d+)>>>", l)
    if m: PM[int(m.group(1))] = i

def page_lines(p):
    start = PM[p]
    end = next((v for q, v in sorted(PM.items()) if q > p), len(LAYER))
    return LAYER[start:end]

# (الف) مرزِ خانواده‌ها — تیترِ دوم خطی است، پس مستقیم چکِ لایه
for p in range(95, 105):
    joined = "\n".join(page_lines(p))
    marks = []
    for lesson in ["هفتم", "هشتم", "نهم"]:
        if re.search(rf"نمونه سواالت امتحانی درس\s*{lesson}", joined) or \
           ("نمونه سواالت امتحانی درس" in joined and lesson in joined.split("نمونه سواالت امتحانی درس")[1][:30]):
            marks.append(f"EXAM-{lesson}")
    if re.search(r"پاسخنامه|کلید سوا", joined): marks.append("KEY?")
    print(f"pdf-p{p}: {marks if marks else '-'} ({len(page_lines(p))} lines)")

# (ب) رندر ۱۵۰dpi
print("\n=== RENDER p97, p103, p104 ===")
for pno in (97, 103, 104):
    page = doc[pno - 1]
    pix = page.get_pixmap(dpi=150)
    f = OUT / f"p{pno}.png"
    pix.save(f); print(f"{f}  {pix.width}x{pix.height}")

# (ج) زوم ۳۰۰dpi — نیمهٔ بالایی ص۹۷ (س۱-س۲) و ص۱۰۳ (س۴-س۵)
def zoom(pno, y0, y1, name):
    page = doc[pno - 1]
    r = page.rect
    clip = fitz.Rect(r.x0, r.y0 + r.height * y0, r.x1, r.y0 + r.height * y1)
    pix = page.get_pixmap(dpi=300, clip=clip)
    f = OUT / name
    pix.save(f); print(f"{f}  {pix.width}x{pix.height}")

print("\n=== ZOOMS 300dpi ===")
zoom(97, 0.05, 0.55, "p97-top.png")      # س۱ (مچینگ) + س۲ (فرگمنت‌ها)
zoom(97, 0.50, 1.00, "p97-bottom.png")   # س۳ (ناهماهنگ) + س۴ (ساعت)
zoom(103, 0.35, 0.75, "p103-mid.png")    # س۳ + س۴ (علامتِ «b.»)
zoom(103, 0.70, 1.00, "p103-bottom.png") # س۵ (نقطه‌چینِ فارسی؟)

print("\n=== LAYER p97 & p103 (numbered) ===")
for p in (97, 103):
    seg = page_lines(p)
    print(f"\n===== pdf-p{p} ({len(seg)} lines) =====")
    for j, s in enumerate(seg): print(f"{j:03d}| {s}")
