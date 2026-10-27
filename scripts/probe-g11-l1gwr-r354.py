# -*- coding: utf-8 -*-
# r354 — پروبِ خانوادهٔ «تست گرامر و نگارش درس اول» یازدهم: ص۳۶-۳۹ + کلیدِ ص۱۷۹-۱۸۱
import fitz, re

PDF = "/home/z/my-project/upload/جزوه جامع یازدهم .pdf"
doc = fitz.open(PDF)

# ۱) متنِ کاملِ ص۳۶-۳۹
for pno in range(35, 39):
    t = doc[pno].get_text("text")
    qs = [int(m.group(1)) for m in re.finditer(r'(?m)^\s*(\d{1,2})[.)]\s', t)]
    tr = t.count("ترجمه")
    print(f"########## PAGE {pno+1} ch={len(t)} 'ترجمه'×{tr} qstarts={qs[:40]} ##########")
    print(t[:2400])
    print()

# ۲) ناحیهٔ کلید: سربرگ‌های ص۱۷۸-۱۸۲
print("===== KEY REGION HEADERS p178-182 =====")
for pno in range(177, 182):
    d = doc[pno].get_text("dict")
    for blk in d.get("blocks", []):
        for ln in blk.get("lines", []):
            for sp in ln.get("spans", []):
                sz = sp.get("size", 0)
                col = sp.get("color", 0)
                txt = sp.get("text", "").strip()
                if len(txt) >= 5 and (sz >= 14 or col in (0xc00000, 0x0000ff)):
                    print(f"p{pno+1:3d} sz={sz:.0f} c#{col:06x} «{txt[:75]}»")
