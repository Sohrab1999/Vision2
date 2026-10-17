#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r300 — آزمون نهایی شهریور ۱۳۹۹، ویژهٔ ناشنوایان (مرکز سنجش aee.medu.ir — بدنه ص۲۹۳-۲۹۸، راهنمای تصحیح ص۲۹۹-۳۰۰)
نهمین نوبتِ «آزمون‌های نهایی دی ۹۷ تا شهریور ۱۴۰۱» — واریانتِ سومِ همان شهریور ۹۹ (r298 = چاپِ جزوه؛ r299 = رسمیِ سراسریِ کل رشته‌ها؛ این راند = ویژهٔ ناشنوایان).
کشف‌های راند:
(۱) نخستین نوبتِ بی‌شنیداریِ خانواده — امتحانِ ویژهٔ ناشنوایان اساساً بخشِ شنیداری ندارد (حذفِ کاملِ بخش، نه غیبتِ فایل).
(۲) چهار بخشِ نو: ناهماهنگِ یگانه (۱۰/۱۱ — دومین در خانواده پس از r295)، شکلِ صحیحِ فعل با راهنمای چاپی (۲۱-۲۴)،
ریدینگِ تازهٔ فرهنگ‌لغت/جملهٔ نمونه (۳۹-۴۲)، پاراگراف‌کاویِ «جملهٔ آغازین + نامربوط» (۴۹/۵۰ — نخستین بار).
(۳) واریانتِ «کوتاه‌شدهٔ رسمی»: بخش‌های ۱۵-۲۰/۲۵-۲۶/۳۳-۴۶/۴۷/۵۱-۶۲ عینِ چاپِ سراسریِ کل رشته‌ها (r299) است —
هم‌ساقه‌گیِ موازی عمدی است (گاردِ شناسه‌محور؛ درس r295/r299)؛ تنها تفاوتِ متنی: «line 2» به‌جای «line 3» در آیتم ۲۹.
(۴) ۶۳ آیتمِ قابلِ بازی از ۶۷ آیتمِ چاپی — پاراگراف‌کاویِ ۴۹/۵۰ به چهار آیتم گسترش یافت (Topic+Irrelevant برای هر پاراگراف —
کلیدِ چاپیِ هر چهار جمله در راهنماست)؛ غیبتِ صادقانهٔ ۴۸ و ۶۳-۶۷ (بارمِ اصولی بدونِ نمونه)؛ بارمِ «explanation» پاراگراف‌کاوی باز است.
۱۹ بانک / ۶۳ آیتم — خانوادهٔ موضوعی هفدهم: ۱۱۰۳ + ۶۳ = ۱۱۶۶ تست در ۱۹۰ بانک.
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
    s = re.sub(r"[\"'`´‘’“”«»˝\u02DD\u030B]", "", s)  # ˝ چاپیِ ریدینگِ فرهنگ‌لغت = U+030B ترکیبی (رسیدِ فنی)
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

