#!/usr/bin/env python3
# r389 300dpi zooms: (1) p268 س۱ row-1 options, (2) p269 row-6 «d) b & c», (3) p272 س۱۱ stems trailing conjunctions
import fitz, os

PDF = "upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
OUT = "/tmp/qa-r389"
os.makedirs(OUT, exist_ok=True)
doc = fitz.open(PDF)

# p268: bottom half (س۱ rows)
page = doc[267]
r = page.rect
clip = fitz.Rect(r.x0, r.y0 + r.height * 0.55, r.x1, r.y1)
page.get_pixmap(dpi=300, clip=clip).save(f"{OUT}/z-p268-s1.png")

# p269: middle band (س۵ bank + row 6 options)
page = doc[268]
clip = fitz.Rect(r.x0, r.y0 + r.height * 0.55, r.x1, r.y1)
page.get_pixmap(dpi=300, clip=clip).save(f"{OUT}/z-p269-s5.png")

# p272: س۱۱ stems region
page = doc[271]
clip = fitz.Rect(r.x0, r.y0 + r.height * 0.18, r.x1, r.y0 + r.height * 0.55)
page.get_pixmap(dpi=300, clip=clip).save(f"{OUT}/z-p272-s11.png")

print("zooms saved:", os.listdir(OUT))
doc.close()
