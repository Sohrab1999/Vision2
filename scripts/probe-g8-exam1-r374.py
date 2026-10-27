# -*- coding: utf-8 -*-
# r374 — پروبِ «نمونه سؤالات امتحانی درس اول» هشتم (pdf-p18):
# (الف) رندر ۱۵۰dpi ص۱۸؛ (ب) زوم ۳۰۰dpi برای س۵ (جدولِ ترجمه — آیا ستون/بانکِ انگلیسی دارد؟)
# و س۱/س۴ (تصاویر)؛ (ج) جست‌وجوی لنگرِ س۵ در لایهٔ درسِ اول (continent/year/Nice to see you)
import fitz, re
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه هشتم.pdf"
OUT = Path("/tmp/qa-r374"); OUT.mkdir(parents=True, exist_ok=True)
doc = fitz.open(PDF)
LAYER = Path("/home/z/my-project/booklet-extract/g8.txt").read_text(encoding="utf-8").split("\n")
PM = {}
for i, l in enumerate(LAYER):
    m = re.match(r"<<<PAGE (\d+)>>>", l)
    if m: PM[int(m.group(1))] = i

def page_lines(p):
    start = PM[p]
    end = next((v for q, v in sorted(PM.items()) if q > p), len(LAYER))
    return LAYER[start:end]

print("=== RENDER p18 (150dpi) ===")
page = doc[17]
pix = page.get_pixmap(dpi=150)
pix.save(OUT / "p18.png"); print(f"{OUT/'p18.png'}  {pix.width}x{pix.height}")

def zoom(pno, x0, y0, x1, y1, name):
    page = doc[pno - 1]
    r = page.rect
    clip = fitz.Rect(r.x0 + r.width * x0, r.y0 + r.height * y0, r.x0 + r.width * x1, r.y0 + r.height * y1)
    pix = page.get_pixmap(dpi=300, clip=clip)
    pix.save(OUT / name); print(f"{OUT/name}  {pix.width}x{pix.height}")

print("=== ZOOMS 300dpi ===")
zoom(18, 0.0, 0.02, 1.0, 0.25, "p18-top.png")     # س۱ (تصویرِ from؟)
zoom(18, 0.0, 0.55, 1.0, 1.0, "p18-bottom.png")   # س۵ (جدولِ ترجمه)
zoom(18, 0.0, 0.55, 1.0, 0.85, "p18-s4s5.png")    # س۴ + بالای س۵

print("=== لنگرِ س۵ در لایهٔ درسِ اول (ص۱-۱۷) ===")
head = "\n".join(LAYER[:PM[18]])
for pat in ["continent", "beautiful country", "Nice to see", "Glad to see", "Pleased to", "year"]:
    hits = [m.start() for m in re.finditer(pat, head, re.I)]
    print(f"{pat!r}: {len(hits)} hit(s) before p18")
for i, l in enumerate(LAYER):
    if i > PM[18]: break
    if re.search(r"continent|Nice to see|beautiful country", l, re.I):
        print(f"L{i:04d}| {l.strip()[:110]}")
