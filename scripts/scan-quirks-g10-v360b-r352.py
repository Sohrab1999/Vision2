# -*- coding: utf-8 -*-
# r352 — اسکنِ ران‌های خط‌چینِ چندگانه + نامزدهای چاپ‌غلط در Q121-240 (پیش از استخراج)
import fitz, re

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)
txt = ""
for pno in range(177, 194):
    txt += doc[pno].get_text("text") + "\n"
txt = re.sub(r'\d{3}\s*\n[\s\S]{0,20}?"جزوه[\s\S]*?هم.{0,12}کاران"\s*\n', "\n", txt)

pat = re.compile(
    r'(\d{1,3})\.\s*([\s\S]*?)\n\s*a[.)]\s*([\s\S]*?)\n?\s*b[.)]\s*([\s\S]*?)\n?\s*c[.)]\s*([\s\S]*?)\n?\s*d[.)]\s*([\s\S]*?)(?=\n\s*\d{1,3}\.\s|\Z)',
)
qs = {}
for m in pat.finditer(txt):
    num = int(m.group(1))
    if num not in qs:
        qs[num] = re.sub(r"\s+", " ", m.group(2)).strip()

print("=== multi-run questions (121-240) ===")
for n in range(121, 241):
    if n not in qs:
        print(f"Q{n}: MISSING from parser!")
        continue
    runs = re.findall(r'-{2,}', qs[n])
    if len(runs) > 1:
        print(f"Q{n}: {len(runs)} runs {runs} | stem: {qs[n][:110]}")

print()
print("=== single-run length census (121-240) ===")
lens = {}
for n in range(121, 241):
    for r in re.findall(r'-{2,}', qs[n]):
        lens.setdefault(len(r), []).append(n)
for k in sorted(lens):
    print(f"  run-len {k}: x{len(lens[k])} {lens[k][:12]}")

print()
print("=== suspicious orthography (Apostrophe / spelling) ===")
for n in range(121, 241):
    if n not in qs:
        continue
    s = qs[n]
    # فعلِ گذشته/اسم در جای اشتباه — فقط چند الگوی شناخته‌شده را علامت می‌زنیم
    for bad in ("became", "planed", "quitted", "informations", "advices"):
        if re.search(rf'\b{bad}\b', s, re.I):
            print(f"Q{n}: contains '{bad}' | {s[:100]}")

# آیا سؤال‌های ۱۲۱-۲۴۰ همه در پارسر حاضرند؟
missing = [n for n in range(121, 241) if n not in qs]
print()
print("missing questions:", missing if missing else "NONE — 120/120 parsed")
