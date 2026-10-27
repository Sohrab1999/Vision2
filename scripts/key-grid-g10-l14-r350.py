# -*- coding: utf-8 -*-
# r350 — گریدِ کلیدِ «۱۰۰ تست گرامر و نگارش درس ۱ تا ۴» (ص۳۰۰) + بررسیِ ترجمهٔ چاپی
import fitz, re

doc = fitz.open("/home/z/my-project/upload/جزوه جامع دهم .pdf")
txt = doc[299].get_text("text")

# جفت‌های (حرف، شماره) — اعداد می‌توانند لاتین باشند
pairs = re.findall(r'\b([a-d])\s*\n?\s*(\d{1,3})\b', txt)
key = {}
dupes = []
for letter, num in pairs:
    n = int(num)
    if n in key:
        if key[n] != letter:
            dupes.append((n, key[n], letter))
    key[n] = letter

missing = [n for n in range(1, 101) if n not in key]
extra = [n for n in key if n > 100]
print("pairs found:", len(pairs), "| unique:", len(key))
print("missing:", missing)
print("dupes with conflict:", dupes)
print("grid:", " ".join(f"{n}{key[n]}" for n in sorted(key)))

# بررسیِ «ترجمه تست» در صفحات سؤال (ص۱۷۲-۱۷۶)
print()
for pno in range(171, 176):
    t = doc[pno].get_text("text")
    tr = t.count("ترجمه")
    fa_words = len(re.findall(r'[آ-ی]{3,}', t))
    print(f"page {pno+1}: 'ترجمه' x{tr}, persian-words>=3chars: {fa_words}")

# سطح و سربرگِ آزمون
t172 = doc[171].get_text("text")
m = re.search(r'۱۰۰[\s\S]{0,400}', t172)
print()
print("--- test header (page 172 raw) ---")
print(t172[:1200])
