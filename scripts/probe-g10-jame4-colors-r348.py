# -*- coding: utf-8 -*-
# r348 — رنگ‌کاویِ صفحهٔ آزمون + زیرخط‌کاویِ کلیدِ S10 (ص۲۹۴) با get_drawings
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# ---- ۱) اسپن‌های رنگیِ صفحهٔ آزمون ص۱۶۴-۱۶۶ ----
for pno in (163, 164, 165):
    page = doc[pno]
    print(f"##### EXAM SPAN COLORS PAGE {pno+1} (non-black text spans) #####")
    d = page.get_text("dict")
    for blk in d["blocks"]:
        if blk.get("type") != 0:
            continue
        for line in blk["lines"]:
            for span in line["spans"]:
                c = span["color"]
                t = span["text"].strip()
                if c != 0 and t:
                    print(f"  color=#{c:06x} y={span['bbox'][1]:.0f} text={t[:60]!r}")
    print()

# ---- ۲) زیرخط‌های نزدیکِ سطرهای S10 کلید ص۲۹۴ ----
page = doc[293]
words = page.get_text("words")
# مختصاتِ سطرهای «The newspaper ... magazine» و «New York ... Angeles»
targets = []
for w in words:
    if w[4] in ("newspaper", "magazine", "York", "Angeles"):
        targets.append(w)
print("##### TARGET WORDS p294 #####")
for w in targets:
    print(f"  word={w[4]!r} bbox=({w[0]:.1f},{w[1]:.1f},{w[2]:.1f},{w[3]:.1f})")

print("\n##### DRAWINGS near those lines (p294) #####")
for dr in page.get_drawings():
    r = dr["rect"]
    # فقط نقاشی‌های باریکِ افقی (زیرخطِ کاندید) در محدودهٔ y سطرهای هدف
    for w in targets:
        if r.y0 - 3 <= w[3] <= r.y1 + 3 and r.height < 4 and r.width > 10:
            print(f"  thin-draw rect=({r.x0:.1f},{r.y0:.1f},{r.x1:.1f},{r.y1:.1f}) "
                  f"stroke={dr.get('color')} fill={dr.get('fill')} w={dr.get('width')}")
            break
