#!/usr/bin/env python3
r"""jozve-g12-tags-r283.py — بانک‌های «عبارات الحاق» (Tag Questions) دوازدهم (۳۵ تست)

خانوادهٔ A (۲۰ تست، ص۴۴، سطح دستگرمی): «تست دستگرمی گرامر عبارات الحاق» —
  کلید گرید ستونی چاپی «پاسخنامه 20 تست آموزش گرامر "عبارات الحاق" (صفحه 44)»
  در انتهای ص۱۸۷ — جفت‌های (حرف،عدد) خط‌به‌خط جدا، دوباره‌چینی ستونی.
خانوادهٔ B (۱۵ تست، ص۴۵، سطح کنکوری): «تست گرامر عبارات الحاق — سطح تستها: کنکوری» —
  کلید توضیحی «پاسخنامه 15 تست استاندارد» (ص۱۸۹-۱۹۱) — Q1 و Q3 سؤال واقعی کنکور ۹۸.

کشف جانبی ص۱۸۷: گرید ۴۰کلیدی «معلوم و مجهول بخش دوم (ص۳۷-۳۸)» — برای handoff.
ص۴۳ هم ۲۲ تمرینِ «بنویسید» (پاسخنامه ص۱۸۸) دارد — راند آینده.
چیدمان بانک B دو-حالته است: تک‌خطی (اکثر) + فهرست-گزاره‌ای (Q4/Q9/Q12 — هر گزینه یک خط).
خروجی: درس‌های ۸/۹ در public/jozve/grammar-g12-topic.json (خانوادهٔ موضوعی r280-r282).
"""
import json
import re

ROOT = "/home/z/my-project"
TXT = f"{ROOT}/booklet-extract/g12.txt"
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

# ---------------- بانک A (ص۴۴): ماشین تک‌خطی r282 ----------------
OPT_MARK = re.compile(r"(?:^|\s)([a-d])\.\s+")

def parse_a(lines, expect_n):
    questions = {}
    cur = None
    next_n = 1
    i = 0
    while i < len(lines) and len(questions) < expect_n:
        ln = lines[i]
        i += 1
        ms = re.match(r"^(\d{1,3})\s*\.?\s+(.+)$", ln)
        if ms and int(ms.group(1)) == next_n and not PERSIAN.match(ms.group(2)):
            if cur:
                raise SystemExit(f"A: Q{cur['n']} unfinished at stem {ms.group(1)}")
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
                        raise SystemExit(f"A: DUPLICATE n={cur['n']}")
                    questions[cur["n"]] = cur
                    cur = None
                continue
            if not cur["optfrags"]:
                cur["stem"] += " " + ln
                continue
            raise SystemExit(f"A: unexpected line while options of Q{cur['n']}: {ln[:80]!r}")
    if len(questions) != expect_n:
        raise SystemExit(f"A: expected {expect_n}, got {sorted(questions)}")
    return questions

# ---------------- بانک B (ص۴۵): ماشین دو-حالته ----------------
OPTB_MARK = re.compile(r"(?:^|\s)([a-d])\)\s+")
ANY_MARK = re.compile(r"(?:^|\s)([a-d])[.)]\s+")

