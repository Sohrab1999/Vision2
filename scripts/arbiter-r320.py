#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r320 — داوریِ کلیدِ دو بانکِ معلوم‌ومجهول در برابر چاپ:
l10 (ص۳۶): کلیدِ تشریحیِ «N - گزینه(X)» در ص۱۸۵-۱۸۶ — رونویسیِ چشمی
l11 (ص۳۷-۳۸): گریدِ چاپیِ ص۱۸۷ — رونویسیِ چشمی"""
import json

BANK = "/home/z/my-project/public/jozve/grammar-g12-topic.json"
d = json.load(open(BANK))

PRINT = {
    10: "dcbccdabcd" + "ddabdcdaac",   # ص۱۸۵-۱۸۶ (تشریحی)
    11: "".join(["dcbdca", "bcbb", "ddccc", "dbdaa", "bcbbab", "cda bd".replace(" ", ""), "daca a".replace(" ", "")]),
}
# l11 ترتیب n: 1-10=dcbdca? — نه! از گرید: ستون‌ها [1..10, 11..20, 21..30, 31..40]
# سطرها: (1d,11d,21b,31c)(2c,12d,22c,32d)(3b,13c,23b,33a)(4d,14c,24b,34b)(5c,15c,25a,35d)
#        (6a,16d,26b,36d)(7b,17b,27b,37a)(8c,18d,28c,38c)(9b,19a,29a,39a)(10b,20a,30b,40a)
rows = [("d","d","b","c"),("c","d","c","d"),("b","c","b","a"),("d","c","b","b"),("c","c","a","d"),
        ("a","d","b","d"),("b","b","b","a"),("c","d","c","c"),("b","a","a","a"),("b","a","b","a")]
# سطر i → n=i+1, 11+i, 21+i, 31+i
by_n = {}
for i, quad in enumerate(rows):
    for j, letter in enumerate(quad):
        by_n[i + 1 + 10 * j] = letter
PRINT[11] = "".join(by_n[n] for n in sorted(by_n))
PRINT[10] = "dcbccda bcd ddabdcdaac".replace(" ", "")

LET = "abcd"
for lid, tr in PRINT.items():
    ls = [l for l in d["lessons"] if l["lesson"] == lid][0]
    qs = sorted(ls["questions"], key=lambda q: q["n"])
    assert len(tr) == len(qs), f"{lid}: {len(tr)} vs {len(qs)}"
    ok = 0
    divs = []
    for i, q in enumerate(qs):
        jk = LET[q["answer"]]
        if jk == tr[i]:
            ok += 1
        else:
            divs.append((q["n"], jk, tr[i], q["question"][:60]))
    print(f"l{lid}: {ok}/{len(qs)} agree; divergences: {divs if divs else 'none'}")
