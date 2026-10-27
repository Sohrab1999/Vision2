# -*- coding: utf-8 -*-
# r372 — پروبِ «نمونه سؤالات امتحانی درس پنجم» هفتم (pdf-p84) و همتای درس ششم (pdf-p90):
# (الف) مرزِ دقیقِ خانوادهٔ پنجم/ششم؛ (ب) رندر ۱۵۰dpi ص۸۲-۹۲؛ (ج) لایهٔ متنیِ کامل
import fitz, re
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه هفتم.pdf"
OUT = Path("/tmp/qa-r372"); OUT.mkdir(parents=True, exist_ok=True)
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

for p in range(82, 93):
    joined = "\n".join(page_lines(p))
    marks = []
    for lesson in ["پنجم","ششم","چهارم","هفتم"]:
        # عنوان‌های دوسطری («درس\nپنجم») هم می‌تواند باشد — هم تک‌خطی هم دوسطری
        if re.search(rf"نمونه سواالت امتحانی", joined) and re.search(rf"درس\s*{lesson}", joined, re.S):
            marks.append(f"EXAM-{lesson}")
    if re.search(r"پاسخنامه|کلید سوا", joined): marks.append("KEY?")
    print(f"pdf-p{p}: {marks if marks else '-'} ({len(page_lines(p))} lines)")

print("\n=== RENDER p82-92 ===")
for pno in range(82, 93):
    page = doc[pno - 1]
    pix = page.get_pixmap(dpi=150)
    f = OUT / f"p{pno}.png"
    pix.save(f); print(f"{f}  {pix.width}x{pix.height}")

print("\n=== LAYER p83-91 ===")
for p in range(83, 92):
    seg = page_lines(p)
    print(f"\n===== pdf-p{p} ({len(seg)} lines) =====")
    for j, s in enumerate(seg): print(f"{j:03d}| {s}")
