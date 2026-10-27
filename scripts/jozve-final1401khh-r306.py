#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r306 — آزمون نهایی، رسمیِ سراسریِ کلیهٔ رشته‌ها — نوبت خرداد ۱۴۰۱ (مرکز سنجش aee.medu.ir — بدنه ص۳۳۶-۳۴۰، راهنمای تصحیح ص۳۴۱-۳۴۲)
پانزدهمین نوبتِ «آزمون‌های نهایی دی ۹۷ تا شهریور ۱۴۰۱». سربرگِ تاریخ حاکم (درس r297/r301/r302/r304/r305): «نوبت خرداد ماه سال ۱۴۰۱» (سال در OCR به‌صورت ١٠٤١ افتاده).
کشف‌های راند:
(۱) هفتمین نوبتِ منبعِ رسمی (پس از r299/r301/r302/r303/r304/r305) — سربرگِ «کلیه رشته ها»؛ رکوردِ نوِ بانک: ۲۰ بانک (پیشتر ۱۹) و ۵۳ آیتم (پیشتر ۵۱) — نخستین آزمونِ ۲۰ردیفیِ خانواده.
(۲) رکوردِ هم‌ترازِ چهار کلیدِ دولایه در یک نوبت (رکوردِ r305 تکرار شد): ۹ «online, smart»، ۱۰ «word, search»، ۲۷ «early, worm» (دو شکافِ حرفیِ هم‌زمان — دومین ضرب‌المثلِ دولایه)، ۳۷ «(running) water, electricity» (کلیدِ پرانتزدارِ اختیاری).
(۳) کلیدِ دومواریانتهٔ اسلش‌دار با پرانتزِ اختیاریِ ۵۲ «but these/those shoes (they) are big» — الگوی r304 (had got/gotten) این‌بار در جملهٔ مرکبِ تصویری.
(۴) ساقهٔ ۲۶ «Here you can see two high and two low tides each day.» عینِ r303-۲۶ — بازاستفادهٔ بین‌دوره‌ای با گاردِ برابری؛ ساقهٔ ۴۷ «What does "them" … refer to?» عینِ r302 — وقوعِ دوم.
(۵) متنِ فرهنگ‌لغتِ r302 بازگشته با دو ساقهٔ بازنویسی‌شده: «French» به‌جای «Latin» (۴۶، کلید False) و «Since …» به‌جای «Words are easily found …» (۴۵).
(۶) کلیدِ ۳۲ دوپاره با دو نشانِ (0/5): «had» + «fallen» — شکلِ صحیح فعلِ دومواریانتهٔ r304 این‌بار تک‌واریانته.
(۷) سربرگِ صوتیِ «Audio file (MP3) / Audio script (MP3)» — واریانتِ نو (پس از Audio script (PDF) و Audio file (PDF)).
۲۰ بانک / ۵۳ آیتم — خانوادهٔ موضوعی هفدهم: ۱۴۴۱ + ۵۳ = ۱۴۹۴ تست در ۳۰۴ بانک.
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
    s = re.sub(r"[\"'`´‘’“”«»˝\u02DD\u030B]", "", s)  # آکسان/گیومه — الگوی r300-r305
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
    """ساقه با خالیِ میانی: هر نیمه جداگانه راستی‌آزمایی می‌شود (الگوی r299-r305)"""
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

