#!/usr/bin/env python3
# r399 — اسکنِ باقیمانده‌های خراب در معنی‌هایِ جداولِ واژگانِ g10-12 (پس از r398)
# خروجی: توکن‌هایِ پرساموتِ معنی‌سو که در واژگانِ سالمِ شناخته‌شده نیستند،
# با نامزدهایِ فاصلهٔ-ویرایشیِ ≤۱ — ورودیِ گزینشِ دستیِ نقشهٔ پالایشِ r399.
import json
import os
import re
import sys
from collections import Counter

ROOT = "/home/z/my-project"
JOZ = os.path.join(ROOT, "public/jozve")

RE_STRIP = re.compile(r"[،؛:.!؟\u200c()+\-*«»\"'\s/]")
RE_FA = re.compile(r"[\u0600-\u06FF]")

# ۱۳ جدولِ جفت‌شدهٔ r398
TABLE_KEYS = [
    (10, "لغات کلیدی پایه هفتم"), (10, "لغات کلیدی پایه هشتم"), (10, "لغات کلیدی پایه نهم"),
    (10, "لغات کلیدی و تکمییل درس یکم"), (10, "لغات کلیدی و تکمییل درس دوم"),
    (10, "لغات کلیدی و تکمییل درس سوم"), (10, "لغات کلیدی و تکمییل درس چهارم"),
    (11, "لغات کلیدی و تکمییل درس اول"), (11, "لغات کلیدی و تکمییل درس دوم"),
    (11, "لغات کلیدی و تکمییل درس سوم"),
    (12, "لغات کلیدی و تکمییل درس اول"), (12, "لغات کلیدی و تکمییل درس دوم"),
    (12, "لغات کلیدی و تکمییل درس سوم"),
]


def norm(t):
    return RE_STRIP.sub("", t)


def load_clean():
    """واژگانِ سالم: همهٔ توکن‌هایِ فارسیِ گ۷-گ۹ (بازسازیِ تأییدشدهٔ r397) + prior vocab."""
    clean = Counter()
    pv = os.path.join(ROOT, "scripts", "r398-prior-vocab.json")
    if os.path.exists(pv):
        for t in json.load(open(pv, encoding="utf-8"))["tokens"]:
            clean[norm(t)] += 1
    for g in (7, 8, 9):
        doc = json.load(open(os.path.join(JOZ, f"g{g}.json"), encoding="utf-8"))
        for ch in doc["chapters"]:
            for sec in ch.get("sections", []):
                for line in sec.get("lines", []):
                    for tok in re.findall(r"[\u0600-\u06FF\u200c]+", line):
                        clean[norm(tok)] += 1
    return clean


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
    clean = load_clean()
    stats = Counter()          # همهٔ توکن‌هایِ معنی‌سو
    suspect = Counter()        # توکن‌هایِ ناشناس (در واژگانِ سالم نیستند)
    examples = {}
    for g, key in TABLE_KEYS:
        doc = json.load(open(os.path.join(JOZ, f"g{g}.json"), encoding="utf-8"))
        for ch in doc["chapters"]:
            for sec in ch.get("sections", []):
                if "لغات کلیدی" not in (sec.get("title") or ""):
                    continue
                if "یادداشت" in (sec.get("title") or ""):
                    continue
                if key not in (sec.get("title") or ""):
                    continue
                for line in sec.get("lines", []):
                    if " — " not in line:
                        continue
                    meaning = line.split(" — ", 1)[1]
                    for tok in re.findall(r"[\u0600-\u06FF\u200c]+", meaning):
                        n = norm(tok)
                        if not n or len(n) < 2:
                            continue
                        stats[n] += 1
                        if n not in clean:
                            suspect[n] += 1
                            examples.setdefault(n, (g, line[:90]))

    with open(os.path.join(ROOT, "scripts", "r399-residual-unknowns.txt"), "w", encoding="utf-8") as f:
        for tok, c in suspect.most_common():
            cands = sorted(
                (g for g in clean if abs(len(g) - len(tok)) <= 1 and edit_le1(tok, g)),
                key=lambda x: (-clean[x], x),
            )
            f.write(f"{c}\t{tok}\t{' | '.join(cands[:4])}\n")
    print(f"meaning tokens: {sum(stats.values())} distinct={len(stats)}")
    print(f"unknown (not in clean vocab): {len(suspect)} distinct, {sum(suspect.values())} rows")
    for tok, c in suspect.most_common(int(sys.argv[1]) if len(sys.argv) > 1 else 30):
        g, ex = examples[tok]
        print(f"  {c:3} {tok!r:24} g{g}  {ex}")


if __name__ == "__main__":
    main()
