# -*- coding: utf-8 -*-
# r354 — سرویِ صفحات ۱۹۵-۳۰۲ جزوهٔ جامع دهم: یافتنِ محتوای تستیِ باقی‌مانده پس از بستنِ بخشِ تستی (ص۱۷۲-۱۹۴)
# طبق «کار اول جلسه بعد» r353. هدف: نقشهٔ سربرگ‌ها/آزمون‌ها/کلیدها برای تصمیمِ خانوادهٔ بعدی.
import fitz, re, json

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)
print(f"total pages: {len(doc)}")

# ۱) نقشهٔ خامِ ۱۹۵-۳۰۲: طولِ متن + نشانه‌های تستی + سربرگ‌های محتمل
markers = ["تست", "آزمون", "سؤال", "پاسخنامه", "کلید", "گزینه", "درست", "غلط", "جای خالی", "واژگان", "گرامر", "شنیداری", "مکالمه", "ریدینگ", "Reading", "Vocabulary", "Grammar"]
print("\n===== PAGE MAP 195-302 =====")
for pno in range(194, min(302, len(doc))):
    t = doc[pno].get_text("text")
    hits = {m: t.count(m) for m in markers if t.count(m) > 0}
    # سؤال‌شروع‌های MCQ-مانند
    starts = [int(m.group(1)) for m in re.finditer(r'(?m)^(\d{1,3})\.\s', t)]
    opts = len(re.findall(r'(?m)^\s*[a-d][.)]\s', t))
    first = t.strip().split("\n")[0][:70] if t.strip() else "(empty)"
    print(f"p{pno+1:3d} ch={len(t):5d} opts={opts:3d} qstarts={starts[:8]}{'…' if len(starts)>8 else ''} hits={hits if hits else ''} | {first}")

# ۲) سربرگ‌های سرخ‌رنگ/بزرگ — از spans با فونت درشت
print("\n===== BIG/COLORED HEADERS 195-302 =====")
for pno in range(194, min(302, len(doc))):
    d = doc[pno].get_text("dict")
    for blk in d.get("blocks", []):
        for ln in blk.get("lines", []):
            for sp in ln.get("spans", []):
                sz = sp.get("size", 0)
                col = sp.get("color", 0)
                txt = sp.get("text", "").strip()
                if sz >= 13 and len(txt) >= 4:
                    print(f"p{pno+1:3d} sz={sz:.0f} col=#{col:06x} «{txt[:80]}»")
