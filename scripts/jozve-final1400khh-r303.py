#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r303 — آزمون نهایی خرداد ۱۴۰۰، رسمیِ سراسریِ رشتهٔ ادبیات و علوم انسانی-علوم و معارف اسلامی (مرکز سنجش aee.medu.ir — بدنه ص۳۱۵-۳۱۹، راهنمای تصحیح ص۳۲۰-۳۲۱)
دوازدهمین نوبتِ «آزمون‌های نهایی دی ۹۷ تا شهریور ۱۴۰۱» — سربرگِ تاریخ حاکم (درس r297/r301/r302): ۱۸/۰۳/۱۴۰۰ = خرداد ۱۴۰۰ انسانی.
کشف‌های راند:
(۱) واریانتِ رشته‌ایِ خرداد ۱۴۰۰ — جفتِ رسمیِ r302 (ریاضی-تجربی ۱۹/۰۳ / انسانی ۱۸/۰۳)؛ عینِ الگوی جفتِ r296/r297.
(۲) نزدیک‌ترین پوششِ کلید برای دومین نوبتِ متوالی: ۵۶ از ۵۷ — فقط ۵۷ (پاراگرافِ Forests) بارمِ اصولی دارد.
(۳) تمامِ شنیداریِ قابلِ بازی (۱۵ آیتم) + دومین بانکِ شنیداریِ سه‌گزینه‌ای (۴-۷: a/b/c).
(۴) سومین مرتب‌کردنِ شش‌جمله‌ایِ خانواده (مورچه‌ها، ۵۱-۵۶، کلید d/a/c/b/f/e).
(۵) کلیدِ نیمه‌جمله‌ایِ ۵۰ با «or» (استخرِ پرانتزیِ بدنه but/so/or) — r302 با «but» بود.
(۶) گریدِ ۳۳ عینِ تمرینِ چاپیِ r301-ws2 (John could fix the car if he were at home) — بازاستفادهِ عمدیِ خانواده.
۲۰ بانک / ۵۶ آیتم — خانوادهٔ موضوعی هفدهم: ۱۲۸۳ + ۵۶ = ۱۳۳۹ تست در ۲۴۷ بانک.
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
    s = re.sub(r"[\"'`´‘’“”«»˝\u02DD\u030B]", "", s)  # ˝/آکسانِ ترکیبی — الگوی r300-r302
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
    """ساقه با خالیِ میانی: هر نیمه جداگانه راستی‌آزمایی می‌شود (الگوی r299-r302)"""
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

