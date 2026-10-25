#!/usr/bin/env python3
"""Mine vocab pairs (fa/en) from the motesvete-ol booklets (g7/g8/g9). v2

Pairing core: dual-state machine — pendingFa (fa awaiting its en) AND
enBuffer (en awaiting its fa) — handles BOTH table column orders
(fa-then-en and en-then-fa) plus conversations (en,fa) and multi-run
lines ([fa][en][fa] two-column grids).

Outputs per booklet: mine.json / new.json / review.txt / rejects.txt
"""
import json
import os
import re

BASE = "/home/z/my-project"
EXTRACT = os.path.join(BASE, "booklet-extract")

BOOKLETS = {"g7": "g7.txt", "g8": "g8.txt", "g9": "g9.txt"}
MODE = "v2"
ORDINAL = r"(اول|دوم|سوم|چهارم|پنجم|ششم|هفتم|هشتم|نهم|دهم|یازدهم|دوازدهم)"
ORD_NUM = {"اول": 1, "دوم": 2, "سوم": 3, "چهارم": 4, "پنجم": 5, "ششم": 6,
           "هفتم": 7, "هشتم": 8, "نهم": 9, "دهم": 10, "یازدهم": 11, "دوازدهم": 12}

FA_LETTER = re.compile(r"[\u0621-\u064A\u0678-\u06EE\uFB50-\uFDFF\uFE70-\uFEFF]")
LATIN = re.compile(r"[A-Za-z]")

NOISE_SUBSTR = [
    "جزوه کامل زبان", "حسن لطفی", "دبیرستان", "تدریس زبان",
    "<<<PAGE", "ترجمه", "صفحه", "فهرست", "تالیف", "گردآوری", "موبایل",
    "تلگرام", "اینستا", "ویژگی های", "آموزش چگونگی", "پاسخ نامه",
    "نمونه سوا", "امتحانی", "گزینه صحیح", "پاسخ صحیح",
]
NOISE_FA_LINE = re.compile(r"^[\s\d.\u200f\u200e()،-]*$")
PAREN_HEADER = re.compile(r"[\(\)]\s*(معنی|کلمه)")

EN_RE = re.compile(r"^[A-Za-z][A-Za-z'’\-& .]*$")
FA_BAD_CHARS = re.compile(r"[؟!:;«»\[\]{}]")
SPEAKER_EN = re.compile(r"^[A-Z][a-z]+\s+[A-Z]")

# grammar-lesson prose markers in fa — kills "ضمیر مفعولی بعد از فعل می آید"-class junk
FA_PROSE = ("ضمیر", "فعل", "جمله", "حرف اضافه", "نکته", "کاربرد", "بکار",
            "سوالی", "فاعل", "مفعول", "صفت ملکی", "زمان", "گفتاری", "نوشته می",
            "استفاده", "می آید", "می شود", "می کنیم", "می گیریم", "به مثال",
            "توجه کنید", "ترتیبی", "پسوند", "پیشوند", "اضافه می", "دستوری",
            "گرامری", "کدام گزینه", "متفاوت است", "کامل کنید", "تصاویر",
            "بکارمی", "بکار می", "ناهماهنگ", "ناهماهنگ", "سواالت", "ترجمه")

# en phrases (≥3 words, capital start) that are legit booklet vocab
EN_PHRASE_OK = {
    "good morning", "good afternoon", "good evening", "good night",
    "nice to meet you", "you are welcome", "excuse me", "thank you",
    "how are you", "how old", "how old are you", "first name", "last name",
    "one by one", "each other", "here you are", "sit down", "stand up",
    "i m fine", "look at", "look like", "role play", "family tree",
    "be from", "be going to", "come back", "over there", "which one",
    "what time", "what s your address", "where do you live", "mobile cell",
    "x ray", "a m", "p m", "e mail", "w c", "t shirt", "bow tie",
    "sport shirt", "three piece suit", "mother in", "make a suggestion",
    "how about", "how about you", "i d like i would like", "ordinal numbers",
    "the corner of", "i see", "let s let us", "can t can not", "have has",
    "number no", "rice and kebab", "too many", "lots of", "feel hungry thirsty",
    "girl friend", "boy friend", "only child", "brother in law",
    "sister in law", "father in law", "step brother", "step mother",
    "step sister", "stepfather", "half brother", "half sister",
    "grand children", "grandchildren", "grandson", "granddaughter",
}

