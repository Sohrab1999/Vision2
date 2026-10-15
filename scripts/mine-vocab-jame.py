#!/usr/bin/env python3
"""Mine vocab tables from the جامه booklets (g10/g11/g12) — round 210.

Run-stream parser: booklet lines are concatenated into a sequence of
script-runs (en/fa); rows pair as en→fa with paren-absorption for embedded
Latin («(جمع آن: feet)»). Section tagging via corrupted-header watermarks
(«م تشه»=هشتم، «م نه»=نهم، «ه ده م»=دهم). Gold coverage is measured against
the app's existing lesson vocabulary (W("en","fa") lines) so the integrator
can honestly separate gold-backed rows from review-needed rows.

Outputs per booklet (booklet-extract/):
  jame{N}-mine.json    sections with rows {en, fa, raw, target}
  jame{N}-review.txt   rows whose en has no gold fa (glyph-soup candidates)
  jame{N}-rejects.txt  unparseable/filtered rows
"""
import json
import os
import re
import sys

BASE = "/home/z/my-project"
EXTRACT = os.path.join(BASE, "booklet-extract")

BOOKLETS = {"g10": "g10.txt", "g11": "g11.txt", "g12": "g12.txt"}

# app-lesson targets per (grade, booklet-lesson)
def target_of(grade, lesson):
    if grade == 7:
        return 10
    if grade == 8:
        return 11
    if grade == 9:
        return 12
    if grade == 10:          # جامع دهم — Vision 1 (lessons 1-4)
        return 6 + lesson if lesson <= 3 else 9   # درس چهارم = تکمیلی → L9
    if grade == 11:          # Vision 2
        return lesson
    if grade == 12:          # Vision 3
        return 3 + lesson
    return 0

FA_LETTER = re.compile(r"[\u0621-\u064A\u0678-\u06EE\uFB50-\uFDFF\uFE70-\uFEFF]")
LATIN = re.compile(r"[A-Za-z]")

EN_RE = re.compile(r"^[A-Za-z][A-Za-z'’\-& .()/]*$")
FA_BAD_CHARS = re.compile(r"[؟!:;«»\[\]{}]")

# ---- noise ---------------------------------------------------------------
NOISE_SUBSTR = [
    "جزوه جام", "تألیف", "تاليف", "گردآوری", "گردآور", "Telegram", "telegram",
    "<<<PAGE", "Vision One", "Vision Two", "Vision Three", "Vision2", "Vision 3",
    "سوره", "آیه", "تأليف", "کارشناسی ارشد", "همکاران",
]
DOTLINE = re.compile(r"^-{3,}")

# section markers that END a vocab table
SECTION_END = re.compile(
    r"ترجمه|آزمون|تست|گرامر|نگارش|پاسخنامه|مکالمه|ریدینگ|دستگریم|آهنگ|جمع بندی|"
    r"جمع‌بندی|درسنامه|نکته|فهرست|مقدمه|روش استفاده|گام|تمرین در کلاس"
)

# grade watermarks (corruption-tolerant, ordered by specificity)
GRADE_PATTERNS = [
    (12, re.compile(r"دوازدهم|دو ازدهم|دوازده")),
    (11, re.compile(r"یازدهم|یازده")),
    (10, re.compile(r"دهم|ه ده|پایه ده")),
    (8, re.compile(r"هشتم|تشه|م تشه")),
    (9, re.compile(r"نهم|م نه")),
    (7, re.compile(r"هفتم|هفت م|هفت")),
]
LESSON_PATTERNS = [
    (4, re.compile(r"درس\s*چهار")),
    (3, re.compile(r"درس\s*(س|سه|سوم)")),
    (2, re.compile(r"درس\s*دو")),
    (1, re.compile(r"درس\s*(ی\b|ی |یک|اول)")),
]
PROSPECT = {"One": 1, "Two": 2, "Three": 3}