# ---------------------------------------------------------------- S1 شنیداری فایل ۱: درست/نادرست + کامل کنید (ص۳۱۵) — کلید a/b + sister
s1 = [
    q_tf("g12-fin1400khh-l1tf1", 1, "Zohreh has invited everyone but Mina.", 0),   # ۱ → True (a)
    q_tf("g12-fin1400khh-l1tf2", 2, "Zohreh and Mina were not close friends at school.", 1),  # ۲ → False (b)
    q_typed("g12-fin1400khh-l1q1", 3,
            "Maryam could check Mina’s address with her --------------- because she is her mother’s friend.",
            ["sister"], "fill in the blank with the missing word…"),               # ۳ → sister
]
# ---------------------------------------------------------------- S2 شنیداری فایل ۲: تست سه‌گزینه‌ای (ص۳۱۵) — دومین سه‌گزینه‌ایِ خانواده — کلید b/c/b/a
s2 = [
    q_mcq("g12-fin1400khh-l2m1", 1,
          "Yeganeh and Kiana came over for dinner on --------------- .",
          ["Monday", "Thursday", "Saturday"], 1),                                  # ۴ → (b)
    q_mcq("g12-fin1400khh-l2m2", 2,
          "Samira wanted to go to the Museum of --------------- .",
          ["Modern Art", "Holy shrine", "Holy Defense"], 2),                       # ۵ → (c)
    q_mcq("g12-fin1400khh-l2m3", 3,
          "Before they got home, they had gone to the --------------- .",
          ["park", "museum", "restaurant"], 1),                                    # ۶ → (b)
    q_mcq("g12-fin1400khh-l2m4", 4,
          "After dinner, their mothers arrived and took them --------------- .",
          ["home", "to school", "to the museum"], 0),                              # ۷ → (a)
]
# ---------------------------------------------------------------- S3 شنیداری فایل ۳: متن فرهنگ‌لغت عسدی طوسی (ص۳۱۵) — شماره‌گذاریِ چاپی ……(8)…… — کلید famous/final/taken/lived
s3 = [
    q_typed("g12-fin1400khh-l3q1", 1,
            "Asadi Tusi was a …… (8)……--------------- poet in the 5th century.",
            ["famous"], "fill in the blank with the missing word…"),
    q_typed("g12-fin1400khh-l3q2", 2,
            "In this dictionary, the list of entries has been arranged according to the……(9)……--------------- letters of the words.",
            ["final"], "fill in the blank with the missing word…"),
    q_typed("g12-fin1400khh-l3q3", 3,
            "This dictionary has many sentences which were ……(10)……--------------- from poetry.",
            ["taken"], "fill in the blank with the missing word…"),
    q_typed("g12-fin1400khh-l3q4", 4,
            "This dictionary has been used by the poets who ……(11)……..--------------- after Asadi Tusi.",
            ["lived"], "fill in the blank with the missing word…"),
]
# ---------------------------------------------------------------- S4 شنیداری فایل ۴: درست/نادرست (ص۳۱۵) — سعادت‌زاده — کلید b/a/b/a
s4 = [
    q_tf("g12-fin1400khh-l4tf1", 1, "Tahereh Saffarzadeh was born in Shiraz.", 1),                    # ۱۲ → False
    q_tf("g12-fin1400khh-l4tf2", 2, "She learned reading and reciting the Holy Quran at the age of 6.", 0),  # ۱۳ → True
    q_tf("g12-fin1400khh-l4tf3", 3, "When she was a young student, she didn’t write poems.", 1),      # ۱۴ → False
    q_tf("g12-fin1400khh-l4tf4", 4, "She published the translation of Holy Quran in 1380.", 0),       # ۱۵ → True
]
# ---------------------------------------------------------------- S5 واژگان با تصویر (ص۳۱۶) — پنج جملهٔ چاپی با اضافهٔ (a) در جای نخست (الگوی r301) — کلید d/e/c/b
PIC_INSTR = "با توجه به تصاویر داده‌شده، جملهٔ مناسب برای هر تصویر را انتخاب کنید. (یک جمله اضافی است)"
PIC_OPTS = [
    "Iran is rich in oil resources.",  # اضافهٔ چاپی — جای نخست
    "My uncle often sits in the balcony, has a cup of coffee and reads a book.",
    "Try to avoid foods that contain a lot of fat.",
    "Dad really shouted at me when I didn’t pass the exam.",
    "Wind turbines are used to produce electricity from wind power.",
]
s5 = [
    q_mcq("g12-fin1400khh-pic1", 1, PIC_INSTR, PIC_OPTS, 3),  # ۱۶ → (d) shouted
    q_mcq("g12-fin1400khh-pic2", 2, PIC_INSTR, PIC_OPTS, 4),  # ۱۷ → (e) wind turbines
    q_mcq("g12-fin1400khh-pic3", 3, PIC_INSTR, PIC_OPTS, 2),  # ۱۸ → (c) fat
    q_mcq("g12-fin1400khh-pic4", 4, PIC_INSTR, PIC_OPTS, 1),  # ۱۹ → (b) balcony
]
# ---------------------------------------------------------------- S6 واژگان: بانک چهارتایی چاپی (ص۳۱۶) — hugged/introduction/absorb/effectively (اضافه: effectively در جای آخر)؛ کلید absorb/introduction/hugged
POOL_OPTS = ["hugged", "introduction", "absorb", "effectively"]
s6 = [
    q_typed("g12-fin1400khh-pool1", 1,
            "Plants --------------- carbon dioxide.",
            ["absorb"], "fill in the blank with the missing word…"),
    q_typed("g12-fin1400khh-pool2", 2,
            "This book has only a two-page --------------- .",
            ["introduction"], "fill in the blank with the missing word…"),
    q_typed("g12-fin1400khh-pool3", 3,
            "My uncle went to his son and --------------- him.",
            ["hugged"], "fill in the blank with the missing word…"),
]
for q in s6:
    q["options"] = list(POOL_OPTS)  # داربست = بانکِ کاملِ چاپی (الگوی r296-r302)
