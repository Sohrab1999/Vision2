#!/usr/bin/env python3
"""r269: programmatic receipt — verify exam.ts (360-question bank, added by a
parallel session) against the jozve's own printed key on p.204.

Key layout (discovered from content-extracts/grade11.txt, «پاسخنامه کلیدی360»):
pairs of (letter, number) in RTL-visual column order, 9 columns:
  q = 321 - 40*(p % 9) + (p // 9)
Both decodings are cross-checked: printed numbers must equal the multiset
{1..360} (broken RTL digits would violate this and flag positional fallback).
"""
import json
import re
import sys

CORPUS = "/home/z/my-project/content-extracts/grade11.txt"
EXAM_TS = "/home/z/my-project/src/data/exam.ts"

def load_key_pairs():
    lines = open(CORPUS, encoding="utf-8").read().splitlines()
    # find the «پاسخنامه کلیدی360» anchor line
    start = None
    for i, ln in enumerate(lines):
        if "پاسخنامه کلیدی360" in ln or "پاسخنامه کلیدی360" in ln.replace(" ", ""):
            start = i
            break
    if start is None:
        sys.exit("key anchor not found")
    # collect tokens until we have 720 tokens (360 pairs) or section ends
    toks = []
    for ln in lines[start + 1:]:
        for t in ln.split():
            toks.append(t)
        if len(toks) >= 1000:
            break
    letters, numbers = [], []
    i = 0
    while i < len(toks) - 1 and len(letters) < 360:
        a, b = toks[i], toks[i + 1]
        if re.fullmatch(r"[abcdABCD]", a) and re.fullmatch(r"\d{1,3}", b):
            letters.append(a.lower())
            numbers.append(int(b))
            i += 2
            continue
        # merged single token like "a41" / "B322"
        m = re.fullmatch(r"([abcdABCD])(\d{1,3})", a)
        if m:
            letters.append(m.group(1).lower())
            numbers.append(int(m.group(2)))
            i += 1
            continue
        # Persian-digit number next to a letter
        if re.fullmatch(r"[abcdABCD]", a) and re.fullmatch(r"[۰-۹]{1,3}", b):
            letters.append(a.lower())
            numbers.append(int(b.translate(str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789"))))
            i += 2
            continue
        i += 1
    return letters, numbers


def main():
    letters, numbers = load_key_pairs()
    print(f"pairs parsed: {len(letters)}")
    if len(letters) != 360:
        sys.exit(f"expected 360 pairs, got {len(letters)}")

    # decode positionally: q = 321 - 40*(p%9) + (p//9)
    positional = {}
    printed = {}
    broken = 0
    for p, (L, n) in enumerate(zip(letters, numbers)):
        q = 321 - 40 * (p % 9) + (p // 9)
        positional[q] = L
        if 1 <= n <= 360:
            printed[n] = L
            if printed.get(n) != positional.get(n):
                broken += 1
        else:
            broken += 1
    multiset_ok = sorted(printed.keys()) == list(range(1, 361))
    print(f"printed-number multiset == 1..360: {multiset_ok} | mismatches vs positional: {broken}")
    agree = sum(1 for q in positional if q in printed and printed[q] == positional[q])
    print(f"positional/printed agreement: {agree}/360")

    # load exam.ts answers
    src = open(EXAM_TS, encoding="utf-8").read()
    qs = re.findall(r'Q\("x-(\d+)",\s*"[a-z]+",\s*(?:"(?:[^"\\]|\\.)*"\s*,\s*)?\[([^\]]*)\]\s*,\s*(\d+)\)', src)
    print(f"exam.ts Q() rows matched: {len(qs)}")
    if len(qs) != 360:
        sys.exit(f"expected 360 exam rows, got {len(qs)}")
    mismatches = []
    for num, _opts, ans in qs:
        q = int(num)
        ai = int(ans)  # 0-based -> a/b/c/d
        mine = "abcd"[ai]
        theirs = positional.get(q)
        if mine != theirs:
            mismatches.append((q, mine, theirs))
    print(f"answer mismatches exam.ts vs p.204 key: {len(mismatches)}")
    if mismatches:
        for q, m, t in sorted(mismatches):
            print(f"  x-{q}: exam={m} key={t}")
    else:
        print("RECEIPT: all 360 exam answers match the jozve printed key (p.204) — bank verified")

    # translation coverage: every x-N must have an EXAM_FA entry
    fa = open("/home/z/my-project/src/data/exam-fa.ts", encoding="utf-8").read()
    fa_ids = set(re.findall(r'"x-(\d+)":', fa))
    missing_fa = [n for n, _, _ in ((q, o, a) for q, o, a in qs) if n not in fa_ids]
    print(f"translation coverage: {360 - len(missing_fa)}/360")
    if missing_fa:
        print(f"  missing FA for: {sorted(int(x) for x in missing_fa)[:20]}")

    # non-Persian leak check on FA values is done in the jozve parsers; here
    # just confirm no exam.ts stem/options contain Persian characters
    leaks = re.findall(r'Q\("x-\d+"[^)]*[\u0600-\u06FF][^)]*\)', src)
    print(f"Persian leak in exam.ts rows: {len(leaks)}")


if __name__ == "__main__":
    main()
