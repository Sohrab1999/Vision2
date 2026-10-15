#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r212 — curate the mined MCQs with the hand-review verdicts and emit the
final landing payload.

Review protocol (3 passes over every joined question):
  pass 1: the 215 range-mode joins
  pass 2: the 245 keylist-mode joins
  pass 3: the 78 range-fallback joins
Verdicts: K = keep the booklet key, F<n> = fix to letter n (key linkage
failed but the question+options are faithful and the answer is linguistically
certain, cross-checked against the booklet's «کلیدی و ترجمه» sections where
they overlap), D = drop (ambiguous stem, broken extraction, or unanswerable
without a reading passage that was never extracted).
"""
import json
import os
import re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EX = os.path.join(BASE, "booklet-extract")

K = "K"
D = "D"

def F(i):
    return ("F", i)

# ------------------------------------------------------------- verdicts
V = {}

def put(block, pages, spec):
    for page, entries in zip(pages, spec):
        for num, v in entries:
            V[(block, page, num)] = v

# --- L1 (g11 درس اول)
put(1, [30], [[(8, K), (12, F(3)), (14, F(3)), (15, F(1)), (17, K)]])
put(1, [19], [[(2, F(0)), (5, K), (9, F(1)), (11, F(2))]])
put(1, [20], [[(21, F(1)), (22, K), (23, F(3)), (24, K), (25, F(3)), (26, K),
               (27, K), (28, F(2)), (29, F(2)), (30, F(0)), (31, D), (32, F(0)),
               (33, F(3)), (34, K), (35, K), (36, F(3)), (37, F(0)), (39, F(1)),
               (40, K)]])
put(1, [21], [[(2, F(0)), (5, K), (9, F(2))]])
put(1, [37], [[(19, F(3)), (25, F(3)), (28, F(0)), (29, F(2)), (31, K), (33, F(3))]])
put(1, [38], [[(35, F(1)), (38, F(2)), (39, F(2))]])

# --- L2 (g11 درس دوم)
put(2, [57], [[(4, K), (6, K), (7, K), (9, K), (10, K), (11, K), (13, K),
               (15, K), (16, K), (17, K), (18, K), (19, K)]])
put(2, [58], [[(24, K), (25, K), (26, K), (27, K), (28, K), (29, K), (32, K),
               (33, K), (34, K), (35, K), (36, K), (37, K), (38, K)]])
put(2, [64], [[(19, F(1))]])

# --- L3 (g11 درس سوم)
put(3, [89], [[(5, D), (6, F(3)), (7, F(1)), (9, F(2)), (10, F(0)), (11, F(3)),
               (1, F(2)), (2, F(1)), (3, F(3)), (4, F(1)), (8, F(1)), (12, F(2))]])
put(3, [90], [[(13, F(1)), (14, F(0)), (15, F(2)), (18, F(0)), (19, F(3)),
               (20, K), (21, F(2)), (22, F(1)), (23, F(1)), (24, F(0))]])
put(3, [105], [[(2, F(2)), (4, F(1)), (5, K), (6, F(0)), (7, F(2)), (8, F(2)),
                (9, F(1)), (10, F(3)), (12, F(3)), (13, F(0)), (14, F(3)),
                (15, F(1)), (17, D), (18, F(2))]])
put(3, [106], [[(19, F(3)), (21, K), (22, F(3)), (23, F(3)), (24, F(2)),
                (25, F(3)), (27, F(3)), (28, K), (29, F(0)), (30, F(3)),
                (32, F(3)), (33, F(1)), (35, F(3))]])
put(3, [107], [[(37, F(3)), (38, F(3)), (39, F(3)), (40, K)]])

# --- L4 (g12 درس اول) — the keylist block is fully aligned
put(4, [19], [[(14, F(1))]])
put(4, [21], [[(1, K), (2, K), (3, K), (5, K), (7, K), (8, K), (9, K), (10, K),
               (11, K), (12, K), (16, K), (17, K), (18, K), (19, K), (20, K)]])
put(4, [22], [[(22, K), (23, K), (25, K), (26, K), (27, K), (28, K), (29, K),
               (30, K), (32, K), (33, K), (34, K), (35, K), (36, K), (37, K),
               (38, K), (39, K)]])
put(4, [23], [[(41, K), (42, K), (43, K), (44, K), (45, K), (46, K), (47, K),
               (48, K), (49, K), (51, K), (52, K), (54, K), (56, K), (57, K)]])
put(4, [24], [[(62, K), (68, K), (69, K), (70, K), (71, K), (73, K), (74, K),
               (76, K), (77, K), (78, K)]])
put(4, [25], [[(79, D), (80, K), (81, K), (82, K), (83, K), (84, K), (85, K),
               (86, K), (87, K), (89, K), (90, K), (91, K), (92, K), (93, K),
               (94, K), (95, K), (98, K), (99, K), (100, K)]])

# --- L5 (g12 درس دوم)
put(5, [74], [[(1, K), (2, K), (3, K), (4, K), (6, K), (8, K), (9, K), (10, K),
               (12, F(3)), (13, F(0)), (14, F(1)), (15, F(3)), (16, F(3)),
               (17, F(0)), (19, F(1))]])
put(5, [75], [[(20, F(3)), (21, F(1)), (22, F(1)), (23, F(3)), (24, F(0)),
               (25, F(2)), (26, F(2)), (27, F(2)), (28, K), (29, K), (30, K),
               (31, F(0)), (33, F(3)), (35, F(3)), (36, F(1)), (38, F(3)),
               (39, K), (40, K)]])
put(5, [76], [[(41, F(0)), (42, F(2)), (44, F(0)), (45, K), (46, K), (47, F(1)),
               (48, F(2)), (49, F(0)), (50, F(1)), (51, K), (52, K), (54, K),
               (55, K), (56, K), (57, K), (58, K), (59, K), (60, K), (61, K)]])
put(5, [77], [[(62, K), (63, K), (64, K), (67, K), (68, K), (69, K), (70, K),
               (71, K), (72, K), (73, K), (74, F(1)), (75, K), (77, K)]])
put(5, [78], [[(80, K), (81, K), (82, K), (83, K), (84, K), (85, K), (86, K),
               (87, K), (88, K), (90, K), (91, K), (92, K), (93, K), (94, K),
               (95, K), (96, K), (97, K), (98, K), (99, K), (100, K)]])
put(5, [86], [[(6, F(2)), (11, F(0)), (13, F(0))]])

# --- L6 (g12 درس سوم)
put(6, [131], [[(18, K), (19, K), (20, D)]])
put(6, [132], [[(1, K), (2, K), (3, K), (4, K), (5, K), (6, K), (7, F(0)),
                (8, K), (9, K), (10, K), (11, K), (12, K), (13, K), (14, F(0)),
                (15, K), (16, K), (17, K), (18, F(3)), (19, K), (20, K)]])
put(6, [133], [[(21, F(3)), (23, F(1)), (24, K), (25, K), (26, F(0)), (28, K),
                (29, K), (31, K), (32, K), (33, K), (34, K), (35, K), (36, K),
                (37, K), (38, K), (39, K)]])
put(6, [134], [[(41, K), (42, K), (44, K), (45, K), (46, K), (47, K), (49, K),
                (50, K), (52, K), (55, K), (56, K), (58, K), (60, K)]])
put(6, [135], [[(62, K), (66, K), (67, K), (68, K), (69, K), (70, K), (71, K),
                (73, K), (74, K), (75, K), (76, K), (77, K), (79, K)]])
put(6, [136], [[(80, K), (81, K), (83, K), (84, K), (85, K), (86, K), (87, K),
                (89, K), (90, K), (91, K), (92, K), (94, K), (96, K), (97, K),
                (98, K), (99, K), (100, K)]])
# reading-comprehension items — unanswerable without the (never-extracted)
# passages; dropped
put(6, [237], [[(11, D)]])
put(6, [247], [[(50, D)]])
put(6, [262], [[(41, D)]])
put(6, [263], [[(42, D)]])
put(6, [311], [[(37, D)]])

# --- L7 (g10 درس اول)
put(7, [19], [[(1, K), (2, K), (3, K), (5, K), (6, K), (8, K), (9, K), (10, K),
               (12, K), (13, K), (15, K), (16, K), (17, K)]])
put(7, [20], [[(22, K), (24, K), (25, K), (26, K), (27, K), (28, K), (29, K),
               (31, K), (34, K), (35, K), (36, K), (39, K)]])
put(7, [21], [[(40, K), (41, K), (42, K), (44, K), (45, K), (47, K), (48, K),
               (49, K), (50, K)]])
put(7, [50], [[(1, K), (2, F(3)), (6, K), (8, K), (10, F(3))]])
put(7, [51], [[(12, F(3)), (13, F(0)), (15, F(1)), (17, F(2)), (19, F(3)),
               (25, F(1))]])
put(7, [60], [[(3, K), (4, F(1)), (5, F(1))]])
put(7, [69], [[(1, F(1)), (2, F(2)), (3, F(0)), (4, F(1))]])

# --- L8 (g10 درس دوم)
put(8, [85], [[(5, F(2)), (6, K), (7, F(3)), (8, F(0)), (9, F(1)), (10, F(1))]])
put(8, [86], [[(12, K), (14, F(2)), (15, F(3)), (16, F(2)), (17, F(1)),
               (19, F(1)), (20, F(3)), (25, F(0))]])
put(8, [101], [[(1, K), (2, K), (3, K), (4, K), (7, K), (8, K), (9, K), (10, K),
                (11, K), (13, K)]])
put(8, [103], [[(29, K), (30, K), (31, K), (32, K), (33, K), (34, K), (36, K),
                (37, K), (39, K), (41, K)]])
put(8, [105], [[(1, K), (2, F(1)), (4, F(3))]])
put(8, [106], [[(1, F(1)), (2, F(1)), (4, F(3))]])

# --- L9 (g10 درس سوم)
put(9, [34], [[(11, K), (16, K)]])
put(9, [37], [[(1, K), (3, K), (10, K), (11, K)]])
put(9, [38], [[(23, K), (35, K)]])
put(9, [134], [[(7, F(0)), (14, F(2)), (18, K), (20, F(1))]])
put(9, [138], [[(1, K), (2, K), (3, K), (5, K), (8, F(3)), (10, K), (12, K),
                (13, K), (14, K), (15, K)]])
put(9, [139], [[(17, K), (19, K), (20, K), (24, K), (25, K), (26, K), (27, K),
                (29, K), (30, K)]])
put(9, [140], [[(33, D), (37, K), (38, K), (39, K), (41, K), (42, K), (43, K),
                (46, K)]])
put(9, [149], [[(1, K), (2, K), (3, K), (4, K), (5, F(1)), (6, F(3)), (7, K),
                (8, K), (9, K), (10, K)]])
put(9, [150], [[(11, F(2)), (12, K), (13, F(1)), (14, F(0)), (15, F(3)),
                (19, F(3)), (20, K), (21, K), (22, F(0)), (23, F(2)), (24, F(2)),
                (25, F(1))]])
put(9, [178], [[(2, F(3)), (3, K), (4, K), (5, K), (9, F(3)), (12, F(0)),
                (17, K), (19, F(1)), (20, F(3))]])
put(9, [179], [[(26, F(1)), (37, K)]])
put(9, [181], [[(69, F(2)), (70, F(0)), (74, K), (80, F(2)), (86, F(0))]])

# option-text repairs (watermarks / RTL bleed that slipped past the gates)
OPTION_FIX = {
    (6, 263, 42): {"D": "Hydroelectric power"},
    (7, 21, 50): {"D": "help"},
    (7, 51, 25): {"D": "endangered"},
    (8, 101, 4): {"B": "nice big German wooden"},
}

# grammar-testing blocks (structure questions, not word choice)
GRAMMAR_PAGES = {
    (1, 30), (1, 37), (1, 38), (2, 64), (3, 105), (3, 106), (3, 107),
    (5, 86), (7, 60), (8, 101), (8, 103), (8, 106),
    (9, 34), (9, 37), (9, 38), (9, 138), (9, 139), (9, 140),
}

WATERMARK = re.compile(r"\s*(Telegram Channel|True / False).*$")

def main():
    with open(os.path.join(EX, "mcq-mine.json"), encoding="utf-8") as f:
        mine = json.load(f)
    joined = mine["joined"]

    kept, dropped, missing = [], [], []
    seen = set()
    for g in joined:
        key = (g["target"], g["page"], g["num"])
        if key in seen:
            continue  # dedupe identical identities
        seen.add(key)
        v = V.get(key)
        if v is None:
            missing.append(key)
            continue
        if v == D:
            dropped.append(key)
            continue
        if v == K:
            idx = g["answer_idx"]
        else:
            idx = v[1]
        opts = list(g["opts_clean"])
        for letter, txt in OPTION_FIX.get(key, {}).items():
            opts["ABCD".index(letter)] = txt
        # global watermark scrub (defence in depth)
        opts = [WATERMARK.sub("", o).strip() for o in opts]
        cat = "grammar" if (g["target"], g["page"]) in GRAMMAR_PAGES \
            else "vocab-konkuri"
        kept.append({
            "lesson": g["target"],
            "category": cat,
            "question": g["stem"],
            "options": opts,
            "answer": idx,
            "grade": g["grade"],
            "page": g["page"],
            "num": g["num"],
            "mode": g["mode"],
            "verdict": "K" if v == K else "F",
        })

    print(f"kept={len(kept)} dropped={len(dropped)} missing-verdict={len(missing)}")
    from collections import Counter
    print("by lesson:", dict(sorted(Counter(k['lesson'] for k in kept).items())))
    print("by verdict:", Counter(k['verdict'] for k in kept))
    print("by category:", Counter(k['category'] for k in kept))
    print("by mode:", Counter(k['mode'] for k in kept))
    if missing:
        print("MISSING VERDICTS:", missing[:10])

    with open(os.path.join(EX, "mcq-curated.json"), "w", encoding="utf-8") as f:
        json.dump(kept, f, ensure_ascii=False, indent=1)

if __name__ == "__main__":
    main()