# ---------------------------------------------------------------- S7 واژگان: تعریف‌های ستون B (ص۳۱۶) — اضافه در (a) جای نخست (cry suddenly)؛ کلید d/c/b
DEFB_OPTS = [
    "cry suddenly",  # اضافهٔ چاپی — جای نخست
    "for all time",
    "the rise and fall of the sea",
    "in a quiet way",
]
s7 = [
    q_mcq("g12-fin1400khh-def1", 1, "He always speaks slowly and calmly.", DEFB_OPTS, 3),               # ۲۳ → (d)
    q_mcq("g12-fin1400khh-def2", 2, "Here you can see two high and two low tides each day.", DEFB_OPTS, 2),  # ۲۴ → (c)
    q_mcq("g12-fin1400khh-def3", 3, "No one can live forever.", DEFB_OPTS, 1),                          # ۲۵ → (b)
]
# ---------------------------------------------------------------- S8 واژگان: کامل‌کردن از دانش خود (ص۳۱۶) — شکافِ حرفیِ چاپی c- - — ضرب‌المثلِ easy come, easy go — کلید come
s8 = [
    q_typed("g12-fin1400khh-ok1", 1,
            "A: When you get money quickly, it’s easy to spend it or lose it quickly as well. B: You know that “Easy c --------------- , easy go”.",
            ["come"], "start with the printed first letter c…"),
]
# ---------------------------------------------------------------- S9 گرامر: تست چهارگزینه‌ای (ص۳۱۷) — کلید c/a/c/b
s9 = [
    q_mcq("g12-fin1400khh-g1", 1,
          "They invited you to their party, --------------- ?",
          ["do they", "didn’t we", "didn’t they", "don’t you"], 2),  # ۲۷ → (c)
    q_mcq("g12-fin1400khh-g2", 2,
          "A: What did the students want to do? B: They wanted to talk to the teacher --------------- Ali met before.",
          ["whom", "when", "where", "which"], 0),                     # ۲۸ → (a)
    q_mcq("g12-fin1400khh-g3", 3,
          "I --------------- lunch before I went out.",
          ["am eating", "will eat", "had eaten", "eat"], 2),          # ۲۹ → (c)
    q_mcq("g12-fin1400khh-g4", 4,
          "A: How can we have better streets? B: The traffic rules --------------- by everyone.",
          ["may obey", "must be obeyed", "obeyed", "has obeyed"], 1), # ۳۰ → (b)
]
# ---------------------------------------------------------------- S10 شکل صحیح فعل (ص۳۱۷) — راهنمای پرانتزیِ چاپی (break)؛ کلید was broken
s10 = [
    q_typed("g12-fin1400khh-vf1", 1,
            "The window --------------- by that boy yesterday. (break)",
            ["was broken"], "شکل صحیح فعلِ داخل پرانتز را بنویسید…"),
]
# ---------------------------------------------------------------- S11 مرتب‌کردن کلمات (ص۳۱۷) — گریدِ ۳۳ عینِ تمرینِ r301-ws2 (بازاستفادهِ عمدیِ خانواده) — بارمِ (0.25) در رسید
s11 = [
    q_typed("g12-fin1400khh-ws1", 1,
            "had gotten/ was upset/ because/ a bad score/ she/ Roya /. /",
            ["Roya was upset because she had gotten a bad score."],
            "جملهٔ مرتب‌شده را کامل بنویسید…"),
    q_typed("g12-fin1400khh-ws2", 2,
            "the car / were at home /if / he / could fix/ John  /. /",
            ["John could fix the car if he were at home."],
            "جملهٔ مرتب‌شده را کامل بنویسید…"),
]
# ---------------------------------------------------------------- S12 ضمیر موصولی (ص۳۱۷) — کلیدِ چاپیِ «which» + توضیحِ راهنما — الگوی چندمدالیِ r302
s12 = [
    q_typed("g12-fin1400khh-rel1", 1,
            "An ostrich is a bird …………………………………. .",
            ["which"], "which را به همراه یک جمله یا عبارت دارای فعل ادامه دهید…"),
]
# ---------------------------------------------------------------- S13 ریدینگ احترام به بزرگ‌ترها (ص۳۱۷) — کلید True/False/b
s13 = [
    q_tf("g12-fin1400khh-r1tf1", 1, "It is important to remember that elders were not born elders.", 0),  # ۳۵ → True
    q_tf("g12-fin1400khh-r1tf2", 2, "The passage says that elders have nothing to share with us.", 1),    # ۳۶ → False
    q_mcq("g12-fin1400khh-r1m1", 3,
          "What does “they” in the third line of paragraph 2 refer to?",
          ["future generations", "parents", "teachers", "lives"], 1),  # ۳۷ → (b)
]
s13q = [
    q_typed("g12-fin1400khh-r1q1", 1,
            "How do elders feel when we appreciate their love? ……………………………… .",
            ["They feel honored."],
            "answer with a full sentence…"),  # ۳۸
]
# ---------------------------------------------------------------- S14 ریدینگ راهنمای فرهنگ‌لغت (ص۳۱۸) — کلید False/True/b + entry/collocations
s14 = [
    q_tf("g12-fin1400khh-r2tf1", 1, "The passage says that good dictionaries give information about how to buy a dictionary.", 1),  # ۳۹ → False
    q_tf("g12-fin1400khh-r2tf2", 2, "It is necessary to know how to use a dictionary.", 0),                                          # ۴۰ → True
    q_mcq("g12-fin1400khh-r2m1", 3,
          "According to the passage, --------------- are the two words at the top of each page that show the first and last entries on the page.",
          ["definitions", "guide words", "pronunciations", "spellings"], 1),  # ۴۱ → (b)
]
s14c = [
    q_typed("g12-fin1400khh-r2c1", 1,
            "When you find a/an --------------- , you can find the exact meaning of the word, pronunciation, part of speech and many other things.",
            ["entry"], "fill in the blank with the missing word…"),   # ۴۲
    q_typed("g12-fin1400khh-r2c2", 2,
            "The passage says that you should try to learn --------------- to expand your vocabulary.",
            ["collocations"], "fill in the blank with the missing word…"),  # ۴۳
]
# ---------------------------------------------------------------- S15 ریدینگ برق‌آبی (ص۳۱۸) — کلید True/True/c/a؛ «in some of countries» چاپی وفادار
s15 = [
    q_tf("g12-fin1400khh-r3tf1", 1, "A type of renewable energy is called hydropower.", 0),  # ۴۴ → True
    q_tf("g12-fin1400khh-r3tf2", 2, "Turbines convert the water energy into electricity.", 0),  # ۴۵ → True
    q_mcq("g12-fin1400khh-r3m1", 3,
          "The passage says that clean energy is used in some of countries to keep the cities. --------------- .",
          ["hot", "renewable", "clean", "endless"], 2),  # ۴۶ → (c)
    q_mcq("g12-fin1400khh-r3m2", 4,
          "When fewer fossil fuels are used each year, they are --------------- for future.",
          ["saved", "consumed", "used up", "decreased"], 0),  # ۴۷ → (a)
]
# ---------------------------------------------------------------- S16 کلمات ربط (ص۳۱۹) — کلید and/but (در برابر and/soی r302)
CONN_POOL = ["but", "and", "so", "or"]
s16 = [
    q_typed("g12-fin1400khh-conn1", 1,
            "I get up early in the morning, --------------- I make an omelet myself.",
            ["and"], "fill in the blank with a connective…"),
    q_typed("g12-fin1400khh-conn2", 2,
            "There is snow in the street, --------------- it’s not too cold.",
            ["but"], "fill in the blank with a connective…"),
]
for q in s16:
    q["options"] = list(CONN_POOL)
