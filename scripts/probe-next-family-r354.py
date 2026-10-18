# -*- coding: utf-8 -*-
# r354 — سرویِ خانوادهٔ بعدی: جزوه‌های نهم/هشتم/هفتم + دنبالهٔ یازدهم/دوازدهم
# هدف: یافتنِ ناحیهٔ تستیِ استخراج‌نشده برای گشودنِ خانوادهٔ جدید (ادامهٔ «درس‌بندیِ» خواستهٔ کاربر).
import fitz, re

FILES = {
    7: "/home/z/my-project/upload/جزوه هفتم.pdf",
    8: "/home/z/my-project/upload/جزوه هشتم.pdf",
    9: "/home/z/my-project/upload/جزوه زبان نهم حسن لطفی بوکان.pdf",
    11: "/home/z/my-project/upload/جزوه جامع یازدهم .pdf",
    12: "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf",
}
MARK = ["تست", "آزمون", "پاسخنامه", "کلید", "واژگان", "گرامر", "سؤال", "گزینه"]

for g, path in FILES.items():
    try:
        doc = fitz.open(path)
    except Exception as e:
        print(f"### g{g}: OPEN FAIL {e}")
        continue
    n = len(doc)
    print(f"\n########## g{g}: {n} pages ##########")
    for pno in range(n):
        t = doc[pno].get_text("text")
        ch = len(t)
        if ch == 0:
            print(f"p{pno+1:3d} ch=0 (image page)")
            continue
        hits = {m: t.count(m) for m in MARK if t.count(m) > 2}
        opts = len(re.findall(r'(?m)^\s*[a-d][.)]\s', t))
        qstarts = [int(m.group(1)) for m in re.finditer(r'(?m)^(\d{1,3})\.\s', t)]
        tr = t.count("ترجمه")
        first = t.strip().split("\n")[0][:60] if t.strip() else ""
        flag = " TEST?" if (opts >= 4 or (tr >= 3 and qstarts)) else ""
        print(f"p{pno+1:3d} ch={ch:5d} opts={opts:3d} tr={tr:3d} q={len(qstarts):3d} hits={hits if hits else ''}{flag} | {first}")
    doc.close()
