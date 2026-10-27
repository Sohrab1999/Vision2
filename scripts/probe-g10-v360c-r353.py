# -*- coding: utf-8 -*-
# r353 — پروبِ بخشِ ۳ «۳۶۰ تست واژگان درس ۱ تا ۴ - پایه دهم»: سؤال‌های ۲۴۱-۳۶۰ (ص۱۸۸-۱۹۴، کلیدِ همان ص۳۰۱)
# طبق «کار اول جلسه بعد» r352. الگوی r351/r352 (پروبِ g10-v360).
# درس‌های برازیده: گریدِ KEY هرگز از حفظ نساز — بازتولیدِ برنامه‌ای از ص۳۰۱ + AGREE با رکوردِ r351/r352.
import fitz, re

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# ۱) صفحاتِ محدودهٔ بخش ۳: ص۱۸۸-۱۹۴ (0-idx 187-193)
for pno in range(187, 194):
    t = doc[pno].get_text("text")
    tr = t.count("ترجمه")
    starts = [int(m.group(1)) for m in re.finditer(r'(?m)^(\d{1,3})\.\s', t)]
    print(f"########## PAGE {pno+1} ({len(t)} chars, 'ترجمه' x{tr}) ##########")
    print("question-starts:", starts[:40], "..." if len(starts) > 40 else "")
    print(t[:1100])
    print()

# ۲) پایانِ آزمون: ص۱۹۴ باید با Q360 تمام شود — بعدش چیست؟ (سربرگِ آزمونِ بعدی؟)
t194 = doc[193].get_text("text")
print("##### END OF PAGE 194 (last 600 chars):")
print(t194[-600:])
print()

# ۳) بازتولیدِ برنامه‌ایِ گریدِ کلیدِ ص۳۰۱ — ۳۶۰ جفت (حرف-اول؛ الگویِ کاملِ r352)
t301 = doc[300].get_text("text")
pairs2 = re.findall(r'\b([a-d])\s*\n?\s*(\d{1,3})\b', t301)
km = {int(n): l for l, n in pairs2}
print(f"letter-first pairs={len(pairs2)} unique={len(km)}")
if len(km) == 360 and set(km) == set(range(1, 361)):
    part3 = " ".join(f"{n}{km[n]}" for n in range(241, 361))
    print("PART3-GRID(241-360):")
    print(part3)
    with open("/tmp/key-grid-g10-p301-r353.txt", "w", encoding="utf-8") as f:
        f.write(" ".join(f"{n}{km[n]}" for n in range(1, 361)))

# ۴) مقایسهٔ AGREE با رکوردهای r351 (KEY_RAW) — همان گریدِ چاپی، باید ۳۶۰/۳۶۰ باشد
import pathlib
r351 = pathlib.Path("scripts/extract-g10-v360a-r351.py").read_text(encoding="utf-8")
m = re.search(r'KEY_RAW = \(([\s\S]*?)\)', r351)
if m and len(km) == 360:
    r351map = {int(n): l for n, l in re.findall(r'(\d{1,3})([a-d])', m.group(1))}
    agree = sum(1 for n in range(1, 361) if km[n] == r351map[n])
    diff = [n for n in range(241, 361) if km[n] != r351map[n]]
    print(f"AGREE r353-fresh vs r351-record: {agree}/360; part3 diffs: {diff[:10]}")

# ۵) کوئیرک‌سنجیِ محدودهٔ ۲۴۱-۳۶۰
txt = ""
for pno in range(177, 194):
    txt += doc[pno].get_text("text") + "\n"
txt = re.sub(r'\d{3}\s*\n[\s\S]{0,20}?"جزوه[\s\S]*?هم.{0,12}کاران"\s*\n', "\n", txt)

for q in (241, 260, 300, 340, 360):
    i = txt.find(f"\n{q}.")
    if i >= 0:
        seg = txt[i:i+260]
        fmt = "paren" if re.search(r'a\)', seg) else ("dot" if re.search(r'a\.', seg) else "?")
        print(f"Q{q} format-hint: {fmt} | {seg[:130].replace(chr(10), ' | ')}")

# ران‌های خط‌چینِ مشکوک در محدوده (ادغامِ ران‌های مجاورِ مجزا)
m241 = txt.find("\n241.")
m361 = txt.find("\n361.")
if m361 < 0:
    m361 = len(txt)
seg2 = txt[m241:m361] if m241 >= 0 else ""
dash_runs = re.findall(r'((?:-{2,}\s*){2,})', seg2)
print("suspicious multi-run dash clusters:", [d.strip()[:60] for d in dash_runs[:10]])

# آیا همهٔ ۱۲۰ سؤالِ ۲۴۱-۳۶۰ با یک پارسِ ساده پیدا می‌شوند؟
pat = re.compile(
    r'(\d{1,3})\.\s*([\s\S]*?)\n\s*a[.)]\s*([\s\S]*?)\n?\s*b[.)]\s*([\s\S]*?)\n?\s*c[.)]\s*([\s\S]*?)\n?\s*d[.)]\s*([\s\S]*?)(?=\n\s*\d{1,3}\.\s|\Z)',
)
qs = {}
for mm in pat.finditer(txt):
    num = int(mm.group(1))
    if num not in qs:
        qs[num] = mm
missing = [n for n in range(241, 361) if n not in qs]
print(f"naive-parse: found={len([n for n in range(241,361) if n in qs])}/120 missing={missing[:12]}")
