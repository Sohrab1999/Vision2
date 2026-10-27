#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r379 — خانوادهٔ هشتمِ جزوهٔ هشتم: «نمونه سؤالات امتحانی ترم اول و دوم» (جلدِ pdf-p73)
→ آزمونِ چاپیِ دارایِ لایهٔ «آزمون پایانی نیمسال دوم» (pdf-p89-91) → tests-g8.json
با ۳ بانکِ تازه (l17=۸ آیتمِ س۲؛ l18=۵ آیتمِ س۴؛ l19=۵ آیتمِ س۵) — ۱۶ بانکِ قبلی + این = ۱۷ بانک/۷۰ آیتم

ساختار آزمون (۵ سکشن، بارمِ چاپی ۱۰ نمره، ۶۰ دقیقه، طراح: حسن لطفی — دبیرستان هشت شهریور بوکان):
  س۱ (ص۸۹، بارم ۱)   تصویری-کلید: ۴ جملهٔ تیک/ضربدر + ۴ تصویر (هواپیما/عکاس/TV/اسب‌سواری) — مستثنی
  س۲ (ص۸۹-۹۰)        ۸ MCQِ سه‌گزینه‌ای — مکالمه‌پاسخِ ساختاری — بانکِ l17
  س۳ (ص۹۰، بارم ۳)   تصویری-کلید: ۴ ساقهٔ پاسخِ آزاد + ۴ تصویر (برف/TV/آشپز/پزشک) — مستثنی
  س۴ (ص۹۰، بارم ۲.۵) متنِ ۵ بلنکه با بانکِ ۵ برچسبِ چاپیِ تصاویر (mechanic/chess/fields/backache/rainy) — بانکِ l18
  س۵ (ص۹۱، بارم ۲.۵) جدولِ درک‌متنِ «Tom Anderson» با ۵ ستون — بانکِ l19 (گزینه‌های هم‌متنِ یک‌نقش‌به‌خانه)

چینشِ گزینه‌های l17: ترتیبِ چاپِ A/B/C حفظ شد؛ فقط q4/q5/q6 چرخیدند تا سه‌کلیدِ پیاپیِ
چاپی (South/England/can = C/C/C) منحل شود — الگویِ ضدِ حدسِ r371.
idempotent: اجرای دوم NO-OP.
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
OUT = ROOT / "public/jozve/tests-g8.json"
LAYER = ROOT / "booklet-extract/g8.txt"

d = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else None
if d and "g8jame" in d.get("source", {}):
    print("r379: receipt g8jame already present — NO-OP")
    raise SystemExit(0)
assert d and "g8exam7" in d.get("source", {}), "tests-g8.json (r378) must exist first"

layer = LAYER.read_text(encoding="utf-8").split("\n")
PM = {}
for i, l in enumerate(layer):
    m = re.match(r"<<<PAGE (\d+)>>>", l)
    if m: PM[int(m.group(1))] = i


def page_slice(p: int) -> list[str]:
    s = PM[p]
    e = next((v for q, v in sorted(PM.items()) if q > p), len(layer))
    return layer[s:e]


def cells(line: str) -> list[str]:
    return [c.strip() for c in re.split(r"\s{2,}", line.strip()) if c.strip()]


def q(id_: str, n: int, category: str, question: str, options: list[str], answer: int):
    return {"id": id_, "n": n, "category": category, "question": question, "options": options, "answer": answer}


p89 = page_slice(89)
p90 = page_slice(90)
p91 = page_slice(91)
full89_91 = "\n".join(p89 + p90 + p91)


def seg(a: list[str], start_marker: str, end_marker: str | None) -> list[str]:
    s = next(i for i, l in enumerate(a) if start_marker in l)
    e = next((i for i, l in enumerate(a) if end_marker and end_marker in l), len(a))
    return a[s:e] if e > s else a[s:]


# ————— پیمانِ سربرگِ آزمون (ص۸۹) —————
assert any("آزمون پایانی نیمسال دوم" in l for l in p89)
assert any("حسن لطفی" in l for l in p89), "طراح"
assert any("هشت شهریور" in l for l in p89), "دبیرستان"
assert any("آذربایجان غربی" in l for l in p89), "اداره کل"
assert any("زبان انگلیسی پایه هشتم" in l for l in p89)
assert any(re.search(r"1401", l) for l in p89)

