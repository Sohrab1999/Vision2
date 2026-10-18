# -*- coding: utf-8 -*-
# r361 — پروبِ «آزمون تشریحی پایان ترم دوم» یازدهم (ص۱۱۴-۱۱۶، کلیدِ چاپیِ ص۲۰۳)
# اهداف: (۱) راستی‌آزماییِ چیدمانِ گزینه‌های س۳۷/س۳۸ (تک‌ستونی d,c,b,a یا دوستونی؟)
#        (۲) ترتیبِ چاپِ سکشن۸ (۲۲-۲۵) و سکشن۹ (۲۶-۲۹) با مختصات
#        (۳) عرضِ ران‌های dash و بلنک‌های پاسخ
#        (۴) سربرگ/لوکاتورِ آزمون و کلید + ارقامِ فارسی/لاتین
import fitz, re

PDF = "/home/z/my-project/upload/جزوه جامع یازدهم .pdf"
doc = fitz.open(PDF)
print(f"pages={doc.page_count}")

print("===== p114-116 + p203: spans of MCQ options Q37/Q38 (letters) =====")
for pno in (113, 114, 115, 202):
    d = doc[pno].get_text("dict")
    for blk in d.get("blocks", []):
        for ln in blk.get("lines", []):
            for sp in ln.get("spans", []):
                txt = sp.get("text", "").strip()
                if re.fullmatch(r"[a-d][.)]?", txt) or re.search(r"millions|magazines|media|people|twitter posts|media companies", txt):
                    x0, y0 = sp["bbox"][0], sp["bbox"][1]
                    print(f"p{pno+1} y={y0:7.1f} x={x0:7.1f} sz={sp.get('size',0):.0f} c#{sp.get('color',0):06x} «{txt[:50]}»")

print("\n===== p114: header spans (sz>=14 or colored) =====")
d = doc[113].get_text("dict")
for blk in d.get("blocks", []):
    for ln in blk.get("lines", []):
        for sp in ln.get("spans", []):
            sz = sp.get("size", 0)
            col = sp.get("color", 0)
            txt = sp.get("text", "").strip()
            if txt and (sz >= 14 or col != 0):
                print(f"p114 sz={sz:.0f} c#{col:06x} «{txt[:70]}»")

print("\n===== p203: header spans (sz>=14 or colored) =====")
d = doc[202].get_text("dict")
for blk in d.get("blocks", []):
    for ln in blk.get("lines", []):
        for sp in ln.get("spans", []):
            sz = sp.get("size", 0)
            col = sp.get("color", 0)
            txt = sp.get("text", "").strip()
            if txt and (sz >= 14 or col != 0):
                print(f"p203 sz={sz:.0f} c#{col:06x} «{txt[:70]}»")

print("\n===== p114-115: section8/9 item order with coordinates =====")
for pno in (113, 114):
    d = doc[pno].get_text("dict")
    rows = []
    for blk in d.get("blocks", []):
        for ln in blk.get("lines", []):
            sp_txts = [sp.get("text", "").strip() for sp in ln.get("spans", [])]
            joined = " ".join(t for t in sp_txts if t)
            if re.search(r"danger|possible|like|rain|cheap|finish|quickly|find|begin|start|expensive|lose|slowly|≠", joined):
                rows.append((ln["bbox"][1], ln["bbox"][0], joined[:60]))
    for y, x, t in sorted(rows):
        print(f"p{pno+1} y={y:7.1f} x={x:7.1f} «{t}»")

print("\n===== p115: cloze parens 30-33 coordinates =====")
d = doc[114].get_text("dict")
for blk in d.get("blocks", []):
    for ln in blk.get("lines", []):
        sp_txts = [sp.get("text", "").strip() for sp in ln.get("spans", [])]
        joined = " ".join(t for t in sp_txts if t)
        if re.search(r"30\.|31\.|32\.|33\.|addiction|emotional|balanced|decreases", joined):
            print(f"p115 y={ln['bbox'][1]:7.1f} x={ln['bbox'][0]:7.1f} «{joined[:70]}»")

print("\n===== dash runs inventory p114-116 =====")
for pno in (113, 114, 115):
    raw = doc[pno].get_text("text")
    runs = re.findall(r"-{3,}", raw)
    lens = {}
    for r in runs:
        lens[len(r)] = lens.get(len(r), 0) + 1
    print(f"p{pno+1}: {dict(sorted(lens.items()))}")

print("\n===== p116: Q37-39 zone raw (after '37.') =====")
raw = doc[115].get_text("text")
i = raw.find("37.")
print(raw[i:i+420] if i >= 0 else "Q37 anchor NOT FOUND on p116")
