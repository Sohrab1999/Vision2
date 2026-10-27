#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r305 — آزمون نهایی، رسمیِ سراسریِ کلیهٔ رشته‌ها — نوبت دی ۱۴۰۰ (مرکز سنجش aee.medu.ir — بدنه ص۳۲۹-۳۳۳، راهنمای تصحیح ص۳۳۴-۳۳۵)
چهاردهمین نوبتِ «آزمون‌های نهایی دی ۹۷ تا شهریور ۱۴۰۱» — عبور از مرزِ دوازده نوبت. سربرگِ تاریخ حاکم (درس r297/r301/r302/r304): ۲۰/۱۰/۱۴۰۰ = دی ۱۴۰۰.
کشف‌های راند:
(۱) ششمین نوبتِ منبعِ رسمی (پس از r299/r301/r302/r303/r304) — سربرگِ «کلیه رشته ها»؛ سربرگِ این نوبت با «ي عربی» چاپ شده (نوبت «دي» ماه) — وفاداریِ یونی‌کدی.
(۲) چهار کلیدِ چندخالیِ دولایه: ۷ «arrived, took»، ۸ «walk , rain» (ویرگولِ فاصله‌دار)، ۱۰ «stay, rest»، ۲۷ «sight , mind» — نخستین بار در خانواده: دو جای‌خالی در یک ساقه با کلیدِ دوتکه‌ای؛ ۲۷ دو شکافِ حرفیِ هم‌زمان دارد (s----/m---).
(۳) کلیدِ جمله‌کاملِ ۴۰ (انرژی خورشیدی، با دو نشانِ (0/5)) و فهرستِ چهارمثالیِ ۴۷ با چهار نشانِ (0/25) — بازسازی شد: televisions, computers, online games, phones.
(۴) کلیدِ نیمه‌جمله‌ایِ ۵۱ «…but he had to read it.» عینِ r302-۵۰ — اما ساقه «is» دارد نه «was» — موازیِ خانواده با متنِ متفاوت.
(۵) ساقهٔ ۵۰ چهارمین وقوع (ریشه: r286-l14؛ r299-۴۶؛ r300) — بازاستفادهٔ بین‌دوره‌ایِ ثبت‌شده با گاردِ برابری؛ گاردِ ساقه‌محورِ راندهای قدیمی به دورهٔ خودشان محدود است (درسِ r295/r299/r304).
(۶) اضافهٔ تصویری در (d) چهارم‌جای — نخستین جایگاهِ چهارم در خانواده؛ اضافهٔ تعریف‌ها (b) دوم‌جای؛ اضافهٔ پول shouted نخست‌جای.
(۷) سربرگِ صوتیِ «Audio file (PDF)» به‌جای «Audio script (PDF)» — نخستین واریانت.
۱۹ بانک / ۵۱ آیتم — خانوادهٔ موضوعی هفدهم: ۱۳۹۰ + ۵۱ = ۱۴۴۱ تست در ۲۸۴ بانک.
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
    s = re.sub(r"[\"'`´‘’“”«»˝\u02DD\u030B]", "", s)  # ˝/آکسانِ ترکیبی — الگوی r300-r304
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
    """ساقه با خالیِ میانی: هر نیمه جداگانه راستی‌آزمایی می‌شود (الگوی r299-r304)"""
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

