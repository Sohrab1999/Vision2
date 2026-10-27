# -*- coding: utf-8 -*-
# r353 — داوریِ رندرِ ۱۲۰۰dpi برای بخشِ ۳ «۳۶۰ تست واژگان» (Q241-360):
#  * Q241 (نخستین سؤالِ بخش ۳، آغازِ ص۱۸۹) — تأییدِ فرمتِ پرانتزدار و تک‌ران
#  * Q300 (میانه — گزینه‌های هم‌خط) و Q359/Q360 (گزینه‌های عمودیِ انتهای آزمون)
#  * جعبهٔ «Note» خالیِ بعد از Q360 (پاصفحهٔ ص۱۹۴) — الگوی r334/r338
# این محدوده صفر سؤالِ چندران دارد (اسکنِ scan-quirks) — رندر برای مستندسازیِ تک‌ران‌بودن است.
import fitz, re

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

def find_q_page(qnum):
    for pno in range(177, 194):
        page = doc[pno]
        hits = page.search_for(f"{qnum}.")
        if hits:
            return pno, hits[0]
    return None, None

targets = [241, 300, 359, 360]
for qn in targets:
    pno, rect = find_q_page(qn)
    print(f"Q{qn}: page {pno+1 if pno is not None else '?'} rect={rect}")
    if pno is None:
        continue
    page = doc[pno]
    nxt = page.search_for(f"{qn+1}.")
    y1 = (nxt[0].y0 - 4) if nxt else rect.y1 + 150
    clip = fitz.Rect(0, max(0, rect.y0 - 6), page.rect.width, min(page.rect.height, y1))
    pix = page.get_pixmap(dpi=1200, clip=clip)
    out = f"/tmp/render-q{qn}-r353.png"
    pix.save(out)
    print(f"   saved {out} ({pix.width}x{pix.height})")

# پاصفحهٔ ص۱۹۴: جعبهٔ Note + خطوطِ خط‌چینِ پایانی
p194 = doc[193]
i360 = p194.search_for("360.")
if i360:
    clip = fitz.Rect(0, i360[0].y1 - 2, p194.rect.width, p194.rect.height)
    pix = p194.get_pixmap(dpi=1200, clip=clip)
    pix.save("/tmp/render-p194-note-r353.png")
    print(f"   saved /tmp/render-p194-note-r353.png ({pix.width}x{pix.height})")

# سربرگِ ص۱۸۹ — آغازِ محدوده (تأییدِ نبودِ سربرگِ جدید برای بخش ۳)
t189 = doc[188].get_text("text")
print("page189 head:", re.sub(r'\s+', ' ', t189[:300]))
