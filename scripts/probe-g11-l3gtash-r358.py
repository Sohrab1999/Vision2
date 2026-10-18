# -*- coding: utf-8 -*-
# r358 — پروبِ «آزمون تشریحی گرامر درس سوم» یازدهم (~ص۱۰۰-۱۰۲؟) + لوکیتِ پاسخنامهٔ چاپی
import fitz, re

PDF = "/home/z/my-project/upload/جزوه جامع یازدهم .pdf"
doc = fitz.open(PDF)
print(f"pages={doc.page_count}")

print("===== HEADERS sz>=15 / colored in pp94-125 =====")
for pno in range(93, 125):
    d = doc[pno].get_text("dict")
    for blk in d.get("blocks", []):
        for ln in blk.get("lines", []):
            for sp in ln.get("spans", []):
                sz = sp.get("size", 0)
                col = sp.get("color", 0)
                txt = sp.get("text", "").strip()
                if len(txt) >= 6 and (sz >= 15.5 or (col in (0xC00000, 0x0000FF, 0x0000CC) and sz >= 13.5)):
                    print(f"p{pno+1:3d} sz={sz:.0f} c#{col:06x} «{txt[:70]}»")

print("\n===== TEXT SNIPPETS pp99-106 (first 300 chars, header-stripped) =====")
for pno in range(98, 106):
    raw = doc[pno].get_text("text")
    lines = raw.split("\n")
    for i, ln in enumerate(lines):
        if re.search(r"هم[ـ]*کاران", ln):
            raw = "\n".join(lines[i + 1:])
            break
    print(f"--- p{pno+1} ch={len(raw)} ---")
    print(raw[:300].strip())
    print()
