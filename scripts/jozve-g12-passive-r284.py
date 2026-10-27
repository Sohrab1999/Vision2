#!/usr/bin/env python3
r"""jozve-g12-passive-r284.py — بانک‌های «معلوم و مجهول» دوازدهم (۶۰ تست)

بخش اول (۲۰ تست، ص۳۶، سطح آموزش): کلید توضیحی ص۱۸۵-۱۸۶ (قیدِ «گزینه(X)» چهار-واریانتی).
بخش دوم (۴۰ تست، ص۳۷-۳۸، سطح کنکوری): کلید گرید ستونی چاپی بالای ص۱۸۷ (کشف r283) —
  جفت‌های (حرف،عدد) خط‌به‌خط جدا.

راستی‌آزمایی هویتِ گرید c13/sec1 (ابهام r280): کپشنِ چاپی «پاسخنامه بخش اول (صفحه 36)»
دارد ولی با کلید توضیحیِ همان بخش ناسازگار است (۱:b در برابر ۱:d رسیددارِ ص۱۸۵) و با
گرید ص۱۸۷ هم یکی نیست — کپشن چاپی نادرست؛ هویت واقعی ناشناخته (ثبت با رسید).
ص۳۳-۳۵ فقط آموزش تئوری است — مجموعهٔ ۱۰۰تستیِ جایگزین وجود ندارد.

چیدمان: ساقه‌های دولایه‌ای (P1-Q18/19/20، P2-Q12/18/23)، گزینه‌های ۲تا-در-خط (P2-Q9/21)،
گزینه‌های تک-در-خط (P2-Q29/30/37). خروجی: درس‌های ۱۰/۱۱ در grammar-g12-topic.json.
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

def body(*ps):
    out = []
    for p in ps:
        out += [l.strip() for l in pages[p].split("\n") if l.strip() and not SKIP.match(l.strip())]
    return out

# ---------------- ماشین سؤال‌خوان (تک‌خطی/چندخطیِ گزینه — درس r281/r282) ----------------
OPT_A = re.compile(r"(?:^|\s)([a-d])\.\s+")

def parse_stream(lines, expect_n):
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
                raise SystemExit(f"Q{cur['n']} unfinished at stem {ms.group(1)}")
            cur = {"n": next_n, "stem": ms.group(2), "optfrags": []}
            next_n += 1
            continue
        if cur is not None:
            first = OPT_A.search(ln)
            starts_opt = re.match(r"^[a-d]\.\s+", ln) or (first and first.start() <= 8)
            if starts_opt:
                cur["optfrags"].append(ln)
                joined = " ".join(cur["optfrags"])
                letters = re.findall(r"(?:^|\s)([a-d])\.\s+", joined)
                if len(letters) == 4 and len(set(letters)) == 4:
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
        raise SystemExit(f"expected {expect_n}, got {sorted(questions)}")
    return questions

def polish(questions):
    BLANK_RUN = re.compile(r"-{4,}")
    for n, q in questions.items():
        s = BLANK_RUN.sub(BLANK, q["stem"])
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

part1 = parse_stream(body(36), 20)
part2 = parse_stream(body(37) + body(38), 40)
polish(part1)
polish(part2)

# ---------------- کلید بخش اول: توضیحی ص۱۸۵-۱۸۶ ----------------
lines_k = []
for p in (185, 186):
    lines_k += [l.strip() for l in pages[p].split("\n") if l.strip() and set(l.strip()) != {"-"}]

keys1 = {}
expect = 1
i = 0
while i < len(lines_k) and expect <= 20:
    l = lines_k[i]
    i += 1
    if re.fullmatch(r"\d{1,2}", l) and int(l) == expect:
        for j in range(1, 12):
            if i + j - 1 >= len(lines_k):
                break
            nl = lines_k[i + j - 1]
            if re.fullmatch(r"\d{1,2}", nl) and int(nl) == expect + 1:
                break
            m1 = re.search(r"گزینه\s*\(\s*([a-d])", nl)
            m2 = re.search(r"گزینه([a-d])", nl)
            if m1 or m2:
                keys1[expect] = (m1 or m2).group(1)
                break
            if re.search(r"گزینه\s*\($", nl):
                if i + j < len(lines_k) and re.fullmatch(r"[a-d]", lines_k[i + j]):
                    keys1[expect] = lines_k[i + j]
                    break
    if expect in keys1:
        expect += 1
miss = [n for n in range(1, 21) if n not in keys1]
if miss:
    raise SystemExit(f"part1 keys missing={miss}")

# ---------------- کلید بخش دوم: گرید ستونی بالای ص۱۸۷ ----------------
p187 = [l.strip() for l in pages[187].split("\n") if l.strip()]
anchor = next(i for i, l in enumerate(p187) if re.search(r"الح\S*اق|نامه\s*20", l))
letters_seen = None
keys2 = {}
for l in p187[:anchor]:
    if re.fullmatch(r"[a-d]", l):
        letters_seen = l
    elif re.fullmatch(r"\d{1,2}", l):
        if letters_seen is None:
            continue
        n = int(l)
        if n in keys2:
            raise SystemExit(f"part2 grid: duplicate n={n}")
        keys2[n] = letters_seen
        letters_seen = None
miss2 = [n for n in range(1, 41) if n not in keys2]
extra2 = [n for n in keys2 if not 1 <= n <= 40]
if miss2 or extra2:
    raise SystemExit(f"part2 keys missing={miss2} extra={extra2}")

# ---------------- قفل‌های وفاداری کامل (داوری معنایی دستی ۶۰/۶۰) ----------------
SPOT1 = {1: "d", 2: "c", 3: "b", 4: "c", 5: "c", 6: "d", 7: "a", 8: "b", 9: "c", 10: "d",
         11: "d", 12: "d", 13: "a", 14: "b", 15: "d", 16: "c", 17: "d", 18: "a", 19: "a", 20: "c"}
SPOT2 = {1: "d", 2: "c", 3: "b", 4: "d", 5: "c", 6: "a", 7: "b", 8: "c", 9: "b", 10: "b",
         11: "d", 12: "d", 13: "c", 14: "c", 15: "c", 16: "d", 17: "b", 18: "d", 19: "a", 20: "a",
         21: "b", 22: "c", 23: "b", 24: "b", 25: "a", 26: "b", 27: "b", 28: "c", 29: "a", 30: "b",
         31: "c", 32: "d", 33: "a", 34: "b", 35: "d", 36: "d", 37: "a", 38: "c", 39: "a", 40: "a"}
bad = [(n, keys1[n], w) for n, w in SPOT1.items() if keys1[n] != w]
bad += [(n, keys2[n], w) for n, w in SPOT2.items() if keys2[n] != w]
if bad:
    raise SystemExit(f"spot-lock mismatch: {bad}")

# ---------------- راستی‌آزمایی هویت گرید c13/sec1 (رسیدِ ناسازگاری) ----------------
g12 = json.load(open(f"{ROOT}/public/jozve/g12.json"))
c13s1 = next(c for c in g12["chapters"] if c["id"] == "c13")["sections"][1]["lines"]
GRID_PAIR = re.compile(r"(?<![\w])(\d{1,3})\s+([a-d])(?=[\s,]|$)")
grid100 = {}
for l in c13s1[:10]:
    for num, letter in GRID_PAIR.findall(l):
        grid100.setdefault(int(num), letter)
agree = sum(1 for n in range(1, 21) if grid100.get(n) == SPOT1[n])
agree2 = sum(1 for n in range(1, 41) if grid100.get(n) == SPOT2.get(n))
if grid100.get(1) == "d":
    raise SystemExit("c13/sec1 unexpectedly agrees — revisit the receipt")
print(f"identity receipt: c13/sec1 100-grid vs part1-key agree={agree}/20, vs part2-grid agree={agree2}/40 → مکپشن چاپی نادرست")

# ---------------- ساخت درس‌ها ----------------
IDX = {"a": 0, "b": 1, "c": 2, "d": 3}

def mkq(pid, part, keys, n):
    q = part[n]
    letter = keys[n]
    if PERSIAN.search(q["question"]) or any(PERSIAN.search(o) for o in q["options"]):
        raise SystemExit(f"{pid}-Q{n}: Persian leakage")
    if len(set(q["options"])) != 4:
        raise SystemExit(f"{pid}-Q{n}: duplicate options")
    if BLANK not in q["question"]:
        raise SystemExit(f"{pid}-Q{n}: no canonical blank: {q['question'][:80]!r}")
    if "  " in q["question"] or any("  " in o for o in q["options"]):
        raise SystemExit(f"{pid}-Q{n}: double space")
    return {
        "id": f"{pid}-{n}", "n": n, "category": "grammar",
        "question": q["question"], "options": q["options"], "answer": IDX[letter],
    }

qs1 = [mkq("g12-pass1", part1, keys1, n) for n in range(1, 21)]
qs2 = [mkq("g12-pass2", part2, keys2, n) for n in range(1, 41)]

lesson10 = {
    "lesson": 10,
    "title": "معلوم و مجهول — بخش اول، آموزشی (ص۳۶)",
    "level": "آموزشی",
    "count": 20,
    "questions": qs1,
}
lesson11 = {
    "lesson": 11,
    "title": "معلوم و مجهول — بخش دوم، کنکوری (ص۳۷-۳۸)",
    "level": "کنکوری",
    "count": 40,
    "questions": qs2,
}

data = json.load(open(OUT, encoding="utf-8"))
if any(l["lesson"] in (10, 11) for l in data["lessons"]):
    raise SystemExit("lessons 10/11 already exist — rerun would duplicate")
# گارد برخورد ساقه با درس ۶ (بانک مجهولِ ص۱۵۰ r282)
stems_new = {q["question"] for q in qs1 + qs2}
l6 = next(l for l in data["lessons"] if l["lesson"] == 6)
coll = [q["id"] for q in l6["questions"] if q["question"] in stems_new]
if coll:
    raise SystemExit(f"stem collision with lesson6: {coll}")
data["lessons"].extend([lesson10, lesson11])

data["source"]["passive"] = {
    "pages": "36-38",
    "topic": "تست گرامر جملات معلوم و مجهول",
    "part1": {
        "questions": 20, "pages": "36", "level": "آموزش",
        "keyType": "توضیحی «پاسخنامه تستهای گرامر جملات معلوم و مجهول — بخش اول» (ص۱۸۵-۱۸۶)؛ قیدِ «گزینه(X)» با انتظارِ عددِ بعدی",
        "spotLocks": {str(n): keys1[n] for n in (1, 2, 6, 8, 11, 13, 17, 19, 20)},
    },
    "part2": {
        "questions": 40, "pages": "37-38", "level": "کنکوری",
        "keyType": "گرید ستونی چاپی «پاسخنامه کلیدی 40 تست گرامر معلوم و مجهول — بخش دوم (صفحه 37 و 38)» — بالای ص۱۸۷؛ کشف r283",
        "spotLocks": {str(n): keys2[n] for n in (1, 5, 9, 12, 14, 22, 24, 31, 35, 38, 40)},
    },
    "gridIdentityReceipt": "گرید ۱۰۰کلیدی c13/sec1 با کپشن چاپی «پاسخنامه بخش اول (صفحه 36)» ولی ناسازگار با کلید توضیحیِ خودِ بخش (توافق {}/۲۰؛ ۱:b در برابر ۱:d رسیددارِ ص۱۸۵) و ناسازگار با گرید ص۱۸۷ (توافق {}/۴۰) — کپشن چاپی نادرست؛ هویت واقعی ناشناخته (ابهام r280 با رسید بسته شد)".format(agree, agree2),
    "translations": "کلید توضیحی بخش اول ترجمهٔ فارسی دارد ولی OCR مخدوش است (چین→چیر، گشایش→گسی ش عرص، دیزنی‌لند→دیزب لند)؛ بازسازیِ رسیددار به راند مستقل موکول شد — فیلد ترجمه ثبت نشد (الگوی r281/r283)",
    "extractedRound": 284,
}

json.dump(data, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"OK — lesson10 (P1) 20 + lesson11 (P2) 40 appended; family total = {sum(len(l['questions']) for l in data['lessons'])}")
print("P1 keys:", "".join(keys1[n] for n in range(1, 21)))
print("P2 keys:", "".join(keys2[n] for n in range(1, 41)))
print("\nSample P1-Q1:", json.dumps(qs1[0], ensure_ascii=False)[:200])
print("Sample P1-Q18:", json.dumps(qs1[17], ensure_ascii=False)[:230])
print("Sample P2-Q9:", json.dumps(qs2[8], ensure_ascii=False)[:280])
print("Sample P2-Q29:", json.dumps(qs2[28], ensure_ascii=False)[:250])
print("Sample P2-Q38:", json.dumps(qs2[37], ensure_ascii=False)[:250])
