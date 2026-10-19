#!/usr/bin/env python3
# r383 probe: g12 final-exam paper #4 from paperMap — the «شهریور ۱۴۰۰» sitting
# paperMap says: p322-328 = شهریور ۱۴۰۰ (کلید ص۳۲۷-۳۲۸); p329 = start of دی ۱۴۰۰ (r382)
# Lessons applied: presentation-forms typography possible; header hit-count + line-to-page mapping
import fitz, re, os

PDF = "upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
OUT = "/tmp/qa-r383"
os.makedirs(OUT, exist_ok=True)
doc = fitz.open(PDF)
print("PDF pages:", doc.page_count)

# 1) dump layer text p318-330 (1-based) to find exact boundaries
for pno in range(318, 331):
    page = doc[pno - 1]
    txt = page.get_text("text")
    with open(f"{OUT}/layer-p{pno}.txt", "w", encoding="utf-8") as f:
        f.write(txt)
    nonfooter = [l.strip() for l in txt.split("\n") if l.strip()]
    print(f"p{pno}: {len(txt)} chars, {len(nonfooter)} lines")

# 2) render 150dpi p321-329
for pno in range(321, 330):
    page = doc[pno - 1]
    pix = page.get_pixmap(dpi=150)
    pix.save(f"{OUT}/p{pno}.png")
print("rendered 150dpi p321-329 to", OUT)

# 3) sitting/date/kind detection per page (presentation-forms aware)
PF_HDR = ["ﺳﺆاﻻت  اﻣﺘﺤﺎن", "ﺳﺆﺎﻻت", "سؤالات امتحان", "سواالات امتحانی"]
PF_KEY = ["راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ", "راهنمای تصحیح", "راهنماي تصحيح"]
for pno in range(318, 331):
    txt = open(f"{OUT}/layer-p{pno}.txt", encoding="utf-8").read()
    joined = re.sub(r"\s{2,}", " ", " ".join(l.strip() for l in txt.split("\n") if l.strip()))
    date = re.search(r"تاريخ امتحان:\s*([\d/\s]+)", joined)
    nobt = re.search(r"نوبت\s*(خرداد|شهریور|دي|دی)", joined)
    kind = "?"
    if any(k in joined[:600] for k in PF_KEY):
        kind = "KEY"
    elif any(k in joined[:600] for k in PF_HDR):
        kind = "EXAM"
    print(f"p{pno}: {kind} | date={date.group(1).strip() if date else '?'} | nobt={nobt.group(1) if nobt else '?'}")

# 4) question markers per page — both '1.' and '1)' styles + digit-run fallback
for pno in range(322, 329):
    txt = open(f"{OUT}/layer-p{pno}.txt", encoding="utf-8").read()
    dot = re.findall(r"^\s*(\d+)\)\s", txt, re.M)
    par = re.findall(r"^\s*(\d+)\.\s", txt, re.M)
    print(f"p{pno} markers: paren={dot[:26]} dot={par[:26]}")
doc.close()