# ---------------------------------------------------------------- S1 شنیداری فایل ۱: مکالمهٔ شیلا و سمیرا — درست/نادرست (ص۳۳۶) — کلید b/a/b (موازیِ r305 با ساقه‌های متفاوت: Wednesday نه Friday)
s1 = [
    q_tf("g12-fin1401khh-l1tf1", 1, "They went to the museum on Wednesday.", 1),   # ۱ → False (b)
    q_tf("g12-fin1401khh-l1tf2", 2, "Samira has been to the museum of Holy Defense twice.", 0),  # ۲ → True (a)
    q_tf("g12-fin1401khh-l1tf3", 3, "They stayed with Samira till midnight.", 1),  # ۳ → False (b)
]
# ---------------------------------------------------------------- S2 شنیداری فایل ۲: مکالمهٔ بیژن و مهران — تست سه‌گزینه‌ای (ص۳۳۶) — کلید c/c/b/a (سومین وقوعِ همین دیالوگ: دی۹۸ / شهریور۱۴۰۰ / این نوبت)
s2 = [
    q_mcq("g12-fin1401khh-l2m1", 1, "What did Mehran want to buy at first? He wanted to buy --------------- .",
          ["a new car", "some clothes", "a mobile phone"], 2),                     # ۴ → (c)
    q_mcq("g12-fin1401khh-l2m2", 2, "Who was in trouble? --------------- .",
          ["Bijan", "Mehran", "Mehran’s friend"], 2),                              # ۵ → (c)
    q_mcq("g12-fin1401khh-l2m3", 3, "Mehran couldn’t tell him about the problem because --------------- .",
          ["it wasn’t an emergency", "it was a secret", "he needed no money"], 1), # ۶ → (b)
    q_mcq("g12-fin1401khh-l2m4", 4, "Bijan believed Mehran should help because --------------- .",
          ["A friend in need is a friend indeed", "No pain no gain", "Easy come, easy go"], 0),  # ۷ → (a)
]
# ---------------------------------------------------------------- S3 شنیداری فایل ۳: مکالمهٔ مریم و سارا — کامل کنید (ص۳۳۶) — کلیدِ پرانتزدارِ اختیاریِ ۸ + دو کلیدِ دولایهٔ ۹/۱۰
s3 = [
    q_typed("g12-fin1401khh-l3q1", 1,
            "What was Sara doing in the bookstore? She was looking for a ---------------.",
            ["dictionary", "good dictionary"],
            "کلید را بنویسید (واژهٔ داخل پرانتزِ راهنما اختیاری است)…"),            # ۸ → (good) dictionary
    q_typed("g12-fin1401khh-l3q2", 2,
            "Maryam suggested a free --------------- dictionary and apps for PCs and --------------- phones.",
            ["online, smart"],
            "دو واژهٔ کلیدِ راهنما را به ترتیب و با ویرگول بنویسید…"),               # ۹ → online, smart
    q_typed("g12-fin1401khh-l3q3", 3,
            "To access information about any ---------------, one should type the term into the --------------- box.",
            ["word, search"],
            "دو واژهٔ کلیدِ راهنما را به ترتیب و با ویرگول بنویسید…"),               # ۱۰ → word, search
]
# ---------------------------------------------------------------- S4 شنیداری فایل ۴: متنِ احترام به سالمندان — کامل کنید (ص۳۳۶) — شماره‌گذاریِ چاپیِ پرانتزدارِ ……(11)……-……(16)…… (الگوی r304) — کلید forgive/knowledge/faced/respecting/feel/appreciate
s4 = [
    q_typed("g12-fin1401khh-l4q1", 1,
            "Do you know why it is important to care for our elders? Because they are our mothers and fathers, and our first teachers. They teach us how to love, how to care, and how to ……(11)……--------------- others.",
            ["forgive"], "fill in the blank with the missing word…"),                 # ۱۱
    q_typed("g12-fin1401khh-l4q2", 2,
            "Elders have more ……(12)……--------------- and wisdom than any one of us.",
            ["knowledge"], "fill in the blank with the missing word…"),               # ۱۲
    q_typed("g12-fin1401khh-l4q3", 3,
            "We may or may not know of all the ups and downs they’ve ……(13)……--------------- in life but they have a lot of experience that is worth learning from.",
            ["faced"], "fill in the blank with the missing word…"),                   # ۱۳
    q_typed("g12-fin1401khh-l4q4", 4,
            "But the most important thing is their experience that is worth ……(14)……--------------- and learning from.",
            ["respecting"], "fill in the blank with the missing word…"),              # ۱۴
    q_typed("g12-fin1401khh-l4q5", 5,
            "Our elders may hide much pain from us because they don’t want us to ……(15)……--------------- the pain.",
            ["feel"], "fill in the blank with the missing word…"),                    # ۱۵
    q_typed("g12-fin1401khh-l4q6", 6,
            "The least we can do is to ……(16)……--------------- them for all that they’ve gone through and learn from their experience.",
            ["appreciate"], "fill in the blank with the missing word…"),              # ۱۶
]
# ---------------------------------------------------------------- S5 واژگان با تصویر (ص۳۳۷) — پنج جملهٔ چاپی با اضافهٔ (b) دوم‌جای (الگوی r302/r304) — کلید c/e/d/a
PIC_INSTR = "با توجه به تصاویر داده‌شده، جملهٔ مناسب برای هر تصویر را انتخاب کنید. (یک جمله اضافی است)"
PIC_OPTS = [
    "Try to avoid foods that contain a lot of fat.",      # a — کلیدِ ۲۰
    "Some scientists are working on producing electricity from plants.",  # b — اضافهٔ چاپی — دوم‌جای (r302/r304)
    "Many people use the new light bulbs that consume less electricity.",  # c — کلیدِ ۱۷
    "Wind towers are natural air cooling systems.",       # d — کلیدِ ۱۹ (خویشاوندِ l96/l143 و پاراگرافِ r304)
    "We have to speak louder, because my grandfather is hard of hearing.",  # e — کلیدِ ۱۸
]
s5 = [
    q_mcq("g12-fin1401khh-pic1", 1, PIC_INSTR, PIC_OPTS, 2),   # ۱۷ → (c)
    q_mcq("g12-fin1401khh-pic2", 2, PIC_INSTR, PIC_OPTS, 4),   # ۱۸ → (e)
    q_mcq("g12-fin1401khh-pic3", 3, PIC_INSTR, PIC_OPTS, 3),   # ۱۹ → (d)
    q_mcq("g12-fin1401khh-pic4", 4, PIC_INSTR, PIC_OPTS, 0),   # ۲۰ → (a)
]
# ---------------------------------------------------------------- S6 واژگان: جای خالی از بانک (ص۳۳۷) — پولِ نو با اضافهٔ suppose سوم‌جای — کلید effectively/communicative/replaced
POOL6 = ["communicative", "replaced", "suppose", "effectively"]
s6 = [
    q_typed("g12-fin1401khh-pool1", 1,
            "If students know how to study more ---------------, they’ll be able to learn more.",
            ["effectively"], "fill in the blank with a word from the pool…"),         # ۲۱
    q_typed("g12-fin1401khh-pool2", 2,
            "He wasn’t very --------------- and kept to himself.",
            ["communicative"], "fill in the blank with a word from the pool…"),       # ۲۲ — خویشاوندِ دی۹۸ (The old man wasn’t very…)
    q_typed("g12-fin1401khh-pool3", 3,
            "Mina carefully --------------- the glasses on the shelf.",
            ["replaced"], "fill in the blank with a word from the pool…"),            # ۲۳
]
for q in s6:
    q["options"] = list(POOL6)
