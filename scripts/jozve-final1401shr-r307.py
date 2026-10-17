#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r307 — آزمون نهایی، رسمیِ سراسریِ کلیهٔ رشته‌ها — نوبت شهریور ۱۴۰۱ (مرکز سنجش aee.medu.ir — بدنه ص۳۴۳-۳۴۷، راهنمای تصحیح ص۳۴۸-۳۴۹)
شانزدهمین و واپسین نوبتِ «آزمون‌های نهایی دی ۹۷ تا شهریور ۱۴۰۱». سربرگِ تاریخ حاکم (درس r297/r301/r302/r304/r305/r306): «تاريخ امتحان 21/06/1401» + «نوبت شهریور ماه سال1401».
کشف‌های راند:
(۱) هشتمین نوبتِ منبعِ رسمی (پس از r299/r301/r302/r303/r304/r305/r306) — و **واپسین نوبتِ سری**: صفحهٔ ۳۴۹ واپسین صفحهٔ جزوه است؛ سریِ کاملِ دی۹۷ تا شهریور۱۴۰۱ بسته شد.
(۲) رکوردِ آیتم: ۶۲ آیتم با کلیدِ چاپی در ۲۰ بانک (پیشتر ۵۳ در r306؛ فقط ۶۳-۶۵ Topic و ۶۶ پاراگرافِ Water بارمِ اصولی — ۶۲/۶۶ پوششِ کلید).
(۳) کلیدِ دولایهٔ اسلش‌دارِ ۵۲ «We / You spend about one-third (1/3)…» — سومین اسلش‌دولایهٔ خانواده (r304 had got/gotten، r306 these/those) این‌بار در فاعلِ جمله؛ accepted دو واریانت.
(۴) بازسازیِ کلیدِ ۵۸ از قطعاتِ RTL («we are still confused or think we are missing important information») — دومین وقوعِ الگوی r305-47.
(۵) ششمین بانکِ سه‌گزینه‌ایِ شنیداری (گزارشگر/ورزشکار) و چهارمین اضافهٔ تصویریِ (b) دوم‌جای (r302/r304/r306).
(۶) متنِ خیابانِ تاریک = بازگوییِ اول‌شخصِ داستانِ مایک/جانِ r306 (آنجا ریدینگِ سوم‌شخص، اینجا شنیداریِ کامل‌کن) — موازیِ مستند با شش کلیدِ نو (late/office/quiet/walking/wondered/suddenly).
(۷) انرژی خورشیدی: پاراگرافی که در r306 فقط بارمِ اصولی بود (Topic ۵۶) این‌جا ریدینگِ کاملِ قابلِ بازی شد (۷ آیتمِ ۴۱-۴۷).
(۸) کلیدهای تازهٔ محض: «be kept»، «had studied» (تایپی)، «would tell»، scrambleِ ۳۸ با دو واریانتِ چاپی؛ ضرب‌المثلِ «Birds of a feather» نخستین‌بار با شکافِ حرفی (شکلِ کاملِ l136 در خانواده حاضر است).
(۹) سربرگِ صوتی: فقط «Listening» — چهارمین واریانت (پس از Audio script (PDF)، Audio file (PDF)، Audio file (MP3)/Audio script (MP3)).
۲۰ بانک / ۶۲ آیتم — خانوادهٔ موضوعی هفدهم: ۱۴۹۴ + ۶۲ = ۱۵۵۶ تست در ۳۲۴ بانک.
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
    s = re.sub(r"[\"'`´‘’“”«»˝\u02DD\u030B]", "", s)  # آکسان/گیومه — الگوی r300-r306
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
    """ساقه با خالیِ میانی/شماره‌گذاریِ چاپی: نیمه‌ها جداگانه راستی‌آزمایی می‌شوند (الگوی r299-r306)"""
    if ocr_has(stem):
        return True
    cleaned = re.sub(r"……\(\d+\)……", " ", stem)   # شماره‌گذاریِ چاپیِ پرانتزدار
    if ocr_has(cleaned):
        return True
    parts = [p.strip(" .") for p in cleaned.split("---------------")]
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

