# -*- coding: utf-8 -*-
# r368 — پروبِ «سؤالات امتحانی درس پنجم» نهم (pdf-p85+):
# (الف) رندر ۱۵۰dpi برای داوریِ چیدمانِ چاپی
# (ب) لایهٔ متنیِ بازه تا سربرگِ امتحانیِ درس ششم (تمرینِ مکالمهٔ ششم = pdf-p96) — مرزِ دقیقِ خانواده
# (ج) لنگرهای واژگان/عبارت‌های درس پنجم (رسانه: media/program/channel/advertise...) — الگوی r367
import fitz
import re
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه زبان نهم حسن لطفی بوکان.pdf"
OUT = Path("/tmp/qa-r368")
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

# ————— نخست: مرزِ خانواده — سربرگِ امتحانیِ درس پنجم کجاست و خانواده تا کجا؟ —————
for p in range(84, 97):
    seg = page_lines(p)
    joined = "\n".join(seg)
    marks = []
    if re.search(r"سوا?الت امتحانی درس پنجم", joined):
        marks.append("EXAM5-HEADER")
    if re.search(r"سوا?الت امتحانی درس ششم", joined):
        marks.append("NEXT-FAMILY(6)")
    if re.search(r"واژ.?گان|واژه‌?های", joined) and p > 92:
        marks.append("L6-VOCAB?")
    print(f"pdf-p{p}: {marks if marks else '-'}")

for pno in range(85, 96):
    page = doc[pno - 1]
    pix = page.get_pixmap(dpi=150)
    f = OUT / f"p{pno}.png"
    pix.save(f)
    print(f"{f}  {pix.width}x{pix.height}")

# ————— لایهٔ متنیِ کاملِ بازه —————
for p in range(85, 96):
    seg = page_lines(p)
    print(f"\n===== pdf-p{p} ({len(seg)} lines) =====")
    for j, s in enumerate(seg):
        print(f"{j:03d}| {s}")
