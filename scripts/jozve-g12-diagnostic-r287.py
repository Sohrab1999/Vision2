#!/usr/bin/env python3
r"""jozve-g12-diagnostic-r287.py — «آزمون تشریحی بخش گرامر و نگارش» درس اول دوازدهم (۹۴ آیتم در ۷ بانک)

منبع: ص۵۰-۵۴ (سؤال‌ها) + کلید کامل ص۱۹۳-۱۹۴ («کلید آزمون تشریحی گرامر درس اول، صفحه 50 تا 54»).
  S1 ص۵۰ (۸ آیتم تایپی): جمله مجهول در زمان حال ساده بسازید — کلید: جملهٔ کامل.
  S2 ص۵۰ (۸ آیتم تایپی): جمله مجهول در زمان گذشته ساده — کلید: جملهٔ کامل.
  S3 ص۵۱ (۸ آیتم تایپی): جمله مجهول در زمان حال کامل — کلید: جملهٔ کامل.
  S4 ص۵۱ (۱۵ آیتم تایپی): شکل صحیح فعل داخل پرانتز (معلوم یا مجهول) — کلید: «1. is made» …؛
      آیتم‌های دوخالی چاپی («When --- this bridge --- (build)?») کلید «was / built» دارند —
      accepted با فاصله به‌جای اسلش («was built»).
  S5 ص۵۲ (۱۵ آیتم تایپی): یک اشتباه گرامری را پیدا و تصحیح کنید — کلید: تصحیح داخل پرانتز ص۱۹۴.
  S6 ص۵۲-۵۳ (۲۰ تست MCQ): «بهترین گزینه را انتخاب کنید» — گزینه‌ها عمودی (هر گزینه یک خط،
      الگوی فهرست-گزارهٔ r283) — کلید حروفی ص۱۹۴ («1. c» …).
  S7 ص۵۳-۵۴ (۲۰ آیتم تایپی): برای هر جمله عبارت الحاق بنویسید — کلید ص۱۹۴.
ص۸ (۱۲ آیتم کامل کنید) و ص۹ (متنِ ۴خالی) ص۵۴ — کلید ص۱۹۴ — راند آینده (خانوادهٔ کلمات ربط).
نکته‌های چاپی: خطِ پاسخِ زیر سؤال‌های S1-S3 خطِ پرکAttribPointer چاپی است (باید رد شود)؛
بدنهٔ آزمون تشریحی ترجمه ندارد — غیبتِ صادقانه (الگوی r281-r283).
خروجی: درس‌های ۱۵-۲۱ در public/jozve/grammar-g12-topic.json (خانوادهٔ موضوعی r280-r286).
"""
import json
import re

ROOT = "/home/z/my-project"
TXT = f"{ROOT}/booklet-extract/g12.txt"
OUT = f"{ROOT}/public/jozve/grammar-g12-topic.json"

PERSIAN = re.compile(r"[\u0600-\u06FF]")
BLANK = "-" * 15
NUM_LINE = re.compile(r"^(\d{1,2})\s*\.\s+(.+)$")
OPT_LINE = re.compile(r"^([a-d])\s*\.\s+(.+)$")

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

def norm_stem(s: str) -> str:
    s = re.sub(r"\s+", " ", s).strip()
    s = re.sub(r"\s+([.,?!])", r"\1", s)
    s = re.sub(r"-{4,}", BLANK, s)
    return s

def is_junk(ln: str) -> bool:
    """خطِ پاسخِ چاپی/خط‌تیرهٔ تنها: فقط رقم/نقطه/خط‌تیره/پرانتز/علامت سؤال/فاصله"""
    return re.sub(r"[\d.\s\-()?,؟]+", "", ln) == ""

def numbered_english(lines, expected_counts):
    """اسکنِ آیتم‌های شماره‌دارِ انگلیسیِ چند-بخشی — شمارهٔ ۱ آغازگرِ بخشِ تازه (انتظارِ عددِ بعدی، الگوی r281)"""
    sections, cur, next_n = [], None, None
    for ln in lines:
        if SKIP.match(ln) or is_junk(ln) or (PERSIAN.search(ln) and not NUM_LINE.match(ln)):
            continue
        ms = NUM_LINE.match(ln)
        if ms:
            n = int(ms.group(1))
            if n == 1:
                cur, next_n = {1: ms.group(2)}, 2
            elif cur is not None and n == next_n:
                cur[n] = ms.group(2)
                next_n += 1
        elif cur is not None and not PERSIAN.search(ln):
            cur[next_n - 1] += " " + ln  # ادامهٔ ساقه (نادر)
        if cur is not None and next_n - 1 in cur and len(cur) == expected_counts[len(sections)]:
            sections.append(cur)
            cur, next_n = None, None
    return sections

