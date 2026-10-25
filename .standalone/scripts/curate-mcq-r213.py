#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r213 — curate the hand-solved MCQ residue verdicts and emit the final landing
payload.

Protocol: every one of the 1832 parked rows from r212 received a verdict
(0-3 = answer index, D = drop) written by the solving agent in
mcq-r213-verdicts.txt. This script:
  1. cross-checks verdict keys against residue identities 1:1
  2. validates kept rows: 4 unique non-empty options, latin-dominant stem,
     blocklist over corruption/watermark patterns
  3. dedupes against the EXISTING lesson banks by normalized stem (r212
     convention) and within the r213 set
  4. classifies category (grammar vs vocab-konkuri) via a lexical heuristic
     plus the known grammar page blocks
  5. emits mcq-r213-curated.json + mcq-r213-drops.json (drop reasons, for the
     worklog and the guard test)
"""
import json
import os
import re
from collections import Counter

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EX = os.path.join(BASE, "booklet-extract")
SRC = os.path.join(BASE, "src", "data")

BLOCKLIST = [
    r"telegram", r"answer key", r"good luck", r"true\s*/\s*false",
    r"[\u0600-\u06FF]", r"\bpart\s+\d+\b.*\bpassage\b", r"\blorem\b",
    r"\bundefined\b", r"\bnull\b", r"<[a-z]+>", r"\bTODO\b",
    r"\bxxx\b", r"\bچهارده\s*معصوم\b", r"لطفی", r"جمال احمدی",
]

# option shapes that mean "this option is grammar, not content"
GRAMMAR_TOKEN = re.compile(
    r"^(i|you|he|she|it|we|they|me|him|her|us|them|my|your|his|its|our|their|"
    r"mine|yours|hers|ours|theirs|myself|yourself|himself|herself|itself|"
    r"ourselves|themselves|is|are|am|was|were|be|been|being|do|does|did|done|"
    r"have|has|had|will|would|can|could|should|may|might|must|shall|"
    r"isn'?t|aren'?t|am not|wasn'?t|weren'?t|don'?t|doesn'?t|didn'?t|"
    r"haven'?t|hasn'?t|hadn'?t|won'?t|wouldn'?t|can'?t|couldn'?t|shouldn'?t|"
    r"mustn'?t|may not|much|many|few|a few|little|a little|some|any|"
    r"plenty of|a lot of|lots of|a lot|more|most|less|least|fewer|"
    r"in|on|at|to|for|since|from|by|with|about|during|across|towards|against|"
    r"without|around|beside|near|between|among|so|but|or|and|because|while|"
    r"when|as|despite|although|if|unless|besides|therefore|however|yet|"
    r"a|an|the|this|that|these|those|one of|each|all|both|every|"
    r"better|worse|the best|the worst|higher|slower|bigger|smaller|"
    r"will be|would be|can be|must be|should be|have to|has to|had to)$",
    re.I,
)

# page blocks that are pure grammar practice (booklet section headers)
GRAMMAR_BLOCKS = {
    (7, 66), (7, 67), (7, 69), (7, 72), (7, 73), (7, 74),
    (8, 98), (8, 99), (8, 100), (8, 101), (8, 102), (8, 103),
    (9, 27), (9, 28), (9, 30), (9, 32), (9, 34), (9, 35),
    (9, 128), (9, 134), (9, 136), (9, 155), (9, 163), (9, 165),
    (9, 167), (9, 168), (9, 169), (9, 172), (9, 173), (9, 174),
    (9, 175), (9, 176),
    (1, 29), (1, 30), (1, 33), (1, 34), (1, 35), (1, 36), (1, 38), (1, 39),
    (1, 40), (1, 41),
    (2, 64), (2, 75),
    (3, 69), (3, 70), (3, 71), (3, 72), (3, 73),
    (3, 100), (3, 101), (3, 103), (3, 104), (3, 107), (3, 108), (3, 110),
    (4, 56), (4, 142), (4, 143), (4, 144), (4, 145), (4, 149), (4, 150),
    (4, 151), (4, 152), (4, 154), (4, 155),
    (5, 36), (5, 37), (5, 38), (5, 44), (5, 45), (5, 49), (5, 52), (5, 53),
    (5, 86), (5, 87), (5, 88), (5, 89), (5, 90), (5, 91), (5, 106),
    (5, 107),
    (6, 96), (6, 97), (6, 98), (6, 99), (6, 157), (6, 159),
}


def norm_stem(s):
    s = s.lower()
    s = re.sub(r"[-_―–—]+", " ", s)      # blank runs
    s = re.sub(r"[^a-z0-9 ]", "", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def scrub_opt(v):
    v = re.sub(r"\s+", " ", v).strip()
    for pat in (
        r"\s*Telegram Channel.*$", r"\s*Answer Keys?\s*:?\s*$",
        r"\s*Good\s+Luck\s*:?\s*$", r"\s*Answer the questions\s*\.?\s*$",
        r"[.\s]+Note\s*:?\s*$", r"\s*\.\s*[ABCD]\s*$", r"\s*\*+\s*$",
    ):
        v = re.sub(pat, "", v, flags=re.I).strip()
    return v


def scrub_stem(s):
    # faithful normalization: Arabic question mark -> Latin (the Arabic ؟ is
    # in the Persian unicode range and trips the Persian-char gate)
    return s.replace("؟", "?").strip()


def looks_grammar(opts, stem):
    if any(" / " in o for o in opts):
        return True
    hits = sum(1 for o in opts if GRAMMAR_TOKEN.match(o.strip()))
    if hits >= 3:
        return True
    if re.search(r"\b(-est|more|most|less)\b", " ".join(opts), re.I):
        return True
    # definition-style stems are vocab
    if re.match(r"\s*(To\s+\w+\s+[^.]*\bis\b|A\s+/\s*An?\s+\w+\s+is\b)", stem, re.I):
        return False
    return hits >= 2 and len(max(opts, key=len)) < 28


def main():
    rows = json.load(open(os.path.join(EX, "mcq-r213-review.json"),
                          encoding="utf-8"))
    verdicts = {}
    bad = []
    for line in open(os.path.join(EX, "mcq-r213-verdicts.txt"),
                     encoding="utf-8"):
        line = line.strip()
        if not line:
            continue
        m = re.match(r"^(.+?)\s*=\s*(D|[0-3])$", line)
        if not m:
            bad.append(line)
            continue
        verdicts[m.group(1).strip()] = m.group(2)

    row_keys = {r["key"] for r in rows}
    extra = sorted(set(verdicts) - row_keys)
    missing = sorted(k for k in row_keys if k not in verdicts)
    print(f"verdicts={len(verdicts)} rows={len(rows)} "
          f"extra={len(extra)} missing={len(missing)} malformed={len(bad)}")
    if extra[:5]:
        print("EXTRA keys:", extra[:5])
    if missing[:5]:
        print("MISSING keys:", missing[:5])
    if bad[:5]:
        print("MALFORMED lines:", bad[:5])
    if extra or missing or bad:
        raise SystemExit("verdict/row mismatch — fix before landing")

    kept, drops = [], []
    for r in rows:
        v = verdicts[r["key"]]
        stem = scrub_stem(r["stem"])
        opts = [scrub_opt(o) for o in r["opts"]]
        if v == "D":
            drops.append({"key": r["key"], "lesson": r["lesson"],
                          "reason": "hand-drop",
                          "stem": stem[:90]})
            continue
        # validation gates
        if any(not o for o in opts):
            drops.append({"key": r["key"], "lesson": r["lesson"],
                          "reason": "empty-option-after-scrub", "stem": stem[:90]})
            continue
        if len({o.lower() for o in opts}) < 4:
            drops.append({"key": r["key"], "lesson": r["lesson"],
                          "reason": "duplicate-options", "stem": stem[:90]})
            continue
        joined = (stem + " " + " ".join(opts)).lower()
        if any(re.search(p, joined, re.I) for p in BLOCKLIST):
            drops.append({"key": r["key"], "lesson": r["lesson"],
                          "reason": "blocklist", "stem": stem[:90]})
            continue
        blankless = re.sub(r"[-_―–—]{4,}", " BLANK ", stem)
        if len(blankless) < 12 or len(stem) > 330:
            drops.append({"key": r["key"], "lesson": r["lesson"],
                          "reason": "stem-length", "stem": stem[:90]})
            continue
        kept.append({
            "lesson": r["lesson"],
            "category": "grammar" if (r["lesson"], r["page"]) in GRAMMAR_BLOCKS
            or looks_grammar(opts, stem) else "vocab-konkuri",
            "question": stem,
            "options": opts,
            "answer": int(v),
            "grade": r["grade"],
            "page": r["page"],
            "num": r["num"],
            "mode": "solver",
            "verdict": "S",
        })

    # dedupe against existing banks (r212 convention) + within set
    existing = {}
    for lesson in range(1, 13):
        path = os.path.join(SRC, f"lesson{lesson}.ts")
        if not os.path.exists(path):
            continue
        src = open(path, encoding="utf-8").read()
        m = re.search(r"const quizzes = \[(.*?)\n\];", src, re.S)
        if not m:
            continue
        body = m.group(1)
        stems = set()
        for qm in re.finditer(r"Q\(\"[^\"]+\",\s*\"[^\"]+\",\s*\"(.*?)\",\s*\[",
                              body, re.S):
            stems.add(norm_stem(qm.group(1)))
        existing[lesson] = stems

    final, seen = [], set()
    for q in kept:
        ns = norm_stem(q["question"])
        if ns in existing.get(q["lesson"], set()) or ns in seen:
            q["verdict"] = "dup"
            drops.append({"key": f"g{q['grade']} L{q['lesson']} p{q['page']} #{q['num']}",
                          "lesson": q["lesson"], "reason": "already-in-bank",
                          "stem": q["question"][:90]})
            continue
        seen.add(ns)
        final.append(q)

    with open(os.path.join(EX, "mcq-r213-curated.json"), "w",
              encoding="utf-8") as f:
        json.dump(final, f, ensure_ascii=False, indent=1)
    with open(os.path.join(EX, "mcq-r213-drops.json"), "w",
              encoding="utf-8") as f:
        json.dump(drops, f, ensure_ascii=False, indent=1)

    print(f"kept={len(final)} drops={len(drops)}")
    print("by lesson:", dict(sorted(Counter(q['lesson'] for q in final).items())))
    print("by verdict-verdict S:", len(final))
    print("by category:", dict(Counter(q['category'] for q in final)))
    print("drop reasons:", dict(Counter(d['reason'] for d in drops)))


if __name__ == "__main__":
    main()