# ————— پیمانِ لایه: سربرگ و چهار ساقهٔ س۱ (تصویری — مستثنی) —————
assert any("باتوجه به تصاویر جمالت درست را با تیک و جمالت نادرست را با ضربدر مشخص کنید" in l for l in p89)
S1_STEMS = ["1-There is a bridge.", "2-He can take photos.",
            "3-I watch TV in my free time.", "4-He is good at plying football."]
s1_flat: list[str] = []
for l in p89:
    if l.strip().startswith("1-There") or l.strip().startswith("3-I watch"):
        s1_flat.extend(cells(l))
assert s1_flat == S1_STEMS, s1_flat

# ————— پیمانِ لایه: سربرگِ س۲ —————
assert any("از میان جوابهای داده شده به هر سوال بهترین گزینه را انتخاب کنید" in l for l in p89)
assert any(l.strip() == ".بنویسید" for l in p89), "سرخطِ دومِ س۲ (نقطهٔ آغازینِ RTL)"

# ————— تجزیه‌گرِ س۲: ساقه‌ها + سه‌گزینه‌های چاپی (A/B/C با نشانه‌های درون‌خطی/خطِ جدا) —————
def s2_block(pagelines: list[str], nums: list[int], start_marker: str) -> tuple[dict[int, str], dict[int, dict[str, str]]]:
    s = next(i for i, l in enumerate(pagelines) if start_marker in l)
    e = next((i for i, l in enumerate(pagelines) if "با استفاده از تصاویر" in l), len(pagelines))
    block = pagelines[s:e]
    stems: dict[int, str] = {}
    frags: dict[int, list[str]] = {n: [] for n in nums}
    cur: int | None = None
    for l in block:
        t = l.strip()
        m = re.match(r"^(\d)-\s+(.*)$", t)
        if m and int(m.group(1)) in nums:
            cur = int(m.group(1))
            stems[cur] = m.group(2).rstrip()
            continue
        if cur is not None and t and not re.fullmatch(r"\d", t):
            frags[cur].append(l)
    opts: dict[int, dict[str, str]] = {}
    for n in nums:
        buckets: dict[str, list[str]] = {"A": [], "B": [], "C": []}
        cursor: str | None = None
        for line in frags[n]:
            for c in cells(line):
                mm = re.match(r"^([ABC])\)\s*(.*)$", c)
                if mm:
                    cursor = mm.group(1)
                    if mm.group(2).strip():
                        buckets[cursor].append(mm.group(2).strip())
                else:
                    assert cursor is not None, (n, c)
                    buckets[cursor].append(c)
        opts[n] = {k: " ".join(v) for k, v in buckets.items()}
    return stems, opts


stems89, opts89 = s2_block(p89, [1, 2, 3, 4], "از میان جوابهای داده شده")
stems90, opts90 = s2_block(p90, [5, 6, 7, 8], "5- Can you play chess")
stems_s2 = {**stems89, **stems90}
opts_s2 = {**opts89, **opts90}

S2_STEM_EXP = {
    1: "How is the weather?................",
    2: "What's the matter?...............",
    3: "Where is Ahvaz?...............",
    4: "Where is he from?.............",
    5: "Can you play chess?.............",
    6: "What's your hobby?..............",
    7: "What days do you go to the library?................",
    8: "Is there a metro system in your city?  Yes…………….",
}
assert stems_s2 == S2_STEM_EXP, stems_s2

S2_OPTS_EXP = {
    1: {"A": "It is hot", "B": "It is in the west", "C": "It is over there"},
    2: {"A": "I am from Tehran", "B": "I have a headache", "C": "I go to school"},
    3: {"A": "It is hot in summer", "B": "It is rainy", "C": "It is in the South."},
    4: {"A": "He is a mechanic", "B": "He can draw", "C": "He is from England"},
    5: {"A": "Yes, I am", "B": "Yes, he is", "C": "Yes, I can"},
    6: {"A": "I play football as a hobby", "B": "I am good", "C": "I can search the web"},
    7: {"A": "On Mondays", "B": "At 06.00 o'clock", "C": "In the morning"},
    8: {"A": "It is", "B": "there is", "C": "there are"},
}
assert opts_s2 == S2_OPTS_EXP, "\n".join(f"{k}: {v}" for k, v in opts_s2.items())


