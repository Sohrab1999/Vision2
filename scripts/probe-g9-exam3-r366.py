# -*- coding: utf-8 -*-
# r366 — پروبِ «سؤالات امتحانی درس سوم» نهم (pdf-p61+):
# (الف) رندر ۱۵۰dpi برای داوریِ چیدمانِ چاپی
# (ب) لایهٔ متنیِ کاملِ بازه + داوریِ مرزِ پایان (تمرینِ درس چهارم ~pdf-p65؛ واژگان/محتوای درس چهارم از پیش)
# (ج) لنگرهای مکالمه/واژگانِ درس سوم (جشن‌ها و مراسم) برای کلیدِ استنتاجی — الگوی r365
import fitz
import re
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه زبان نهم حسن لطفی بوکان.pdf"
OUT = Path("/tmp/qa-r366")
OUT.mkdir(parents=True, exist_ok=True)
doc = fitz.open(PDF)

for pno in [61, 62, 63, 64, 65]:
    page = doc[pno - 1]
    pix = page.get_pixmap(dpi=150)
    f = OUT / f"p{pno}.png"
    pix.save(f)
    print(f"{f}  {pix.width}x{pix.height}")

# ————— لایهٔ متنی: کلِ بازهٔ pdf-p61-65 —————
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

for p in [61, 62, 63, 64, 65]:
    seg = page_lines(p)
    print(f"\n===== pdf-p{p} ({len(seg)} lines) =====")
    for j, s in enumerate(seg):
        t = s.strip()
        if t:
            print(f"{j:3d} {t[:110]!r}")