# ---------------------------------------------------------------- S7 واژگان: تعریف‌های ستون B (ص۳۳۷) — اضافهٔ (b) دوم‌جای (الگوی r305) — کلید c/d/a
DEF_A = [
    "They have to arrange the chairs around the table for the party.",   # ۲۴ → c
    "The teacher recommended a learner’s dictionary to his students.",   # ۲۵ → d
    "Here you can see two high and two low tides each day.",             # ۲۶ → c؟ نه — a؛ عینِ r303-۲۶
]
DEF_OPTS = [
    "the rise and fall of the sea",                    # a — کلیدِ ۲۶
    "take something in, especially gradually",         # b — اضافهٔ چاپی — دوم‌جای (r305)
    "put things in a neat, attractive, or useful order",  # c — کلیدِ ۲۴
    "tell somebody that something is good",            # d — کلیدِ ۲۵
]
s7 = [
    q_mcq("g12-fin1401khh-def1", 1, "They have to arrange the chairs around the table for the party.", DEF_OPTS, 2),   # ۲۴ → (c)
    q_mcq("g12-fin1401khh-def2", 2, "The teacher recommended a learner’s dictionary to his students.", DEF_OPTS, 3),   # ۲۵ → (d)
    q_mcq("g12-fin1401khh-def3", 3, "Here you can see two high and two low tides each day.", DEF_OPTS, 0),             # ۲۶ → (a) — عینِ r303-۲۶
]
# ---------------------------------------------------------------- S8 ضرب‌المثل با شکافِ حرفی (ص۳۳۷) — دومین ضرب‌المثلِ دولایهٔ خانواده (r305-۲۷ نخستین) — کلید early, worm؛ خویشاوندِ r301-۲۷ با کلیدِ تک‌واژه‌ای worm
s8 = [
    q_typed("g12-fin1401khh-ok1", 1,
            "You should wake up and start work sooner if you want to succeed. You know that “the e --------------- bird catches the w ---------------”.",
            ["early, worm"],
            "دو واژهٔ کلیدِ راهنما را به ترتیب و با ویرگول بنویسید…"),               # ۲۷ → early, worm
]
# ---------------------------------------------------------------- S9 گرامر: تست چهارگزینه‌ای (ص۳۳۸) — کلید d/b/a/c — ساقهٔ ۳۰ (has been translated) تازهٔ خانواده
s9 = [
    q_mcq("g12-fin1401khh-g1", 1,
          "A: Hamid has not come to school. I’ve heard he is not well, --------------- ?\nB: Oh ,yes. He has got a flu.",
          ["has he", "have I", "hasn’t Hamid", "is he"], 3),                       # ۲۸ → (d) — تگ‌کوئشنِ «he is not well»
    q_mcq("g12-fin1401khh-g2", 2,
          "The woman --------------- my sister met in the hospital is a nurse.",
          ["which", "whom", "whose", "where"], 1),                                 # ۲۹ → (b)
    q_mcq("g12-fin1401khh-g3", 3,
          "This book --------------- into countless languages including German, English and French.",
          ["has been translated", "had translated", "may translate", "were translated"], 0),  # ۳۰ → (a)
    q_mcq("g12-fin1401khh-g4", 4,
          "A: This summer is really hot and lots of animals are in danger.\nB: Something --------------- about global warming, or some types of animals will die out.",
          ["must do", "were done", "should be done", "are doing"], 2),             # ۳۱ → (c)
]
# ---------------------------------------------------------------- S10 شکل صحیح فعل (ص۳۳۸) — کلیدِ دوپاره با دو (0/5): had + fallen — تک‌واریانته (برخلافِ اسلش‌دارِ r304)
s10 = [
    q_typed("g12-fin1401khh-vf1", 1,
            "When I got home, the baby --------------- asleep. (fall)",
            ["had fallen"], "شکل صحیح فعل داخل پرانتز را بنویسید…"),              # ۳۲ → had fallen
]
# ---------------------------------------------------------------- S11 مرتب‌کردن کلمات (ص۳۳۸) — کلیدهای بازسازی‌شده از قطعاتِ RTL
s11 = [
    q_typed("g12-fin1401khh-ws1", 1,
            "They / their son / the driving test / were excited / had passed / because /.",
            ["They were excited because their son had passed the driving test."],
            "با هر گروه از کلمات یک جمله بنویسید…"),                                  # ۳۳
    q_typed("g12-fin1401khh-ws2", 2,
            "weren’t raining/ if / do / What/ it/ would you /? /",
            ["What would you do if it weren’t raining?"],
            "با هر گروه از کلمات یک جمله بنویسید…"),                                  # ۳۴
]
# ---------------------------------------------------------------- S12 ضمیر موصولی (ص۳۳۸) — راهنما: who یا whom با جمله/عبارتِ دارایِ فعل — کلیدِ (m) who
s12 = [
    q_typed("g12-fin1401khh-rel1", 1,
            "A doctor is a person --------------- .",
            ["who", "whom"],
            "who یا whom را به همراه یک جمله یا عبارت دارای فعل، در ادامه بنویسید…"),  # ۳۵
]
# ---------------------------------------------------------------- S13 ریدینگ برق‌آبی (ص۳۳۸-۳۳۹) — متنِ تازهٔ خانواده — کلید True / دولایهٔ پرانتزدارِ (running) water, electricity / c / b / d
s13 = [
    q_tf("g12-fin1401khh-r1tf1", 1,
         "According to the passage, the energy in moving water can generate clean, renewable, and cheap electricity.", 0),  # ۳۶ → True (a)
    q_typed("g12-fin1401khh-r1q1", 2,
            "Many countries produce energy from --------------- and convert it to --------------- .",
            ["running water, electricity", "water, electricity"],
            "دو واژهٔ کلیدِ راهنما را به ترتیب و با ویرگول بنویسید (واژهٔ داخل پرانتزِ راهنما اختیاری است)…"),  # ۳۷ → (running) water, electricity
    q_mcq("g12-fin1401khh-r1m1", 3,
          "The power produced from falling or running water is called --------------- .",
          ["water cycle", "turbine", "hydropower", "generator"], 2),               # ۳۸ → (c)
    q_mcq("g12-fin1401khh-r1m2", 4,
          "The passage says --------------- makes hydropower renewable.",
          ["electricity", "water", "earth", "cloud"], 1),                          # ۳۹ → (b)
    q_mcq("g12-fin1401khh-r1m3", 5,
          "What is the best title for this text?",
          ["Different sources of energy", "Converting electricity", "Electrical air conditioner", "Hydropower"], 3),  # ۴۰ → (d)
]
# ---------------------------------------------------------------- S14 ریدینگ مایک و جان: تست چهارگزینه‌ای (ص۳۳۹) — متنِ تازهٔ خانواده — کلید d/a
s14 = [
    q_mcq("g12-fin1401khh-r2m1", 1,
          "According to the passage, Mike hadn’t --------------- such a dark and quiet street before.",
          ["pulled over", "gone", "come out of", "experienced"], 3),               # ۴۱ → (d)
    q_mcq("g12-fin1401khh-r2m2", 2,
          "John --------------- at Mike and came out of the car.",
          ["waved", "wondered", "remembered", "apologized"], 0),                   # ۴۲ → (a)
]
# ---------------------------------------------------------------- S15 ریدینگ مایک و جان: پرسش پاسخ (ص۳۳۹) — کلیدِ جمله‌کاملِ ۴۳ با سه نشانِ (0.25/0.25/0.5) و کلیدِ پرانتزدارِ ۴۴ با (0.25/0.75)
s15 = [
    q_typed("g12-fin1401khh-r2q1", 1,
            "What did John ask Mike when he came out of the car?",
            ["He asked him if he could drive him home.", "He asked Mike if he could drive him home."],
            "answer with the printed key…"),                                          # ۴۳
    q_typed("g12-fin1401khh-r2q2", 2,
            "Why was John upset and worried the last time he was in the office?",
            ["John was upset because he had lost his documents.", "because he had lost his documents"],
            "answer with the printed key (بخشِ داخل پرانتزِ راهنما اختیاری است)…"),    # ۴۴
]
# ---------------------------------------------------------------- S16 ریدینگ فرهنگ‌لغت: درست/نادرست (ص۳۳۹) — متنِ r302 بازگشته با دو ساقهٔ بازنویسی‌شده — کلید True/False؛ «French» نه «Latin» (الگوی r302-۴۶)
s16 = [
    q_tf("g12-fin1401khh-r3tf1", 1, "Since dictionaries put words in alphabetical order, you can find them easily.", 0),  # ۴۵ → True (a) — بازنویسیِ r302-۴۵
    q_tf("g12-fin1401khh-r3tf2", 2, "The word ‘dictionary’ comes from the French ‘dictio’.", 1),  # ۴۶ → False (b) — «French» به‌جای «Latin»
]
# ---------------------------------------------------------------- S17 ریدینگ فرهنگ‌لغت: پرسش پاسخ (ص۳۴۰) — ساقهٔ ۴۷ عینِ r302 (وقوعِ دوم)؛ کلیدهای بازسازی‌شده از قطعاتِ RTL
s17 = [
    q_typed("g12-fin1401khh-r3q1", 1,
            "What does “them” in the first line of paragraph 3 refer to?",
            ["It refers to words.", "words"],
            "answer with the printed key…"),                                          # ۴۷ → عینِ r302-r1m2 (MCQ آنجا، پرسشِ باز اینجا)
    q_typed("g12-fin1401khh-r3q2", 2,
            "What is a technical dictionary?",
            ["A dictionary which explains the meanings of technical words."],
            "answer with the printed key…"),                                          # ۴۸ → بازسازی از قطعاتِ RTL
    q_typed("g12-fin1401khh-r3q3", 3,
            "IPA stands for --------------- .",
            ["International Phonetic Alphabet", "the International Phonetic Alphabet"],
            "answer with the printed key…"),                                          # ۴۹ → بازسازی از قطعاتِ RTL «Alphabet. / International Phonetic»
]
# ---------------------------------------------------------------- S18 کلمات ربط (ص۳۴۰) — کلید so/but؛ هر دو ساقه تازهٔ خانواده
CONN_POOL = ["but", "and", "so", "or"]
s18 = [
    q_typed("g12-fin1401khh-conn1", 1,
            "Shiva has an exam tomorrow, --------------- she must study well tonight.",
            ["so"], "fill in the blank with a connective…"),                          # ۵۰
    q_typed("g12-fin1401khh-conn2", 2,
            "My English class is really enjoyable, --------------- I have a lot of homework to do.",
            ["but"], "fill in the blank with a connective…"),                         # ۵۱
]
for q in s18:
    q["options"] = list(CONN_POOL)