def norm_stem(raw: str) -> str:
    s = re.sub(r"\s{2,}", " ", raw)
    # نقطه‌چینِ مختلطِ چاپ (… و . درهم) → بلنکِ استانداردِ کارت (چسبیده به واژهٔ پیشین)
    s = re.sub(r"[….]{4,}", "-------", s)
    return s


S2_STEMS_NORM = {n: norm_stem(s) for n, s in stems_s2.items()}
assert S2_STEMS_NORM[1] == "How is the weather?-------"
assert S2_STEMS_NORM[8] == "Is there a metro system in your city? Yes-------"

# ————— بانک l17 — س۲: ۸ MCQِ سه‌گزینه‌ای؛ ترتیبِ چاپ A/B/C به‌جز چرخشِ q4/q5/q6 (ضدِ سه‌کلیدِ پیاپیِ C/C/C چاپ) —————
Q17 = [
    q("g8-l17-1", 1, "vocab", S2_STEMS_NORM[1], ["It is hot", "It is in the west", "It is over there"], 0),
    q("g8-l17-2", 2, "vocab", S2_STEMS_NORM[2], ["I am from Tehran", "I have a headache", "I go to school"], 1),
    q("g8-l17-3", 3, "vocab", S2_STEMS_NORM[3], ["It is hot in summer", "It is rainy", "It is in the South."], 2),
    # چرخش: England از C به B — کلیدهای پیاپیِ چاپ (C/C/C) می‌شکنند
    q("g8-l17-4", 4, "vocab", S2_STEMS_NORM[4], ["He is a mechanic", "He is from England", "He can draw"], 1),
    # چرخش: I can از C به A
    q("g8-l17-5", 5, "vocab", S2_STEMS_NORM[5], ["Yes, I can", "Yes, I am", "Yes, he is"], 0),
    # چرخش: I play football از A به C
    q("g8-l17-6", 6, "vocab", S2_STEMS_NORM[6], ["I am good", "I can search the web", "I play football as a hobby"], 2),
    q("g8-l17-7", 7, "vocab", S2_STEMS_NORM[7], ["On Mondays", "At 06.00 o'clock", "In the morning"], 0),
    q("g8-l17-8", 8, "vocab", S2_STEMS_NORM[8], ["It is", "there is", "there are"], 1),
]
assert [it["answer"] for it in Q17] == [0, 1, 2, 1, 0, 2, 0, 1]
for n, it in enumerate(Q17, 1):
    exp = S2_OPTS_EXP[n]
    assert sorted(it["options"]) == sorted(exp.values()), it["id"]  # همان سه‌تاییِ چاپ — فقط چینش
for a, b in zip(Q17, Q17[1:]):
    assert not (a["answer"] == b["answer"]), "no consecutive equal key positions"

# ————— پیمانِ لایه: سربرگ و ساقه‌های س۳ (تصویری — مستثنی) —————
assert any("با استفاده از تصاویر داده شده به سواالت زیر جواب دهید" in l for l in p90)
S3_STEMS = ["How is the weather?  It is …………………….",
            "What do you do as a hobby?  I ………………………………",
            "Is he good at playing tennis?  No, he is good at……………………….",
            "He has a Flu. He should…………………………."]
p90_s3 = p90[next(i for i, l in enumerate(p90) if "با استفاده از تصاویر" in l):
             next(i for i, l in enumerate(p90) if "متن زیر دارای تصاویری" in l)]
s3_flat = [l.strip().split("-", 1)[1].strip() for l in p90_s3 if re.match(r"^[1-4]-\s", l.strip())]
assert s3_flat == S3_STEMS, s3_flat

# ————— پیمانِ لایه: سربرگ و پنج ساقهٔ س۴ (متنِ بلنک‌دار با بانکِ برچسبِ تصاویر) —————
assert any("متن زیر دارای تصاویری است شما با توجه به تصاویر کلمات مناسب را در جاهای خالی بگذارید" in l for l in p90)
S4_RAW = ["Hello. I am Ali. I am a …………...………………. and I am from Iran.",
          "It is a ……………………. and cloudy country in winter.",
          "there are many ………………......, restaurant and famous buildings.",
          "I walk in a park in my free time. I play …………….………... as a hobby.",
          "Today, I have a ………...……………… and I should rest at home."]