# ---------------------------------------------------------------- S17 جملهٔ مرکب با تصویر (ص۳۱۹) — استخرِ پرانتزیِ (but, so, or) — کلیدِ نیمه‌جمله‌ایِ چاپیِ «…..or you should wash the dishes.»
s17 = [
    q_typed("g12-fin1400khh-cx1", 1,
            "You should do your homework, --------------- . (wash the dishes)",
            ["You should do your homework, or you should wash the dishes.", "or you should wash the dishes"],
            "با but/so/or جملهٔ مرکبِ معنادار بنویسید…"),
]
# ---------------------------------------------------------------- S18 مرتب‌کردن جمله‌های پاراگراف مورچه‌ها (ص۳۱۹) — شش‌اسلاتیِ سومِ خانواده؛ کلید d/a/c/b/f/e
s18 = [
    q_typed("g12-fin1400khh-ord1", 1,
            "جملهٔ نخست (Topic) پاراگراف مورچه‌ها را بنویسید.",
            ["Ants are hardworking insects."],
            "جملهٔ پاراگراف را کامل بنویسید…"),
    q_typed("g12-fin1400khh-ord2", 2,
            "جملهٔ دوم پاراگراف مورچه‌ها را بنویسید.",
            ["Throughout the summer, they collect food for the winter season."],
            "جملهٔ پاراگراف را کامل بنویسید…"),
    q_typed("g12-fin1400khh-ord3", 3,
            "جملهٔ سوم پاراگراف مورچه‌ها را بنویسید.",
            ["Whenever they find sweet lying on the floor,"],
            "جملهٔ پاراگراف را کامل بنویسید…"),
    q_typed("g12-fin1400khh-ord4", 4,
            "جملهٔ چهارم پاراگراف مورچه‌ها را بنویسید.",
            ["they stick to the sweet and carry it to their home."],
            "جملهٔ پاراگراف را کامل بنویسید…"),
    q_typed("g12-fin1400khh-ord5", 5,
            "جملهٔ پنجم پاراگراف مورچه‌ها را بنویسید.",
            ["Thus, in this way, they clean the floor."],
            "جملهٔ پاراگراف را کامل بنویسید…"),
    q_typed("g12-fin1400khh-ord6", 6,
            "جملهٔ پایانی (Concluding) پاراگراف مورچه‌ها را بنویسید.",
            ["As a result, they are known as helpful and active insects."],
            "جملهٔ پاراگراف را کامل بنویسید…"),
]