# ---------------------------------------------------------------- S19 جملهٔ مرکب با تصویر (ص۳۴۰) — کلیدِ دومواریانتهٔ اسلش‌دار + پرانتزِ اختیاریِ چاپی «but these/those shoes (they) are big.»
s19 = [
    q_typed("g12-fin1401khh-cx1", 1,
            "These shoes are small, --------------- .",
            ["These shoes are small, but these shoes are big.",
             "These shoes are small, but those shoes are big.",
             "but these shoes are big",
             "but those shoes are big"],
            "با یکی از کلمات ربط (but, so, or) و تصویر، جملهٔ مرکبِ معنادار بنویسید…"),  # ۵۲
]
# ---------------------------------------------------------------- S20 جملهٔ نامرتبط (Not Supporting Sentence) (ص۳۴۰) — نخستین بانکِ «مشخص کنید» از متنِ مورچه‌ها (خویشاوندِ r303-247 و Topicِ r305) — کلیدِ چاپیِ تک‌جمله‌ای
s20 = [
    q_typed("g12-fin1401khh-ns1", 1,
            "Ants are interesting insects. Like all insects, they have six legs. Each leg has three joints. Yesterday, my sister saw an ant. The legs of ants are very strong, which help ants run very quickly. If a man could run as fast for his size as an ant can, he could run as fast as a racehorse. Ants can lift 20 times their own body weight. So, they are amazing and odd insects. (Not Supporting Sentence را بنویسید)",
            ["Yesterday, my sister saw an ant."],
            "جملهٔ نامرتبطِ متن را بنویسید…"),                                        # ۵۳
]

