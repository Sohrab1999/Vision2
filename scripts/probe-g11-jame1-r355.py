# -*- coding: utf-8 -*-
# r355 — پروبِ «آزمون جامع تشریحی درس اول» یازدهم: ص۴۰-۴۳ + کلیدِ احتمالی ص۱۷۸-۱۸۶
import fitz, re

PDF = "/home/z/my-project/upload/جزوه جامع یازدهم .pdf"
doc = fitz.open(PDF)

# پالایشِ سربرگِ تکراری — درسِ r354: regex تیره‌محورِ «هم[ـ]*کاران»
HEADER_RE = re.compile(r'\d{2,3}\s*\n\s*\n?\s*"جزوه[\s\S]*?هم[ـ]*کاران"\s*\n')

def show(pno, lim=3200):
    t = doc[pno].get_text("text")
    t2 = HEADER_RE.sub("", t)
    print(f"########## PAGE {pno+1} (raw={len(t)} stripped={len(t2)}) ##########")
    print(t2.strip()[:lim])
    print()

for pno in range(39, 43):
    show(pno)

print("===== KEY REGION: headers p178-190 (sz>=13.5, len>=6) =====")
for pno in range(177, 190):
    t = doc[pno].get_text("text")
    d = doc[pno].get_text("dict")
    heads = []
    for blk in d.get("blocks", []):
        for ln in blk.get("lines", []):
            for sp in ln.get("spans", []):
                sz = sp.get("size", 0)
                txt = sp.get("text", "").strip()
                if len(txt) >= 6 and sz >= 13.5:
                    heads.append(f"sz{sz:.0f}«{txt[:70]}»")
    if heads:
        print(f"p{pno+1:3d}: {' | '.join(heads[:5])}")

print("\n===== KEY REGION: pages containing جامع|تشریحی|کلید in p176-204 =====")
for pno in range(175, 204):
    t = doc[pno].get_text("text")
    for m in re.finditer(r'(جامع|کلید[^\n]{0,40})', t):
        s = max(0, m.start()-30)
        frag = t[s:m.end()+40].replace("\n", "⏎")
        print(f"p{pno+1:3d}: …{frag[:110]}…")
        break
