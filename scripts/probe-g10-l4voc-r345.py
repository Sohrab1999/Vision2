# -*- coding: utf-8 -*-
# r345 — داوریِ رندر «آزمون تشریحی واژگان درس چهارم» (ص۱۴۸-۱۵۰، کلید ص۲۸۷)
# سربرگ‌ها + زیرخطِ بخش ۲ + جای‌خالی‌های مشکوک + جعبهٔ Note + شمارشِ تیره‌ها
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
OUT = "/tmp/qa-r345"
import os
os.makedirs(OUT, exist_ok=True)

doc = fitz.open(PDF)

# ۱) شمارشِ تیره‌های لایه — همهٔ ران‌های dash در ص۱۴۸-۱۵۰
import re
for pno in (147, 148, 149):
    txt = doc[pno].get_text("text")
    runs = re.findall(r"-{2,}", txt)
    from collections import Counter
    c = Counter(len(r) for r in runs)
    print(f"PAGE {pno+1} dash runs: {dict(sorted(c.items()))} | total runs={len(runs)} total dashes={sum(len(r) for r in runs)}")

# ۲) سربرگ ص۱۴۸ + دستور سکشن ۱ + سربرگِ بخش ۲ — رندر ۶۰۰dpi
p148 = doc[147]
mat = fitz.Matrix(600/72, 600/72)
pix = p148.get_pixmap(matrix=mat, clip=fitz.Rect(40, 60, 560, 300))
pix.save(f"{OUT}/p148-header-600.png")
# بخش ۲ (زیرخط‌ها) — نیمهٔ پایین ص۱۴۸
pix = p148.get_pixmap(matrix=mat, clip=fitz.Rect(40, 430, 560, 700))
pix.save(f"{OUT}/p148-sec2-600.png")

# ۳) ص۱۴۹ — سکشن ۳ (تعریف‌ها) + آغاز سکشن ۴
p149 = doc[148]
pix = p149.get_pixmap(matrix=mat, clip=fitz.Rect(40, 60, 560, 380))
pix.save(f"{OUT}/p149-sec3-600.png")

# ۴) ص۱۵۰ — Q18 (دیالوگ A/B) + پاصفحه
p150 = doc[149]
pix = p150.get_pixmap(matrix=fitz.Matrix(900/72, 900/72), clip=fitz.Rect(40, 330, 560, 430))
pix.save(f"{OUT}/p150-q18-900.png")
pix = p150.get_pixmap(matrix=mat, clip=fitz.Rect(40, 640, 560, 760))
pix.save(f"{OUT}/p150-footer-600.png")

# ۵) کلید ص۲۸۷ — سربرگ + جعبهٔ Note
p287 = doc[286]
pix = p287.get_pixmap(matrix=mat, clip=fitz.Rect(40, 60, 560, 220))
pix.save(f"{OUT}/p287-header-600.png")
pix = p287.get_pixmap(matrix=mat, clip=fitz.Rect(40, 430, 560, 700))
pix.save(f"{OUT}/p287-note-600.png")

# ۶) برش‌های span-محور برای جای‌خالی‌های مشکوک بخش ۱ (Q3/Q5/Q9/Q11/Q14/Q16)
def spans_for(page, needle):
    d = page.get_text("dict")
    out = []
    for b in d["blocks"]:
        for l in b.get("lines", []):
            for s in l.get("spans", []):
                if needle in s["text"]:
                    out.append((s["text"], s["bbox"]))
    return out

for qn, needle in ((3, "English is the"), (5, "in my ear"), (9, "eating"), (11, "of travel"), (14, "helped poor"), (16, "of Mashhad")):
    hits = spans_for(p148, needle)
    for txt, bbox in hits[:2]:
        x0, y0, x1, y1 = bbox
        clip = fitz.Rect(max(0, x0-6), max(0, y0-3), min(p148.rect.x1, x1+6), min(p148.rect.y1, y1+3))
        pix = p148.get_pixmap(matrix=fitz.Matrix(3000/72, 3000/72), clip=clip)
        fn = f"{OUT}/p148-q{qn}-span-3000.png"
        pix.save(fn)
        print(f"Q{qn} span saved: {fn} | layer: {txt!r} | bbox={[round(v,1) for v in bbox]}")

# ۷) زیرخط‌های بخش ۲ — span-محور (Q2 و Q8 برای نقطه/پرانتز)
for qn, needle in ((1, "used a lot in"), (2, "visits a place"), (8, "between summer")):
    hits = spans_for(p148, needle)
    for txt, bbox in hits[:2]:
        x0, y0, x1, y1 = bbox
        clip = fitz.Rect(max(0, x0-6), max(0, y0-3), min(p148.rect.x1, x1+6), min(p148.rect.y1, y1+3))
        pix = p148.get_pixmap(matrix=fitz.Matrix(3000/72, 3000/72), clip=clip)
        fn = f"{OUT}/p148-s2q{qn}-span-3000.png"
        pix.save(fn)
        print(f"S2-Q{qn} span saved: {fn} | layer: {txt!r}")

# ۸) MCQ Q10 (زیرخطِ ۲۱تایی؟) و Q25 — span-محور
for qn, needle in ((10, "leaving our planet"), (25, "genetic element")):
    page = p149 if qn == 10 else p150
    hits = spans_for(page, needle)
    for txt, bbox in hits[:2]:
        x0, y0, x1, y1 = bbox
        clip = fitz.Rect(max(0, x0-6), max(0, y0-3), min(page.rect.x1, x1+6), min(page.rect.y1, y1+3))
        pix = page.get_pixmap(matrix=fitz.Matrix(3000/72, 3000/72), clip=clip)
        fn = f"{OUT}/p{page.number+1}-mcq{qn}-span-3000.png"
        pix.save(fn)
        print(f"MCQ-{qn} span saved: {fn} | layer: {txt!r}")

print("done — renders in", OUT)
