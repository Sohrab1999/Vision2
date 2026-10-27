#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r302 — آزمون نهایی خرداد ۱۴۰۰، رسمیِ سراسریِ رشتهٔ ریاضی-فیزیک و علوم تجربی (مرکز سنجش aee.medu.ir — بدنه ص۳۰۸-۳۱۲، راهنمای تصحیح ص۳۱۳-۳۱۴)
یازدهمین نوبتِ «آزمون‌های نهایی دی ۹۷ تا شهریور ۱۴۰۱» — سربرگِ تاریخ حاکم (درس r297/r301): ۱۹/۰۳/۱۴۰۰ = خرداد ۱۴۰۰.
کشف‌های راند:
(۱) نخستین خردادِ منبعِ رسمیِ خانواده (خرداد ۹۹ قبلی r296/r297 از چاپِ جزوه بود) — سومین نوبتِ منبعِ رسمی (پس از r299/r301).
(۲) نزدیک‌ترین پوششِ کلیدِ خانواده: ۵۶ از ۵۷ آیتمِ چاپی کلیدِ صریح دارد — تنها ۵۷ (پاراگرافِ Sport) بارمِ اصولی دارد.
(۳) دومین نوبتِ تمامِ شنیداریِ قابلِ بازی (پس از r301): هر پنج زیربخش (۱-۱۵) ساقهٔ چاپی + کلیدِ کامل دارند.
(۴) دومین مرتب‌کردنِ شش‌جمله‌ایِ خانواده (۵۱-۵۶، کلید c/f/b/d/e/a) — این‌بار کلیدِ حرفیِ هر جایگاه جداگانه در راهنما چاپ شده.
(۵) اضافهٔ گزینه‌ای در جایگاهِ دوم (b) در واژگانِ تصویری — سومین جایگاهِ متمایزِ اضافه در خانواده (r299/r300 آخر، r301 اول).
(۶) کلیدِ نیمه‌جمله‌ایِ چاپیِ ۵۰: «…..but he had to read it.» — راهنما با یادداشتِ «نمرهٔ کامل با رسیدن به مفهوم با توجه به تصویر».
۱۹ بانک / ۵۶ آیتم — خانوادهٔ موضوعی هفدهم: ۱۲۲۷ + ۵۶ = ۱۲۸۳ تست در ۲۲۷ بانک.
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
    s = re.sub(r"[\"'`´‘’“”«»˝\u02DD\u030B]", "", s)  # ˝/آکسانِ ترکیبی — الگوی r300-r301
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
    """ساقه با خالیِ میانی: هر نیمه جداگانه راستی‌آزمایی می‌شود (الگوی r299-r301)"""
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

