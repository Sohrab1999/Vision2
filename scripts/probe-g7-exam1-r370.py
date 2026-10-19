# -*- coding: utf-8 -*-
# r370 — پروبِ «نمونه سؤالات امتحانی درس اول» هفتم (pdf-p50+):
# (الف) مرزِ دقیقِ خانواده: سربرگِ امتحانیِ درس اول کجاست و تا کجا؟ (سربرگِ درس دوم = مرز)
# (ب) رندر ۱۵۰dpi برای داوریِ چیدمانِ چاپی
# (ج) لایهٔ متنیِ کاملِ بازه
# (د) نقشهٔ کلِ ۸ خانوادهٔ امتحانیِ g7 (سربرگ‌ها به pdf-page) — برای نقشهٔ راهِ رندهای بعدی
import fitz
import re
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه هفتم.pdf"
OUT = Path("/tmp/qa-r370")
OUT.mkdir(parents=True, exist_ok=True)
doc = fitz.open(PDF)

LAYER = Path("/home/z/my-project/booklet-extract/g7.txt").read_text(encoding="utf-8").split("\n")
PM = {}
for i, l in enumerate(LAYER):
    m = re.match(r"<<<PAGE (\d+)>>>", l)
    if m:
        PM[int(m.group(1))] = i

def page_lines(p: int) -> list[str]:
    start = PM[p]
    end = next((v for q, v in sorted(PM.items()) if q > p), len(LAYER))
    return LAYER[start:end]

# ————— نقشهٔ کلِ خانواده‌ها —————
print("=== FAMILY MAP (all 8 headers) ===")
for p in sorted(PM):
    joined = "\n".join(page_lines(p))
    m = re.search(r"نمونه سواالت امتحانی درس (\S+)\s*(پایه)?", joined)
    if m:
        print(f"pdf-p{p}: EXAM-HEADER درس={m.group(1)}")

# ————— مرزِ خانوادهٔ درس اول —————
print("\n=== FAMILY-1 BOUNDARY SCAN (p48-58) ===")
for p in range(48, 58):
    seg = page_lines(p)
    joined = "\n".join(seg)
    marks = []
    if re.search(r"نمونه سواالت امتحانی درس اول", joined):
        marks.append("EXAM1-HEADER")
    if re.search(r"نمونه سواالت امتحانی درس دوم", joined):
        marks.append("EXAM2-HEADER")
    if re.search(r"پاسخنامه|کلید سوا", joined):
        marks.append("KEY?")
    if re.search(r"درس دوم", joined):
        marks.append("L2?")
    print(f"pdf-p{p}: {marks if marks else '-'} ({len(seg)} lines)")

print("\n=== RENDER p49-57 ===")
for pno in range(49, 58):
    page = doc[pno - 1]
    pix = page.get_pixmap(dpi=150)
    f = OUT / f"p{pno}.png"
    pix.save(f)
    print(f"{f}  {pix.width}x{pix.height}")

print("\n=== LAYER p49-57 ===")
for p in range(49, 58):
    seg = page_lines(p)
    print(f"\n===== pdf-p{p} ({len(seg)} lines) =====")
    for j, s in enumerate(seg):
        print(f"{j:03d}| {s}")
