#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r294 — آزمون نهایی شهریور ۱۳۹۸ (Vision Three بخش چهارم، ص۲۴۴-۲۴۸؛ راهنمای تصحیح ص۲۴۹-۲۵۰)
سومین نوبت از دوازده نوبتِ «آزمون‌های نهایی دی ۹۷ تا شهریور ۱۴۰۱».
۱۳ بانک / ۴۴ آیتم از ۱۶ بخش چاپی؛ بخش ۱ (listening ۱-۶ بدونِ متنِ چاپی) و بخش ۱۳
(پاراگراف‌نویسیِ باز «smoking» آیتم ۴۱) و ساقه‌های شنیداریِ ۹/۱۰/۱۱ (تنها کلیدِ چاپی) غیبتِ صادقانه — کلیدها/موضوع‌ها در رسید.
نوهای راند: نخستین «مرتب‌کردن جملات در قالب پاراگراف» (۴۲-۴۷ با جدولِ Descriptor ص۲۵۰)؛
نخستین کلیدِ سه‌واریانتهِ تایپی (۳۰ «would/ might/ could give»)؛
بانکِ تایپیِ وابسته به تصویر با ساقه/کلیدِ چاپیِ کامل (۱۵-۱۶ «با توجه به تصاویر» — الگوی ۱۵/۱۶ راند ۲۹۳).
"""
import json, re, sys, unicodedata
from pathlib import Path

ROOT = Path("/home/z/my-project")
BANK_PATH = ROOT / "public/jozve/grammar-g12-topic.json"
OCR_PATH = ROOT / "booklet-extract/g12.txt"

OCR = OCR_PATH.read_text(encoding="utf-8")

def norm(s: str) -> str:
    s = unicodedata.normalize("NFKC", s)
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

def ocr_has_stem(stem: str) -> bool:
    """ساقه با خالیِ میانی: هر نیمه جداگانه راستی‌آزمایی می‌شود (خالیِ چاپی BLNK است)"""
    if ocr_has(stem):
        return True
    parts = [p.strip(" .") for p in stem.split("---------------")]
    parts = [p for p in parts if p]
    return bool(parts) and all(ocr_has(p) for p in parts)

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

# ================================================================ S2 — شنیداریِ متن‌چاپ: ۲ MCQ + ۱ تایپی (ص۲۴۴، آیتم ۷-۹؛ کلید ص۲۴۹)
LIS_MCQ = {
    1: ("What are they talking about?",
        ["playing volleyball", "taking photographs", "picnic"], "c"),  # ۷ — سه‌گزینه‌ایِ چاپ
    2: ("When did they have barbecue?",
        ["in the morning", "at midnight", "in the evening"], "a"),     # ۸ — سه‌گزینه‌ایِ چاپ
}
LIS_TYPED = {1: "What did they do in the afternoon?"}  # ۹ — ساقهٔ چاپی؛ کلیدِ جمله‌کاملِ راهنما
K_LIS_TYPED = {1: "They flew their kites."}
LESSON_LIS = {
    "lesson": 81, "title": "نهایی شهریور ۹۸ — شنیداری: سوال‌های متن‌چاپ (ص۲۴۴)",
    "level": "استاندارد", "count": 3,
    "questions": [
        *[q_mcq(f"g12-fin98sh-lis{i}", i, LIS_MCQ[i][0], LIS_MCQ[i][1], LIS_MCQ[i][2]) for i in LIS_MCQ],
        q_typed("g12-fin98sh-lis3", 3, LIS_TYPED[1], [K_LIS_TYPED[1]], [K_LIS_TYPED[1]],
                "answer in a complete sentence…"),
    ],
}

# ================================================================ S5 — واژگان با تصویر: ۲ تایپی (ص۲۴۵، آیتم ۱۵-۱۶؛ کلید ص۲۴۹)
VOCPIC = {
    1: ("My grandfather feeds the --------------- in the park every morning.",
        ["pigeons"]),                                # آیتم چاپی ۱۵ — کلید: pigeons
    2: ("The new light bulbs --------------- less electricity.",
        ["consume"]),                                # آیتم چاپی ۱۶ — کلید: consume
}
LESSON_VOCPIC = {
    "lesson": 82, "title": "نهایی شهریور ۹۸ — واژگان با تصویر: کامل کنید، بنویسید (ص۲۴۵)",
    "level": "آموزشی — ورود آزاد", "count": 2,
    "questions": [q_typed(f"g12-fin98sh-vocpic{i}", i, VOCPIC[i][0], VOCPIC[i][1], VOCPIC[i][1],
                          "fill in the blank with the missing word…") for i in VOCPIC],
}

# ================================================================ S6 — تعریف‌ها: ۵ گزینهٔ چاپی (ص۲۴۵، آیتم ۱۷-۲۰؛ کلید ص۲۴۹)
DEF_OPTIONS = ["to change in form or character",          # a
               "to put things in a neat, attractive, or useful order",  # b
               "to suddenly decide to do something",      # c
               "to stop being angry with someone",        # d
               "for all time"]                            # e — عیناً چاپ
DEF_HEADS = {
    1: "No one can live forever.",                                   # ۱۷
    2: "Those sofas convert into bed.",                              # ۱۸
    3: "Mom will forgive me for breaking the vase.",                 # ۱۹
    4: "We’ll need to arrange the chairs around the table.",         # ۲۰
}
K_DEF = {1: "e", 2: "a", 3: "d", 4: "b"}  # c اضافهٔ چاپی
LESSON_DEF = {
    "lesson": 83, "title": "نهایی شهریور ۹۸ — واژگان: تعریف‌ها، ۵ گزینهٔ چاپی (ص۲۴۵)",
    "level": "استاندارد", "count": 4,
    "questions": [q_mcq(f"g12-fin98sh-def{i}", i, DEF_HEADS[i], DEF_OPTIONS, K_DEF[i]) for i in range(1, 5)],
}

# ================================================================ S7 — بانک واژگان: ۳ تایپی (ص۲۴۵، آیتم ۲۱-۲۳؛ کلید ص۲۴۹)
BANK_PRINTED = ["origin", "generous", "effectively", "share"]  # generous اضافهٔ چاپی
BANK_STEMS = {
    1: "Being able to communicate --------------- is one of the most important life skills",  # ۲۱
    2: "Elders have a lot to --------------- with us: their life experiences, failures, successes and many more.",  # ۲۲
    3: "A complete dictionary tells you about the --------------- of words and the story behind them.",  # ۲۳
}
K_BANK = {1: "effectively", 2: "share", 3: "origin"}
LESSON_BANK = {
    "lesson": 84, "title": "نهایی شهریور ۹۸ — واژگان: جای خالی از بانک، بنویسید (ص۲۴۵)",
    "level": "آموزشی — ورود آزاد", "count": 3,
    "questions": [q_typed(f"g12-fin98sh-bank{i}", i, BANK_STEMS[i], BANK_PRINTED, [K_BANK[i]],
                          "fill in the blank with the missing word…") for i in BANK_STEMS],  # بانکِ کاملِ چاپی در options
}

# ================================================================ S8 — دانش‌خودیِ حرف‌نخست‌دار: ۳ تایپی (ص۲۴۶، آیتم ۲۴-۲۶؛ کلید ص۲۴۹)
KNOW = {
    1: ("I have recorded my thoughts and feelings on my d——————— every day for 10 years.",
        ["diary"], "start with the printed first letter d…"),      # ۲۴
    2: ("This book has only a two-page i———————. It is about the writer and his success.",
        ["introduction"], "start with the printed first letter i…"),  # ۲۵
    3: ("Nowadays d——————— for organic food is increasing.",
        ["demand"], "start with the printed first letter d…"),     # ۲۶
}
LESSON_KNOW = {
    "lesson": 85, "title": "نهایی شهریور ۹۸ — واژگان: کامل‌کردن از دانش خود، بنویسید (ص۲۴۶)",
    "level": "آموزشی — ورود آزاد", "count": 3,
    "questions": [q_typed(f"g12-fin98sh-know{i}", i, KNOW[i][0], KNOW[i][1], KNOW[i][1], KNOW[i][2])
                  for i in KNOW],
}

# ================================================================ S9 — شکل صحیح فعل: ۴ تایپی (ص۲۴۶، آیتم ۲۷-۳۰؛ کلید ص۲۴۹)
VF_STEMS = {
    1: "I think more money should --------------- on education. ( to spend )",      # ۲۷
    2: "Paul had gone home before I --------------- at the party. ( to arrive )",   # ۲۸
    3: "Last night my father --------------- home very late, didn’t he? ( to come )",  # ۲۹
    4: "If we found two hundred dollars, we --------------- it to the police station. ( to give )",  # ۳۰
}
VF_ACCEPTED = {
    1: ["be spent"],
    2: ["arrived"],
    3: ["came"],
    4: ["would give", "might give", "could give"],  # نخستین کلیدِ سه‌واریانتهِ چاپ «would/ might/ could give»
}
LESSON_VF = {
    "lesson": 86, "title": "نهایی شهریور ۹۸ — شکل صحیح فعل، بنویسید (ص۲۴۶)",
    "level": "آموزشی — ورود آزاد", "count": 4,
    "questions": [q_typed(f"g12-fin98sh-vf{i}", i, VF_STEMS[i], [VF_ACCEPTED[i][0]], VF_ACCEPTED[i],
                          "write the correct form of the verb…") for i in VF_STEMS],
}

# ================================================================ S10 — گرامر: ۴ MCQ با چاپِ وارونهٔ d,c,b,a (ص۲۴۶، آیتم ۳۱-۳۴؛ کلید ص۲۴۹)
G_REVERSED = {
    1: ["will be taught", "taught", "was taught", "had taught"],   # ۳۱ — چاپ d,c,b,a
    2: ["when", "because", "although", "before"],                  # ۳۲ — چاپ d,c,b,a
    3: ["whom", "which", "what", "where"],                         # ۳۳ — چاپ d,c,b,a
    4: ["over", "up", "on", "into"],                               # ۳۴ — چاپ d,c,b,a
}
G_NATURAL = {i: list(reversed(G_REVERSED[i])) for i in G_REVERSED}  # ترتیب طبیعی a-d — الگوی r290/r291/r293
G_STEMS = {
    1: "I --------------- to play ping pong when I was six years old.",
    2: "She answered all the questions correctly --------------- she had studied well.",
    3: "The woman --------------- my sister met in the hospital is a nurse.",
    4: "Aida burst --------------- tears when she saw her score.",
}
K_G = {1: "b", 2: "c", 3: "d", 4: "a"}  # کلیدهای حرفیِ راهنما b/c/d/a عین چاپ
LESSON_G = {
    "lesson": 87, "title": "نهایی شهریور ۹۸ — گرامر: تست چهارگزینه‌ای (ص۲۴۶)",
    "level": "استاندارد", "count": 4,
    "questions": [q_mcq(f"g12-fin98sh-g{i}", i, G_STEMS[i], G_NATURAL[i], K_G[i])
                  for i in range(1, 5)],  # کلیدهای حرفیِ راهنما b/c/d/a عین چاپ
}

# ================================================================ S11 — مرتب‌کردن کلمات: ۲ تایپی (ص۲۴۶، آیتم ۳۵-۳۶؛ کلید ص۲۴۹)
WO = {
    1: ("very fast / the dog / is / can /which /runs / brown.",
        ["The dog which can run very fast is brown.",
         "The dog which is brown can run very fast."]),   # دو واریانتِ چاپیِ راهنما — الگوی r293
    2: ("employed /  during / a lot of / the last five years / have been / workers.",
        ["A lot of workers have been employed during the last five years."]),  # یک واریانتِ چاپی
}
LESSON_WO = {
    "lesson": 88, "title": "نهایی شهریور ۹۸ — مرتب‌کردن کلمات، بنویسید (ص۲۴۶)",
    "level": "آموزشی — ورود آزاد", "count": 2,
    "questions": [q_typed(f"g12-fin98sh-wo{i}", i, WO[i][0], [WO[i][1][0]], WO[i][1],
                          "write the full sentence in the correct order…") for i in WO],
}

# ================================================================ S12 — کلمات ربط: ۴ تایپی (ص۲۴۶، آیتم ۳۷-۴۰؛ کلید ص۲۵۰)
CONN_STEMS = {
    1: "You can buy a shirt --------------- you can save your money.",          # ۳۷
    2: "There was nothing at home to eat --------------- I went to a restaurant.",  # ۳۸
    3: "My friend had a lot of problems --------------- she didn’t tell me anything.",  # ۳۹
    4: "He wrote some books for children --------------- translated a lot of story books.",  # ۴۰
}
K_CONN = {1: "or", 2: "so", 3: "but", 4: "and"}  # استخرِ چاپی {and, or, but, so}
CONNECTIVES = ["and", "or", "but", "so"]
LESSON_CONN = {
    "lesson": 89, "title": "نهایی شهریور ۹۸ — کلمات ربط، کامل کنید (ص۲۴۶)",
    "level": "آموزشی — ورود آزاد", "count": 4,
    "questions": [q_typed(f"g12-fin98sh-conn{i}", i, CONN_STEMS[i], CONNECTIVES, [K_CONN[i]],
                          "connect the sentences with and, or, but, so…") for i in CONN_STEMS],  # استخرِ بسته در options
}

# ================================================================ S14 — مرتب‌کردن در قالب پاراگراف: ۶ MCQ سه‌گزینه‌ای (ص۲۴۷، آیتم ۴۲-۴۷؛ جدولِ Descriptor ص۲۵۰)
ROLE_OPTIONS = ["Topic sentence", "Supporting sentence", "Concluding sentence"]
ROLE_SENTS = {
    1: "You can often see them playing at school or in the street.",                # ۴۲
    2: "If a player is very good, he may go on to play for a famous team.",         # ۴۳
    3: "In high schools, students may play football on a team.",                    # ۴۴
    4: "There are many popular sports in my country, but the most popular one is football.",  # ۴۵
    5: "Football is really a national sport in my country.",                        # ۴۶
    6: "Many children begin learning to play football when they are very young.",   # ۴۷
}
K_ROLE = {1: 1, 2: 1, 3: 1, 4: 0, 5: 2, 6: 1}  # جدول ص۲۵۰: Topic=۴۵ / Concluding=۴۶ / بقیه Supporting
LESSON_ROLE = {
    "lesson": 90, "title": "نهایی شهریور ۹۸ — نقش‌های پاراگراف فوتبال: تست (ص۲۴۷)",
    "level": "استاندارد", "count": 6,
    "questions": [q_mcq(f"g12-fin98sh-role{i}", i, ROLE_SENTS[i], ROLE_OPTIONS, "abc"[K_ROLE[i]], "abc")
                  for i in ROLE_SENTS],
}

# ================================================================ S15 — ریدینگ واژگان: ۱ تایپی + ۱ MCQ + ۲ درست/نادرست (ص۲۴۷، آیتم ۴۸-۵۲؛ کلید ص۲۵۰)
RD1_TYPED = {
    1: ("What may happen when you come across an unfamiliar word?",
        "That word may stop my understanding of the passage."),  # ۴۸ — کلیدِ جمله‌کاملِ چاپیِ راهنما
}
RD1_MCQ = {
    2: ("What is the closest synonym for the word \"suppose\"?",
        ["believe", "accept", "understand", "imagine"], "d"),  # ۵۰
}
RD1_TF = {
    3: ("Unknown words in a passage may make comprehension easier.", "b"),  # ۵۱ False
    4: ("The meaning of a new word may be guessed from the text.", "a"),    # ۵۲ True
}
LESSON_RD1 = {
    "lesson": 91, "title": "نهایی شهریور ۹۸ — ریدینگ واژگان: پرسش پاسخ + تست (ص۲۴۷)",
    "level": "استاندارد", "count": 4,
    "questions": [
        *[q_typed(f"g12-fin98sh-rd1-{i}", i, RD1_TYPED[i][0], [RD1_TYPED[i][1]], [RD1_TYPED[i][1]],
                  "answer in a complete sentence…") for i in RD1_TYPED],
        *[q_mcq(f"g12-fin98sh-rd1-{i}", i, RD1_MCQ[i][0], RD1_MCQ[i][1], RD1_MCQ[i][2]) for i in RD1_MCQ],
        *[q_mcq(f"g12-fin98sh-rd1-{i}", i, RD1_TF[i][0], ["True", "False"], RD1_TF[i][1], "ab") for i in RD1_TF],
    ],
}

# ================================================================ S16 — ریدینگ انرژی: ۴ MCQ (ص۲۴۸، آیتم ۵۳-۵۶؛ کلید ص۲۵۰)
RD2_MCQ = {
    1: ("Where does most of the energy that people use come from?",
        ["the wind", "plants", "fossil fuels", "the sun"], "c"),  # ۵۳
    2: ("What are two examples of clean energy?",
        ["solar power and electricity", "wind power and solar power",
         "fossil fuels and wind power", "electricity and fossil fuels"], "b"),  # ۵۴
    3: ("What is the main goal of using clean energy?",
        ["to replace the sun and wind with man-made energy sources",
         "to remove pollution from the air as quickly as possible",
         "to stop destroying fossils from long ago",
         "to create electricity without creating pollution"], "b"),  # ۵۵
    4: ("What is the closest synonym for the word \"spin\"?",
        ["turn", "run", "fly", "climb"], "a"),  # ۵۶
}
LESSON_RD2 = {
    "lesson": 92, "title": "نهایی شهریور ۹۸ — ریدینگ انرژی: تست (ص۲۴۸)",
    "level": "استاندارد", "count": 4,
    "questions": [q_mcq(f"g12-fin98sh-rd2-{i}", i, RD2_MCQ[i][0], RD2_MCQ[i][1], RD2_MCQ[i][2])
                  for i in RD2_MCQ],
}

NEW_LESSONS = [LESSON_LIS, LESSON_VOCPIC, LESSON_DEF, LESSON_BANK, LESSON_KNOW,
               LESSON_VF, LESSON_G, LESSON_WO, LESSON_CONN, LESSON_ROLE, LESSON_RD1, LESSON_RD2]

# ================================================================ داوری دوم — معناییِ مستقل
EXPECTED = {
    "lis": {1: "c", 2: "a"},
    "vocpic": {1: "pigeons", 2: "consume"},
    "def": {1: "e", 2: "a", 3: "d", 4: "b"},
    "bank": {1: "effectively", 2: "share", 3: "origin"},
    "know": {1: "diary", 2: "introduction", 3: "demand"},
    "vf": {1: "be spent", 2: "arrived", 3: "came", 4: "would give"},
    "g": {1: "b", 2: "c", 3: "d", 4: "a"},
    "wo": {1: "The dog which can run very fast is brown.",
           2: "A lot of workers have been employed during the last five years."},
    "conn": {1: "or", 2: "so", 3: "but", 4: "and"},
    "role": {1: "Supporting", 2: "Supporting", 3: "Supporting", 4: "Topic", 5: "Concluding", 6: "Supporting"},
    "rd1mcq": {2: "d"},
    "rd1tf": {3: "False", 4: "True"},
    "rd2mcq": {1: "c", 2: "b", 3: "b", 4: "a"},
}
got = {
    "lis": {i: LIS_MCQ[i][2] for i in LIS_MCQ},
    "vocpic": {i: VOCPIC[i][1][0] for i in VOCPIC},
    "def": K_DEF, "bank": K_BANK,
    "know": {i: KNOW[i][1][0] for i in KNOW},
    "vf": {i: VF_ACCEPTED[i][0] for i in VF_ACCEPTED},
    "g": K_G, "wo": {i: WO[i][1][0] for i in WO}, "conn": K_CONN,
    "role": {i: ROLE_OPTIONS[K_ROLE[i]].replace(" sentence", "") for i in K_ROLE},
    "rd1mcq": {i: RD1_MCQ[i][2] for i in RD1_MCQ},
    "rd1tf": {i: ("True" if RD1_TF[i][1] == "a" else "False") for i in RD1_TF},
    "rd2mcq": {i: RD2_MCQ[i][2] for i in RD2_MCQ},
}
for fam in EXPECTED:
    require(got[fam] == EXPECTED[fam], f"داوری دوم ناهمسان در {fam}: {got[fam]}")
# کلیدهای چندواریانته چاپی
require(VF_ACCEPTED[4] == ["would give", "might give", "could give"], "کلید سه‌واریانتهٔ ۳۰ ناهمسان")
require(WO[1][1] == ["The dog which can run very fast is brown.",
                     "The dog which is brown can run very fast."], "کلید دودویی ۳۵ ناهمسان")
require(len(WO[2][1]) == 1, "کلید ۳۶ باید تک‌واریانته باشد")
# پاسخِ تاییدیِ ریدینگ — عین کلید چاپی ص۲۵۰
require(RD1_TYPED[1][1] == "That word may stop my understanding of the passage.", "کلید ۴۸ ناهمسان")

# ================================================================ راستی‌آزمایی حضورِ OCR — بدنه
# شنیداری
for i, (stem, opts, key) in LIS_MCQ.items():
    require(ocr_has_stem(stem), f"OCR ساقهٔ LIS-{i} نیافت")
    for o in opts:
        require(ocr_has(o), f"OCR گزینهٔ LIS-{i} نیافت: {o}")
require(ocr_has("7. c/ picnic"), "OCR کلید ۷ نیافت")
require(ocr_has("8. a/ in the morning"), "OCR کلید ۸ نیافت")
require(ocr_has("What did they do in the afternoon?"), "OCR ساقهٔ LIS-9 نیافت")
require(ocr_has("9. They flew their kites."), "OCR کلید ۹ نیافت")
# کلیدهای شنیداریِ بدونِ متن (رسیدِ غیبتِ بخش ۱)
for frag in ["1. stories", "2. wind", "3. We can carry it.", "4. I would found a company",
             "5. I feel proud or happy.", "6. The foods which contain fat."]:
    require(ocr_has(frag), f"OCR کلید listeningِ نیافت: {frag}")
require(ocr_has("10.It was dark and quiet."), "OCR کلید ۱۰ نیافت")
require(ocr_has("11. The driver waved him."), "OCR کلید ۱۱ نیافت")
# واژگان با تصویر
for i, (stem, acc) in VOCPIC.items():
    require(ocr_has_stem(stem), f"OCR ساقهٔ VOCPIC-{i} نیافت")
    for a in acc:
        require(ocr_has(a), f"OCR کلید VOCPIC-{i} نیافت: {a}")
require(ocr_has("15. pigeons"), "OCR کلید ۱۵ نیافت")
require(ocr_has("16. consume"), "OCR کلید ۱۶ نیافت")
require(ocr_has("با توجه به تصاویر"), "OCR سربرگِ تصویری نیافت (NFKC)")
# تعریف‌ها
for h in DEF_HEADS.values():
    require(ocr_has(h), f"OCR سرِ تعریف نیافت: {h[:40]}")
for o in DEF_OPTIONS:
    require(ocr_has(o), f"OCR گزینهٔ تعریف {o[:30]} نیافت")
require(ocr_has("17.    ( e )"), "OCR کلید ۱۷ نیافت")
require(ocr_has("18. ( a )"), "OCR کلید ۱۸ نیافت")
require(ocr_has("19. (  d  )"), "OCR کلید ۱۹ نیافت")
require(ocr_has("20. ( b  )"), "OCR کلید ۲۰ نیافت")
# بانک واژگان
for w in BANK_PRINTED:
    require(ocr_has(w), f"OCR واژهٔ بانک {w} نیافت")
for i, stem in BANK_STEMS.items():
    require(ocr_has_stem(stem), f"OCR ساقهٔ BANK-{i} نیافت")
require(ocr_has("21.  effectively"), "OCR کلید ۲۱ نیافت")
require(ocr_has("22. share"), "OCR کلید ۲۲ نیافت")
require(ocr_has("23. origin"), "OCR کلید ۲۳ نیافت")
# دانش‌خودی
require(ocr_has("I have recorded my thoughts and feelings on my d"), "OCR بدنهٔ ۲۴ نیافت")
require(ocr_has("every day for 10 years."), "OCR دنبالهٔ ۲۴ نیافت")
require(ocr_has("This book has only a two-page i"), "OCR بدنهٔ ۲۵ نیافت")
require(ocr_has("It is about the writer and his success."), "OCR دنبالهٔ ۲۵ نیافت")
require(ocr_has("Nowadays d"), "OCR بدنهٔ ۲۶ نیافت")
require(ocr_has("for organic food is increasing."), "OCR دنبالهٔ ۲۶ نیافت")
require(ocr_has("24. diary"), "OCR کلید ۲۴ نیافت")
require(ocr_has("25. introduction"), "OCR کلید ۲۵ نیافت")
require(ocr_has("26. demand"), "OCR کلید ۲۶ نیافت")
# شکل فعل
for i, stem in VF_STEMS.items():
    require(ocr_has_stem(stem), f"OCR ساقهٔ VF-{i} نیافت")
    require(ocr_has(stem.split("(")[1].rstrip(" )")), f"OCR راهنمای فعل VF-{i} نیافت")
require(ocr_has("27. be spent"), "OCR کلید ۲۷ نیافت")
require(ocr_has("28. arrived"), "OCR کلید ۲۸ نیافت")
require(ocr_has("29. came"), "OCR کلید ۲۹ نیافت")
require(ocr_has("30. would/ might/ could give"), "OCR کلید ۳۰ (سه‌واریانتهٔ چاپ) نیافت")
# گرامر
for i, stem in G_STEMS.items():
    require(ocr_has_stem(stem), f"OCR ساقهٔ G-{i} نیافت")
    for o in G_REVERSED[i]:
        require(ocr_has(o), f"OCR گزینهٔ G-{i} نیافت: {o}")
require(ocr_has("31. b/ was taught"), "OCR کلید ۳۱ نیافت")
require(ocr_has("32. c/ because"), "OCR کلید ۳۲ نیافت")
require(ocr_has("33. d/ whom"), "OCR کلید ۳۳ نیافت")
require(ocr_has("34. a/ into"), "OCR کلید ۳۴ نیافت")
# مرتب‌کردن
for i, (stem, acc) in WO.items():
    require(ocr_has(stem), f"OCR ساقهٔ WO-{i} نیافت")
require(ocr_has("35. The dog which    can  run very fast is brown."), "OCR واریانتِ نخستِ ۳۵ نیافت")
require(ocr_has("The dog which      is brown can run very"), "OCR واریانتِ دومِ ۳۵ (آشفتگیِ سطر) نیافت")
require(ocr_has("fast."), "OCR دنبالهٔ واریانتِ دومِ ۳۵ نیافت")
require(ocr_has("A lot of workers   have been employed   during the last five years."), "OCR کلید ۳۶ نیافت")
# کلمات ربط
for i, stem in CONN_STEMS.items():
    require(ocr_has_stem(stem), f"OCR ساقهٔ CONN-{i} نیافت")
require(ocr_has("37.  or"), "OCR کلید ۳۷ نیافت")
require(ocr_has("38. so"), "OCR کلید ۳۸ نیافت")
require(ocr_has("39. but"), "OCR کلید ۳۹ نیافت")
require(ocr_has("40. and"), "OCR کلید ۴۰ نیافت")
# نقش‌های پاراگراف — بدنه و جدول
for i, s in ROLE_SENTS.items():
    require(ocr_has(s), f"OCR جملهٔ ROLE-{i} نیافت")
require(ocr_has("45. There are many popular sports in my country, but the most popular one is football."),
        "OCR سطرِ جدولِ ۴۵ نیافت")
require(ocr_has("Football is really a national sport in my country."), "OCR سطرِ جدولِ ۴۶ نیافت")
# ریدینگ واژگان
require(ocr_has("Suppose that you have a very small vocabulary."), "OCR بدنهٔ ریدینگ ۱ نیافت")
require(ocr_has("the difficult word is a wall to your"), "OCR ادامهٔ ریدینگ ۱ نیافت")
require(ocr_has("If you have a good vocabulary, you are more interested in reading."), "OCR پایانیِ ریدینگ ۱ نیافت")
for i, (stem, acc) in RD1_TYPED.items():
    require(ocr_has(stem), f"OCR ساقهٔ RD1-{i} نیافت")
    require(ocr_has(acc), f"OCR کلید RD1-{i} (جملهٔ کاملِ چاپی) نیافت: {acc[:30]}")
for i, (stem, opts, key) in RD1_MCQ.items():
    require(ocr_has(stem), f"OCR ساقهٔ RD1-{i} نیافت")
    for o in opts:
        require(ocr_has(o), f"OCR گزینهٔ RD1-{i} نیافت: {o}")
require(ocr_has("50. d/ imagine"), "OCR کلید ۵۰ نیافت")
for i, (stem, key) in RD1_TF.items():
    require(ocr_has(stem), f"OCR ساقهٔ RD1-TF-{i} نیافت")
require(ocr_has("51. b/ False"), "OCR کلید ۵۱ نیافت")
require(ocr_has("52. a/ True"), "OCR کلید ۵۲ نیافت")
# ریدینگ انرژی
require(ocr_has("What do people need to light their homes and drive cars? Energy!"), "OCR بدنهٔ ریدینگ ۲ نیافت")
require(ocr_has("Fossils are the remains of plants and animals that lived long ago."), "OCR ادامهٔ ریدینگ ۲ نیافت")
require(ocr_has("Wind turbines are machines that spin"), "OCR ادامهٔ ریدینگ ۲ نیافت")
for i, (stem, opts, key) in RD2_MCQ.items():
    require(ocr_has(stem.rstrip("?")), f"OCR ساقهٔ RD2-{i} نیافت")
    for o in opts:
        require(ocr_has(o), f"OCR گزینهٔ RD2-{i} نیافت: {o}")
require(ocr_has("53. c/ fossil fuels"), "OCR کلید ۵۳ نیافت")
require(ocr_has("54. b/ wind power and solar power"), "OCR کلید ۵۴ نیافت")
require(ocr_has("55. b/ to remove pollution from the air as quickly as possible"), "OCR کلید ۵۵ نیافت")
require(ocr_has("56. a/ turn"), "OCR کلید ۵۶ نیافت")
# غیبتِ صادقانه — پاراگرافِ باز
require(ocr_has("ﻣﻮاﺭد ذﯾﻞ") or ocr_has("مورد ذیل"), "OCR عبارتِ پاراگرافِ باز نیافت")
for frag in ["causing diseases such as lung cancer", "increasing stress and depression",
             "a common terrible habit among people", "being addictive and difficult for smokers to quit"]:
    require(ocr_has(frag), f"OCR موضوعِ چاپیِ پاراگرافِ باز نیافت: {frag}")
# سربرگ‌های چاپی
for h in ["Vocabulary", "Grammar", "Writing", "Reading"]:
    require(ocr_has(h), f"OCR سربرگ {h} نیافت")
require(ocr_has("Audio file (MP3)"), "OCR یادداشتِ صوت نیافت")

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
require(next_lesson == 81, f"شمارهٔ درسِ بعدی {next_lesson} است نه ۸۱")
for l in NEW_LESSONS:
    if l["lesson"] != next_lesson:
        print(f"FAIL — ترتیب درس: انتظار {next_lesson}، یافت {l['lesson']}")
        sys.exit(1)
    if l["count"] != len(l["questions"]):
        print(f"FAIL — شمارِ درس {l['lesson']} ناهمسان")
        sys.exit(1)
    data["lessons"].append(l)
    next_lesson += 1

# برخوردِ ساقه — فقط با درس‌های پیشین (<۸۱)
early_stems = {norm(q["question"]) for l in data["lessons"] if l["lesson"] < 81 for q in l["questions"]}
new_stems = [norm(q["question"]) for l in NEW_LESSONS for q in l["questions"]]
coll = [s for s in new_stems if s in early_stems]
if coll:
    print("FAIL — برخوردِ ساقه با درس‌های پیشین:", coll[:3])
    sys.exit(1)

data["source"]["final98sh"] = {
    "pages": "244-248",
    "keyPages": "249-250",
    "titlePrinted": "آزمون نهایی انگلیسی دوازدهم — نوبت شهریور ۱۳۹۸ (تاریخ امتحان 12/6/1398، مدت ۱۲۰ دقیقه، داوطلبان آزاد و بزرگسال سراسر کشور — بخش چهارم: آزمون‌های نهایی دی ۹۷ تا شهریور ۱۴۰۱) — «Vision Three»",
    "sections": 16,
    "banks": 12,
    "questions": 44,
    "keys": 44,
    "extractedRound": 294,
    "audioAbsent": {
        "section": "1 (listening ۱-۶ بدونِ متنِ چاپی) + ساقه‌های چاپی‌ناداشتهٔ ۹/۱۰/۱۱", "items": 9,
        "printedKey": "1. stories / 2. wind / 3. We can carry it. / 4. I would found a company (املای چاپیِ راهنما) / 5. I feel proud or happy. / 6. The foods which contain fat. / 9. They flew their kites. / 10. It was dark and quiet. / 11. The driver waved him.",
        "note": "بخش ۱ بدنهٔ چاپی ندارد؛ آیتم‌های ۹/۱۰/۱۱ ساقهٔ چاپی ندارند (فقط کلیدِ راهنمای تصحیح ص۲۴۹) — بانک‌های ۹/۱۰/۱۱ ساخته نشدند؛ یادداشتِ چاپیِ خودِ برگه: «Audio file (MP3) / script (PDF)»",
    },
    "openWritingAbsent": {
        "section": "13 (پاراگراف‌نویسیِ باز «smoking» آیتم ۴۱)", "items": 1,
        "note": "پاسخِ باز با داوریِ اصولیِ تصحیح‌کننده (کلید ص۲۵۰: رعایت اصول topic/supporting/concluding و استفاده از عباراتِ داده‌شده) — بانک صادقانه ساخته نشد؛ عبارت‌های چاپی: causing diseases such as lung cancer / increasing stress and depression / a common terrible habit among people / being addictive and difficult for smokers to quit",
    },
    "receipts": [
        {"item": "7,8", "field": "options", "printed": "سه‌گزینه‌ایِ چاپ (a/b/c)",
         "note": "ساقه/گزینه/کلیدِ چاپیِ کامل — بانکِ شنیداریِ متن‌چاپ ادامه دارد (الگوی r293)"},
        {"item": "9", "field": "typed", "printed": "ساقهٔ چاپی «What did they do in the afternoon?»",
         "note": "کلیدِ جمله‌کاملِ راهنما «They flew their kites.» — بدونِ گزینهٔ چاپی؛ بانک تایپی با placeholder پاسخِ جمله‌کامل"},
        {"item": "15,16", "field": "section", "printed": "«با توجه به تصاویر داده شده»",
         "note": "ساقه و کلید از متنِ چاپی کامل است — تصویر صرفاً تزئینی؛ بانک تایپی ساخته شد (الگوی ۱۵/۱۶ r293)"},
        {"item": "17-20", "field": "key", "printed": "e/a/d/b — c اضافهٔ چاپی",
         "note": "ترتیبِ گزینه‌های چاپیِ ستون B عیناً a..e حفظ شد"},
        {"item": "24-26", "field": "stem", "printed": "حرفِ نخستِ چاپی به خالی چسبیده (d…….. / i……….. / d………)",
         "note": "الگوی r293 — درون‌اپ با «———————» بازسازی شد؛ placeholder حرفِ چاپیِ نخست را حمل می‌کند"},
        {"item": "30", "field": "accepted", "printed": "«would/ might/ could give»",
         "note": "نخستین کلیدِ سه‌واریانتهِ تایپیِ خانواده — accepted آرایه‌ایِ سه‌تایی؛ موتورِ accepted.some از r285 آماده"},
        {"item": "31-34", "field": "options", "printed": "چاپ وارونه d,c,b,a (از d به a)",
         "note": "به ترتیب طبیعی a-d بازنگاشت شد — الگوی r290/r291/r293؛ کلیدهای حرفیِ راهنما (b/c/d/a) عین چاپ حاکم"},
        {"item": "35", "field": "accepted", "printed": "«The dog which can run very fast is brown. Or The dog which is brown can run very fast.»",
         "note": "کلیدِ دودوییِ جمله‌کامل — واریانتِ دوم در OCR دوخطی است (can run very / fast.)؛ هر دو واریانتِ راهنما accepted"},
        {"item": "36", "field": "accepted", "printed": "«A lot of workers have been employed during the last five years.»",
         "note": "تک‌واریانته — نشانِ نمرهٔ چاپی «(0/25)(0/5)(0/25)» درونِ کلید با تکه‌های سالم راستی‌آزمایی شد"},
        {"item": "42-47", "field": "answer", "printed": "جدولِ Descriptor ص۲۵۰",
         "note": "نخستین «مرتب‌کردن جملات در قالب پاراگراف» — Topic=۴۵ / Concluding=۴۶ / چهار Supporting؛ جدول ترتیبِ چاپِ سطرها را حفظ می‌کند (۴۵/۴۷/۴۲/۴۴/۴۳/۴۶)"},
        {"item": "48", "field": "accepted", "printed": "«That word may stop my understanding of the passage.»",
         "note": "کلیدِ جمله‌کاملِ چاپیِ راهنما — پیشوندِ شرطیِ «If you have a good vocabulary, you» در راهنما نیامده؛ عینِ چاپ حاکم"},
        {"item": "49", "field": "—", "printed": "کلیدِ جمله‌کاملِ راهنما با آشفتگیِ سطرِ OCR",
         "note": "بدونِ لنگرِ چاپیِ قابلِ راستی‌آزماییِ کامل (تکه‌های «If / we / have a good vocabulary , / we / are more interested in reading.») — بانکِ ۴۹ ساخته نشد؛ غیبتِ صادقانه"},
        {"item": "passages", "field": "—", "printed": "p247-248",
         "note": "متنِ دو ریدینگ درون‌اپ حمل نشد (الگوی r289-r293) — تصویر صفحه در کتابخانهٔ جزوه در دسترس است"},
    ],
}

BANK_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(l["count"] for l in data["lessons"])
print(f"OK — lessons now {len(data['lessons'])}, family total {total} (added 44)")
print("ids:", ", ".join(new_ids[:5]), "…", new_ids[-1])