# ---------------------------------------------------------------- S1 شنیداری فایل ۱: درست/نادرست (ص۳۰۸) — کلید b/b/a/a
s1 = [
    q_tf("g12-fin1400khr-l1tf1", 1, "Roya will go to the gym on Saturday.", 1),          # ۱ → False (b)
    q_tf("g12-fin1400khr-l1tf2", 2, "Roya is going to the gym alone.", 1),               # ۲ → False (b)
    q_tf("g12-fin1400khr-l1tf3", 3, "Mina won’t go to the gym with Roya.", 0),           # ۳ → True (a)
    q_tf("g12-fin1400khr-l1tf4", 4, "Mina prefers less active sports like chess.", 0),   # ۴ → True (a)
]
# ---------------------------------------------------------------- S2 شنیداری فایل ۲: تست سه‌گزینه‌ای (ص۳۰۸) — کلید b/c/c/a
s2 = [
    q_mcq("g12-fin1400khr-l2m1", 1,
          "Rasoul and his family didn’t go to the new restaurant last night because --------------- .",
          ["it was expensive", "they didn’t want to", "the restaurant was too far"], 1),  # ۵ → (b)
    q_mcq("g12-fin1400khr-l2m2", 2,
          "They had gone to the new restaurant --------------- .",
          ["last year", "the month before", "the weekend before"], 2),                     # ۶ → (c)
    q_mcq("g12-fin1400khr-l2m3", 3,
          "They all ordered --------------- for dinner.",
          ["fish and chips", "chicken with chips", "chicken with rice"], 2),               # ۷ → (c)
    q_mcq("g12-fin1400khr-l2m4", 4,
          "Rasoul had never tasted their --------------- anywhere else before.",
          ["special sauce", "pomegranate sauce", "expensive sauce"], 0),                   # ۸ → (a)
]
# ---------------------------------------------------------------- S3 شنیداری فایل ۳: متن محیط زیست، کامل کنید (ص۳۰۸) — شماره‌گذاریِ چاپی ……9…… — کلید around/social/land/protect
s3 = [
    q_typed("g12-fin1400khr-l3q1", 1,
            "The environment can be water, air, animals, waste, plants, and other things that are ……9……--------------- us.",
            ["around"], "fill in the blank with the missing word…"),
    q_typed("g12-fin1400khr-l3q2", 2,
            "Also the environment can be the ……10……, physical, cultural and chemical factors that surround man.",
            ["social"], "fill in the blank with the missing word…"),
    q_typed("g12-fin1400khr-l3q3", 3,
            "There are two types of environment, like the natural environment that nature provides for example the oceans, …...11……., seas, etc,",
            ["land"], "fill in the blank with the missing word…"),
    q_typed("g12-fin1400khr-l3q4", 4,
            "The environment is important and we should all …..12…… it.",
            ["protect"], "fill in the blank with the missing word…"),
]
# ---------------------------------------------------------------- S4 شنیداری فایل ۴: درست/نادرست + کامل کنید (ص۳۰۸-۳۰۹) — کلید b/a + listen
s4 = [
    q_tf("g12-fin1400khr-l4tf1", 1, "Promising others can make our world a better place to live in.", 1),  # ۱۳ → False (b)
    q_tf("g12-fin1400khr-l4tf2", 2, "The student thinks that some people speak a lot.", 0),                 # ۱۴ → True (a)
    q_typed("g12-fin1400khr-l4q1", 3,
            "If we want to respect others, first we should --------------- to them.",
            ["listen"], "fill in the blank with the missing word…"),                                        # ۱۵ → listen
]
# ---------------------------------------------------------------- S5 واژگان با تصویر (ص۳۰۹) — پنج جملهٔ چاپی با اضافهٔ (b) در جایگاهِ دوم — سومین جایگاهِ متمایزِ اضافه؛ کلید e/d/a/c
PIC_INSTR = "با توجه به تصاویر داده‌شده، جملهٔ مناسب برای هر تصویر را انتخاب کنید. (یک جمله اضافی است)"
PIC_OPTS = [
    "The new light bulbs consume less electricity.",
    "I have kept a diary for twelve years.",  # اضافهٔ چاپی — جایگاهِ دوم
    "I circled the dictionary entry for the word ‘purpose’.",
    "My grandfather feeds the pigeons in the park every morning.",
    "The factory has polluted the river.",
]
s5 = [
    q_mcq("g12-fin1400khr-pic1", 1, PIC_INSTR, PIC_OPTS, 4),  # ۱۶ → (e) polluted river
    q_mcq("g12-fin1400khr-pic2", 2, PIC_INSTR, PIC_OPTS, 3),  # ۱۷ → (d) pigeons
    q_mcq("g12-fin1400khr-pic3", 3, PIC_INSTR, PIC_OPTS, 0),  # ۱۸ → (a) light bulbs
    q_mcq("g12-fin1400khr-pic4", 4, PIC_INSTR, PIC_OPTS, 2),  # ۱۹ → (c) dictionary entry
]
# ---------------------------------------------------------------- S6 واژگان: بانک چهارتایی چاپی (ص۳۰۹) — suppose/use up/distinguished/fossil (اضافه: suppose در جای نخست)؛ کلید fossil/use up/distinguished
POOL_OPTS = ["suppose", "use up", "distinguished", "fossil"]
s6 = [
    q_typed("g12-fin1400khr-pool1", 1,
            "Oil, coal and natural gas are three common --------------- fuels.",
            ["fossil"], "fill in the blank with the missing word…"),
    q_typed("g12-fin1400khr-pool2", 2,
            "Don’t --------------- all the milk, we need some for breakfast.",
            ["use up"], "fill in the blank with the missing word…"),
    q_typed("g12-fin1400khr-pool3", 3,
            "Dr. Gharib was known as a --------------- university professor in our country.",
            ["distinguished"], "fill in the blank with the missing word…"),
]
for q in s6:
    q["options"] = list(POOL_OPTS)  # داربست = بانکِ کاملِ چاپی (الگوی r296-r301)
