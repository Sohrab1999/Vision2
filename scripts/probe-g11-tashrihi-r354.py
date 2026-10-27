# -*- coding: utf-8 -*-
# r354 — نقشهٔ کاملِ خانواده‌هایِ تشریحیِ استخراج‌نشدهٔ جزوهٔ یازدهم:
# ص۲۹-۳۳ (تشریحی گرامر د۱) / ص۴۰-۴۲ (جامع تشریحی د۱) + همتاهای د۲ و د۳
import fitz, re

PDF = "/home/z/my-project/upload/جزوه جامع یازدهم .pdf"
doc = fitz.open(PDF)

REGIONS = [(28, 33), (39, 43), (62, 66), (72, 79), (95, 103), (111, 118)]
print("===== HEADERS sz>=15 in L1/L2/L3 tails =====")
for a, b in REGIONS:
    for pno in range(a, b):
        d = doc[pno].get_text("dict")
        for blk in d.get("blocks", []):
            for ln in blk.get("lines", []):
                for sp in ln.get("spans", []):
                    sz = sp.get("size", 0)
                    col = sp.get("color", 0)
                    txt = sp.get("text", "").strip()
                    if len(txt) >= 6 and (sz >= 15.5 or (col in (0xc00000, 0x0000ff, 0x0000cc) and sz >= 13.5)):
                        print(f"p{pno+1:3d} sz={sz:.0f} c#{col:06x} «{txt[:70]}»")

print("\n===== TEXT SNIPPETS (first 350 chars per page) =====")
for a, b in REGIONS:
    for pno in range(a, b):
        t = doc[pno].get_text("text")
        t2 = re.sub(r'\d{2,3}\s*\n\s*\n?\s*"جزوه[\s\S]*?همـــکاران"\s*\n', "", t)
        print(f"--- p{pno+1} ch={len(t)} ---")
        print(t2[:350].strip()[:340])
        print()
