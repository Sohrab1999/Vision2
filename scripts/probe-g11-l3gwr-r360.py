# -*- coding: utf-8 -*-
# r360 — پروبِ «تست های گرامر و نگارش درس3 - پایه11» (ص۱۰۳-۱۰۸؟، کلیدِ چاپیِ ~ص۱۹۸-۱۹۹)
import fitz, re

PDF = "/home/z/my-project/upload/جزوه جامع یازدهم .pdf"
doc = fitz.open(PDF)
print(f"pages={doc.page_count}")

print("===== HEADERS sz>=15 / colored in pp102-114 =====")
for pno in range(101, 114):
    d = doc[pno].get_text("dict")
    for blk in d.get("blocks", []):
        for ln in blk.get("lines", []):
            for sp in ln.get("spans", []):
                sz = sp.get("size", 0)
                col = sp.get("color", 0)
                txt = sp.get("text", "").strip()
                if len(txt) >= 6 and (sz >= 15.5 or (col in (0xC00000, 0x0000FF, 0x0000CC) and sz >= 13.5)):
                    print(f"p{pno+1:3d} sz={sz:.0f} c#{col:06x} «{txt[:70]}»")

print("\n===== TEXT SNIPPETS pp103-108 (first 400 chars, header-stripped) =====")
for pno in range(102, 108):
    raw = doc[pno].get_text("text")
    lines = raw.split("\n")
    for i, ln in enumerate(lines):
        if re.search(r"هم[ـ]*کاران", ln):
            raw = "\n".join(lines[i + 1:])
            break
    print(f"--- p{pno+1} ch={len(raw)} ---")
    print(raw[:400].strip())
    print()

print("\n===== FULL TEXT p103 (to see section structure) =====")
raw = doc[102].get_text("text")
print(raw[:3500])

print("\n===== KEY-AREA pp197-200 snippets (first 300 chars each) =====")
for pno in range(196, 200):
    raw = doc[pno].get_text("text")
    print(f"--- p{pno+1} ch={len(raw)} ---")
    print(raw[:300].strip())
    print()