# ---------------------------------------------------------------- S1 شنیداری فایل ۱: درست/نادرست — متنِ عمال و پدرش (باد/انرژی پاک) (ص۳۲۹) — کلید a/b/a/b
s1 = [
    q_tf("g12-fin1400dey-l1tf1", 1, "Wind is a type of clean energy resource.", 0),   # ۱ → True (a)
    q_tf("g12-fin1400dey-l1tf2", 2, "Wind turbines are used to produce clean water.", 1),  # ۲ → False (b)
    q_tf("g12-fin1400dey-l1tf3", 3, "Instead of electrical air conditioners, natural air cooling system can be used.", 0),  # ۳ → True (a)
    q_tf("g12-fin1400dey-l1tf4", 4, "Electricity is used to make wind.", 1),          # ۴ → False (b)
]
# ---------------------------------------------------------------- S2 شنیداری فایل ۲: مکالمهٔ شیلا و سمیرا (ص۳۲۹) — T/F + نخستین کلیدِ دولایه «arrived, took» — کلید b/a
s2 = [
    q_tf("g12-fin1400dey-l2tf1", 1, "They went to the museum on Friday.", 1),          # ۵ → False (b)
    q_tf("g12-fin1400dey-l2tf2", 2, "Samira and her friends had gone to the museum before they got home.", 0),  # ۶ → True (a)
    q_typed("g12-fin1400dey-l2q1", 3,
            "After Samir’s guests had had dinner, their mothers --------------- and --------------- them home.",
            ["arrived, took"],
            "دو واژهٔ کلیدِ راهنما را به ترتیب و با ویرگول بنویسید…"),                 # ۷ → arrived, took
]
# ---------------------------------------------------------------- S3 شنیداری فایل ۳: مکالمهٔ زهرا و مبینا (ص۳۲۹) — دو کلیدِ دولایه + جمله‌کاملِ شنیداری — کلید walk,rain / gym / stay,rest / Health
s3 = [
    q_typed("g12-fin1400dey-l3q1", 1,
            "Zahra has caught a terrible flu because she had to --------------- home in --------------- .",
            ["walk, rain", "walk , rain"],
            "دو واژهٔ کلیدِ راهنما را به ترتیب و با ویرگول بنویسید…"),                 # ۸ → walk , rain (ویرگولِ فاصله‌دارِ چاپی)
    q_typed("g12-fin1400dey-l3q2", 2,
            "Zahra and Mobina can’t go to the --------------- because Zahra is sick.",
            ["gym"], "fill in the blank with the missing word…"),                      # ۹ → gym
    q_typed("g12-fin1400dey-l3q3", 3,
            "Mobina told Zahra to stay at --------------- and take a --------------- .",
            ["stay, rest"],
            "دو واژهٔ کلیدِ راهنما را به ترتیب و با ویرگول بنویسید…"),                 # ۱۰ → stay, rest
    q_typed("g12-fin1400dey-l3q4", 4,
            "What is more important according to Mobina?",
            ["Health is more important."],
            "answer with a full sentence…"),                                           # ۱۱ → جملهٔ کاملِ چاپی
]
# ---------------------------------------------------------------- S4 شنیداری فایل ۴: متنِ فرهنگ‌لغت با شماره‌گذاریِ چاپی بدونِ پرانتز ……12…… (ص۳۲۹) — کلید information/order/definition/imagine/choice
s4 = [
    q_typed("g12-fin1400dey-l4q1", 1,
            "A dictionary is one of the most important tools that helps you get ……12……..--------------- about words and use them correctly.",
            ["information"], "fill in the blank with the missing word…"),              # ۱۲
    q_typed("g12-fin1400dey-l4q2", 2,
            "The words in a dictionary have been arranged in alphabetical …13…….--------------- , so it will be easy to access them.",
            ["order"], "fill in the blank with the missing word…"),                    # ۱۳
    q_typed("g12-fin1400dey-l4q3", 3,
            "Some words have more than one meaning, but how do we decide which …..14……--------------- to use?",
            ["definition"], "fill in the blank with the missing word…"),               # ۱۴
    q_typed("g12-fin1400dey-l4q4", 4,
            "Third, …..15……--------------- a blank space in the sentence where the word appears and finally, replace the correct word into that sentence.",
            ["imagine"], "fill in the blank with the missing word…"),                  # ۱۵
    q_typed("g12-fin1400dey-l4q5", 5,
            "If the sentence is still alright, you have the correct …..16……--------------- .",
            ["choice"], "fill in the blank with the missing word…"),                   # ۱۶
]
# ---------------------------------------------------------------- S5 واژگان با تصویر (ص۳۳۰) — پنج جملهٔ چاپی با اضافهٔ (d) چهارم‌جای (نخستین بار در خانواده) — کلید e/a/c/b
PIC_INSTR = "با توجه به تصاویر داده‌شده، جملهٔ مناسب برای هر تصویر را انتخاب کنید. (یک جمله اضافی است)"
PIC_OPTS = [
    "The new light bulbs consume less electricity.",
    "The main sources of renewable energy are wind, water and sun.",
    "I circled the dictionary entry for the word ‘purpose’.",
    "C is the symbol for carbon.",  # اضافهٔ چاپی — جای چهارم (نخستین در خانواده)
    "My little sister sits on my mother’s lap all the time.",
]
s5 = [
    q_mcq("g12-fin1400dey-pic1", 1, PIC_INSTR, PIC_OPTS, 4),  # ۱۷ → (e) lap
    q_mcq("g12-fin1400dey-pic2", 2, PIC_INSTR, PIC_OPTS, 0),  # ۱۸ → (a) light bulbs
    q_mcq("g12-fin1400dey-pic3", 3, PIC_INSTR, PIC_OPTS, 2),  # ۱۹ → (c) circled entry
    q_mcq("g12-fin1400dey-pic4", 4, PIC_INSTR, PIC_OPTS, 1),  # ۲۰ → (b) renewable sources
]
# ---------------------------------------------------------------- S6 واژگان: بانکِ چهارواژه‌ای (shouted اضافهٔ نخست‌جای) — کلید born/introduction/demand
POOL_OPTS = ["shouted", "born", "demand", "introduction"]
s6 = [
    q_typed("g12-fin1400dey-pool1", 1,
            "Ferdowsi was --------------- in a village near Toos.",
            ["born"], "fill in the blank with the missing word…"),                     # ۲۱
    q_typed("g12-fin1400dey-pool2", 2,
            "This book has only a two-page --------------- .",
            ["introduction"], "fill in the blank with the missing word…"),             # ۲۲ — سومین بازاستفادهٔ این ساقه (r303-pool2/r304-def1)
    q_typed("g12-fin1400dey-pool3", 3,
            "The --------------- for organic food is increasing.",
            ["demand"], "fill in the blank with the missing word…"),                   # ۲۳
]
for q in s6:
    q["options"] = list(POOL_OPTS)  # داربست = بانکِ کاملِ چاپی (الگوی r296-r304)
