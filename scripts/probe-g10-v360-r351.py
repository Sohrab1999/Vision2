# -*- coding: utf-8 -*-
# r351 — پروبِ «۳۶۰ تست واژگان درس ۱ تا ۴» (سؤال: ص۱۷۸-۱۹۴، کلیدِ چاپیِ ص۳۰۱+)
# طبق «کار اول جلسه بعد» r350 — بزرگ‌ترین آزمونِ جزوه
import fitz, re

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# ساختار: ص۱۷۸-۱۸۱ (آغاز) + بررسیِ «ترجمه تست» در همهٔ صفحات
for pno in range(177, 182):
    t = doc[pno].get_text("text")
    tr = t.count("ترجمه")
    print(f"########## PAGE {pno+1} ({len(t)} chars, 'ترجمه' x{tr}) ##########")
    print(t[:2400])
    print()

# مرزِ پایان: ص۱۹۴ و ص۱۹۵
for pno in (193, 194):
    t = doc[pno].get_text("text")
    print(f"##### BOUNDARY PAGE {pno+1} ({len(t)} chars) #####")
    print(t[:1000])
    print()

# داوریِ tags r283: «عبارات الحاقی» پایینِ ص۱۸۷
t187 = doc[186].get_text("text")
i = t187.find("الحاقی")
print("##### TAGS r283 — ص۱۸۷ «عبارات الحاقی» #####")
print(t187[max(0, i-200):i+1200] if i >= 0 else "«الحاقی» NOT FOUND on p187; tail:")
if i < 0:
    print(t187[-1200:])

# کلید: چند صفحه؟ ص۳۰۱-۳۰۵
for pno in range(300, 305):
    t = doc[pno].get_text("text")
    header = t[:200].replace(chr(10), " ")
    pairs = re.findall(r'\b([a-d])\s*\n?\s*(\d{1,3})\b', t)
    nums = [int(n) for _, n in pairs]
    print(f"##### KEY PAGE {pno+1}: {len(t)} chars | pairs={len(pairs)} | num range={min(nums) if nums else '-'}..{max(nums) if nums else '-'}")
    print("   header:", header[:150])