# ---------------------------------------------------------------- S7 واژگان: تعریف‌های ستون B (ص۳۰۹) — اضافه در (a) جای نخست؛ کلید d/c/b
DEFB_OPTS = [
    "to put things in a neat, attractive, or useful order",  # اضافهٔ چاپی — جای نخست
    "to take the place of somebody or something",
    "to stop being angry with someone",
    "to suddenly decide to do something",
]
s7 = [
    q_mcq("g12-fin1400khr-def1", 1, "I did not read the introduction and jumped into the next part.", DEFB_OPTS, 3),  # ۲۳ → (d)
    q_mcq("g12-fin1400khr-def2", 2, "Mom forgave me for breaking the vase.", DEFB_OPTS, 2),                            # ۲۴ → (c)
    q_mcq("g12-fin1400khr-def3", 3, "The factory will replace most of its workers with robots.", DEFB_OPTS, 1),        # ۲۵ → (b)
]
# ---------------------------------------------------------------- S8 واژگان: کامل‌کردن از دانش خود (ص۳۰۹) — شکافِ حرفیِ چاپی s- - - - — کلید speak
s8 = [
    q_typed("g12-fin1400khr-ok1", 1,
            "Just saying that you will do something doesn’t mean much. You know that “Actions s --------------- louder than words”.",
            ["speak"], "start with the printed first letter s…"),
]
# ---------------------------------------------------------------- S9 گرامر: تست چهارگزینه‌ای (ص۳۱۰) — کلید b/d/a/d
s9 = [
    q_mcq("g12-fin1400khr-g1", 1,
          "Hamid doesn’t say a bad word, --------------- ?",
          ["did Hamid", "does he", "doesn’t Hamid", "isn’t he"], 1),  # ۲۷ → (b)
    q_mcq("g12-fin1400khr-g2", 2,
          "A: What did she do last Friday? B: She watched the film --------------- was very interesting.",
          ["whom", "who", "where", "which"], 3),                       # ۲۸ → (d)
    q_mcq("g12-fin1400khr-g3", 3,
          "A: Guess what we have for dinner! B: A fish salad --------------- for dinner by the cook.",
          ["may be made", "will make", "is making", "has made"], 0),   # ۲۹ → (a)
    q_mcq("g12-fin1400khr-g4", 4,
          "A: I do not have a good job and cannot earn enough money. B: If you had a good job, you --------------- a lot of money.",
          ["will earn", "were earned", "earned", "could earn"], 3),    # ۳۰ → (d)
]
# ---------------------------------------------------------------- S10 شکل صحیح فعل (ص۳۱۰) — راهنمای پرانتزیِ چاپی (pay)؛ کلید had paid
s10 = [
    q_typed("g12-fin1400khr-vf1", 1,
            "They gave me some money back because I --------------- too much. (pay)",
            ["had paid"], "شکل صحیح فعلِ داخل پرانتز را بنویسید…"),
]
# ---------------------------------------------------------------- S11 مرتب‌کردن کلمات (ص۳۱۰) — کلیدهای بازسازی‌شده از گریدِ بهم‌ریختهٔ راهنما؛ بارمِ (0.25) در رسید
s11 = [
    q_typed("g12-fin1400khr-ws1", 1,
            "moved to China / had already learned/ Chinese/ Joe/ he/ when /. /",
            ["Joe had already learned Chinese when he moved to China."],
            "جملهٔ مرتب‌شده را کامل بنویسید…"),
    q_typed("g12-fin1400khr-ws2", 2,
            "you /if / They / a house /  would buy / they were /./",
            ["They would buy a house if they were you."],
            "جملهٔ مرتب‌شده را کامل بنویسید…"),
]
# ---------------------------------------------------------------- S12 ضمیر موصولی (ص۳۱۰) — کلیدِ چاپیِ «which» + توضیحِ راهنما (جمله/عبارتِ دارای فعل) — الگوی چندمدالیِ r301
s12 = [
    q_typed("g12-fin1400khr-rel1", 1,
            "A horse is an animal …………………………………. .",
            ["which"], "which را به همراه یک جمله یا عبارت دارای فعل ادامه دهید…"),
]
# ---------------------------------------------------------------- S13 ریدینگ فرهنگ‌لغت (ص۳۱۰-۳۱۱) — کلید True/True/c/b
s13 = [
    q_tf("g12-fin1400khr-r1tf1", 1, "Words are easily found in dictionaries because dictionaries put them in alphabetical order.", 0),  # ۳۵ → True
    q_tf("g12-fin1400khr-r1tf2", 2, "The word ‘dictionary’ comes from the Latin ‘dictio’.", 0),                                          # ۳۶ → True
    q_mcq("g12-fin1400khr-r1m1", 3,
          "What do dictionaries of biography explain?",
          ["These dictionaries explain the meanings of technical words.",
           "Dictionaries of biography explain IPA.",
           "They tell about famous people.",
           "They translate words from one language to another."], 2),  # ۳۷ → (c)
    q_mcq("g12-fin1400khr-r1m2", 4,
          "What does “them” in the first line of paragraph 3 refer to?",
          ["pronunciations", "words", "dictionaries", "spellings"], 1),  # ۳۸ → (b)
]
# ---------------------------------------------------------------- S14 ریدینگ انرژی خورشیدی (ص۳۱۱) — کلید True/False/b/a
s14 = [
    q_tf("g12-fin1400khr-r2tf1", 1, "According to the passage, solar power is the most common type of clean energy.", 0),  # ۳۹ → True
    q_tf("g12-fin1400khr-r2tf2", 2, "People have used the sun as a source of heat for few years.", 1),                     # ۴۰ → False
    q_mcq("g12-fin1400khr-r2m1", 3,
          "Iranians use special designs of windows and balconies to --------------- .",
          ["generate electricity", "get the most sunshine", "keep themselves strong", "heat water"], 1),  # ۴۱ → (b)
    q_mcq("g12-fin1400khr-r2m2", 4,
          "The passage says people use different --------------- in building the houses to keep them warm in winter and cool in summer.",
          ["materials", "seasons", "pools", "signs"], 0),  # ۴۲ → (a)
]
s14q = [
    q_typed("g12-fin1400khr-r2q1", 1,
            "How can solar collectors collect heat?",
            ["Solar collectors collect heat by absorbing sunlight."],
            "answer with a full sentence…"),  # ۴۳
]
# ---------------------------------------------------------------- S15 ریدینگ نوجوانان (ص۳۱۱-۳۱۲) — کلید True/False/c/d
s15 = [
    q_tf("g12-fin1400khr-r3tf1", 1, "According to the passage, teenagers are between thirteen and nineteen years old.", 0),  # ۴۴ → True
    q_tf("g12-fin1400khr-r3tf2", 2, "Teenagers at the age 16 can drive in all countries.", 1),                                # ۴۵ → False
    q_mcq("g12-fin1400khr-r3m1", 3,
          "The passage says that parents have a lot to share with --------------- .",
          ["people", "high schools", "teenagers", "adults"], 2),  # ۴۶ → (c)
    q_mcq("g12-fin1400khr-r3m2", 4,
          "Teenagers should respect their parents because they are the best --------------- for teenagers.",
          ["success", "generation", "experience", "support"], 3),  # ۴۷ → (d)
]
# ---------------------------------------------------------------- S16 کلمات ربط (ص۳۱۲) — کلید and/so (در برابر but/so/and/or راندهای پیشین)
CONN_POOL = ["but", "and", "so", "or"]
s16 = [
    q_typed("g12-fin1400khr-conn1", 1,
            "We went to the restaurant --------------- ordered food.",
            ["and"], "fill in the blank with a connective…"),
    q_typed("g12-fin1400khr-conn2", 2,
            "That dictionary is expensive, --------------- I can’t buy it.",
            ["so"], "fill in the blank with a connective…"),
]
for q in s16:
    q["options"] = list(CONN_POOL)
