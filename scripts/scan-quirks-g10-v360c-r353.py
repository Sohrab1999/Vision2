# -*- coding: utf-8 -*-
# r353 — اسکنِ ران‌های خط‌چینِ چندگانه + نامزدهای چاپ‌غلط در Q241-360 (پیش از استخراج)
# الگوی scan-quirks-g10-v360b-r352.py
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
qs, opts = {}, {}
for m in pat.finditer(txt):
    num = int(m.group(1))
    if num not in qs:
        qs[num] = re.sub(r"\s+", " ", m.group(2)).strip()
        opts[num] = [re.sub(r"\s+", " ", g).strip() for g in m.groups()[2:]]

print("=== multi-run questions (241-360) ===")
for n in range(241, 361):
    if n not in qs:
        print(f"Q{n}: MISSING from parser!")
        continue
    runs = re.findall(r'-{2,}', qs[n])
    if len(runs) > 1:
        print(f"Q{n}: {len(runs)} runs {runs} | stem: {qs[n][:110]}")

print()
print("=== run length census (241-360) ===")
lens = {}
for n in range(241, 361):
    for r in re.findall(r'-{2,}', qs[n]):
        lens.setdefault(len(r), []).append(n)
for k in sorted(lens):
    print(f"  run-len {k}: x{len(lens[k])} {lens[k][:14]}")

print()
print("=== no-blank questions (no dash run at all) ===")
nb = [n for n in range(241, 361) if n in qs and not re.search(r'-{2,}', qs[n])]
print(nb if nb else "NONE — all have a blank")

print()
print("=== suspicious orthography / option-letter quirks ===")
for n in range(241, 361):
    if n not in qs:
        continue
    s = qs[n] + " | " + " ".join(opts[n])
    for bad in ("became", "planed", "quitted", "informations", "advices", "health", "shelfs", "idea,"):
        if re.search(rf'\b{bad}\b', s, re.I):
            print(f"Q{n}: contains '{bad}' | {s[:120]}")

# گزینه‌های تکراریِ درون‌سؤال (کشفِ Q174-مانند)
print()
print("=== duplicate option contents within a question ===")
for n in range(241, 361):
    if n not in opts:
        continue
    seen, dups = set(), set()
    for o in opts[n]:
        if o in seen:
            dups.add(o)
        seen.add(o)
    if dups:
        print(f"Q{n}: duplicate options {dups} | {opts[n]}")

# حروفِ گزینهٔ تکراری در لایه (مثل b) به‌جای d) — اسکنِ خامِ لایه)
print()
print("=== layer-level option letter anomalies (raw scan) ===")
seg = txt[txt.find("\n241."):]
for m in re.finditer(r'(?m)^\s{0,8}([a-d])[.)]', seg):
    pass  # ساختارِ خطی نه قطعی — بررسیِ برنامه‌ایِ زیر

# هر سؤال باید چهار گزینهٔ a-d داشته باشد؛ شمارشِ حروفِ گزینه در بازهٔ هر سؤال
qstarts = sorted(qs.keys())
for i, n in enumerate(qstarts):
    if n < 241 or n > 360:
        continue
    end = txt.find(f"\n{qstarts[i+1]}.") if i + 1 < len(qstarts) else len(txt)
    seg_q = txt[txt.find(f"\n{n}."):end]
    letters = re.findall(r'(?m)^\s{0,10}([a-d])[.)]', seg_q)
    if letters != ["a", "b", "c", "d"]:
        print(f"Q{n}: letters={letters}")
print("(anomalies above if any — silence means clean a/b/c/d ordering)")
