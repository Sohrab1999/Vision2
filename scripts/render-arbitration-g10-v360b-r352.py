# -*- coding: utf-8 -*-
# r352 — داوریِ رندرِ ۱۲۰۰dpi: (۱) گزینهٔ چهارمِ Q174 («b) suitably» لایه — b چاپی یا d؟) +
# (۲) پنج سؤالِ دورانِ چندگانه Q143/Q146/Q152/Q158/Q213 (ادغامِ یک‌خط یا دو جای‌خالیِ واقعی؟)
import fitz, re

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# پیدا کردن صفحه و مستطیلِ هر سؤال
def find_q_page(qnum):
    for pno in range(177, 194):
        page = doc[pno]
        hits = page.search_for(f"{qnum}.")
        if hits:
            return pno, hits[0]
    return None, None

targets = [174, 143, 146, 152, 158, 213]
for qn in targets:
    pno, rect = find_q_page(qn)
    print(f"Q{qn}: page {pno+1 if pno is not None else '?'} rect={rect}")
    if pno is None:
        continue
    page = doc[pno]
    # برشِ عمودی: از سؤال تا سؤالِ بعد (یا ۳۰۰pt)
    nxt = page.search_for(f"{qn+1}.")
    y1 = (nxt[0].y0 - 4) if nxt else rect.y1 + 240
    clip = fitz.Rect(0, max(0, rect.y0 - 6), page.rect.width, min(page.rect.height, y1))
    pix = page.get_pixmap(dpi=1200, clip=clip)
    out = f"/tmp/render-q{qn}-r352.png"
    pix.save(out)
    print(f"   saved {out} ({pix.width}x{pix.height})")