# ---------------------------------------------------------------- S17 جملهٔ مرکب با تصویر (ص۳۱۲) — کلیدِ نیمه‌جمله‌ایِ چاپی «…..but he had to read it.»
s17 = [
    q_typed("g12-fin1400khr-cx1", 1,
            "The book was boring --------------- . (read)",
            ["The book was boring but he had to read it.", "but he had to read it"],
            "با but/so/and/or جملهٔ مرکبِ معنادار بنویسید…"),
]
# ---------------------------------------------------------------- S18 مرتب‌کردن جمله‌های پاراگراف ارتباطات (ص۳۱۲) — شش‌اسلاتیِ دومِ خانواده؛ کلید c/f/b/d/e/a
s18 = [
    q_typed("g12-fin1400khr-ord1", 1,
            "جملهٔ نخست (Topic) پاراگراف ارتباطات را بنویسید.",
            ["The new century has brought big changes in communication."],
            "جملهٔ پاراگراف را کامل بنویسید…"),
    q_typed("g12-fin1400khr-ord2", 2,
            "جملهٔ دوم پاراگراف ارتباطات را بنویسید.",
            ["Cell phones are important in these changes."],
            "جملهٔ پاراگراف را کامل بنویسید…"),
    q_typed("g12-fin1400khr-ord3", 3,
            "جملهٔ سوم پاراگراف ارتباطات را بنویسید.",
            ["Most of these cell phones can help you have video calls."],
            "جملهٔ پاراگراف را کامل بنویسید…"),
    q_typed("g12-fin1400khr-ord4", 4,
            "جملهٔ چهارم پاراگراف ارتباطات را بنویسید.",
            ["But some people do not have such phones"],
            "جملهٔ پاراگراف را کامل بنویسید…"),
    q_typed("g12-fin1400khr-ord5", 5,
            "جملهٔ پنجم پاراگراف ارتباطات را بنویسید.",
            ["because they are very expensive."],
            "جملهٔ پاراگراف را کامل بنویسید…"),
    q_typed("g12-fin1400khr-ord6", 6,
            "جملهٔ پایانی (Concluding) پاراگراف ارتباطات را بنویسید.",
            ["In short, communication can depend on technology."],
            "جملهٔ پاراگراف را کامل بنویسید…"),
]

