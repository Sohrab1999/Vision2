# -*- coding: utf-8 -*-
# r354 — پروبِ کاملِ «آزمون تشریحی گرامر درس اول» یازدهم: ص۲۹-۳۳ + کلیدِ احتمالی در ناحیهٔ ص۱۷۶-۲۰۴
import fitz, re

PDF = "/home/z/my-project/upload/جزوه جامع یازدهم .pdf"
doc = fitz.open(PDF)

for pno in range(28, 33):
    t = doc[pno].get_text("text")
    t2 = re.sub(r'\d{2,3}\s*\n\s*\n?\s*"جزوه[\s\S]*?همـــکاران"\s*\n', "", t)
    print(f"########## PAGE {pno+1} (ch={len(t)}) ##########")
    print(t2.strip()[:2600])
    print()

print("===== KEY REGION: headers + «گرامر» mentions p176-204 =====")
for pno in range(175, 204):
    t = doc[pno].get_text("text")
    if re.search(r'گرامر|Gramm', t):
        d = doc[pno].get_text("dict")
        heads = []
        for blk in d.get("blocks", []):
            for ln in blk.get("lines", []):
                for sp in ln.get("spans", []):
                    sz = sp.get("size", 0)
                    txt = sp.get("text", "").strip()
                    if len(txt) >= 6 and sz >= 13.5:
                        heads.append(f"sz{sz:.0f}«{txt[:60]}»")
        print(f"p{pno+1:3d}: {' | '.join(heads[:6])}")