# ---------------------------------------------------------------- S1 شنیداری فایل ۱: مکالمهٔ پدر و پسر (والیبال/بادبادک) — درست/نادرست (ص۳۴۳) — کلید b/a/a/b
s1 = [
    q_tf("g12-fin1401shr-l1tf1", 1, "They played volleyball and had a sandwich.", 1),                    # ۱ → (b) False
    q_tf("g12-fin1401shr-l1tf2", 2, "They had taken some photographs before playing volleyball.", 0),    # ۲ → (a) True
    q_tf("g12-fin1401shr-l1tf3", 3, "After they had eaten lunch, they flew their kites.", 0),            # ۳ → (a) True
    q_tf("g12-fin1401shr-l1tf4", 4, "That was fantastic because they had bought the kites.", 1),         # ۴ → (b) False
]
# ---------------------------------------------------------------- S2 شنیداری فایل ۲: مکالمهٔ خانم گزارشگر و ورزشکار — تست سه‌گزینه‌ای (ص۳۴۳) — کلید c/a/b/c — ششمین بانکِ سه‌گزینه‌ایِ شنیداریِ خانواده
s2 = [
    q_mcq("g12-fin1401shr-l2m1", 1, "He likes to play --------------- .",
          ["football", "basketball", "badminton"], 2),                            # ۵ → (c)
    q_mcq("g12-fin1401shr-l2m2", 2, "That sport is --------------- in his country.",
          ["popular", "special", "wonderful"], 0),                                # ۶ → (a)
    q_mcq("g12-fin1401shr-l2m3", 3, "He plays that sport every --------------- .",
          ["week", "weekend", "Wednesday"], 1),                                   # ۷ → (b)
    q_mcq("g12-fin1401shr-l2m4", 4, "He prefers watching football --------------- .",
          ["offline", "online", "offline and online"], 2),                        # ۸ → (c)
]
# ---------------------------------------------------------------- S3 شنیداری فایل ۳: مکالمهٔ مجید و آقای ایرانمهر (فرهنگ‌لغت) — کامل کنید (ص۳۴۳) — کلید recommend/monolingual/elementary/pocket
s3 = [
    q_typed("g12-fin1401shr-l3q1", 1,
            "Mr. Iranmehr: First, I --------------- a learner’s dictionary.",
            ["recommend"], "fill in the blank with the missing word…"),            # ۹
    q_typed("g12-fin1401shr-l3q2", 2,
            "Mr. Iranmehr: I suppose a --------------- dictionary is more suitable for you.",
            ["monolingual"], "fill in the blank with the missing word…"),          # ۱۰ — دومین کلیدِ تایپیِ monolingual (خویشاوندِ l94)
    q_typed("g12-fin1401shr-l3q3", 3,
            "Mr. Iranmehr: For you as a high school student, an --------------- one is OK.",
            ["elementary"], "fill in the blank with the missing word…"),           # ۱۱
    q_typed("g12-fin1401shr-l3q4", 4,
            "Mr. Iranmehr: Yes, a --------------- dictionary.",
            ["pocket"], "fill in the blank with the missing word…"),               # ۱۲
]
# ---------------------------------------------------------------- S4 شنیداری فایل ۴: متنِ خیابانِ تاریک — کامل کنید (ص۳۴۳) — شماره‌گذاریِ چاپیِ ……(13)……-……(18)…… (الگوی r306-l288) — بازگوییِ اول‌شخصِ داستانِ مایک/جانِ r306 — کلید late/office/quiet/walking/wondered/suddenly
s4 = [
    q_typed("g12-fin1401shr-l4q1", 1,
            "Last night, I left work ……(13)……--------------- at around 9 p.m.",
            ["late"], "fill in the blank with the missing word…"),                 # ۱۳ — موازیِ r306 «Last night Mike left work late at around 9 p.m.»
    q_typed("g12-fin1401shr-l4q2", 2,
            "When I came out of the ……(14)……--------------- , most people had already gone home.",
            ["office"], "fill in the blank with the missing word…"),               # ۱۴ — موازیِ r306 «came out of the office»
    q_typed("g12-fin1401shr-l4q3", 3,
            "The street was very dark and ……(15)……--------------- I hadn’t experienced such a thing before.",
            ["quiet"], "fill in the blank with the missing word…"),                # ۱۵ — موازیِ r306 «very dark and quiet»
    q_typed("g12-fin1401shr-l4q4", 4,
            "While I was ……(16)……--------------- , a car pulled over.",
            ["walking"], "fill in the blank with the missing word…"),              # ۱۶ — موازیِ r306 «While he was walking, a car pulled over»
    q_typed("g12-fin1401shr-l4q5", 5,
            "I ……(17)……--------------- who can it be? He waved at me and came out of the car.",
            ["wondered"], "fill in the blank with the missing word…"),             # ۱۷ — موازیِ r306 «The driver waved at him»
    q_typed("g12-fin1401shr-l4q6", 6,
            "……(18)……--------------- , I remembered.",
            ["suddenly"], "fill in the blank with the missing word…"),             # ۱۸ — موازیِ r306 «Suddenly Mike remembered»
]
# ---------------------------------------------------------------- S5 واژگان با تصویر (ص۳۴۴) — پنج جملهٔ چاپی با اضافهٔ (b) دوم‌جای — چهارمین بار (r302/r304/r306) — کلید d/e/a/c
PIC_INSTR = "با توجه به تصاویر داده‌شده، جملهٔ مناسب برای هر تصویر را انتخاب کنید. (یک جمله اضافی است)"
PIC_OPTS = [
    "The smallest dictionary in the world needs to be read with a magnifying glass.",  # a — کلیدِ ۲۱
    "Absence makes the heart grow fonder.",        # b — اضافهٔ چاپی — دوم‌جای (r302/r304/r306) — ضرب‌المثلِ اضافه
    "Teenagers who help others are more successful in life.",  # c — کلیدِ ۲۲
    "Wind towers in Yazd’s buildings can lower the cooling cost.",  # d — کلیدِ ۱۹ — خویشاوندِ موضوعیِ l96/l143 و پاراگرافِ r304 و تصویریِ r306
    "Factories have polluted the air and environment.",  # e — کلیدِ ۲۰
]
s5 = [
    q_mcq("g12-fin1401shr-pic1", 1, PIC_INSTR, PIC_OPTS, 3),   # ۱۹ → (d)
    q_mcq("g12-fin1401shr-pic2", 2, PIC_INSTR, PIC_OPTS, 4),   # ۲۰ → (e)
    q_mcq("g12-fin1401shr-pic3", 3, PIC_INSTR, PIC_OPTS, 0),   # ۲۱ → (a)
    q_mcq("g12-fin1401shr-pic4", 4, PIC_INSTR, PIC_OPTS, 2),   # ۲۲ → (c)
]
# ---------------------------------------------------------------- S6 واژگان: جای خالی از بانک (ص۳۴۴) — پولِ (identify / shouted / diary / turbine) با اضافهٔ diary — کلید turbine/identify/shouted
POOL6 = ["identify", "shouted", "diary", "turbine"]
s6 = [
    q_typed("g12-fin1401shr-pool1", 1,
            "This wind --------------- is able to generate a lot of electricity each day.",
            ["turbine"], "fill in the blank with a word from the pool…"),          # ۲۳
    q_typed("g12-fin1401shr-pool2", 2,
            "To choose the best dictionary, first --------------- your needs.",
            ["identify"], "fill in the blank with a word from the pool…"),         # ۲۴
    q_typed("g12-fin1401shr-pool3", 3,
            "When my mother saw my score, she --------------- at me angrily.",
            ["shouted"], "fill in the blank with a word from the pool…"),          # ۲۵
]
for q in s6:
    q["options"] = list(POOL6)
