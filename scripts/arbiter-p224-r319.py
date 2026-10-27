#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r319 — داوریِ چاپ‌محورِ کلیدِ سه بانکِ ص۲۲۴ در برابر JSON.
رونویسیِ چشمی از رندرِ ۳۰۰dpiِ کامل (/tmp/r319-p224-full.png) — حروف a/b/c/d.
JSON: answer 0-based (a=0..d=3). خروجی: واگرایی‌ها + آمار."""
import json

BANK = "/home/z/my-project/public/jozve/grammar-g12-topic.json"
d = json.load(open(BANK))

# رونویسیِ چشمیِ رندرِ ص۲۲۴ (سه گرید، چیدمانِ سطریِ [n، حرف] × ۴ ستون)
PRINT = {
    "کاربردهای افعال ناقص — متوسط (ص۱۴۹)": "dccacbbacdbcbbdbccdb",
    "معلوم و مجهول — کنکوری (ص۱۵۰)": "cdbccbddabbbbbccaaba",
    "افعال ناقص زمان گذشته — تخصصی (ص۱۵۱-۱۵۲)": "".join(
        ["cbddb", "aabdb", "bdbda", "bbbcd", "adbbb", "bbccc", "bcbbb", "cdabd"]),
}
LET = "abcd"
total = ok = 0
divs = []
for ls in d["lessons"]:
    t = ls.get("title", "")
    if t not in PRINT:
        continue
    tr = PRINT[t]
    qs = sorted(ls["questions"], key=lambda q: q.get("n", 0))
    if len(tr) != len(qs):
        print(f"!! length mismatch: {t} — print {len(tr)} vs json {len(qs)}")
        continue
    print(f"\n== {t} ({len(qs)} items)")
    for i, q in enumerate(qs):
        n = q.get("n", i + 1)
        jk = LET[q["answer"]] if 0 <= q["answer"] < 4 else "?"
        pk = tr[i]
        total += 1
        if jk == pk:
            ok += 1
        else:
            divs.append((t, n, jk, pk, q.get("question", "")[:70]))
            print(f"   DIVERGENCE n={n}: json={jk} print={pk} | {q.get('question','')[:70]}")
print(f"\n=== TOTAL: {ok}/{total} agree, {len(divs)} divergences ===")
