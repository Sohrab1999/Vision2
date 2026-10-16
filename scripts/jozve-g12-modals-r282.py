#!/usr/bin/env python3
r"""jozve-g12-modals-r282.py — بانک‌های سه‌گانهٔ افعال ناقص/مجهول دوازدهم (۸۰ تست)

خانوادهٔ A (۲۰ تست، ص۱۴۹، سطح متوسط): «کاربردهای افعال ناقص» — کلید گرید چاپی
  «پاسخنامه 20تست :کاربردهای افعال ناقص» (c15/sec23 خط ۲۰-۲۶).
خانوادهٔ B (۲۰ تست، ص۱۵۰، سطح کنکوری): «جملات معلوم و مجهول» — کلید گرید چاپی
  «پاسخنامه 20تست گرامر جملات معلوم و مجهول» (c15/sec23 خط ۲۸-۳۴).
خانوادهٔ C (۴۰ تست، ص۱۵۱-۱۵۲، سطح استاندارد و کنکوری): «افعال ناقص در ساختارهای
  زمان گذشته (زبان تخصصی)» — کلید گرید چاپی «پاسخنامه تستهای افعال ناقص»
  (c15/sec23 خط ۳۶-۴۳) — ردیف‌های «6a» بدون فاصله با تحمل \s* خوانده می‌شوند.

واگرایی کلید چاپی (داوری r269): C-Q10 گرید «b» چاپیده ولی طراحیِ خود سؤال
  (پسیو + استنتاج) و ادبیات کلاسیک کنکور «must have been painted» را می‌خواهد؛
  b = انتظارِ برآورده‌نشده که با «چه نقاشی قشنگی!» نمی‌سازد → override رسیددار به c.
خروجی: الحاق درس‌های ۵/۶/۷ به public/jozve/grammar-g12-topic.json (خانوادهٔ موضوعی r280/r281).
"""
import json
import re

ROOT = "/home/z/my-project"
TXT = f"{ROOT}/booklet-extract/g12.txt"
G12 = f"{ROOT}/public/jozve/g12.json"
OUT = f"{ROOT}/public/jozve/grammar-g12-topic.json"

BLANK = "-" * 15
PERSIAN = re.compile(r"[\u0600-\u06FF]")

raw = open(TXT, encoding="utf-8").read()
pages = {}
for m in re.finditer(r"<<<PAGE (\d+)>>>\n", raw):
    start = m.end()
    nxt = re.search(r"<<<PAGE \d+>>>\n", raw[start:])
    end = start + nxt.start() if nxt else len(raw)
    pages[int(m.group(1))] = raw[start:end]

SKIP = re.compile(
    r"^\s*(\d+\s*"
    r"|\"?جزوه\s*"
    r"|جام ــع.*|جامع.*"
    r"|زبان انگل.*"
    r"|پایه دو ازدهم.*|پایه دوازدهم.*"
    r"|“Vision Three”.*|\"Vision Three\".*"
    r"|تألیـــف.*|تألیف.*"
    r"|\"جمـــــال.*|جمال احمدی.*|همکاران\"?.*"
    r")\s*$"
)

def body(p):
    return [l.strip() for l in pages[p].split("\n") if l.strip() and not SKIP.match(l.strip())]

OPT_MARK = re.compile(r"(?:^|\s)([a-d])\.\s+")