# ---------------------------------------------------------------- S7 واژگان: تعریف‌های ستون B (ص۳۴۴) — اضافهٔ (a) اول‌جای — کلید b/d/c
DEF_OPTS = [
    "to change in a form",                 # a — اضافهٔ چاپی — اول‌جای
    "to be grateful for",                  # b — کلیدِ ۲۶
    "to have something inside",            # c — کلیدِ ۲۸
    "to think and believe",                # d — کلیدِ ۲۷
]
s7 = [
    q_mcq("g12-fin1401shr-def1", 1, "I really appreciate the culture and art of Iran.", DEF_OPTS, 1),   # ۲۶ → (b)
    q_mcq("g12-fin1401shr-def2", 2, "I suppose we shouldn’t give up trying after a failure.", DEF_OPTS, 3),  # ۲۷ → (d)
    q_mcq("g12-fin1401shr-def3", 3, "Pizza contains a lot of fat.", DEF_OPTS, 2),   # ۲۸ → (c)
]
# ---------------------------------------------------------------- S8 واژگان: شکافِ حرفی (ص۳۴۴) — دو آیتم در یک بانک — burst (شکاف روی خودِ فعل) + flock (ضرب‌المثلِ Birds of a feather؛ شکلِ کاملِ l136 در خانواده)
s8 = [
    q_typed("g12-fin1401shr-ok1", 1,
            "When Amir saw the film, he b --------------- into tears.",
            ["burst"], "کلیدِ واژه را با حرفِ اولِ چاپی کامل کنید…"),               # ۲۹ → burst — نخستین‌بار شکاف روی خودِ «burst» (l87 شکاف روی into داشت)
    q_typed("g12-fin1401shr-ok2", 2,
            "People like to spend time with others who are similar to them. Therefore, “Birds of a feather, f --------------- together.”",
            ["flock"], "کلیدِ واژه را با حرفِ اولِ چاپی کامل کنید…"),               # ۳۰ → flock — نخستین شکلِ شکاف‌حرفیِ ضرب‌المثلِ l136
]
# ---------------------------------------------------------------- S9 گرامر: تست چهارگزینه‌ای (ص۳۴۵) — کلید b/c/a/d — تگ‌کوئشنِ «never» با تگِ مثبت + موصولی whom + مفعولی + گذشتهٔ کامل
s9 = [
    q_mcq("g12-fin1401shr-g1", 1,
          "The boy --------------- you invited arrived very late.",
          ["which", "whom", "who", "whose"], 1),                                   # ۳۱ → (b) whom
    q_mcq("g12-fin1401shr-g2", 2,
          "English --------------- in many countries.",
          ["speaks", "is speaking", "is spoken", "has spoken"], 2),                # ۳۲ → (c) is spoken
    q_mcq("g12-fin1401shr-g3", 3,
          "His sister never behaves politely, --------------- ?",
          ["does she", "doesn’t she", "does he", "doesn’t he"], 0),                # ۳۳ → (a) does she — قیدِ منفیِ never → تگِ مثبت
    q_mcq("g12-fin1401shr-g4", 4,
          "Zahra --------------- chess before, so I showed her what to do.",
          ["didn’t play", "wasn’t playing", "hasn’t played", "hadn’t played"], 3), # ۳۴ → (d) hadn’t played
]
# ---------------------------------------------------------------- S10 شکل صحیح فعل (ص۳۴۵) — سه آیتم — کلیدهای تازهٔ محض: be kept (مجهولِ مدرکی) / had studied (تایپیِ تازه) / would tell (شرطیِ نوع دوم)
s10 = [
    q_typed("g12-fin1401shr-vf1", 1,
            "The meat must --------------- in a freezer. (to keep)",
            ["be kept"], "شکل صحیح فعل داخل پرانتز را بنویسید…"),                  # ۳۵ → be kept
    q_typed("g12-fin1401shr-vf2", 2,
            "I passed my final exam because I --------------- well. (to study)",
            ["had studied"], "شکل صحیح فعل داخل پرانتز را بنویسید…"),              # ۳۶ → had studied — واژه‌کلید در l87 MCQ بود، این‌بار تایپی
    q_typed("g12-fin1401shr-vf3", 3,
            "I don’t know the answer. If I knew the answer, I --------------- you. (to tell)",
            ["would tell"], "شکل صحیح فعل داخل پرانتز را بنویسید…"),               # ۳۷ → would tell
]
# ---------------------------------------------------------------- S11 مرتب‌کردن کلمات (ص۳۴۵) — کلیدِ چاپیِ دولایه با «یا» — دو واریانت
s11 = [
    q_typed("g12-fin1401shr-ws1", 1,
            "the teacher / had done / the students / their homework / when / came to the class / . /",
            ["When the teacher came to the class, the students had done their homework.",
             "The students had done their homework when the teacher came to the class."],
            "با هر گروه از کلمات یک جمله بنویسید…"),                                # ۳۸ — دو واریانتِ چاپی
]
# ---------------------------------------------------------------- S12 جملهٔ شرطی (ص۳۴۵) — کلیدِ سه‌پاره با بارم (0/25)+(0/25)+(0/5)
s12 = [
    q_typed("g12-fin1401shr-cnd1", 1,
            "If I had a time machine, --------------- . (travel to the future)",
            ["I would travel to the future."],
            "جملهٔ شرطی را با عبارتِ داخل پرانتز کامل کنید…"),                       # ۳۹ → I would travel to the future.
]
# ---------------------------------------------------------------- S13 ضمیر موصولی (ص۳۴۵) — «A Forest is a place» با F بزرگِ چاپی — بارمِ اصولی (0/5)+(0/5) — خویشاوندِ l296 (A doctor…) و A garage/factory/cinema
s13 = [
    q_typed("g12-fin1401shr-rel1", 1,
            "A Forest is a place --------------- .",
            ["which"], "which را به همراه یک عبارتِ دارای فعل در ادامه بنویسید…"),  # ۴۰ → which
]
# ---------------------------------------------------------------- S14 ریدینگ انرژی خورشیدی: درست/نادرست (ص۳۴۵) — کلید b/b/a/b — پاراگرافِ Solar energy که در r306 فقط بارمِ اصولی بود، این‌جا ریدینگِ کاملِ قابلِ بازی شد
s14 = [
    q_tf("g12-fin1401shr-r1tf1", 1, "Solar energy comes from the Earth.", 1),                 # ۴۱ → (b) False
    q_tf("g12-fin1401shr-r1tf2", 2, "Solar panels cost a lot in the last few years.", 1),     # ۴۲ → (b) False
    q_tf("g12-fin1401shr-r1tf3", 3, "Solar panels convert sunlight into electrical energy.", 0),  # ۴۳ → (a) True
    q_tf("g12-fin1401shr-r1tf4", 4, "All countries use solar energy to generate electricity.", 1),  # ۴۴ → (b) False
]
# ---------------------------------------------------------------- S14 ادامه — کامل کنید + پرسش پاسخ (ص۳۴۶) — کلید solar energy/panels + جملهٔ کاملِ ۴۷ با بارم (0/5)+(0/5)
s15 = [
    q_typed("g12-fin1401shr-r1q1", 1,
            "In cloudy weather --------------- is available.",
            ["solar energy"], "fill in the blank with the missing word…"),         # ۴۵
    q_typed("g12-fin1401shr-r1q2", 2,
            "Solar --------------- are produced to work for a long time.",
            ["panels"], "fill in the blank with the missing word…"),               # ۴۶
    q_typed("g12-fin1401shr-r1q3", 3,
            "What do solar technologies deliver to us?",
            ["Solar technologies can deliver heat, cooling, natural lighting, electricity, and fuels."],
            "پاسخ کامل را بنویسید…"),                                              # ۴۷
]
# ---------------------------------------------------------------- S15 ریدینگ خواب: درست/نادرست + تست (ص۳۴۶) — کلید a/b/c/b
s16 = [
    q_tf("g12-fin1401shr-r2tf1", 1, "Food is less important than sleep.", 0),                 # ۴۸ → (a) True
    q_tf("g12-fin1401shr-r2tf2", 2, "There is no difference in sleep time among people.", 1), # ۴۹ → (b) False
    q_mcq("g12-fin1401shr-r2m1", 3, "Old people need --------------- hours of sleep each night.",
          ["9 to 10", "10 to 12", "6.5", "16"], 2),                                           # ۵۰ → (c) 6.5
    q_mcq("g12-fin1401shr-r2m2", 4, "A person, who does not sleep, --------------- than one who does not eat.",
          ["lives longer", "lives less", "eats more", "gets older"], 1),                      # ۵۱ → (b) lives less
]
# ---------------------------------------------------------------- S15 ادامه — پرسش پاسخ (ص۳۴۶) — کلیدِ اسلش‌دارِ دولایهٔ «We / You spend…» با بارم (0/25)+(0/75) — سومین اسلش‌دولایهٔ خانواده
s17 = [
    q_typed("g12-fin1401shr-r2q1", 1,
            "How much do we sleep in our lives?",
            ["We spend about one-third (1/3) of our lives in sleep.",
             "You spend about one-third (1/3) of our lives in sleep."],
            "پاسخ کامل را بنویسید (فاعلِ We یا You هر دو پذیرفته است)…"),           # ۵۲
]
# ---------------------------------------------------------------- S16 ریدینگ فرهنگ‌لغت: درست/نادرست + تست (ص۳۴۷) — کلید b/a/d/a — متنِ تازه (سومین ریدینگِ فرهنگ‌لغت‌محور پس از r302/r306) — refer-to با ضمیرِ نوِ «it»
s18 = [
    q_tf("g12-fin1401shr-r3tf1", 1, "After looking the word up, try to guess it.", 1),        # ۵۳ → (b) False
    q_tf("g12-fin1401shr-r3tf2", 2, "The information around the words helps you guess their meanings.", 0),  # ۵۴ → (a) True
    q_mcq("g12-fin1401shr-r3m1", 3, "Dictionary helps you --------------- .",
          ["to miss important information", "to guess the meaning of the word",
           "to read the whole sentence", "to improve reading understanding"], 3),             # ۵۵ → (d)
    q_mcq("g12-fin1401shr-r3m2", 4, "What does “it” in paragraph one refer to --------------- .",
          ["word", "dictionary", "context", "meaning"], 0),                                   # ۵۶ → (a) word
]
# ---------------------------------------------------------------- S16 ادامه — کامل کنید (ص۳۴۷) — کلیدِ ۵۸ از قطعاتِ RTL بازسازی شد (دومین وقوعِ الگوی r305-47)
s19 = [
    q_typed("g12-fin1401shr-r3q1", 1,
            "The part of speech helps you find --------------- .",
            ["the meaning of the word."], "fill in the blank with the missing word…"),  # ۵۷
    q_typed("g12-fin1401shr-r3q2", 2,
            "According to the passage, we use a dictionary when --------------- .",
            ["we are still confused or think we are missing important information"],
            "پاسخ کامل را بنویسید…"),                                                  # ۵۸
]
# ---------------------------------------------------------------- S17 کلمات ربط (ص۳۴۷) — پولِ (and, or, but, so) — کلید so/or/and/but — چهار آیتم (r305/r306 دو آیتمی بودند)
POOL20 = ["and", "or", "but", "so"]
s20 = [
    q_typed("g12-fin1401shr-conn1", 1,
            "You lost the game! --------------- if you want to succeed, you have to practice more.",
            ["so"], "fill in the blank with a connective…"),                       # ۵۹
    q_typed("g12-fin1401shr-conn2", 2,
            "You can take a bus, --------------- you can take a taxi.",
            ["or"], "fill in the blank with a connective…"),                       # ۶۰
    q_typed("g12-fin1401shr-conn3", 3,
            "I went to the whiteboard, --------------- I wrote the topic of the new lesson.",
            ["and"], "fill in the blank with a connective…"),                      # ۶۱
    q_typed("g12-fin1401shr-conn4", 4,
            "My brother is a rich man, --------------- my sister is poor.",
            ["but"], "fill in the blank with a connective…"),                      # ۶۲
]
for q in s20:
    q["options"] = list(POOL20)

