# -*- coding: utf-8 -*-
# r356 — پروبِ «آزمون تشریحی گرامر درس دوم» یازدهم (ص۶۳؟) + لوکیتِ پاسخنامهٔ چاپی
import fitz, re

PDF = "/home/z/my-project/upload/جزوه جامع یازدهم .pdf"
doc = fitz.open(PDF)
print(f"pages={doc.page_count}")

print("===== HEADERS sz>=15 / colored in pp60-80 =====")
for pno in range(59, 80):
    d = doc[pno].get_text("dict")
    for blk in d.get("blocks", []):
        for ln in blk.get("lines", []):
            for sp in ln.get("spans", []):
                sz = sp.get("size", 0)
                col = sp.get("color", 0)
                txt = sp.get("text", "").strip()
                if len(txt) >= 6 and (sz >= 15.5 or (col in (0xc00000, 0x0000ff, 0x0000cc) and sz >= 13.5)):
                    print(f"p{pno+1:3d} sz={sz:.0f} c#{col:06x} «{txt[:70]}»")

print("\n===== TEXT SNIPPETS pp60-68 (first 400 chars) =====")
for pno in range(59, 68):
    t = doc[pno].get_text("text")
    t2 = re.sub(r'\d{2,3}\s*\n\s*\n?\s*"جزوه[\s\S]*?همـــکاران"\s*\n', "", t)
    print(f"--- p{pno+1} ch={len(t)} ---")
    print(t2[:400].strip())
    print()