def parse_stream(lines, expect_n, stop_after):
    """ماشین r281 — شماره‌یابِ «انتظارِ عددِ بعدی» (نقطهٔ جافتاده را هم می‌پوشاند)
    + جمع ساقهٔ چندخطی + گزینه‌های تک‌خطی/دولاینی/چهارخطی."""
    questions = {}
    cur = None
    next_n = 1
    i = 0
    while i < len(lines) and len(questions) < stop_after:
        ln = lines[i]
        i += 1
        ms = re.match(r"^(\d{1,3})\s*\.?\s+(.+)$", ln)
        if ms and int(ms.group(1)) == next_n and not PERSIAN.match(ms.group(2)):
            if cur:
                raise SystemExit(f"Q{cur['n']} hit stem {ms.group(1)} unfinished")
            cur = {"n": next_n, "stem": ms.group(2), "optfrags": []}
            next_n += 1
            continue
        if cur is not None:
            first = OPT_MARK.search(ln)
            starts_opt = re.match(r"^[a-d]\.\s+", ln) or (first and first.start() <= 8)
            if starts_opt:
                cur["optfrags"].append(ln)
                joined = " ".join(cur["optfrags"])
                letters = set(re.findall(r"(?:^|\s)([a-d])\.\s+", joined))
                if len(letters) == 4:
                    if cur["n"] in questions:
                        raise SystemExit(f"DUPLICATE n={cur['n']}")
                    questions[cur["n"]] = cur
                    cur = None
                continue
            if not cur["optfrags"]:
                cur["stem"] += " " + ln
                continue
            raise SystemExit(f"unexpected line while options of Q{cur['n']}: {ln[:80]!r}")
    if len(questions) != expect_n:
        raise SystemExit(f"expected {expect_n} questions, got {len(questions)}: {sorted(questions)}")
    return questions

def polish(questions):
    r"""درس r280: \S خط‌تیره را نمی‌گیرد. درس جدید r282: خالیِ چندتکهٔ مجاور
    («----- ---- ----------» ص۱۵۱ Q2) قبل از BLANK_RUN به خالیِ واحد ادغام می‌شود؛
    خالی‌های واقعیِ جداشده با کلمه (دوخالیِ ص۱۵۰ Q9) دست‌نخورده می‌مانند."""
    HYPHEN_JOIN = re.compile(r"(\w)- ([a-z])")
    MERGE_BLANKS = re.compile(r"-{3,}(?:\s+-{3,})+")
    BLANK_RUN = re.compile(r"-{4,}")
    GLUE_BEFORE = re.compile(r"([^\s-])(-{4,})")
    GLUE_AFTER = re.compile(r"(-{4,})(?=[A-Za-z(])")
    for n, q in questions.items():
        s = HYPHEN_JOIN.sub(r"\1-\2", q["stem"])
        s = MERGE_BLANKS.sub(BLANK, s)
        s = BLANK_RUN.sub(BLANK, s)
        s = GLUE_BEFORE.sub(lambda m: m.group(1) + " " + BLANK, s)
        s = GLUE_AFTER.sub(lambda m: BLANK + " ", s)
        s = re.sub(r"\s{2,}", " ", s).strip()
        if re.search(r"-{3,}(?:\s+-{3,})+", s):
            raise SystemExit(f"Q{n}: unmerged adjacent blank pieces: {s!r}")
        joined = re.sub(r"\s{2,}", " ", " ".join(q["optfrags"])).strip()
        parts = re.split(r"(?:^|\s)([a-d])\.\s+", joined)
        opts = {}
        for j in range(1, len(parts) - 1, 2):
            if parts[j] in opts:
                raise SystemExit(f"Q{n}: repeated letter {parts[j]}")
            opts[parts[j]] = parts[j + 1].strip()
        if sorted(opts) != ["a", "b", "c", "d"]:
            raise SystemExit(f"Q{n}: options incomplete {sorted(opts)}")
        q["question"] = s
        q["options"] = [re.sub(r"\s{2,}", " ", opts[c]).strip() for c in "abcd"]
        del q["optfrags"], q["stem"]

# ---------------- سه گذرِ سؤال‌ها ----------------
partA = parse_stream(body(149), expect_n=20, stop_after=20)
partB = parse_stream(body(150), expect_n=20, stop_after=20)
partC = parse_stream(body(151) + body(152), expect_n=40, stop_after=40)
polish(partA)
polish(partB)
polish(partC)

# ---------------- کلیدها از سه گرید c15/sec23 ----------------
g12 = json.load(open(G12))
sec23 = g12["chapters"][14]["sections"][23]["lines"]

# تحمل «6a» بدون فاصله (گرید C) — درسِ ارقامِ مخلوط r279 در خانوادهٔ بزرگ‌تر
GRID_PAIR = re.compile(r"(?<![\w])(\d{1,3})\s*([a-d])(?=[\s,]|$)")