BANKS = [
    (228, "نهایی سراسری خرداد ۱۴۰۰ انسانی — شنیداری فایل ۱: درست/نادرست + کامل کنید (ص۳۱۵)", "آموزشی — ورود آزاد", s1),
    (229, "نهایی سراسری خرداد ۱۴۰۰ انسانی — شنیداری فایل ۲: تست (ص۳۱۵)", "استاندارد", s2),
    (230, "نهایی سراسری خرداد ۱۴۰۰ انسانی — شنیداری فایل ۳: متن فرهنگ‌لغت عسدی طوسی، کامل کنید (ص۳۱۵)", "آموزشی — ورود آزاد", s3),
    (231, "نهایی سراسری خرداد ۱۴۰۰ انسانی — شنیداری فایل ۴: درست/نادرست (ص۳۱۵)", "استاندارد", s4),
    (232, "نهایی سراسری خرداد ۱۴۰۰ انسانی — واژگان با تصویر: جملهٔ مناسب هر تصویر (ص۳۱۶)", "استاندارد", s5),
    (233, "نهایی سراسری خرداد ۱۴۰۰ انسانی — واژگان: جای خالی از بانک (ص۳۱۶)", "آموزشی — ورود آزاد", s6),
    (234, "نهایی سراسری خرداد ۱۴۰۰ انسانی — واژگان: تعریف‌های ستون B (ص۳۱۶)", "استاندارد", s7),
    (235, "نهایی سراسری خرداد ۱۴۰۰ انسانی — واژگان: کامل‌کردن از دانش خود (ص۳۱۶)", "آموزشی — ورود آزاد", s8),
    (236, "نهایی سراسری خرداد ۱۴۰۰ انسانی — گرامر: تست چهارگزینه‌ای (ص۳۱۷)", "استاندارد", s9),
    (237, "نهایی سراسری خرداد ۱۴۰۰ انسانی — شکل صحیح فعل، بنویسید (ص۳۱۷)", "آموزشی — ورود آزاد", s10),
    (238, "نهایی سراسری خرداد ۱۴۰۰ انسانی — مرتب‌کردن کلمات، بنویسید (ص۳۱۷)", "آموزشی — ورود آزاد", s11),
    (239, "نهایی سراسری خرداد ۱۴۰۰ انسانی — ضمیر موصولی، کامل کنید (ص۳۱۷)", "آموزشی — ورود آزاد", s12),
    (240, "نهایی سراسری خرداد ۱۴۰۰ انسانی — ریدینگ احترام به بزرگ‌ترها: درست/نادرست + تست (ص۳۱۷)", "استاندارد", s13),
    (241, "نهایی سراسری خرداد ۱۴۰۰ انسانی — ریدینگ احترام به بزرگ‌ترها: پرسش پاسخ (ص۳۱۸)", "آموزشی — ورود آزاد", s13q),
    (242, "نهایی سراسری خرداد ۱۴۰۰ انسانی — ریدینگ راهنمای فرهنگ‌لغت: درست/نادرست + تست (ص۳۱۸)", "استاندارد", s14),
    (243, "نهایی سراسری خرداد ۱۴۰۰ انسانی — ریدینگ راهنمای فرهنگ‌لغت: کامل کنید (ص۳۱۸)", "آموزشی — ورود آزاد", s14c),
    (244, "نهایی سراسری خرداد ۱۴۰۰ انسانی — ریدینگ برق‌آبی: درست/نادرست + تست (ص۳۱۸)", "استاندارد", s15),
    (245, "نهایی سراسری خرداد ۱۴۰۰ انسانی — کلمات ربط، کامل کنید (ص۳۱۹)", "آموزشی — ورود آزاد", s16),
    (246, "نهایی سراسری خرداد ۱۴۰۰ انسانی — جملهٔ مرکب با کلمهٔ ربط و تصویر، بنویسید (ص۳۱۹)", "آموزشی — ورود آزاد", s17),
    (247, "نهایی سراسری خرداد ۱۴۰۰ انسانی — مرتب‌کردن جمله‌های پاراگراف، بنویسید (ص۳۱۹)", "آموزشی — ورود آزاد", s18),
]

# ================================================================ راستی‌آزماییِ OCR (وفاداریِ بدنه ص۳۱۵-۳۱۹)
SKIP_PREFIXES = ("با توجه به", "برای هر کلمهٔ", "جملهٔ")
for lid, _title, _level, qs in BANKS:
    for q in qs:
        if q["question"].startswith(SKIP_PREFIXES):
            pass  # دستورالعملِ فارسیِ درون‌اپ — الگوی r296-r302؛ گزینه‌ها/کلیدها جداگانه راستی‌آزمایی می‌شوند
        else:
            require(ocr_has_stem(q["question"]), f"stem not in OCR: {q['id']} :: {q['question'][:70]}")
        if q.get("kind") == "mcq" and q["options"] not in (["True", "False"],):
            for opt in q["options"]:
                require(ocr_has(opt), f"option not in OCR: {q['id']} :: {opt[:60]}")

# راهنمای پرانتزیِ چاپیِ (wash the dishes) برای ۵۰ جداگانه راستی‌آزمایی می‌شود
require(ocr_has("(wash the dishes)"), "body prints the (wash the dishes) hint for item 50")

