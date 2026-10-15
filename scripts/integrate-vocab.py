#!/usr/bin/env python3
"""Integrate curated booklet vocab into lesson10/11/12.ts + lesson-meta.ts.

Appends words grouped by textbook lesson with Persian section comments,
updates vocabCount per lesson and TOTAL_VOCABULARY.
"""
import json
import os
import re

BASE = "/home/z/my-project"
EXTRACT = os.path.join(BASE, "booklet-extract")

GRADE_NAME = {"g7": "هفتم", "g8": "هشتم", "g9": "نهم"}
APP_LESSON = {"g7": 10, "g8": 11, "g9": 12}
ORDINAL_FA = {1: "اول", 2: "دوم", 3: "سوم", 4: "چهارم", 5: "پنجم",
              6: "ششم", 7: "هفتم", 8: "هشتم"}


def ts_escape(s):
    return s.replace("\\", "\\\\").replace('"', '\\"')


def build_block(booklet):
    with open(os.path.join(EXTRACT, f"{booklet}-curated.json"), encoding="utf-8") as f:
        words = json.load(f)
    lines = [
        "",
        f"  // ————— جزوهٔ پایهٔ {GRADE_NAME[booklet]} — استخراجِ دقیقِ کاملِ واژگان (راند ۲۰۹) —————",
    ]
    per_les = {}
    for w in words:
        per_les.setdefault(w["lesson"], []).append(w)
    n = 0
    for les in sorted(per_les):
        lines.append(f"  // جزوه، درس {ORDINAL_FA.get(les, les)}:")
        for w in per_les[les]:
            en = w["en"].replace("’", "'")
            lines.append(f'  W("{ts_escape(en)}", "{ts_escape(w["fa"])}"),')
            n += 1
    return "\n".join(lines), n


def integrate_lesson(booklet):
    path = os.path.join(BASE, f"src/data/lesson{APP_LESSON[booklet]}.ts")
    with open(path, encoding="utf-8") as f:
        src = f.read()
    m = re.search(r"(const vocabulary = \[\n)(.*?)(\n\s*\];)", src, re.S)
    if not m:
        raise SystemExit(f"vocab block not found in {path}")
    block, n = build_block(booklet)
    new_src = src[: m.start(3)] + block + "\n" + src[m.start(3):]
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_src)
    return n


def count_vocab(path):
    with open(path, encoding="utf-8") as f:
        return len(re.findall(r'^\s*W\("', f.read(), re.M))


def main():
    counts = {}
    for booklet in ("g7", "g8", "g9"):
        added = integrate_lesson(booklet)
        lesson_no = APP_LESSON[booklet]
        counts[lesson_no] = count_vocab(os.path.join(BASE, f"src/data/lesson{lesson_no}.ts"))
        print(f"lesson{lesson_no}: +{added} -> total vocab {counts[lesson_no]}")

    meta_path = os.path.join(BASE, "src/data/lesson-meta.ts")
    with open(meta_path, encoding="utf-8") as f:
        meta = f.read()

    def set_count(src, lesson_id, value):
        pat = re.compile(r"(id: %d,.*?vocabCount: )\d+" % lesson_id, re.S)
        return pat.sub(r"\g<1>%d" % value, src, count=1)

    for lesson_id, value in counts.items():
        meta = set_count(meta, lesson_id, value)

    total = 0
    for v in re.findall(r"vocabCount: (\d+)", meta):
        total += int(v)
    meta = re.sub(r"export const TOTAL_VOCABULARY = \d+;",
                  f"export const TOTAL_VOCABULARY = {total};", meta)
    with open(meta_path, "w", encoding="utf-8") as f:
        f.write(meta)
    print("TOTAL_VOCABULARY =", total)
    print("all vocabCount:", re.findall(r"vocabCount: (\d+)", meta))


if __name__ == "__main__":
    main()