BANKS = [
    (285, "نهایی سراسری خرداد ۱۴۰۱ — شنیداری فایل ۱: مکالمه شیلا و سمیرا، درست/نادرست (ص۳۳۶)", "استاندارد", s1),
    (286, "نهایی سراسری خرداد ۱۴۰۱ — شنیداری فایل ۲: مکالمه بیژن و مهران، تست سه‌گزینه‌ای (ص۳۳۶)", "استاندارد", s2),
    (287, "نهایی سراسری خرداد ۱۴۰۱ — شنیداری فایل ۳: مکالمه مریم و سارا، کامل کنید (ص۳۳۶)", "آموزشی — ورود آزاد", s3),
    (288, "نهایی سراسری خرداد ۱۴۰۱ — شنیداری فایل ۴: متن احترام به سالمندان، کامل کنید (ص۳۳۶)", "آموزشی — ورود آزاد", s4),
    (289, "نهایی سراسری خرداد ۱۴۰۱ — واژگان با تصویر: جملهٔ مناسب هر تصویر (ص۳۳۷)", "استاندارد", s5),
    (290, "نهایی سراسری خرداد ۱۴۰۱ — واژگان: جای خالی از بانک (ص۳۳۷)", "آموزشی — ورود آزاد", s6),
    (291, "نهایی سراسری خرداد ۱۴۰۱ — واژگان: تعریف‌های ستون B (ص۳۳۷)", "استاندارد", s7),
    (292, "نهایی سراسری خرداد ۱۴۰۱ — واژگان: ضرب‌المثل با شکافِ حرفی، کامل کنید (ص۳۳۷)", "آموزشی — ورود آزاد", s8),
    (293, "نهایی سراسری خرداد ۱۴۰۱ — گرامر: تست چهارگزینه‌ای (ص۳۳۸)", "استاندارد", s9),
    (294, "نهایی سراسری خرداد ۱۴۰۱ — شکل صحیح فعل، بنویسید (ص۳۳۸)", "آموزشی — ورود آزاد", s10),
    (295, "نهایی سراسری خرداد ۱۴۰۱ — مرتب‌کردن کلمات، بنویسید (ص۳۳۸)", "آموزشی — ورود آزاد", s11),
    (296, "نهایی سراسری خرداد ۱۴۰۱ — ضمیر موصولی، کامل کنید (ص۳۳۸)", "آموزشی — ورود آزاد", s12),
    (297, "نهایی سراسری خرداد ۱۴۰۱ — ریدینگ برق‌آبی: درست/نادرست + کامل کنید + تست (ص۳۳۸-۳۳۹)", "آموزشی — ورود آزاد", s13),
    (298, "نهایی سراسری خرداد ۱۴۰۱ — ریدینگ مایک و جان: تست چهارگزینه‌ای (ص۳۳۹)", "استاندارد", s14),
    (299, "نهایی سراسری خرداد ۱۴۰۱ — ریدینگ مایک و جان: پرسش پاسخ (ص۳۳۹)", "آموزشی — ورود آزاد", s15),
    (300, "نهایی سراسری خرداد ۱۴۰۱ — ریدینگ فرهنگ‌لغت: درست/نادرست (ص۳۳۹)", "استاندارد", s16),
    (301, "نهایی سراسری خرداد ۱۴۰۱ — ریدینگ فرهنگ‌لغت: پرسش پاسخ (ص۳۴۰)", "آموزشی — ورود آزاد", s17),
    (302, "نهایی سراسری خرداد ۱۴۰۱ — کلمات ربط، کامل کنید (ص۳۴۰)", "آموزشی — ورود آزاد", s18),
    (303, "نهایی سراسری خرداد ۱۴۰۱ — جملهٔ مرکب با کلمهٔ ربط و تصویر، بنویسید (ص۳۴۰)", "آموزشی — ورود آزاد", s19),
    (304, "نهایی سراسری خرداد ۱۴۰۱ — جملهٔ نامرتبط (Not Supporting)، مشخص کنید (ص۳۴۰)", "آموزشی — ورود آزاد", s20),
]

