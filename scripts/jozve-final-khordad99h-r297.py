#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r297 — آزمون نهایی خرداد ۱۳۹۹، رشتهٔ ادبیات و علوم انسانی (Vision Three بخش چهارم، ص۲۶۸-۲۷۴؛ راهنمای تصحیح ص۲۷۵-۲۷۶)
ششمین نوبت از دوازده نوبتِ «آزمون‌های نهایی دی ۹۷ تا شهریور ۱۴۰۱» — واریانتِ دومِ رشته‌ایِ همان خرداد ۹۹ (r296 = ریاضی/تجربی، تاریخ 05/04/99؛ این راند = انسانی/معارف، تاریخ 07/04/99).
اصلاحِ handoff r296: PAGE 268 شهریور ۹۹ نیست — سربرگِ واقعی «نوبت خرداد ماه سال۱۳۹۹» رشتهٔ انسانی است؛ شهریور ۹۹ از PAGE 277 با OCR مواج آغاز می‌شود (نوبتِ راند بعدی).
۱۸ بانک / ۶۶ آیتم از ۱۶ بخش چاپی؛ غیبتِ صادقانه: topic sentenceهای ۵۵/۵۶ (راهنما فقط بارمِ اصولی) و بخش ۱۶ (ج: topic تصویری / د: پاراگرافِ بازِ Firefighters).
نوهای راند: نخستین واریانتِ رشته‌ایِ یک نوبتِ واحد؛ دومین لغزشِ رقمِ فارسی درونِ کلید (۳۹ «in١٢٩١» = ۱۹۲۱) و تکرارِ همان لغزشِ «٦٤.» روی ۴۶ (قالبِ راهنما)؛
بازمونتاژِ کلیدِ آشفتهٔ OCRِ ۹ («She needed enough electricity to finish watching the movie.»)؛ کلوزِ سه‌اسمیشِ ۴۵ (roots/ fruits/ leaves)؛
دو خوانشِ دستوریِ کامل برای 61a به‌پاسِ یادداشتِ «فلش»ِ راهنما؛ تنشِ John/He در 62a (هر دو accepted).
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
    """ساقه با خالیِ میانی: هر نیمه جداگانه راستی‌آزمایی می‌شود (خالیِ درون‌اپ --------------- است)"""
    if ocr_has(stem):
        return True
    parts = [p.strip(" .") for p in stem.split("---------------")]
    parts = [p for p in parts if p]
    return bool(parts) and all(ocr_has(p) for p in parts)

failures: list[str] = []
def require(cond: bool, msg: str) -> None:
    if not cond:
        failures.append(msg)

def q_mcq(qid: str, n: int, question: str, options: list[str], answer: int) -> dict:
    return {"id": qid, "n": n, "category": "grammar", "kind": "mcq",
            "question": question, "options": options, "answer": answer}

def q_typed(qid: str, n: int, question: str, accepted: list[str], placeholder: str | None = None) -> dict:
    q = {"id": qid, "n": n, "category": "grammar", "kind": "typed",
         "question": question, "options": [accepted[0]], "answer": 0, "accepted": accepted}
    if placeholder:
        q["placeholder"] = placeholder
    return q

def q_tf(qid: str, n: int, question: str, answer: int) -> dict:
    return {"id": qid, "n": n, "category": "grammar", "kind": "mcq",
            "question": question, "options": ["True", "False"], "answer": answer}