FA_FIX = {
    "کالس": "کلاس", "ساالمتی": "سلامتی", "ساالد": "سالاد", "االن": "الان",
    "حاال": "حالا", "تاالر": "تالار", "باال": "بالا", "سواالت": "سوالات",
    "امال": "املا", "عالقه": "علاقه", "مساول": "مسئول", "کالن": "کلان",
}

EN_FIX = {"Capitan": "Captain", "intersting": "interesting"}


def strip_diacritics(s):
    return re.sub(r"[\u064B-\u0652\u0670]", "", s)


def fix_fa(s):
    s = re.sub(r"اال", "الا", s)
    return " ".join(FA_FIX.get(t, t) for t in re.split(r"(\s+|،)", s) if t).replace(
        " ،", "،"
    ).strip()


def norm_en(s):
    s = s.replace("*", "").replace("\u200c", " ")
    s = re.sub(r"\s+", " ", s).strip().strip(".").strip()
    s = re.sub(r"\(\s*\)", "", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def norm_key(s):
    k = norm_en(s).lower().replace("’", "'").replace("‘", "'")
    return re.sub(r"[()\s]+", " ", k).strip()


def segments(line):
    """Split a line into maximal script runs: list of (cls, text)."""
    runs, cur_cls, cur = [], None, []
    for ch in line:
        if FA_LETTER.match(ch) or ch in "،؟":
            c = "fa"
        elif LATIN.match(ch):
            c = "en"
        else:
            c = "neutral"
        if c == "neutral":
            if cur_cls is not None and cur:
                cur.append(ch)
            continue
        if c != cur_cls:
            if cur:
                runs.append((cur_cls, "".join(cur).strip()))
            cur_cls, cur = c, [ch]
        else:
            cur.append(ch)
    if cur:
        runs.append((cur_cls, "".join(cur).strip()))
    merged = []
    for cls, txt in runs:
        if not txt:
            continue
        if merged and merged[-1][0] == cls:
            merged[-1] = (cls, merged[-1][1] + " " + txt)
        else:
            merged.append((cls, txt))
    return merged


def is_noise(line):
    t = line.strip()
    if not t:
        return True
    if DOTLINE.match(t):
        return True
    if re.match(r"^[\s\d.\u200f\u200e()،-]*$", t):
        return True
    for sub in NOISE_SUBSTR:
        if sub in t:
            return True
    return False


def en_ok(en):
    if not (2 <= len(en) <= 40):
        return False
    if not EN_RE.match(en):
        return False
    for bad in "?!:؛،":
        if bad in en:
            return False
    if en.lower() in ("words", "persian meanings", "word", "meaning", "meanings"):
        return False
    words = en.split(" ")
    if len(words) >= 4 and en[0].isupper():
        return False  # titles/prose
    return True


def fa_ok(fa):
    if not (2 <= len(fa) <= 60):
        return False
    if FA_BAD_CHARS.search(fa):
        return False
    if len(FA_LETTER.findall(fa)) < 2:
        return False
    for bad in ("جزوه", "لطفی", "درسنامه", "پایه", "مرور", "ویرایش", "ترجمه",
                "تست", "آزمون", "گرامر", "نگارش", "گام", "سرفصل", "صفحه",
                "کانال", "تلگرام"):
        if bad in fa:
            return False
    return True


def parse_table(stream, stats):
    """Pair an en/fa run stream into rows, with paren-absorption."""
    rows, anomalies = [], []
    i, n = 0, len(stream)
    while i < n:
        cls, txt = stream[i]
        if cls == "fa":
            # leading fa — fa-first order: hold it, next en completes the row
            j = i + 1
            while j < n and stream[j][0] == "fa":
                txt += " " + stream[j][1]
                j += 1
            if j < n and stream[j][0] == "en":
                rows.append((stream[j][1], txt))
                stats["fa-first"] += 1
                i = j + 1
            else:
                anomalies.append(("orphan-fa", txt))
                stats["orphan-fa"] += 1
                i = j
            continue
        # en run
        en = txt
        j = i + 1
        fa_parts = []
        depth = 0
        while j < n and stream[j][0] == "fa":
            part = stream[j][1]
            fa_parts.append(part)
            depth += part.count("(") - part.count(")")
            j += 1
        # absorb embedded Latin inside an open parenthesis — e.g. (جمع آن: feet)
        while j < n and stream[j][0] == "en" and depth > 0:
            part = stream[j][1]
            fa_parts.append(part)
            depth += part.count("(") - part.count(")")
            j += 1
            while j < n and stream[j][0] == "fa":
                part2 = stream[j][1]
                fa_parts.append(part2)
                depth += part2.count("(") - part2.count(")")
                j += 1
        if fa_parts:
            rows.append((en, " ".join(fa_parts)))
        else:
            anomalies.append(("orphan-en", en))
            stats["orphan-en"] += 1
        i = j
    return rows, anomalies


def load_gold():
    """en_key → list of (fa, lesson_id) from the app's lesson data."""
    gold = {}
    for lid in range(1, 13):
        path = os.path.join(BASE, f"src/data/lesson{lid}.ts")
        with open(path, encoding="utf-8") as f:
            for line in f:
                m = re.match(r'\s*W\("([^"]+)",\s*"([^"]+)"', line)
                if m:
                    k = norm_key(m.group(1))
                    gold.setdefault(k, []).append((m.group(2), lid))
    return gold


def mine(path):
    with open(path, encoding="utf-8") as f:
        lines = f.read().split("\n")
    # keep a rolling window of recent content lines for section lookback
    window = []            # collapsed content lines (non-noise)
    sections = []          # ordered dicts: {grade, lesson, prospect}
    current = {"grade": 0, "lesson": 0, "prospect": 0}
    in_table = False
    stream = []
    pending_meanings = 0   # lines of grace after a bare «Persian Meanings»
    stats = {"tables": 0, "orphan-en": 0, "orphan-fa": 0, "fa-first": 0}
    all_anomalies = []

    def lookback_grade():
        text = " ".join(window[-14:])
        for g, pat in GRADE_PATTERNS:
            if pat.search(text):
                return g
        return current["grade"]

    def lookback_lesson():
        text = " ".join(window[-14:])
        for l, pat in LESSON_PATTERNS:
            if pat.search(text):
                return l
        return current["lesson"]

    def start_table():
        nonlocal in_table, stream
        in_table = True
        stream = []
        stats["tables"] += 1
        g = lookback_grade()
        l = lookback_lesson()
        if g != current["grade"] or l != current["lesson"]:
            current["grade"], current["lesson"] = g, l

    def end_table():
        nonlocal in_table
        in_table = False
        if stream:
            rows, anomalies = parse_table(stream, stats)
            all_anomalies.extend(anomalies)
            prospect = current["prospect"]
            grade = current["grade"]
            lesson = current["lesson"]
            if grade and len(rows) >= 4:
                sections.append(
                    {
                        "grade": grade,
                        "lesson": lesson,
                        "prospect": prospect,
                        "target": target_of(grade, lesson),
                        "rows": rows,
                    }
                )
            stream.clear()

    for idx, line in enumerate(lines):
        t = line.strip()
        if is_noise(t):
            continue
        # detect table start: a bare «Words» line near «Persian Meanings»
        segs = segments(t)
        texts = [x.strip("“”\"") for _, x in segs]
        flat = " ".join(texts).strip()
        bare_meanings = flat == "Persian Meanings"
        bare_words = flat == "Words"
        if bare_meanings:
            pending_meanings = 6
            continue
        if bare_words and pending_meanings > 0:
            end_table()
            start_table()
            pending_meanings = 0
            continue
        if pending_meanings > 0:
            pending_meanings -= 1
        if in_table:
            # end markers
            if SECTION_END.search(t):
                end_table()
                window.append(re.sub(r"\s+", " ", t))
                continue
            if bare_words or bare_meanings:
                end_table()
                start_table()
                pending_meanings = 0
                continue
            m = re.search(r"Prospect\s+(One|Two|Three)", t)
            if m:
                current["prospect"] = PROSPECT[m.group(1)]
                end_table()      # prospect switch = new key-word table
                start_table()
                continue
            # vocab content line
            runs = [r for r in segments(t) if r[0] in ("fa", "en")]
            stream.extend(runs)
        else:
            window.append(re.sub(r"\s+", " ", t))
    end_table()
    return sections, all_anomalies, stats


def main():
    gold = load_gold()
    print(f"gold lexicon: {len(gold)} en-keys from lessons 1-12")
    for key, fname in BOOKLETS.items():
        sections, anomalies, stats = mine(os.path.join(EXTRACT, fname))
        out_rows, review, rejects = [], [], []
        seen = set()
        for sec in sections:
            sec_rows = []
            for en, fa in sec["rows"]:
                en_n = norm_en(en)
                if EN_FIX.get(en_n):
                    en_n = EN_FIX[en_n]
                fa_c = fix_fa(strip_diacritics(fa)).strip()
                fa_c = re.sub(r"\s+", " ", fa_c)
                if not en_ok(en_n) or not fa_ok(fa_c):
                    rejects.append((sec["grade"], sec["lesson"], en_n, fa_c))
                    continue
                k = norm_key(en_n)
                if not k:
                    continue
                dup = k in seen
                g = gold.get(k)
                row = {
                    "en": en_n,
                    "fa": fa_c,
                    "raw": fa,
                    "dup": dup,
                    "gold": (g[0][0] if g else None),
                    "goldLesson": (g[0][1] if g else None),
                }
                sec_rows.append(row)
                if not dup:
                    seen.add(k)
                if g is None:
                    review.append(
                        (sec["grade"], sec["lesson"], en_n, fa_c)
                    )
            out_rows.append(
                {
                    "grade": sec["grade"],
                    "lesson": sec["lesson"],
                    "prospect": sec["prospect"],
                    "target": sec["target"],
                    "rows": sec_rows,
                }
            )
        total = sum(len(s["rows"]) for s in out_rows)
        gold_hits = sum(1 for s in out_rows for r in s["rows"] if r["gold"])
        dups = sum(1 for s in out_rows for r in s["rows"] if r["dup"])
        by_target = {}
        for s in out_rows:
            fresh = [r for r in s["rows"] if not r["dup"]]
            tg = s["target"]
            by_target.setdefault(tg, 0)
            by_target[tg] += len(fresh)
        print(
            f"== {key} == tables={stats['tables']} rows={total} "
            f"gold={gold_hits} dup={dups} fresh={total - dups} "
            f"rejects={len(rejects)} orphan-en={stats['orphan-en']} "
            f"orphan-fa={stats['orphan-fa']} fa-first={stats['fa-first']}"
        )
        print("   fresh per target lesson:", dict(sorted(by_target.items())))
        with open(os.path.join(EXTRACT, f"jame{key[1:]}-mine.json"), "w", encoding="utf-8") as f:
            json.dump(out_rows, f, ensure_ascii=False, indent=1)
        with open(os.path.join(EXTRACT, f"jame{key[1:]}-review.txt"), "w", encoding="utf-8") as f:
            for g, l, en, fa in review:
                f.write(f"G{g}L{l}\t{en}\t{fa}\n")
        with open(os.path.join(EXTRACT, f"jame{key[1:]}-rejects.txt"), "w", encoding="utf-8") as f:
            for g, l, en, fa in rejects[:1500]:
                f.write(f"[G{g}L{l}] {en} | {fa}\n")


if __name__ == "__main__":
    main()