# lam-alef corruption fixes (word-level, verified) — applied to fa
FA_FIX = {
    "کالس": "کلاس", "کاال": "کالا", "ساالمتی": "سلامتی", "ساالد": "سالاد",
    "االن": "الان", "حاال": "حالا", "تاالر": "تالار", "باال": "بالا",
    "سواالت": "سوالات", "امال": "املا",
}


def strip_diacritics(s):
    return re.sub(r"[\u064B-\u0652\u0670]", "", s)


def fix_fa(s):
    s = re.sub(r"اال", "الا", s)
    out = []
    for tok in re.split(r"(\s+|،)", s):
        out.append(FA_FIX.get(tok, tok))
    return "".join(out)


def norm_en(s):
    s = s.replace("*", "").replace("\u200c", " ")
    s = re.sub(r"\s+", " ", s).strip().strip(".").strip()
    return s


def norm_key(s):
    return norm_en(s).lower().replace("’", "'").replace("‘", "'")


def segments(line):
    """Split a line into maximal script runs: list of (cls, text)."""
    runs = []
    cur_cls, cur = None, []
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
    # merge adjacent same-cls runs and drop empties
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
    if NOISE_FA_LINE.match(t):
        return True
    for sub in NOISE_SUBSTR:
        if sub in t:
            return True
    if PAREN_HEADER.search(t):
        return True
    return False


def en_ok(en):
    if not (2 <= len(en) <= 34):
        return False
    if not EN_RE.match(en):
        return False
    for bad in "?!:؛،":
        if bad in en:
            return False
    if "." in en and " " in en:
        return False
    if en.endswith(".") and len(en) > 4:
        return False
    if SPEAKER_EN.match(en):
        return False
    words = en.split(" ")
    if len(words) >= 3 and en[0].isupper() and norm_key(en) not in EN_PHRASE_OK:
        return False
    return True


def fa_ok(fa):
    if not (2 <= len(fa) <= 46):
        return False
    if FA_BAD_CHARS.search(fa):
        return False
    if "." in fa:
        return False
    if len(FA_LETTER.findall(fa)) < 2:
        return False
    for bad in FA_PROSE:
        if bad in fa:
            return False
    for bad in ("جزوه", "لطفی", "درس", "پایه", "مرور", "ویرایش", "تابستان"):
        if bad in fa:
            return False
    return True


def mine(path, mode="v2"):
    """Return (pairs dict lesson->[(en,fa)], rejects, orphan count)."""
    global MODE
    MODE = mode
    with open(path, encoding="utf-8") as f:
        lines = f.read().split("\n")
    lesson = 0
    pairs = {}
    rejects = []
    orphans = 0
    pending_fa = None   # fa awaiting its en
    en_buffer = None    # en awaiting its fa

    def emit(en, fa):
        en, fa = norm_en(en), fix_fa(strip_diacritics(fa)).strip()
        if not en_ok(en) or not fa_ok(fa):
            rejects.append((lesson, en, fa))
            return
        pairs.setdefault(lesson, []).append((en, fa))

    def take_fa(fa):
        nonlocal pending_fa
        fa = fa.strip(" ،")
        if not fa:
            return
        if pending_fa is None:
            pending_fa = fa
        elif MODE == "v1" or len(fa) <= 16:
            pending_fa = pending_fa + "، " + fa if MODE == "v2" else fa
        else:
            pending_fa = fa  # prose replace

    def take_en(en):
        nonlocal pending_fa, en_buffer, orphans
        if pending_fa is not None:
            emit(en, pending_fa)
            pending_fa = None
        elif en_buffer is None:
            if MODE == "v2":
                en_buffer = en  # hold — its fa probably follows
            else:
                orphans += 1
        else:
            orphans += 1
            en_buffer = en  # replace unpaired hold

    for line in lines:
        t = line.strip()
        if not t:
            continue
        m = re.search(r"درس\s+" + ORDINAL, t)
        if m:
            lesson = ORD_NUM[m.group(1)]
            pending_fa, en_buffer = None, None
            continue
        if "مرور واژگان قبل از درس" in t:
            lesson = 0
            pending_fa, en_buffer = None, None
            continue
        if is_noise(t):
            continue
        runs = [r for r in segments(t) if r[0] in ("fa", "en")]
        if MODE == "v1" and len(runs) > 2:
            rejects.append((lesson, " ".join(x for _, x in runs), "<multi-runs>"))
            continue
        for cls, txt in runs:
            if cls == "fa":
                if en_buffer is not None:
                    # en-first order: pair held en with this fa
                    emit(en_buffer, txt)
                    en_buffer = None
                else:
                    take_fa(txt)
            else:
                take_en(txt)
    return pairs, rejects, orphans