def grid_slice(start_pat, end_pats):
    """برشِ گرید: از لنگر تا نخستین نشانگرِ پایان (پاسخنامهٔ بعدی / Note / فهرستِ عدد‌نقطه‌دار)."""
    ai = next(i for i, l in enumerate(sec23) if re.search(start_pat, l))
    out = []
    for l in sec23[ai + 1:]:
        if any(re.search(p, l) for p in end_pats):
            break
        out.append(l)
    return out

pairsA = grid_slice(r"کاربردهای افعال ناقص", [r"پاسخنامه"])
pairsB = grid_slice(r"معلوم و مجهول", [r"پاسخنامه"])
pairsC = grid_slice(r"پاسخنامه تستهای افعال ناقص", [r"^\d{1,3}\s*\.\s", r"پاسخنامه", r"Note\s*:"])

def read_grid(pairs_lines, lo, hi, tag):
    keys = {}
    for l in pairs_lines:
        for num, letter in GRID_PAIR.findall(l):
            keys.setdefault(int(num), letter)
    missing = [n for n in range(lo, hi + 1) if n not in keys]
    extra = [n for n in keys if not lo <= n <= hi]
    if missing or extra:
        raise SystemExit(f"{tag} keys missing={missing} extra={extra}")
    return keys

keysA = read_grid(pairsA, 1, 20, "A")
keysB = read_grid(pairsB, 1, 20, "B")
keysC = read_grid(pairsC, 1, 40, "C")

# ---------------- داوری r269: override رسیددارِ کلیدِ چاپیِ ناقص ----------------
ANSWER_OVERRIDES = {
    ("C", 10): {
        "grid": "b", "applied": "c",
        "reason": "داوری r269: گرید چاپی b=«should have been painted» (انتظارِ برآورده‌نشده/انتقاد) "
                  "با تعجبِ مثبتِ «What a beautiful painting!» نمی‌سازد؛ طراحیِ خود سؤال "
                  "(پسیو + استنتاج) و الگوی کلاسیک کنکور c=«must have been painted» است — "
                  "الگوی دقیق override راند ۲۷۹ (vocab Q236).",
    },
}
for (fam, n), ov in ANSWER_OVERRIDES.items():
    keys = {"A": keysA, "B": keysB, "C": keysC}[fam]
    if keys[n] != ov["grid"]:
        raise SystemExit(f"override {(fam, n)} expected grid={ov['grid']}, found {keys[n]}")
    keys[n] = ov["applied"]

# ---------------- قفل‌های معنایی (داوری r269) ----------------
SPOT_A = {1: "d", 5: "c", 9: "c", 11: "b", 19: "d", 20: "b"}
SPOT_B = {1: "c", 3: "b", 5: "c", 8: "d", 19: "b", 20: "a"}
SPOT_C = {1: "c", 5: "b", 10: "c", 21: "a", 27: "b", 33: "b", 40: "d"}
bad = [("A", n, keysA[n], w) for n, w in SPOT_A.items() if keysA[n] != w]
bad += [("B", n, keysB[n], w) for n, w in SPOT_B.items() if keysB[n] != w]
bad += [("C", n, keysC[n], w) for n, w in SPOT_C.items() if keysC[n] != w]
if bad:
    raise SystemExit(f"spot-lock mismatch: {bad}")

# ---------------- ساخت سؤال‌ها ----------------
def mkq(pid, part, keys, n):
    q = part[n]
    letter = keys[n]
    if PERSIAN.search(q["question"]) or any(PERSIAN.search(o) for o in q["options"]):
        raise SystemExit(f"{pid}-Q{n}: Persian leakage")
    if len(set(q["options"])) != 4:
        raise SystemExit(f"{pid}-Q{n}: duplicate options")
    if BLANK not in q["question"]:
        raise SystemExit(f"{pid}-Q{n}: no blank: {q['question'][:70]!r}")
    return {
        "id": f"{pid}-{n}",
        "n": n,
        "category": "grammar",
        "question": q["question"],
        "options": q["options"],
        "answer": "abcd".index(letter),
    }

