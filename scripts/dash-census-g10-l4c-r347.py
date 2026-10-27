# -*- coding: utf-8 -*-
# r347 — تیره‌شماری و فاصله‌شماریِ ساقه‌های ص۱۵۸/۱۶۱/۱۶۲ (سنجهٔ r346: الگوی سادهٔ -{2,})
import fitz, re

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

def census(pno, label):
    txt = doc[pno - 1].get_text("text")
    print(f"===== p{pno} {label} =====")
    for line in txt.split("\n"):
        s = line.strip()
        if not s:
            continue
        runs = re.findall(r"-{2,}", s)
        if runs:
            print(f"  [{','.join(str(len(r)) for r in runs)}] {s[:95]}")

census(161, "S1/S2/S3")
census(162, "S4/S5")
census(158, "drill")
census(163, "20 MCQ")

# فاصله‌شماریِ گفتگوها (A: ... B:)
print("\n===== dialogue gaps =====")
for pno in (161, 163):
    txt = doc[pno - 1].get_text("text")
    for m in re.finditer(r"A:(.*?)( {2,})B:", txt):
        print(f"  p{pno} gap={len(m.group(2))} | A:{m.group(1).strip()[:60]}")