def parse_b(lines, expect_n):
    """تک‌خطی (همهٔ نشانگرها در یک خط) یا فهرست-گزاره‌ای (هر گزینه یک خط — Q4/Q9/Q12)."""
    questions = {}
    cur = None
    next_n = 1
    i = 0
    while i < len(lines) and len(questions) < expect_n:
        ln = lines[i]
        i += 1
        ms = re.match(r"^(\d{1,3})\s*\.?\s+(.+)$", ln)
        if ms and int(ms.group(1)) == next_n and not PERSIAN.match(ms.group(2)):
            if cur:
                raise SystemExit(f"B: Q{cur['n']} unfinished at stem {ms.group(1)}")
            cur = {"n": next_n, "stem": ms.group(2), "optfrags": []}
            next_n += 1
            continue
        if cur is not None:
            first = OPTB_MARK.search(ln)
            starts_opt = bool(first and first.start() <= 8) or bool(re.match(r"^[a-d]\.\s+", ln))
            if starts_opt:
                cur["optfrags"].append(ln)
                joined = " ".join(cur["optfrags"])
                letters = ANY_MARK.findall(joined)
                if len(letters) == 4 and len(set(letters)) == 4:
                    if cur["n"] in questions:
                        raise SystemExit(f"B: DUPLICATE n={cur['n']}")
                    questions[cur["n"]] = cur
                    cur = None
                continue
            if not cur["optfrags"]:
                cur["stem"] += " " + ln
                continue
            raise SystemExit(f"B: unexpected line while options of Q{cur['n']}: {ln[:80]!r}")
    if len(questions) != expect_n:
        raise SystemExit(f"B: expected {expect_n}, got {sorted(questions)}")
    return questions

# ---------------- نرمال‌سازی (درس‌های r280-r282) ----------------
def polish(questions, fam):
    HYPHEN_JOIN = re.compile(r"(\w)- ([a-z])")
    BLANK_RUN = re.compile(r"-{4,}")
    for n, q in questions.items():
        s = HYPHEN_JOIN.sub(r"\1-\2", q["stem"])
        s = BLANK_RUN.sub(BLANK, s)
        s = re.sub(r"\s{2,}", " ", s).strip()
        joined = re.sub(r"\s{2,}", " ", " ".join(q["optfrags"])).strip()
        if fam == "A":
            parts = re.split(r"(?:^|\s)([a-d])\.\s+", joined)
        else:
            parts = re.split(r"(?:^|\s)([a-d])[.)]\s+", joined)
        opts = {}
        for j in range(1, len(parts) - 1, 2):
            if parts[j] in opts:
                raise SystemExit(f"{fam}-Q{n}: repeated letter {parts[j]}")
            opts[parts[j]] = parts[j + 1].strip()
        if sorted(opts) != ["a", "b", "c", "d"]:
            raise SystemExit(f"{fam}-Q{n}: options incomplete {sorted(opts)}")
        q["question"] = s
        q["options"] = [re.sub(r"\s{2,}", " ", opts[c]).strip() for c in "abcd"]
        del q["optfrags"], q["stem"]

partA = parse_a(body(44), 20)
partB = parse_b(body(45), 15)
polish(partA, "A")
polish(partB, "B")

# ---------------- کلید A: گرید ستونی انتهای ص۱۸۷ ----------------
p187 = [l.strip() for l in pages[187].split("\n") if l.strip()]
# سرصفحه با کشیدگی چاپی: «عبــــــــــارات الحـــــــاق» — الگو روی «الح..اق»
anchor = max(i for i, l in enumerate(p187) if re.search(r"الح\S*اق|نامه\s*20", l))
letters_seen = None
pairsA = {}
for l in p187[anchor + 1:]:
    if re.fullmatch(r"[a-d]", l):
        letters_seen = l
    elif re.fullmatch(r"\d{1,2}", l):
        if letters_seen is None:
            continue  # «44» سرصفحه — پیش از نخستین حرف
        n = int(l)
        if n in pairsA:
            raise SystemExit(f"A-grid: duplicate n={n}")
        pairsA[n] = letters_seen
        letters_seen = None
missing = [n for n in range(1, 21) if n not in pairsA]
extra = [n for n in pairsA if not 1 <= n <= 20]
if missing or extra:
    raise SystemExit(f"A keys missing={missing} extra={extra}")

# ---------------- کلید B: توضیحی ص۱۸۹-۱۹۱ با انتظارِ عددِ بعدی ----------------
# چهار واریانت چاپی: «( گزینهd» / «( گزینهc)» / « گزینه(c)» / « گزینه(» + حرفِ خطِ بعد
lines_b = []
for p in (189, 190, 191):
    lines_b += [l.strip() for l in pages[p].split("\n") if l.strip() and set(l.strip()) != {"-"}]

