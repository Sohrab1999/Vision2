# -*- coding: utf-8 -*-
# r359 — پروبِ «آزمون جامع تشریحی درس سوم» یازدهم (ص۱۰۹ به بعد؟) + لوکیتِ پاسخنامهٔ چاپی (~ص۲۰۰)
import fitz, re

PDF = "/home/z/my-project/upload/جزوه جامع یازدهم .pdf"
doc = fitz.open(PDF)
print(f"pages={doc.page_count}")

print("===== HEADERS sz>=15 / colored in pp106-135 =====")
for pno in range(105, 135):
    d = doc[pno].get_text("dict")
    for blk in d.get("blocks", []):
        for ln in blk.get("lines", []):
            for sp in ln.get("spans", []):
                sz = sp.get("size", 0)
                col = sp.get("color", 0)
                txt = sp.get("text", "").strip()
                if len(txt) >= 6 and (sz >= 15.5 or (col in (0xC00000, 0x0000FF, 0x0000CC) and sz >= 13.5)):
                    print(f"p{pno+1:3d} sz={sz:.0f} c#{col:06x} «{txt[:70]}»")

print("\n===== TEXT SNIPPETS pp108-118 (first 260 chars, header-stripped) =====")
for pno in range(107, 118):
    raw = doc[pno].get_text("text")
    lines = raw.split("\n")
    for i, ln in enumerate(lines):
        if re.search(r"هم[ـ]*کاران", ln):
            raw = "\n".join(lines[i + 1:])
            break
    print(f"--- p{pno+1} ch={len(raw)} ---")
    print(raw[:260].strip())
    print()

print("\n===== KEY-AREA pp197-206 snippets (first 200 chars) =====")
for pno in range(196, 206):
    raw = doc[pno].get_text("text")
    print(f"--- p{pno+1} ch={len(raw)} ---")
    print(raw[:200].strip())
    print()
