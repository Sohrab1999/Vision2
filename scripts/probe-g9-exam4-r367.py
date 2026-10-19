# -*- coding: utf-8 -*-
# r367 — پروبِ «سؤالات امتحانی درس چهارم» نهم (pdf-p73+):
# (الف) رندر ۱۵۰dpi برای داوریِ چیدمانِ چاپی
# (ب) لایهٔ متنیِ بازه تا شروعِ محتوای درس پنجم (تمرینِ مکالمهٔ پنجم = pdf-p83) — مرزِ دقیقِ خانواده
# (ج) لنگرهای واژگان/عبارت‌های درس چهارم (خدمات: Information/ATM/Charity/Donate...) — الگوی r366
import fitz
import re
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه زبان نهم حسن لطفی بوکان.pdf"
OUT = Path("/tmp/qa-r367")
OUT.mkdir(parents=True, exist_ok=True)
doc = fitz.open(PDF)

LAYER = Path("/home/z/my-project/booklet-extract/g9.txt").read_text(encoding="utf-8").split("\n")
PM = {}
for i, l in enumerate(LAYER):
    m = re.match(r"<<<PAGE (\d+)>>>", l)
    if m:
        PM[int(m.group(1))] = i

def page_lines(p: int) -> list[str]:
    start = PM[p]
    end = next((v for q, v in sorted(PM.items()) if q > p), len(LAYER))
    return LAYER[start:end]

# ————— نخست: مرزِ خانواده — سربرگِ امتحانیِ درس چهارم کجاست و خانواده تا کجا؟ —————
for p in range(71, 84):
    seg = page_lines(p)
    joined = "\n".join(seg)
    marks = []
    if re.search(r"سوا?الت امتحانی", joined):
        hdr = [s.strip() for s in seg if "امتحانی" in s]
        marks.append("EXAM-HEADER: " + (hdr[0][:60] if hdr else "?"))
    if re.search(r"امتحانی درس پنجم", joined):
        marks.append("NEXT-FAMILY(5)")
    print(f"pdf-p{p}: {marks if marks else '-'}")

for pno in [73, 74, 75, 76, 77]:
    page = doc[pno - 1]
    pix = page.get_pixmap(dpi=150)
    f = OUT / f"p{pno}.png"
    pix.save(f)
    print(f"{f}  {pix.width}x{pix.height}")

# ————— لایهٔ متنیِ کاملِ بازه —————
for p in [73, 74, 75, 76, 77]:
    seg = page_lines(p)
    print(f"\n===== pdf-p{p} ({len(seg)} lines) =====")
    for j, s in enumerate(seg):
        t = s.strip()
        if t:
            print(f"{j:3d} {t[:110]!r}")