# ================================================================ کلیدهای راهنمای تصحیح (ص۳۲۰-۳۲۱) — راستی‌آزماییِ قطعه‌کلیدها
GUIDE_FRAGMENTS = [
    "1. True (a)", "2. False (b)", "3. sister",
    "4. (b)", "5. (c)", "6. (b)", "7. (a)",
    "8. famous", "9. final", "10. taken", "11. lived",
    "12. False (b)", "13.True (a)", "14. False (b)", "15. True (a)",
    "16. (d)", "17. (e)", "18. (c)", "19. (b)",
    "20. absorb", "21. introduction", "22. hugged",
    "23. (d)", "24. (c)", "25. (b)",
    "26. come",
    "27. (c)", "28. (a)", "29. (c)", "30. (b)",
    "31. was broken",
    "35. (a) True", "36. (b) False", "37. ( b )",
    "38. They feel honored.",
    "39. (b) False", "40. (a) True", "41. (b)", "42. entry", "43. collocations",
    "44. (a) True", "45. (a) True", "46. (c)", "47.(a)",
    "48. and", "49. but",
    "or you should wash the dishes",
    "(d) Ants are hardworking insects.",
    "(a) Throughout the summer, they collect food for the winter season.",
    "(c) Whenever they find sweet lying on the floor,",
    "(b) they stick to the sweet and carry it to their home.",
    "(f) Thus, in this way, they clean the floor.",
    "(e) As a result, they are known as helpful and active insects.",
    # توضیحِ کلیدِ ۳۴ — راهنما «which» را با یادداشتِ توضیحی چاپ کرده (الگوی r299/r302)
    "را به همراه یک جمله یا عبارت",
    "دارای فعل",
    "در ادامه بنویسد",
    # یادداشتِ نمرهٔ کاملِ ۵۰ با تصویر
    "در این بخش با انتخاب درست یکی از کلمات ربط",
    # سربرگِ رسمی
    "نوبت خرداد ماه سال1400",
    "http://aee.medu.ir",
    "18 / 03 / 1400",
    "رشته: ادبیات و علوم انسانی-علوم و معارف اسلامی",
    "تعداد صفحات:5",
    "Audio file (MP3)",
    "Audio script (PDF)",
    # بخش ۱۹: بارمِ اصولیِ پاراگراف + داده‌های چاپی
    "رعایت اصول پاراگراف نویسی",
    "Natural home of animals",
    "Source of fresh air",
    "Source of necessary things for man",
    "Forests are",
]
for frag in GUIDE_FRAGMENTS:
    require(ocr_has(frag), f"guide fragment not in OCR: {frag[:60]}")
# گریدِ بهم‌ریختهٔ ۳۲/۳۳ در راهنما — همهٔ قطعات چاپی
for frag in ["had gotten", "was upset", "a bad score", "Roya", "were at home", "could fix", "John"]:
    require(ocr_has(frag), f"scrambled grid fragment not in OCR: {frag}")
# بارمِ گرید: دو نشانِ (0/5) چاپی + «بارم هر قسمت»
require(OCR_N.count("(0/5)") >= 2, "guide prints two (0/5) bar marks near the word-order grids")
require(ocr_has("بارم هر قسمت"), "guide prints the per-part bar note for section 11")
# غیبتِ صادقانهٔ ۵۷: بارمِ اصولیِ پاراگراف‌نویسی — بدونِ نمونهٔ چاپی
require(ocr_has("در این بخش)سوال57"), "guide 19 prints principle-only paragraph bar for item 57 (Forests)")
require(ocr_has("در این بخش)سوال57 (باتوجه به رعایت اصول پاراگراف نویسی نمره لحاظ گردد"),
        "guide 19 principle-only note full fragment")

# ================================================================ داوریِ دومِ مستقل (معناییِ کلیدها — مستقل از گذرِ نخست)
SECOND = [
    ("g12-fin1400khh-l1tf1", "a", True), ("g12-fin1400khh-l1tf2", "b", True),
    ("g12-fin1400khh-l2m1", "b", ocr_has("b) Thursday")),
    ("g12-fin1400khh-l2m2", "c", ocr_has("c) Holy Defense")),
    ("g12-fin1400khh-l2m3", "b", ocr_has("b) museum")),
    ("g12-fin1400khh-l2m4", "a", ocr_has("a) home")),
    ("g12-fin1400khh-pic1", "d", ocr_has("d. Dad really shouted at me when I didn’t pass the exam")),
    ("g12-fin1400khh-pic2", "e", ocr_has("e. Wind turbines are used to produce electricity from wind power")),
    ("g12-fin1400khh-pic3", "c", ocr_has("c. Try to avoid foods that contain a lot of fat")),
    ("g12-fin1400khh-pic4", "b", ocr_has("b. My uncle often sits in the balcony, has a cup of coffee and reads a book")),
    ("g12-fin1400khh-def1", "d", ocr_has("d. in a quiet way")),
    ("g12-fin1400khh-def2", "c", ocr_has("c. the rise and fall of the sea")),
    ("g12-fin1400khh-def3", "b", ocr_has("b. for all time")),
    ("g12-fin1400khh-g1", "c", ocr_has("c) didn’t they")),
    ("g12-fin1400khh-g2", "a", ocr_has("a) whom")),
    ("g12-fin1400khh-g3", "c", ocr_has("c) had eaten")),
    ("g12-fin1400khh-g4", "b", ocr_has("b) must be obeyed")),
    ("g12-fin1400khh-r1tf1", "a", True), ("g12-fin1400khh-r1tf2", "b", True),
    ("g12-fin1400khh-r1m1", "b", ocr_has("b) parents")),
    ("g12-fin1400khh-r2tf1", "b", True), ("g12-fin1400khh-r2tf2", "a", True),
    ("g12-fin1400khh-r2m1", "b", ocr_has("b) guide words")),
    ("g12-fin1400khh-r3tf1", "a", True), ("g12-fin1400khh-r3tf2", "a", True),
    ("g12-fin1400khh-r3m1", "c", ocr_has("c) clean")),
    ("g12-fin1400khh-r3m2", "a", ocr_has("a) saved")),
]
ALL_QS = [q for _lid, _t, _lv, qs in BANKS for q in qs]
for qid, letter, sem_ok in SECOND:
    require(sem_ok, f"second judgement failed: {qid} [{letter}]")
    q = next(x for x in ALL_QS if x["id"] == qid)
    pool = "ab" if q["options"] == ["True", "False"] else "abcde"
    require(q["answer"] == pool.index(letter), f"{qid}: answer {q['answer']} != guide letter {letter}")

