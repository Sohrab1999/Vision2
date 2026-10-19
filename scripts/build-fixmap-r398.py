#!/usr/bin/env python3
# r398 — ساختِ پیشنهادهای نقشهٔ پالایشِ توکن برای جداولِ واژگانِ g10-12
# توکن‌های پرساموتِ خراب (گلیف‌های جابه‌جای pdftotext) با فاصلهٔ ویرایشی ≤۱
# به واژه‌نامهٔ سالم پیشنهاد می‌شوند؛ فهرستِ خروجی دستی بازبینی و در
# scripts/r398-token-fixes.json می‌نشیند.
import json
import os
import re
import sys
from collections import Counter

ROOT = "/home/z/my-project"
STATS = os.path.join(ROOT, "scripts", "r398-token-stats.txt")
OUT = os.path.join(ROOT, "scripts", "r398-fix-candidates.txt")

RE_STRIP = re.compile(r"[،؛:.!؟\u200c()+\-*«»\"'\s/]")


def norm(t):
    return RE_STRIP.sub("", t)


HAND_GOOD = """کردن شدن دادن گرفتن داشتن رفتن آمدن بردن خوردن دیدن شنیدن یافتن
انداختن بودن آوردن کشیدن زدن پوشیدن نوشتن خواندن فهمیدن دانستن گفتن ساختن
خریدن فروختن جستجو کردن استفاده کردن توجه کردن تأکید کردن
حمایت کردن تصمیم گرفتن نگاه کردن نگاه داشتن عمل کردن اجرا کردن
کلمه واژه جمله عبارت ترجمه معنی تلفظ تمرین آزمون سؤال پاسخ
زمان حال گذشته آینده ساده استمراری کامل مجهول شرطی
فاعل مفعول ضمیر قید صفت فعل کمکی اصلی
هوا آب خاک آتش باد دندان پزشک کتابخانه""".split()


def edit_le1(a, b):
    if a == b:
        return True
    la, lb = len(a), len(b)
    if abs(la - lb) > 1:
        return False
    if la == lb:
        return sum(1 for x, y in zip(a, b) if x != y) == 1
    if la > lb:
        a, b, la, lb = b, a, lb, la
    i = 0
    while i < la and a[i] == b[i]:
        i += 1
    return a[i:] == b[i + 1:]


def main():
    stat = Counter()
    for line in open(STATS, encoding="utf-8"):
        c, tok = line.rstrip("\n").split("\t")
        stat[tok] = int(c)

    # واژه‌نامهٔ سالمِ پیشین: از بازسازیِ پاکِ r397 (گ۷-گ۹) + فهرستِ دستی —
    # توکن‌های خودِ آمار به‌عنوانِ «سالم» پذیرفته نمی‌شوند (خرابی‌ها سیستماتیک‌اند)
    clean = set()
    pv = os.path.join(ROOT, "scripts", "r398-prior-vocab.json")
    if os.path.exists(pv):
        clean |= set(json.load(open(pv, encoding="utf-8"))["tokens"])
    clean |= set(norm(t) for t in HAND_GOOD)

    out = []
    seen = set()
    for tok, c in stat.most_common(700):
        n = norm(tok)
        if not n or n in seen or len(n) < 3:
            continue
        seen.add(n)
        if n in clean:
            continue
        cands = [g for g in clean if abs(len(g) - len(n)) <= 1 and edit_le1(n, g)]
        if not cands:
            continue
        cands.sort(key=lambda g: (-stat.get(g, 0), g))
        out.append((c, tok, cands[:4]))

    with open(OUT, "w", encoding="utf-8") as f:
        for c, tok, cands in out:
            f.write(f"{c}\t{tok}\t{' | '.join(cands)}\n")
    print(f"candidates: {len(out)} → {OUT}")
    for c, tok, cands in out[:40]:
        print(f"  {c:4} {tok!r:26} → {cands}")


if __name__ == "__main__":
    main()