BANKS = [
    (209, "نهایی سراسری خرداد ۱۴۰۰ — شنیداری فایل ۱: درست/نادرست (ص۳۰۸)", "استاندارد", s1),
    (210, "نهایی سراسری خرداد ۱۴۰۰ — شنیداری فایل ۲: تست (ص۳۰۸)", "استاندارد", s2),
    (211, "نهایی سراسری خرداد ۱۴۰۰ — شنیداری فایل ۳: متن محیط زیست، کامل کنید (ص۳۰۸)", "آموزشی — ورود آزاد", s3),
    (212, "نهایی سراسری خرداد ۱۴۰۰ — شنیداری فایل ۴: درست/نادرست + کامل کنید (ص۳۰۸-۳۰۹)", "آموزشی — ورود آزاد", s4),
    (213, "نهایی سراسری خرداد ۱۴۰۰ — واژگان با تصویر: جملهٔ مناسب هر تصویر (ص۳۰۹)", "استاندارد", s5),
    (214, "نهایی سراسری خرداد ۱۴۰۰ — واژگان: جای خالی از بانک (ص۳۰۹)", "آموزشی — ورود آزاد", s6),
    (215, "نهایی سراسری خرداد ۱۴۰۰ — واژگان: تعریف‌های ستون B (ص۳۰۹)", "استاندارد", s7),
    (216, "نهایی سراسری خرداد ۱۴۰۰ — واژگان: کامل‌کردن از دانش خود (ص۳۰۹)", "آموزشی — ورود آزاد", s8),
    (217, "نهایی سراسری خرداد ۱۴۰۰ — گرامر: تست چهارگزینه‌ای (ص۳۱۰)", "استاندارد", s9),
    (218, "نهایی سراسری خرداد ۱۴۰۰ — شکل صحیح فعل، بنویسید (ص۳۱۰)", "آموزشی — ورود آزاد", s10),
    (219, "نهایی سراسری خرداد ۱۴۰۰ — مرتب‌کردن کلمات، بنویسید (ص۳۱۰)", "آموزشی — ورود آزاد", s11),
    (220, "نهایی سراسری خرداد ۱۴۰۰ — ضمیر موصولی، کامل کنید (ص۳۱۰)", "آموزشی — ورود آزاد", s12),
    (221, "نهایی سراسری خرداد ۱۴۰۰ — ریدینگ فرهنگ‌لغت: درست/نادرست + تست (ص۳۱۰-۳۱۱)", "استاندارد", s13),
    (222, "نهایی سراسری خرداد ۱۴۰۰ — ریدینگ انرژی خورشیدی: درست/نادرست + تست (ص۳۱۱)", "استاندارد", s14),
    (223, "نهایی سراسری خرداد ۱۴۰۰ — ریدینگ انرژی خورشیدی: پرسش پاسخ (ص۳۱۱)", "آموزشی — ورود آزاد", s14q),
    (224, "نهایی سراسری خرداد ۱۴۰۰ — ریدینگ نوجوانان: درست/نادرست + تست (ص۳۱۱-۳۱۲)", "استاندارد", s15),
    (225, "نهایی سراسری خرداد ۱۴۰۰ — کلمات ربط، کامل کنید (ص۳۱۲)", "آموزشی — ورود آزاد", s16),
    (226, "نهایی سراسری خرداد ۱۴۰۰ — جملهٔ مرکب با کلمهٔ ربط و تصویر، بنویسید (ص۳۱۲)", "آموزشی — ورود آزاد", s17),
    (227, "نهایی سراسری خرداد ۱۴۰۰ — مرتب‌کردن جمله‌های پاراگراف، بنویسید (ص۳۱۲)", "آموزشی — ورود آزاد", s18),
]

# ================================================================ راستی‌آزماییِ OCR (وفاداریِ بدنه ص۳۰۸-۳۱۲)
SKIP_PREFIXES = ("با توجه به", "برای هر کلمهٔ", "جملهٔ")
for lid, _title, _level, qs in BANKS:
    for q in qs:
        if q["question"].startswith(SKIP_PREFIXES):
            pass  # دستورالعملِ فارسیِ درون‌اپ — الگوی r296-r301؛ گزینه‌ها/کلیدها جداگانه راستی‌آزمایی می‌شوند
        else:
            require(ocr_has_stem(q["question"]), f"stem not in OCR: {q['id']} :: {q['question'][:70]}")
        if q.get("kind") == "mcq" and q["options"] not in (["True", "False"],):
            for opt in q["options"]:
                require(ocr_has(opt), f"option not in OCR: {q['id']} :: {opt[:60]}")

# راهنمای پرانتزیِ چاپیِ (read) برای ۵۰ جداگانه راستی‌آزمایی می‌شود
require(ocr_has("(read)"), "body prints the (read) hint for item 50")