# ---------------------------------------------------------------- S7 واژگان: تعریف‌های ستون B (ص۳۳۰) — اضافه در (b) دوم‌جای (finish something)؛ کلید c/a/d
DEFB_OPTS = [
    "an arrangement in a particular order",
    "finish something",  # اضافهٔ چاپی — جای دوم
    "many times",
    "all the people of about the same age within a society",
]
s7 = [
    q_mcq("g12-fin1400dey-def1", 1, "I’ve told Mohsen repeatedly to talk politely to his teachers.", DEFB_OPTS, 2),  # ۲۴ → (c) many times
    q_mcq("g12-fin1400dey-def2", 2, "From the letters X and Y, we can get two combinations: XY and YX.", DEFB_OPTS, 0),  # ۲۵ → (a)
    q_mcq("g12-fin1400dey-def3", 3, "Future generations will carry our present values.", DEFB_OPTS, 3),  # ۲۶ → (d)
]
# ---------------------------------------------------------------- S8 واژگان: کامل‌کردن از دانش خود (ص۳۳۰) — دو شکافِ حرفیِ هم‌زمان s----/m--- — ضرب‌المثلِ Out of sight, out of mind — کلید sight , mind
s8 = [
    q_typed("g12-fin1400dey-ok1", 1,
            "Every one believes that you soon forget people or things that are no longer visible or present, “Out of s ---------------, out of m ---------------”.",
            ["sight, mind", "sight , mind"],
            "دو واژهٔ کلید (با حرفِ اولِ چاپی s و m) را با ویرگول بنویسید…"),          # ۲۷
]
# ---------------------------------------------------------------- S9 گرامر: تست چهارگزینه‌ای (ص۳۳۱) — کلید d/a/a/c
s9 = [
    q_mcq("g12-fin1400dey-g1", 1,
          "A: You haven’t done your homework, --------------- ? B: No, I haven’t.",
          ["haven’t you", "haven’t I", "has it", "have you"], 3),                     # ۲۸ → (d)
    q_mcq("g12-fin1400dey-g2", 2,
          "The woman --------------- you met yesterday is coming to dinner.",
          ["whom", "when", "where", "which"], 0),                                     # ۲۹ → (a)
    q_mcq("g12-fin1400dey-g3", 3,
          "People --------------- of the danger of harmful gasses.",
          ["should be informed", "have informed", "are informing", "is informed"], 0),  # ۳۰ → (a)
    q_mcq("g12-fin1400dey-g4", 4,
          "The first fast food restaurants --------------- in our city thirty years ago.",
          ["opens", "were opening", "were opened", "can open"], 2),                   # ۳۱ → (c)
]
# ---------------------------------------------------------------- S10 شکل صحیح فعل (ص۳۳۱) — راهنمای پرانتزیِ چاپی (see)؛ کلید had seen
s10 = [
    q_typed("g12-fin1400dey-vf1", 1,
            "I knew I --------------- that man somewhere before. (see)",
            ["had seen"], "شکل صحیح فعلِ داخل پرانتز را بنویسید…"),                   # ۳۲
]
# ---------------------------------------------------------------- S11 مرتب‌کردن کلمات (ص۳۳۱) — گریدِ ۳۳/۳۴ با قطعاتِ بهم‌ریختهٔ RTL در راهنما («got hom» و «t could res» بریده)
s11 = [
    q_typed("g12-fin1400dey-ws1", 1,
            "got home / had fallen/ The baby/ asleep/ when /I/. /",
            ["The baby had fallen asleep when I got home."],
            "جملهٔ مرتب‌شده را کامل بنویسید…"),                                        # ۳۳
    q_typed("g12-fin1400dey-ws2", 2,
            "John/ he/ if / more time / had / could rest  /./",
            ["John could rest if he had more time."],
            "جملهٔ مرتب‌شده را کامل بنویسید…"),                                        # ۳۴
]
# ---------------------------------------------------------------- S12 ضمیر موصولی (ص۳۳۱) — کلیدِ چاپیِ «which» + توضیحِ راهنما — الگوی چندمدالیِ r301-r304
s12 = [
    q_typed("g12-fin1400dey-rel1", 1,
            "They bought a house…………………………………. .",
            ["which"], "which را به همراه یک جمله یا عبارت دارای فعل، در ادامه بنویسید…"),  # ۳۵
]
# ---------------------------------------------------------------- S13 ریدینگ انرژی پاک (ص۳۳۱-۳۳۲) — کلید True/True/c/d + جمله‌کاملِ ۴۰
s13 = [
    q_tf("g12-fin1400dey-r1tf1", 1, "According to the passage, mechanical, electrical, chemical, and nuclear forms are variety of energy.", 0),  # ۳۶ → True
    q_tf("g12-fin1400dey-r1tf2", 2, "The resources of the earth are used to produce energy.", 0),  # ۳۷ → True
    q_mcq("g12-fin1400dey-r1m1", 3,
          "Fossil fuels are nonrenewable means that they --------------- easily.",
          ["cannot be consumed", "can be replaced", "aren’t replaced", "are polluted"], 2),  # ۳۸ → (c)
    q_mcq("g12-fin1400dey-r1m2", 4,
          "The most common type of clean energy is produced by the --------------- that reaches the earth..",
          ["design", "wind", "plant", "radiation"], 3),                                # ۳۹ → (d) — نقطهٔ دوگانهٔ چاپی
    q_typed("g12-fin1400dey-r1q1", 5,
            "What do Iranians use to get the most sunshine? ………………………………………….. .",
            ["Iranians use special designs and arrangements of windows, balconies and yards to get the most sunshine."],
            "answer with a full sentence…"),                                           # ۴۰ → جملهٔ کاملِ چاپی با دو نشانِ (0/5)
]
# ---------------------------------------------------------------- S14 ریدینگ احترام به معلم (ص۳۳۲) — کلید False/True — متنِ تازهٔ خانواده (خویشاوندِ r303-بزرگ‌ترها)
s14 = [
    q_tf("g12-fin1400dey-r2tf1", 1, "According to the passage, teachers were always teachers.", 1),  # ۴۱ → False
    q_tf("g12-fin1400dey-r2tf2", 2, "Teachers share their experiences with us.", 0),  # ۴۲ → True
]
# ---------------------------------------------------------------- S15 ریدینگ احترام به معلم: کامل کنید (ص۳۳۲) — کلیدهای نقطه‌دارِ چاپیِ ۴۳/۴۴
s15 = [
    q_typed("g12-fin1400dey-r2c1", 1,
            "Students can show their respect to teachers by --------------- .",
            ["paying attention during lessons and following classroom rules"],
            "answer with the printed key…"),                                           # ۴۳
    q_typed("g12-fin1400dey-r2c2", 2,
            "Dedicated teachers become a model for students because they --------------- .",
            ["go far beyond their duties"],
            "answer with the printed key…"),                                           # ۴۴
]
# ---------------------------------------------------------------- S16 ریدینگ فناوری و سلامت (ص۳۳۲-۳۳۳) — کلید False/False — متنِ تازهٔ خانواده
s16 = [
    q_tf("g12-fin1400dey-r3tf1", 1, "According to the passage, mobile phones are not very harmful for children.", 1),  # ۴۵ → False
    q_tf("g12-fin1400dey-r3tf2", 2, "Mobile phones can cure memory loss in some people", 1),  # ۴۶ → False — بدونِ نقطهٔ پایانیِ چاپی
]
# ---------------------------------------------------------------- S17 ریدینگ فناوری و سلامت: پرسش پاسخ (ص۳۳۳) — فهرستِ چهارمثالیِ (0/25)×۴ + کلیدِ جمله‌کاملِ ۴۸
s17 = [
    q_typed("g12-fin1400dey-r3q1", 1,
            "What are some examples of technology?",
            ["televisions, computers, online games, phones"],
            "answer with the four printed examples…"),                                 # ۴۷ → بازسازی از قطعاتِ RTL با چهار نشانِ (0/25)
    q_typed("g12-fin1400dey-r3q2", 2,
            "Why should you use your mobile phone for limited time? ………………………………… .",
            ["Because they can cause brain problems", "they can cause brain problems"],
            "answer with a full sentence…"),                                           # ۴۸
]
# ---------------------------------------------------------------- S18 کلمات ربط (ص۳۳۳) — کلید and/or؛ ساقهٔ ۵۰ عینِ r299-۴۶ و تمرینِ r286
CONN_POOL = ["but", "and", "so", "or"]
s18 = [
    q_typed("g12-fin1400dey-conn1", 1,
            "Reza and Saeed went swimming last week, --------------- they had a nice time.",
            ["and"], "fill in the blank with a connective…"),                          # ۴۹
    q_typed("g12-fin1400dey-conn2", 2,
            "We can eat our lunch at the restaurant, --------------- we can have it at home.",
            ["or"], "fill in the blank with a connective…"),                           # ۵۰ — عینِ r299-۴۶
]
for q in s18:
    q["options"] = list(CONN_POOL)
