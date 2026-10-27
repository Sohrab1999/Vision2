# -*- coding: utf-8 -*-
# r354 — پروبِ نواحیِ مشکوکِ استخراج‌نشده در جزوهٔ یازدهم (۲۰۴ص): ص۲۹-۴۲ / ص۶۰-۸۰ / ص۹۸-۱۱۷
# مقایسه با بازه‌هایِ استخراج‌شده: r275(ص۱۹-۲۰/۵۷-۵۸/۹۱-۹۲) r276(?) r277(ص۳۴-۳۵/۶۹/۱۰۳-۱۰۴)
# r278(ص۲۱/۹۳) r308(ص۱۱۸-۱۳۵) r309(ص۵۹) r311(ص۱۶-۱۸) r312(ص۵۴-۵۶/۸۸-۹۰)
import fitz, re

PDF = "/home/z/my-project/upload/جزوه جامع یازدهم .pdf"
doc = fitz.open(PDF)

def show(pno, chars=700):
    t = doc[pno].get_text("text")
    qs = [int(m.group(1)) for m in re.finditer(r'(?m)^\s*(\d{1,2})[.)]\s', t)]
    print(f"--- p{pno+1} ch={len(t)} qstarts={qs[:30]} ---")
    print(t[:chars].replace("\n\n", "\n"))
    print()

# ۱) سربرگ‌های درشت در نواحی مشکوک
print("===== HEADERS in suspect regions =====")
for pno in list(range(27, 42)) + list(range(59, 80)) + list(range(97, 117)):
    d = doc[pno].get_text("dict")
    for blk in d.get("blocks", []):
        for ln in blk.get("lines", []):
            for sp in ln.get("spans", []):
                sz = sp.get("size", 0)
                col = sp.get("color", 0)
                txt = sp.get("text", "").strip()
                if len(txt) >= 6 and (sz >= 15.5 or (col in (0xc00000, 0x0000ff, 0x0000cc) and sz >= 13)):
                    print(f"p{pno+1:3d} sz={sz:.0f} c#{col:06x} «{txt[:70]}»")