# ---------------- سؤال‌ها ----------------
def parse_questions():
    # S1+S2 ص۵۰ — از سرِ آزمون تا پایان صفحه
    p50 = pages[50]
    a = p50.find("حال ساده .) بسازید")
    s1, s2 = numbered_english(
        [l.strip() for l in p50[a:].split("\n") if l.strip()], [8, 8])
    # S3+S4 ص۵۱ — از سرِ صفحه تا پایان
    p51 = pages[51]
    b = p51.find("حال کامل .) بسازید")
    s3, s4 = numbered_english(
        [l.strip() for l in p51[b:].split("\n") if l.strip()], [8, 15])
    # S5 ص۵۲ — از سرِ بخش ۵ تا سرِ بخش ۶
    p52 = pages[52]
    c = p52.find("اشتباه گرامری وجود دارد")
    d = p52.find("بهی  ین گزینه")
    (s5,) = numbered_english(
        [l.strip() for l in p52[c:d].split("\n") if l.strip()], [15])
    # S6 ص۵۲-۵۳ — MCQ با گزینهٔ عمودی (فهرست-گزاره، الگوی r283)
    e = p52.find("<<<END>>>")  # placeholder — واقعی: از d تا پایان p52
    mcq_lines = [l.strip() for l in p52[d:].split("\n") if l.strip() and not SKIP.match(l.strip())]
    p53 = pages[53]
    f = p53.find("برای هر یک از جمالت زیر")
    mcq_lines += [l.strip() for l in p53[:f].split("\n") if l.strip() and not SKIP.match(l.strip())]
    s6 = parse_mcq_vertical(mcq_lines)
    # S7 ص۵۳-۵۴ — از سرِ بخش ۷ (p53) تا پایانِ بخش (p54 قبل از بخش ۸)
    s7_lines = [l.strip() for l in p53[f:].split("\n") if l.strip() and not SKIP.match(l.strip())]
    p54 = pages[54]
    g = p54.find("کامل کنید")
    s7_lines += [l.strip() for l in p54[:g].split("\n") if l.strip() and not SKIP.match(l.strip())]
    (s7,) = numbered_english(s7_lines, [20])
    return s1, s2, s3, s4, s5, s6, s7

def parse_mcq_vertical(lines):
    """ساقه + ۴ گزینهٔ عمودی («a. stole» هر خط) — ساقه = خطِ شماره‌دارِ بدون نشانِ گزینه"""
    questions, cur_n, stem, opts = {}, None, "", []
    next_n = 1
    for ln in lines:
        if is_junk(ln) or PERSIAN.search(ln):
            continue
        ms = NUM_LINE.match(ln)
        om = OPT_LINE.match(ln)
        if om and cur_n is not None:
            opts.append(om.group(2).strip())
            if len(opts) == 4:
                questions[cur_n] = (norm_stem(stem), opts)
                cur_n, stem, opts = None, "", []
        elif ms and int(ms.group(1)) == next_n:
            cur_n, stem, opts = int(ms.group(1)), ms.group(2), []
            next_n += 1
    return questions

# ---------------- کلیدها ----------------
def parse_keys():
    p193, p194 = pages[193], pages[194]
    # S1-S4: برش با لنگرِ سرصفحهٔ هر بخش
    a1 = p193.find("حال ساده .) بسازید")
    a2 = p193.find("گذشته ساده .) بسازید")
    a3 = p193.find("حال کامل .) بسازید")
    a4 = p193.find("مجهول .) را بنویسید")
    k1, k2 = numbered_english(
        [l.strip() for l in p193[a1:a2].split("\n") if l.strip()], [8])[0], \
        numbered_english([l.strip() for l in p193[a2:a3].split("\n") if l.strip()], [8])[0]
    k3, k4 = numbered_english(
        [l.strip() for l in p193[a3:a4].split("\n") if l.strip()], [8])[0], \
        numbered_english([l.strip() for l in p193[a4:].split("\n") if l.strip()], [15])[0]
    # S5: تصحیح داخل پرانتز
    b1 = p194.find("اشتباه گرامری وجود دارد")
    b2 = p194.find("بهی  ین گزینه")
    k5 = {}
    for ln in p194[b1:b2].split("\n"):
        ln = ln.strip()
        ms = NUM_LINE.match(ln)
        if ms:
            cm = re.search(r"\(([^()]+)\)\s*$", ms.group(2))
            assert cm, f"کلید S5-{ms.group(1)} پرانتز ندارد: {ln!r}"
            k5[int(ms.group(1))] = cm.group(1).strip()
    # S6: حروف
    b3 = p194.find("برای هر یک از جمالت زیر")
    k6 = {}
    for ln in p194[b2:b3].split("\n"):
        ln = ln.strip()
        ms = re.match(r"^(\d{1,2})\s*\.\s+([a-d])\s*$", ln)
        if ms:
            k6[int(ms.group(1))] = ms.group(2)
    # S7: تگ‌ها
    b4 = p194.find("کامل کنید")
    k7 = numbered_english(
        [l.strip() for l in p194[b3:b4].split("\n") if l.strip()], [20])[0]
    return k1, k2, k3, k4, k5, k6, k7