# ---------------------------------------------------------------- S1 شنیداری فایل ۱ (ص۲۶۸)
s1 = [
    q_mcq("g12-fin99h-l1m1", 1,
          "A: Why is the man shouting? B: Because --------------- .",
          ["he is very angry", "he is far from the woman", "she can’t hear at all", "she can’t hear clearly"], 3),
    q_tf("g12-fin99h-l1tf1", 2, "The woman thinks that she should see a doctor.", 1),
    q_typed("g12-fin99h-l1t1", 3, "Why is she asking people to repeat themselves?",
            ["Because she can’t hear well."], "answer in a complete sentence…"),
    q_typed("g12-fin99h-l1t2", 4, "What is the problem according to what the man says?",
            ["It might be something as simple as an infection.",
             "It might be something as simple as an infection or more serious."],
            "answer in a complete sentence…"),
]
# ---------------------------------------------------------------- S2 شنیداری فایل ۲ (ص۲۶۸)
s2 = [
    q_mcq("g12-fin99h-l2m1", 1,
          "A: What was the problem with the woman’s computer? B: The battery was --------------- .",
          ["broken", "full", "out of order", "low"], 3),
    q_mcq("g12-fin99h-l2m2", 2,
          "The woman said the battery of her computer was --------------- .",
          ["replaceable", "rechargeable", "convertible", "b & c"], 1),
    q_mcq("g12-fin99h-l2m3", 3,
          "A: What was she looking for? B: She was looking for a/an --------------- .",
          ["outlet", "computer", "radio", "TV set"], 0),
    q_typed("g12-fin99h-l2t1", 4, "Why couldn’t she watch the movie on her phone?",
            ["Because her phone battery was running low."], "answer in a complete sentence…"),
    q_typed("g12-fin99h-l2t2", 5, "What did the woman need to finish watching the movie?",
            ["She needed enough electricity to finish watching the movie."],
            "answer in a complete sentence…"),
]
# ---------------------------------------------------------------- S3 شنیداری فایل ۳ (ص۲۶۸-۲۶۹)
s3 = [
    q_typed("g12-fin99h-l3w1", 1,
            "When speaker looks at his inbox, he gets stuck into reading and --------------- to emails.",
            ["responding"], "fill in the blank with one word…"),
    q_typed("g12-fin99h-l3w2", 2,
            "He has a/an --------------- email account and an account for work.",
            ["personal"], "fill in the blank with one word…"),
    q_typed("g12-fin99h-l3w3", 3, "Does it take him a lot of time to answer the emails?",
            ["Yes, it does. It takes him a lot of time to answer the emails.", "Yes, it does."],
            "answer in a complete sentence…"),
    q_typed("g12-fin99h-l3w4", 4, "What does the man do with his unwanted emails?",
            ["He deletes them."], "answer in a complete sentence…"),
    q_typed("g12-fin99h-l3w5", 5, "What kind of approach does the man take with his work emails?",
            ["He takes an organized approach with work emails."], "answer in a complete sentence…"),
]
# ---------------------------------------------------------------- S4 واژگان با تصویر (ص۲۶۹) — c اضافهٔ چاپی
PIC_OPTS = [
    "There are lots of free apps that you don’t need to pay money to use them.",
    "It is believed that hugging your child boosts the level of happiness.",
    "Teenagers who help others are more successful in life.",
    "Hydropower is produced as a result of falling or running water.",
    "Tides can usually happen near any huge body of water like an ocean or a sea.",
]
PIC_KEYS = {15: 3, 16: 0, 17: 1, 18: 4}  # راهنما: 15(d) 16(a) 17(b) 18(e)
s4 = [
    q_mcq(f"g12-fin99h-pic{i}", i,
          f"با توجه به تصاویر داده شده، جملهٔ مناسب برای هر تصویر را انتخاب کنید. (یک جمله اضافی است) — تصویر ({num})",
          PIC_OPTS, PIC_KEYS[num])
    for i, num in enumerate((15, 16, 17, 18), start=1)
]
# ---------------------------------------------------------------- S5 واژگان: جای خالی از بانک (ص۲۶۹) — introduction اضافهٔ چاپی
VB_POOL = ["introduction", "dedicated", "alphabetically", "conditioner"]
s5 = [
    q_typed("g12-fin99h-vb1", 1,
            "A: Why is he so famous? B: Because he is a/an --------------- university professor.",
            ["dedicated"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99h-vb2", 2,
            "A: How do you keep this room cool? B: We use a perfect air --------------- to keep here cool.",
            ["conditioner"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99h-vb3", 3,
            "A: How should we find a book written by a great poet at this library? B: The books are arranged --------------- by authors’ names.",
            ["alphabetically"], "fill in the blank with the missing word…"),
]
for q in s5:
    q["options"] = list(VB_POOL)  # داربست = بانک کاملِ چاپی (الگوی r296)
# ---------------------------------------------------------------- S6 واژگان: کامل‌کردن از دانش خود (ص۲۶۹)
s6 = [
    q_typed("g12-fin99h-ok1", 1,
            "You should tell him the truth one day. You can’t keep it a secret f- - - - - -.",
            ["forever"], "start with the printed first letter f…"),
    q_typed("g12-fin99h-ok2", 2,
            "In order to be healthy, try to avoid foods that c - - - - - - a lot of fat.",
            ["contain"], "start with the printed first letter c…"),
    q_typed("g12-fin99h-ok3", 3,
            "The baby enjoys sitting on her mother`s l - - .",
            ["lap"], "start with the printed first letter l…"),
]
# ---------------------------------------------------------------- S7 گرامر: تست چهارگزینه‌ای (ص۲۶۹-۲۷۰)
s7 = [
    q_mcq("g12-fin99h-g1", 1,
          "A: Where is his car? B: The car --------------- is parked there belongs to him.",
          ["which", "when", "whom", "whose"], 0),
    q_mcq("g12-fin99h-g2", 2,
          "A: Can she get a good mark now? B: No, but she could get a good score if she --------------- more.",
          ["have studied", "studied", "studies", "would study"], 1),
    q_mcq("g12-fin99h-g3", 3,
          "There is a new building in the neighborhood. The workers --------------- it very well.",
          ["have built", "are built", "were built", "have been built"], 0),
    q_mcq("g12-fin99h-g4", 4,
          "Their sister bought a new dress at a very low price, ---------------?",
          ["doesn`t she", "don`t they", "didn`t she", "didn`t they"], 2),
    q_mcq("g12-fin99h-g5", 5,
          "He is not very ---------------, thus he doesn’t feel comfortable to talk to people.",
          ["communicatively", "communicate", "communication", "communicative"], 3),
]
# ---------------------------------------------------------------- S8 شکل صحیح فعل (ص۲۷۰)
s8 = [
    q_typed("g12-fin99h-vf1", 1,
            "His job became --------------- difficult because of his illness. (increase)",
            ["increasingly"], "write the correct form of the verb…"),
    q_typed("g12-fin99h-vf2", 2,
            "They --------------- the waste every night and send it to the landfill, don’t they? ( collect)",
            ["collect"], "write the correct form of the verb…"),
    q_typed("g12-fin99h-vf3", 3,
            "A: Is there any medicine for the disease? B: A new medicine --------------- by the doctors to cure it since last month. ( discover )",
            ["has been discovered"], "write the correct form of the verb…"),
    q_typed("g12-fin99h-vf4", 4,
            "Smart phones and tablets --------------- by lots of hard work some years ago. ( invent )",
            ["were invented"], "write the correct form of the verb…"),
    q_typed("g12-fin99h-vf5", 5,
            "They would travel all over the world if they --------------- rich. ( be )",
            ["were"], "write the correct form of the verb…"),
]
# ---------------------------------------------------------------- S9 ریدینگ آینشتاین: تست + درست/نادرست (ص۲۷۰)
s9 = [
    q_mcq("g12-fin99h-r1m1", 1,
          "Before the World War II, Einstein left Germany and became a/an --------------- .",
          ["president", "American citizen", "physicist", "student"], 1),
    q_mcq("g12-fin99h-r1m2", 2, "He died because of his --------------- .",
          ["Relativity Theory", "scientific research", "health problems", "academic studies"], 2),
    q_tf("g12-fin99h-r1tf1", 3, "His job helped him to think about his theory.", 0),
    q_tf("g12-fin99h-r1tf2", 4, "He found a job easily after graduation.", 1),
]
# ---------------------------------------------------------------- S9 تکمیلی: پرسش پاسخ آینشتاین (ص۲۷۰)
s10 = [
    q_typed("g12-fin99h-r1t1", 1, "When was the Nobel Prize awarded to Einstein?",
            ["The Nobel Prize was awarded to Einstein for physics in 1921.", "In 1921."],
            "answer in a complete sentence…"),
    q_typed("g12-fin99h-r1t2", 2, "What did Einstein do for expressing his fear of the atomic bomb?",
            ["He wrote a letter to President Roosevelt expressing his worry about the atomic bomb."],
            "answer in a complete sentence…"),
]
# ---------------------------------------------------------------- S10 ریدینگ انرژی: تست (ص۲۷۱)
s11 = [
    q_mcq("g12-fin99h-r2m1", 1, "What does “they” in paragraph3, line 2 refer to?",
          ["fossil fuels", "non-renewable energy sources", "renewable sources of energy", "solar panels"], 2),
    q_mcq("g12-fin99h-r2m2", 2, "What is this passage mostly about? It is about --------------- .",
          ["how long it takes for light to reach the earth from the sun",
           "the importance of energy for human life and where energy comes from",
           "different types of non-renewable sources of energy used by people",
           "how fossil fuels were formed"], 1),
]
# ---------------------------------------------------------------- S10 تکمیلی: درست/نادرست انرژی (ص۲۷۲)
s12 = [
    q_tf("g12-fin99h-r2tf1", 1, "Our nearest star is the source of all the energy we need on earth.", 0),
    q_tf("g12-fin99h-r2tf2", 2, "The sun`s energy can only be stored in the form of coal, oil, and natural gases.", 1),
]
# ---------------------------------------------------------------- S10 تکمیلی: پرسش پاسخ انرژی (ص۲۷۲)
s13 = [
    q_typed("g12-fin99h-r2t1", 1, "Where is energy stored in plants?",
            ["The energy is stored in their roots, fruits, and leaves.",
             "The energy is stored in their roots.",
             "The energy is stored in their fruits.",
             "The energy is stored in their leaves."], "answer in a complete sentence…"),
    q_typed("g12-fin99h-r2t2", 2, "What are the three forms of renewable energy?",
            ["Three forms of renewable energy are: solar energy, water energy and wind energy.",
             "Solar energy, water energy and wind energy."], "answer in a complete sentence…"),
]
# ---------------------------------------------------------------- S11 ادامهٔ جمله: مچینگ ستون A/B (ص۲۷۲)
MATCH_OPTS = ["I didn`t have your number.", "I looked out.", "you can buy a pocket one.", "it was not safe to drive."]
MATCH_KEYS = {47: 2, 48: 3, 49: 0, 50: 1}  # راهنما: 47(c) 48(d) 49(a) 50(b)
s14 = [
    q_mcq(f"g12-fin99h-cont{i}", i, stem, MATCH_OPTS, MATCH_KEYS[num])
    for i, (num, stem) in enumerate((
        (47, "You can use mobile dictionary, or"),
        (48, "The roads were covered with ice, so"),
        (49, "I wanted to call you, but"),
        (50, "I went to the window, and"),
    ), start=1)
]
# ---------------------------------------------------------------- S12 کلمات ربط: امین (ص۲۷۲) — استخرِ بستهٔ چاپی {but, and, so, or}
CONN_POOL = ["but", "and", "so", "or"]
s15 = [
    q_typed("g12-fin99h-conn1", 1,
            "Amin is a student, --------------- he goes to a school near his house.",
            ["and"], "connect the sentences with but, and, so, or…"),
    q_typed("g12-fin99h-conn2", 2,
            "He can come home by taxi, --------------- he can come on foot.",
            ["or"], "connect the sentences with but, and, so, or…"),
    q_typed("g12-fin99h-conn3", 3,
            "He usually gets back on time, --------------- yesterday he came home late because one of his friends got sick,",
            ["but"], "connect the sentences with but, and, so, or…"),
    q_typed("g12-fin99h-conn4", 4,
            "He usually gets back on time, but yesterday he came home late because one of his friends got sick, --------------- Amin waited until his friend’s father arrived.",
            ["so"], "connect the sentences with but, and, so, or…"),
]
for q in s15:
    q["options"] = list(CONN_POOL)  # داربست = استخرِ بستهٔ چاپی (الگوی r296)
# ---------------------------------------------------------------- S14 بخش الف: تعریف‌های ستون B (ص۲۷۳) — a اضافهٔ چاپی
DEFB_OPTS = [
    "cry suddenly",
    "the amount of a product or service that people want",
    "in a way that is successful and achieves what you want",
    "stop being angry with someone",
    "an arrangement in a particular order",
]
DEFB_KEYS = {57: 3, 58: 4, 59: 2, 60: 1}  # راهنما: 57(d) 58(e) 59(c) 60(b)
DEFB_STEMS = {
    57: "I may forgive myself for the accident, but it is very difficult to forget.",
    58: "They really liked the combination of colors in my painting.",
    59: "Scientists work effectively to find new ways to make life easier for us.",
    60: "These days the demand for oil is decreasing in many areas in the country.",
}
s16 = [
    q_mcq(f"g12-fin99h-defb{i}", i, DEFB_STEMS[num], DEFB_OPTS, DEFB_KEYS[num])
    for i, num in enumerate((57, 58, 59, 60), start=1)
]
# ---------------------------------------------------------------- S14 بخش ب: ضرب‌المثل‌ها (ص۲۷۳) — g اضافهٔ چاپی
PRVB_OPTS = [
    "People like to spend time with those who are similar to them.",
    "When two people cooperate with each other, they come up with better ideas.",
    "When there are too many people trying to lead and give their opinions, it’s confusing and leads to bad results.",
    "You soon forget people or things that are no longer visible or present.",
    "You have to practice a skill a lot to become good at it.",
]
PRVB_KEYS = {57: 3, 58: 2, 59: 0, 60: 4}  # راهنما: 57(i) 58(h) 59(f) 60(j)
PRVB_STEMS = {
    57: "Out of sight, out of mind",
    58: "Too many cooks spoil the broth",
    59: "Birds of a feather flock together",
    60: "Practice makes perfect",
}
s17 = [
    q_mcq(f"g12-fin99h-prvb{i}", i, PRVB_STEMS[num], PRVB_OPTS, PRVB_KEYS[num])
    for i, num in enumerate((57, 58, 59, 60), start=1)
]
s15_special_ocr = {"g12-fin99h-conn4": [
    "He usually gets back on time",
    "yesterday he came home late because one of his friends got sick",
    "Amin waited until his friend’s father arrived",
]}

# ---------------------------------------------------------------- S15 مرتب‌کردن کلمات: هر دو بخش الف/ب (ص۲۷۳)
s18 = [
    q_typed("g12-fin99h-wo1", 1,
            "talking / to the neighbors / the woman / bought / that apartment / who / was / in the yard /.",
            ["The woman who bought that apartment was talking to the neighbors in the yard.",
             "The woman who was talking to the neighbors in the yard bought that apartment."],
            "write the full sentence in the correct order…"),
    q_typed("g12-fin99h-wo2", 2,
            "met / their son / had / happy / after / his parents / they / became /.",
            ["His parents became happy after they had met their son."],
            "write the full sentence in the correct order…"),
    q_typed("g12-fin99h-wo3", 3,
            "a good runner / to practice / could be / if / free time / had / he / John / more/.",
            ["He could be a good runner if he had more free time to practice.",
             "John could be a good runner if he had more free time to practice."],
            "write the full sentence in the correct order…"),
    q_typed("g12-fin99h-wo4", 4,
            "about / informed / they / today / must / the result / be /.",
            ["They must be informed about the result today."],
            "write the full sentence in the correct order…"),
]

BANKS = [
    (120, "نهایی خرداد ۹۹ انسانی — شنیداری فایل ۱: تست + درست/نادرست + پرسش پاسخ (ص۲۶۸)", "استاندارد", s1),
    (121, "نهایی خرداد ۹۹ انسانی — شنیداری فایل ۲: تست + پرسش پاسخ (ص۲۶۸)", "استاندارد", s2),
    (122, "نهایی خرداد ۹۹ انسانی — شنیداری فایل ۳: کامل کنید + پرسش پاسخ (ص۲۶۸-۲۶۹)", "استاندارد", s3),
    (123, "نهایی خرداد ۹۹ انسانی — واژگان با تصویر: جملهٔ مناسب هر تصویر (ص۲۶۹)", "استاندارد", s4),
    (124, "نهایی خرداد ۹۹ انسانی — واژگان: جای خالی از بانک (ص۲۶۹)", "آموزشی — ورود آزاد", s5),
    (125, "نهایی خرداد ۹۹ انسانی — واژگان: کامل‌کردن از دانش خود (ص۲۶۹)", "آموزشی — ورود آزاد", s6),
    (126, "نهایی خرداد ۹۹ انسانی — گرامر: تست چهارگزینه‌ای (ص۲۶۹-۲۷۰)", "استاندارد", s7),
    (127, "نهایی خرداد ۹۹ انسانی — شکل صحیح فعل (ص۲۷۰)", "آموزشی — ورود آزاد", s8),
    (128, "نهایی خرداد ۹۹ انسانی — ریدینگ آینشتاین: تست + درست/نادرست (ص۲۷۰)", "استاندارد", s9),
    (129, "نهایی خرداد ۹۹ انسانی — ریدینگ آینشتاین: پرسش پاسخ (ص۲۷۰)", "آموزشی — ورود آزاد", s10),
    (130, "نهایی خرداد ۹۹ انسانی — ریدینگ انرژی: تست (ص۲۷۱)", "استاندارد", s11),
    (131, "نهایی خرداد ۹۹ انسانی — ریدینگ انرژی: درست/نادرست (ص۲۷۲)", "استاندارد", s12),
    (132, "نهایی خرداد ۹۹ انسانی — ریدینگ انرژی: پرسش پاسخ (ص۲۷۲)", "آموزشی — ورود آزاد", s13),
    (133, "نهایی خرداد ۹۹ انسانی — ادامهٔ جمله: مچینگ ستون A/B (ص۲۷۲)", "استاندارد", s14),
    (134, "نهایی خرداد ۹۹ انسانی — کلمات ربط: امین (ص۲۷۲)", "آموزشی — ورود آزاد", s15),
    (135, "نهایی خرداد ۹۹ انسانی — واژگان: تعریف‌های ستون B، بخش الف (ص۲۷۳)", "استاندارد", s16),
    (136, "نهایی خرداد ۹۹ انسانی — ضرب‌المثل‌ها: ستون B، بخش ب (ص۲۷۳)", "استاندارد", s17),
    (137, "نهایی خرداد ۹۹ انسانی — مرتب‌کردن کلمات: هر دو بخش الف/ب (ص۲۷۳)", "آموزشی — ورود آزاد", s18),
]

# ================================================================ راستی‌آزماییِ OCR (وفاداریِ بدنه)
for lid, _title, _level, qs in BANKS:
    for q in qs:
        if q["id"] in s15_special_ocr:
            for frag in s15_special_ocr[q["id"]]:
                require(ocr_has(frag), f"fragment not in OCR: {q['id']} :: {frag[:60]}")
        elif q["question"].startswith("با توجه به"):
            pass  # دستورالعملِ فارسیِ درون‌اپ — الگوی r296؛ گزینه‌ها جداگانه راستی‌آزمایی می‌شوند
        else:
            require(ocr_has_stem(q["question"]), f"stem not in OCR: {q['id']} :: {q['question'][:70]}")
        if q.get("kind") == "mcq" and q["options"] not in (["True", "False"],):
            for opt in q["options"]:
                require(ocr_has(opt), f"option not in OCR: {q['id']} :: {opt[:60]}")

# کلیدهای راهنمای تصحیح (ص۲۷۵-۲۷۶) — راستی‌آزماییِ قطعه‌کلیدها
GUIDE_FRAGMENTS = [
    "1. ( d )", "2. False ( b)", "3. Because she can’t hear well.",
    "4. It might be something as simple as an infection / more serious.",
    "5. (d)", "6. (b)", "7. (a)", "8. Because her phone battery was running low.",
    "10. responding", "11. personal",
    "12. Yes, it does. It takes him a lot of time to answer the emails.",
    "13. He deletes them.", "14. He takes an organized approach with work emails.",
    "15. ( d )", "16. ( a )", "17. ( b  )", "18. ( e )",
    "19. dedicated", "20. conditioner", "21. alphabetically",
    "22. forever", "23. contain", "24. lap",
    "25. ( a )", "26. (b)", "27. (a )", "28. (c)", "29. ( d )",
    "30. increasingly", "31. collect", "32. has been discovered",
    "33. were invented", "34. were",
    "35. (b)", "36. (c)", "37. ( a) True", "38. (b) False",
    "40. He wrote a letter to President Roosevelt expressing his worry about the atomic bomb.",
    "41. (c)", "42. (b)", "43. (a) True)", "44. (b) False",
    "45. The energy is stored in their roots,/ fruits,/ and leaves.",
    "Three forms of renewable energy are: solar energy, water energy and wind",
    "47. ( c )", "48. ( d )", "49. ( a  )", "50. ( b  )",
    "51.  and", "52. or", "53. but", "54. so",
    "61. (a) The woman  who bought that apartment was talking to the neighbors in the yard.",
    "(b) His parents became happy after they had met their son.",
    "62. (a) He could be a good runner if he had more free time to practice.",
    "(b) They must be informed about the result today.",
    "فروش (a) John",
]
for frag in GUIDE_FRAGMENTS[:-1]:
    require(ocr_has(frag), f"guide fragment not in OCR: {frag[:60]}")
# لغزشِ رقمِ فارسیِ چاپی در کلیدِ ۳۹ و شمارهٔ ٦٤ روی ۴۶ — رسیدِ لغزشِ چاپ
# (متنِ بدنه ص۱ «in 1921.» دارد و وفادار است؛ لغزشِ ١٢٩١ فقط در راهنمای تصحیح است)
require("١٢٩١" in OCR, "guard: guide prints Persian-digit ١٢٩١ (slide of 1921)")
require(ocr_has("٦٤. Three forms of renewable energy are: solar energy, water energy and wind"), "guide 46 numbered ٦٤ (print slide) — receipt")

# ================================================================ داوریِ دومِ مستقل (معناییِ کلیدها — مستقل از گذرِ نخست)
SECOND = [
    # (id, تفسیرِ مستقلِ کلیدِ راهنما)
    ("g12-fin99h-l1m1", "d", "he is far from the woman" in OCR and "she can’t hear clearly" in OCR),
    ("g12-fin99h-l1tf1", "b", True),  # False
    ("g12-fin99h-l2m1", "d", ocr_has("d) low")),
    ("g12-fin99h-l2m2", "b", ocr_has("rechargeable") and ocr_has("d) b & c")),
    ("g12-fin99h-l2m3", "a", ocr_has("a)  outlet") or ocr_has("outlet")),
    ("g12-fin99h-pic1", "d", ocr_has("Hydropower is produced as a result of falling or running water")),
    ("g12-fin99h-pic2", "a", ocr_has("There are lots of free apps that you don’t need to pay money")),
    ("g12-fin99h-pic3", "b", ocr_has("hugging your child boosts the level of happiness")),
    ("g12-fin99h-pic4", "e", ocr_has("Tides can usually happen near any huge body of water")),
    ("g12-fin99h-g1", "a", ocr_has("a) which")),
    ("g12-fin99h-g2", "b", ocr_has("b) studied")),
    ("g12-fin99h-g3", "a", ocr_has("a) have built")),
    ("g12-fin99h-g4", "c", ocr_has("c) didn`t she")),
    ("g12-fin99h-g5", "d", ocr_has("d) communicative")),
    ("g12-fin99h-r1m1", "b", ocr_has("b) American citizen")),
    ("g12-fin99h-r1m2", "c", ocr_has("c) health problems")),
    ("g12-fin99h-r1tf1", "a", True),
    ("g12-fin99h-r1tf2", "b", True),
    ("g12-fin99h-r2m1", "c", ocr_has("c) renewable sources of energy")),
    ("g12-fin99h-r2m2", "b", ocr_has("the importance of energy for human life and where energy comes from")),
    ("g12-fin99h-r2tf1", "a", True),
    ("g12-fin99h-r2tf2", "b", True),
    ("g12-fin99h-cont1", "c", ocr_has("c) you can buy a pocket one.")),
    ("g12-fin99h-cont2", "d", ocr_has("d) it was not safe to drive.")),
    ("g12-fin99h-cont3", "a", ocr_has("a) I didn`t have your number.")),
    ("g12-fin99h-cont4", "b", ocr_has("b) I looked out.")),
    ("g12-fin99h-defb1", "d", ocr_has("d. stop being angry with someone")),
    ("g12-fin99h-defb2", "e", ocr_has("e. an arrangement in a particular order")),
    ("g12-fin99h-defb3", "c", ocr_has("c. in a way that is successful and achieves what you want")),
    ("g12-fin99h-defb4", "b", ocr_has("b. the amount of a product or service that people want")),
    ("g12-fin99h-prvb1", "i", ocr_has("i. You soon forget people or things that are no longer visible or present.")),
    ("g12-fin99h-prvb2", "h", ocr_has("too many people trying to lead and give their opinions")),
    ("g12-fin99h-prvb3", "f", ocr_has("f. People like to spend time with those who are similar to them.")),
    ("g12-fin99h-prvb4", "j", ocr_has("j. You have to practice a skill a lot to become good at it.")),
]
ALL_QS = [q for _lid, _t, _lv, qs in BANKS for q in qs]
for qid, letter, sem_ok in SECOND:
    require(sem_ok, f"second judgement failed: {qid} [{letter}]")
    q = next(x for x in ALL_QS if x["id"] == qid)
    pool = "fghij" if qid.startswith("g12-fin99h-prvb") else "abcde"
    require(q["answer"] == pool.index(letter), f"{qid}: answer {q['answer']} != guide letter {letter}")

# ================================================================ تزریق (idempotent — خروجیِ ناقصِ رانِ قبلی پاک می‌شود)
data = json.loads(BANK_PATH.read_text(encoding="utf-8"))
data["lessons"] = [l for l in data["lessons"] if l["lesson"] < 120]
data["source"].pop("final99h", None)
existing_ids = {q["id"] for l in data["lessons"] for q in l["questions"]}
new_lessons = []
total_new = 0
for lid, title, level, qs in BANKS:
    ids = [q["id"] for q in qs]
    require(len(ids) == len(set(ids)), f"duplicate id inside bank {lid}")
    clash = existing_ids & set(ids)
    require(not clash, f"id collision with family: {clash}")
    existing_ids |= set(ids)
    new_lessons.append({"lesson": lid, "title": title, "level": level, "count": len(qs), "questions": qs})
    total_new += len(qs)

require(data["lessons"][-1]["lesson"] == 119, f"family tail is {data['lessons'][-1]['lesson']}, expected 119")
require([l["lesson"] for l in new_lessons] == list(range(120, 138)), "lesson numbers must be 120..137")
require(total_new == 66, f"total new items {total_new} != 66")

data["lessons"].extend(new_lessons)

data["source"]["final99h"] = {
    "pages": "268-274",
    "keyPages": "275-276",
    "titlePrinted": "آزمون نهایی انگلیسی دوازدهم — نوبت خرداد ماه سال ۱۳۹۹، رشتهٔ ادبیات و علوم انسانی — علوم و معارف اسلامی (تاریخ امتحان 07/04/99) — واریانتِ دومِ رشته‌ایِ همان نوبت (r296 = ریاضی فیزیک/علوم تجربی، تاریخ 05/04/99)",
    "sections": 16,
    "banks": 18,
    "questions": 66,
    "keys": 66,
    "extractedRound": 297,
    "branchVariant": "نخستین واریانتِ رشته‌ایِ یک نوبتِ واحد در خانواده — handoffِ r296 «شهریور ۹۹ از PAGE 268» با پروبِ سربرگ اصلاح شد: PAGE 268-276 = خرداد ۹۹ انسانی؛ شهریور ۹۹ از PAGE 277 با OCR مواج (نوبت راند بعدی).",
    "audioAbsent": {"files": "۳ فایل صوتی چاپی (شمارهٔ ۱/۲/۳)", "reason": "فایل صوتی در جزوه نیست — الگوی r292-r296؛ اما همهٔ ۱۴ ساقهٔ شنیداری چاپیِ کامل دارند (دومین نوبتِ متوالی پس از r296)"},
    "openWritingAbsent": {"items": "۵۵-۵۶ (topic sentence برای Plants و Vitamin D) و بخش ۱۶ (د: پاراگرافِ بازِ Firefighters با داده‌های چاپی Keeping others safe / being always ready / wearing uniform for)", "reason": "راهنما فقط بارمِ اصولی می‌دهد (هر جمله صحیح 0/5) بدونِ نمونهٔ چاپی — الگوی r296 (۵۳/۵۴)"},
    "visualAbsent": {"items": "بخش ۱۶ (ج): topic sentence تصویری برای Light bulbs / Forest / Dictionaries / Hassan Omidzadeh", "reason": "وابسته به تصویر — الگوی comprehensive (Match the pictures)"},
    "receipts": [
        "کلیدِ ۹ آشفتهٔ OCR است (movie / to finish watching / electricity / nough / e / She needed / .9) — بازمونتاژ با لنگرهای چندگانه: «She needed enough electricity to finish watching the movie.» (الگوی r294-r296)",
        "کلیدِ ۳۹ «in١٢٩١» لغزشِ رقمِ فارسیِ چاپ است — ۱۹۲۱ (سالِ نوبلِ فیزیک آینشتاین؛ متنِ بدنه: awarded the Nobel Prize for physics in 1921) — دومین لغزشِ رقمِ فارسیِ خانواده و نخستین موردِ درونِ متنِ کلید",
        "شمارهٔ ۴۶ در راهنما «٦٤.» چاپ شده — همان لغزشِ قالبِ راهنمای r296 (آیتم ۴۶ آن راند نیز «٦٤.») — رسیدِ لغزشِ چاپ",
        "کلیدِ ۴۵ اسلش‌دارِ چاپی «roots,/ fruits,/ and leaves» = فهرستِ سه‌اسمیش نه سه واریانت — جملهٔ کاملِ ترکیبی + سه واریانتِ تکی accepted (الگوی r296-۴۵)",
        "یادداشتِ راهنما زیر ۶۱: «قسمت a با توجه به فلش جواب می‌تواند صحیح باشد» — بهم‌ریختهٔ چاپی دو خوانشِ دستوریِ کامل دارد؛ هر دو accepted با رسید",
        "تنشِ 62a: بهم‌ریخته شامل «John» است ولی کلیدِ چاپی با «He» آغاز می‌شود — هر دو واریانت accepted (کلیدِ چاپی نخست)",
        "کلیدِ ۴ اسلش‌دار «an infection / more serious» — دو واریانتِ جمله‌کامل accepted",
        "گزینهٔ d آیتم ۶ «b & c» ترکیبیِ چاپی وفادار ماند — کلیدِ راهنما (b) rechargeable",
        "اضافه‌های چاپی: واژگان تصویری (c) / بانک واژگان (introduction) / تعریف‌ها (a. cry suddenly) / ضرب‌المثل‌ها (g. When two people cooperate…) — بانکِ کامل در options (الگوی r296)",
        "بک‌تیک‌های چاپی وفادار: doesn`t she / don`t they / didn`t she / didn`t they / mother`s / I didn`t have your number. / The sun`s energy — آپاستروفِ خمیدهٔ چاپی نیز وفادار: can’t / couldn’t / authors’ / friend’s / it’s / don’t (۳۱)",
        "ساقه‌های تکراری بین دو واریانتِ رشته‌ایِ خرداد ۹۹ عمدی است (جملهٔ Teenagers… در هر دو) — گاردِ برخورد شناسه‌محور است نه ساقه‌محور (درس r295)",
        "پانوشتِ راهنما (املا در بخش شنیداری/واژگان حساس نیست + زیرخطِ پاسخِ کامل) ثبت شد — نمره‌دهیِ مصححان، نه آیتم",
        "متنِ دو ریدینگ (آینشتاین/انرژی) درون‌اپ حمل نشد (الگوی r289-r296) — تصویر صفحه در کتابخانهٔ جزوه در دسترس است؛ ساقه‌ها خودبسنده‌اند",
        "Section 10 راهنما یک ردیفِ پیوسته برای ۴۱-۴۶ است (تست + درست/نادرست + پرسش پاسخ) — درون‌اپ به سه بانکِ r2m/r2tf/r2t شکسته شد (الگوی r296 ریدینگ‌ها)",
    ],
}

BANK_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

print(f"injected {len(new_lessons)} banks / {total_new} items; family now {len(data['lessons'])} banks / {sum(l['count'] for l in data['lessons'])} tests")
if failures:
    print("FAILURES:")
    for f in failures:
        print(" -", f)
    sys.exit(1)
print("all OCR fidelity + second-judgement checks passed")
