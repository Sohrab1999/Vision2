# -*- coding: utf-8 -*-
# r365 — پروبِ «سؤالات امتحانی درس دوم» نهم (pdf-p47-50):
# (الف) رندر ۱۵۰dpi برای داوریِ چیدمانِ چاپی (ستون؟ کادرِ خالی؟ برچسب‌ها؟)
# (ب) لایهٔ متنیِ کاملِ بازه + داوریِ مرزِ پایان (سربرگِ درس سوم = pdf-p61 ولی واژگانِ درس سوم از pdf-p51 شروع می‌شود)
# (ج) یافتنِ واژگان/عبارت‌های خودِ درس دوم (لنگرِ کلیدِ استنتاجی — الگوی r364)
import fitz
import re
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه زبان نهم حسن لطفی بوکان.pdf"
OUT = Path("/tmp/qa-r365")
OUT.mkdir(parents=True, exist_ok=True)
doc = fitz.open(PDF)

for pno in [47, 48, 49, 50]:
    page = doc[pno - 1]
    pix = page.get_pixmap(dpi=150)
    f = OUT / f"p{pno}.png"
    pix.save(f)
    print(f"{f}  {pix.width}x{pix.height}")

# ————— لایهٔ متنی: مرزِ دقیقِ خانواده —————
lines = Path("/home/z/my-project/booklet-extract/g9.txt").read_text(encoding="utf-8").split("\n")
print("\n===== tail of lesson-2 family (3140-3196) =====")
for i in range(3140, 3196):
    s = lines[i].rstrip()
    if s.strip():
        print(f"{i:5d} {s[:100]!r}")

# ————— واژگانِ درس دوم کجاست؟ سربرگ‌های واژه‌نامه را بگرد —————
print("\n===== vocab headers pages 33-47 =====")
cur = None
for i, l in enumerate(lines):
    m = re.match(r"<<<PAGE (\d+)>>>", l)
    if m:
        cur = int(m.group(1))
        continue
    if cur and 33 <= cur <= 47:
        s = l.strip()
        if re.search(r"معنی|کلمه", s) and len(s) < 40:
            print(f"pdf-p{cur} line{i}: {s!r}")

# ————— عبارت‌های س۱۰ در واژگانِ درس دوم؟ —————
print("\n===== lesson-2 phrase anchors in layer (exchange/Book/land/pack/receptionist) =====")
for i, l in enumerate(lines):
    if re.search(r"exchange|receptionist|pack for|take off", l, re.I):
        print(f"line{i}: {l.strip()[:100]!r}")