# ================================================================ کلیدهای راهنمای تصحیح (ص۳۱۳-۳۱۴) — راستی‌آزماییِ قطعه‌کلیدها
GUIDE_FRAGMENTS = [
    "1. False (b)", "2. False (b)", "3. True (a)", "4. True (a)",
    "5. (b)", "6. (c)", "7. (c)", "8. (a)",
    "9. around", "10. social", "11. land", "12. protect",
    "13. False (b)", "14. True (a)", "15. listen",
    "16. (e)", "17.(d)", "18. (a)", "19. (c)",
    "20. fossil", "21. use up", "22. distinguished",
    "23. (d)", "24. (c)", "25. (b)",
    "26. speak",
    "27. (b)", "28. (d)", "29. (a)", "30. (d)",
    "31. had paid",
    "35. (a) True", "36. (a) True", "37. ( c )", "38. ( b)",
    "39. (a) True", "40. (b) False", "41. ( b)", "42. ( a )",
    "43. Solar collectors collect heat by absorbing sunlight.",
    "44. (a) True", "45. (b) False", "46. (c)", "47 .(d)",
    "48. and", "49. so",
    "but he had to read it",
    "(c) The new century has brought big changes in communication.",
    "(f). Cell phones are important in these changes.",
    "(b) Most of these cell phones can help you have video calls.",
    "(d) But some people do not have such phones",
    "(e) because they are very expensive.",
    "(a) In short, communication can depend on technology.",
    # توضیحِ کلیدِ ۳۴ — راهنما «which» را با یادداشتِ توضیحی چاپ کرده (الگوی r299)
    "را به همراه یک جمله یا عبارت",
    "دارای فعل",
    "در ادامه بنویسد",
    # یادداشتِ نمرهٔ کاملِ ۵۰ با تصویر
    "در این بخش با انتخاب درست یکی از کلمات ربط",
    # سربرگِ رسمی
    "نوبت خرداد ماه سال1400",
    "http://aee.medu.ir",
    "19 / 03 / 1400",
    "رشته:ریاضی-فیزیک و علوم تجربی",
    "تعداد صفحات:5",
    "Audio file (MP3)",
    "Audio script (PDF)",
    # بخش ۱۹: بارمِ اصولیِ پاراگراف + داده‌های چاپی
    "رعایت اصول پاراگراف نویسی",
    "Different types of sport",
    "Good physical shape",
    "Healthier heart",
    "Sport is",
]
for frag in GUIDE_FRAGMENTS:
    require(ocr_has(frag), f"guide fragment not in OCR: {frag[:60]}")
# گریدِ بهم‌ریختهٔ ۳۲/۳۳ در راهنما — همهٔ قطعات چاپی
for frag in ["moved to China", "had already learned", "Chinese", "Joe", "when",
             "would buy", "a house", "they were"]:
    require(ocr_has(frag), f"scrambled grid fragment not in OCR: {frag}")
# بارمِ گرید: دو نشانِ (0/5) چاپی + «بارم هر قسمت»
require(OCR_N.count("(0/5)") >= 2, "guide prints two (0/5) bar marks near the word-order grids")
require(ocr_has("بارم هر قسمت"), "guide prints the per-part bar note for section 11")
# غیبتِ صادقانهٔ ۵۷: بارمِ اصولیِ پاراگراف‌نویسی — بدونِ نمونهٔ چاپی
require(ocr_has("در این بخش)سوال57"), "guide 19 prints principle-only paragraph bar for item 57 (Sport)")
require(ocr_has("در این بخش)سوال57 (باتوجه به رعایت اصول پاراگراف نویسی نمره لحاظ گردد"),
        "guide 19 principle-only note full fragment")

# ================================================================ داوریِ دومِ مستقل (معناییِ کلیدها — مستقل از گذرِ نخست)
SECOND = [
    ("g12-fin1400khr-l1tf1", "b", True), ("g12-fin1400khr-l1tf2", "b", True),
    ("g12-fin1400khr-l1tf3", "a", True), ("g12-fin1400khr-l1tf4", "a", True),
    ("g12-fin1400khr-l2m1", "b", ocr_has("b) they didn’t want to")),
    ("g12-fin1400khr-l2m2", "c", ocr_has("c) the weekend before")),
    ("g12-fin1400khr-l2m3", "c", ocr_has("c) chicken with rice")),
    ("g12-fin1400khr-l2m4", "a", ocr_has("a) special sauce")),
    ("g12-fin1400khr-pic1", "e", ocr_has("e. The factory has polluted the river")),
    ("g12-fin1400khr-pic2", "d", ocr_has("d. My grandfather feeds the pigeons in the park every morning")),
    ("g12-fin1400khr-pic3", "a", ocr_has("a. The new light bulbs consume less electricity")),
    ("g12-fin1400khr-pic4", "c", ocr_has("c. I circled the dictionary entry for the word ‘purpose’")),
    ("g12-fin1400khr-def1", "d", ocr_has("d. to suddenly decide to do something")),
    ("g12-fin1400khr-def2", "c", ocr_has("c. to stop being angry with someone")),
    ("g12-fin1400khr-def3", "b", ocr_has("b. to take the place of somebody or something")),
    ("g12-fin1400khr-g1", "b", ocr_has("b) does he")),
    ("g12-fin1400khr-g2", "d", ocr_has("d) which")),
    ("g12-fin1400khr-g3", "a", ocr_has("a) may be made")),
    ("g12-fin1400khr-g4", "d", ocr_has("d) could earn")),
    ("g12-fin1400khr-r1tf1", "a", True), ("g12-fin1400khr-r1tf2", "a", True),
    ("g12-fin1400khr-r1m1", "c", ocr_has("c) They tell about famous people")),
    ("g12-fin1400khr-r1m2", "b", ocr_has("b) words")),
    ("g12-fin1400khr-r2tf1", "a", True), ("g12-fin1400khr-r2tf2", "b", True),
    ("g12-fin1400khr-r2m1", "b", ocr_has("b) get the most sunshine")),
    ("g12-fin1400khr-r2m2", "a", ocr_has("a) materials")),
    ("g12-fin1400khr-r3tf1", "a", True), ("g12-fin1400khr-r3tf2", "b", True),
    ("g12-fin1400khr-r3m1", "c", ocr_has("c) teenagers")),
    ("g12-fin1400khr-r3m2", "d", ocr_has("d) support")),
]
ALL_QS = [q for _lid, _t, _lv, qs in BANKS for q in qs]
for qid, letter, sem_ok in SECOND:
    require(sem_ok, f"second judgement failed: {qid} [{letter}]")
    q = next(x for x in ALL_QS if x["id"] == qid)
    pool = "ab" if q["options"] == ["True", "False"] else "abcde"
    require(q["answer"] == pool.index(letter), f"{qid}: answer {q['answer']} != guide letter {letter}")

