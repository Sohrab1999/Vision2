#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r299 — آزمون رسمیِ سراسریِ شهریور ۱۳۹۹، کلیهٔ رشته‌ها (مرکز سنجش aee.medu.ir — بدنه ص۲۸۵-۲۹۰، راهنمای تصحیح ص۲۹۱-۲۹۲)
هشتمین نوبتِ «آزمون‌های نهایی دی ۹۷ تا شهریور ۱۴۰۱» — واریانتِ دومِ همان شهریور ۹۹ (r298 = چاپِ جزوه با Answer key درون‌چاپی؛ این راند = چاپِ رسمیِ سراسری).
کشفِ بزرگِ راند: چاپِ رسمیِ سراسریِ همان تاریخ، محتوایی متمایز از چاپِ جزوه دارد — تمامِ ساقه‌های گرامر/واژگان/ریدینگ متفاوت‌اند (فقط الگوی بخش‌ها مشترک است)؛
۶۷ آیتمِ شماره‌دار (جزوه ۵۲ داشت) — دو راندِ موازیِ یک تاریخ، دو آزمونِ متفاوت.
نوهای راند:
(۱) نخستین نوبتِ خانواده از منبعِ رسمی (سربرگِ مرکز سنجش، aee.medu.ir، تاریخ ۱۳/۰۶/۹۹، «تمامی رشته‌ها»، ۶ صفحه، OCR تمیز).
(۲) ۶۱ از ۶۷ — غیبتِ صادقانهٔ ۵۰ و ۶۳-۶۷ (topic sentence/پاراگراف؛ راهنما فقط بارمِ اصولی می‌دهد بدونِ نمونهٔ چاپی — الگوی r296/r297).
(۳) کلیدِ ۳۲ فهرستِ مجازِ چاپی (would, could, might) بدونِ جملهٔ نمونه — سه تایپیِ accepted با placeholder (نخستین کلیدِ تک‌اسلاتِ چندمدالی).
(۴) کلیدِ ۳۸ سه واریانتِ نمونهٔ چاپی دارد (washing the dishes / cleaning the kitchen / cleaning the room) — هر سه accepted.
(۵) مکالمهٔ Nick با شماره‌گذاریِ درون‌متنِ چاپی …9……. — وفادار (r298 الگوی (۵) پرانتزی داشت).
(۶) واژگان تصویری با جملهٔ اضافیِ e (چاپِ جزوهٔ r298 چهارجمله‌ایِ بی‌اضافه بود؛ حروفِ کلید هم متفاوت: b/d/a/c در برابر c/b/d/a).
(۷) هر دو شاخهٔ اختیاریِ بخش ۱۶ استخراج شد (تعریف‌ها ۵۱-۵۴ + ضرب‌المثل‌ها ۵۵-۵۸) — سومین استخراجِ موازیِ شاخه‌ها (الگوی r296/r297).
(۸) رسیدِ لغزشِ چاپ: «جمع نمره ٠٤» — رقمِ چاپیِ برعکس‌شدهٔ RTL برای ۴۸ (هم‌خانوادهٔ لغزشِ ١٢٩١ در r297).
۱۸ بانک / ۶۱ آیتم — خانوادهٔ موضوعی هفدهم: ۱۰۴۲ + ۶۱ = ۱۱۰۳ تست در ۱۷۱ بانک.
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