BANKS = [
    (305, "نهایی سراسری شهریور ۱۴۰۱ — شنیداری فایل ۱: مکالمه پدر و پسر (والیبال)، درست/نادرست (ص۳۴۳)", "استاندارد", s1),
    (306, "نهایی سراسری شهریور ۱۴۰۱ — شنیداری فایل ۲: مکالمه گزارشگر و ورزشکار، تست سه‌گزینه‌ای (ص۳۴۳)", "استاندارد", s2),
    (307, "نهایی سراسری شهریور ۱۴۰۱ — شنیداری فایل ۳: مکالمه مجید و آقای ایرانمهر، کامل کنید (ص۳۴۳)", "استاندارد", s3),
    (308, "نهایی سراسری شهریور ۱۴۰۱ — شنیداری فایل ۴: متن خیابانِ تاریک، کامل کنید (ص۳۴۳)", "استاندارد", s4),
    (309, "نهایی سراسری شهریور ۱۴۰۱ — واژگان با تصویر: جملهٔ مناسب هر تصویر (ص۳۴۴)", "استاندارد", s5),
    (310, "نهایی سراسری شهریور ۱۴۰۱ — واژگان: جای خالی از بانک (ص۳۴۴)", "استاندارد", s6),
    (311, "نهایی سراسری شهریور ۱۴۰۱ — واژگان: تعریف‌های ستون B (ص۳۴۴)", "استاندارد", s7),
    (312, "نهایی سراسری شهریور ۱۴۰۱ — واژگان: شکافِ حرفی، کامل کنید (ص۳۴۴)", "استاندارد", s8),
    (313, "نهایی سراسری شهریور ۱۴۰۱ — گرامر: تست چهارگزینه‌ای (ص۳۴۵)", "استاندارد", s9),
    (314, "نهایی سراسری شهریور ۱۴۰۱ — شکل صحیح فعل، بنویسید (ص۳۴۵)", "استاندارد", s10),
    (315, "نهایی سراسری شهریور ۱۴۰۱ — مرتب‌کردن کلمات، بنویسید (ص۳۴۵)", "استاندارد", s11),
    (316, "نهایی سراسری شهریور ۱۴۰۱ — جملهٔ شرطی، کامل کنید (ص۳۴۵)", "استاندارد", s12),
    (317, "نهایی سراسری شهریور ۱۴۰۱ — ضمیر موصولی، کامل کنید (ص۳۴۵)", "استاندارد", s13),
    (318, "نهایی سراسری شهریور ۱۴۰۱ — ریدینگ انرژی خورشیدی: درست/نادرست (ص۳۴۵)", "استاندارد", s14),
    (319, "نهایی سراسری شهریور ۱۴۰۱ — ریدینگ انرژی خورشیدی: کامل کنید + پرسش پاسخ (ص۳۴۶)", "استاندارد", s15),
    (320, "نهایی سراسری شهریور ۱۴۰۱ — ریدینگ خواب: درست/نادرست + تست (ص۳۴۶)", "استاندارد", s16),
    (321, "نهایی سراسری شهریور ۱۴۰۱ — ریدینگ خواب: پرسش پاسخ (ص۳۴۶)", "استاندارد", s17),
    (322, "نهایی سراسری شهریور ۱۴۰۱ — ریدینگ فرهنگ‌لغت: درست/نادرست + تست (ص۳۴۷)", "استاندارد", s18),
    (323, "نهایی سراسری شهریور ۱۴۰۱ — ریدینگ فرهنگ‌لغت: کامل کنید (ص۳۴۷)", "استاندارد", s19),
    (324, "نهایی سراسری شهریور ۱۴۰۱ — کلمات ربط، کامل کنید (ص۳۴۷)", "استاندارد", s20),
]

