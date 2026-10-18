# -*- coding: utf-8 -*-
# r340 — زوم‌های داوری: سربرگ‌های ۶۰۰dpi + جدولِ S4 + جاهای چسبیده
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

def band(pno0, y0, y1, name, dpi=600):
    page = doc[pno0]
    r = page.rect
    clip = fitz.Rect(r.x0, max(0, y0), r.x1, min(r.y1, y1))
    pix = page.get_pixmap(matrix=fitz.Matrix(dpi / 72.0, dpi / 72.0), clip=clip)
    out = f"/tmp/{name}.png"
    pix.save(out)
    print(out, pix.width, "x", pix.height)

def find_y(pno0, needle):
    page = doc[pno0]
    for b in page.get_text("dict")["blocks"]:
        for ln in b.get("lines", []):
            txt = "".join(sp["text"] for sp in ln["spans"])
            if needle in txt.replace(" ", ""):
                y0 = min(sp["bbox"][1] for sp in ln["spans"])
                y1 = max(sp["bbox"][3] for sp in ln["spans"])
                return (y0 + y1) / 2
    return None

# سربرگ‌ها ۶۰۰dpi
band(130, 60, 200, "r340-p131-header-600")
band(276, 60, 200, "r340-p277-header-600")

# جدولِ S4 (ستون A/B) — y حدود 200-460 در رندر ۳۰۰dpi → مقیاسِ page-space
y = find_y(131, "1995")
if y:
    band(131, y - 40, y + 160, "r340-s4-table-600")

# S3-Q5 «No, I----.» چسبیده (p132 بالا)
y2 = find_y(131, "readingabook")
if y2:
    band(131, y2 - 30, y2 + 10, "r340-s3q5-joined-600")

# S6-Q9 «let ----in.» چسبیده (p132)
y3 = find_y(131, "let")
if y3:
    band(131, y3 - 25, y3 + 15, "r340-s6q9-joined-600")

# S1-Q7 کلید «weren't listening/ told» (p277)
y4 = find_y(276, "listening/told")
if y4:
    band(276, y4 - 22, y4 + 22, "r340-key-s1q7-600")
