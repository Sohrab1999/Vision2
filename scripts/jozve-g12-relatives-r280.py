#!/usr/bin/env python3
"""jozve-g12-relatives-r280.py — استخراج بانک ۸۸تستی «ضمایر موصولی و حذف آنها» دوازدهم

سؤال‌ها: g12.txt صفحات 88-91 (شماره‌گذاری چاپی پیوستهٔ 1..88 — p88: 1..21، p89: 22..43،
p90: 44..66، p91: 67..88). کلیدها: گرید چاپی «پاسخنامه 88تست گرامر ضمایر موصولی
(صفحه 88 تا 91)» در g12.json/c14/sec26 — با جفت‌یابِ ردیفیِ r278/r279.
ترجمه: برای این خانواده در جزوه چاپ نشده (غیبتِ صادقانه — الگوی r278/r279).
خروجی: public/jozve/grammar-g12-topic.json — دو درس: 1-27 (متوسط/کنکوری) و 28-88 (حذف/نظام قدیم).
"""
import json
import re

ROOT = "/home/z/my-project"
TXT = f"{ROOT}/booklet-extract/g12.txt"
G12 = f"{ROOT}/public/jozve/g12.json"
OUT = f"{ROOT}/public/jozve/grammar-g12-topic.json"

BLANK = "-" * 15  # فرمت کانونی بانک‌های قبلی

# ---------------- صفحات ----------------
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
    out = []
    for l in pages[p].split("\n"):
        s = l.strip()
        if s and not SKIP.match(s):
            out.append(s)
    return out

lines = []
for p in (88, 89, 90, 91):
    lines += body(p)

# ---------------- ماشین استخراج ----------------
STEM = re.compile(r"^(\d{1,3})\s*\.\s+(.+)$")
OPT_MARK = re.compile(r"(?:^|\s)([a-d])\.\s+")
PERSIAN = re.compile(r"[\u0600-\u06FF]")

questions = {}
cur = None          # dict جاری
mode = "seek"       # seek | opts
pend_frag = ""      # تکهٔ ادامهٔ ساقه

def finish(q):
    n = q["n"]
    if n in questions:
        raise SystemExit(f"DUPLICATE question number {n}")
    questions[n] = q

i = 0
while i < len(lines):
    ln = lines[i]
    i += 1
    ms = STEM.match(ln)
    if ms:
        # اگر سؤالِ ناتمامی داریم با گزینه‌های ناقص → خطا (پوشش اجباری)
        if cur and cur.get("mode") == "opts":
            raise SystemExit(f"question {cur['n']} hit stem {ms.group(1)} with options={cur.get('optfrags')}")
        if cur:
            finish(cur)
        cur = {"n": int(ms.group(1)), "stem": ms.group(2), "optfrags": [], "mode": "opts"}
        mode = "opts"
        continue
    if mode == "opts" and cur is not None:
        # خط گزینه؟ (شروع با a./b./c./d. حتی با تورفتگی)
        first = OPT_MARK.search(ln)
        starts_opt = re.match(r"^[a-d]\.\s+", ln) or (first and first.start() <= 8)
        if starts_opt:
            cur["optfrags"].append(ln)
            # آیا هر چهار حرف آمده؟
            joined = " ".join(cur["optfrags"])
            letters = set(re.findall(r"(?:^|\s)([a-d])\.\s+", joined))
            if len(letters) == 4:
                cur["mode"] = "done"
                finish(cur)
                cur = None
                mode = "seek"
            continue
        # خط ادامهٔ ساقه (مثل Q84 «tenth of those ...») فقط قبل از اولین گزینه
        if not cur["optfrags"]:
            cur["stem"] += " " + ln  # فعلاً با فاصله؛ پیوندِ وصل‌نویس بعداً
            continue
        raise SystemExit(f"unexpected line while options of Q{cur['n']}: {ln[:80]!r}")

if cur:
    finish(cur)

# ---------------- پیوندِ وصل‌نویس PDF (کلمهٔ بریده) ----------------
# «... because only one-» + «tenth of those ...» → «... because only one-tenth of those ...»
HYPHEN_JOIN = re.compile(r"(\w)- ([a-z])")
for n, q in questions.items():
    q["stem"] = HYPHEN_JOIN.sub(r"\1-\2", q["stem"])

# ---------------- نرمال‌سازی خالی و فاصله ----------------
BLANK_RUN = re.compile(r"-{4,}")
# نکتهٔ پارسر: \S خودِ خط‌تیره را هم می‌گیرد و اولین خطِ خالی را می‌خورد؛
# گروه باید «غیرخط‌تیره» باشد تا فقط چسبیدگی واقعی («person------------») ترمیم شود.
GLUE_BEFORE = re.compile(r"([^\s-])(-{4,})")   # «person------------» → «person ------------»
GLUE_AFTER = re.compile(r"(-{4,})(?=[A-Za-z(])")  # «---to» → «--- to»
for n, q in questions.items():
    s = q["stem"]
    s = BLANK_RUN.sub(BLANK, s)
    s = GLUE_BEFORE.sub(lambda m: m.group(1) + " " + BLANK, s)
    s = GLUE_AFTER.sub(lambda m: BLANK + " ", s)
    s = re.sub(r"\s{2,}", " ", s).strip()
    q["question"] = s