# ================================================================ راستی‌آزماییِ OCR (وفاداریِ بدنه ص۳۳۶-۳۴۰ و راهنمای ص۳۴۱-۳۴۲)
PROBES = [
    # سربرگِ رسمی — «کلیه رشته ها» + نوبتِ خرداد (سال در OCR به‌صورت ١٠٤۱ افتاده)
    "مركز سنجش و پايش كيفيت آموزشي", "سراسركشور در نوبت", "خرداد", "http://aee.medu.ir",
    "دوازدهم", "دورة دوم متوسطه",
    # سربرگِ صوتی — واریانتِ نوِ MP3
    "Audio file (MP3)", "Audio script (MP3)",
    # S1 — شیلا و سمیرا (موازیِ r305 با ساقه‌های متفاوت)
    "به مكالمه بين", "They went to the museum on Wednesday.",
    "Samira has been to the museum of Holy Defense twice.", "They stayed with Samira till midnight.",
    "1. False (b)", "2.True (a)", "3. False (b)",
    # S2 — بیژن و مهران
    "بيژن و", "What did Mehran want to buy at first? He wanted to buy",
    "a) a new car", "b) some clothes", "c) a mobile phone",
    "Who was in trouble?", "a) Bijan", "b) Mehran", "c) Mehran’s friend",
    "Mehran couldn’t tell him about the problem because",
    "a) it wasn’t an emergency", "b) it was a secret", "c) he needed no money",
    "Bijan believed Mehran should help because",
    "A friend in need is a friend indeed", "No pain no gain", "Easy come, easy go",
    "4. (c)", "5. (c)", "6. (b)", "7. (a)",
    # S3 — مریم و سارا
    "مريم و، سارا گوش دهيد", "What was Sara doing in the bookstore? She was looking for a",
    "Maryam suggested a free………… dictionary and apps for PCs and …………  phones.",
    "To access information about any ………., one should type the term into the……… box.",
    "8. (good) dictionary", "9. online, smart", "10. word, search",
    # S4 — سالمندان
    "احترام به سالمندان", "Do you know why it is important to care for our elders?",
    "how to ……(11)……others", "Elders have more ……. (12)…… and wisdom than any one of us.",
    "they’ve …….(13)……. in life", "worth ……(14)…… and learning from",
    "us to ……(15)…….. the pain", "……(16)….. them for all that they’ve gone through",
    "11. forgive", "12. knowledge", "13. faced", "14. respecting", "15. feel", "16. appreciate",
    # S5 — تصویری
    "Try to avoid foods that contain a lot of fat.",
    "Some scientists are working on producing electricity from plants.",
    "Many people use the new light bulbs that consume less electricity.",
    "Wind towers are natural air cooling systems.",
    "We have to speak louder, because my grandfather is hard of hearing.",
    "17. (c)", "18. (e)", "19. (d)", "20. (a)",
    # S6 — پول
    "communicative, replaced, suppose, effectively",
    "If students know how to study more ………….., they’ll be able to learn more.",
    "He wasn’t very ………….. and kept to himself.",
    "Mina carefully …………. the glasses on the shelf.",
    "21. effectively", "22. communicative", "23. replaced",
    # S7 — تعریف‌ها
    "They have to arrange the chairs around the table for the party.",
    "The teacher recommended a learner’s dictionary to his students.",
    "Here you can see two high and two low tides each day.",
    "the rise and fall of the sea", "take something in, especially gradually",
    "put things in a neat, attractive, or useful order", "tell somebody that something is good",
    "24. (c)", "25. (d)", "26. (a)",
    # S8 — ضرب‌المثل
    "You should wake up and start work sooner if you want to succeed",
    "bird  catches the w", "27. early, worm",
    # S9 — گرامر
    "Hamid has not come to school. I’ve heard he is not well",
    "Oh ,yes. He has got a flu.",
    "a) has he", "b) have I", "c) hasn’t Hamid", "d) is he",
    "The woman ……….. my sister met in the hospital is a nurse.",
    "a) which", "b) whom", "c) whose", "d) where",
    "into countless languages including German, English and French.",
    "a) has been translated", "b) had translated", "c) may translate", "d) were translated",
    "This summer is really hot and lots of animals are in danger.",
    "Something …………..about global warming, or some types of animals will die out.",
    "a) must do", "b) were done", "c) should be done", "d) are doing",
    "28. (d)", "29. (b)", "30. (a)", "31. (c)",
    # S10 — شکل فعل
    "When I got home, the baby………… asleep. (fall)", "fallen", "had",
    # S11 — مرتب‌کردن
    "They / their son / the driving test / were excited / had passed / because /.",
    "weren’t raining/ if / do / What/ it/ would you /? /",
    "the driving test.", "had passed", "their son", "because", "were excited", "They",
    "raining", "weren’t", "would you", "What",
    # S12 — موصولی
    "A doctor is a person", "whoياwhom",
    # S13 — برق‌آبی
    "Many countries have used the energy in moving water for thousands of years.",
    "it's still a powerful resource that can generate clean, renewable, and cheap electricity",
    "The power that is produced as a result of falling or running water is called",
    "hydroelectric power", "hydropower", "Turbines and generators convert this power into electricity.",
    "about 19% of all our electricity is generated from hydropower",
    "Water is converted into clouds and recycles back to earth as rain",
    "The Water Cycle", "The water cycle is continuously recharging",
    "According to the passage, the energy in moving water can generate clean, renewable, and cheap electricity.",
    "Many countries produce energy from …….……… and convert it to ………………. .",
    "The power produced from falling or running water is called……………. .",
    "a) water cycle", "b) turbine", "c) hydropower", "d) generator",
    "The passage says…………… makes hydropower renewable.",
    "a) electricity", "b) water", "c) earth", "d) cloud",
    "What is the best title for this text?",
    "a) Different  sources of energy", "b) Converting electricity", "c) Electrical air conditioner", "d) Hydropower",
    "36. (a) True", "37. (running) water,  electricity", "38. ( c )", "39. (b)", "40. (d)",
    # S14/S15 — مایک و جان
    "Last night Mike left work late at around 9 p.m.",
    "Most people had already gone home before he came out of the office.",
    "The street was very dark and quiet. He hadn’t experienced such a thing before.",
    "While he was walking, a car pulled over.",
    "The driver waved at him and came out of the car.",
    "He asked Mike if he could drive him home.",
    "Suddenly Mike remembered he was one of his clients.", "His name was John.",
    "John had come to his office two or three times before.",
    "He was worried because he had lost his documents.",
    "They started to look for his suitcase.",
    "Finally, he remembered that he had left his suitcase in his car!",
    "He apologized for his anger and left.",
    "Mike hadn’t …………. such a dark and quiet street before.",
    "a) pulled over", "b) gone", "c) come out of", "d) experienced",
    "John……………at Mike and came out of the car.",
    "a) waved", "b) wondered", "c) remembered", "d) apologized",
    "41. (d)", "42. (a)",
    "What did John ask Mike when he came out of the car?",
    "Why was John upset and worried the last time he was in the office?",
    "he could drive him home.", "(John was upset ) because he had lost his documents.",
    # S16/S17 — فرهنگ‌لغت
    "A dictionary is a book which explains the meanings of words and expressions.",
    "You can find words easily because dictionaries put them in alphabetical order.",
    "The word ‘dictionary’ comes from the", "‘saying’",
    "dictionaries of biography which tell about famous people",
    "technical dictionaries which explain the meanings of technical words",
    "give a clear ‘definition’ of them",
    "the International Phonetic Alphabet (IPA) is used for this purpose",
    "one has to be careful to choose the right meaning",
    "Since dictionaries put words in alphabetical order, you can find them easily.",
    "The word ‘dictionary’ comes from the French ‘dictio’.",
    "45. (a) True", "46. (b) False",
    "What does “them” in the first line of paragraph 3 refer to?",
    "What is a technical dictionary?", "IPA stands for",
    "It refers to words.", "the meanings of technical words.", "explain", "A dictionary which",
    "International Phonetic", "Alphabet.",
    # S18 — ربط
    "Shiva has an exam tomorrow, ………. she must study well tonight.",
    "My English class is really enjoyable, ….……. I have a lot of homework to do.",
    "50. so", "51. but",
    # S19 — مرکبِ تصویری
    "These shoes are small,", "but these/those shoes (they) are big.",
    # S20 — نامرتبط
    "Not Supporting Sentence", "Ants are interesting insects. Like all insects, they have six legs.",
    "Each leg has three joints.", "Yesterday, my sister saw an ant.",
    "The legs of ants are very strong, which help ants run very quickly.",
    "If a man could run as fast for his size as an ant can, he could run as fast as a racehorse.",
    "Ants can lift 20 times their own body weight.", "So, they are amazing and odd insects.",
    # ردیف‌های استخراج‌نشده (Topic/پاراگراف — بارمِ اصولی)
    "Pollution", "Firefighters", "Solar energy", "common type of clean energy",
    "as a heat source for thousands of years", "heating water and air in homes and buildings",
    # راهنمای تصحیح + پایان
    "راهنماي تصحيح امتحان نهايي", "GOOD LUCK",
]
for p in PROBES:
    require(ocr_has(p), f"OCR probe missing: {p[:70]}")

