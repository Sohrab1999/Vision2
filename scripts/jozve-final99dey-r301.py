#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r301 — آزمون نهایی دی ۱۳۹۹، رسمیِ سراسریِ کلیهٔ رشته‌ها (مرکز سنجش aee.medu.ir — بدنه ص۳۰۱-۳۰۵، راهنمای تصحیح ص۳۰۶-۳۰۷)
دهمین نوبتِ «آزمون‌های نهایی دی ۹۷ تا شهریور ۱۴۰۱» — سربرگِ تاریخ حاکم (درس r297): ۰۱/۱۱/۹۹ = دی ۱۳۹۹.
کشف‌های راند:
(۱) دومین نوبتِ منبعِ رسمیِ خانواده (پس از r299) و نخستین نوبتِ رسمیِ با کلیدِ تقریباً کامل: ۶۱ از ۶۲ آیتمِ چاپی کلیدِ صریح دارد —
تنها ۶۲ (پاراگرافِ Solar system) بارمِ اصولی دارد (الگوی r296/r297/r299).
(۲) تمامِ بخشِ شنیداری از چاپ قابلِ بازی است: هر دو مکالمه (۸-۱۷) و پرسشِ پاسخِ باز (۱۸-۱۹) کلیدِ جمله‌کاملِ چاپی دارند.
(۳) یادداشتِ چاپیِ «اشاره به کلمه نیز کافی است و بدون در نظر گرفتن املای صحیح و کامل نیز نمره لحاظ گردد» برای هر دو بخشِ
مکالمه (۳ و ۴) در راهنما — سندِ رسمیِ اغماضِ املای راهنمای تصحیح.
(۴) مرتب‌کردنِ شش‌جمله‌ایِ پاراگراف (۵۶-۶۱) — نخستین رتبه‌بندیِ شش‌اسلاتیِ خانواده (r296/r299/r300 چهاراسلاتی بودند).
(۵) اضافهٔ گزینه‌ای در جای نخست: واژگانِ تصویری اضافهٔ (a) دارد — r299/r300 اضافه‌شان (e) در جای آخر بود.
۱۸ بانک / ۶۱ آیتم — خانوادهٔ موضوعی هفدهم: ۱۱۶۶ + ۶۱ = ۱۲۲۷ تست در ۲۰۸ بانک.
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
    s = re.sub(r"[\"'`´‘’“”«»˝\u02DD\u030B]", "", s)  # ˝/آکسانِ ترکیبی — الگوی r300
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
    """ساقه با خالیِ میانی: هر نیمه جداگانه راستی‌آزمایی می‌شود (الگوی r299-r300)"""
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

