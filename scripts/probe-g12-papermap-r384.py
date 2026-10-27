#!/usr/bin/env python3
# r384 probe: map the years of the remaining g12 final-exam papers (pdf-p228-321)
# Known so far (paperMap from r380-r383):
#   p322-328 = شهریور ۱۴۰۰ (key p327-328)   [r383]
#   p329-335 = دی ۱۴۰۰     (key p334-335)   [r382]
#   p336-342 = دی ۱۴۰۱                      [r380]
#   p343-349 = شهریور ۱۴۰۱ (key p348-349)   [r381]
# Unknown: p228-321 — worklog says ~11 more sittings live there.
# Lesson applied: presentation-forms typography; header hit-count; line-to-page mapping.
import fitz, re, os

PDF = "upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
OUT = "/tmp/qa-r384"
os.makedirs(OUT, exist_ok=True)
doc = fitz.open(PDF)
print("PDF pages:", doc.page_count)

LO, HI = 224, 324  # slight margin beyond 228-321

# 1) dump layer for every page
for pno in range(LO, HI + 1):
    txt = doc[pno - 1].get_text("text")
    with open(f"{OUT}/layer-p{pno}.txt", "w", encoding="utf-8") as f:
        f.write(txt)

# 2) classify each page
PF_HDR = ["ﺳﺆاﻻت  اﻣﺘﺤﺎن", "ﺳﺆﺎﻻت", "سؤالات امتحان", "سواالات امتحانی", "ﺳﺆﺎﻻت  اﻣﺘﺤﺎن"]
PF_KEY = ["راﻫﻤﺎي ﺗﺼﺤﯿﺢ", "راهنمای تصحیح", "راهنماي تصحيح", "راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ"]
print("\n== page classification p224-324 ==")
for pno in range(LO, HI + 1):
    txt = open(f"{OUT}/layer-p{pno}.txt", encoding="utf-8").read()
    joined = re.sub(r"\s{2,}", " ", " ".join(l.strip() for l in txt.split("\n") if l.strip()))
    head = joined[:700]
    kind = "?"
    if any(k in head for k in PF_KEY):
        kind = "KEY"
    elif any(k in head for k in PF_HDR):
        kind = "EXAM"
    date = re.search(r"تاريخ امتحان[:：]\s*([\d/\s]+)", joined)
    nobt = re.search(r"نوبت\s*(خرداد|شهریور|دي|دی|دى)", joined)
    subject = re.search(r"(\w+ِ?)\s*[\(（]?\s*(؟|۳|٣)", head)
    first = joined[:80]
    print(f"p{pno}: {kind:4s} | date={date.group(1).strip() if date else '-':12s} | nobt={nobt.group(1) if nobt else '-':8s} | {first[:60]}")

doc.close()