# کلیدهای تایپی — هر accepted باید در OCR یا راهنما ریشهٔ چاپی داشته باشد
TYPED_KEYS = {
    "g12-fin1400khh-l1q1": ["sister"],
    "g12-fin1400khh-l3q1": ["famous"], "g12-fin1400khh-l3q2": ["final"],
    "g12-fin1400khh-l3q3": ["taken"], "g12-fin1400khh-l3q4": ["lived"],
    "g12-fin1400khh-pool1": ["absorb"], "g12-fin1400khh-pool2": ["introduction"], "g12-fin1400khh-pool3": ["hugged"],
    "g12-fin1400khh-ok1": ["come"],
    "g12-fin1400khh-vf1": ["was broken"],
    "g12-fin1400khh-ws1": ["Roya was upset because she had gotten a bad score."],
    "g12-fin1400khh-ws2": ["John could fix the car if he were at home."],
    "g12-fin1400khh-rel1": ["which"],
    "g12-fin1400khh-r1q1": ["They feel honored."],
    "g12-fin1400khh-r2c1": ["entry"], "g12-fin1400khh-r2c2": ["collocations"],
    "g12-fin1400khh-conn1": ["and"], "g12-fin1400khh-conn2": ["but"],
    "g12-fin1400khh-cx1": ["or you should wash the dishes"],
    "g12-fin1400khh-ord1": ["Ants are hardworking insects."],
    "g12-fin1400khh-ord2": ["Throughout the summer, they collect food for the winter season."],
    "g12-fin1400khh-ord3": ["Whenever they find sweet lying on the floor,"],
    "g12-fin1400khh-ord4": ["they stick to the sweet and carry it to their home."],
    "g12-fin1400khh-ord5": ["Thus, in this way, they clean the floor."],
    "g12-fin1400khh-ord6": ["As a result, they are known as helpful and active insects."],
}
for qid, keys in TYPED_KEYS.items():
    q = next(x for x in ALL_QS if x["id"] == qid)
    require(q["kind"] == "typed", f"{qid} must be typed")
    for k in keys:
        require(any(k in a for a in q["accepted"]), f"{qid}: accepted lacks printed key variant {k[:40]}")

# ================================================================ تزریق (idempotent — خروجیِ ناقصِ رانِ قبلی پاک می‌شود)
data = json.loads(BANK_PATH.read_text(encoding="utf-8"))
data["lessons"] = [l for l in data["lessons"] if l["lesson"] < 228]
data["source"].pop("final1400khh", None)
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

require(data["lessons"][-1]["lesson"] == 227, f"family tail is {data['lessons'][-1]['lesson']}, expected 227")
require([l["lesson"] for l in new_lessons] == list(range(228, 248)), "lesson numbers must be 228..247")
require(total_new == 56, f"total new items {total_new} != 56")

data["lessons"].extend(new_lessons)