# ---------------------------------------------------------------- S1 شنیداری فایل ۱ (ص۳۰۱) — کلید a/b/d
s1 = [
    q_mcq("g12-fin99dey-l1m1", 1, "Who are our elders?",
          ["mothers and fathers", "fathers", "mothers", "doctors"], 0),  # ۱ → (a)
    q_mcq("g12-fin99dey-l1m2", 2,
          "A: What do our elders teach us? B: They teach us how to --------------- .",
          ["accept and learn", "love and care", "forgive and remember", "learn an answer"], 1),  # ۲ → (b)
    q_mcq("g12-fin99dey-l1m3", 3,
          "We have a responsibility to learn from their --------------- .",
          ["pain", "situation", "wish", "wisdom"], 3),  # ۳ → (d)
]
# ---------------------------------------------------------------- S2 شنیداری فایل ۲: درست/نادرست (ص۳۰۱) — کلید B/A/B/B
s2 = [
    q_tf("g12-fin99dey-l2tf1", 1, "He could get in the plane on time.", 1),          # False (B)
    q_tf("g12-fin99dey-l2tf2", 2, "He had left his passport at home.", 0),           # True (A)
    q_tf("g12-fin99dey-l2tf3", 3, "He didn`t have to come back home.", 1),           # False (B) — بک‌تیکِ چاپی
    q_tf("g12-fin99dey-l2tf4", 4, "He is always a forgetful person.", 1),            # False (B)
]
# ---------------------------------------------------------------- S3 شنیداری فایل ۳: مکالمهٔ توربین بادی (ص۳۰۱) — شماره‌گذاریِ چاپی …8… — کلید generated/opposite/clean/remind
s3 = [
    q_typed("g12-fin99dey-l3q1", 1,
            "I know electricity can be produced from water and sunlight. How might it be …8…--------------- from wind?",
            ["generated"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99dey-l3q2", 2,
            "Well, a wind turbine works the …9…--------------- of a fan.",
            ["opposite"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99dey-l3q3", 3,
            "It is a type of …10…--------------- energy.",
            ["clean"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99dey-l3q4", 4,
            "These wind turbines …11…--------------- me of what I read about using wind power in Yazd’s buildings.",
            ["remind"], "fill in the blank with the missing word…"),
]
# ---------------------------------------------------------------- S4 شنیداری فایل ۴: مکالمهٔ برنامه‌های تلویزیون (ص۳۰۱) — …12… تا …17… — کلید worst/choose/terrible/right/teenagers/enjoy
s4 = [
    q_typed("g12-fin99dey-l4q1", 1,
            "The programs on TV these days are the …12…--------------- .",
            ["worst"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99dey-l4q2", 2,
            "Even with the hundred channels to …13…--------------- from,",
            ["choose"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99dey-l4q3", 3,
            "everything is …14…--------------- .",
            ["terrible"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99dey-l4q4", 4,
            "You're …15…--------------- about that!",
            ["right"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99dey-l4q5", 5,
            "I think it is because most TV programs are written for …16…--------------- .",
            ["teenagers"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99dey-l4q6", 6,
            "There is nothing for older people to …17…--------------- .",
            ["enjoy"], "fill in the blank with the missing word…"),
]
# ---------------------------------------------------------------- S5 شنیداری فایل ۵: پرسش پاسخ (ص۳۰۱) — کلیدِ جمله‌کاملِ چاپی
s5 = [
    q_typed("g12-fin99dey-l5q1", 1,
            "Where would he go if it were sunny?",
            ["He would go to the park."], "answer with a full sentence…"),
    q_typed("g12-fin99dey-l5q2", 2,
            "What can they do, instead?",
            ["They can play one of their thinking games."], "answer with a full sentence…"),
]
# ---------------------------------------------------------------- S6 واژگان با تصویر (ص۳۰۲) — پنج جملهٔ چاپی با اضافهٔ (a) — نخستین بار اضافه در جای نخست؛ کلید b/e/d/c
PIC_INSTR = "با توجه به تصاویر داده‌شده، جملهٔ مناسب برای هر تصویر را انتخاب کنید. (یک جمله اضافی است)"
PIC_OPTS = [
    "My little sister sits on my mother’s lap all the time.",
    "Hamid sits on the sofa and watches TV all the time.",
    "Try to avoid foods that contain a lot of fat.",
    "Oil, coal and natural gas are three common fossil fuels.",
    "I have kept a diary for twelve years.",
]
s6 = [
    q_mcq("g12-fin99dey-pic1", 1, PIC_INSTR, PIC_OPTS, 1),  # ۲۰ → (b) sofa/TV
    q_mcq("g12-fin99dey-pic2", 2, PIC_INSTR, PIC_OPTS, 4),  # ۲۱ → (e) diary
    q_mcq("g12-fin99dey-pic3", 3, PIC_INSTR, PIC_OPTS, 3),  # ۲۲ → (d) fossil fuels
    q_mcq("g12-fin99dey-pic4", 4, PIC_INSTR, PIC_OPTS, 2),  # ۲۳ → (c) fat
]
# ---------------------------------------------------------------- S7 واژگان: بانک چهارتایی چاپی (ص۳۰۲) — dedicated/replaced/forgive/recommend (اضافه: forgive)؛ کلید dedicated/recommend/replaced
POOL_OPTS = ["dedicated", "replaced", "forgive", "recommend"]
s7 = [
    q_typed("g12-fin99dey-pool1", 1,
            "A: Mrs. Ahmadi is very friendly and helpful. B: I know! She is known as a --------------- teacher, too.",
            ["dedicated"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99dey-pool2", 2,
            "A: What kind of dictionary do you --------------- ? B: A learner’s dictionary.",
            ["recommend"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99dey-pool3", 3,
            "Her sister carefully --------------- the china plate on the shelf.",
            ["replaced"], "fill in the blank with the missing word…"),
]
for q in s7:
    q["options"] = list(POOL_OPTS)  # داربست = بانکِ کاملِ چاپی (الگوی r296-r300)
# ---------------------------------------------------------------- S8 واژگان: تعریف‌های ستون B (ص۳۰۲) — اضافه در (b) جای دوم؛ کلید c/d/a
DEFB_INSTR = "برای هر کلمهٔ مشخص‌شده از ستون A یک تعریف از ستون B انتخاب کنید. (در ستون B یک تعریف اضافی است.)"
DEFB_OPTS = [
    "the amount of a product or service that people want",
    "the part at the beginning of a book that gives a general idea of what it is about",
    "be grateful for",
    "take something in, especially gradually",
]
s8 = [
    q_mcq("g12-fin99dey-def1", 1, DEFB_INSTR, DEFB_OPTS, 2),  # ۲۷ → (c) be grateful for
    q_mcq("g12-fin99dey-def2", 2, DEFB_INSTR, DEFB_OPTS, 3),  # ۲۸ → (d) take something in
    q_mcq("g12-fin99dey-def3", 3, DEFB_INSTR, DEFB_OPTS, 0),  # ۲۹ → (a) amount people want
]
# ---------------------------------------------------------------- S9 واژگان: کامل‌کردن از دانش خود (ص۳۰۲) — شکافِ حرفیِ چاپی s-/w- — کلید symbol/worm
s9 = [
    q_typed("g12-fin99dey-ok1", 1,
            "I think O is the s --------------- for Oxygen. I am not sure!",
            ["symbol"], "start with the printed first letter s…"),
    q_typed("g12-fin99dey-ok2", 2,
            "I always try to wake up and start work early because I know that “the early bird catches the w ---------------.”",
            ["worm"], "start with the printed first letter w…"),
]
# ---------------------------------------------------------------- S10 گرامر: تست چهارگزینه‌ای (ص۳۰۳) — کلید b/c/a/b
s10 = [
    q_mcq("g12-fin99dey-g1", 1,
          "Your sister has passed the exam, ---------------?",
          ["didn’t she", "hasn’t she", "didn’t you", "has she"], 1),
    q_mcq("g12-fin99dey-g2", 2,
          "A: Are you writing the letter to your father? B: No, My brother is writing the letter --------------- I will send to my father tomorrow.",
          ["where", "who", "which", "whom"], 2),
    q_mcq("g12-fin99dey-g3", 3,
          "The traffic rules --------------- very carefully by everyone.",
          ["must be obeyed", "should obey", "are obeying", "has been obeyed"], 0),
    q_mcq("g12-fin99dey-g4", 4,
          "My parents --------------- healthier if they lived in a village.",
          ["can be", "would be", "are", "must be"], 1),
]
# ---------------------------------------------------------------- S11 شکل صحیح فعل (ص۳۰۳) — راهنمای پرانتزیِ چاپی (study)/(speak)؛ کلید had studied/is spoken؛ «china» کوچکِ چاپی وفادار
s11 = [
    q_typed("g12-fin99dey-vf1", 1,
            "Joe --------------- Chinese before he moved to china. (study)",
            ["had studied"], "شکل صحیح فعلِ داخل پرانتز را بنویسید…"),
    q_typed("g12-fin99dey-vf2", 2,
            "Persian --------------- in Iran, Tajikistan and Afghanistan. (speak)",
            ["is spoken"], "شکل صحیح فعلِ داخل پرانتز را بنویسید…"),
]
# ---------------------------------------------------------------- S12 مرتب‌کردن کلمات (ص۳۰۳) — کلیدهای جمله‌کاملِ چاپی؛ بارمِ (0.25)×۴ و (0.5)(0.5) در رسید
s12 = [
    q_typed("g12-fin99dey-ws1", 1,
            "had gotten / was / a bad score / she / Mina / upset / because / . /",
            ["Mina was upset because she had gotten a bad score."],
            "جملهٔ مرتب‌شده را کامل بنویسید…"),
    q_typed("g12-fin99dey-ws2", 2,
            "fix / the car / if / were / John / at home / could / he / . /",
            ["John could fix the car if he were at home."],
            "جملهٔ مرتب‌شده را کامل بنویسید…"),
]
# ---------------------------------------------------------------- S13 ریدینگ فرهنگ‌لغت (ص۳۰۳) — کلید True/False/a/d
s13 = [
    q_tf("g12-fin99dey-r1tf1", 1, "A dictionary is the basic thing for any language class.", 0),      # True
    q_tf("g12-fin99dey-r1tf2", 2, "Students must have more than four dictionaries to learn English", 1),  # False — بدونِ علامتِ پرسشِ چاپی
    q_mcq("g12-fin99dey-r1m1", 3,
          "What is the main idea of the text?",
          ["Dictionaries are essential for language learning.",
           "Bilingual dictionaries are the most important types of dictionaries.",
           "All of the students cannot figure out what they read.",
           "Monolingual dictionaries are the most expensive dictionaries."], 0),  # (a)
    q_mcq("g12-fin99dey-r1m2", 4,
          "What does the underlined word “they” in paragraph 2 refer to?",
          ["problems", "teachers", "dictionaries", "students"], 3),  # (d)
]
s13q = [
    q_typed("g12-fin99dey-r1q1", 1,
            "When should teachers clear up students’ confusion?",
            ["Quickly before they jump into to the next lesson."],
            "answer with a full sentence…"),
    q_typed("g12-fin99dey-r1q2", 2,
            "What must the students have when they enter a more advanced level",
            ["They must have a native language dictionary."],
            "answer with a full sentence…"),
]
# ---------------------------------------------------------------- S14 ریدینگ پیکاسو (ص۳۰۴) — کلید False/True/c/d + world/creating؛ «Picasso' first paining» چاپی وفادار
s14 = [
    q_tf("g12-fin99dey-r2tf1", 1, "Picasso was a famous French artist during the 18th century.", 1),  # False
    q_tf("g12-fin99dey-r2tf2", 2, "Picasso was also very skillful in painting when he was young.", 0),  # True
    q_mcq("g12-fin99dey-r2m1", 3,
          "The underlined word “He” in the second line refers to --------------- .",
          ["Picasso", "his son", "Picasso’s father", "the teacher"], 2),  # (c)
    q_mcq("g12-fin99dey-r2m2", 4,
          "It took --------------- for Picasso to finish his exam to attend the Art school in Barcelona.",
          ["a few years", "more than a day", "only one month", "one day"], 3),  # (d)
]
s14c = [
    q_typed("g12-fin99dey-r2c1", 1,
            "Artists from everywhere in the --------------- came to Paris to see Picasso’ first paining in modern Art.",
            ["world"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99dey-r2c2", 2,
            "Picasso is famous for --------------- the Cubism Style.",
            ["creating"], "fill in the blank with the missing word…"),
]
# ---------------------------------------------------------------- S15 کلمات ربط (ص۳۰۵) — کلید but/so/and/or؛ ویرگولِ پیشینِ فاصله‌دارِ ۵۳ چاپی وفادار
CONN_POOL = ["but", "and", "so", "or"]
s15 = [
    q_typed("g12-fin99dey-conn1", 1,
            "Sepideh likes spaghetti, --------------- her grandmother hates spaghetti.",
            ["but"], "fill in the blank with a connective…"),
    q_typed("g12-fin99dey-conn2", 2,
            "These shoes are not comfortable , --------------- I will not buy them.",
            ["so"], "fill in the blank with a connective…"),
    q_typed("g12-fin99dey-conn3", 3,
            "He went to the restaurant --------------- ordered food.",
            ["and"], "fill in the blank with a connective…"),
    q_typed("g12-fin99dey-conn4", 4,
            "We can go by bus, --------------- we can take a taxi.",
            ["or"], "fill in the blank with a connective…"),
]
for q in s15:
    q["options"] = list(CONN_POOL)
# ---------------------------------------------------------------- S16 مرتب‌کردن جمله‌های پاراگراف کانادا (ص۳۰۵) — شش‌اسلاتیِ نخستِ خانواده؛ کلید c/f/a/b/d/e
s16 = [
    q_typed("g12-fin99dey-ord1", 1,
            "جملهٔ نخست (Topic) پاراگراف کانادا را بنویسید.",
            ["There are several reasons why Canada is one of the best countries in the world."],
            "جملهٔ پاراگراف را کامل بنویسید…"),
    q_typed("g12-fin99dey-ord2", 2,
            "جملهٔ دوم پاراگراف کانادا را بنویسید.",
            ["First, Canada has an excellent health care system."],
            "جملهٔ پاراگراف را کامل بنویسید…"),
    q_typed("g12-fin99dey-ord3", 3,
            "جملهٔ سوم پاراگراف کانادا را بنویسید.",
            ["Therefore, many patients are easily cured in hospitals in Canada."],
            "جملهٔ پاراگراف را کامل بنویسید…"),
    q_typed("g12-fin99dey-ord4", 4,
            "جملهٔ چهارم پاراگراف کانادا را بنویسید.",
            ["Second, it has a high standard of education for young people."],
            "جملهٔ پاراگراف را کامل بنویسید…"),
    q_typed("g12-fin99dey-ord5", 5,
            "جملهٔ پنجم پاراگراف کانادا را بنویسید.",
            ["In addition, there are many chances for them to get a good job."],
            "جملهٔ پاراگراف را کامل بنویسید…"),
    q_typed("g12-fin99dey-ord6", 6,
            "جملهٔ پایانی (Concluding) پاراگراف کانادا را بنویسید.",
            ["As a result, many people like to live in Canada."],
            "جملهٔ پاراگراف را کامل بنویسید…"),
]

BANKS = [
    (191, "نهایی سراسری دی ۹۹ — شنیداری فایل ۱: تست (ص۳۰۱)", "استاندارد", s1),
    (192, "نهایی سراسری دی ۹۹ — شنیداری فایل ۲: درست/نادرست (ص۳۰۱)", "استاندارد", s2),
    (193, "نهایی سراسری دی ۹۹ — شنیداری فایل ۳: مکالمهٔ توربین بادی، کامل کنید (ص۳۰۱)", "آموزشی — ورود آزاد", s3),
    (194, "نهایی سراسری دی ۹۹ — شنیداری فایل ۴: مکالمهٔ برنامه‌های تلویزیون، کامل کنید (ص۳۰۱)", "آموزشی — ورود آزاد", s4),
    (195, "نهایی سراسری دی ۹۹ — شنیداری فایل ۵: پرسش پاسخ (ص۳۰۱)", "آموزشی — ورود آزاد", s5),
    (196, "نهایی سراسری دی ۹۹ — واژگان با تصویر: جملهٔ مناسب هر تصویر (ص۳۰۲)", "استاندارد", s6),
    (197, "نهایی سراسری دی ۹۹ — واژگان: جای خالی از بانک (ص۳۰۲)", "آموزشی — ورود آزاد", s7),
    (198, "نهایی سراسری دی ۹۹ — واژگان: تعریف‌های ستون B (ص۳۰۲)", "استاندارد", s8),
    (199, "نهایی سراسری دی ۹۹ — واژگان: کامل‌کردن از دانش خود (ص۳۰۲)", "آموزشی — ورود آزاد", s9),
    (200, "نهایی سراسری دی ۹۹ — گرامر: تست چهارگزینه‌ای (ص۳۰۳)", "استاندارد", s10),
    (201, "نهایی سراسری دی ۹۹ — شکل صحیح فعل، بنویسید (ص۳۰۳)", "آموزشی — ورود آزاد", s11),
    (202, "نهایی سراسری دی ۹۹ — مرتب‌کردن کلمات، بنویسید (ص۳۰۳)", "آموزشی — ورود آزاد", s12),
    (203, "نهایی سراسری دی ۹۹ — ریدینگ فرهنگ‌لغت: درست/نادرست + تست (ص۳۰۳)", "استاندارد", s13),
    (204, "نهایی سراسری دی ۹۹ — ریدینگ فرهنگ‌لغت: پرسش پاسخ (ص۳۰۴)", "آموزشی — ورود آزاد", s13q),
    (205, "نهایی سراسری دی ۹۹ — ریدینگ پیکاسو: درست/نادرست + تست (ص۳۰۴)", "استاندارد", s14),
    (206, "نهایی سراسری دی ۹۹ — ریدینگ پیکاسو: کامل کنید (ص۳۰۴)", "آموزشی — ورود آزاد", s14c),
    (207, "نهایی سراسری دی ۹۹ — کلمات ربط، کامل کنید (ص۳۰۵)", "آموزشی — ورود آزاد", s15),
    (208, "نهایی سراسری دی ۹۹ — مرتب‌کردن جمله‌های پاراگراف، بنویسید (ص۳۰۵)", "آموزشی — ورود آزاد", s16),
]

# ================================================================ راستی‌آزماییِ OCR (وفاداریِ بدنه ص۳۰۱-۳۰۵)
SKIP_PREFIXES = ("با توجه به", "برای هر کلمهٔ", "جملهٔ")
for lid, _title, _level, qs in BANKS:
    for q in qs:
        if q["question"].startswith(SKIP_PREFIXES):
            pass  # دستورالعملِ فارسیِ درون‌اپ — الگوی r296-r300؛ گزینه‌ها/کلیدها جداگانه راستی‌آزمایی می‌شوند
        else:
            require(ocr_has_stem(q["question"]), f"stem not in OCR: {q['id']} :: {q['question'][:70]}")
        if q.get("kind") == "mcq" and q["options"] not in (["True", "False"],):
            for opt in q["options"]:
                require(ocr_has(opt), f"option not in OCR: {q['id']} :: {opt[:60]}")

# ================================================================ کلیدهای راهنمای تصحیح (ص۳۰۶-۳۰۷) — راستی‌آزماییِ قطعه‌کلیدها
GUIDE_FRAGMENTS = [
    "1. ( a )", "2. ( b )", "3. ( d )",
    "4. False (B)", "5. True (A)", "6. False (B)", "7. False (B)",
    "8. generated", "9. opposite", "10. clean", "11. remind",
    "12. worst", "13. choose", "14. terrible", "15. right", "16. teenagers", "17. enjoy",
    "18. He would go to the park.", "19. They can play one of their thinking games.",
    "20. (b)", "21.(e)", "22. (d)", "23. (c)",
    "24. dedicated", "25. recommend", "26. replaced",
    "27. (c)", "28. (d)", "29. (a)",
    "30. symbol", "31. worm",
    "32. (b)", "33. (c)", "34. (a)", "35. (b)",
    "36. had studied", "37. is spoken",
    "38. Mina was upset because she had gotten a bad score.",
    "39. John could fix the car if he were at home.",
    "40. (a) True", "41. (b) False", "42. ( a )", "43. ( d )",
    "44. Quickly before they jump into to the next lesson.",
    "45. They must have a native language dictionary.",
    "46. (b) False", "47. (a) True", "48. ( c )", "49. ( d )",
    "50. world", "51. creating",
    "52. but", "53. so", "54. and", "55. or",
    "(c) There are several reasons why Canada is one of the best countries in the world.",
    "(f) First, Canada has an excellent health care system.",
    "(a) Therefore, many patients are easily cured in hospitals in Canada.",
    "(b) Second, it has a high standard of education for young people.",
    "(d) In addition, there are many chances for them to get a good job.",
    "(e) As a result, many people like to live in Canada.",
]
for frag in GUIDE_FRAGMENTS:
    require(ocr_has(frag), f"guide fragment not in OCR: {frag[:60]}")
# بارمِ چاپیِ مرتب‌کردنِ ۳۸: چهار (0.25) + دو (0.5) برای ۳۹
require(OCR_N.count("(0.25)") >= 4, "guide prints four (0.25) bar marks for item 38")
require(OCR_N.count("(0.5)") >= 2, "guide prints two (0.5) bar marks for item 39")
# یادداشتِ اغماضِ املا برای هر دو بخشِ مکالمه (۳ و ۴) — دو بار در راهنما
TOL = "اشاره به کلمه نیزکافی است و بدون در نظر گرفتن املاي"
require(OCR_N.count(norm(TOL)) >= 2, "guide prints the spelling-tolerance note for BOTH dialogue sections (3 and 4)")
# غیبتِ صادقانهٔ ۶۲: بارمِ اصولیِ پاراگراف‌نویسی — بدونِ نمونهٔ چاپی
require(ocr_has("رعایت اصول پاراگراف نویسی نمره لحاظ گردد"), "guide 17 prints principle-only paragraph bar for item 62 (Solar system)")
require(ocr_has("Solar system"), "body 62 prints the paragraph title Solar system")
require(ocr_has("The number of the planets"), "body 62 prints the data points (planets)")
# سربرگِ رسمی
require(ocr_has("نوبت دي ماه سال1399"), "official header: دی ماه سال ۱۳۹۹")
require(ocr_has("http://aee.medu.ir"), "official header: aee.medu.ir")
require(ocr_has("کلیه رشته ها"), "official header: کلیهٔ رشته‌ها")

# ================================================================ داوریِ دومِ مستقل (معناییِ کلیدها — مستقل از گذرِ نخست)
SECOND = [
    ("g12-fin99dey-l1m1", "a", ocr_has("a) mothers and fathers")),
    ("g12-fin99dey-l1m2", "b", ocr_has("b) love and care")),
    ("g12-fin99dey-l1m3", "d", ocr_has("d) wisdom")),
    ("g12-fin99dey-l2tf1", "b", True), ("g12-fin99dey-l2tf2", "a", True),
    ("g12-fin99dey-l2tf3", "b", True), ("g12-fin99dey-l2tf4", "b", True),
    ("g12-fin99dey-pic1", "b", ocr_has("Hamid sits on the sofa and watches TV all the time")),
    ("g12-fin99dey-pic2", "e", ocr_has("I have kept a diary for twelve years")),
    ("g12-fin99dey-pic3", "d", ocr_has("Oil, coal and natural gas are three common fossil fuels")),
    ("g12-fin99dey-pic4", "c", ocr_has("Try to avoid foods that contain a lot of fat")),
    ("g12-fin99dey-def1", "c", ocr_has("c. be grateful for")),
    ("g12-fin99dey-def2", "d", ocr_has("d. take something in, especially gradually")),
    ("g12-fin99dey-def3", "a", ocr_has("a. the amount of a product or service that people want")),
    ("g12-fin99dey-g1", "b", ocr_has("b) hasn’t she")),
    ("g12-fin99dey-g2", "c", ocr_has("c) which")),
    ("g12-fin99dey-g3", "a", ocr_has("a) must be obeyed")),
    ("g12-fin99dey-g4", "b", ocr_has("b) would be")),
    ("g12-fin99dey-r1tf1", "a", True), ("g12-fin99dey-r1tf2", "b", True),
    ("g12-fin99dey-r1m1", "a", ocr_has("a) Dictionaries are essential for language learning")),
    ("g12-fin99dey-r1m2", "d", ocr_has("d) students")),
    ("g12-fin99dey-r2tf1", "b", True), ("g12-fin99dey-r2tf2", "a", True),
    ("g12-fin99dey-r2m1", "c", ocr_has("c) Picasso’s father")),
    ("g12-fin99dey-r2m2", "d", ocr_has("d) one day")),
]
ALL_QS = [q for _lid, _t, _lv, qs in BANKS for q in qs]
for qid, letter, sem_ok in SECOND:
    require(sem_ok, f"second judgement failed: {qid} [{letter}]")
    q = next(x for x in ALL_QS if x["id"] == qid)
    pool = "ab" if q["options"] == ["True", "False"] else "abcde"
    require(q["answer"] == pool.index(letter), f"{qid}: answer {q['answer']} != guide letter {letter}")

# کلیدهای تایپی — هر accepted باید در OCR یا راهنما ریشهٔ چاپی داشته باشد
TYPED_KEYS = {
    "g12-fin99dey-l3q1": ["generated"], "g12-fin99dey-l3q2": ["opposite"],
    "g12-fin99dey-l3q3": ["clean"], "g12-fin99dey-l3q4": ["remind"],
    "g12-fin99dey-l4q1": ["worst"], "g12-fin99dey-l4q2": ["choose"], "g12-fin99dey-l4q3": ["terrible"],
    "g12-fin99dey-l4q4": ["right"], "g12-fin99dey-l4q5": ["teenagers"], "g12-fin99dey-l4q6": ["enjoy"],
    "g12-fin99dey-l5q1": ["He would go to the park."],
    "g12-fin99dey-l5q2": ["They can play one of their thinking games."],
    "g12-fin99dey-pool1": ["dedicated"], "g12-fin99dey-pool2": ["recommend"], "g12-fin99dey-pool3": ["replaced"],
    "g12-fin99dey-ok1": ["symbol"], "g12-fin99dey-ok2": ["worm"],
    "g12-fin99dey-vf1": ["had studied"], "g12-fin99dey-vf2": ["is spoken"],
    "g12-fin99dey-ws1": ["Mina was upset because she had gotten a bad score."],
    "g12-fin99dey-ws2": ["John could fix the car if he were at home."],
    "g12-fin99dey-r1q1": ["Quickly before they jump into to the next lesson."],
    "g12-fin99dey-r1q2": ["They must have a native language dictionary."],
    "g12-fin99dey-r2c1": ["world"], "g12-fin99dey-r2c2": ["creating"],
    "g12-fin99dey-conn1": ["but"], "g12-fin99dey-conn2": ["so"], "g12-fin99dey-conn3": ["and"], "g12-fin99dey-conn4": ["or"],
    "g12-fin99dey-ord1": ["There are several reasons why Canada is one of the best countries in the world."],
    "g12-fin99dey-ord2": ["First, Canada has an excellent health care system."],
    "g12-fin99dey-ord3": ["Therefore, many patients are easily cured in hospitals in Canada."],
    "g12-fin99dey-ord4": ["Second, it has a high standard of education for young people."],
    "g12-fin99dey-ord5": ["In addition, there are many chances for them to get a good job."],
    "g12-fin99dey-ord6": ["As a result, many people like to live in Canada."],
}
for qid, keys in TYPED_KEYS.items():
    q = next(x for x in ALL_QS if x["id"] == qid)
    require(q["kind"] == "typed", f"{qid} must be typed")
    for k in keys:
        require(any(k in a for a in q["accepted"]), f"{qid}: accepted lacks printed key variant {k[:40]}")

# ================================================================ تزریق (idempotent — خروجیِ ناقصِ رانِ قبلی پاک می‌شود)
data = json.loads(BANK_PATH.read_text(encoding="utf-8"))
data["lessons"] = [l for l in data["lessons"] if l["lesson"] < 191]
data["source"].pop("final99dey", None)
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

require(data["lessons"][-1]["lesson"] == 190, f"family tail is {data['lessons'][-1]['lesson']}, expected 190")
require([l["lesson"] for l in new_lessons] == list(range(191, 209)), "lesson numbers must be 191..208")
require(total_new == 61, f"total new items {total_new} != 61")

data["lessons"].extend(new_lessons)

data["source"]["final99dey"] = {
    "pages": "301-305",
    "keyPages": "306-307",
    "titlePrinted": "آزمون نهایی انگلیسی دوازدهم — نوبت دی ماه سال ۱۳۹۹، رسمیِ سراسریِ کلیهٔ رشته‌ها، مرکز سنجش و پایش کیفیت آموزشی (aee.medu.ir)، تاریخ ۰۱/۱۱/۹۹، ۵ صفحه، جمع نمره ۴۰ — دهمین نوبتِ خانواده و دومین نوبتِ منبعِ رسمی (پس از r299)",
    "sections": 17,
    "banks": 18,
    "questions": 61,
    "keys": 61,
    "extractedRound": 301,
    "branchVariant": "دهمین نوبتِ خانواده — دی ۱۳۹۹ از منبعِ رسمی: نخستین نوبتِ رسمیِ با کلیدِ تقریباً کامل (۶۱ از ۶۲؛ فقط ۶۲ بارمِ اصولی دارد) + تمامِ بخشِ شنیداریِ قابلِ بازی (هر دو مکالمه و پرسشِ پاسخِ باز، کلیدِ جمله‌کامل) + مرتب‌کردنِ شش‌جمله‌ایِ نخستِ خانواده (۵۶-۶۱) + اضافهٔ گزینه‌ایِ نخست‌جای (a) در واژگانِ تصویری.",
    "audioFilesAbsent": True,
    "openWritingAbsent": {"items": "۶۲ (پاراگرافِ Solar system با داده‌های چاپی The number of the planets / The order of distance / The center / The largest and smallest)", "reason": "راهنما فقط بارمِ اصولیِ «رعایت اصول پاراگراف‌نویسی» می‌دهد — الگوی r296/r297/r299"},
    "receipts": [
        "دومین نوبتِ منبعِ رسمیِ مرکز سنجش (aee.medu.ir) — سربرگِ تاریخِ حاکم: ۰۱/۱۱/۹۹ (درسِ r297: عنوانِ فرعیِ صفحه گمراه‌کننده است)",
        "کلیدِ تقریباً کامل: ۶۱ از ۶۲ آیتمِ چاپی کلیدِ صریح دارند — پس از r298 (۵۲/۵۲ از چاپِ جزوه) نخستین نوبتِ رسمیِ با کلیدِ کامل",
        "تمامِ بخشِ شنیداری از چاپ قابلِ بازی است: مکالمهٔ توربین بادی (۸-۱۱: generated/opposite/clean/remind) و مکالمهٔ تلویزیون (۱۲-۱۷: worst/choose/terrible/right/teenagers/enjoy) و پرسشِ پاسخِ باز (۱۸-۱۹) — کلیدِ جمله‌کاملِ چاپی (در r299 فقط سه بانکِ شنیداریِ جمله‌کامل داشت)",
        "یادداشتِ چاپیِ اغماضِ املا «اشاره به کلمه نیز کافی است و بدون در نظر گرفتن املای صحیح و کامل نیز نمره لحاظ گردد» برای هر دو بخشِ مکالمه (۳ و ۴) — سندِ رسمیِ سیاستِ نمره‌دهی؛ درون‌اپ کلیدِ چاپیِ واحد را نگه می‌دارد",
        "مرتب‌کردنِ شش‌جمله‌ایِ پاراگراف کانادا (۵۶-۶۱) با کلیدِ c/f/a/b/d/e — نخستین رتبه‌بندیِ شش‌اسلاتیِ خانواده (r296/r299/r300 چهارسلولی)؛ بارمِ (0.25)×۴ برای ۳۸ و (0.5)(0.5) برای ۳۹ در رسید",
        "اضافهٔ گزینه‌ای در جای نخست: واژگانِ تصویری اضافهٔ (a) دارد (My little sister…) — r299/r300 اضافه‌شان (e) در جای آخر بود؛ تعریف‌های ستون B اضافه‌شان (b) در جای دوم",
        "شکافِ حرفیِ چاپی: ۳۰ «s - - - - -» (symbol) و ۳۱ «w- - -» (worm) — ضرب‌المثلِ early bird با گیومهٔ چاپی وفادار",
        "وفاداری‌های چاپی: «china» کوچکِ ۳۶، «No, My brother» بزرگِ ۳۳، «jump into to» دوتاییِ بدنه و کلیدِ ۴۴، «Picasso' first paining» بدونِ g و بدونِ s در ۵۰، ساقهٔ ۴۵ و ۴۱ بدونِ علامتِ پرسشِ چاپی",
        "مکالمهٔ توربین بادی و پرسشِ بزرگسالان (elders) هم‌موضوعِ درس‌های Vision 3 — کلیدِ ۱۸ «He would go to the park.» شرطیِ نوع دوم",
        "متنِ دو ریدینگ (فرهنگ‌لغت/پیکاسو) درون‌اپ حمل نشد (الگوی r289-r300) — ساقه‌ها خودبسنده‌اند",
        "پنج دکمهٔ شنیداری با فایلِ صوتیِ غایب — الگوی r292-r300 (ساقه‌های چاپیِ شنیداری قابلِ بازی‌اند، فایل نه)",
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