ALL_QS = [q for _, _, _, qs in BANKS for q in qs]
require(len(ALL_QS) == 53, f"total questions {len(ALL_QS)} != 53")

# داوریِ دومِ مستقل — کلیدهای حرفی در SECOND با استخرِ گزینه‌ها
LETTER_KEYS = {
    "g12-fin1401khh-l2m1": ("abc", "c"), "g12-fin1401khh-l2m2": ("abc", "c"),
    "g12-fin1401khh-l2m3": ("abc", "b"), "g12-fin1401khh-l2m4": ("abc", "a"),
    "g12-fin1401khh-pic1": ("abcde", "c"), "g12-fin1401khh-pic2": ("abcde", "e"),
    "g12-fin1401khh-pic3": ("abcde", "d"), "g12-fin1401khh-pic4": ("abcde", "a"),
    "g12-fin1401khh-def1": ("abcd", "c"), "g12-fin1401khh-def2": ("abcd", "d"),
    "g12-fin1401khh-def3": ("abcd", "a"),
    "g12-fin1401khh-g1": ("abcd", "d"), "g12-fin1401khh-g2": ("abcd", "b"),
    "g12-fin1401khh-g3": ("abcd", "a"), "g12-fin1401khh-g4": ("abcd", "c"),
    "g12-fin1401khh-r1m1": ("abcd", "c"), "g12-fin1401khh-r1m2": ("abcd", "b"),
    "g12-fin1401khh-r1m3": ("abcd", "d"),
    "g12-fin1401khh-r2m1": ("abcd", "d"), "g12-fin1401khh-r2m2": ("abcd", "a"),
}
for qid, (pool, letter) in LETTER_KEYS.items():
    q = next(x for x in ALL_QS if x["id"] == qid)
    require(q["kind"] == "mcq", f"{qid} must be mcq")
    require(q["answer"] == pool.index(letter), f"{qid}: answer {q['answer']} != guide letter {letter}")

# درست/نادرست — کلیدهای چاپیِ b/a/b و a و a/b
TF_KEYS = {
    "g12-fin1401khh-l1tf1": "b", "g12-fin1401khh-l1tf2": "a", "g12-fin1401khh-l1tf3": "b",
    "g12-fin1401khh-r1tf1": "a", "g12-fin1401khh-r3tf1": "a", "g12-fin1401khh-r3tf2": "b",
}
for qid, letter in TF_KEYS.items():
    q = next(x for x in ALL_QS if x["id"] == qid)
    require(q["options"] == ["True", "False"], f"{qid}: not a True/False item")
    require(q["answer"] == (0 if letter == "a" else 1), f"{qid}: TF answer != printed {letter}")

# کلیدهای تایپی — هر accepted باید در OCR یا راهنما ریشهٔ چاپی داشته باشد
TYPED_KEYS = {
    "g12-fin1401khh-l3q1": ["dictionary"],          # (good) dictionary — پرانتزِ اختیاری
    "g12-fin1401khh-l3q2": ["online", "smart"],
    "g12-fin1401khh-l3q3": ["word", "search"],
    "g12-fin1401khh-l4q1": ["forgive"], "g12-fin1401khh-l4q2": ["knowledge"],
    "g12-fin1401khh-l4q3": ["faced"], "g12-fin1401khh-l4q4": ["respecting"],
    "g12-fin1401khh-l4q5": ["feel"], "g12-fin1401khh-l4q6": ["appreciate"],
    "g12-fin1401khh-pool1": ["effectively"], "g12-fin1401khh-pool2": ["communicative"],
    "g12-fin1401khh-pool3": ["replaced"],
    "g12-fin1401khh-ok1": ["early", "worm"],
    "g12-fin1401khh-vf1": ["had", "fallen"],
    "g12-fin1401khh-ws1": ["They were excited because their son had passed the driving test."],
    "g12-fin1401khh-ws2": ["What would you do if it weren’t raining?"],
    "g12-fin1401khh-rel1": ["who", "whom"],
    "g12-fin1401khh-r1q1": ["running water", "electricity"],
    "g12-fin1401khh-r2q1": ["He asked him if he could drive him home."],
    "g12-fin1401khh-r2q2": ["because he had lost his documents"],
    "g12-fin1401khh-r3q1": ["It refers to words"],
    "g12-fin1401khh-r3q2": ["A dictionary which explains the meanings of technical words."],
    "g12-fin1401khh-r3q3": ["International Phonetic Alphabet"],
    "g12-fin1401khh-conn1": ["so"], "g12-fin1401khh-conn2": ["but"],
    "g12-fin1401khh-cx1": ["but these shoes are big", "but those shoes are big"],
    "g12-fin1401khh-ns1": ["Yesterday, my sister saw an ant."],
}
for qid, keys in TYPED_KEYS.items():
    q = next(x for x in ALL_QS if x["id"] == qid)
    require(q["kind"] == "typed", f"{qid} must be typed")
    for k in keys:
        require(any(k in a for a in q["accepted"]), f"{qid}: accepted lacks printed key variant {k[:40]}")

# ساقه‌های تایپی — هر نیمه باید در OCR ریشه داشته باشد
for qid in ["g12-fin1401khh-l3q2", "g12-fin1401khh-l3q3", "g12-fin1401khh-ok1",
            "g12-fin1401khh-vf1", "g12-fin1401khh-r1q1", "g12-fin1401khh-rel1",
            "g12-fin1401khh-r3q3", "g12-fin1401khh-conn1", "g12-fin1401khh-conn2", "g12-fin1401khh-cx1"]:
    q = next(x for x in ALL_QS if x["id"] == qid)
    require(ocr_has_stem(q["question"]), f"{qid}: stem not OCR-rooted: {q['question'][:60]}")

# ================================================================ تزریق (idempotent — خروجیِ ناقصِ رانِ قبلی پاک می‌شود)
data = json.loads(BANK_PATH.read_text(encoding="utf-8"))
data["lessons"] = [l for l in data["lessons"] if l["lesson"] < 285]
data["source"].pop("final1401khh", None)
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