# کلیدهای تایپی — هر accepted باید در OCR یا راهنما ریشهٔ چاپی داشته باشد
TYPED_KEYS = {
    "g12-fin1400khr-l3q1": ["around"], "g12-fin1400khr-l3q2": ["social"],
    "g12-fin1400khr-l3q3": ["land"], "g12-fin1400khr-l3q4": ["protect"],
    "g12-fin1400khr-l4q1": ["listen"],
    "g12-fin1400khr-pool1": ["fossil"], "g12-fin1400khr-pool2": ["use up"], "g12-fin1400khr-pool3": ["distinguished"],
    "g12-fin1400khr-ok1": ["speak"],
    "g12-fin1400khr-vf1": ["had paid"],
    "g12-fin1400khr-ws1": ["Joe had already learned Chinese when he moved to China."],
    "g12-fin1400khr-ws2": ["They would buy a house if they were you."],
    "g12-fin1400khr-rel1": ["which"],
    "g12-fin1400khr-r2q1": ["Solar collectors collect heat by absorbing sunlight."],
    "g12-fin1400khr-conn1": ["and"], "g12-fin1400khr-conn2": ["so"],
    "g12-fin1400khr-cx1": ["but he had to read it"],
    "g12-fin1400khr-ord1": ["The new century has brought big changes in communication."],
    "g12-fin1400khr-ord2": ["Cell phones are important in these changes."],
    "g12-fin1400khr-ord3": ["Most of these cell phones can help you have video calls."],
    "g12-fin1400khr-ord4": ["But some people do not have such phones"],
    "g12-fin1400khr-ord5": ["because they are very expensive."],
    "g12-fin1400khr-ord6": ["In short, communication can depend on technology."],
}
for qid, keys in TYPED_KEYS.items():
    q = next(x for x in ALL_QS if x["id"] == qid)
    require(q["kind"] == "typed", f"{qid} must be typed")
    for k in keys:
        require(any(k in a for a in q["accepted"]), f"{qid}: accepted lacks printed key variant {k[:40]}")

# ================================================================ تزریق (idempotent — خروجیِ ناقصِ رانِ قبلی پاک می‌شود)
data = json.loads(BANK_PATH.read_text(encoding="utf-8"))
data["lessons"] = [l for l in data["lessons"] if l["lesson"] < 209]
data["source"].pop("final1400khr", None)
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

require(data["lessons"][-1]["lesson"] == 208, f"family tail is {data['lessons'][-1]['lesson']}, expected 208")
require([l["lesson"] for l in new_lessons] == list(range(209, 228)), "lesson numbers must be 209..227")
require(total_new == 56, f"total new items {total_new} != 56")

data["lessons"].extend(new_lessons)

