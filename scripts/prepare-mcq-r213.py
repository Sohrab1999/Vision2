#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r213 — prepare the MCQ residue (1832 parked rows of r212) for the hand-solving
round. Emits a stable one-line-per-question review file with FULL stems and
options (extraction glue already scrubbed), ordered by (file, target, page,
num). The solving agent reads this file in slices and emits verdicts
("g10 L9 p27 #2 = idx-or-D") which curate-mcq-r213.py validates 1:1.

Residue label semantics (from mine-mcq-jame.py): "L{target}" IS the app
lesson number produced by target_of(), so g10 L7/L8/L9 -> app 7/8/9,
g11 L1-3 -> 1/2/3, g12 L4-6 -> 4/5/6. No remapping happens here.
"""
import json
import os
import re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EX = os.path.join(BASE, "booklet-extract")

# end-of-option extraction glue (faithful trims only — text AFTER the real
# option value, never inside it)
SCRUB = [
    re.compile(r"\s*Telegram Channel.*$", re.I),
    re.compile(r"\s*Answer Keys?\s*:?\s*$", re.I),
    re.compile(r"\s*Good\s+Luck\s*:?\s*$", re.I),
    re.compile(r"\s*Answer the questions\s*\.?\s*$", re.I),
    re.compile(r"[.\s]+Note\s*:?\s*$"),
    re.compile(r"\s*\*+\s*$"),
]

# obvious unanswerable-without-extracted-material classes
DROP_PATS = [
    (r"\b(from|in|of) the (passage|text|reading)\b|\bpassage\b", "passage"),
    (r"\bparagraph\s*\d", "paragraph"),
    (r"\byou heard\b|\bdialog(ue)?\b|\bconversation\b", "listening"),
    (r"not mentioned|main idea|best title|mainly about", "comprehension"),
    (r"does the word .{0,40}(mean|refer)|synonym for the word|"
     r"opposite of the (underlined|word)|\brefer to\b|underlined", "vocab-in-context"),
]


def scrub_opt(v):
    v = re.sub(r"\s+", " ", v).strip()
    for pat in SCRUB:
        v = pat.sub("", v).strip()
    return v


def main():
    with open(os.path.join(EX, "mcq-mine.json"), encoding="utf-8") as f:
        res = json.load(f)["residue"]

    rows = []
    for r in res:
        opts = [scrub_opt(r["opts_clean"][i]) for i in range(4)]
        stem = re.sub(r"\s+", " ", r["stem"]).strip()
        auto = next((label for pat, label in DROP_PATS
                     if re.search(pat, stem, re.I)), None)
        broken = any(not o for o in opts)
        rows.append({
            "key": f"g{r['grade']} L{r['target']} p{r['page']} #{r['num']}",
            "lesson": r["target"], "page": r["page"], "num": r["num"],
            "grade": r["grade"], "stem": stem, "opts": opts,
            "auto_drop": auto or ("broken-opt" if broken else None),
        })

    # stable order: file (g10,g11,g12), lesson, page, num
    rows.sort(key=lambda r: (r["grade"], r["lesson"], r["page"], r["num"]))

    keys = [r["key"] for r in rows]
    assert len(keys) == len(set(keys)), "duplicate residue keys!"

    auto_d = sum(1 for r in rows if r["auto_drop"])
    with open(os.path.join(EX, "mcq-r213-review.txt"), "w",
              encoding="utf-8") as f:
        for r in rows:
            mark = "  [AUTO-DROP:" + r["auto_drop"] + "]" if r["auto_drop"] else ""
            f.write(f"{r['key']} | {r['stem']} | " +
                    " | ".join(r["opts"]) + mark + "\n")

    with open(os.path.join(EX, "mcq-r213-review.json"), "w",
              encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=0)

    print(f"rows={len(rows)} auto_drop={auto_d} solvable={len(rows) - auto_d}")
    from collections import Counter
    print("per lesson:", dict(sorted(Counter(r["lesson"] for r in rows).items())))


if __name__ == "__main__":
    main()