p90_s4 = p90[next(i for i, l in enumerate(p90) if "متن زیر دارای تصاویری" in l):]
s4_flat = [l.strip().split("-", 1)[1].strip() for l in p90_s4 if re.match(r"^[1-5]-", l.strip())]
assert s4_flat == S4_RAW, s4_flat
S4_STEMS_NORM = [norm_stem(s) for s in S4_RAW]
assert S4_STEMS_NORM == [
    "Hello. I am Ali. I am a ------- and I am from Iran.",
    "It is a ------- and cloudy country in winter.",
    "there are many -------, restaurant and famous buildings.",
    "I walk in a park in my free time. I play ------- as a hobby.",
    "Today, I have a ------- and I should rest at home.",
]

# بانکِ ۵ برچسبِ چاپیِ تصاویر (رندرِ ۱۵۰dpi ص۹۰: mechanic | chess | fields | backache | rainy)
POOL = ["mechanic", "chess", "fields", "backache", "rainy"]
# لنگرهای درس‌درونِ هر واژه (صفحه از نقشهٔ لایه)
def page_of(pattern: str) -> int:
    for p in sorted(PM):
        if re.search(pattern, "\n".join(page_slice(p))):
            return p
    raise AssertionError(pattern)
ANCHOR_PAGES = {
    "mechanic": page_of(r"school – backache – mechanic – zucchini"),
    "chess": page_of(r"Speak – read – type – chess"),
    "fields": page_of(r"Are there any fields\?"),
    "backache": page_of(r"backache\*"),
    "rainy": page_of(r"rainy\*"),
}
assert ANCHOR_PAGES == {"mechanic": 40, "chess": 35, "fields": 54, "backache": 36, "rainy": 51}, ANCHOR_PAGES

Q18 = [
    q("g8-l18-1", 1, "vocab", S4_STEMS_NORM[0], ["chess", "rainy", "mechanic", "fields", "backache"], 2),
    q("g8-l18-2", 2, "vocab", S4_STEMS_NORM[1], ["rainy", "mechanic", "backache", "chess", "fields"], 0),
    q("g8-l18-3", 3, "vocab", S4_STEMS_NORM[2], ["mechanic", "chess", "rainy", "backache", "fields"], 4),
    q("g8-l18-4", 4, "vocab", S4_STEMS_NORM[3], ["fields", "chess", "backache", "rainy", "mechanic"], 1),
    q("g8-l18-5", 5, "vocab", S4_STEMS_NORM[4], ["rainy", "fields", "chess", "backache", "mechanic"], 3),
]
S4_KEYS = ["mechanic", "rainy", "fields", "chess", "backache"]  # کلیدِ هر بلنک به ترتیبِ خانه‌های متن
assert [it["options"][it["answer"]] for it in Q18] == S4_KEYS
assert [it["answer"] for it in Q18] == [2, 0, 4, 1, 3]
for it in Q18:
    assert sorted(it["options"]) == sorted(POOL) and len(set(it["options"])) == 5, it["id"]

# ————— پیمانِ لایه: س۵ — سربرگ + متنِ سه‌خطی + پنج ستونِ جدول —————
assert any("جدول زیر را با توجه به متن کامل کنید" in l for l in p91)
PASSENGER = [l.strip() for l in p91 if l.strip().startswith("Hi. My name is Tom") or
             l.strip().startswith("student. I can search") or l.strip().startswith("time. I like swimming")]
PASSAGE = " ".join(PASSENGER)
PASSAGE = re.sub(r"\s{2,}", " ", PASSAGE).strip()
assert PASSAGE == ("Hi. My name is Tom Anderson. I am 12 years old. I am Spanish. I am a "
                   "student. I can search the Web very well. I usually read books in my free "
                   "time. I like swimming as my hobby."), PASSAGE
i_name = next(i for i, l in enumerate(p91) if l.strip() == "Name")
COLS = [l.strip() for l in p91[i_name:i_name + 8] if l.strip()][:5]
assert COLS == ["Name", "Nationality", "Hobby", "age", "Free time"], COLS

