#!/usr/bin/env python3
# r384 probe: the «خرداد ۱۴۰۰» sitting — انسانی variant (pdf-p315-319, key p320-321)
# paperMap: p315 = 18/03/1400, رشته: ادبیات و علوم انسانی-علوم و معارف اسلامی
#           p308 = 19/03/1400 ریاضی/تجربی variant (next round)
# Lessons: presentation-forms typography; scrambled key blocks need 300dpi render.
import fitz, re, os

PDF = "upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
OUT = "/tmp/qa-r384"
os.makedirs(OUT, exist_ok=True)
doc = fitz.open(PDF)

# 1) dump layer p315-321
for pno in range(315, 322):
    txt = doc[pno - 1].get_text("text")
    with open(f"{OUT}/layer-p{pno}.txt", "w", encoding="utf-8") as f:
        f.write(txt)
    nonfooter = [l.strip() for l in txt.split("\n") if l.strip()]
    print(f"p{pno}: {len(txt)} chars, {len(nonfooter)} lines")

# 2) render 150dpi p315-321
for pno in range(315, 322):
    doc[pno - 1].get_pixmap(dpi=150).save(f"{OUT}/p{pno}.png")
print("rendered 150dpi p315-321")

# 3) question markers on exam pages — dot-style expected (like r382/r383)
for pno in range(315, 320):
    txt = open(f"{OUT}/layer-p{pno}.txt", encoding="utf-8").read()
    dot = re.findall(r"^\s*(\d+)\.\s", txt, re.M)
    par = re.findall(r"^\s*(\d+)\)\s", txt, re.M)
    print(f"p{pno} markers: dot={dot[:26]} paren={par[:26]}")
doc.close()