pairsB = {}
expect = 1
i = 0
while i < len(lines_b) and expect <= 15:
    l = lines_b[i]
    i += 1
    if re.fullmatch(r"\d{1,2}", l) and int(l) == expect:
        for j in range(1, 12):
            if i + j - 1 >= len(lines_b):
                break
            nl = lines_b[i + j - 1]
            if re.fullmatch(r"\d{1,2}", nl) and int(nl) == expect + 1:
                break  # به سؤال بعدی رسیدیم بی‌کلید
            m1 = re.search(r"گزینه\s*\(\s*([a-d])", nl)
            m2 = re.search(r"گزینه([a-d])", nl)
            if m1 or m2:
                pairsB[expect] = (m1 or m2).group(1)
                break
            if re.search(r"گزینه\s*\($", nl):
                if i + j < len(lines_b) and re.fullmatch(r"[a-d]", lines_b[i + j]):
                    pairsB[expect] = lines_b[i + j]
                    break
    if expect in pairsB:
        expect += 1
missing_b = [n for n in range(1, 16) if n not in pairsB]
if missing_b:
    raise SystemExit(f"B keys missing={missing_b}")

# ---------------- قفل‌های وفاداری کامل (داوریِ معناییِ دستیِ تک‌تک کلیدها) ----------------
SPOT_A = {1: "d", 2: "d", 3: "c", 4: "a", 5: "a", 6: "c", 7: "b", 8: "b", 9: "b", 10: "d",
          11: "c", 12: "b", 13: "b", 14: "d", 15: "d", 16: "c", 17: "b", 18: "a", 19: "a", 20: "d"}
SPOT_B = {1: "d", 2: "c", 3: "b", 4: "d", 5: "d", 6: "c", 7: "d", 8: "a", 9: "a", 10: "a",
          11: "b", 12: "b", 13: "c", 14: "d", 15: "b"}
bad = [(n, pairsA[n], w) for n, w in SPOT_A.items() if pairsA[n] != w]
bad += [(n, pairsB[n], w) for n, w in SPOT_B.items() if pairsB[n] != w]
if bad:
    raise SystemExit(f"spot-lock mismatch: {bad}")

# ---------------- ساخت درس‌ها ----------------
IDX = {"a": 0, "b": 1, "c": 2, "d": 3}
BLANKLESS_B = {9, 12}  # «کدام گزینه از نظر گرامری اشتباه است؟» — سؤال بی‌خالی چاپی

def mkq(pid, part, keys, n):
    q = part[n]
    letter = keys[n]
    if PERSIAN.search(q["question"]) or any(PERSIAN.search(o) for o in q["options"]):
        raise SystemExit(f"{pid}-Q{n}: Persian leakage")
    if len(set(q["options"])) != 4:
        raise SystemExit(f"{pid}-Q{n}: duplicate options")
    if BLANK not in q["question"] and not (pid.endswith("2") and n in BLANKLESS_B):
        raise SystemExit(f"{pid}-Q{n}: no canonical blank: {q['question'][:80]!r}")
    if "  " in q["question"] or any("  " in o for o in q["options"]):
        raise SystemExit(f"{pid}-Q{n}: double space")
    return {
        "id": f"{pid}-{n}", "n": n, "category": "grammar",
        "question": q["question"], "options": q["options"], "answer": IDX[letter],
    }

qsA = [mkq("g12-tag1", partA, pairsA, n) for n in range(1, 21)]
qsB = [mkq("g12-tag2", partB, pairsB, n) for n in range(1, 16)]

lesson8 = {
    "lesson": 8,
    "title": "عبارات الحاق (Tag Questions) — دستگرمی (ص۴۴)",
    "level": "دستگرمی",
    "count": 20,
    "questions": qsA,
}
lesson9 = {
    "lesson": 9,
    "title": "عبارات الحاق (Tag Questions) — کنکوری (ص۴۵)",
    "level": "کنکوری",
    "count": 15,
    "questions": qsB,
}