# پنج سلولِ جدول از خودِ متن — استخرِ هم‌متن با یک‌نقش‌به‌خانه (الگویِ r378-بانک۱۶)
UNIVERSE = ["Tom Anderson", "Spanish", "swimming", "12", "read books"]
Q19 = [
    q("g8-l19-1", 1, "vocab", f"{PASSAGE} — «Name» در جدولِ متن: -------",
      ["Tom Anderson", "Spanish", "swimming", "12", "read books"], 0),
    q("g8-l19-2", 2, "vocab", f"{PASSAGE} — «Nationality» در جدولِ متن: -------",
      ["swimming", "12", "read books", "Tom Anderson", "Spanish"], 4),
    q("g8-l19-3", 3, "vocab", f"{PASSAGE} — «Hobby» در جدولِ متن: -------",
      ["12", "read books", "Tom Anderson", "swimming", "Spanish"], 3),
    q("g8-l19-4", 4, "vocab", f"{PASSAGE} — «age» در جدولِ متن: -------",
      ["read books", "Tom Anderson", "12", "Spanish", "swimming"], 2),
    q("g8-l19-5", 5, "vocab", f"{PASSAGE} — «Free time» در جدولِ متن: -------",
      ["Tom Anderson", "read books", "swimming", "Spanish", "12"], 1),
]
assert [it["options"][it["answer"]] for it in Q19] == UNIVERSE
assert [it["answer"] for it in Q19] == [0, 4, 3, 2, 1]
for it in Q19:
    assert sorted(it["options"]) == sorted(UNIVERSE) and len(set(it["options"])) == 5, it["id"]
# هر سلول دقیقاً یک نقش: پنج ساقه = پنج ستون و پنج کلید = همان پنج سلول
stems_cols = [re.search(r"«(.+?)» در جدول", it["question"]).group(1) for it in Q19]
assert stems_cols == COLS

# ————— درج در سند —————
B17 = {"lesson": 17, "title": "امتحانی جامع — بهترین پاسخِ مکالمه (س۲، ص۸۹)", "level": "سه‌گزینه‌ای",
       "count": len(Q17), "questions": Q17}
B18 = {"lesson": 18, "title": "امتحانی جامع — تکمیل متن با بانک تصویری (س۴، ص۹۰)", "level": "پنج‌گزینه‌ای",
       "count": len(Q18), "questions": Q18}
B19 = {"lesson": 19, "title": "امتحانی جامع — جدولِ درک‌متن (س۵، ص۹۱)", "level": "پنج‌گزینه‌ای",
       "count": len(Q19), "questions": Q19}
for b in (B17, B18, B19):
    assert b["count"] == len(b["questions"])
    d["lessons"].append(b)