# ---------------- پارس گزینه‌ها ----------------
for n, q in questions.items():
    joined = " ".join(q["optfrags"])
    joined = re.sub(r"\s{2,}", " ", joined).strip()
    parts = re.split(r"(?:^|\s)([a-d])\.\s+", joined)
    # re.split با یک گروه: ['', 'a', 'text a', 'b', 'text b', ...]
    opts = {}
    for j in range(1, len(parts) - 1, 2):
        letter = parts[j]
        text = parts[j + 1].strip()
        if letter in opts:
            raise SystemExit(f"Q{n}: repeated option letter {letter}")
        opts[letter] = text
    if sorted(opts) != ["a", "b", "c", "d"]:
        raise SystemExit(f"Q{n}: options incomplete {sorted(opts)} from {joined[:120]!r}")
    # پاکسازی نویز داخلی گزینه‌ها (دوبل‌فاصله، تورفتگی باقی‌مانده)
    q["options"] = [re.sub(r"\s{2,}", " ", opts[c]).strip() for c in "abcd"]
    del q["optfrags"], q["stem"], q["mode"]

# ---------------- کلیدها از گرید چاپی g12.json (c14/sec26) ----------------
g12 = json.load(open(G12))
GRID_PAIR = re.compile(r"(?<![\w])(\d{1,3})\s+([a-d])(?=\s|$)")
sec = g12["chapters"][13]["sections"][26]
grid = {}
for l in sec["lines"]:
    for num, letter in GRID_PAIR.findall(l):
        grid.setdefault(int(num), letter)
missing = [n for n in range(1, 89) if n not in grid]
if missing:
    raise SystemExit(f"key grid missing: {missing}")
extra = [n for n in grid if n < 1 or n > 88]
if extra:
    raise SystemExit(f"key grid out of range: {extra}")

# ---------------- افتادگی‌های ثبت‌شده (وفاداری به چاپ) ----------------
ERRATA = [
    {"q": 33, "field": "options.d", "printed": "which wining", "note": "غلط چاپی خود جزوه — wining به‌جای winning؛ وفادار ماندیم"},
    {"q": 78, "field": "stem", "printed": "knew that scape from the Island", "note": "غلط چاپی خود جزوه — scape به‌جای escape؛ وفادار ماندیم"},
]
ERRATA_QS = {e["q"] for e in ERRATA}

# قفل‌های معنایی — بازبینی انسانی روی نمونه‌ها
SPOT = {1: "c", 2: "c", 3: "a", 22: "a", 23: "d", 24: "b", 87: "d", 88: "b"}
bad = [(n, grid[n], want) for n, want in SPOT.items() if grid[n] != want]
if bad:
    raise SystemExit(f"spot-lock mismatch: {bad}")

# ---------------- ساخت بانک ----------------
def mkq(n):
    q = questions[n]
    letter = grid[n]
    idx = "abcd".index(letter)
    if PERSIAN.search(q["question"]) or any(PERSIAN.search(o) for o in q["options"]):
        raise SystemExit(f"Q{n}: Persian leakage")
    if len(set(q["options"])) != 4:
        raise SystemExit(f"Q{n}: duplicate options {q['options']}")
    if BLANK not in q["question"]:
        raise SystemExit(f"Q{n}: no blank in stem {q['question'][:80]!r}")
    return {
        "id": f"g12-rel-{n}",
        "n": n,
        "category": "grammar",
        "question": q["question"],
        "options": q["options"],
        "answer": idx,
    }

lesson1 = [mkq(n) for n in range(1, 28)]    # 1..27
lesson2 = [mkq(n) for n in range(28, 89)]   # 28..88

bank = {
    "grade": 12,
    "family": "grammar-topic",
    "source": {
        "booklet": "Vision Three — جزوهٔ جامع کمک‌آموزش زبان انگلیسی پایهٔ دوازدهم",
        "test": "تست دیگر از گرامر ضمایر موصولی و حذف آنها",
        "pages": "88-91",
        "keyGrid": "پاسخنامه 88تست گرامر ضمایر موصولی (صفحه 88 تا 91) — g12.json c14/sec26",
        "extractedRound": 280,
        "levels": {
            "1-27": "در حد کتاب و کنکور 98 — متوسط و کنکوری",
            "28-88": "حذف ضمایر موصولی / زبان تخصصی — نظام قدیم و دشوار",
        },
        "translations": "برای این خانواده در جزوه چاپ نشده است (غیبتِ صادقانه)",
        "stats": {
            "questions": len(questions),
            "keys": len(grid),
            "lesson1": len(lesson1),
            "lesson2": len(lesson2),
        },
        "errata": ERRATA,
        "spotLocks": SPOT,
    },
    "lessons": [
        {
            "lesson": 1,
            "title": "ضمایر موصولی — متوسط و کنکوری (ص۸۸)",
            "level": "متوسط و کنکوری",
            "count": len(lesson1),
            "questions": lesson1,
        },
        {
            "lesson": 2,
            "title": "حذف ضمایر موصولی — نظام قدیم (ص۸۹-۹۱)",
            "level": "نظام قدیم و دشوار",
            "count": len(lesson2),
            "questions": lesson2,
        },
    ],
}

json.dump(bank, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"OK: {len(questions)} questions, keys {len(grid)}, lesson1={len(lesson1)} lesson2={len(lesson2)}")
print("sample Q1:", json.dumps(lesson1[0], ensure_ascii=False)[:220])
print("sample Q84:", json.dumps(next(q for q in lesson2 if q["n"] == 84), ensure_ascii=False)[:300])
print("errata qs:", sorted(ERRATA_QS))