# ---------------------------------------------------------------- S19 جملهٔ مرکب با تصویر (ص۳۳۳) — کلیدِ نیمه‌جمله‌ایِ چاپیِ «…but he had to read it.» عینِ r302-۵۰؛ ساقه با «is» نه «was»
s19 = [
    q_typed("g12-fin1400dey-cx1", 1,
            "The book is boring, --------------- . (read )",
            ["The book is boring, but he had to read it.", "but he had to read it"],
            "با but/and/so/or جملهٔ مرکبِ معنادار بنویسید…"),                          # ۵۱
]

BANKS = [
    (266, "نهایی سراسری دی ۱۴۰۰ — شنیداری فایل ۱: درست/نادرست (ص۳۲۹)", "استاندارد", s1),
    (267, "نهایی سراسری دی ۱۴۰۰ — شنیداری فایل ۲: مکالمه شیلا و سمیرا — درست/نادرست + کامل کنید (ص۳۲۹)", "آموزشی — ورود آزاد", s2),
    (268, "نهایی سراسری دی ۱۴۰۰ — شنیداری فایل ۳: مکالمه زهرا و مبینا، کامل کنید + پرسش (ص۳۲۹)", "آموزشی — ورود آزاد", s3),
    (269, "نهایی سراسری دی ۱۴۰۰ — شنیداری فایل ۴: متن فرهنگ‌لغت، کامل کنید (ص۳۲۹)", "آموزشی — ورود آزاد", s4),
    (270, "نهایی سراسری دی ۱۴۰۰ — واژگان با تصویر: جملهٔ مناسب هر تصویر (ص۳۳۰)", "استاندارد", s5),
    (271, "نهایی سراسری دی ۱۴۰۰ — واژگان: جای خالی از بانک (ص۳۳۰)", "آموزشی — ورود آزاد", s6),
    (272, "نهایی سراسری دی ۱۴۰۰ — واژگان: تعریف‌های ستون B (ص۳۳۰)", "استاندارد", s7),
    (273, "نهایی سراسری دی ۱۴۰۰ — واژگان: کامل‌کردن از دانش خود (ص۳۳۰)", "آموزشی — ورود آزاد", s8),
    (274, "نهایی سراسری دی ۱۴۰۰ — گرامر: تست چهارگزینه‌ای (ص۳۳۱)", "استاندارد", s9),
    (275, "نهایی سراسری دی ۱۴۰۰ — شکل صحیح فعل، بنویسید (ص۳۳۱)", "آموزشی — ورود آزاد", s10),
    (276, "نهایی سراسری دی ۱۴۰۰ — مرتب‌کردن کلمات، بنویسید (ص۳۳۱)", "آموزشی — ورود آزاد", s11),
    (277, "نهایی سراسری دی ۱۴۰۰ — ضمیر موصولی، کامل کنید (ص۳۳۱)", "آموزشی — ورود آزاد", s12),
    (278, "نهایی سراسری دی ۱۴۰۰ — ریدینگ انرژی پاک: درست/نادرست + تست + پرسش (ص۳۳۱-۳۳۲)", "آموزشی — ورود آزاد", s13),
    (279, "نهایی سراسری دی ۱۴۰۰ — ریدینگ احترام به معلم: درست/نادرست (ص۳۳۲)", "استاندارد", s14),
    (280, "نهایی سراسری دی ۱۴۰۰ — ریدینگ احترام به معلم: کامل کنید (ص۳۳۲)", "آموزشی — ورود آزاد", s15),
    (281, "نهایی سراسری دی ۱۴۰۰ — ریدینگ فناوری و سلامت: درست/نادرست (ص۳۳۲-۳۳۳)", "استاندارد", s16),
    (282, "نهایی سراسری دی ۱۴۰۰ — ریدینگ فناوری و سلامت: پرسش پاسخ (ص۳۳۳)", "آموزشی — ورود آزاد", s17),
    (283, "نهایی سراسری دی ۱۴۰۰ — کلمات ربط، کامل کنید (ص۳۳۳)", "آموزشی — ورود آزاد", s18),
    (284, "نهایی سراسری دی ۱۴۰۰ — جملهٔ مرکب با کلمهٔ ربط و تصویر، بنویسید (ص۳۳۳)", "آموزشی — ورود آزاد", s19),
]

