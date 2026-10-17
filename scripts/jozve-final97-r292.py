#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r292 — آزمون نهایی دی ۱۳۹۷ (Vision Three بخش چهارم، ص۲۲۹-۲۳۳؛ کلید/راهنمای تصحیح ص۲۳۴-۲۳۶)
نخستین نوبت از دوازده نوبتِ «آزمون‌های نهایی دی ۹۷ تا شهریور ۱۴۰۱».
۱۰ بانک / ۴۲ آیتم از ۱۳ بخش چاپی؛ بخش ۱ (listening ۱-۱۶ وابسته به صوت QR) و بخش ۱۳
(topic sentence ۴۳-۴۸ پاسخِ باز با داوری تصحیح‌کننده) غیبتِ صادقانه — کلیدهای چاپی در رسید.
نوهای راند: نخستین بانکِ تعریف‌های ۵گزینه‌ایِ واژگان با کلید حرف‌محورِ راهنمای تصحیح؛
نخستین بانکِ نقش‌های پاراگراف با بدنهٔ دو-بندی؛ ریدینگ دو-متن با تایپِ کلیدِ کاملِ چاپی.
"""
import json, re, sys, unicodedata
from pathlib import Path

ROOT = Path("/home/z/my-project")
BANK_PATH = ROOT / "public/jozve/grammar-g12-topic.json"
OCR_PATH = ROOT / "booklet-extract/g12.txt"

OCR = OCR_PATH.read_text(encoding="utf-8")

def norm(s: str) -> str:
    s = unicodedata.normalize("NFC", s)
    s = s.replace("…", "...")
    s = re.sub(r"[\"'`´‘’“”«»]", "", s)
    s = re.sub(r"[-‐‑‒–—―]{2,}", " BLNK ", s)
    s = re.sub(r"[-‐‑‒–—―]+", " ", s)
    s = re.sub(r"\.{3,}", " BLNK ", s)
    s = re.sub(r"\s*/\s*", "/", s)
    s = re.sub(r"\(\s+", "(", s)
    s = re.sub(r"\s+\)", ")", s)
    s = re.sub(r"\s+", " ", s).strip().lower()
    return s

OCR_N = norm(OCR)

def ocr_has(fragment: str) -> bool:
    return norm(fragment) in OCR_N

failures: list[str] = []
def require(cond: bool, msg: str) -> None:
    if not cond:
        failures.append(msg)

def q_typed(qid: str, n: int, question: str, options: list[str], accepted: list[str], placeholder: str | None = None) -> dict:
    q = {"id": qid, "n": n, "category": "grammar", "kind": "typed",
         "question": question, "options": options, "answer": 0, "accepted": accepted}
    if placeholder:
        q["placeholder"] = placeholder
    return q

def q_mcq(qid: str, n: int, question: str, options: list[str], key_letter: str, letters: str | None = None) -> dict:
    if letters is None:
        letters = "abcde"[: len(options)]
    return {"id": qid, "n": n, "category": "grammar",
            "question": question, "options": options, "answer": letters.index(key_letter)}

# ================================================================ S2 — واژگان: بانک ۵واژه‌ای، ۴ تایپی (ص۲۳۰، آیتم ۱۷-۲۰)
VOC_BANK_PRINTED = ["generate", "renewable", "convert", "turbine", "effect"]
K_VOC = {1: "convert", 2: "generate", 3: "effect", 4: "turbine"}  # آیتم چاپی ۱۷-۲۰
VOC_STEMS = {
    1: "Engineers design and make machines that measure wind and ......17.... wind into energy.",
    2: "They develop wind turbines that ......18.... electricity by considering the Earth's surface, wind direction, average outside temperature,",
    3: "the ......19.... by and on birds and insects, and the great forces on the ......",
    4: "and the great forces on the ......20….....",
}

def voc_scaffold(key: str) -> list[str]:
    i = VOC_BANK_PRINTED.index(key)
    others = [VOC_BANK_PRINTED[(i + k) % len(VOC_BANK_PRINTED)] for k in (1, 2, 3)]
    return [key] + others

LESSON_VOC = {
    "lesson": 59, "title": "نهایی دی ۹۷ — واژگان: جای خالی از بانک، بنویسید (ص۲۳۰)",
    "level": "آموزشی — ورود آزاد", "count": 4,
    "questions": [q_typed(f"g12-fin97-v{i}", i, VOC_STEMS[i], voc_scaffold(K_VOC[i]), [K_VOC[i]],
                          "fill in the blank with the word bank…") for i in range(1, 5)],
}

# ================================================================ S3 — تعریف‌ها: ۵ گزینهٔ چاپی (ص۲۳۰، آیتم ۲۱-۲۴)
DEF_OPTIONS = ["well-known", "in a quiet way", "to finish something",
               "to take something in, especially gradually",
               "the amount of a product or service that people want"]  # a..e عیناً چاپ
DEF_HEADS = {1: "calmly", 2: "Distinguished", 3: "Demand", 4: "Use up"}  # آیتم چاپی ۲۱-۲۴
K_DEF = {1: "b", 2: "a", 3: "e", 4: "c"}  # d اضافهٔ چاپی
LESSON_DEF = {
    "lesson": 60, "title": "نهایی دی ۹۷ — واژگان: تعریف‌ها، ۵ گزینهٔ چاپی (ص۲۳۰)",
    "level": "استاندارد", "count": 4,
    "questions": [q_mcq(f"g12-fin97-def{i}", i, DEF_HEADS[i], DEF_OPTIONS, K_DEF[i]) for i in range(1, 5)],
}

# ================================================================ S4 — ترکیب‌ها: ۵ گزینهٔ چاپی (ص۲۳۰، آیتم ۲۵-۲۸)
COL_OPTIONS = ["temperature", "the train", "a mistake", "no pains", "the needs"]  # a..e عیناً چاپ
COL_HEADS = {1: "spare", 2: "make", 3: "meet", 4: "take"}  # آیتم چاپی ۲۵-۲۸
K_COL = {1: "d", 2: "c", 3: "e", 4: "a"}  # b اضافهٔ چاپی (the train)
LESSON_COL = {
    "lesson": 61, "title": "نهایی دی ۹۷ — واژگان: ترکیب‌ها، ۵ گزینهٔ چاپی (ص۲۳۰)",
    "level": "استاندارد", "count": 4,
    "questions": [q_mcq(f"g12-fin97-col{i}", i, COL_HEADS[i], COL_OPTIONS, K_COL[i]) for i in range(1, 5)],
}

# ================================================================ S5 — شکل صحیح فعل: ۴ تایپی (ص۲۳۰-۲۳۱، آیتم ۲۹-۳۲)
VF_STEMS = {
    1: "The little boy --------------- the box, can't he? (to open)",
    2: "If I were you, I --------------- the old house. (to sell)",
    3: "The bill must --------------- before leaving the restaurant. (to pay)",
    4: "My mother was very angry with my sister because she --------------- the dishes. (not to wash)",
}
K_VF = {1: "can open", 2: "would sell", 3: "be paid", 4: "had not washed"}
VF_POOL = [K_VF[i] for i in range(1, 5)]

def vf_scaffold(key: str) -> list[str]:
    return [key] + [w for w in VF_POOL if w != key]

LESSON_VF = {
    "lesson": 62, "title": "نهایی دی ۹۷ — شکل صحیح فعل، بنویسید (ص۲۳۰-۲۳۱)",
    "level": "آموزشی — ورود آزاد", "count": 4,
    "questions": [q_typed(f"g12-fin97-vf{i}", i, VF_STEMS[i], vf_scaffold(K_VF[i]), [K_VF[i]],
                          "write the correct form of the verb…") for i in range(1, 5)],
}

# ================================================================ S6 — گرامر: ۴ MCQ (ص۲۳۱، آیتم ۳۳-۳۶)
G_STEMS = {
    1: "The man --------------- is wearing glasses is Reza's uncle.",
    2: "The letter --------------- by my father two hours ago.",
    3: "Ali's sister had an accident last week, ---------------?",
    4: "I couldn't figure --------------- What they were talking about.",
}
G_OPTIONS = {
    1: ["whom", "whose", "who", "which"],
    2: ["was posted", "posted", "was posting", "has posted"],
    3: ["did he", "did she", "didn't he", "didn't she"],
    4: ["off", "out", "at", "on"],
}
K_G = {1: "c", 2: "a", 3: "d", 4: "b"}
LESSON_G = {
    "lesson": 63, "title": "نهایی دی ۹۷ — گرامر: تست چهارگزینه‌ای (ص۲۳۱)",
    "level": "استاندارد", "count": 4,
    "questions": [q_mcq(f"g12-fin97-g{i}", i, G_STEMS[i], G_OPTIONS[i], K_G[i]) for i in range(1, 5)],
}

# ================================================================ S7 — مرتب‌کردن کلمات: ۲ تایپی (ص۲۳۱، آیتم ۳۷-۳۸)
WO_SCRAMBLES = {
    1: "very heavy / a bag / always / which / my brother / seems / carries .",
    2: "well, / should / so / has / study / tonight / tomorrow / an exam / she Mina.",
}
K_WO = {
    1: "My brother always carries a bag which seems very heavy.",
    2: "Mina has an exam tomorrow, so she should study well tonight.",
}
WO_POOL = [K_WO[i] for i in range(1, 3)]

def wo_scaffold(key: str) -> list[str]:
    return [key] + [s for s in WO_POOL if s != key]

LESSON_WO = {
    "lesson": 64, "title": "نهایی دی ۹۷ — مرتب‌کردن کلمات، بنویسید (ص۲۳۱)",
    "level": "آموزشی — ورود آزاد", "count": 2,
    "questions": [q_typed(f"g12-fin97-wo{i}", i, WO_SCRAMBLES[i], wo_scaffold(K_WO[i]), [K_WO[i]],
                          "write the complete sentence…") for i in range(1, 3)],
}

# ================================================================ S8 — کلمات ربط: ۴ تایپی (ص۲۳۱، آیتم ۳۹-۴۲)
CONN_STEMS = {
    1: "Mrs. Tehrani likes fish, --------------- her grandmother hates it.",
    2: "These shoes aren't comfortable, --------------- I rarely wear them.",
    3: "The woman washed the dishes, --------------- her daughter dried them.",
    4: "You can check this booklet, --------------- you may see our website.",
}
K_CONN = {1: "but", 2: "so", 3: "and", 4: "or"}
CONN_POOL = ["and", "or", "but", "so"]  # ترتیب چاپیِ پرانتز

def conn_scaffold(key: str) -> list[str]:
    return [key] + [w for w in CONN_POOL if w != key]

LESSON_CONN = {
    "lesson": 65, "title": "نهایی دی ۹۷ — کلمات ربط، کامل کنید (ص۲۳۱)",
    "level": "آموزشی — ورود آزاد", "count": 4,
    "questions": [q_typed(f"g12-fin97-conn{i}", i, CONN_STEMS[i], conn_scaffold(K_CONN[i]), [K_CONN[i]],
                          "complete with and / or / but / so…") for i in range(1, 5)],
}

# ================================================================ S12 — نقش‌های پاراگراف اسب‌ها: ۶ MCQ سه‌گزینه‌ای (ص۲۳۱-۲۳۲، آیتم ۴۹-۵۴؛ کلید ص۲۳۶)
ROLE_OPTIONS = ["Topic sentence", "Supporting sentence", "Concluding sentence"]
ROLE_STEMS = {
    1: "They are very useful farm animals.",                                     # ۴۹
    2: "They can easily run long distances.",                                    # ۵۰
    3: "They have long legs, which are very strong.",                            # ۵۱
    4: "Horses usually move in herds and live in a stable.",                     # ۵۲
    5: "They carry people and goods from one place to another.",                 # ۵۳
    6: "Horses are farm animals. They are usually black, grey, white and brown in color.",  # ۵۴
}
K_ROLE = {1: 2, 2: 1, 3: 1, 4: 1, 5: 1, 6: 0}  # abc — کلید چاپی ص۲۳۶: Concluding/Supporting×۴/Topic
LESSON_ROLE = {
    "lesson": 66, "title": "نهایی دی ۹۷ — نقش‌های پاراگراف اسب‌ها: تست (ص۲۳۱-۲۳۲)",
    "level": "استاندارد", "count": 6,
    "questions": [q_mcq(f"g12-fin97-role{i}", i, ROLE_STEMS[i], ROLE_OPTIONS, "abc"[K_ROLE[i]], "abc")
                  for i in range(1, 7)],
}

# ================================================================ S13a — ریدینگ دیکشنری‌ها: ۳ تایپی + ۲ درست/نادرست (ص۲۳۲، آیتم ۵۵-۵۹)
RD1_TYPED = {
    1: ("Which kind of dictionary is useful for beginners?", "Bilingual dictionary is useful for them."),
    2: ("What does the first half of a bilingual dictionary contain?",
        "It contains the English word along with their meaning in another language."),
    3: ("How many languages are used in a monolingual dictionary to explain the word meanings?",
        "One language is used in it."),
}
RD1_TF = {
    4: "A monolingual dictionary improves your English reading skills.",   # کلید a True
    5: "You can correct your pronunciation by using an electronic dictionary.",  # کلید a True
}
LESSON_RD1 = {
    "lesson": 67, "title": "نهایی دی ۹۷ — ریدینگ دیکشنری‌ها: پرسش پاسخ + درست/نادرست (ص۲۳۲)",
    "level": "استاندارد", "count": 5,
    "questions": [
        *[q_typed(f"g12-fin97-rd1-{i}", i, RD1_TYPED[i][0], [RD1_TYPED[i][1]], [RD1_TYPED[i][1]],
                  "answer in a complete sentence…") for i in range(1, 4)],
        *[q_mcq(f"g12-fin97-rd1-{i}", i, RD1_TF[i], ["True", "False"], "a", "ab") for i in range(4, 6)],
    ],
}

# ================================================================ S13b — ریدینگ معلمان: ۱ تایپی + ۲ تست + ۲ درست/نادرست (ص۲۳۳، آیتم ۶۰-۶۴)
RD2_TYPED = {
    1: ("What do teachers do to find tools and ways to help their students become successful?",
        "They attend conference and training sessions to find tools and ways to help their students become successful."),
}
RD2_MCQ = {
    2: ("What does the word essential in the first lime mean?",
        ["dedicated", "knowledgeable", "necessary", "productive"], "c"),
    3: ("What does the word \"then\" refer to?",
        ["subjects", "classes", "teachers", "students' names"], "d"),
}
RD2_TF = {
    4: ("Teachers are just busy when they are at school.", "b"),   # False
    5: ("The only things that students learn at school are reading and writing.", "b"),  # False
}
LESSON_RD2 = {
    "lesson": 68, "title": "نهایی دی ۹۷ — ریدینگ معلمان: تست + پرسش پاسخ (ص۲۳۳)",
    "level": "استاندارد", "count": 5,
    "questions": [
        *[q_typed(f"g12-fin97-rd2-{i}", i, RD2_TYPED[i][0], [RD2_TYPED[i][1]], [RD2_TYPED[i][1]],
                  "answer in a complete sentence…") for i in RD2_TYPED],
        *[q_mcq(f"g12-fin97-rd2-{i}", i, RD2_MCQ[i][0], RD2_MCQ[i][1], RD2_MCQ[i][2]) for i in RD2_MCQ],
        *[q_mcq(f"g12-fin97-rd2-{i}", i, RD2_TF[i][0], ["True", "False"], RD2_TF[i][1], "ab") for i in RD2_TF],
    ],
}

NEW_LESSONS = [LESSON_VOC, LESSON_DEF, LESSON_COL, LESSON_VF, LESSON_G,
               LESSON_WO, LESSON_CONN, LESSON_ROLE, LESSON_RD1, LESSON_RD2]

# ================================================================ داوری دوم — معناییِ مستقل
EXPECTED = {
    "voc": {1: "convert", 2: "generate", 3: "effect", 4: "turbine"},
    "def": {1: "b", 2: "a", 3: "e", 4: "c"},
    "col": {1: "d", 2: "c", 3: "e", 4: "a"},
    "vf": {1: "can open", 2: "would sell", 3: "be paid", 4: "had not washed"},
    "g": {1: "c", 2: "a", 3: "d", 4: "b"},
    "wo": {1: "My brother always carries a bag which seems very heavy.",
           2: "Mina has an exam tomorrow, so she should study well tonight."},
    "conn": {1: "but", 2: "so", 3: "and", 4: "or"},
    "role": {1: "Concluding", 2: "Supporting", 3: "Supporting", 4: "Supporting", 5: "Supporting", 6: "Topic"},
    "rd1tf": {4: "True", 5: "True"},
    "rd2mcq": {2: "c", 3: "d"},
    "rd2tf": {4: "False", 5: "False"},  # کلید چاپی b=نادرست ×۲
}
got = {
    "voc": K_VOC, "def": K_DEF, "col": K_COL, "vf": K_VF, "g": K_G, "wo": K_WO, "conn": K_CONN,
    "role": {i: ROLE_OPTIONS[K_ROLE[i]].replace(" sentence", "") for i in K_ROLE},
    "rd1tf": {i: "True" for i in RD1_TF},
    "rd2mcq": {i: RD2_MCQ[i][2] for i in RD2_MCQ},
    "rd2tf": {i: ("True" if RD2_TF[i][1] == "a" else "False") for i in RD2_TF},
}
for fam in EXPECTED:
    require(got[fam] == EXPECTED[fam], f"داوری دوم ناهمسان در {fam}: {got[fam]}")
# پاسخ‌های تایپیِ ریدینگ — عین کلید چاپی ص۲۳۶
require(RD1_TYPED[1][1] == "Bilingual dictionary is useful for them.", "کلید ۵۵ ناهمسان")
require(RD1_TYPED[2][1] == "It contains the English word along with their meaning in another language.", "کلید ۵۶ ناهمسان")
require(RD1_TYPED[3][1] == "One language is used in it.", "کلید ۵۷ ناهمسان")
require(RD2_TYPED[1][1].startswith("They attend conference and training sessions"), "کلید ۶۰ ناهمسان")

# ================================================================ راستی‌آزمایی حضورِ OCR — بدنه
for i, stem in VOC_STEMS.items():
    require(ocr_has(stem), f"OCR ساقهٔ VOC-{i} نیافت: {stem[:50]}")
for w in VOC_BANK_PRINTED:
    require(ocr_has(w), f"OCR واژهٔ بانک {w} نیافت")
for h in DEF_HEADS.values():
    require(ocr_has(h), f"OCR سرِ تعریف {h} نیافت")
for o in DEF_OPTIONS:
    require(ocr_has(o), f"OCR گزینهٔ تعریف {o[:30]} نیافت")
for h in COL_HEADS.values():
    require(ocr_has(h), f"OCR سرِ ترکیب {h} نیافت")
for o in COL_OPTIONS:
    require(ocr_has(o), f"OCR گزینهٔ ترکیب {o} نیافت")
for i, stem in VF_STEMS.items():
    require(ocr_has(stem), f"OCR ساقهٔ VF-{i} نیافت")
    require(ocr_has(K_VF[i]), f"OCR کلید VF-{i} نیافت")
for i, stem in G_STEMS.items():
    require(ocr_has(stem), f"OCR ساقهٔ G-{i} نیافت")
for i in G_OPTIONS:
    for o in G_OPTIONS[i]:
        require(ocr_has(o), f"OCR گزینهٔ G-{i} نیافت: {o}")
    require(any(ocr_has(v) for v in (f"{32 + i} .({K_G[i]})", f"{32 + i}.({K_G[i]})", f"{32 + i}. ({K_G[i]})")),
            f"OCR کلید G-{i} نیافت")
for i, scr in WO_SCRAMBLES.items():
    for tok in [t.strip() for t in scr.split("/") if t.strip() not in (".", "")]:
        require(ocr_has(tok), f"OCR توکن WO-{i} نیافت: {tok}")
# کلید چاپی WO نشانِ نمرهٔ «(.25)/(0/25)» درونِ جمله دارد — دو تکه‌ی سالم بررسی می‌شود
require(ocr_has("My brother always carries"), "OCR تکهٔ کلید WO-1a نیافت")
require(ocr_has("a bag which seems very heavy"), "OCR تکهٔ کلید WO-1b نیافت")
require(ocr_has("Mina has an exam tomorrow"), "OCR تکهٔ کلید WO-2a نیافت")
require(ocr_has("so she should study well tonight"), "OCR تکهٔ کلید WO-2b نیافت")
for i, stem in CONN_STEMS.items():
    require(ocr_has(stem), f"OCR ساقهٔ CONN-{i} نیافت")
require(ocr_has("39: but"), "OCR کلید CONN-1 نیافت")
require(ocr_has("40: so"), "OCR کلید CONN-2 نیافت")
require(ocr_has("41 .and"), "OCR کلید CONN-3 نیافت")
require(ocr_has("42: or"), "OCR کلید CONN-4 نیافت")
for i, stem in ROLE_STEMS.items():
    require(ocr_has(stem), f"OCR ساقهٔ ROLE-{i} نیافت")
require(ocr_has("Topic Sentence: Horses are farm animals."), "OCR کلید Topic نیافت")
require(ocr_has("Concluding Sentence: They are very useful farm animals."), "OCR کلید Concluding نیافت")
require(ocr_has("Supporting Sentence: They carry people and goods"), "OCR کلید Supporting نیافت")
for i, (stem, acc) in RD1_TYPED.items():
    require(ocr_has(stem), f"OCR ساقهٔ RD1-{i} نیافت")
    require(ocr_has(acc), f"OCR کلید RD1-{i} نیافت: {acc[:40]}")
for i, stem in RD1_TF.items():
    require(ocr_has(stem), f"OCR ساقهٔ RD1-TF-{i} نیافت")
for i, (stem, acc) in RD2_TYPED.items():
    require(ocr_has(stem), f"OCR ساقهٔ RD2-{i} نیافت")
    require(ocr_has(acc), f"OCR کلید RD2-{i} نیافت")
for i, (stem, opts, key) in RD2_MCQ.items():
    require(ocr_has(stem), f"OCR ساقهٔ RD2-{i} نیافت")
    for o in opts:
        require(ocr_has(o), f"OCR گزینهٔ RD2-{i} نیافت: {o}")
require(ocr_has("61 c / necessary"), "OCR کلید ۶۱ نیافت")
require(ocr_has("62 d /the students names"), "OCR کلید ۶۲ نیافت")
for i, (stem, key) in RD2_TF.items():
    require(ocr_has(stem), f"OCR ساقهٔ RD2-TF-{i} نیافت")
# کلیدهای چاپی واژگان/فعل‌ها (راهنمای تصحیح ص۲۳۴-۲۳۵)
for frag in ["17 . convert", "18. generate", "19 .effect", "20 . Turbine",
             "21. (b)", "22. (a)", "23. (e)", "24. (c)",
             "25: d", "26 :c", "27 :e", "28 :a",
             "29 . can open", "30. would sell", "31 .be paid", "32  . had not washed",
             "35. (d)didn't she", "36 .(b) out",
             "55 . Bilingual dictionary", "57 One language is used in it",
             "58 (a) True", "59 (a) True", "63 (b) False", "64 .(b) False"]:
    require(ocr_has(frag), f"OCR کلید چاپی نیافت: {frag}")
# سربرگ‌های چاپی
for h in ["Vocabulary", "Grammar", "Writing", "Reading"]:
    require(ocr_has(h), f"OCR سربرگ {h} نیافت")
# کلیدهای listening (رسیدِ غیبت) در ص۲۳۴
for frag in ["1 .a/ next week", "2. b/ No", "3   . It was red", "5 . a/ True", "6 .b/ False",
             "7 . water", "8. healthy"]:
    require(ocr_has(frag), f"OCR کلید listening نیافت: {frag}")
# موضوع‌های topic sentence (رسیدِ غیبت)
for topic in ["sport", "Forest", "smoking", "Language", "bad habits", "Art"]:
    require(ocr_has(topic), f"OCR موضوع topic-sentence نیافت: {topic}")

if failures:
    print("FAIL — راستی‌آزمایی/داوری:")
    for f in failures:
        print("  ✗", f)
    sys.exit(1)

# ================================================================ تزریق به بانک
data = json.loads(BANK_PATH.read_text(encoding="utf-8"))
existing_ids = [q["id"] for l in data["lessons"] for q in l["questions"]]
existing_set = set(existing_ids)
new_ids = [q["id"] for l in NEW_LESSONS for q in l["questions"]]
dup = [i for i in new_ids if i in existing_set] + [i for i in new_ids if new_ids.count(i) > 1]
if dup:
    print("FAIL — شناسهٔ تکراری:", sorted(set(dup)))
    sys.exit(1)

next_lesson = max(l["lesson"] for l in data["lessons"]) + 1
require(next_lesson == 59, f"شمارهٔ درسِ بعدی {next_lesson} است نه ۵۹")
for l in NEW_LESSONS:
    if l["lesson"] != next_lesson:
        print(f"FAIL — ترتیب درس: انتظار {next_lesson}، یافت {l['lesson']}")
        sys.exit(1)
    if l["count"] != len(l["questions"]):
        print(f"FAIL — شمارِ درس {l['lesson']} ناهمسان")
        sys.exit(1)
    data["lessons"].append(l)
    next_lesson += 1

data["source"]["final97"] = {
    "pages": "229-233",
    "keyPages": "234-236",
    "titlePrinted": "آزمون نهایی انگلیسی دوازدهم — نوبت دی ۱۳۹۷، داوطلبان آزاد و بزرگسال سراسر کشور (بخش چهارم: آزمون‌های نهایی دی ۹۷ تا شهریور ۱۴۰۱) — «Vision Three»",
    "sections": 13,
    "banks": 10,
    "questions": 42,
    "keys": 42,
    "extractedRound": 292,
    "audioAbsent": {
        "section": "1 (listening ۱-۸ + speaking ۹-۱۶)", "items": 16,
        "printedKey": "1.a next week / 2.b No / 3.It was red./red / 4.Yes, she did./Yes / 5.a True / 6.b False / 7.water / 8.healthy",
        "note": "وابسته به فایل صوت (QR) — بانک ساخته نشد؛ کلید چاپی ص۲۳۴ همین‌جا محفوظ است؛ سؤال‌های ۹-۱۶ speakingِ آزمونگر-محورند",
    },
    "openWritingAbsent": {
        "section": "13 (topic sentence ۴۳-۴۸)", "items": 6,
        "note": "پاسخِ باز با داوریِ اصولیِ تصحیح‌کننده (کلید ص۲۳۵: «رعایت اصول Topic sentence») — بانک صادقانه ساخته نشد؛ موضوع‌های چاپی: sport / forest / smoking / language / bad habits / art",
    },
    "receipts": [
        {"item": "37", "field": "scramble", "printed": "very heavy / a bag I always / which / …",
         "note": "اسلشِ چاپی در OCR به I خوانده شده — توکن‌ها وفادار، فاصله‌گذاریِ « / » یکدست شد"},
        {"item": "38", "field": "scramble", "printed": "well,/ should/ so /has /study…",
         "note": "فاصله‌گذاریِ ناهمگونِ OCR به « / » یکدست شد؛ توکن‌ها عیناً چاپ"},
        {"item": "36", "field": "stem", "printed": "…figure ----. What they were talking about.",
         "note": "W بزرگِ چاپی — وفادار ماندیم"},
        {"item": "61", "field": "stem", "printed": "in the first lime",
         "note": "غلط چاپیِ خود جزوه — lime به‌جای line؛ وفادار ماندیم"},
        {"item": "60", "field": "accepted", "printed": "They attend conference and training sessions…",
         "note": "conference مفردِ چاپی — وفادار ماندیم"},
        {"item": "62", "field": "answer", "printed": "d / the students' names",
         "note": "کلید چاپی حاکم؛ تنشِ معناییِ ارجاعِ «then» همان الگوی r289 («All people») ثبت شد"},
        {"item": "54", "field": "stem", "printed": "Horses are farm animals. They are usually black, grey…",
         "note": "کلید ص۲۳۶ فقط جملهٔ نخست را Topic خط زده — نقشِ کلِ آیتم ۵۴ حاکم است"},
        {"item": "19", "field": "stem", "printed": "the ----- by and on 'birds and insects",
         "note": "گیومهٔ اضافهٔ چاپ/OCR پیش از birds پاک شد"},
        {"item": "passages", "field": "—", "printed": "p232-233",
         "note": "متنِ دو ریدینگ درون‌اپ حمل نشد (الگوی r289-r291) — تصویر صفحه در کتابخانهٔ جزوه در دسترس است"},
    ],
}

BANK_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(l["count"] for l in data["lessons"])
print(f"OK — lessons now {len(data['lessons'])}, family total {total} (added 42)")
print("ids:", ", ".join(new_ids[:5]), "…", new_ids[-1])
