#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r212 — integrate the curated booklet MCQs into the lesson data files.

Dedupe: normalized-stem match against each lesson's EXISTING quizzes
(earlier rounds already landed some booklet questions) and within the
curated set. New entries get ids l{N}-bk{M} and are appended right before
the closing bracket of the `const quizzes = [...]` array.
"""
import json
import os
import re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EX = os.path.join(BASE, "booklet-extract")

def norm_stem(s):
    s = s.lower()
    s = re.sub(r"[-_―–—]+", " ", s)      # blank runs
    s = re.sub(r"[^a-z0-9 ]", "", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

def main():
    with open(os.path.join(EX, "mcq-curated.json"), encoding="utf-8") as f:
        curated = json.load(f)

    by_lesson = {}
    for q in curated:
        by_lesson.setdefault(q["lesson"], []).append(q)

    total_new = 0
    total_dup = 0
    for lesson in sorted(by_lesson):
        path = os.path.join(BASE, "src", "data", f"lesson{lesson}.ts")
        with open(path, encoding="utf-8") as f:
            src = f.read()

        # existing stems for dedupe
        m = re.search(r"const quizzes = \[(.*?)\n\];", src, re.S)
        if not m:
            print(f"lesson{lesson}: quizzes array not found!")
            continue
        body = m.group(1)
        existing = set()
        for qm in re.finditer(r"Q\(\"[^\"]+\",\s*\"[^\"]+\",\s*\"(.*?)\",\s*\[", body, re.S):
            existing.add(norm_stem(qm.group(1)))

        new_rows = []
        seen_local = set()
        for q in by_lesson[lesson]:
            ns = norm_stem(q["question"])
            if ns in existing or ns in seen_local:
                total_dup += 1
                continue
            seen_local.add(ns)
            qid = f"l{lesson}-bk{len(new_rows) + 1}"
            opts = ", ".join(json.dumps(o, ensure_ascii=False) for o in q["options"])
            row = (f'  Q("{qid}", "{q["category"]}", {json.dumps(q["question"], ensure_ascii=False)}, '
                   f"[{opts}], {q['answer']}),")
            new_rows.append(row)

        if not new_rows:
            print(f"lesson{lesson}: nothing new")
            continue

        anchor = body.rstrip()
        if anchor.endswith(","):
            anchor = anchor[:-1].rstrip()
        new_body = anchor + ",\n\n  // ---------------- واژگان/گرامر استاندارد و کنکوری جزوهٔ جامع (راند ۲۱۲) ----------------\n" + \
            "\n".join(new_rows) + "\n  "
        src = src[:m.start(1)] + new_body + src[m.end(1) - 1:]

        with open(path, "w", encoding="utf-8") as f:
            f.write(src)
        total_new += len(new_rows)
        print(f"lesson{lesson}: +{len(new_rows)} (dupes skipped: "
              f"{len(by_lesson[lesson]) - len(new_rows)})")

    print(f"TOTAL new={total_new} dupes={total_dup}")

if __name__ == "__main__":
    main()