# ================================================================ راستی‌آزماییِ OCR (وفاداریِ بدنه ص۳۲۹-۳۳۳)
SKIP_PREFIXES = ("با توجه به", "برای هر کلمهٔ", "جملهٔ", "دو واژهٔ")
for lid, _title, _level, qs in BANKS:
    for q in qs:
        if q["question"].startswith(SKIP_PREFIXES):
            pass  # دستورالعملِ فارسیِ درون‌اپ — الگوی r296-r304؛ گزینه‌ها/کلیدها جداگانه راستی‌آزمایی می‌شوند
        else:
            require(ocr_has_stem(q["question"]), f"stem not in OCR: {q['id']} :: {q['question'][:70]}")
        if q.get("kind") == "mcq" and q["options"] not in (["True", "False"],):
            for opt in q["options"]:
                require(ocr_has(opt), f"option not in OCR: {q['id']} :: {opt[:60]}")

# راهنمای پرانتزیِ چاپیِ (read ) برای ۵۱ جداگانه راستی‌آزمایی می‌شود (با فاصلهٔ چاپی)
require(ocr_has("(read )"), "body prints the (read ) hint for item 51")

# ================================================================ کلیدهای راهنمای تصحیح (ص۳۳۴-۳۳۵) — راستی‌آزماییِ قطعه‌کلیدها
GUIDE_FRAGMENTS = [
    "1. True (a)", "2. False (b)", "3. True (a)", "4. False (b)",
    "5. False (b)", "6. True (a)", "7. arrived, took",
    "8. walk , rain", "9. gym", "10. stay, rest", "11. Health is more important.",
    "12. information", "13. order", "14. definition", "15. imagine", "16. choice",
    "17. (e)", "18. (a)", "19. (c)", "20. (b)",
    "21. born", "22. introduction", "23. demand",
    "24. (c)", "25. (a)", "26. (d)",
    "27. sight , mind",
    "28. (d)", "29. (a)", "30. (a)", "31. (c)",
    "32. had seen",
    "36. (a) True", "37. (a) True", "38. (c)", "39. (d)",
    "Iranians use special designs and arrangements of windows, balconies and yards to get the most sunshine",
    "41. (b) False", "42. (a) True",
    "paying attention during lessons and following classroom rules",
    "go far beyond their duties",
    "45. (b) False", "46. (b) False",
    "48. Because they can cause brain problems",
    "49. and", "50. or",
    "but he had to read it",
    # توضیحِ کلیدِ ۳۵ — راهنما «which» را با یادداشتِ توضیحی چاپ کرده (الگوی r299-r304)
    "را به همراه یک جمله یا عبارت",
    "دارای فعل",
    "در ادامه بنویسد",
    # یادداشتِ نمرهٔ کاملِ ۵۱ با تصویر
    "در این بخش با انتخاب درست یکی از کلمات ربط",
    # سربرگِ رسمی — «دي» با ی عربیِ چاپی (وفاداریِ یونی‌کدی)
    "نوبت دي ماه سال1400",
    "http://aee.medu.ir",
    "20/10/1400",
    "کلیه رشته ها",
    "Audio file (MP3)",
    "Audio file (PDF)",  # واریانتِ نوِ سربرگِ صوتی — در r292-r304 «Audio script (PDF)» بود
    # بخش ۱۸: بارمِ اصولیِ Topic sentenceها + بخش ۱۹: بارمِ اصولیِ پاراگراف + داده‌های چاپی
    "Topic Sentence",
    "سوالات52",
    "سوال55",
    "رعایت اصول",
    "Great Iranian Poet",
    "606, Shiraz",
    "Bustan,Gulistan",
    "Saadi Shirazi",
]
for frag in GUIDE_FRAGMENTS:
    require(ocr_has(frag), f"guide fragment not in OCR: {frag[:60]}")