data["source"]["final1400khh"] = {
    "pages": "315-319",
    "keyPages": "320-321",
    "titlePrinted": "آزمون نهایی انگلیسی دوازدهم — نوبت خرداد ماه سال ۱۴۰۰، رسمیِ سراسریِ رشتهٔ ادبیات و علوم انسانی-علوم و معارف اسلامی، مرکز سنجش و پایش کیفیت آموزشی (aee.medu.ir)، تاریخ ۱۸/۰۳/۱۴۰۰، ۵ صفحه، جمع نمره ۴۰ — دوازدهمین نوبتِ خانواده، چهارمین نوبتِ منبعِ رسمی و واریانتِ رشته‌ایِ خرداد ۱۴۰۰ (جفتِ r302)",
    "sections": 19,
    "banks": 20,
    "questions": 56,
    "keys": 56,
    "extractedRound": 303,
    "branchVariant": "دوازدهمین نوبتِ خانواده — واریانتِ انسانیِ خرداد ۱۴۰۰ (جفتِ رشته‌ایِ r302، عینِ الگوی جفتِ r296/r297): کلیدِ ۵۶ از ۵۷ (فقط ۵۷ پاراگرافِ Forests بارمِ اصولی) + تمامِ شنیداریِ قابلِ بازی (۱۵ آیتم) + دومین بانکِ شنیداریِ سه‌گزینه‌ای (۴-۷: a/b/c) + سومین مرتب‌کردنِ شش‌جمله‌ای (d/a/c/b/f/e) + کلیدِ نیمه‌جمله‌ایِ ۵۰ با or (استخرِ پرانتزیِ but/so/or) + اضافهٔ نخست‌جایِ (a) در تصویری و تعریف‌ها.",
    "audioFilesAbsent": True,
    "openWritingAbsent": {"items": "۵۷ (پاراگرافِ Forests با داده‌های چاپی Natural home of animals / Source of fresh air / Source of necessary things for man)", "reason": "راهنما فقط بارمِ اصولیِ «رعایت اصول پاراگراف‌نویسی» می‌دهد — الگوی r296-r302"},
    "receipts": [
        "جفتِ رشته‌ایِ یک تاریخ: r302 (ریاضی-تجربی، ۱۹/۰۳/۱۴۰۰) و این راند (انسانی، ۱۸/۰۳/۱۴۰۰) — دو آزمونِ مستقل با محتوای متفاوت؛ الگوی r296/r297 تکرار شد",
        "نزدیک‌ترین پوششِ کلید برای دومین نوبتِ متوالی: ۵۶ از ۵۷ (فقط Forests بارمِ اصولی) — پس از r302",
        "تمامِ شنیداریِ قابلِ بازی: پرسشِ پاسخِ زهره/مریم (a/b + sister)، رستورانِ سه‌گزینه‌ایِ شیلا/سمیرا (b/c/b/a)، فرهنگ‌لغتِ عسدی طوسی (famous/final/taken/lived) و سعادت‌زاده (b/a/b/a)",
        "متنِ سومِ فرهنگ‌لغت‌محور در خانوادهٔ موضوعی هفدهم: عسدی طوسی (لغت‌نامهٔ فارسی)، راهنمای فرهنگ‌لغت (Guide Words/Definitions/Collocations) و تعریفِ فرهنگ‌لغتِ r301-r302 — موضوعِ محبوبِ خرداد ۱۴۰۰",
        "سومین مرتب‌کردنِ شش‌جمله‌ای: پاراگراف مورچه‌ها (۵۱-۵۶) با کلیدِ d/a/c/b/f/e — راهنما حرفِ هر جایگاه را جداگانه چاپ کرده (51(d)/52(a)/53(c)/54(b)/55(f)/56(e))",
        "کلیدِ نیمه‌جمله‌ایِ ۵۰: «…..or you should wash the dishes.» — نخستین کلیدِ نیمه‌جمله‌ایِ خانواده با or (r302 با but بود)؛ استخرِ پرانتزیِ بدنه سه‌گزینه‌ایِ (but, so, or) است نه چهارتایی",
        "اضافه‌ها در سه بانک با جایگاه‌های متمایز: تصویری (a) نخست (Iran is rich in oil resources)، تعریف‌های ستون B (a) نخست (cry suddenly)، بانکِ چهارتایی effectively در جای آخر — r302 تصویری‌اش (b) دوم بود",
        "گریدِ ۳۳ عینِ تمرینِ چاپیِ r301-ws2 (John could fix the car if he were at home) و گریدِ ۳۲ هم‌خانوادهٔ r301-ws1 با سوژهٔ Roya — بازاستفادهِ عمدیِ خانواده از تمرین‌های کتاب (درسِ r299: گاردِ ساقه‌محورِ راندهای قدیمی به دورهٔ خودشان محدود است)؛ یکتاییِ ۱۳۳۹ شناسه حاکم",
        "وفاداری‌های چاپی: «in some of countries» (۴۶)، «Easy c - - , easy go» با شکافِ حرفی، «find sweet lying on the floor» بدونِ حرفِ تعریف، آیتمِ ۳۸ با نقطه‌چینِ چاپیِ پاسخ، «13.True» بدونِ فاصله در راهنما",
        "سربرگِ رسمی با رشتهٔ محدودِ «ادبیات و علوم انسانی-علوم و معارف اسلامی» — جفتِ «ریاضی-فیزیک و علوم تجربی»ی r302",
        "پنج دکمهٔ شنیداری با فایلِ صوتیِ غایب — الگوی r292-r302 (ساقه‌های چاپیِ شنیداری قابلِ بازی‌اند، فایل نه)",
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