# ================================================================ راستی‌آزماییِ OCR — ۱۴۰+ قطعه
PROBES = [
    # سربرگِ رسمی — شهریور ۱۴۰۱ + تاریخِ چاپی
    "مركز سنجش و پايش كيفيت آموزشي", "سراسركشور در نوبت شهریور ماه", "سال1401",
    "كلیه رشته ها", "دورۀ دوم متوسطه", "http://aee.medu.ir", "21/06/1401", "دوازدهم",
    # سربرگِ صوتی — واریانتِ چهارم: فقط Listening + پایانِ بخشِ شنیداری
    "Listening", "پايان آزمون شنیداری",
    # S1 — پدر و پسر (والیبال/بادبادک)
    "بین پدر و پسر", "They played volleyball and had a sandwich.",
    "They had taken some photographs before playing volleyball.",
    "After they had eaten lunch, they flew their kites.",
    "That was fantastic because they had bought the kites.",
    "1. (b) False", "2. (a) True", "3. (a) True", "4. (b) False",
    # S2 — گزارشگر و ورزشکار
    "خانم گزارشگر و ورزشکار", "He likes to play", "a. football", "b. basketball", "c. badminton",
    "That sport is", "a. popular", "b. special", "c. wonderful",
    "He plays that sport every", "a. week", "b. weekend", "c. Wednesday",
    "He prefers watching football", "a. offline", "b. online", "c. offline and online",
    "5. (c) badminton", "6. (a) popular", "7. (b) weekend", "8. (c) offline and online",
    # S3 — مجید و آقای ایرانمهر
    "مجید و آقای ايرانمهر", "Excuse me Mr. Iranmehr, I’d like some information about a good English dictionary.",
    "a learner’s dictionary", "is more suitable for you", "For you as a high school student, an",
    "one is OK", "Do I need a small size one?",
    "9. recommend", "10. monolingual", "11. elementary", "12. pocket",
    # S4 — خیابانِ تاریک
    "Last night, I left work", "at around 9 p.m.", "most people", "had already gone home",
    "The street was very dark and", "I hadn’t experienced such a thing", "While I was",
    "a car pulled over", "I had seen this man before", "who can it be?",
    "He waved at me and came out of the car", "He asked if he could drive me home",
    "13. late", "14. office", "15. quiet", "16. walking", "17. wondered", "18. suddenly",
    # S5 — تصویری
    "The smallest dictionary in the world needs to be read with a magnifying glass.",
    "Absence makes the heart grow fonder.",
    "Teenagers who help others are more successful in life.",
    "Wind towers in Yazd’s buildings can lower the cooling cost.",
    "Factories have polluted the air and environment.",
    "19. (d)", "20. (e)", "21. (a)", "22. (c)",
    # S6 — پول
    "identify / shouted / diary / turbine",
    "is able to generate a lot of electricity each day.",
    "To choose the best dictionary, first", "your needs.",
    "When my mother saw my score, she", "at me angrily.",
    "23. turbine", "24. identify", "25. shouted",
    # S7 — تعریف‌ها
    "I really appreciate the culture and art of Iran.",
    "I suppose we shouldn’t give up trying after a failure.",
    "Pizza contains a lot of fat.",
    "to change in a form", "to be grateful for", "to have something inside", "to think and believe",
    "26. (b)", "27. (d)", "28. (c)",
    # S8 — شکافِ حرفی
    "When Amir saw the film, he b", "into tears.", "Birds of a feather,", "together.",
    "People like to spend time with others who are similar to them",
    "29. burst", "30. flock",
    # S9 — گرامر
    "The boy …………….. you invited arrived very late.",
    "a) which", "b) whom", "c) who", "d) whose",
    "English …………….. in many countries.",
    "a) speaks", "b) is speaking", "c) is spoken", "d) has spoken",
    "His sister never behaves politely,",
    "a) does she", "b) doesn’t she", "c) does he", "d) doesn’t he",
    "Zahra …………….. chess before, so I showed her what to do.",
    "a) didn’t play", "b) wasn’t playing", "c) hasn’t played", "d) hadn’t played",
    "31. (b) whom", "32. (c) is spoken", "33. (a) does she", "34. (d) hadn’t played",
    # S10 — شکل فعل
    "The meat must …………… in a freezer.", "(to keep)",
    "I passed my final exam because I", "(to study)",
    "I don’t know the answer. If I knew the answer, I", "(to tell)",
    "kep", "had studied", "ould", "tell",
    # S11 — مرتب‌کردن
    "the teacher / had done / the students / their homework / when / came to the class / . /",
    "When the teacher came to the class, the students had done their homework.",
    "the students had done their homework when the teacher came to the class,",
    # S12 — شرطی
    "If I had a time machine,", "(travel to the future)", "travel", "future", "would",
    # S13 — موصولی
    "A Forest is a place", "who / whom / which", "داراي فعل",
    # S14 — انرژی خورشیدی
    "Solar energy is the most effective of all energy resources",
    "it can even be available in cloudy weather",
    "10,000 times greater",
    "Solar technologies can deliver heat, cooling, natural lighting, electricity, and fuels.",
    "convert sunlight into electrical energy", "solar panels or mirrors",
    "Although not all countries use solar energy, it is possible for every country.",
    "The cost of producing solar panels has surprisingly decreased",
    "cheapest form of electricity", "solar panels can work for around 30 years.",
    "In cloudy weather", "is available.", "are produced to work for a long time.",
    "What do solar technologies deliver to us?",
    "41. (b) False", "42. (b) False", "43. (a) True", "44. (b) False",
    "45. solar energy", "46. panels",
    "47. Solar technologies can deliver heat, cooling, natural lighting, electricity, and fuels.",
    # S15 — خواب
    "Sleep is essential for all people", "sleep is more important than food",
    "dies at a younger age", "Let’s say you sleep 12 hours later than you usually do",
    "three weeks to return to normal", "121 days a year",
    "A baby needs 16 hours of sleep every day",
    "A teenager needs 9 to 10 hours", "an adult needs an average of 7 to 8 hours",
    "some people need only 3 hours",
    "After age 50, the average sleep time goes down to 6.5 hours",
    "We need less sleep as we get older.",
    "Food is less important than sleep.", "There is no difference in sleep time among people.",
    "Old people need", "hours of sleep each night.",
    "A person, who does not sleep,", "than one who does not eat.",
    "How much do we sleep in our lives?",
    "48. (a) True", "49. (b) False", "50. (c) 6.5", "51. (b) lives less",
    "We / You spend", "about one-third (1/3) of our lives in sleep.",
    # S16 — فرهنگ‌لغت
    "Looking up words you don't know can be difficult",
    "which definition to choose when you open a dictionary",
    "how an English dictionary is compiled",
    "Guess the meaning of the word based on the context before looking it up",
    "Identify the part of speech", "prefixes, suffixes or roots",
    "now it is the time to take out the dictionary",
    "There are different types of dictionaries available",
    "online dictionaries, learner’s dictionaries, bilingual dictionaries, and monolingual dictionaries",
    "After looking the word up, try to guess it.",
    "The information around the words helps you guess their meanings.",
    "Dictionary helps you", "to improve reading understanding",
    "What does “it” in paragraph one refer to",
    "a. word", "b. dictionary", "c. context", "d. meaning",
    "The part of speech helps you find", "According to the passage, we use a dictionary when",
    "53. (b) False", "54. (a) True", "55. (d) to improve reading understanding", "56. (a) word",
    "57. the meaning of the word.", "are missing important information", "still conf", "used or think",
    # S17 — ربط
    "(and, or, but, so)", "You lost the game!", "if you want to succeed, you have to practice more.",
    "You can take a bus,", "you can take a taxi.",
    "I went to the whiteboard,", "I wrote the topic of the new lesson.",
    "My brother is a rich man,", "my sister is poor.",
    "59. so", "60. or", "61. and", "62. but",
    # ردیف‌های استخراج‌نشده (Topic/پاراگرافِ Water — بارمِ اصولی)
    "Topic sentence", "Nearly 70 percent of our body", "Be important for living things",
    "Generate electricity",
    # راهنمای تصحیح + پایانِ جزوه
    "راهنمای تصحیح امتحان", "جمع نمره40", "نمره موفق باشید40",
]
for p in PROBES:
    require(ocr_has(p), f"OCR probe missing: {p[:70]}")