# ---------------------------------------------------------------- S1 واژگان با تصویر (ص۲۹۳) — همان پنج جملهٔ چاپی با اضافهٔ e؛ کلید b/d/a/c
PIC_INSTR = "با توجه به تصاویر داده‌شده، جملهٔ مناسب برای هر تصویر را انتخاب کنید. (یک جمله اضافی است)"
PIC_OPTS = [
    "The mother is hugging her little child.",
    "My sister often sits in the balcony and studies her lessons.",
    "The student circled the dictionary entry for the new word.",
    "Solar panels change solar power into electricity.",
    "The sofa converts into bed.",
]
s1 = [
    q_mcq("g12-fin99shd-pic1", 1, PIC_INSTR, PIC_OPTS, 1),  # ۱ → (b) balcony
    q_mcq("g12-fin99shd-pic2", 2, PIC_INSTR, PIC_OPTS, 3),  # ۲ → (d) solar panels
    q_mcq("g12-fin99shd-pic3", 3, PIC_INSTR, PIC_OPTS, 0),  # ۳ → (a) hugging
    q_mcq("g12-fin99shd-pic4", 4, PIC_INSTR, PIC_OPTS, 2),  # ۴ → (c) dictionary entry
]
# ---------------------------------------------------------------- S2 واژگان: بانک شش‌واژه‌ای (ص۲۹۳) — repeatedly/forever/burst/demand/variety/arrange (اضافه: forever)؛ کلید arrange/demand/repeatedly/burst/variety
VB_POOL = ["repeatedly", "forever", "burst", "demand", "variety", "arrange"]
s2 = [
    q_typed("g12-fin99shd-vb1", 1,
            "We’ll need to --------------- the chairs around the table.",
            ["arrange"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99shd-vb2", 2,
            "The --------------- for organic food is increasing these days.",
            ["demand"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99shd-vb3", 3,
            "I have told Mohsen --------------- to talk politely to his teacher.",
            ["repeatedly"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99shd-vb4", 4,
            "Aida --------------- into tears when she saw her score.",
            ["burst"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99shd-vb5", 5,
            "They do a --------------- of fitness activities.",
            ["variety"], "fill in the blank with the missing word…"),
]
for q in s2:
    q["options"] = list(VB_POOL)  # داربست = بانکِ کاملِ چاپی (الگوی r296-r299)
# ---------------------------------------------------------------- S3 ناهماهنگِ یگانه (ص۲۹۳) — کلید b/c؛ دومین نوبتِ خانواده پس از r295
ODD_INSTR = "کلمهٔ ناهماهنگ با بقیه گزینه‌ها را مشخص کنید."
s3 = [
    q_mcq("g12-fin99shd-odd1", 1, ODD_INSTR,
          ["take care of", "look up", "care for", "look after"], 1),   # b. look up
    q_mcq("g12-fin99shd-odd2", 2, ODD_INSTR,
          ["water", "wind", "coal", "sun"], 2),                        # c. coal
]
# ---------------------------------------------------------------- S4 واژگان: کامل‌کردن از دانش خود (ص۲۹۳) — حرفِ نخستِ چاپی h-/s-/p-
s4 = [
    q_typed("g12-fin99shd-ok1", 1,
            "They have to speak louder, because their grandmother is hard of h --------------- .",
            ["hearing"], "start with the printed first letter h…"),
    q_typed("g12-fin99shd-ok2", 2,
            "There are some free dictionaries for PCs and apps for s --------------- phones.",
            ["smart"], "start with the printed first letter s…"),
    q_typed("g12-fin99shd-ok3", 3,
            "We should not build factories near rivers because they p --------------- the rivers.",
            ["pollute"], "start with the printed first letter p…"),
]
# ---------------------------------------------------------------- S5 گرامر: تست چهارگزینه‌ای (ص۲۹۳-۲۹۴) — عینِ r299؛ کلید b/c/b/d/c/a
s5 = [
    q_mcq("g12-fin99shd-g1", 1,
          "They will buy a new house, ---------------?",
          ["won`t he", "won`t they", "will they", "will he"], 1),
    q_mcq("g12-fin99shd-g2", 2,
          "My mother found the keys --------------- I lost last week.",
          ["when", "whom", "which", "who"], 2),
    q_mcq("g12-fin99shd-g3", 3,
          "Hafez --------------- to be as one of the most famous Persian poet of all time.",
          ["knows", "is known", "knowing", "has known"], 1),
    q_mcq("g12-fin99shd-g4", 4,
          "A: What is the problem? B: The windows --------------- by the boys.",
          ["are breaking", "have broken", "broke", "have been broken"], 3),
    q_mcq("g12-fin99shd-g5", 5,
          "If the old man had his glasses, he --------------- the paper easily.",
          ["can read", "was reading", "could read", "read"], 2),
    q_mcq("g12-fin99shd-g6", 6,
          "My job has become --------------- difficult because of my illness.",
          ["increasingly", "increase", "increasing", "increases"], 0),
]
# ---------------------------------------------------------------- S6 شکل صحیح فعل با راهنمای چاپی (ص۲۹۴) — کلید was found/forgets/got/been made
s6 = [
    q_typed("g12-fin99shd-vf1", 1,
            "The robber --------------- by the police last week. (to find)",
            ["was found"], "شکل صحیح فعلِ داخل پرانتز را بنویسید…"),
    q_typed("g12-fin99shd-vf2", 2,
            "Kate --------------- to feed the chickens, doesn`t he? (to forget)",
            ["forgets"], "شکل صحیح فعلِ داخل پرانتز را بنویسید…"),
    q_typed("g12-fin99shd-vf3", 3,
            "If it --------------- warmer, they would travel to the north. (to get)",
            ["got"], "شکل صحیح فعلِ داخل پرانتز را بنویسید…"),
    q_typed("g12-fin99shd-vf4", 4,
            "A new medicine has --------------- by doctors to cure cancer. (to make)",
            ["been made"], "شکل صحیح فعلِ داخل پرانتز را بنویسید…"),
]
# ---------------------------------------------------------------- S7+S8 ضمیر موصولی و شرطی (ص۲۹۴) — عینِ r299؛ کلید which / would|could|might
s78 = [
    q_typed("g12-fin99shd-rel1", 1,
            "A cheetah is an animal --------------- .",
            ["which"], "با which + یک جملهٔ دارای فعل کامل کنید…"),
    q_typed("g12-fin99shd-cond1", 2,
            "If I had wings, I --------------- .",
            ["would", "could", "might"], "با would/could/might + جمله ادامه دهید…"),
]
# ---------------------------------------------------------------- S9 ریدینگ انسان‌های اولیه (ص۲۹۴-۲۹۵) — «line 2» (r299 «line 3» داشت)؛ کلید True/True/b/d + means/founding
s9 = [
    q_tf("g12-fin99shd-r1tf1", 1, "Early humans killed the animals and ate them as their food.", 0),  # True
    q_tf("g12-fin99shd-r1tf2", 2, "Early humans discovered how to make fire.", 0),                    # True
    q_mcq("g12-fin99shd-r1m1", 3,
          "What does “they” in line 2 refer to?",
          ["environments", "humans", "fires", "animals"], 1),
    q_mcq("g12-fin99shd-r1m2", 4,
          "What is this passage mostly about? It is about --------------- .",
          ["how animals were hunted", "the plants early humans ate",
           "how to make fire", "the life of early humans"], 3),
]
s9c = [
    q_typed("g12-fin99shd-r1c1", 1,
            "Fire provided the --------------- for cooking plants which were not eaten before.",
            ["means"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99shd-r1c2", 2,
            "Finally, early humans began to follow other goals such as --------------- the cities.",
            ["founding"], "fill in the blank with the missing word…"),
]
# ---------------------------------------------------------------- S10 ریدینگ احترام (ص۲۹۵) — عینِ r299؛ کلید True/False/d/a + پرسش پاسخ
s10 = [
    q_tf("g12-fin99shd-r2tf1", 1, "We respect those who are important to us for some reasons.", 0),   # True
    q_tf("g12-fin99shd-r2tf2", 2, "If you are impolite or act badly toward people, they feel important.", 1),  # False
    q_mcq("g12-fin99shd-r2m1", 3,
          "We show our --------------- by being polite to those we care for.",
          ["need", "strength", "happiness", "respect"], 3),
    q_mcq("g12-fin99shd-r2m2", 4,
          "Telling your parents that you thank them --------------- the level of your respect for them.",
          ["reflects", "invents", "imagines", "shouts"], 0),
]
s10q = [
    q_typed("g12-fin99shd-r2q1", 1,
            "What is the easiest way to show your love and respect to your parents?",
            ["The easiest way to show your love and respect is to tell them that you appreciate who they are and what they do."],
            "answer with a full sentence…"),
    q_typed("g12-fin99shd-r2q2", 2,
            "Can doing good small things show your respect to your parents? (Give an example).",
            ["Yes, it can, for example, washing the dishes.",
             "Yes, it can, for example, cleaning the kitchen.",
             "Yes, it can, for example, cleaning the room."],
            "answer with a full sentence…"),
]
# ---------------------------------------------------------------- S11 ریدینگ تازه: فرهنگ‌لغت/جملهٔ نمونه (ص۲۹۵-۲۹۶) — کلید True/True + tell / copy them
s11 = [
    q_tf("g12-fin99shd-r3tf1", 1, "You can see the new word in its example sentence.", 0),          # True
    q_tf("g12-fin99shd-r3tf2", 2, "Definitions sometimes give you grammatical information.", 0),    # True
]
s11q = [
    q_typed("g12-fin99shd-r3q1", 1,
            "What does the word “truth” usually go with??",
            ["The word “truth” usually goes with tell."],
            "answer with a full sentence…"),
    q_typed("g12-fin99shd-r3q2", 2,
            "How can you make your own sentences more natural?",
            ["You can easily copy them to make your own sentences seem more natural.",
             "I can easily copy them to make my own sentences seem more natural."],
            "answer with a full sentence…"),
]
# ---------------------------------------------------------------- S12 کلمات ربط (ص۲۹۶) — عینِ r299؛ کلید and/or/but/so
CONN_POOL = ["but", "and", "so", "or"]
s12 = [
    q_typed("g12-fin99shd-conn1", 1,
            "I get up early in the morning, --------------- I make an omelet myself.",
            ["and"], "fill in the blank with a connective…"),
    q_typed("g12-fin99shd-conn2", 2,
            "We can eat our lunch at the restaurant, --------------- we can have it at home.",
            ["or"], "fill in the blank with a connective…"),
    q_typed("g12-fin99shd-conn3", 3,
            "They wanted to call you, --------------- they did not have your phone number.",
            ["but"], "fill in the blank with a connective…"),
    q_typed("g12-fin99shd-conn4", 4,
            "That dictionary is expensive, --------------- I can’t buy it.",
            ["so"], "fill in the blank with a connective…"),
]
for q in s12:
    q["options"] = list(CONN_POOL)
# ---------------------------------------------------------------- S13 جملهٔ مرکب با کلمهٔ ربط (ص۲۹۶) — کلید …so he passed it.
s13 = [
    q_typed("g12-fin99shd-cc1", 1,
            "Saeed studied hard for the exam, --------------- .",
            ["so he passed it."], "با یکی از کلمات ربط جملهٔ مرکب معنادار بسازید…"),
]
# ---------------------------------------------------------------- S15 پاراگراف‌کاوی (ص۲۹۶) — نخستین بار: Topic + Irrelevantِ هر پاراگراف (کلیدِ چاپیِ هر چهار جمله)؛ بارمِ explanation باز است
s15 = [
    q_typed("g12-fin99shd-pa1", 1,
            "جملهٔ آغازین (Topic) پاراگراف A کوسه‌ها را بنویسید.",
            ["Sharks are fast-swimming fishes.", "Sharks are fast swimming fishes."],
            "جملهٔ آغازینِ پاراگراف را کامل بنویسید…"),
    q_typed("g12-fin99shd-pa2", 2,
            "جملهٔ نامربوط (Irrelevant) پاراگراف A کوسه‌ها را بنویسید.",
            ["Tigers live on the ground, and in the trees."],
            "جمله‌ای که به موضوعِ پاراگراف مربوط نیست را کامل بنویسید…"),
    q_typed("g12-fin99shd-pa3", 3,
            "جملهٔ آغازین (Topic) پاراگراف B ستارگان را بنویسید.",
            ["The stars are tiny points of light in the space."],
            "جملهٔ آغازینِ پاراگراف را کامل بنویسید…"),
    q_typed("g12-fin99shd-pa4", 4,
            "جملهٔ نامربوط (Irrelevant) پاراگراف B ستارگان را بنویسید.",
            ["We live on the Earth."],
            "جمله‌ای که به موضوعِ پاراگراف مربوط نیست را کامل بنویسید…"),
]
# ---------------------------------------------------------------- S16الف تعریف‌ها (ص۲۹۷) — عینِ r299؛ کلید c/a/d/e
DEFB_OPTS = [
    "to take something in, especially gradually",
    "cry suddenly",
    "a book in which you record your thoughts or feelings or what has happened every day",
    "to suddenly decide to do something",
    "to finish something",
]
s16a = [
    q_mcq("g12-fin99shd-defb1", 1, "I have kept a diary for twelve years.", DEFB_OPTS, 2),
    q_mcq("g12-fin99shd-defb2", 2, "Plants absorb carbon dioxide.", DEFB_OPTS, 0),
    q_mcq("g12-fin99shd-defb3", 3, "I did not read the introduction and jumped into the next part.", DEFB_OPTS, 3),
    q_mcq("g12-fin99shd-defb4", 4, "Don’t use up all the milk - we need some for breakfast.", DEFB_OPTS, 4),
]
# ---------------------------------------------------------------- S16ب ضرب‌المثل‌ها (ص۲۹۷) — عینِ r299؛ کلید j/h/f/g
PRVB_OPTS = [
    "When you get money quickly, like by winning it, it’s easy to spend it or lose it quickly as well.",
    "When two people cooperate with each other, they come up with better ideas.",
    "You have to practice a skill a lot to become good at it.",
    "People like to spend time with those who are similar to them.",
    "You soon forget people or things that are no longer visible or present.",
]
s16b = [
    q_mcq("g12-fin99shd-prvb1", 1, "Out of sight, out of mind", PRVB_OPTS, 4),
    q_mcq("g12-fin99shd-prvb2", 2, "Practice makes perfect", PRVB_OPTS, 2),
    q_mcq("g12-fin99shd-prvb3", 3, "Easy come, easy go", PRVB_OPTS, 0),
    q_mcq("g12-fin99shd-prvb4", 4, "Two heads are better than one", PRVB_OPTS, 1),
]
# ---------------------------------------------------------------- S17 مرتب‌کردن کلمات (ص۲۹۷) — عینِ r299؛ هر چهار جمله
s17 = [
    q_typed("g12-fin99shd-ws1", 1,
            "work / some workers / who / and teachers / in the village / there are / .",
            ["There are some workers and teachers who work in the village."],
            "جملهٔ مرتب‌شده را کامل بنویسید…"),
    q_typed("g12-fin99shd-ws2", 2,
            "wrote / didn’t / a letter / the girl / she / , / ?",
            ["The girl wrote a letter, didn`t she?"],
            "جملهٔ مرتب‌شده را کامل بنویسید…"),
    q_typed("g12-fin99shd-ws3", 3,
            "because / hadn’t rained / everything in the garden / it / was brown / .",
            ["Everything in the garden was brown because it hadn`t rained."],
            "جملهٔ مرتب‌شده را کامل بنویسید…"),
    q_typed("g12-fin99shd-ws4", 4,
            "be / by the teacher / the parents / called / should / .",
            ["The parents should be called by the teacher."],
            "جملهٔ مرتب‌شده را کامل بنویسید…"),
]

BANKS = [
    (172, "نهایی ناشنوایان شهریور ۹۹ — واژگان با تصویر: جملهٔ مناسب هر تصویر (ص۲۹۳)", "استاندارد", s1),
    (173, "نهایی ناشنوایان شهریور ۹۹ — واژگان: بانک شش‌واژه‌ای، کامل کنید (ص۲۹۳)", "آموزشی — ورود آزاد", s2),
    (174, "نهایی ناشنوایان شهریور ۹۹ — ناهماهنگِ یگانه: تست (ص۲۹۳)", "استاندارد", s3),
    (175, "نهایی ناشنوایان شهریور ۹۹ — واژگان: کامل‌کردن از دانش خود (ص۲۹۳)", "آموزشی — ورود آزاد", s4),
    (176, "نهایی ناشنوایان شهریور ۹۹ — گرامر: تست چهارگزینه‌ای (ص۲۹۳-۲۹۴)", "استاندارد", s5),
    (177, "نهایی ناشنوایان شهریور ۹۹ — شکل صحیح فعل با راهنما، بنویسید (ص۲۹۴)", "آموزشی — ورود آزاد", s6),
    (178, "نهایی ناشنوایان شهریور ۹۹ — ضمیر موصولی و شرطی، بنویسید (ص۲۹۴)", "آموزشی — ورود آزاد", s78),
    (179, "نهایی ناشنوایان شهریور ۹۹ — ریدینگ انسان‌های اولیه: درست/نادرست + تست (ص۲۹۴-۲۹۵)", "استاندارد", s9),
    (180, "نهایی ناشنوایان شهریور ۹۹ — ریدینگ انسان‌های اولیه: کامل کنید (ص۲۹۵)", "آموزشی — ورود آزاد", s9c),
    (181, "نهایی ناشنوایان شهریور ۹۹ — ریدینگ احترام: درست/نادرست + تست (ص۲۹۵)", "استاندارد", s10),
    (182, "نهایی ناشنوایان شهریور ۹۹ — ریدینگ احترام: پرسش پاسخ (ص۲۹۵)", "آموزشی — ورود آزاد", s10q),
    (183, "نهایی ناشنوایان شهریور ۹۹ — ریدینگ فرهنگ‌لغت: درست/نادرست (ص۲۹۵-۲۹۶)", "استاندارد", s11),
    (184, "نهایی ناشنوایان شهریور ۹۹ — ریدینگ فرهنگ‌لغت: پرسش پاسخ (ص۲۹۶)", "آموزشی — ورود آزاد", s11q),
    (185, "نهایی ناشنوایان شهریور ۹۹ — کلمات ربط، کامل کنید (ص۲۹۶)", "آموزشی — ورود آزاد", s12),
    (186, "نهایی ناشنوایان شهریور ۹۹ — جملهٔ مرکب با کلمهٔ ربط، بنویسید (ص۲۹۶)", "آموزشی — ورود آزاد", s13),
    (187, "نهایی ناشنوایان شهریور ۹۹ — پاراگراف‌کاوی: آغازین و نامربوط، بنویسید (ص۲۹۶)", "آموزشی — ورود آزاد", s15),
    (188, "نهایی ناشنوایان شهریور ۹۹ — واژگان: تعریف‌های ستون B، بخش الف (ص۲۹۷)", "استاندارد", s16a),
    (189, "نهایی ناشنوایان شهریور ۹۹ — ضرب‌المثل‌ها: ستون B، بخش ب (ص۲۹۷)", "استاندارد", s16b),
    (190, "نهایی ناشنوایان شهریور ۹۹ — مرتب‌کردن کلمات، بنویسید (ص۲۹۷)", "آموزشی — ورود آزاد", s17),
]

# ================================================================ راستی‌آزماییِ OCR (وفاداریِ بدنه)
SKIP_PREFIXES = ("با توجه به", "کلمهٔ ناهماهنگ", "جملهٔ آغازین", "جملهٔ نامربوط")
for lid, _title, _level, qs in BANKS:
    for q in qs:
        if q["question"].startswith(SKIP_PREFIXES):
            pass  # دستورالعملِ فارسیِ درون‌اپ — الگوی r296-r299؛ گزینه‌ها/کلیدها جداگانه راستی‌آزمایی می‌شوند
        else:
            require(ocr_has_stem(q["question"]), f"stem not in OCR: {q['id']} :: {q['question'][:70]}")
        if q.get("kind") == "mcq" and q["options"] not in (["True", "False"],):
            for opt in q["options"]:
                require(ocr_has(opt), f"option not in OCR: {q['id']} :: {opt[:60]}")

# ================================================================ کلیدهای راهنمای تصحیح (ص۲۹۹-۳۰۰) — راستی‌آزماییِ قطعه‌کلیدها
GUIDE_FRAGMENTS = [
    "1. ( b  )", "2.(  d  )", "3. ( a  )", "4. ( c )",
    "5. arrange", "6. demand", "7. repeatedly", "8. burst", "9. variety",
    "10. ( b )", "11. ( c )",
    "12. hearing", "13. smart", "14. pollute",
    "15. ( b)", "16. ( c )", "17. ( b )", "18. ( d )", "19. ( c )", "20. ( a )",
    "21. was found", "22. forgets", "23. got", "24. been made",
    "27. (a) True", "28. (a) True", "29. ( b )", "30. ( d )",
    "31. means", "32. founding",
    "33. (a) True", "34. (b) False", "35. ( d )", "36. ( a )",
    "39. (a) True", "40. (a) True",
    "41. The word “truth” usually goes with tell.",
    "42. You/I can easily copy them to make your/my own sentences seem more natural.",
    "43. and", "44. or", "45. but", "46. so",
    "47. …so he passed it.",
]
for frag in GUIDE_FRAGMENTS:
    require(ocr_has(frag), f"guide fragment not in OCR: {frag[:60]}")
# کلید ۲۵: «which .25» (بازخوانیِ ستونِ چاپی) + توضیحِ «جملهٔ دارای فعل»
require(ocr_has("which . 25"), "guide 25 prints the relative pronoun «which» as the key")
require(ocr_has("باید  which را به همراه یک جمله یا عبارت"), "guide 25 carries the verb-clause note (same as r299 guide 31)")
# کلید ۲۶: فهرستِ مجازِ مدال‌ها
require(ocr_has("(would  ,could ,might)"), "guide 26 prints the accepted modal list would/could/might")
# کلید ۵۱-۵۸ حرفی
require(ocr_has("51- c 55- j 52- a 56- h 53- d 57- f 54- e 58- g"), "guide 16 prints keys 51-c/52-a/53-d/54-e and 55-j/56-h/57-f/58-g")
# پاراگراف‌کاوی: کلیدهای چاپیِ Topic/Irrelevant (جملهٔ Tiger در چاپِ RTL دوپاره است: «Tiger» + «s live on the ground»)
require(ocr_has("are fast swimming fishes"), "guide 49 prints Topic key «Sharks are fast swimming fishes» (hyphen dropped in guide)")
require(ocr_has("s live on the ground"), "guide 49 prints Irrelevant key «Tigers live on the ground, and in the trees» (RTL-broken print)")
require(ocr_has("The stars"), "guide 50 prints Topic key «The stars are tiny points of light in the space»")
require(ocr_has("We live on the Earth."), "guide 50 prints Irrelevant key «We live on the Earth»")
require(ocr_has("irrelevant sente"), "guide prints «Irrelevant sentence» label (RTL print break: sente/nce)")
# بخش‌های ۱۶-۱۸ همان قالبِ r299 (انتخابی؛ عنوانِ پاراگراف‌های ۶۳-۶۶ و ۶۷)
require(ocr_has("66. d) Clean energy"), "guide body 18 prints picture titles a-d (Ferdowsi/Watching TV/Sport/Clean energy)")
require(ocr_has("Having a healthy lifestyle"), "guide body 18ب prints the open paragraph title")

# ================================================================ داوریِ دومِ مستقل (معناییِ کلیدها — مستقل از گذرِ نخست)
SECOND = [
    # (id, حرفِ کلیدِ راهنما, نشانهٔ معناییِ مستقل در OCR)
    ("g12-fin99shd-pic1", "b", ocr_has("My sister often sits in the balcony")),
    ("g12-fin99shd-pic2", "d", ocr_has("Solar panels change solar power into electricity")),
    ("g12-fin99shd-pic3", "a", ocr_has("The mother is hugging her little child")),
    ("g12-fin99shd-pic4", "c", ocr_has("The student circled the dictionary entry")),
    ("g12-fin99shd-odd1", "b", ocr_has("b. look up") and ocr_has("care for") and ocr_has("look after")),
    ("g12-fin99shd-odd2", "c", ocr_has("c. coal") and ocr_has("b. wind")),
    ("g12-fin99shd-g1", "b", ocr_has("b) won`t they")),
    ("g12-fin99shd-g2", "c", ocr_has("c) which")),
    ("g12-fin99shd-g3", "b", ocr_has("b) is known")),
    ("g12-fin99shd-g4", "d", ocr_has("d) have been broken")),
    ("g12-fin99shd-g5", "c", ocr_has("c) could read")),
    ("g12-fin99shd-g6", "a", ocr_has("a) increasingly")),
    ("g12-fin99shd-r1tf1", "a", True),
    ("g12-fin99shd-r1tf2", "a", True),
    ("g12-fin99shd-r1m1", "b", ocr_has("b) humans")),
    ("g12-fin99shd-r1m2", "d", ocr_has("d) the life of early humans")),
    ("g12-fin99shd-r2tf1", "a", True),
    ("g12-fin99shd-r2tf2", "b", True),
    ("g12-fin99shd-r2m1", "d", ocr_has("d) respect")),
    ("g12-fin99shd-r2m2", "a", ocr_has("a) reflects")),
    ("g12-fin99shd-r3tf1", "a", True),
    ("g12-fin99shd-r3tf2", "a", True),
    ("g12-fin99shd-defb1", "c", ocr_has("c. a book in which you record your thoughts")),
    ("g12-fin99shd-defb2", "a", ocr_has("a. to take something in, especially gradually")),
    ("g12-fin99shd-defb3", "d", ocr_has("d. to suddenly decide to do something")),
    ("g12-fin99shd-defb4", "e", ocr_has("e. to finish something")),
    ("g12-fin99shd-prvb1", "j", ocr_has("j. You soon forget people or things that are no longer visible or present")),
    ("g12-fin99shd-prvb2", "h", ocr_has("h. You have to practice a skill a lot to become good at it")),
    ("g12-fin99shd-prvb3", "f", ocr_has("f. When you get money quickly")),
    ("g12-fin99shd-prvb4", "g", ocr_has("g. When two people cooperate with each other")),
]
ALL_QS = [q for _lid, _t, _lv, qs in BANKS for q in qs]
for qid, letter, sem_ok in SECOND:
    require(sem_ok, f"second judgement failed: {qid} [{letter}]")
    q = next(x for x in ALL_QS if x["id"] == qid)
    pool = "ab" if q["options"] == ["True", "False"] else ("fghij" if qid.startswith("g12-fin99shd-prvb") else "abcde")
    require(q["answer"] == pool.index(letter), f"{qid}: answer {q['answer']} != guide letter {letter}")

# کلیدهای تایپی — هر accepted باید در OCR یا راهنما ریشهٔ چاپی داشته باشد
TYPED_KEYS = {
    "g12-fin99shd-vb1": ["arrange"], "g12-fin99shd-vb2": ["demand"], "g12-fin99shd-vb3": ["repeatedly"],
    "g12-fin99shd-vb4": ["burst"], "g12-fin99shd-vb5": ["variety"],
    "g12-fin99shd-ok1": ["hearing"], "g12-fin99shd-ok2": ["smart"], "g12-fin99shd-ok3": ["pollute"],
    "g12-fin99shd-vf1": ["was found"], "g12-fin99shd-vf2": ["forgets"], "g12-fin99shd-vf3": ["got"], "g12-fin99shd-vf4": ["been made"],
    "g12-fin99shd-rel1": ["which"],
    "g12-fin99shd-cond1": ["would", "could", "might"],
    "g12-fin99shd-r1c1": ["means"], "g12-fin99shd-r1c2": ["founding"],
    "g12-fin99shd-r2q1": ["The easiest way to show your love and respect is to tell them that you appreciate who they are and what they do."],
    "g12-fin99shd-r2q2": ["washing the dishes", "cleaning the kitchen", "cleaning the room"],
    "g12-fin99shd-r3q1": ["usually goes with tell"],
    "g12-fin99shd-r3q2": ["You can easily copy them to make your own sentences seem more natural.",
                          "I can easily copy them to make my own sentences seem more natural."],
    "g12-fin99shd-conn1": ["and"], "g12-fin99shd-conn2": ["or"], "g12-fin99shd-conn3": ["but"], "g12-fin99shd-conn4": ["so"],
    "g12-fin99shd-cc1": ["so he passed it."],
    "g12-fin99shd-pa1": ["Sharks are fast-swimming fishes."],
    "g12-fin99shd-pa2": ["Tigers live on the ground, and in the trees."],
    "g12-fin99shd-pa3": ["The stars are tiny points of light in the space."],
    "g12-fin99shd-pa4": ["We live on the Earth."],
    "g12-fin99shd-ws1": ["There are some workers and teachers who work in the village."],
    "g12-fin99shd-ws2": ["The girl wrote a letter, didn`t she?"],
    "g12-fin99shd-ws3": ["Everything in the garden was brown because it hadn`t rained."],
    "g12-fin99shd-ws4": ["The parents should be called by the teacher."],
}
for qid, keys in TYPED_KEYS.items():
    q = next(x for x in ALL_QS if x["id"] == qid)
    require(q["kind"] == "typed", f"{qid} must be typed")
    for k in keys:
        require(any(k in a for a in q["accepted"]), f"{qid}: accepted lacks printed key variant {k[:40]}")

# ================================================================ تزریق (idempotent — خروجیِ ناقصِ رانِ قبلی پاک می‌شود)
data = json.loads(BANK_PATH.read_text(encoding="utf-8"))
data["lessons"] = [l for l in data["lessons"] if l["lesson"] < 172]
data["source"].pop("final99shd", None)
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

require(data["lessons"][-1]["lesson"] == 171, f"family tail is {data['lessons'][-1]['lesson']}, expected 171")
require([l["lesson"] for l in new_lessons] == list(range(172, 191)), "lesson numbers must be 172..190")
require(total_new == 63, f"total new items {total_new} != 63")

data["lessons"].extend(new_lessons)

data["source"]["final99shd"] = {
    "pages": "293-298",
    "keyPages": "299-300",
    "titlePrinted": "آزمون نهایی انگلیسی دوازدهم — نوبت شهریور ماه سال ۱۳۹۹، ویژهٔ ناشنوایان، مرکز سنجش و پایش کیفیت آموزشی (aee.medu.ir)، کلیهٔ رشته‌ها، تاریخ ۱۳/۰۶/۹۹، ۶ صفحه، جمع نمره ۴۸ — واریانتِ سومِ همان شهریور ۹۹ (r298 = چاپِ جزوه؛ r299 = رسمیِ سراسریِ کل رشته‌ها)",
    "sections": 18,
    "banks": 19,
    "questions": 63,
    "keys": 63,
    "extractedRound": 300,
    "branchVariant": "سومین واریانتِ یک نوبتِ واحد — امتحانِ ویژهٔ ناشنوایان: نخستین نوبتِ بی‌شنیداریِ خانواده (حذفِ کاملِ بخشِ شنیداری، نه غیبتِ فایل) + چهار بخشِ نو (ناهماهنگِ یگانه ۱۰/۱۱، شکلِ صحیحِ فعل با راهنمای چاپی ۲۱-۲۴، ریدینگِ تازهٔ فرهنگ‌لغت/جملهٔ نمونه ۳۹-۴۲، پاراگراف‌کاویِ آغازین/نامربوط ۴۹-۵۰). بخش‌های ۱۵-۲۰/۲۵-۲۶/۳۳-۴۶/۴۷/۵۱-۶۲ عینِ چاپِ سراسریِ r299 است — هم‌ساقه‌گیِ موازی عمدی (گاردِ شناسه‌محور).",
    "audioAbsent": None,
    "openWritingAbsent": {"items": "۴۸ (topic sentence برای Smoking) و بخش ۱۸: ۶۳-۶۶ (topic sentence برای Ferdowsi/Watching TV/Sport/Clean energy) و ۶۷ (پاراگرافِ بازِ Having a healthy lifestyle) + بارمِ «explanation» پاراگراف‌کاویِ ۴۹/۵۰ (باز، بدونِ نمونهٔ چاپی)", "reason": "راهنما فقط بارمِ اصولی می‌دهد — الگوی r296-r299"},
    "receipts": [
        "نخستین نوبتِ بی‌شنیداریِ خانواده: سربرگِ «(ویژه ناشنوایان)» — ساختار بدونِ هیچ بخشِ شنیداری آغاز می‌شود (واژگان تصویری اولین بخش است)",
        "پاراگراف‌کاویِ ۴۹/۵۰ — نخستین بار: راهنما Topic (۰/۵) + explanation (۰/۵) + Irrelevant sentence (۰/۵) می‌دهد؛ Topic و Irrelevantِ هر دو پاراگراف چاپی‌اند (چهار آیتمِ playable) و explanation باز است — رسید",
        "کلیدِ Topicِ ۴۹ در راهنما بدونِ خطِّ تیره چاپ شده («are fast swimming fishes») در برابر بدنهٔ «fast-swimming» — هر دو accepted",
        "جملهٔ «Tigers live on the ground» در راهنما با چاپِ دوپارهٔ RTL است («Tiger» + «s live on the ground») — هم‌خانوادهٔ لغزش‌های چاپیِ r297 (١٢٩١) و r299 (٠٤)",
        "ناهماهنگِ یگانهٔ ۱۰/۱۱ — دومین نوبتِ خانواده پس از r295 (دی ۹۸): take care of/look up/care for/look after → look up؛ water/wind/coal/sun → coal",
        "شکلِ صحیحِ فعل ۲۱-۲۴ با راهنمای چاپیِ درون‌پرانتزی (to find/to forget/to get/to make) — کلیدها: was found/forgets/got/been made؛ «got» شرطیِ نوع دوم (به‌پاسِ would travel)",
        "ریدینگِ تازهٔ فرهنگ‌لغت/جملهٔ نمونه (۳۹-۴۲): نخستین متنِ ریدینگِ نو در سه نوبتِ شهریور ۹۹ — کلیدِ ۴۱ «The word “truth” usually goes with tell.» و کلیدِ ۴۲ دو واریانتِ You/I",
        "علامتِ چاپیِ ˝ در بدنهٔ ریدینگِ فرهنگ‌لغت = U+030B (آکسانِ دوتاییِ ترکیبی) — به کلاسِ پاک‌سازیِ نرمال‌ساز افزوده شد (رسیدِ فنی)",
        "آیتم ۲۹ «line 2» دارد در برابر «line 3» چاپِ سراسری (r299) — یگانه تفاوتِ متنیِ بخش‌های مشترک",
        "پرسشِ ۴۱ با «؟؟» دوگانهٔ چاپی وفادار ماند",
        "بانکِ شش‌واژه‌ای با اضافهٔ یگانهٔ forever (r299 چهارتایی با یک اضافه داشت؛ این راند burst/variety نو هستند)",
        "کلیدِ ۳۸ سه واریانت (washing the dishes/ cleaning the kitchen/ cleaning the room) — عینِ r299",
        "بخش‌های انتخابی ۱۶/۱۷/۱۸ عینِ r299: تعریف‌ها+ضرب‌المثل‌ها هر دو استخراج، مرتب‌کردنِ هر چهار جمله، غیبتِ ۶۳-۶۷",
        "متنِ سه ریدینگ (Early humans/Respect/Dictionary) درون‌اپ حمل نشد (الگوی r289-r299) — ساقه‌ها خودبسنده‌اند",
        "جمعِ نمره ۴۸ — چاپِ سالم (برخلاف «٠٤» برعکس‌شدهٔ r299)",
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