# چهار نشانِ (0/25) برای فهرستِ چهارمثالیِ ۴۷ + دو نشانِ (0/5) برای ۴۰
require(OCR_N.count("(0/25)") >= 4, "guide prints four (0/25) marks for the four-example key of item 47")
require(OCR_N.count("(0/5)") >= 2, "guide prints (0/5) marks for the full-sentence key of item 40")
# گریدِ بهم‌ریختهٔ ۳۳/۳۴ در راهنما — همهٔ قطعات چاپی («got hom» و «t could res» بریده‌اند)
for frag in ["got hom", "had fallen", "asleep", "The baby", "had more time", "could res", "John", "if", "he"]:
    require(ocr_has(frag), f"scrambled grid fragment not in OCR: {frag}")
# فهرستِ چهارمثالیِ ۴۷: چهار قطعهٔ بهم‌ریختهٔ RTL
for frag in ["televisions", "computers", "online games", "phones"]:
    require(ocr_has(frag), f"scrambled examples fragment not in OCR: {frag}")
# غیبتِ صادقانهٔ ۵۲-۵۴: بارمِ اصولیِ Topic sentence — بدونِ نمونهٔ چاپی
require(ocr_has("رعایت اصول") and ocr_has("Topic Sentence"),
        "guide 18 prints principle-only Topic sentence bar for items 52-54")

# ================================================================ داوریِ دومِ مستقل (معناییِ کلیدها — مستقل از گذرِ نخست)
SECOND = [
    ("g12-fin1400dey-l1tf1", "a", True), ("g12-fin1400dey-l1tf2", "b", True),
    ("g12-fin1400dey-l1tf3", "a", True), ("g12-fin1400dey-l1tf4", "b", True),
    ("g12-fin1400dey-l2tf1", "b", True), ("g12-fin1400dey-l2tf2", "a", True),
    ("g12-fin1400dey-pic1", "e", ocr_has("e. My little sister sits on my mother’s lap all the time")),
    ("g12-fin1400dey-pic2", "a", ocr_has("a. The new light bulbs consume less electricity")),
    ("g12-fin1400dey-pic3", "c", ocr_has("c. I circled the dictionary entry for the word ‘purpose’")),
    ("g12-fin1400dey-pic4", "b", ocr_has("b. The main sources of renewable energy are wind, water and sun")),
    ("g12-fin1400dey-def1", "c", ocr_has("c. many times")),
    ("g12-fin1400dey-def2", "a", ocr_has("a. an arrangement in a particular order")),
    ("g12-fin1400dey-def3", "d", ocr_has("d. all the people of about the same age within a society")),
    ("g12-fin1400dey-g1", "d", ocr_has("d) have you")),
    ("g12-fin1400dey-g2", "a", ocr_has("a) whom")),
    ("g12-fin1400dey-g3", "a", ocr_has("a) should be informed")),
    ("g12-fin1400dey-g4", "c", ocr_has("c) were opened")),
    ("g12-fin1400dey-r1tf1", "a", True), ("g12-fin1400dey-r1tf2", "a", True),
    ("g12-fin1400dey-r1m1", "c", ocr_has("c) aren’t replaced")),
    ("g12-fin1400dey-r1m2", "d", ocr_has("d) radiation")),
    ("g12-fin1400dey-r2tf1", "b", True), ("g12-fin1400dey-r2tf2", "a", True),
    ("g12-fin1400dey-r3tf1", "b", True), ("g12-fin1400dey-r3tf2", "b", True),
]
ALL_QS = [q for _lid, _t, _lv, qs in BANKS for q in qs]
for qid, letter, sem_ok in SECOND:
    require(sem_ok, f"second judgement failed: {qid} [{letter}]")
    q = next(x for x in ALL_QS if x["id"] == qid)
    pool = "ab" if q["options"] == ["True", "False"] else "abcde"
    require(q["answer"] == pool.index(letter), f"{qid}: answer {q['answer']} != guide letter {letter}")