ALL_QS = [q for _, _, _, qs in BANKS for q in qs]
require(len(ALL_QS) == 62, f"total questions {len(ALL_QS)} != 62")

# داوریِ دومِ مستقل — کلیدهای حرفی در SECOND با استخرِ گزینه‌ها
LETTER_KEYS = {
    "g12-fin1401shr-l2m1": ("abc", "c"), "g12-fin1401shr-l2m2": ("abc", "a"),
    "g12-fin1401shr-l2m3": ("abc", "b"), "g12-fin1401shr-l2m4": ("abc", "c"),
    "g12-fin1401shr-pic1": ("abcde", "d"), "g12-fin1401shr-pic2": ("abcde", "e"),
    "g12-fin1401shr-pic3": ("abcde", "a"), "g12-fin1401shr-pic4": ("abcde", "c"),
    "g12-fin1401shr-def1": ("abcd", "b"), "g12-fin1401shr-def2": ("abcd", "d"),
    "g12-fin1401shr-def3": ("abcd", "c"),
    "g12-fin1401shr-g1": ("abcd", "b"), "g12-fin1401shr-g2": ("abcd", "c"),
    "g12-fin1401shr-g3": ("abcd", "a"), "g12-fin1401shr-g4": ("abcd", "d"),
    "g12-fin1401shr-r2m1": ("abcd", "c"), "g12-fin1401shr-r2m2": ("abcd", "b"),
    "g12-fin1401shr-r3m1": ("abcd", "d"), "g12-fin1401shr-r3m2": ("abcd", "a"),
}
for qid, (pool, letter) in LETTER_KEYS.items():
    q = next(x for x in ALL_QS if x["id"] == qid)
    require(q["kind"] == "mcq", f"{qid} must be mcq")
    require(q["answer"] == pool.index(letter), f"{qid}: answer {q['answer']} != guide letter {letter}")

