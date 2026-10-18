# -*- coding: utf-8 -*-
# r354 — پروبِ عمیقِ جزوهٔ نهم (حسن لطفی بوکان): نقشهٔ سربرگ‌ها + نواحیِ تستی + کلیدها
import fitz, re

PDF = "/home/z/my-project/upload/جزوه زبان نهم حسن لطفی بوکان.pdf"
doc = fitz.open(PDF)
n = len(doc)
print(f"pages: {n}")

# ۱) سربرگ‌های درشت/سرخ — همهٔ سند
print("\n===== HEADERS (sz>=15 or red>=12) ALL =====")
for pno in range(n):
    d = doc[pno].get_text("dict")
    seen = []
    for blk in d.get("blocks", []):
        for ln in blk.get("lines", []):
            for sp in ln.get("spans", []):
                sz = sp.get("size", 0)
                col = sp.get("color", 0)
                txt = sp.get("text", "").strip()
                if len(txt) >= 5 and (sz >= 15.5 or (col == 0xc00000 and sz >= 12.5)):
                    if all(txt[:40] != s for s in seen):
                        seen.append(txt[:40])
                        print(f"p{pno+1:3d} sz={sz:.0f} c#{col:06x} «{txt[:70]}»")

# ۲) الگوی MCQ: سؤال + چهار گزینه — چند سؤالِ واقعی در هر صفحه
print("\n===== MCQ DENSITY MAP =====")
for pno in range(n):
    t = doc[pno].get_text("text")
    q = len(re.findall(r'(?m)^\s*(\d{1,2})[.)]\s', t))
    a = len(re.findall(r'(?m)^\s*1[.)]\s', t))
    opts = len(re.findall(r'(?m)^\s*[1-4][.)]\s', t))  # گزینه‌های ۱-۴ (فرمت ایرانی)
    en_opts = len(re.findall(r'(?m)^\s*[a-d][.)]\s', t))
    keyline = len(re.findall(r'(?m)^\s*\d{1,2}\s*[-–.]\s*[abcd]\b', t))
    if q >= 3 or en_opts >= 8 or opts >= 8 or keyline >= 3:
        tr = t.count("ترجمه")
        print(f"p{pno+1:3d} q={q:3d} opts_ir={opts:3d} opts_en={en_opts:3d} keylines={keyline} tr={tr} ch={len(t)}")