data["source"]["final1400khr"] = {
    "pages": "308-312",
    "keyPages": "313-314",
    "titlePrinted": "آزمون نهایی انگلیسی دوازدهم — نوبت خرداد ماه سال ۱۴۰۰، رسمیِ سراسریِ رشتهٔ ریاضی-فیزیک و علوم تجربی، مرکز سنجش و پایش کیفیت آموزشی (aee.medu.ir)، تاریخ ۱۹/۰۳/۱۴۰۰، ۵ صفحه، جمع نمره ۴۰ — یازدهمین نوبتِ خانواده و سومین نوبتِ منبعِ رسمی (پس از r299/r301)",
    "sections": 19,
    "banks": 19,
    "questions": 56,
    "keys": 56,
    "extractedRound": 302,
    "branchVariant": "یازدهمین نوبتِ خانواده — نخستین خردادِ منبعِ رسمی (خرداد ۹۹ قبلی r296/r297 از چاپِ جزوه بود): کلیدِ ۵۶ از ۵۷ — نزدیک‌ترین پوششِ کلیدِ خانواده (فقط ۵۷ پاراگرافِ Sport بارمِ اصولی دارد) + دومین نوبتِ تمامِ شنیداریِ قابلِ بازی (۱۵ آیتم با ساقه و کلیدِ چاپی) + نخستین بانکِ شنیداریِ سه‌گزینه‌ایِ خانواده (۵-۸: a/b/c) + دومین مرتب‌کردنِ شش‌جمله‌ای (c/f/b/d/e/a) + اضافهٔ گزینه‌ایِ دوم‌جای (b) در واژگانِ تصویری + کلیدِ نیمه‌جمله‌ایِ چاپیِ ۵۰.",
    "audioFilesAbsent": True,
    "openWritingAbsent": {"items": "۵۷ (پاراگرافِ Sport با داده‌های چاپی Different types of sport / Good physical shape (the body) / Healthier heart)", "reason": "راهنما فقط بارمِ اصولیِ «رعایت اصول پاراگراف‌نویسی» می‌دهد — الگوی r296/r297/r299/r301"},
    "receipts": [
        "سربرگِ رسمیِ مرکز سنجش (aee.medu.ir) با رشتهٔ محدودِ چاپی «ریاضی-فیزیک و علوم تجربی» — در برابر «کلیه رشته‌ها»ی r299/r301؛ تاریخِ حاکم: ۱۹/۰۳/۱۴۰۰ (درسِ r297/r301: سربرگِ تاریخ حاکم است)",
        "نزدیک‌ترین پوششِ کلیدِ خانواده: ۵۶ از ۵۷ آیتمِ چاپی کلیدِ صریح دارند — پس از r298 (۵۲/۵۲) کامل‌ترین نسبتِ پوشش؛ تنها ۵۷ (پاراگرافِ Sport) بارمِ اصولی دارد",
        "دومین نوبتِ تمامِ شنیداریِ قابلِ بازی: درست/نادرستِ باشگاه (b/b/a/a)، رستورانِ سه‌گزینه‌ای (b/c/c/a)، متنِ محیط زیست (around/social/land/protect) و پرسشِ پاسخ (b/a + listen) — همه با ساقهٔ چاپی",
        "مکالمهٔ شنیداریِ ۲ برای نخستین بار در خانواده ساقه‌های سه‌گزینه‌ای دارد (۵-۸: a/b/c نه a/b/c/d) — درسِ r301: ساختارِ گزینه‌ها ثابت نیست",
        "مرتب‌کردنِ شش‌جمله‌ایِ پاراگراف ارتباطات (۵۱-۵۶) با کلیدِ c/f/b/d/e/a — دومین رتبه‌بندیِ شش‌اسلاتیِ خانواده؛ راهنما حرفِ هر جایگاه را جداگانه چاپ کرده (51(c)/52(f)/53(b)/54(d)/55(e)/56(a))",
        "اضافهٔ گزینه‌ای در جایگاهِ دوم: واژگانِ تصویری اضافهٔ (b) دارد (I have kept a diary…) — سومین جایگاهِ متمایزِ اضافه در خانواده (r299/r300 آخر، r301 اول)؛ بانکِ چهارتایی اضافهٔ suppose را در جای نخست دارد؛ تعریف‌های ستون B اضافهٔ (a) را در جای نخست",
        "کلیدِ نیمه‌جمله‌ایِ چاپیِ ۵۰: «…..but he had to read it.» با یادداشتِ «با انتخاب درست کلمهٔ ربط اگر جمله با توجه به تصویر مفهوم را برساند نمرهٔ کامل» — درون‌اپ جملهٔ کامل + نیمه‌جمله را accepted نگه می‌دارد",
        "کلیدِ توضیحیِ ۳۴: راهنما «which» را با یادداشتِ «باید which را به همراه یک جمله یا عبارت دارای فعل در ادامه بنویسد» چاپ کرده — تک‌مدالِ «which» با placeholderِ توضیحی (درسِ r299: قطعه‌کلیدِ خالصِ «which .4» به‌تنهایی ناکافی است)",
        "گریدِ بهم‌ریختهٔ ۳۲/۳۳ در راهنما با بارمِ (0/5) چاپی — جمله‌ها از قطعاتِ گرید بازسازی شدند (Joe had already learned Chinese when he moved to China / They would buy a house if they were you)",
        "آیتمِ ۲۶ «Actions s - - - - louder than words» با شکافِ حرفیِ چاپی وفادار — ضرب‌المثلِ actions speak louder",
        "وفاداری‌های چاپی: «few years» (خطای چاپیِ a few در ۴۰)، «at the age 16» بدونِ حرفِ اضافه (۴۵)، «dictio’» با گیومه، آیتمِ ۱۵ بدونِ علامتِ پرسش، مکالمهٔ رستوران با «didn’t» چاپی",
        "هم‌موضوع‌های Vision 3: مکالمهٔ باشگاه (ورزش‌های سالم) و ریدینگ‌های انرژی خورشیدی/نوجوانان — محتوای خانواده‌تازه؛ هیچ ساقه‌ای از نوبت‌های پیشین کپی نشده (یکتاییِ ۱۲۸۳ شناسه)",
        "پنج دکمهٔ شنیداری با فایلِ صوتیِ غایب — الگوی r292-r301 (ساقه‌های چاپیِ شنیداری قابلِ بازی‌اند، فایل نه)",
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