# ---------------------------------------------------------------- S1 شنیداری فایل ۱: تست (ص۲۸۵) — کلید a/c/c
s1 = [
    q_mcq("g12-fin99sho-l1m1", 1,
          "Amin is really tired because --------------- .",
          ["he is working on a new project", "he is sick and feels weak",
           "he doesn`t sleep well at nights", "he is working on a difficult problem"], 0),
    q_mcq("g12-fin99sho-l1m2", 2,
          "Amin thinks we need to consider --------------- more.",
          ["work, sport and responsibility", "money, sport and work",
           "work, money and responsibility", "responsibility, money and sport"], 2),
    q_mcq("g12-fin99sho-l1m3", 3,
          "What does Behzad think about health?",
          ["Health is not really important", "We should not care about our health",
           "Health is on top of everything", "Health is not as important as money"], 2),
]
# ---------------------------------------------------------------- S2 شنیداری فایل ۲: پرسش + درست/نادرست (ص۲۸۵) — کلید: jacket on the bus / False / True
s2 = [
    q_typed("g12-fin99sho-l2q1", 1,
            "Where did Alex leave his jacket?",
            ["He left his jacket on the bus."], "answer with a full sentence…"),
    q_tf("g12-fin99sho-l2tf1", 2, "His jacket wasn’t new and expensive.", 1),   # False (b)
    q_tf("g12-fin99sho-l2tf2", 3, "Her mother said to him to call the bus station.", 0),  # True (a)
]
# ---------------------------------------------------------------- S3 شنیداری فایل ۳: پرسش پاسخ (ص۲۸۵) — کلید: 6:30 / birthday card
s3 = [
    q_typed("g12-fin99sho-l3q1", 1,
            "What time is the birthday party?",
            ["It is at 6:30."], "answer with a full sentence…"),
    q_typed("g12-fin99sho-l3q2", 2,
            "What may she bring as a birthday gift?",
            ["She may bring a birthday card."], "answer with a full sentence…"),
]
# ---------------------------------------------------------------- S4 شنیداری فایل ۴: مکالمهٔ Nick (ص۲۸۵) — شماره‌گذاریِ درون‌متنِ چاپی …9…….
s4 = [
    q_typed("g12-fin99sho-lg1", 1,
            "But my favorite sport is…9…--------------- .",
            ["volleyball"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99sho-lg2", 2,
            "Are you on a ……10…--------------- .?",
            ["team"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99sho-lg3", 3,
            "It is a lot of …11…--------------- .",
            ["fun"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99sho-lg4", 4,
            "How often do you …12…--------------- ?",
            ["play"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99sho-lg5", 5,
            "Oh, about …13…--------------- a week. So, how about you? Do you play sports?",
            ["twice"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99sho-lg6", 6,
            "Well it depends. Do you think playing video …14…--------------- is a sport?",
            ["games"], "fill in the blank with the missing word…"),
]
# ---------------------------------------------------------------- S5 واژگان با تصویر (ص۲۸۶) — پنج جملهٔ چاپیِ a-e با اضافهٔ e؛ کلید b/d/a/c
PIC_INSTR = "با توجه به تصاویر داده‌شده، جملهٔ مناسب برای هر تصویر را انتخاب کنید. (یک جمله اضافی است)"
PIC_OPTS = [
    "The mother is hugging her little child.",
    "My sister often sits in the balcony and studies her lessons.",
    "The student circled the dictionary entry for the new word.",
    "Solar panels change solar power into electricity.",
    "The sofa converts into bed.",
]
s5 = [
    q_mcq("g12-fin99sho-pic1", 1, PIC_INSTR, PIC_OPTS, 1),  # ۱۵ → (b) balcony
    q_mcq("g12-fin99sho-pic2", 2, PIC_INSTR, PIC_OPTS, 3),  # ۱۶ → (d) solar panels
    q_mcq("g12-fin99sho-pic3", 3, PIC_INSTR, PIC_OPTS, 0),  # ۱۷ → (a) hugging
    q_mcq("g12-fin99sho-pic4", 4, PIC_INSTR, PIC_OPTS, 2),  # ۱۸ → (c) dictionary entry
]
# ---------------------------------------------------------------- S6 واژگان: جای خالی از بانک (ص۲۸۶) — بانک چاپی repeatedly/forever/demand/arrange (اضافه: forever)
VB_POOL = ["repeatedly", "forever", "demand", "arrange"]
s6 = [
    q_typed("g12-fin99sho-vb1", 1,
            "We’ll need to --------------- the chairs around the table.",
            ["arrange"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99sho-vb2", 2,
            "The --------------- for organic food is increasing these days.",
            ["demand"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99sho-vb3", 3,
            "I have told Mohsen --------------- to talk politely to his teacher.",
            ["repeatedly"], "fill in the blank with the missing word…"),
]
for q in s6:
    q["options"] = list(VB_POOL)  # داربست = بانکِ کاملِ چاپی (الگوی r296/r297/r298)
# ---------------------------------------------------------------- S7 واژگان: کامل‌کردن از دانش خود (ص۲۸۶) — حرفِ نخستِ چاپی h-/s-/p-
s7 = [
    q_typed("g12-fin99sho-ok1", 1,
            "They have to speak louder, because their grandmother is hard of h --------------- .",
            ["hearing"], "start with the printed first letter h…"),
    q_typed("g12-fin99sho-ok2", 2,
            "There are some free dictionaries for PCs and apps for s --------------- phones.",
            ["smart"], "start with the printed first letter s…"),
    q_typed("g12-fin99sho-ok3", 3,
            "We should not build factories near rivers because they p --------------- the rivers.",
            ["pollute"], "start with the printed first letter p…"),
]
# ---------------------------------------------------------------- S8 گرامر: تست چهارگزینه‌ای (ص۲۸۶) — کلید b/c/b/d/c/a
s8 = [
    q_mcq("g12-fin99sho-g1", 1,
          "They will buy a new house, ---------------?",
          ["won`t he", "won`t they", "will they", "will he"], 1),
    q_mcq("g12-fin99sho-g2", 2,
          "My mother found the keys --------------- I lost last week.",
          ["when", "whom", "which", "who"], 2),
    q_mcq("g12-fin99sho-g3", 3,
          "Hafez --------------- to be as one of the most famous Persian poet of all time.",
          ["knows", "is known", "knowing", "has known"], 1),
    q_mcq("g12-fin99sho-g4", 4,
          "A: What is the problem? B: The windows --------------- by the boys.",
          ["are breaking", "have broken", "broke", "have been broken"], 3),
    q_mcq("g12-fin99sho-g5", 5,
          "If the old man had his glasses, he --------------- the paper easily.",
          ["can read", "was reading", "could read", "read"], 2),
    q_mcq("g12-fin99sho-g6", 6,
          "My job has become --------------- difficult because of my illness.",
          ["increasingly", "increase", "increasing", "increases"], 0),
]
# ---------------------------------------------------------------- S9+S10 ضمیر موصولی و شرطی، بنویسید (ص۲۸۷) — کلید: which / would|could|might
s9 = [
    q_typed("g12-fin99sho-rel1", 1,
            "A cheetah is an animal --------------- .",
            ["which"], "با which + یک جملهٔ دارای فعل کامل کنید…"),
    q_typed("g12-fin99sho-cond1", 2,
            "If I had wings, I --------------- .",
            ["would", "could", "might"], "با would/could/might + جمله ادامه دهید…"),
]
# ---------------------------------------------------------------- S11 ریدینگ احترام (ص۲۸۷): درست/نادرست + تست — کلید True/False/d/a
s11 = [
    q_tf("g12-fin99sho-r1tf1", 1, "We respect those who are important to us for some reasons.", 0),   # True
    q_tf("g12-fin99sho-r1tf2", 2, "If you are impolite or act badly toward people, they feel important.", 1),  # False
    q_mcq("g12-fin99sho-r1m1", 3,
          "We show our --------------- by being polite to those we care for.",
          ["need", "strength", "happiness", "respect"], 3),
    q_mcq("g12-fin99sho-r1m2", 4,
          "Telling your parents that you thank them --------------- the level of your respect for them.",
          ["reflects", "invents", "imagines", "shouts"], 0),
]
s11q = [
    q_typed("g12-fin99sho-r1q1", 1,
            "What is the easiest way to show your love and respect to your parents?",
            ["The easiest way to show your love and respect is to tell them that you appreciate who they are and what they do."],
            "answer with a full sentence…"),
    q_typed("g12-fin99sho-r1q2", 2,
            "Can doing good small things show your respect to your parents? (Give an example)",
            ["Yes, it can, for example, washing the dishes.",
             "Yes, it can, for example, cleaning the kitchen.",
             "Yes, it can, for example, cleaning the room."],
            "answer with a full sentence…"),
]
# ---------------------------------------------------------------- S12 ریدینگ انسان‌های اولیه (ص۲۸۷-۲۸۸): درست/نادرست + تست — کلید True/True/b/d
s12 = [
    q_tf("g12-fin99sho-r2tf1", 1, "Early humans killed the animals and ate them as their food.", 0),  # True
    q_tf("g12-fin99sho-r2tf2", 2, "Early humans discovered how to make fire.", 0),                    # True
    q_mcq("g12-fin99sho-r2m1", 3,
          "What does “they” in line 3 refer to?",
          ["environments", "humans", "fires", "animals"], 1),
    q_mcq("g12-fin99sho-r2m2", 4,
          "What is this passage mostly about? It is about --------------- .",
          ["how animals were hunted", "the plants early humans ate",
           "how to make fire", "the life of early humans"], 3),
]
s12c = [
    q_typed("g12-fin99sho-r2c1", 1,
            "Fire provided the --------------- for cooking plants which were not eaten before.",
            ["means"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99sho-r2c2", 2,
            "Finally, early humans began to follow other goals such as --------------- the cities.",
            ["founding"], "fill in the blank with the missing word…"),
]
# ---------------------------------------------------------------- S13 کلمات ربط (ص۲۸۸) — کلید and/or/but/so (بانک چاپی but, and, so, or)
CONN_POOL = ["but", "and", "so", "or"]
s13 = [
    q_typed("g12-fin99sho-conn1", 1,
            "I get up early in the morning, --------------- I make an omelet myself.",
            ["and"], "fill in the blank with a connective…"),
    q_typed("g12-fin99sho-conn2", 2,
            "We can eat our lunch at the restaurant, --------------- we can have it at home.",
            ["or"], "fill in the blank with a connective…"),
    q_typed("g12-fin99sho-conn3", 3,
            "They wanted to call you, --------------- they did not have your phone number.",
            ["but"], "fill in the blank with a connective…"),
    q_typed("g12-fin99sho-conn4", 4,
            "That dictionary is expensive, --------------- I can’t buy it.",
            ["so"], "fill in the blank with a connective…"),
]
for q in s13:
    q["options"] = list(CONN_POOL)  # داربست = بانکِ کاملِ چاپی
# ---------------------------------------------------------------- S14 جملهٔ مرکب با کلمهٔ ربط (ص۲۸۸) — کلید …so he passed it.
s14 = [
    q_typed("g12-fin99sho-cc1", 1,
            "Saeed studied hard for the exam, --------------- .",
            ["so he passed it."], "با یکی از کلمات ربط جملهٔ مرکب معنادار بسازید…"),
]
# ---------------------------------------------------------------- S16الف واژگان: تعریف‌های ستون B (ص۲۸۹) — پنج تعریفِ a-e (اضافه: b. cry suddenly)؛ کلید c/a/d/e
DEFB_OPTS = [
    "to take something in, especially gradually",
    "cry suddenly",
    "a book in which you record your thoughts or feelings or what has happened every day",
    "to suddenly decide to do something",
    "to finish something",
]
s16a = [
    q_mcq("g12-fin99sho-defb1", 1, "I have kept a diary for twelve years.", DEFB_OPTS, 2),      # c
    q_mcq("g12-fin99sho-defb2", 2, "Plants absorb carbon dioxide.", DEFB_OPTS, 0),              # a
    q_mcq("g12-fin99sho-defb3", 3, "I did not read the introduction and jumped into the next part.", DEFB_OPTS, 3),  # d
    q_mcq("g12-fin99sho-defb4", 4, "Don’t use up all the milk - we need some for breakfast.", DEFB_OPTS, 4),  # e
]
# ---------------------------------------------------------------- S16ب ضرب‌المثل‌ها: ستون B (ص۲۸۹) — پنج تعریفِ f-j (اضافه: i)؛ کلید j/h/f/g
PRVB_OPTS = [
    "When you get money quickly, like by winning it, it’s easy to spend it or lose it quickly as well.",
    "When two people cooperate with each other, they come up with better ideas.",
    "You have to practice a skill a lot to become good at it.",
    "People like to spend time with those who are similar to them.",
    "You soon forget people or things that are no longer visible or present.",
]
s16b = [
    q_mcq("g12-fin99sho-prvb1", 1, "Out of sight, out of mind", PRVB_OPTS, 4),   # j
    q_mcq("g12-fin99sho-prvb2", 2, "Practice makes perfect", PRVB_OPTS, 2),      # h
    q_mcq("g12-fin99sho-prvb3", 3, "Easy come, easy go", PRVB_OPTS, 0),          # f
    q_mcq("g12-fin99sho-prvb4", 4, "Two heads are better than one", PRVB_OPTS, 1),  # g
]
# ---------------------------------------------------------------- S17 مرتب‌کردن کلمات (ص۲۸۹) — راهنما: به دلخواه فقط دو سوال؛ درون‌اپ هر چهار بانک بازی می‌شود (رسید)
s17 = [
    q_typed("g12-fin99sho-ws1", 1,
            "work / some workers / who / and teachers / in the village / there are / .",
            ["There are some workers and teachers who work in the village."],
            "جملهٔ مرتب‌شده را کامل بنویسید…"),
    q_typed("g12-fin99sho-ws2", 2,
            "wrote / didn’t / a letter / the girl / she / , / ?",
            ["The girl wrote a letter, didn`t she?"],
            "جملهٔ مرتب‌شده را کامل بنویسید…"),
    q_typed("g12-fin99sho-ws3", 3,
            "because / hadn’t rained / everything in the garden / it / was brown / .",
            ["Everything in the garden was brown because it hadn`t rained."],
            "جملهٔ مرتب‌شده را کامل بنویسید…"),
    q_typed("g12-fin99sho-ws4", 4,
            "be / by the teacher / the parents / called / should / .",
            ["The parents should be called by the teacher."],
            "جملهٔ مرتب‌شده را کامل بنویسید…"),
]

BANKS = [
    (154, "نهایی سراسری شهریور ۹۹ — شنیداری فایل ۱: تست (ص۲۸۵)", "استاندارد", s1),
    (155, "نهایی سراسری شهریور ۹۹ — شنیداری فایل ۲: پرسش + درست/نادرست (ص۲۸۵)", "آموزشی — ورود آزاد", s2),
    (156, "نهایی سراسری شهریور ۹۹ — شنیداری فایل ۳: پرسش پاسخ (ص۲۸۵)", "آموزشی — ورود آزاد", s3),
    (157, "نهایی سراسری شهریور ۹۹ — شنیداری فایل ۴: مکالمهٔ Nick، کامل کنید (ص۲۸۵)", "آموزشی — ورود آزاد", s4),
    (158, "نهایی سراسری شهریور ۹۹ — واژگان با تصویر: جملهٔ مناسب هر تصویر (ص۲۸۶)", "استاندارد", s5),
    (159, "نهایی سراسری شهریور ۹۹ — واژگان: جای خالی از بانک (ص۲۸۶)", "آموزشی — ورود آزاد", s6),
    (160, "نهایی سراسری شهریور ۹۹ — واژگان: کامل‌کردن از دانش خود (ص۲۸۶)", "آموزشی — ورود آزاد", s7),
    (161, "نهایی سراسری شهریور ۹۹ — گرامر: تست چهارگزینه‌ای (ص۲۸۶)", "استاندارد", s8),
    (162, "نهایی سراسری شهریور ۹۹ — ضمیر موصولی و شرطی، بنویسید (ص۲۸۷)", "آموزشی — ورود آزاد", s9),
    (163, "نهایی سراسری شهریور ۹۹ — ریدینگ احترام: درست/نادرست + تست (ص۲۸۷)", "استاندارد", s11),
    (164, "نهایی سراسری شهریور ۹۹ — ریدینگ احترام: پرسش پاسخ (ص۲۸۷)", "آموزشی — ورود آزاد", s11q),
    (165, "نهایی سراسری شهریور ۹۹ — ریدینگ انسان‌های اولیه: درست/نادرست + تست (ص۲۸۷-۲۸۸)", "استاندارد", s12),
    (166, "نهایی سراسری شهریور ۹۹ — ریدینگ انسان‌های اولیه: کامل کنید (ص۲۸۸)", "آموزشی — ورود آزاد", s12c),
    (167, "نهایی سراسری شهریور ۹۹ — کلمات ربط، کامل کنید (ص۲۸۸)", "آموزشی — ورود آزاد", s13),
    (168, "نهایی سراسری شهریور ۹۹ — جملهٔ مرکب با کلمهٔ ربط، بنویسید (ص۲۸۸)", "آموزشی — ورود آزاد", s14),
    (169, "نهایی سراسری شهریور ۹۹ — واژگان: تعریف‌های ستون B، بخش الف (ص۲۸۹)", "استاندارد", s16a),
    (170, "نهایی سراسری شهریور ۹۹ — ضرب‌المثل‌ها: ستون B، بخش ب (ص۲۸۹)", "استاندارد", s16b),
    (171, "نهایی سراسری شهریور ۹۹ — مرتب‌کردن کلمات، بنویسید (ص۲۸۹)", "آموزشی — ورود آزاد", s17),
]

# ================================================================ راستی‌آزماییِ OCR (وفاداریِ بدنه)
for lid, _title, _level, qs in BANKS:
    for q in qs:
        if q["question"].startswith("با توجه به"):
            pass  # دستورالعملِ فارسیِ درون‌اپ — الگوی r296/r297؛ گزینه‌ها جداگانه راستی‌آزمایی می‌شوند
        else:
            require(ocr_has_stem(q["question"]), f"stem not in OCR: {q['id']} :: {q['question'][:70]}")
        if q.get("kind") == "mcq" and q["options"] not in (["True", "False"],):
            for opt in q["options"]:
                require(ocr_has(opt), f"option not in OCR: {q['id']} :: {opt[:60]}")

# ================================================================ کلیدهای راهنمای تصحیح (ص۲۹۱-۲۹۲) — راستی‌آزماییِ قطعه‌کلیدها
GUIDE_FRAGMENTS = [
    "1. ( a )", "2. ( c )", "3. ( c )",
    "4. He left his jacket on the bus.", "5. False ( b)", "6. True (a)",
    "7. It is at 6:30.", "8. She may bring a birthday card.",
    "9. volleyball", "10. team", "11. fun", "12. play", "13. twice", "14. games",
    "15. ( b  )", "16.(  d  )", "17. ( a  )", "18. ( c )",
    "19. arrange", "20. demand", "21. repeatedly",
    "22. hearing", "23. smart", "24. pollute",
    "25. ( b)", "26. ( c )", "27. ( b )", "28. ( d )", "29. ( c )", "30. ( a )",
    "33. (a) True", "34. (b) False", "35. ( d )", "36. ( a )",
    "38.Yes, it can, for example, washing the dishes/ cleaning the kitchen/ cleaning the room",
    "39. (a) True", "40. (a) True", "41. ( b )", "42. ( d )",
    "43. means", "44. founding",
    "45. and", "46. or", "47. but", "48. so",
    "49. …so he passed it.",
    "59. There are some workers and teachers who work in the village.",
    "60. The girl wrote a letter, didn`t she?",
    "61. Everything in the garden was brown because it hadn`t rained.",
    "62. The parents should be called by the teacher.",
]
for frag in GUIDE_FRAGMENTS:
    require(ocr_has(frag), f"guide fragment not in OCR: {frag[:60]}")
require(ocr_has("باید  which را به همراه یک جمله یا عبارت"), "guide 31 prints the relative pronoun «which» as the key (with the verb-clause note)")
require(ocr_has("(would  ,could ,might)"), "guide 32 prints the accepted modal list would/could/might")
require(ocr_has("51- c 55- j 52- a 56- h 53- d 57- f 54- e 58- g"), "guide 16 prints keys 51-c/52-a/53-d/54-e and 55-j/56-h/57-f/58-g")
require(ocr_has("66. d) Clean energy"), "guide body 18 prints picture titles a-d (Ferdowsi/Watching TV/Sport/Clean energy)")
require(ocr_has("Having a healthy lifestyle"), "guide body 18ب prints the open paragraph title")
# رسیدِ لغزشِ چاپ: «جمع نمره ٠٤» — رقمِ چاپیِ برعکس‌شدهٔ RTL برای ۴۸
require("جمع نمره ٠٤" in OCR, "guard: total score printed as RTL-reversed ٠٤ (=۴۸)")

# ================================================================ داوریِ دومِ مستقل (معناییِ کلیدها — مستقل از گذرِ نخست)
SECOND = [
    # (id, حرفِ کلیدِ راهنما, نشانهٔ معناییِ مستقل در OCR)
    ("g12-fin99sho-l1m1", "a", ocr_has("he is working on a new project")),
    ("g12-fin99sho-l1m2", "c", ocr_has("work, money and responsibility")),
    ("g12-fin99sho-l1m3", "c", ocr_has("Health is on top of everything")),
    ("g12-fin99sho-l2tf1", "b", True),   # False
    ("g12-fin99sho-l2tf2", "a", True),   # True
    ("g12-fin99sho-pic1", "b", ocr_has("My sister often sits in the balcony")),
    ("g12-fin99sho-pic2", "d", ocr_has("Solar panels change solar power into electricity")),
    ("g12-fin99sho-pic3", "a", ocr_has("The mother is hugging her little child")),
    ("g12-fin99sho-pic4", "c", ocr_has("The student circled the dictionary entry")),
    ("g12-fin99sho-g1", "b", ocr_has("b) won`t they")),
    ("g12-fin99sho-g2", "c", ocr_has("c) which")),
    ("g12-fin99sho-g3", "b", ocr_has("b) is known")),
    ("g12-fin99sho-g4", "d", ocr_has("d) have been broken")),
    ("g12-fin99sho-g5", "c", ocr_has("c) could read")),
    ("g12-fin99sho-g6", "a", ocr_has("a) increasingly")),
    ("g12-fin99sho-r1tf1", "a", True),   # True
    ("g12-fin99sho-r1tf2", "b", True),   # False
    ("g12-fin99sho-r1m1", "d", ocr_has("d) respect")),
    ("g12-fin99sho-r1m2", "a", ocr_has("a) reflects")),
    ("g12-fin99sho-r2tf1", "a", True),   # True
    ("g12-fin99sho-r2tf2", "a", True),   # True
    ("g12-fin99sho-r2m1", "b", ocr_has("b) humans")),
    ("g12-fin99sho-r2m2", "d", ocr_has("d) the life of early humans")),
    ("g12-fin99sho-defb1", "c", ocr_has("c. a book in which you record your thoughts")),
    ("g12-fin99sho-defb2", "a", ocr_has("a. to take something in, especially gradually")),
    ("g12-fin99sho-defb3", "d", ocr_has("d. to suddenly decide to do something")),
    ("g12-fin99sho-defb4", "e", ocr_has("e. to finish something")),
    ("g12-fin99sho-prvb1", "j", ocr_has("j. You soon forget people or things that are no longer visible or present")),
    ("g12-fin99sho-prvb2", "h", ocr_has("h. You have to practice a skill a lot to become good at it")),
    ("g12-fin99sho-prvb3", "f", ocr_has("f. When you get money quickly")),
    ("g12-fin99sho-prvb4", "g", ocr_has("g. When two people cooperate with each other")),
]
ALL_QS = [q for _lid, _t, _lv, qs in BANKS for q in qs]
for qid, letter, sem_ok in SECOND:
    require(sem_ok, f"second judgement failed: {qid} [{letter}]")
    q = next(x for x in ALL_QS if x["id"] == qid)
    pool = "ab" if q["options"] == ["True", "False"] else ("fghij" if qid.startswith("g12-fin99sho-prvb") else "abcde")
    require(q["answer"] == pool.index(letter), f"{qid}: answer {q['answer']} != guide letter {letter}")

# کلیدهای تایپی — هر accepted باید در OCR یا راهنما ریشهٔ چاپی داشته باشد
TYPED_KEYS = {
    "g12-fin99sho-l2q1": ["He left his jacket on the bus."],
    "g12-fin99sho-l3q1": ["It is at 6:30."],
    "g12-fin99sho-l3q2": ["She may bring a birthday card."],
    "g12-fin99sho-lg1": ["volleyball"], "g12-fin99sho-lg2": ["team"], "g12-fin99sho-lg3": ["fun"],
    "g12-fin99sho-lg4": ["play"], "g12-fin99sho-lg5": ["twice"], "g12-fin99sho-lg6": ["games"],
    "g12-fin99sho-vb1": ["arrange"], "g12-fin99sho-vb2": ["demand"], "g12-fin99sho-vb3": ["repeatedly"],
    "g12-fin99sho-ok1": ["hearing"], "g12-fin99sho-ok2": ["smart"], "g12-fin99sho-ok3": ["pollute"],
    "g12-fin99sho-rel1": ["which"],
    "g12-fin99sho-cond1": ["would", "could", "might"],
    "g12-fin99sho-r1q1": ["The easiest way to show your love and respect is to tell them that you appreciate who they are and what they do."],
    "g12-fin99sho-r1q2": ["washing the dishes", "cleaning the kitchen", "cleaning the room"],
    "g12-fin99sho-r2c1": ["means"], "g12-fin99sho-r2c2": ["founding"],
    "g12-fin99sho-conn1": ["and"], "g12-fin99sho-conn2": ["or"], "g12-fin99sho-conn3": ["but"], "g12-fin99sho-conn4": ["so"],
    "g12-fin99sho-cc1": ["so he passed it."],
    "g12-fin99sho-ws1": ["There are some workers and teachers who work in the village."],
    "g12-fin99sho-ws2": ["The girl wrote a letter, didn`t she?"],
    "g12-fin99sho-ws3": ["Everything in the garden was brown because it hadn`t rained."],
    "g12-fin99sho-ws4": ["The parents should be called by the teacher."],
}
for qid, keys in TYPED_KEYS.items():
    q = next(x for x in ALL_QS if x["id"] == qid)
    require(q["kind"] == "typed", f"{qid} must be typed")
    for k in keys:
        require(any(k in a for a in q["accepted"]), f"{qid}: accepted lacks printed key variant {k[:40]}")

# ================================================================ تزریق (idempotent — خروجیِ ناقصِ رانِ قبلی پاک می‌شود)
data = json.loads(BANK_PATH.read_text(encoding="utf-8"))
data["lessons"] = [l for l in data["lessons"] if l["lesson"] < 154]
data["source"].pop("final99sho", None)
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

require(data["lessons"][-1]["lesson"] == 153, f"family tail is {data['lessons'][-1]['lesson']}, expected 153")
require([l["lesson"] for l in new_lessons] == list(range(154, 172)), "lesson numbers must be 154..171")
require(total_new == 61, f"total new items {total_new} != 61")

data["lessons"].extend(new_lessons)

data["source"]["final99sho"] = {
    "pages": "285-290",
    "keyPages": "291-292",
    "titlePrinted": "آزمون نهایی انگلیسی دوازدهم — نوبت شهریور ماه سال ۱۳۹۹، مرکز سنجش و پایش کیفیت آموزشی (aee.medu.ir)، تمامی رشته‌ها، تاریخ ۱۳/۰۶/۹۹، ۶ صفحه، جمع نمره ۴۸ — واریانتِ دومِ همان شهریور ۹۹ (r298 = چاپِ جزوه با Answer key درون‌چاپی)",
    "sections": 18,
    "banks": 18,
    "questions": 61,
    "keys": 61,
    "extractedRound": 299,
    "branchVariant": "دومین واریانتِ یک نوبتِ واحد از منبعِ رسمی (الگوی r297) — کشفِ راند: چاپِ رسمیِ سراسریِ همان تاریخ محتوایی متمایز از چاپِ جزوه دارد؛ ۶۷ آیتمِ شماره‌دار در برابر ۵۲ آیتمِ جزوه و تمامِ ساقه‌های گرامر/واژگان/ریدینگ متفاوت‌اند (فقط الگوی بخش‌ها مشترک) — دو راندِ موازیِ یک تاریخ، دو آزمونِ متفاوت.",
    "audioAbsent": {"files": "۴ فایل صوتی چاپی (شمارهٔ ۱/۲/۳/۴)", "reason": "فایل صوتی در جزوه نیست — الگوی r292-r298؛ اما همهٔ ساقه‌های شنیداری چاپیِ کامل دارند و کلیدِ ۴/۷/۸ هم چاپی است (سه بانکِ شنیداریِ پرسش‌پاسخِ کامل — نخستین بار در خانواده)"},
    "openWritingAbsent": {"items": "۵۰ (topic sentence برای Smoking) و بخش ۱۸: ۶۳-۶۶ (topic sentence برای Ferdowsi/Watching TV/Sport/Clean energy) و ۶۷ (پاراگرافِ بازِ Having a healthy lifestyle با داده‌های چاپی Eat fewer snacks/Eat more fruit and vegies/Be more active)", "reason": "راهنما فقط بارمِ اصولی می‌دهد (جملهٔ صحیح ۱ نمره/رعایت Topic Sentence) بدونِ نمونهٔ چاپی — الگوی r296/r297 (۵۵/۵۶)"},
    "receipts": [
        "نخستین نوبتِ خانواده از منبعِ رسمی: سربرگِ «مرکز سنجش و پایش کیفیت آموزشی http://aee.medu.ir» با تاریخ ۱۳/۰۶/۹۹ و «تمامی رشته‌ها» — در برابر چاپِ استانیِ جزوه (r298)",
        "کلیدِ ۳۲ فهرستِ مجازِ چاپی (would, could, might) بدونِ جملهٔ نمونه — سه تایپیِ accepted با placeholder؛ نخستین کلیدِ تک‌اسلاتِ چندمدالیِ خانواده",
        "کلیدِ ۳۸ سه واریانتِ نمونهٔ چاپی دارد — هر سه accepted (الگوی چندواریانتهٔ r297-۴۵/کلید ۴)",
        "کلیدِ ۳۱ «which» چاپی + توضیحِ راهنما (جمله/عبارتِ دارای فعل لازم است) — تایپیِ تک‌کلیدی با placeholder",
        "مکالمهٔ Nick (۹-۱۴) با شماره‌گذاریِ درون‌متنِ چاپی …9……. — وفادار؛ در برابر الگوی پرانتزیِ (5) در r298",
        "واژگان تصویری پنج‌جمله‌ای با اضافهٔ e (The sofa converts into bed) — چاپِ جزوهٔ r298 چهارجمله‌ایِ بی‌اضافه بود؛ حروفِ کلید هم متفاوت است: b/d/a/c در برابر c/b/d/a",
        "هر دو شاخهٔ اختیاریِ بخش ۱۶ استخراج شد (تعریف‌ها ۵۱-۵۴ + ضرب‌المثل‌ها ۵۵-۵۸) — سومین استخراجِ موازیِ شاخه‌ها (الگوی r296/r297)",
        "بخش ۱۷ راهنما: «به دلخواه فقط به دو سوال پاسخ دهید» — درون‌اپ هر چهار بانک بازی می‌شود (رسید؛ کلیدهای چاپیِ هر چهار جمله موجود است)",
        "اضافه‌های چاپی: بانک واژگان (forever) / تعریف‌ها (b. cry suddenly) / ضرب‌المثل‌ها (i. People like to spend time…) — بانکِ کامل در options (الگوی r296-r298)",
        "رسیدِ لغزشِ چاپ: «جمع نمره ٠٤» — رقمِ چاپیِ برعکس‌شدهٔ RTL برای ۴۸ (هم‌خانوادهٔ لغزشِ ١٢٩١ در r297)",
        "کلیدِ ۴۹ «…so he passed it.» — جملهٔ مرکبِ کاملِ چاپی accepted؛ درون‌اپ ساقه + خالی",
        "بک‌تیک‌های چاپی وفادار: won`t they / doesn`t / didn`t she / hadn`t rained — آپاستروفِ خمیدهٔ چاپی نیز وفادار: wasn’t / We’ll / can’t / Don’t / it’s / didn’t / hadn’t",
        "متنِ دو ریدینگ (Respect/Early humans) درون‌اپ حمل نشد (الگوی r289-r298) — تصویر صفحه در کتابخانهٔ جزوه در دسترس است؛ ساقه‌ها خودبسنده‌اند",
        "Section 15 راهنما یک ردیفِ پیوسته برای ۳۳-۳۶ است (درست/نادرست + تست) — درون‌اپ به دو بانکِ r1tf/r1m شکسته شد (الگوی r296-r298 ریدینگ‌ها)",
        "چاپِ «ﺳﻨﺠﺶ و ﭘﺎﯾﺶ» در سربرگ (خطای چاپیِ پایش) — وفادارِ OCR، بی‌اثر بر آیتم‌ها",
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