# ---------------- ادغام + رسید ----------------
data = json.load(open(OUT, encoding="utf-8"))
if any(l["lesson"] in (8, 9) for l in data["lessons"]):
    raise SystemExit("lessons 8/9 already exist — rerun would duplicate")
data["lessons"].extend([lesson8, lesson9])

data["source"]["tags"] = {
    "pages": "44 و 45",
    "topic": "عبارات الحاق (Tag Questions)",
    "familyA": {
        "questions": 20, "pages": "44", "level": "دستگرمی",
        "keyType": "گرید ستونی چاپی «پاسخنامه 20 تست آموزش گرامر عبارات الحاق (صفحه 44)» — انتهای ص۱۸۷؛ جفت‌های (حرف،عدد) خط‌به‌خط جدا با چینش دوباره‌چینی ستونی",
        "spotLocks": {str(n): pairsA[n] for n in (1, 2, 7, 10, 18, 19, 20)},
        "notes": "A-Q18 عبارت الحاق ناقص چاپی («--- he?») با گزینه‌های فعلِ برهنه — وفادار ماندیم",
    },
    "familyB": {
        "questions": 15, "pages": "45", "level": "کنکوری",
        "keyType": "توضیحی «پاسخنامه 15 تست استاندارد (صفحه 45)» — ص۱۸۹-۱۹۱؛ قیدِ «گزینه(X)» با انتظارِ عددِ بعدی",
        "konkur98": {"1": "کنکور انسانی داخل کشور 98", "3": "کنکور ریاضی داخل کشور 98"},
        "statementList": [4, 9, 12],
        "blankless": [9, 12],
        "spotLocks": {str(n): pairsB[n] for n in (1, 2, 5, 6, 7, 8, 13, 15)},
    },
    "printedQuirks": [
        {"q": "A9", "field": "stem", "note": "«future.,» — نقطه+ویرگول چاپی؛ وفادار ماندیم"},
        {"q": "A11", "field": "stem", "note": "«100 ℃» — نماد چاپی سلسیوس حفظ شد"},
        {"q": "B7", "field": "options.c", "note": "«hasn't order» — غلط چاپی خود جزوه (hasn't ordered)؛ وفادار ماندیم"},
        {"q": "B12", "field": "options.c", "note": "«have good job» بدون حرف تعریف — وفادار به چاپ (خودِ گزینه در داوریِ «کدام اشتباه است» نقش دارد)"},
    ],
    "translations": "کلید توضیحی بانک B ترجمهٔ فارسی دارد ولی OCR جزوه مخدوش است (جین→جیر، دلایل→دالئل، ریاضی→ریی)؛ بازسازیِ رسیددار به راند مستقل موکول شد — فیلد ترجمه ثبت نشد (الگوی r281)",
    "discovery": "ص۱۸۷ گرید ۴۰کلیدی «معلوم و مجهول — بخش دوم (صفحه 37 و 38)» را هم دارد — هویتِ گرید ۱۰۰کلیدیِ c13/sec1 (ابهام r280) بخشی روشن شد؛ ص۴۳ هم ۲۲ تمرینِ «بنویسید» با پاسخنامهٔ ص۱۸۸ دارد — راندهای بعد",
    "extractedRound": 283,
}

json.dump(data, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

print(f"OK — lesson8 (A) 20 + lesson9 (B) 15 appended; family total = {sum(len(l['questions']) for l in data['lessons'])}")
print("A keys:", "".join(pairsA[n] for n in range(1, 21)))
print("B keys:", "".join(pairsB[n] for n in range(1, 16)))
print("\nSample A-Q1:", json.dumps(qsA[0], ensure_ascii=False)[:200])
print("Sample A-Q18:", json.dumps(qsA[17], ensure_ascii=False)[:220])
print("Sample B-Q4:", json.dumps(qsB[3], ensure_ascii=False)[:300])
print("Sample B-Q9:", json.dumps(qsB[8], ensure_ascii=False)[:250])
print("Sample B-Q12:", json.dumps(qsB[11], ensure_ascii=False)[:250])