d["source"]["g8jame"] = {
    "extractedRound": "r379",
    "section": "نمونه سؤالات امتحانی ترم اول و دوم پایه هشتم — آزمونِ چاپیِ «آزمون پایانی نیمسال دوم» (خانوادهٔ هشتمِ بیرونِ نقشهٔ درس‌به‌درس)",
    "examPages": "جلدِ خانواده pdf-p73 (تنها سربرگِ «نمونه سواالت امتحانی ترم اول و دوم»)؛ ص۷۴-۸۸ اسکنِ تصویریِ خارجِ لایه (پروبِ r379: صفر خطِ غیرِ فوتر)؛ آزمونِ چاپیِ دارایِ لایه: pdf-p89-91 (فوترِ خودِ اسکن: ۸۹/۹۰/۹۱)؛ ص۹۲ «ضمائم» = مرزِ پایانی (ص۹۳-۱۰۱ جداولِ مرجع‌اند نه آزمون)",
    "examMeta": "آزمون پایانی نیمسال دوم — زبان انگلیسی پایه هشتم — سال تحصیلی ۱۴۰۱-۱۴۰۰ (تاریخ: ۱۴۰۱/۳) — مدت ۶۰ دقیقه — ۵ سوال — بارم ۱۰ نمره — ۲ صفحه — طراح: حسن لطفی — دبیرستان: هشت شهریور — اداره آموزش و پرورش شهرستان بوکان / اداره کل آذربایجان غربی",
    "keyPages": "هیچ پاسخنامهٔ چاپی نیست — کلیدها استنتاجیِ ساختاری؛ لنگرهای واژگانیِ بانکِ س۴ در جدولِ anchorPages؛ بانکِ س۵ گزینه‌ها را از پنج سلولِ خودِ متن می‌گیرد (یک‌نقش‌به‌خانه — الگویِ r378-بانک۱۶)",
    "sectionsTotal": 5,
    "sectionsExtracted": 3,
    "sectionsSkipped": 2,
    "items": 18,
    "bankCounts": [8, 5, 5],
    "optionRotation": "ل۱۷: ترتیبِ چاپِ A/B/C حفظ شد به‌جز q4/q5/q6 — چاپ سه کلیدِ پیاپیِ C/C/C داشت (South/England/can) که با چرخشِ همین سه‌تایی‌های چاپی منحل شد؛ کلیدها [0,1,2,1,0,2,0,1] بدونِ دوکلیدِ پیاپی. ل۱۸: پنج‌چینشِ متمایز از خودِ بانکِ ۵واژه‌ای، کلیدها [2,0,4,1,3]. ل۱۹: گزینه‌ها = کلِ پنج سلولِ جدول، کلیدها [0,4,3,2,1]",
    "keyPolicy": "س۲: پاسخِ مکالمه‌ایِ یکتا (هوا→It is hot؛ matter→headache؛ Ahvaz→the South؛ from→England؛ can→Yes, I can؛ hobby→I play football؛ days→On Mondays؛ there-be→there is)؛ س۴: هر بلنک دقیقاً یک واژهٔ بانک را می‌پذیرد (شغل a/mechanic؛ آب‌وهوای وصفی rainy؛ مکانِ many/fields؛ بازیِ play/chess؛ بیماریِ have a/backache)؛ س۵: پنج سلولِ جدول از متن (Name=Tom Anderson؛ Nationality=Spanish؛ Hobby=swimming؛ age=12؛ Free time=read books از «I usually read books in my free time.»)",
    "engineNote": "هر ۱۸ آیتم MCQ بدونِ تایپی (قراردادِ r363)؛ l17 سه‌گزینه‌ای و l18/l19 پنج‌گزینه‌ای — نخستین بانکِ پنج‌گزینه‌ایِ خالصِ کارت با بانکِ چاپیِ ۵تایی؛ ساقه‌های l19 ترکیبیِ لاتین(متن)+فارسی(درخواستِ خانه) — استثنایِ ششمِ خلوصِ لاتینِ کارت (بانک‌های ۳/۶/۱۲/۱۴/۱۶/۱۹)؛ ساقه‌های l17/l18 نقطه‌چینِ چاپ به «-------» نرمال شد (چسبیده به واژهٔ پیشین — الگویِ g7exam8)",
    "derivedKeys": {
        "S2": ["It is hot", "I have a headache", "It is in the South.", "He is from England",
               "Yes, I can", "I play football as a hobby", "On Mondays", "there is"],
        "S4": ["mechanic", "rainy", "fields", "chess", "backache"],
        "S5": ["Tom Anderson", "Spanish", "swimming", "12", "read books"],
    },
    "anchorPages": ANCHOR_PAGES,
    "skippedSections": [
        "ص۸۹-س۱ (تصویری، بارم ۱): «باتوجه به تصاویر جملات درست را با تیک و جملات نادرست را با ضربدر مشخص کنید» — چهار جملهٔ چاپی (There is a bridge/He can take photos/I watch TV in my free time/He is good at plying football) و چهار تصویرِ رندر (چپ→راست): ۱=هواپیمای فرودگاه ۲=پسرِ عکاس با دوربین ۳=مردِ نشسته جلوی تلویزیون ۴=سوار بر اسب — داوری: ق۱ غلط (هواپیما نه پل ✗)، ق۲ درست (✓)، ق۳ درست (✓)، ق۴ غلط (اسب‌سواری ✗) — کلید در تصویر است نه ساقه؛ QuizQuestion فیلدِ تصویر ندارد (الگویِ r370+)",
        "ص۹۰-س۳ (تصویری، بارم ۳): «با استفاده از تصاویر داده شده به سوالات زیر جواب دهید» — چهار ساقهٔ چاپی و چهار تصویرِ رندر (چپ→راست): ۱=خانهٔ برفی ۲=پسرِ جلوی TV ۳=آشپز ۴=پزشک — داوری: 1→snowy، 2→watch TV، 3→cooking، 4→see a doctor — تصویری-تولیدی و بدونِ تصویر بی‌پاسخ",
        "ص۷۴-۸۸ (اسکنِ تصویری): پانزده صفحهٔ «نمونه سؤالات امتحانی ترم اول و دوم» کاملاً بیرونِ لایهٔ متنی‌اند (پروبِ r379: فقط فوتر) — نوبتِ اول/دومِ اسکن‌شده؛ نیازمندِ پشتیبانیِ تصویری/OCR — خارجِ ظرفیتِ بانکِ متنی",
    ],
    "printQuirks": [
        "«جمالت» در سربرگِ س۱ (شکستنِ لام‌الف — کوئیرکِ لایه‌ایِ شناخته‌شدهٔ r376/r378) و «باتوجه» چسبیده (با توجه)",
        "تایپوی چاپی «plying» برای playing در س۱ق۴ — verbatim در ساقهٔ مستثنی",
        "«1-There is a bridge.» بی‌فاصله پس از خط‌تیره (س۱) در برابرِ «1- How» فاصله‌دار (س۲/س۳/س۴) — هر دو verbatim لایه",
        "«4-I walk» بی‌فاصله پس از شماره در س۴ق۴؛ «3- there are many» با حرفِ کوچکِ آغازین — verbatim",
        "ساقه‌های س۲ نقطه‌چینِ انتهاییِ چاپی دارند («?................») و ساقهٔ ق۸ «Yes…………….» — هر دو به «-------» نرمال شدند (چسبیده به واژهٔ پیشین)",
        "سربرگ‌های سکشن با نقطهٔ آغازینِ RTL (« .با استفاده از…»، « .متن زیر…»، «. جدول زیر…»، « .بنویسید») — کوئیرکِ لایه",
        "جدولِ س۵: «age» با a کوچکِ چاپی در برابرِ Name/Nationality/Hobby/Free time بزرگ — verbatim در ساقه‌ها",
        "«At 06.00 o'clock» آپاستروفِ مستقیمِ چاپ — verbatim در گزینه",
        "سربرگِ آزمون: «سال ی تول د،دانش ان ی بن و اشتغال آفر ی ن» و «ویژه دانش آموزان حضــــوری» — شکستگی‌های لایه (رندر درست است)",
        "«تعداد سوال5» و «: تعداد صفحه2» — چسبندگیِ دونقطه/عدد در لایه",
    ],
    "scansNote": "خانوادهٔ جامع دو لایه دارد: ۱۵ صفحهٔ اسکنِ تصویری (ص۷۴-۸۸) + یک آزمونِ چاپیِ لایه‌دار (ص۸۹-۹۱). فقط دومی بانک گرفت؛ فهرستِ اسکن‌ها برای پشتیبانیِ تصویریِ آینده در این رسید ثبت شد",
}
fam = {"lesson": "جامعِ ترم اول و دوم", "pdfPage": 73, "round": "r379",
       "status": "استخراج شد — ۳ بانک/۱۸ آیتم از آزمونِ چاپیِ «آزمون پایانی نیمسال دوم» ص۸۹-۹۱ (۵ سکشن: س۲/س۴/س۵ استخراج؛ س۱/س۳ تصویری مستثنی با داوری) — ص۷۴-۸۸ اسکنِ تصویریِ بیرونِ لایه (رسیدِ g8jame)"}
d["source"]["g8familyMap"]["families"].append(fam)
d["source"]["g8familyMap"]["lastUpdatedRound"] = "r379"
d["source"]["g8familyMap"]["note"] = (
    "نقشهٔ ۸ خانوادهٔ «نمونه سؤالات امتحانی» جزوهٔ هشتم — از جست‌وجوی لایه (پروبِ r369: همتایانِ درس‌به‌درس کامل‌اند؛ "
    "پروبِ r379 خانوادهٔ هشتمِ «ترم اول و دوم» را در ص۷۳ یافت — سربرگِ تک‌خطی که جست‌وجوی دوسطریِ درس‌ها آن را نمی‌گرفت)"
)

OUT.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(len(b["questions"]) for b in d["lessons"])
print(f"r379 OK — banks={len(d['lessons'])} items={total} (+18 in 3 banks: l17=8 l18=5 l19=5) — g8 family map 8/8")