require(data["lessons"][-1]["lesson"] == 284, f"family tail is {data['lessons'][-1]['lesson']}, expected 284")
require([l["lesson"] for l in new_lessons] == list(range(285, 305)), "lesson numbers must be 285..304")
require(total_new == 53, f"total new items {total_new} != 53")

data["lessons"].extend(new_lessons)

data["source"]["final1401khh"] = {
    "pages": "336-340",
    "keyPages": "341-342",
    "titlePrinted": "آزمون نهایی انگلیسی دوازدهم — نوبت خرداد ماه سال ۱۴۰۱ (سال در OCR به‌صورت ١٠٤١ افتاده)، رسمیِ سراسریِ کلیهٔ رشته‌ها، مرکز سنجش و پایش کیفیت آموزشی (aee.medu.ir)، ۵ صفحه، جمع نمره ۴۰ — پانزدهمین نوبتِ خانواده، هفتمین نوبتِ منبعِ رسمی",
    "sections": 20,
    "banks": 20,
    "questions": 53,
    "keys": 53,
    "extractedRound": 306,
    "branchVariant": "پانزدهمین نوبتِ خانواده — هفتمین نوبتِ منبعِ رسمی: نخستین آزمونِ ۲۰ردیفی/۲۰بانکیِ خانواده (رکورد) + رکوردِ هم‌ترازِ چهار کلیدِ دولایه (۹ online,smart / ۱۰ word,search / ۲۷ early,worm دولایهٔ حرفی / ۳۷ (running) water,electricity پرانتزدار) + کلیدِ دومواریانتهٔ اسلش‌دارِ مرکبِ تصویریِ ۵۲ (but these/those shoes (they) are big) + کلیدِ دوپارهٔ ۳۲ (had+fallen با دو 0/5) + بازگشتِ متنِ فرهنگ‌لغتِ r302 با دو ساقهٔ بازنویسی‌شده (French/Latin و Since) + سربرگِ صوتیِ MP3.",
    "audioFilesAbsent": True,
    "openWritingAbsent": {"items": "۵۴/۵۵ (Topic sentence برای Pollution/Firefighters) و ۵۶ (پاراگرافِ Solar energy با داده‌های چاپی common type of clean energy / as a heat source for thousands of years / heating water and air in homes and buildings)", "reason": "راهنما فقط بارمِ اصولی می‌دهد — الگوی r296-r305؛ در برابرِ آن، ۵۳ (Not Supporting) نخستین‌بار تایپیِ قابلِ بازی شد"},
    "receipts": [
        "هفتمین نوبتِ منبعِ رسمیِ مرکز سنجش — سالِ چاپی در OCR به‌صورت ١٠٤۱ افتاده (جابجاییِ ارقامِ فارسی)؛ سربرگِ «نوبت خرداد» حاکم شد (درسِ r297/r301/r302/r304/r305)",
        "رکوردِ نوِ بانک: ۲۰ بانک/۵۳ آیتم (پیشتر حداکثر ۱۹/۵۱) — نخستین آزمونِ ۲۰ردیفیِ خانواده؛ ردیفِ ۱۸ «Not Supporting» نخستین بانکِ تایپیِ «مشخص کنید» از متنِ مورچه‌ها (خویشاوندِ r303-247 و Topicِ r305-54)",
        "رکوردِ هم‌ترازِ چهار کلیدِ دولایه: ۹ «online, smart» / ۱۰ «word, search» / ۲۷ «early, worm» (دو شکافِ حرفیِ هم‌زمان — دومین ضرب‌المثلِ دولایه پس از r305-27) / ۳۷ «(running) water, electricity» — ۳۷ نخستین کلیدِ دولایهٔ پرانتزدارِ اختیاری",
        "کلیدِ دومواریانتهٔ اسلش‌دارِ ۵۲ «but these/those shoes (they) are big.» با پرانتزِ اختیاریِ (they) — الگوی r304 (had got/gotten) این‌بار در جملهٔ مرکبِ تصویری؛ accepted چهار واریانت (کامل/نیمه × these/those)",
        "کلیدِ دوپارهٔ ۳۲ «had fallen» با دو نشانِ (0/5) — تک‌واریانته؛ شکلِ فعلِ دولایهٔ r304 (had got/gotten) نشانِ اسلش داشت، این‌بار دوپاره با بارم",
        "بازاستفاده‌های بین‌دوره‌ای با گاردِ برابری: ساقهٔ ۲۶ عینِ r303-26 (tides)؛ ساقهٔ ۴۷ عینِ r302-r1m2 (refer to — وقوعِ دوم؛ آنجا MCQ، اینجا پرسشِ باز)؛ متنِ فرهنگ‌لغتِ r302 بازگشته با دو ساقهٔ بازنویسی‌شده («French» به‌جای «Latin» با کلیدِ False و «Since …» به‌جای «Words are easily found …»)",
        "خویشاوندی‌های خانواده: دیالوگِ Mehran/Bijan سومین وقوع (دی۹۸-l69 / شهریور۱۴۰۰-l250 / این نوبت) با سؤال‌های متفاوت؛ دیالوگِ شیلا/سمیرا موازیِ r305 با ساقه‌های متفاوت (Wednesday نه Friday)؛ اضافهٔ تصویریِ (b) دوم‌جای (r302/r304)؛ اضافهٔ تعریف‌های (b) دوم‌جای (r305)؛ اضافهٔ پولِ suppose سوم‌جای؛ جملهٔ تصویریِ Wind towers خویشاوندِ l96/l143 و پاراگرافِ r304؛ ضرب‌المثلِ early bird خویشاوندِ r301-27 (کلیدِ تک‌واژه‌ای worm) و r299",
        "وفاداری‌های چاپی: «2.True (a)» بدونِ فاصله، «38. ( c )» با فاصلهٔ چاپی، «Oh ,yes.» با ویرگولِ چسبیده، «19%»، «Mehran’s friend»، «9 p.m.»، سربرگِ صوتیِ «Audio file (MP3) / Audio script (MP3)» — واریانتِ نو پس از Audio script (PDF) و Audio file (PDF)",
        "پنج دکمهٔ شنیداری با فایلِ صوتیِ غایب — الگوی r292-r305",
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
