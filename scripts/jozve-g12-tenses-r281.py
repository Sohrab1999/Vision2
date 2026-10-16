#!/usr/bin/env python3
"""jozve-g12-tenses-r281.py — استخراج بانک «مرور زمان‌ها» دوازدهم (۸۰ تست در دو بخش)

بخش اول (۳۰ تست، ص۱۴۲-۱۴۳، سطح متوسط): کلید از بلوک‌های توضیحی «-Nگزینه (X)» خود جزوه
  (p220-223 → c15/sec3..sec23) — الگوی r277. ترجمهٔ این بخش در PDF به‌هم‌ریخته/ناقص است → ثبت نمی‌شود (غیبت صادقانه).
بخش دوم (۵۰ تست، ص۱۴۳-۱۴۵، سطح استاندارد): کلید از گرید چاپی «بخش دوم پاسخنامه
  تستهای مرور زمانها (سوالات صفحه وسط 143-145)» در c15/sec23 — الگوی r279.
خروجی: الحاق دو درس به public/jozve/grammar-g12-topic.json (درس ۳ و ۴ خانوادهٔ موضوعی r280).
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

STEM = re.compile(r"^(\d{1,3})\s*\.\s+(.+)$")
OPT_MARK = re.compile(r"(?:^|\s)([a-d])\.\s+")

def parse_stream(lines, expect_n, stop_after):
    """ماشین r280 — جمع ساقهٔ چندخطی + گزینه‌های دولاینی/تک‌خطی، توقف در تعداد مقصد.
    درس r281: PDF بعد از شمارهٔ سؤال نقطه ندارد («38 They...») — شماره‌یابِ
    «انتظارِ عددِ بعدی» جای رجکسِ نقطه‌دار؛ فقط شمارهٔ درست سؤال بعدی ساقه است."""
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
            if ms.group(2).startswith(". ") is False and not re.match(r"\d\s*\.", ln):
                pass  # نقطهٔ جافتادهٔ PDF — پذیرفته شد
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
    """پیوند وصل‌نویس + نرمال‌سازی خالی + پارس گزینه‌ها (درس‌های r279/r280)."""
    HYPHEN_JOIN = re.compile(r"(\w)- ([a-z])")
    BLANK_RUN = re.compile(r"-{4,}")
    GLUE_BEFORE = re.compile(r"([^\s-])(-{4,})")   # \S خط‌تیره را نمی‌گیرد — درس r280
    GLUE_AFTER = re.compile(r"(-{4,})(?=[A-Za-z(])")
    for n, q in questions.items():
        s = HYPHEN_JOIN.sub(r"\1-\2", q["stem"])
        s = BLANK_RUN.sub(BLANK, s)
        s = GLUE_BEFORE.sub(lambda m: m.group(1) + " " + BLANK, s)
        s = GLUE_AFTER.sub(lambda m: BLANK + " ", s)
        s = re.sub(r"\s{2,}", " ", s).strip()
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

# ---------------- گذر A: بخش اول (ص۱۴۲ + ص۱۴۳ تا مرزِ «بخش دوم») ----------------
b143 = body(143)
cut = next(i for i, l in enumerate(b143) if re.search(r"مرور\s*ان?\s*ـ+\s*زم\s*ها|بخش:\s*\"دوم\"", l))
part1 = parse_stream(body(142) + b143[:cut], expect_n=30, stop_after=30)

# ---------------- گذر B: بخش دوم (ص۱۴۳ از مرز + ص۱۴۴ + ص۱۴۵) ----------------
part2 = parse_stream(b143[cut:] + body(144) + body(145), expect_n=50, stop_after=50)

polish(part1)
polish(part2)

# ---------------- کلید بخش اول از بلوک‌های توضیحی c15 ----------------
g12 = json.load(open(G12))
c15 = g12["chapters"][14]["sections"]
# توضیحِ -1 در انتهای sec2 (مخلوط با ترجمه‌های تمرین ص۱۴۱) است — اسکن از sec2
# («-Nترجمه» با رجکسِ کلید نمی‌آید — گاردِ «گزینه» در الگو هست)
expl_text = "\n".join("\n".join(c15[i]["lines"]) for i in range(2, 24))
EXPL_KEY = re.compile(r"-(\d{1,2})گزینه\s*(?:\([^)]*\))?\s*\)?\s*([a-d])")
keys1 = {}
for num, letter in EXPL_KEY.findall(expl_text):
    keys1.setdefault(int(num), letter)
missing1 = [n for n in range(1, 31) if n not in keys1]
extra1 = [n for n in keys1 if not 1 <= n <= 30]
if missing1 or extra1:
    raise SystemExit(f"part1 keys missing={missing1} extra={extra1}")

# ---------------- کلید بخش دوم از گرید چاپی c15/sec23 (لنگر تا «پاسخنامه» بعدی) ----------------
sec23 = c15[23]["lines"]
anchor = next(i for i, l in enumerate(sec23) if "بخش دوم پاسخنامه تستهای مرور زمانها" in l)
GRID_PAIR = re.compile(r"(?<![\w])(\d{1,3})\s+([a-d])(?=\s|$)")
keys2 = {}
for l in sec23[anchor + 1:]:
    if re.search(r"پاسخنامه|Note\s*:", l):
        break
    for num, letter in GRID_PAIR.findall(l):
        keys2.setdefault(int(num), letter)
missing2 = [n for n in range(1, 51) if n not in keys2]
extra2 = [n for n in keys2 if not 1 <= n <= 50]
if missing2 or extra2:
    raise SystemExit(f"part2 keys missing={missing2} extra={extra2}")

# ---------------- قفل‌های معنایی ----------------
SPOT1 = {1: "c", 4: "a", 8: "d", 17: "b", 30: "a"}
SPOT2 = {4: "b", 8: "c", 10: "b", 33: "d", 50: "c"}
bad = [(1, n, keys1[n], w) for n, w in SPOT1.items() if keys1[n] != w]
bad += [(2, n, keys2[n], w) for n, w in SPOT2.items() if keys2[n] != w]
if bad:
    raise SystemExit(f"spot-lock mismatch: {bad}")

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

lesson3 = [mkq("g12-tense1", part1, keys1, n) for n in range(1, 31)]
lesson4 = [mkq("g12-tense2", part2, keys2, n) for n in range(1, 51)]

# ---------------- الحاق به بانک موضوعی r280 ----------------
bank = json.load(open(OUT, encoding="utf-8"))
if any(l["lesson"] in (3, 4) for l in bank["lessons"]):
    raise SystemExit("lessons 3/4 already present — re-run would duplicate")

# تکرارِ چاپی خود جزوه: بخش دوم Q38 = بخش اول Q14 (با همان ساقه/گزینه‌ها) —
# درس ۳ و درس ۴ سشن‌های جدا دارند؛ وفادار به چاپ می‌مانیم و ثبتش می‌کنیم.
dup1 = part1[14]
dup2 = part2[38]
if dup1["question"] != dup2["question"] or dup1["options"] != dup2["options"]:
    raise SystemExit("expected printed duplicate p1-Q14 == p2-Q38 broken")

bank["lessons"] += [
    {
        "lesson": 3,
        "title": "مرور زمان‌ها — متوسط (ص۱۴۲-۱۴۳)",
        "level": "متوسط",
        "count": len(lesson3),
        "questions": lesson3,
    },
    {
        "lesson": 4,
        "title": "مرور زمان‌ها — استاندارد (ص۱۴۳-۱۴۵)",
        "level": "استاندارد",
        "count": len(lesson4),
        "questions": lesson4,
    },
]

bank["source"]["tenses"] = {
    "pages": "142-145",
    "part1": {
        "questions": 30, "pages": "142-143", "level": "متوسط",
        "keyType": "توضیحی «-Nگزینه (X)» ص۲۲۰-۲۲۳ (c15/sec3..sec23)",
        "translations": "در PDF به‌هم‌ریخته/ناقص‌اند (OCR دوبه‌ویرایش‌نشدنی) — ثبت نشد",
    },
    "part2": {
        "questions": 50, "pages": "143-145", "level": "استاندارد",
        "keyType": "گرید چاپی «بخش دوم پاسخنامه تستهای مرور زمانها» (c15/sec23)",
        "translations": "در جزوه چاپ نشده است",
    },
    "spotLocks": {"part1": SPOT1, "part2": SPOT2},
    "printedDuplicate": {"part1": 14, "part2": 38, "note": "خود جزوه سؤال ۱۴ بخش اول را در بخش دوم هم چاپ کرده (Q38) — وفادار ماندیم"},
    "extractedRound": 281,
}

json.dump(bank, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"OK: part1={len(lesson3)} part2={len(lesson4)} → lessons now {[l['lesson'] for l in bank['lessons']]}")
print("sample P1-Q1:", json.dumps(lesson3[0], ensure_ascii=False)[:230])
print("sample P2-Q47:", json.dumps(next(q for q in lesson4 if q["n"] == 47), ensure_ascii=False)[:260])
