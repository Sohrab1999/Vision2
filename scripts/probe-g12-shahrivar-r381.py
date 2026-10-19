#!/usr/bin/env python3
# r381 probe: g12 final-exam paper #2 (Shahrivar 1401) — pdf-p343-347 exam + p348-349 printed key
# Pattern inherited from probe-g12-nahaie-r380.py
import fitz, re, os

PDF = "upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"

OUT = "/tmp/qa-r381"
os.makedirs(OUT, exist_ok=True)
doc = fitz.open(PDF)
print("PDF:", PDF, "pages:", len(doc))

# 1) dump layer text for pages 341-350 (1-based -> index -1)
for pno in range(341, min(351, doc.page_count + 1)):
    page = doc[pno - 1]
    txt = page.get_text("text")
    with open(f"{OUT}/layer-p{pno}.txt", "w", encoding="utf-8") as f:
        f.write(txt)
    nonfooter = [l.strip() for l in txt.split("\n") if l.strip()]
    print(f"p{pno}: {len(txt)} chars, {len(nonfooter)} lines")

# 2) render 150dpi for visual arbitration
for pno in range(343, 350):
    page = doc[pno - 1]
    pix = page.get_pixmap(dpi=150)
    pix.save(f"{OUT}/p{pno}.png")
print("rendered 150dpi p343-349 to", OUT)

# 3) quick structural scan of exam pages: row markers
for pno in range(343, 348):
    txt = open(f"{OUT}/layer-p{pno}.txt", encoding="utf-8").read()
    rows = re.findall(r"^\s*(\d+)\)\s", txt, re.M)
    print(f"p{pno} question-markers:", rows[:30])