# کلیدهای تایپی — هر accepted باید در OCR یا راهنما ریشهٔ چاپی داشته باشد
TYPED_KEYS = {
    "g12-fin1400dey-l2q1": ["arrived", "took"],
    "g12-fin1400dey-l3q1": ["walk", "rain"],
    "g12-fin1400dey-l3q2": ["gym"],
    "g12-fin1400dey-l3q3": ["stay", "rest"],
    "g12-fin1400dey-l3q4": ["Health is more important."],
    "g12-fin1400dey-l4q1": ["information"], "g12-fin1400dey-l4q2": ["order"],
    "g12-fin1400dey-l4q3": ["definition"], "g12-fin1400dey-l4q4": ["imagine"],
    "g12-fin1400dey-l4q5": ["choice"],
    "g12-fin1400dey-pool1": ["born"], "g12-fin1400dey-pool2": ["introduction"],
    "g12-fin1400dey-pool3": ["demand"],
    "g12-fin1400dey-ok1": ["sight", "mind"],
    "g12-fin1400dey-vf1": ["had seen"],
    "g12-fin1400dey-ws1": ["The baby had fallen asleep when I got home."],
    "g12-fin1400dey-ws2": ["John could rest if he had more time."],
    "g12-fin1400dey-rel1": ["which"],
    "g12-fin1400dey-r1q1": ["Iranians use special designs and arrangements of windows, balconies and yards to get the most sunshine."],
    "g12-fin1400dey-r2c1": ["paying attention during lessons and following classroom rules"],
    "g12-fin1400dey-r2c2": ["go far beyond their duties"],
    "g12-fin1400dey-r3q1": ["televisions", "computers", "online games", "phones"],
    "g12-fin1400dey-r3q2": ["Because they can cause brain problems"],
    "g12-fin1400dey-conn1": ["and"], "g12-fin1400dey-conn2": ["or"],
    "g12-fin1400dey-cx1": ["but he had to read it"],
}
for qid, keys in TYPED_KEYS.items():
    q = next(x for x in ALL_QS if x["id"] == qid)
    require(q["kind"] == "typed", f"{qid} must be typed")
    for k in keys:
        require(any(k in a for a in q["accepted"]), f"{qid}: accepted lacks printed key variant {k[:40]}")

# ================================================================ تزریق (idempotent — خروجیِ ناقصِ رانِ قبلی پاک می‌شود)
data = json.loads(BANK_PATH.read_text(encoding="utf-8"))
data["lessons"] = [l for l in data["lessons"] if l["lesson"] < 266]
data["source"].pop("final1400dey", None)
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

require(data["lessons"][-1]["lesson"] == 265, f"family tail is {data['lessons'][-1]['lesson']}, expected 265")
require([l["lesson"] for l in new_lessons] == list(range(266, 285)), "lesson numbers must be 266..284")
require(total_new == 51, f"total new items {total_new} != 51")

data["lessons"].extend(new_lessons)