lesson5 = [mkq("g12-modal1", partA, keysA, n) for n in range(1, 21)]
lesson6 = [mkq("g12-passive", partB, keysB, n) for n in range(1, 21)]
lesson7 = [mkq("g12-modal2", partC, keysC, n) for n in range(1, 41)]

# دوخالی‌های شناخته‌شده (گارد تست)
dbl = {"A": [n for n, q in partA.items() if q["question"].count(BLANK) > 1],
       "B": [n for n, q in partB.items() if q["question"].count(BLANK) > 1],
       "C": [n for n, q in partC.items() if q["question"].count(BLANK) > 1]}

# ---------------- الحاق به بانک موضوعی ----------------
bank = json.load(open(OUT, encoding="utf-8"))
if any(l["lesson"] in (5, 6, 7) for l in bank["lessons"]):
    raise SystemExit("lessons 5/6/7 already present — re-run would duplicate")

bank["lessons"] += [
    {
        "lesson": 5,
        "title": "کاربردهای افعال ناقص — متوسط (ص۱۴۹)",
        "level": "متوسط",
        "count": len(lesson5),
        "questions": lesson5,
    },
    {
        "lesson": 6,
        "title": "معلوم و مجهول — کنکوری (ص۱۵۰)",
        "level": "کنکوری",
        "count": len(lesson6),
        "questions": lesson6,
    },
    {
        "lesson": 7,
        "title": "افعال ناقص زمان گذشته — تخصصی (ص۱۵۱-۱۵۲)",
        "level": "استاندارد و کنکوری",
        "count": len(lesson7),
        "questions": lesson7,
    },
]

bank["source"]["modals"] = {
    "pages": "149-152",
    "familyA": {
        "questions": 20, "pages": "149", "level": "متوسط",
        "titlePrinted": "کاربردهای افعال ناقص (Modals)",
        "keyType": "گرید چاپی «پاسخنامه 20تست :کاربردهای افعال ناقص» (c15/sec23)",
    },
    "familyB": {
        "questions": 20, "pages": "150", "level": "کنکوری",
        "titlePrinted": "جملات معلوم و مجهول (Passive & Active Sentences)",
        "keyType": "گرید چاپی «پاسخنامه 20تست گرامر جملات معلوم و مجهول» (c15/sec23)",
    },
    "familyC": {
        "questions": 40, "pages": "151-152", "level": "استاندارد و کنکوری",
        "titlePrinted": "افعال ناقص در ساختارهای زمان گذشته (زبان تخصصی؛ OCR جزوه «تخصیص»)",
        "keyType": "گرید چاپی «پاسخنامه تستهای افعال ناقص» (c15/sec23 — ردیف‌های «6a» بدون فاصله با تحمل فاصلهٔ اختیاری)",
    },
    "spotLocks": {"A": SPOT_A, "B": SPOT_B, "C": SPOT_C},
    "answerRepairs": [
        {"family": fam, "n": n, **ov} for (fam, n), ov in ANSWER_OVERRIDES.items()
    ],
    "doubleBlanks": dbl,
    "translations": "در جزوه برای این سه خانواده چاپ نشده است (غیبت صادقانه — الگوی r278/r279)",
    "extractedRound": 282,
}

json.dump(bank, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"OK: A=20 B=20 C=40 → lessons now {[(l['lesson'], l['count']) for l in bank['lessons']]}")
print(f"doubleBlanks: {dbl}")
print("sample A-Q1:", json.dumps(lesson5[0], ensure_ascii=False)[:240])
print("sample C-Q2:", json.dumps(lesson7[1], ensure_ascii=False)[:240])
dist = {t: {c: sum(1 for n in range(lo, hi + 1) if k[n] == c) for c in "abcd"}
        for t, k, lo, hi in [("A", keysA, 1, 20), ("B", keysB, 1, 20), ("C", keysC, 1, 40)]}
print("key distribution:", dist)
