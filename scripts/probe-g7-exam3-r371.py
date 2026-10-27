# -*- coding: utf-8 -*-
# r371 — پروبِ «نمونه سؤالات امتحانی درس سوم» هفتم (pdf-p65) و همتای درس چهارم (pdf-p74):
# (الف) مرزِ دقیقِ خانوادهٔ سوم/چهارم؛ (ب) رندر ۱۵۰dpi؛ (ج) لایهٔ متنیِ کامل
import fitz, re
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه هفتم.pdf"
OUT = Path("/tmp/qa-r371"); OUT.mkdir(parents=True, exist_ok=True)
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

for p in range(63, 76):
    joined = "\n".join(page_lines(p))
    marks = []
    for lesson in ["سوم","چهارم","دوم","پنجم"]:
        if re.search(rf"نمونه سواالت امتحانی درس {lesson}", joined):
            marks.append(f"EXAM-{lesson}")
    if re.search(r"پاسخنامه|کلید سوا", joined): marks.append("KEY?")
    print(f"pdf-p{p}: {marks if marks else '-'} ({len(page_lines(p))} lines)")

print("\n=== RENDER p64-76 ===")
for pno in range(64, 77):
    page = doc[pno - 1]
    pix = page.get_pixmap(dpi=150)
    f = OUT / f"p{pno}.png"
    pix.save(f); print(f"{f}  {pix.width}x{pix.height}")

print("\n=== LAYER p64-76 ===")
for p in range(64, 77):
    seg = page_lines(p)
    print(f"\n===== pdf-p{p} ({len(seg)} lines) =====")
    for j, s in enumerate(seg): print(f"{j:03d}| {s}")
