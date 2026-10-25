#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r213 — integrate the curated hand-solved MCQs into the lesson data files.

Continues the r212 `l{N}-bk{M}` id numbering (no restart), appends a new
section block before the closing bracket of `const quizzes`, re-dedupes by
normalized stem as defence in depth, and rebuilds the count pins in
lesson-meta.ts honestly (quizCount per lesson 1-9, LESSON_QUIZ_COUNT,
TOTAL_QUESTIONS).
"""
import json
import os
import re
from collections import Counter

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EX = os.path.join(BASE, "booklet-extract")
SRC = os.path.join(BASE, "src", "data")


def norm_stem(s):
    s = s.lower()
    s = re.sub(r"[-_―–—]+", " ", s)
    s = re.sub(r"[^a-z0-9 ]", "", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def main():
    curated = json.load(open(os.path.join(EX, "mcq-r213-curated.json"),
                             encoding="utf-8"))
    by_lesson = {}
    for q in curated:
        by_lesson.setdefault(q["lesson"], []).append(q)

    total_new, total_dup = 0, 0
    new_counts = {}
    for lesson in sorted(by_lesson):
        path = os.path.join(SRC, f"lesson{lesson}.ts")
        with open(path, encoding="utf-8") as f:
            src = f.read()

        m = re.search(r"const quizzes = \[(.*?)\n\];", src, re.S)
        if not m:
            print(f"lesson{lesson}: quizzes array not found!")
            continue
        body = m.group(1)

        existing = set()
        max_bk = 0
        for qm in re.finditer(r"Q\(\"l%d-bk(\d+)\"" % lesson, body):
            max_bk = max(max_bk, int(qm.group(1)))
        for qm in re.finditer(r"Q\(\"[^\"]+\",\s*\"[^\"]+\",\s*\"(.*?)\",\s*\[",
                              body, re.S):
            existing.add(norm_stem(qm.group(1)))

        new_rows = []
        seen_local = set()
        for q in by_lesson[lesson]:
            ns = norm_stem(q["question"])
            if ns in existing or ns in seen_local:
                total_dup += 1
                continue
            seen_local.add(ns)
            max_bk += 1
            qid = f"l{lesson}-bk{max_bk}"
            opts = ", ".join(json.dumps(o, ensure_ascii=False)
                             for o in q["options"])
            new_rows.append(
                f'  Q("{qid}", "{q["category"]}", '
                f'{json.dumps(q["question"], ensure_ascii=False)}, '
                f"[{opts}], {q['answer']}),"
            )

        if not new_rows:
            print(f"lesson{lesson}: nothing new")
            new_counts[lesson] = 0
            continue

        anchor = body.rstrip()
        if anchor.endswith(","):
            anchor = anchor[:-1].rstrip()
        new_body = (anchor + ",\n\n"
                    "  // ---------------- رسوبِ نجات‌یافتهٔ تست‌های جزوهٔ جامع — حلِ دستیِ کلِ ردیف‌به‌ردیف (راند ۲۱۳) ----------------\n"
                    + "\n".join(new_rows) + "\n  ")
        src = src[:m.start(1)] + new_body + src[m.end(1) - 1:]

        with open(path, "w", encoding="utf-8") as f:
            f.write(src)
        total_new += len(new_rows)
        new_counts[lesson] = len(new_rows)
        print(f"lesson{lesson}: +{len(new_rows)} "
              f"(dupes skipped: {len(by_lesson[lesson]) - len(new_rows)}, "
              f"ids to l{lesson}-bk{max_bk})")

    print(f"TOTAL new={total_new} dupes={total_dup}")

    # ---- rebuild lesson-meta.ts pins honestly
    meta_path = os.path.join(SRC, "lesson-meta.ts")
    meta = open(meta_path, encoding="utf-8").read()
    # current quizCount per lesson id (order in file)
    ids = re.findall(r"id: (\d+),", meta)
    cur = {}
    block_iter = re.finditer(r"id: (\d+),(.*?)quizCount: (\d+),", meta, re.S)
    for bm in block_iter:
        cur[int(bm.group(1))] = int(bm.group(3))

    def rebuild(mm):
        lid = int(mm.group(1))
        if lid in new_counts:
            return mm.group(0).replace(
                f"quizCount: {cur[lid]},", f"quizCount: {cur[lid] + new_counts[lid]},")
        return mm.group(0)

    meta2 = re.sub(r"id: (\d+),(.*?)quizCount: (\d+),",
                   lambda mm: rebuild(mm), meta, flags=re.S)

    total_lesson = sum(
        (cur.get(i, 0) + new_counts.get(i, 0)) for i in range(1, 13))
    exam_bank = re.search(r"EXAM_BANK_SIZE = (\d+);", meta2)
    exam_n = int(exam_bank.group(1))
    meta2 = re.sub(r"export const LESSON_QUIZ_COUNT = \d+;",
                   f"export const LESSON_QUIZ_COUNT = {total_lesson};", meta2)
    meta2 = re.sub(r"export const TOTAL_QUESTIONS = LESSON_QUIZ_COUNT \+ EXAM_BANK_SIZE; // \d+",
                   f"export const TOTAL_QUESTIONS = LESSON_QUIZ_COUNT + EXAM_BANK_SIZE; // {total_lesson + exam_n}",
                   meta2)
    with open(meta_path, "w", encoding="utf-8") as f:
        f.write(meta2)
    print("quizCount updates:", {k: f"{cur[k]}->{cur[k]+v}" for k, v in new_counts.items()})
    print(f"LESSON_QUIZ_COUNT -> {total_lesson}; TOTAL_QUESTIONS -> {total_lesson + exam_n}")


if __name__ == "__main__":
    main()