data["source"]["final1400dey"] = {
    "pages": "329-333",
    "keyPages": "334-335",
    "titlePrinted": "آزمون نهایی انگلیسی دوازدهم — نوبت دي ماه سال ۱۴۰۰ (با «ي عربی» چاپی)، رسمیِ سراسریِ کلیهٔ رشته‌ها، مرکز سنجش و پایش کیفیت آموزشی (aee.medu.ir)، تاریخ ۲۰/۱۰/۱۴۰۰، ۵ صفحه، جمع نمره ۴۰ — چهاردهمین نوبتِ خانواده (عبور از مرزِ دوازده نوبت)، ششمین نوبتِ منبعِ رسمی",
    "sections": 19,
    "banks": 19,
    "questions": 51,
    "keys": 51,
    "extractedRound": 305,
    "branchVariant": "چهاردهمین نوبتِ خانواده — ششمین نوبتِ منبعِ رسمی: چهار کلیدِ چندخالیِ دولایه (۷ arrived,took / ۸ walk , rain / ۱۰ stay,rest / ۲۷ sight , mind) + دو شکافِ حرفیِ هم‌زمان در ۲۷ (s----/m---) + کلیدِ جمله‌کاملِ ۴۰ با دو (0/5) + فهرستِ چهارمثالیِ ۴۷ با چهار (0/25) + کلیدهای نقطه‌دارِ چاپیِ ۴۳/۴۴ + نیمه‌جمله‌ایِ ۵۱ عینِ r302-۵۰ با ساقهٔ «is» + ساقهٔ ۵۰ عینِ r299-۴۶ + اضافهٔ تصویریِ چهارم‌جایِ (d) نخستین‌بار + سربرگِ صوتیِ «Audio file (PDF)».",
    "audioFilesAbsent": True,
    "openWritingAbsent": {"items": "۵۲/۵۳/۵۴ (Topic sentence برای Sport/Electric Cars/Ants) و ۵۵ (پاراگرافِ Saadi Shirazi با داده‌های چاپی Great Iranian Poet / Date and place of birth: 606, Shiraz / Famous books: Bustan,Gulistan)", "reason": "راهنما فقط بارمِ اصولی می‌دهد — الگوی r296-r304"},
    "receipts": [
        "ششمین نوبتِ منبعِ رسمیِ مرکز سنجش — سربرگِ این نوبت با «ي عربی» چاپ شده («دي» ماه)؛ قطعهٔ هدر با همان یونی‌کد راستی‌آزمایی شد",
        "چهار کلیدِ چندخالیِ دولایه در یک نوبت (رکوردِ خانواده): ۷: «arrived, took» / ۸: «walk , rain» / ۱۰: «stay, rest» / ۲۷: «sight , mind» — هر کلید دو واژه به ترتیبِ چاپی با ویرگول؛ دو مورد با ویرگولِ فاصله‌دار («walk , rain»/«sight , mind») و دو واریانت در accepted",
        "آیتمِ ۲۷ دو شکافِ حرفیِ هم‌زمان دارد («Out of s - - - -, out of m - - -») — نخستین ضرب‌المثلِ دولایه؛ چهارمین ضرب‌المثلِ تک‌واریانتهٔ خانواده",
        "کلیدِ جمله‌کاملِ ۴۰ («Iranians use special designs and arrangements of windows, balconies and yards…») با دو نشانِ (0/5) و فهرستِ چهارمثالیِ ۴۷ با چهار نشانِ (0/25) — بازسازی از قطعاتِ RTL به ترتیبِ بدنه",
        "کلیدهای نقطه‌دارِ چاپیِ ۴۳/۴۴ («…… paying attention…»/«……. go far beyond…») — نقطه‌های آغازین حذف و جملهٔ کلید پذیرفته شد",
        "کلیدِ نیمه‌جمله‌ایِ ۵۱ «…but he had to read it.» عینِ r302-۵۰ است اما ساقه «The book is boring» دارد نه «was» — موازیِ خانواده؛ ساقهٔ ۵۰ «We can eat our lunch at the restaurant…» چهارمین وقوع در خانواده (ریشه: تمرینِ چاپیِ r286-l14؛ سپس r299-۴۶ و r300-conn2)؛ گاردِ ساقه‌محورِ راندهای قدیمی به دورهٔ خودشان محدود است",
        "ساقهٔ ۲۲ «This book has only a two-page introduction» سومین بار در خانواده (r303-pool2/r304-def1) — پولِ ۲۱-۲۳ این‌بار shouted/born/demand/introduction است (اضافه: shouted نخست‌جای)",
        "اضافهٔ تصویری در (d) چهارم‌جای (C is the symbol for carbon) — نخستین جایگاهِ چهارم در ۱۳ راندِ تصویری؛ اضافهٔ تعریف‌ها (b) دوم‌جای (finish something)",
        "متن‌های ریدینگِ تازه: انرژی پاک/خورشیدی (ایرانی‌ها و طراحیِ پنجره‌ها)، احترام به معلم (خویشاوندِ r303-بزرگ‌ترها)، فناوری و سلامت (موبایل/خواب) — هر سه با گاردِ «هیچ ساقه‌ای در خانوادهٔ پیشین نیست»",
        "وفاداری‌های چاپی: «Samir’s» مفرد در ساقهٔ ۷ در برابر «Samira» در سربرگِ بخش، «…..14……» بدونِ پرانتز در شماره‌گذاریِ ۱۲-۱۶ (برخلافِ پرانتزدارِ r304)، «they……………………» چسبیده در ۴۴، بدونِ نقطهٔ پایانی در ۴۶، نقطهٔ دوگانهٔ «earth..» در ۳۹، «(read )» با فاصلهٔ چاپی در ۵۱، «Bustan,Gulistan» بدونِ فاصله",
        "پنج دکمهٔ شنیداری با فایلِ صوتیِ غایب — الگوی r292-r304؛ سربرگِ صوتیِ این نوبت «Audio file (PDF)» است نه «Audio script (PDF)»",
    ],
}

BANK_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"injected {len(new_lessons)} banks / {total_new} items; family now {len(data['lessons'])} banks / {sum(l['count'] for l in data['lessons'])} tests")
if failures:
    print("FAILURES:")
    for f in failures:
        print(" -", f)
    sys.exit(1)
print("OK")
