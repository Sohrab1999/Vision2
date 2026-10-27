# -*- coding: utf-8 -*-
# r352 — پروبِ بخشِ ۲ «۳۶۰ تست واژگان درس ۱ تا ۴ - پایه دهم»: سؤال‌های ۱۲۱-۲۴۰ (ص۱۸۳-۱۸۸، کلیدِ همان ص۳۰۱)
# طبق «کار اول جلسه بعد» r351. الگوی r351 (پروبِ g10-v360).
# نکتهٔ کلیدی r351: گریدِ KEY را هرگز از حفظ نساز — بازتولیدِ برنامه‌ای از ص۳۰۱.
import fitz, re

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# ۱) صفحاتِ محدودهٔ بخش ۲: ص۱۸۳-۱۸۸ (0-idx 182-187)
for pno in range(182, 188):
    t = doc[pno].get_text("text")
    tr = t.count("ترجمه")
    # شمارهٔ سؤال‌های شروع‌شده در صفحه
    starts = [int(m.group(1)) for m in re.finditer(r'(?m)^(\d{1,3})\.\s', t)]
    print(f"########## PAGE {pno+1} ({len(t)} chars, 'ترجمه' x{tr}) ##########")
    print("question-starts:", starts[:30], "..." if len(starts) > 30 else "")
    print(t[:1500])
    print()

# ۲) بازتولیدِ برنامه‌ایِ گریدِ کلیدِ ص۳۰۱ — ۳۶۰ جفت
t301 = doc[300].get_text("text")
print("##### KEY PAGE 301 header:", t301[:200].replace(chr(10), " ")[:150])

# الگوی r351: جفت‌های «شماره حرف» با جداییِ خطی/فاصله‌ای
pairs = re.findall(r'\b(\d{1,3})\s*\n?\s*([a-d])\b', t301)
nums = [int(n) for n, _ in pairs]
print(f"pattern-1 pairs={len(pairs)} range={min(nums) if nums else '-'}..{max(nums) if nums else '-'} unique={len(set(nums))}")

# الگوی جایگزین: «حرف شماره» (اگر الگوی ۱ نقص داشت)
pairs2 = re.findall(r'\b([a-d])\s*\n?\s*(\d{1,3})\b', t301)
print(f"pattern-2 (letter-first) pairs={len(pairs2)}")

# گریدِ نهایی: انتخابِ الگوی کاملِ ۳۶۰تایی
if len(pairs) == 360 and len(set(nums)) == 360:
    KEYMAP = {int(n): l for n, l in pairs}
    src = "num-first"
else:
    KEYMAP = {int(n): l for l, n in pairs2}
    src = "letter-first"

print(f"KEYMAP source={src} len={len(KEYMAP)}")
if len(KEYMAP) == 360:
    grid = " ".join(f"{n}{KEYMAP[n]}" for n in range(1, 361))
    # فقط رانِ ۱۲۱-۲۴۰ چاپ می‌شود (مصرفِ این راند) + تمامِ ران برای مقایسه با r351
    part2 = " ".join(f"{n}{KEYMAP[n]}" for n in range(121, 241))
    print("PART2-GRID(121-240):")
    print(part2)
    # ذخیرهٔ کامل برای مقایسهٔ AGREE با رکوردِ r351
    with open("/tmp/key-grid-g10-p301-r352.txt", "w", encoding="utf-8") as f:
        f.write(grid)

# ۳) مقایسهٔ AGREE با رکوردِ r351 (KEY_RAW در extract-g10-v360a-r351.py)
import json, pathlib
r351 = pathlib.Path("scripts/extract-g10-v360a-r351.py").read_text(encoding="utf-8")
m = re.search(r'KEY_RAW = \(([\s\S]*?)\)', r351)
if m:
    raw = m.group(1)
    r351map = {int(a): b for a, b in re.findall(r'(\d{1,3})([a-d])', raw)}
    print(f"r351 KEY_RAW recovered: {len(r351map)} pairs")
    if len(KEYMAP) == 360:
        agree = sum(1 for n in range(1, 361) if KEYMAP[n] == r351map[n])
        diff = [n for n in range(1, 361) if KEYMAP[n] != r351map[n]]
        print(f"AGREE r352-fresh vs r351-record: {agree}/360; diffs: {diff[:10]}")

# ۴) کوئیرک‌سنجیِ محدودهٔ ۱۲۱-۲۴۰
txt = ""
for pno in range(177, 194):
    txt += doc[pno].get_text("text") + "\n"
txt = re.sub(r'\d{3}\s*\n[\s\S]{0,20}?"جزوه[\s\S]*?هم.{0,12}کاران"\s*\n', "\n", txt)

# فرمتِ گزینه‌ها در این محدوده: پرانتزدار (Q40+ از r351) — آیا پیچشِ دیگری هست؟
for q in (121, 150, 200, 240):
    i = txt.find(f"\n{q}.")
    if i >= 0:
        seg = txt[i:i+260]
        fmt = "paren" if re.search(r'a\)', seg) else ("dot" if re.search(r'a\.', seg) else "?")
        print(f"Q{q} format-hint: {fmt} | {seg[:120].replace(chr(10), ' | ')}")

# ران‌های خط‌چینِ مشکوک (مثل Q24 r351): دنباله‌های - کوتاهِ کنار هم در محدوده
seg2 = ""
m121 = txt.find("\n121.")
m241 = txt.find("\n241.")
if m121 >= 0 and m241 > m121:
    seg2 = txt[m121:m241]
dash_runs = re.findall(r'((?:-{2,}\s*){2,})', seg2)
print("suspicious multi-run dash clusters:", [d.strip()[:60] for d in dash_runs[:8]])
