# -*- coding: utf-8 -*-
# r354 — فاز ۲ سروی: سربرگ‌های فشردهٔ صفحات ۲۰۵-۳۰۲ + تشخیصِ ساختارِ نواحیِ سؤال‌دار
import fitz, re

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

print("===== COMPACT HEADERS (sz>=15 or red) p205-302 =====")
for pno in range(204, min(302, len(doc))):
    d = doc[pno].get_text("dict")
    seen = set()
    for blk in d.get("blocks", []):
        for ln in blk.get("lines", []):
            for sp in ln.get("spans", []):
                sz = sp.get("size", 0)
                col = sp.get("color", 0)
                txt = sp.get("text", "").strip()
                if len(txt) < 5:
                    continue
                if sz >= 15.5 or (col == 0xc00000 and sz >= 12):
                    key = txt[:60]
                    if key not in seen:
                        seen.add(key)
                        print(f"p{pno+1:3d} sz={sz:.0f} col=#{col:06x} «{txt[:80]}»")