# درست/نادرست — کلیدهای چاپیِ b/a/a/b و b/b/a/b و a/b و b/a
TF_KEYS = {
    "g12-fin1401shr-l1tf1": "b", "g12-fin1401shr-l1tf2": "a", "g12-fin1401shr-l1tf3": "a", "g12-fin1401shr-l1tf4": "b",
    "g12-fin1401shr-r1tf1": "b", "g12-fin1401shr-r1tf2": "b", "g12-fin1401shr-r1tf3": "a", "g12-fin1401shr-r1tf4": "b",
    "g12-fin1401shr-r2tf1": "a", "g12-fin1401shr-r2tf2": "b",
    "g12-fin1401shr-r3tf1": "b", "g12-fin1401shr-r3tf2": "a",
}
for qid, letter in TF_KEYS.items():
    q = next(x for x in ALL_QS if x["id"] == qid)
    require(q["options"] == ["True", "False"], f"{qid}: not a True/False item")
    require(q["answer"] == (0 if letter == "a" else 1), f"{qid}: TF answer != printed {letter}")

# کلیدهای تایپی — هر accepted باید در راهنما ریشهٔ چاپی داشته باشد
TYPED_KEYS = {
    "g12-fin1401shr-l3q1": ["recommend"], "g12-fin1401shr-l3q2": ["monolingual"],
    "g12-fin1401shr-l3q3": ["elementary"], "g12-fin1401shr-l3q4": ["pocket"],
    "g12-fin1401shr-l4q1": ["late"], "g12-fin1401shr-l4q2": ["office"],
    "g12-fin1401shr-l4q3": ["quiet"], "g12-fin1401shr-l4q4": ["walking"],
    "g12-fin1401shr-l4q5": ["wondered"], "g12-fin1401shr-l4q6": ["suddenly"],
    "g12-fin1401shr-pool1": ["turbine"], "g12-fin1401shr-pool2": ["identify"],
    "g12-fin1401shr-pool3": ["shouted"],
    "g12-fin1401shr-ok1": ["burst"], "g12-fin1401shr-ok2": ["flock"],
    "g12-fin1401shr-vf1": ["be kept"], "g12-fin1401shr-vf2": ["had studied"],
    "g12-fin1401shr-vf3": ["would tell"],
    "g12-fin1401shr-ws1": ["the teacher came to the class"],
    "g12-fin1401shr-cnd1": ["would travel to the future"],
    "g12-fin1401shr-rel1": ["which"],
    "g12-fin1401shr-r1q1": ["solar energy"], "g12-fin1401shr-r1q2": ["panels"],
    "g12-fin1401shr-r1q3": ["Solar technologies can deliver"],
    "g12-fin1401shr-r2q1": ["spend about one-third"],
    "g12-fin1401shr-r3q1": ["the meaning of the word"],
    "g12-fin1401shr-r3q2": ["still confused or think we are missing important information"],
    "g12-fin1401shr-conn1": ["so"], "g12-fin1401shr-conn2": ["or"],
    "g12-fin1401shr-conn3": ["and"], "g12-fin1401shr-conn4": ["but"],
}
for qid, keys in TYPED_KEYS.items():
    q = next(x for x in ALL_QS if x["id"] == qid)
    require(q["kind"] == "typed", f"{qid} must be typed")
    for k in keys:
        require(any(k in a for a in q["accepted"]), f"{qid}: accepted lacks printed key variant {k[:40]}")

# ساقه‌های تایپی — هر نیمه باید در OCR ریشه داشته باشد
for qid in ["g12-fin1401shr-l3q1", "g12-fin1401shr-l3q2", "g12-fin1401shr-l3q3", "g12-fin1401shr-l3q4",
            "g12-fin1401shr-l4q1", "g12-fin1401shr-l4q2", "g12-fin1401shr-l4q3", "g12-fin1401shr-l4q4",
            "g12-fin1401shr-l4q5", "g12-fin1401shr-l4q6",
            "g12-fin1401shr-ok1", "g12-fin1401shr-ok2", "g12-fin1401shr-vf1", "g12-fin1401shr-vf2",
            "g12-fin1401shr-vf3", "g12-fin1401shr-ws1", "g12-fin1401shr-cnd1", "g12-fin1401shr-rel1",
            "g12-fin1401shr-r1q1", "g12-fin1401shr-r1q2", "g12-fin1401shr-r1q3",
            "g12-fin1401shr-r2q1", "g12-fin1401shr-r3q1", "g12-fin1401shr-r3q2",
            "g12-fin1401shr-conn1", "g12-fin1401shr-conn2", "g12-fin1401shr-conn3", "g12-fin1401shr-conn4"]:
    q = next(x for x in ALL_QS if x["id"] == qid)
    require(ocr_has_stem(q["question"]), f"{qid}: stem not OCR-rooted: {q['question'][:60]}")

# کلیدِ دولایهٔ اسلش‌دارِ ۵۲ — دو واریانتِ We/You باید هر دو در accepted باشند
r2q1 = next(x for x in ALL_QS if x["id"] == "g12-fin1401shr-r2q1")
require(any(a.startswith("We spend") for a in r2q1["accepted"]), "r2q1: We variant missing")
require(any(a.startswith("You spend") for a in r2q1["accepted"]), "r2q1: You variant missing")
# scrambleِ ۳۸ — دو واریانتِ چاپی
ws1 = next(x for x in ALL_QS if x["id"] == "g12-fin1401shr-ws1")
require(len(ws1["accepted"]) == 2, "ws1: must carry both printed variants")

# ================================================================ تزریق (idempotent — خروجیِ ناقصِ رانِ قبلی پاک می‌شود)
data = json.loads(BANK_PATH.read_text(encoding="utf-8"))
data["lessons"] = [l for l in data["lessons"] if l["lesson"] < 305]
data["source"].pop("final1401shr", None)
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