# ---------------- داربست‌های تایپی: سه آیتم بعدیِ یکتای همان بخش (چرخه‌ای) ----------------
def cyclic_scaffolds(values, i):
    """کلیدهای چاپی می‌توانند تکرار داشته باشند (S7: isn't he ×۲، does he ×۲) —
    داربست از نخستین سه مقدارِ یکتای متفاوت با کلید در چرخه برداشته می‌شود"""
    key = values[i]
    pool = []
    for k in range(1, len(values)):
        v = values[(i + k) % len(values)]
        if v != key and v not in pool:
            pool.append(v)
        if len(pool) == 3:
            break
    return pool

def main():
    s1, s2, s3, s4, s5, s6, s7 = parse_questions()
    k1, k2, k3, k4, k5, k6, k7 = parse_keys()

    assert len(s1) == len(k1) == 8, f"S1 {len(s1)}/{len(k1)}"
    assert len(s2) == len(k2) == 8, f"S2 {len(s2)}/{len(k2)}"
    assert len(s3) == len(k3) == 8, f"S3 {len(s3)}/{len(k3)}"
    assert len(s4) == len(k4) == 15, f"S4 {len(s4)}/{len(k4)}"
    assert len(s5) == len(k5) == 15, f"S5 {len(s5)}/{len(k5)}"
    assert len(s6) == len(k6) == 20, f"S6 {len(s6)}/{len(k6)}"
    assert len(s7) == len(k7) == 20, f"S7 {len(s7)}/{len(k7)}"

    # قفل‌های معنایی — کلید باید با منطق سؤال بخواند
    TYPE_LOCKS = {
        (1, 1): "Butter is made from cream",
        (2, 6): "I was born in Tehran in 1360",
        (3, 6): "The tall trees have been cut down by some thieves",
        (4, 12): "stole",        # Somebody --- (steal) → معلوم!
        (4, 14): "invented",     # Bell --- (invent) → معلوم!
        (5, 5): "was",           # It is made in 1980 → was
        (5, 11): "has been repaired",
        (7, 15): "aren’t I",
        (7, 19): "is there",
        (7, 20): "shall we",
    }
    vals = {1: s1, 2: s2, 3: s3, 4: s4, 5: s5, 7: s7}
    keys = {1: k1, 2: k2, 3: k3, 4: k4, 5: k5, 7: k7}
    for (sec, n), frag in TYPE_LOCKS.items():
        if sec in (4, 5, 7):
            assert keys[sec][n] == frag, f"کلید S{sec}-{n}={keys[sec][n]!r}!={frag!r}"
        else:
            assert frag in keys[sec][n], f"کلید S{sec}-{n} فاقد {frag!r}: {keys[sec][n]!r}"

    MCQ_LOCKS = {
        1: "has been stolen", 3: "were invited", 7: "have been built",
        9: "are caused", 12: "was written", 14: "covers",
        17: "have been solved", 19: "were asked", 20: "was given",
    }
    for n, opt in MCQ_LOCKS.items():
        stem, opts = s6[n]
        letter = k6[n]
        assert opts["abcd".index(letter)] == opt, f"MCQ Q{n}={opts} حرف {letter}≠{opt!r}"

    # خلوص انگلیسی
    for sec, items in vals.items():
        for n, t in items.items():
            assert not PERSIAN.search(t), f"S{sec}-{n} نشت فارسی: {t!r}"
    for n, (st, opts) in s6.items():
        assert not PERSIAN.search(st), f"S6-{n} نشت فارسی"
        assert len(set(opts)) == 4, f"S6-{n} گزینه تکراری: {opts}"

    # دوخالی‌های چاپی S4: فقط ۵/۶/۹/۱۳/۱۵ (بر روی ساقهٔ نرمال‌شده)
    for n in (5, 6, 9, 13, 15):
        assert norm_stem(s4[n]).count(BLANK) == 2, f"S4-{n} دوخالی نیست: {norm_stem(s4[n])!r}"
    for n in (1, 2, 3, 4, 7, 8, 10, 11, 12, 14):
        assert norm_stem(s4[n]).count(BLANK) == 1, f"S4-{n} خالی ≠ ۱: {norm_stem(s4[n])!r}"

    # ---- ساخت درس‌ها ----
    def typed_lesson(num, title, level, sec_items, sec_keys, id_prefix, slash_join=False):
        qs = []
        values = [sec_keys[i] for i in sorted(sec_keys)]
        for i, n in enumerate(sorted(sec_keys)):
            key = sec_keys[n]
            if slash_join:
                key = re.sub(r"\s*/\s*", " ", key)
            stem = norm_stem(sec_items[n])
            wrong = cyclic_scaffolds(values, i)
            assert len(set(wrong)) == 3, f"{id_prefix}-{n} داربست تکراری"
            qs.append({
                "id": f"{id_prefix}-{n}", "n": n, "category": "grammar",
                "kind": "typed", "question": stem,
                "options": [key] + wrong, "answer": 0, "accepted": [key],
            })
        return {"lesson": num, "title": title, "level": level,
                "count": len(qs), "questions": qs}

    lessons_new = [
        typed_lesson(15, "تشریحی — مجهول‌سازی حال ساده (ص۵۰)", "آموزشی — ورود آزاد", s1, k1, "g12-dpass1"),
        typed_lesson(16, "تشریحی — مجهول‌سازی گذشته ساده (ص۵۰)", "آموزشی — ورود آزاد", s2, k2, "g12-dpass2"),
        typed_lesson(17, "تشریحی — مجهول‌سازی حال کامل (ص۵۱)", "آموزشی — ورود آزاد", s3, k3, "g12-dpass3"),
        typed_lesson(18, "تشریحی — شکل صحیح فعل (ص۵۱)", "آموزشی — ورود آزاد", s4, k4, "g12-dverb", slash_join=True),
        typed_lesson(19, "تشریحی — پیدا و اصلاح خطا (ص۵۲)", "آموزشی — ورود آزاد", s5, k5, "g12-dfix"),
    ]

    q20 = []
    for n in range(1, 21):
        st, opts = s6[n]
        q20.append({
            "id": f"g12-dmcq-{n}", "n": n, "category": "grammar",
            # kind حذف — قرارداد خانواده: غایب یعنی mcq
            "question": st, "options": opts, "answer": "abcd".index(k6[n]),
        })
    lessons_new.append({
        "lesson": 20, "title": "تشریحی — تست چهارگزینه‌ای (ص۵۲-۵۳)",
        "level": "استاندارد", "count": len(q20), "questions": q20,
    })

    lessons_new.append(
        typed_lesson(21, "تشریحی — عبارات الحاق (ص۵۳-۵۴)", "آموزشی — ورود آزاد", s7, k7, "g12-dtag"))

    with open(OUT, encoding="utf-8") as f:
        data = json.load(f)
    lessons = data["lessons"]
    re_run = any(l["lesson"] >= 15 for l in lessons)
    lessons[:] = [l for l in lessons if l["lesson"] < 15]
    if re_run:
        data["source"].pop("diagnostic", None)
    lessons.extend(lessons_new)

    data["source"]["diagnostic"] = {
        "pages": "50-54",
        "topic": "آزمون تشریحی بخش گرامر و نگارش درس اول — ۷ بخش (مجهول‌سازی سه‌زمان + شکل فعل + اصلاح خطا + MCQ + الحاق)",
        "questions": 94,
        "keyType": "کلید کامل ص۱۹۳-۱۹۴ («کلید آزمون تشریحی گرامر درس اول، صفحه 50 تا 54») — جملهٔ کامل/شکل فعل/تصحیح پرانتزی/حرف گرید/تگ",
        "typedMode": "بانک‌های ۱۵-۱۹ و ۲۱: kind=typed + accepted (داربست = سه آیتم بعدیِ همان بخش، چرخه‌ای)؛ آیتم‌های دوخالی S4 (۵/۶/۹/۱۳/۱۵) کلید اسلش‌دار چاپی با فاصله accepted شد",
        "translations": "غیبت صادقانه — بدنهٔ آزمون تشریحی ترجمه چاپی ندارد (الگوی r281-r283)",
        "printedDups": "S6-5==ص۳۸ Q14 (g12-pass2-14) و S6-7==ص۳۸ Q16 (g12-pass2-16): خود جزوه این دو سؤال را در دو آزمون چاپ کرده — کلیدهای هر جفت یکسان (has been invited / have been built) با ترتیب گزینهٔ متفاوت؛ الگوی ERRATA_DUP r281",
        "deferred": "بخش ۸ (۱۲ آیتم کامل کنید and/or/but/so) و بخش ۹ (متن ۴خالی) ص۵۴ با کلید ص۱۹۴ — راند آینده",
        "extractedRound": 287,
    }

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
        f.write("\n")

    total = sum(l["count"] for l in lessons)
    print(f"OK — lessons 15-21 spliced (94 items); family now {len(lessons)} banks / {total} tests")
    print("S4 sample Q5:", norm_stem(s4[5]), "->", re.sub(r"\s*/\s*", " ", k4[5]))
    print("S6 sample Q1:", s6[1])
    print("S7 sample Q15:", norm_stem(s7[15]), "->", k7[15])

if __name__ == "__main__":
    main()