def parse_current_lesson_vocab(ts_path):
    ens = set()
    with open(ts_path, encoding="utf-8") as f:
        for line in f:
            m = re.match(r'\s*W\("([^"]+)"', line)
            if m:
                ens.add(norm_key(m.group(1)))
    return ens


def main():
    app_map = {"g7": 10, "g8": 11, "g9": 12}
    current = {
        10: parse_current_lesson_vocab(os.path.join(BASE, "src/data/lesson10.ts")),
        11: parse_current_lesson_vocab(os.path.join(BASE, "src/data/lesson11.ts")),
        12: parse_current_lesson_vocab(os.path.join(BASE, "src/data/lesson12.ts")),
    }
    report = []
    for key, fname in BOOKLETS.items():
        pairs2, rejects, orphans = mine(os.path.join(EXTRACT, fname), "v2")
        pairs1, _, _ = mine(os.path.join(EXTRACT, fname), "v1")
        pairs2.pop(0, None)  # lesson-0 = TOC/phonetics scaffolding
        pairs1.pop(0, None)
        lesson_no = app_map[key]

        def dedupe(pairs):
            seen = set()
            per = {}
            for les in sorted(pairs):
                for en, fa in pairs[les]:
                    k = norm_key(en)
                    if k in seen:
                        continue
                    seen.add(k)
                    per.setdefault(les, []).append({"en": en, "fa": fa})
            return per

        per_lesson, per1 = dedupe(pairs2), dedupe(pairs1)
        idx1 = {}
        for les in per1:
            for w in per1[les]:
                idx1.setdefault(norm_key(w["en"]), w["fa"])
        agree = 0
        for les in per_lesson:
            for w in per_lesson[les]:
                if idx1.get(norm_key(w["en"])) == w["fa"]:
                    agree += 1
        new_words = []
        exist = 0
        for les in sorted(per_lesson):
            for w in per_lesson[les]:
                if norm_key(w["en"]) in current[lesson_no]:
                    exist += 1
                else:
                    new_words.append({"lesson": les, **w})
        report.append(
            f"== {key} (app lesson {lesson_no}) ==\n"
            f"unique pairs: {sum(len(v) for v in per_lesson.values())} | "
            f"v1-agree: {agree} | v1-diff: {sum(len(v) for v in per_lesson.values()) - agree} | "
            f"matched: {exist} | NEW: {len(new_words)} | "
            f"rejects: {len(rejects)} | orphans: {orphans}\n"
        )
        with open(os.path.join(EXTRACT, f"{key}-disagree.txt"), "w", encoding="utf-8") as f:
            for les in sorted(per_lesson):
                for w in per_lesson[les]:
                    k = norm_key(w["en"])
                    if k not in idx1:
                        f.write(f"L{les}\t{w['en']}\t{w['fa']}\t<V2ONLY>\n")
                    elif idx1[k] != w["fa"]:
                        f.write(f"L{les}\t{w['en']}\t{w['fa']}\t<V1: {idx1[k]}>\n")
        with open(os.path.join(EXTRACT, f"{key}-mine.json"), "w", encoding="utf-8") as f:
            json.dump(per_lesson, f, ensure_ascii=False, indent=1)
        with open(os.path.join(EXTRACT, f"{key}-new.json"), "w", encoding="utf-8") as f:
            json.dump(new_words, f, ensure_ascii=False, indent=1)
        with open(os.path.join(EXTRACT, f"{key}-review.txt"), "w", encoding="utf-8") as f:
            for w in new_words:
                f.write(f"L{w['lesson']}\t{w['en']}\t{w['fa']}\n")
        with open(os.path.join(EXTRACT, f"{key}-rejects.txt"), "w", encoding="utf-8") as f:
            for les, en, fa in rejects[:800]:
                f.write(f"[{les}] {en} | {fa}\n")
    print("\n".join(report))


if __name__ == "__main__":
    main()