require(data["lessons"][-1]["lesson"] == 304, f"family tail is {data['lessons'][-1]['lesson']}, expected 304")
require([l["lesson"] for l in new_lessons] == list(range(305, 325)), "lesson numbers must be 305..324")
require(total_new == 62, f"total new items {total_new} != 62")

data["lessons"].extend(new_lessons)

data["source"]["final1401shr"] = {
    "pages": "343-347",
    "keyPages": "348-349",
    "titlePrinted": "آزمون نهایی انگلیسی دوازدهم — نوبت شهریور ماه سال ۱۴۰۱، رسمیِ سراسریِ کلیهٔ رشته‌ها، مرکز سنجش و پایش کیفیت آموزشی (aee.medu.ir)، تاریخ ۲۱/۰۶/۱۴۰۱، ۵ صفحه، جمع نمره ۴۰ — شانزدهمین و واپسین نوبتِ خانواده، هشتمین نوبتِ منبعِ رسمی؛ صفحهٔ ۳۴۹ واپسین صفحهٔ جزوه است",
    "sections": 19,
    "banks": 20,
    "questions": 62,
    "keys": 62,
    "extractedRound": 307,
    "branchVariant": "شانزدهمین و واپسین نوبتِ سریِ دی۹۷ تا شهریور۱۴۰۱ — هشتمین نوبتِ منبعِ رسمی: رکوردِ آیتم (۶۲ در برابرِ ۵۳ِ r306) + کلیدِ دولایهٔ اسلش‌دارِ فاعلیِ ۵۲ (We / You spend) + بازسازیِ کلیدِ ۵۸ از قطعاتِ RTL + ششمین بانکِ سه‌گزینه‌ایِ شنیداری + چهارمین اضافهٔ تصویریِ (b) دوم‌جای + بازگوییِ اول‌شخصِ داستانِ مایک/جانِ r306 در شنیداری + ارتقای پاراگرافِ Solar energy (بارمِ اصولیِ r306) به ریدینگِ کاملِ ۷ آیتمی + کلیدهای تازهٔ محضِ be kept / would tell / had studied(تایپی) / scrambleِ دوواریانته.",
    "audioFilesAbsent": True,
    "openWritingAbsent": {"items": "۶۳-۶۵ (Topic sentence برای Iran/Books/Computer) و ۶۶ (پاراگرافِ Water با داده‌های چاپی Nearly 70 percent of our body / Be important for living things / Generate electricity)", "reason": "راهنما فقط بارمِ اصولی می‌دهد — الگوی r296-r306؛ پوششِ کلید: ۶۲/۶۶"},
    "receipts": [
        "واپسین نوبتِ سری: صفحهٔ ۳۴۹ واپسین صفحهٔ جزوه است («جمع نمره 40» + «با آرزوی سلامتی») — سریِ دی۹۷ تا شهریور۱۴۰۱ با ۱۶ نوبت بسته شد؛ پیش‌بینیِ handoff چهارمین بار پیاپی درست بود",
        "رکوردِ آیتم: ۶۲ آیتم در ۲۰ بانک (پیشتر ۵۳/۲۰ در r306)؛ کلیدِ چاپیِ آیتم‌به‌آیتمِ کامل برای همهٔ ۶۲ (فقط ۶۳-۶۶ اصولی)",
        "کلیدِ دولایهٔ اسلش‌دارِ فاعلیِ ۵۲ «We / You spend about one-third (1/3) of our lives in sleep.» با بارم (0/25)+(0/75) — سومین اسلش‌دولایهٔ خانواده (r304 had got/gotten، r306 these/those shoes)؛ این‌بار اسلش میانِ دو فاعل است",
        "بازسازیِ کلیدِ ۵۸ «we are still confused or think we are missing important information» از قطعاتِ RTL چاپی (used or think / still conf / are / we) — دومین وقوعِ الگوی r305-47",
        "ششمین بانکِ سه‌گزینه‌ایِ شنیداری (گزارشگر/ورزشکار: c/a/b/c)؛ چهارمین اضافهٔ تصویریِ (b) دوم‌جای (r302/r304/r306) و نخستین اضافهٔ تعریف‌ها با جایگاهِ اول (a)",
        "متنِ خیابانِ تاریک (ص۳۴۳) بازگوییِ اول‌شخصِ داستانِ مایک/جانِ r306 (ص۳۳۹) است: six stems موازی با کلیدهای late/office/quiet/walking/wondered/suddenly — همان خطِ داستانی، دو بازیِ متفاوت",
        "ارتقای بارمِ اصولی به قابلِ بازی: پاراگرافِ Solar energy که در r306 فقط برای پاراگراف‌نویسی بود، این‌جا ریدینگِ کامل با ۷ آیتم (۴۱-۴۷) و جملهٔ کلیدیِ ۴۷ «Solar technologies can deliver heat, cooling, natural lighting, electricity, and fuels.»",
        "کلیدهای تازهٔ محض (۰ برخورد در خانواده): be kept (مجهولِ مدرکی)، would tell (شرطیِ نوع دوم)، had studied (نخستین تایپی؛ l87 فقط MCQ بود)، scrambleِ ۳۸ با دو واریانتِ چاپی «یا»، ضرب‌المثلِ Birds of a feather نخستین‌بار شکاف‌حرفی (شکلِ کاملِ l136 موجود)",
        "خویشاوندی‌های خانواده: refer-to سومین وقوع (r302-r1m2 «them»، r306، این‌جا «it» با کلیدِ word)؛ A Forest is a place خویشاوندِ A doctor (l296) و garage/factory/cinema (l18-20)؛ burst نخستین‌بار با شکاف روی خودِ فعل (l87 شکاف روی into)؛ monolingual نخستین‌بار تایپی (l67 MCQ)؛ sentence-عامِ rich man خویشاوندِ l3 با ساقهٔ متفاوت",
        "وفاداری‌های چاپی: F بزرگِ «A Forest»، «I hadn’t experienced such a thing» با I بزرگ در میانهٔ جمله، «9 p.m.»، «(1/3)»، «who can it be?» با can (نه could)، شماره‌گذاریِ پرانتزدارِ ……(13)……-……(18)……، سربرگِ صوتیِ «Listening» — واریانتِ چهارم پس از PDF/MP3",
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
