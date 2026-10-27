#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r304 — آزمون نهایی، رسمیِ سراسریِ کلیهٔ رشته‌ها — نوبت شهریور ۱۴۰۰ (مرکز سنجش aee.medu.ir — بدنه ص۳۲۲-۳۲۶، راهنمای تصحیح ص۳۲۷-۳۲۸)
سیزدهمین نوبتِ «آزمون‌های نهایی دی ۹۷ تا شهریور ۱۴۰۱» — سربرگِ تاریخ حاکم (درس r297/r301/r302/r303): ۲۴/۰۶/۱۴۰۰ = شهریور ۱۴۰۰.
کشف‌های راند:
(۱) پنجمین نوبتِ منبعِ رسمی (پس از r299/r301/r302/r303) — سربرگِ «کلیه رشته ها» (بازگشت به الگوی r299/r301 پس از جفتِ رشته‌ایِ r302/r303).
(۲) کلیدِ ۵۲ از ۵۵ — فقط ۵۲/۵۳/۵۴ (Topic sentenceهای Smoking/Hafez/Technology) و ۵۵ (پاراگرافِ Wind towers) بارمِ اصولی — غیبتِ صادقانهٔ چهارتایی.
(۳) نخستین کلیدِ دومواریانتهٔ شکلِ فعلِ خانواده: «had got/gotten» — راهنما هر دو واریانت را چاپ کرده.
(۴) سومین و چهارمین بانکِ شنیداریِ سه‌گزینه‌ای (۵-۷ و ۸-۱۱ هر دو a/b/c) — الگوی r302/r303 ادامه دارد.
(۵) بازاستفادهِ عمدی از تمرین‌های خرداد ۱۴۰۰: پولِ واژگان عینِ r303 (absorb/variety/forgive/arrange) + جملهٔ Plants carbon dioxide + ساقهٔ two-page introduction — امتحانِ شهریور تمرین‌های خرداد را بازیافته (درسِ r299: گاردِ ساقه‌محورِ راندهای قدیمی به دورهٔ خودشان محدود است).
(۶) ریدینگِ احترام به طبیعت — متنِ تازهٔ خانواده با کلیدِ جمله‌کاملِ چاپیِ ۴۸ (چهار قطعهٔ RTL) و کلیدِ زیرخط‌دارِ ۴۷.
(۷) اضافهٔ تصویری در (b) دوم‌جای — عینِ r302؛ اضافهٔ تعریف‌ها (c) سوم‌جای.
۱۸ بانک / ۵۱ آیتم — خانوادهٔ موضوعی هفدهم: ۱۳۳۹ + ۵۱ = ۱۳۹۰ تست در ۲۶۵ بانک.
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
    s = re.sub(r"[\"'`´‘’“”«»˝\u02DD\u030B]", "", s)  # ˝/آکسانِ ترکیبی — الگوی r300-r303
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
    """ساقه با خالیِ میانی: هر نیمه جداگانه راستی‌آزمایی می‌شود (الگوی r299-r303)"""
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

# ---------------------------------------------------------------- S1 شنیداری فایل ۱: درست/نادرست — متنِ فرهنگ‌لغت (ص۳۲۲) — کلید b/a/b/a
s1 = [
    q_tf("g12-fin1400shr-l1tf1", 1, "You can use only online dictionaries.", 1),  # ۱ → False (b)
    q_tf("g12-fin1400shr-l1tf2", 2, "Dictionaries tell us how to say words in the right way.", 0),  # ۲ → True (a)
    q_tf("g12-fin1400shr-l1tf3", 3, "A picture in a dictionary can’t help you understand what a word means.", 1),  # ۳ → False (b)
    q_tf("g12-fin1400shr-l1tf4", 4, "If we know more words, we can learn more about the world.", 0),  # ۴ → True (a)
]
# ---------------------------------------------------------------- S2 شنیداری فایل ۲: مکالمهٔ پدر و پسر — سه‌گزینه‌ایِ سومِ خانواده (ص۳۲۲) — کلید b/a/c
s2 = [
    q_mcq("g12-fin1400shr-l2m1", 1,
          "What are the father and his son talking about?",
          ["food", "picnic", "drawing pictures"], 1),                              # ۵ → (b)
    q_mcq("g12-fin1400shr-l2m2", 2,
          "When they played volleyball, they had --------------- .",
          ["taken some photographs", "eaten lunch", "had a barbecue"], 0),         # ۶ → (a)
    q_mcq("g12-fin1400shr-l2m3", 3,
          "What did they do after eating lunch? After eating lunch, they --------------- .",
          ["studied their lessons", "went home", "flew kites"], 2),                # ۷ → (c)
]
# ---------------------------------------------------------------- S3 شنیداری فایل ۳: مکالمهٔ Mehran و Bijan — سه‌گزینه‌ایِ چهارمِ خانواده (ص۳۲۲) — کلید b/b/a/c
s3 = [
    q_mcq("g12-fin1400shr-l3m1", 1,
          "One of Mehran’s friends is in --------------- and needs some money.",
          ["shape", "trouble", "touch"], 1),                                       # ۸ → (b)
    q_mcq("g12-fin1400shr-l3m2", 2,
          "Mehran has saved some money to buy --------------- .",
          ["shoes", "mobile phone", "shirt"], 1),                                  # ۹ → (b)
    q_mcq("g12-fin1400shr-l3m3", 3,
          "He couldn’t tell Bijan about his friend’s problem because it was --------------- .",
          ["secret", "not important", "emergency"], 0),                            # ۱۰ → (a)
    q_mcq("g12-fin1400shr-l3m4", 4,
          "What Bijan said “A friend in need, is a friend indeed” means, we should --------------- our friend.",
          ["listen to", "need", "help"], 2),                                       # ۱۱ → (c)
]
# ---------------------------------------------------------------- S4 شنیداری فایل ۴: مکالمهٔ Sara و پرستار — کامل کنید با شماره‌گذاریِ چاپی ……(n)…… (ص۳۲۲) — کلید medicine/history/Persian/life/take
s4 = [
    q_typed("g12-fin1400shr-l4q1", 1,
            "Do you know Iran has always had great physicians and doctors and has been rich in ……(12)……--------------- .",
            ["medicine"], "fill in the blank with the missing word…"),
    q_typed("g12-fin1400shr-l4q2", 2,
            "Back in ……(13)….., we can mention Avicenna.",
            ["history"], "fill in the blank with the missing word…"),
    q_typed("g12-fin1400shr-l4q3", 3,
            "He was a great ……(14)….. physician.",
            ["Persian"], "fill in the blank with the missing word…"),
    q_typed("g12-fin1400shr-l4q4", 4,
            "His ……(15)….. is a source of inspiration for many people.",
            ["life"], "fill in the blank with the missing word…"),
    q_typed("g12-fin1400shr-l4q5", 5,
            "I think I’ll ask my dad to ……(16)….. us to Hamedan this summer.",
            ["take"], "fill in the blank with the missing word…"),
]
# ---------------------------------------------------------------- S5 واژگان با تصویر (ص۳۲۳) — پنج جملهٔ چاپی با اضافهٔ (b) دوم‌جای (عینِ r302) — کلید c/a/d/e
PIC_INSTR = "با توجه به تصاویر داده‌شده، جملهٔ مناسب برای هر تصویر را انتخاب کنید. (یک جمله اضافی است)"
PIC_OPTS = [
    "My uncle went to his son and hugged him.",
    "Hamid sits on the sofa and watches TV all the time.",  # اضافهٔ چاپی — جای دوم (الگوی r302)
    "Oil, coal and natural gas are three common fossil fuels.",
    "Wind turbines are used to produce electricity from wind power.",
    "Mehran couldn’t figure out what the teacher was talking about.",
]
s5 = [
    q_mcq("g12-fin1400shr-pic1", 1, PIC_INSTR, PIC_OPTS, 2),  # ۱۷ → (c) fossil fuels
    q_mcq("g12-fin1400shr-pic2", 2, PIC_INSTR, PIC_OPTS, 0),  # ۱۸ → (a) hugged
    q_mcq("g12-fin1400shr-pic3", 3, PIC_INSTR, PIC_OPTS, 3),  # ۱۹ → (d) wind turbines
    q_mcq("g12-fin1400shr-pic4", 4, PIC_INSTR, PIC_OPTS, 4),  # ۲۰ → (e) figure out
]
# ---------------------------------------------------------------- S6 واژگان: بانکِ چاپی عینِ r303 (absorb/variety/forgive/arrange — اضافه: forgive)؛ کلید variety/arrange/absorb
POOL_OPTS = ["absorb", "variety", "forgive", "arrange"]
s6 = [
    q_typed("g12-fin1400shr-pool1", 1,
            "They do a --------------- of fitness activities.",
            ["variety"], "fill in the blank with the missing word…"),   # ۲۱
    q_typed("g12-fin1400shr-pool2", 2,
            "We’ll need to --------------- the chairs around the table.",
            ["arrange"], "fill in the blank with the missing word…"),   # ۲۲
    q_typed("g12-fin1400shr-pool3", 3,
            "Plants --------------- carbon dioxide.",
            ["absorb"], "fill in the blank with the missing word…"),    # ۲۳ — عینِ تمرینِ r303 (بازاستفادهِ خانواده)
]
for q in s6:
    q["options"] = list(POOL_OPTS)  # داربست = بانکِ کاملِ چاپی (الگوی r296-r303)
# ---------------------------------------------------------------- S7 واژگان: تعریف‌های ستون B (ص۳۲۳) — اضافه در (c) سوم‌جای (cry suddenly)؛ کلید a/d/b
DEFB_OPTS = [
    "the part at the beginning of a book that gives a general idea of what it is about",
    "a book in which you record your thoughts or feelings or what has happened every day",
    "cry suddenly",  # اضافهٔ چاپی — جای سوم
    "in a way that is successful and achieves what you want",
]
s7 = [
    q_mcq("g12-fin1400shr-def1", 1, "This book has only a two-page introduction.", DEFB_OPTS, 0),  # ۲۴ → (a) — ساقه عینِ تمرینِ r303
    q_mcq("g12-fin1400shr-def2", 2, "If you know how to study more effectively, you’ll be able to learn more.", DEFB_OPTS, 3),  # ۲۵ → (d)
    q_mcq("g12-fin1400shr-def3", 3, "I have kept a diary for twelve years.", DEFB_OPTS, 1),        # ۲۶ → (b)
]
# ---------------------------------------------------------------- S8 واژگان: کامل‌کردن از دانش خود (ص۳۲۳) — شکافِ حرفیِ چاپی s- - - - — ضرب‌المثلِ too many cooks — کلید spoil
s8 = [
    q_typed("g12-fin1400shr-ok1", 1,
            "When there are too many people trying to lead, it’s confusing and leads to bad results. You know that “too many cooks s --------------- the broth”.",
            ["spoil"], "start with the printed first letter s…"),   # ۲۷
]
# ---------------------------------------------------------------- S9 گرامر: تست چهارگزینه‌ای (ص۳۲۴) — کلید d/a/c/c
s9 = [
    q_mcq("g12-fin1400shr-g1", 1,
          "You haven’t done your homework, --------------- ?",
          ["haven’t you", "haven’t I", "does your homework", "have you"], 3),  # ۲۸ → (d)
    q_mcq("g12-fin1400shr-g2", 2,
          "A: What did you find? B: I found the keys --------------- I lost yesterday..",
          ["which", "who", "where", "whom"], 0),                                # ۲۹ → (a) — نقطهٔ دوگانهٔ چاپی
    q_mcq("g12-fin1400shr-g3", 3,
          "A: How can the teachers talk to the parents? B: The parents --------------- by the principal.",
          ["may call", "have called", "should be called", "are calling"], 2),   # ۳۰ → (c)
    q_mcq("g12-fin1400shr-g4", 4,
          "A: This question is very hard, and I can’t solve it. B: If our friends came here, we --------------- them for help.",
          ["may ask", "were asked", "could ask", "were asking"], 2),            # ۳۱ → (c)
]
# ---------------------------------------------------------------- S10 شکل صحیح فعل (ص۳۲۴) — کلیدِ دومواریانتهٔ چاپی «had got/gotten» — نخستین در خانواده
s10 = [
    q_typed("g12-fin1400shr-vf1", 1,
            "She was upset because she --------------- a bad score. (get)",
            ["had gotten", "had got"], "شکل صحیح فعلِ داخل پرانتز را بنویسید…"),  # ۳۲
]
# ---------------------------------------------------------------- S11 مرتب‌کردن کلمات (ص۳۲۴) — گریدِ ۳۳/۳۴ با قطعاتِ بهم‌ریختهٔ RTL در راهنما
s11 = [
    q_typed("g12-fin1400shr-ws1", 1,
            "went to the zoo / had never seen/ Sara/ a bear/ before /she/. /",
            ["Sara had never seen a bear before she went to the zoo."],
            "جملهٔ مرتب‌شده را کامل بنویسید…"),                                  # ۳۳
    q_typed("g12-fin1400shr-ws2", 2,
            "My sister/ she/ if / her room / were at home / would clean /. /",
            ["My sister would clean her room if she were at home."],
            "جملهٔ مرتب‌شده را کامل بنویسید…"),                                  # ۳۴
]
# ---------------------------------------------------------------- S12 ضمیر موصولی (ص۳۲۴) — کلیدِ چاپیِ «which» + توضیحِ راهنما — الگوی چندمدالیِ r301-r303
s12 = [
    q_typed("g12-fin1400shr-rel1", 1,
            "I bought a dictionary…………………………………. .",
            ["which"], "which را به همراه یک جمله یا عبارت دارای فعل، در ادامه بنویسید…"),  # ۳۵
]
# ---------------------------------------------------------------- S13 ریدینگ خودروی برقی (ص۳۲۴-۳۲۵) — کلید True/False/c/b + portable device
s13 = [
    q_tf("g12-fin1400shr-r1tf1", 1, "According to the passage, many countries think that cars that use fossil fuels should be replaced by electric cars.", 0),  # ۳۶ → True
    q_tf("g12-fin1400shr-r1tf2", 2, "Electric cars always burn gasoline in the engine.", 1),   # ۳۷ → False
    q_mcq("g12-fin1400shr-r1m1", 3,
          "Electric cars use electricity --------------- the car in batteries.",
          ["consumed by", "replaced in", "stored on", "polluted"], 2),             # ۳۸ → (c)
    q_mcq("g12-fin1400shr-r1m2", 4,
          "The passage says to get the battery in electric cars ready to --------------- , you have to charge it.",
          ["produce", "roll", "carry", "deal"], 1),                                # ۳۹ → (b)
    q_typed("g12-fin1400shr-r1q1", 5,
            "Your cell phone is a --------------- that you can carry around every day.",
            ["portable device"], "fill in the blank with the missing word…"),      # ۴۰
]
# ---------------------------------------------------------------- S14 ریدینگ راهنمای فرهنگ‌لغت (ص۳۲۵) — کلید False/True/b/a
s14 = [
    q_tf("g12-fin1400shr-r2tf1", 1, "According to the passage, there is only one type of good dictionary.", 1),  # ۴۱ → False
    q_tf("g12-fin1400shr-r2tf2", 2, "Dictionary users should know their needs.", 0),           # ۴۲ → True
    q_mcq("g12-fin1400shr-r2m1", 3,
          "You can find the exact meaning of a word when you find its --------------- .",
          ["learner’s dictionary", "entry", "part of speech", "origin"], 1),       # ۴۳ → (b)
    q_mcq("g12-fin1400shr-r2m2", 4,
          "If the user does not know what the abbreviations stand for, it will be --------------- to understand it.",
          ["confusing", "boring", "surprising", "easy"], 0),                       # ۴۴ → (a)
]
# ---------------------------------------------------------------- S15 ریدینگ احترام به طبیعت (ص۳۲۵-۳۲۶) — متنِ تازهٔ خانواده — کلید False/True
s15 = [
    q_tf("g12-fin1400shr-r3tf1", 1, "According to the passage, people should only respect other people.", 1),  # ۴۵ → False
    q_tf("g12-fin1400shr-r3tf2", 2, "Our next generations need to know about nature and its value.", 0),       # ۴۶ → True
]
# ---------------------------------------------------------------- S16 ریدینگ احترام به طبیعت: پرسش پاسخ (ص۳۲۶) — کلیدِ زیرخط‌دارِ ۴۷ + جمله‌کاملِ چهارقطعه‌ایِ ۴۸
s16 = [
    q_typed("g12-fin1400shr-r3q1", 1,
            "Where can you show your children the beauty of nature?",
            ["in your yard or in your favorite park",
             "You can do these and show the beauty of nature in your yard or in your favorite park."],
            "answer with the printed key…"),   # ۴۷
    q_typed("g12-fin1400shr-r3q2", 2,
            "What should you remind to kids?",
            ["You should remind your children that all living creatures are parts of our world and are valuable in the natural environment."],
            "answer with a full sentence…"),   # ۴۸
]
# ---------------------------------------------------------------- S17 کلمات ربط (ص۳۲۶) — کلید or/but (در برابر and/butی r303)
CONN_POOL = ["but", "and", "so", "or"]
s17 = [
    q_typed("g12-fin1400shr-conn1", 1,
            "I go out tonight, --------------- I take a rest at home.",
            ["or"], "fill in the blank with a connective…"),      # ۴۹
    q_typed("g12-fin1400shr-conn2", 2,
            "Mary studies a lot , --------------- she can’t pass the exam.",
            ["but"], "fill in the blank with a connective…"),     # ۵۰ — ویرگولِ فاصله‌دارِ چاپی
]
for q in s17:
    q["options"] = list(CONN_POOL)
# ---------------------------------------------------------------- S18 جملهٔ مرکب با تصویر (ص۳۲۶) — استخرِ پرانتزیِ (but, and, so, or) — کلیدِ نیمه‌جمله‌ایِ چاپیِ «…..and I make an omelet.»
s18 = [
    q_typed("g12-fin1400shr-cx1", 1,
            "I get up early in the morning, --------------- . (make an omelet)",
            ["I get up early in the morning, and I make an omelet.", "and I make an omelet"],
            "با but/and/so/or جملهٔ مرکبِ معنادار بنویسید…"),     # ۵۱
]

BANKS = [
    (248, "نهایی سراسری شهریور ۱۴۰۰ — شنیداری فایل ۱: درست/نادرست (ص۳۲۲)", "استاندارد", s1),
    (249, "نهایی سراسری شهریور ۱۴۰۰ — شنیداری فایل ۲: مکالمه پدر و پسر، تست (ص۳۲۲)", "استاندارد", s2),
    (250, "نهایی سراسری شهریور ۱۴۰۰ — شنیداری فایل ۳: مکالمه Mehran و Bijan، تست (ص۳۲۲)", "استاندارد", s3),
    (251, "نهایی سراسری شهریور ۱۴۰۰ — شنیداری فایل ۴: مکالمه Sara و پرستار، کامل کنید (ص۳۲۲)", "آموزشی — ورود آزاد", s4),
    (252, "نهایی سراسری شهریور ۱۴۰۰ — واژگان با تصویر: جملهٔ مناسب هر تصویر (ص۳۲۳)", "استاندارد", s5),
    (253, "نهایی سراسری شهریور ۱۴۰۰ — واژگان: جای خالی از بانک (ص۳۲۳)", "آموزشی — ورود آزاد", s6),
    (254, "نهایی سراسری شهریور ۱۴۰۰ — واژگان: تعریف‌های ستون B (ص۳۲۳)", "استاندارد", s7),
    (255, "نهایی سراسری شهریور ۱۴۰۰ — واژگان: کامل‌کردن از دانش خود (ص۳۲۳)", "آموزشی — ورود آزاد", s8),
    (256, "نهایی سراسری شهریور ۱۴۰۰ — گرامر: تست چهارگزینه‌ای (ص۳۲۴)", "استاندارد", s9),
    (257, "نهایی سراسری شهریور ۱۴۰۰ — شکل صحیح فعل، بنویسید (ص۳۲۴)", "آموزشی — ورود آزاد", s10),
    (258, "نهایی سراسری شهریور ۱۴۰۰ — مرتب‌کردن کلمات، بنویسید (ص۳۲۴)", "آموزشی — ورود آزاد", s11),
    (259, "نهایی سراسری شهریور ۱۴۰۰ — ضمیر موصولی، کامل کنید (ص۳۲۴)", "آموزشی — ورود آزاد", s12),
    (260, "نهایی سراسری شهریور ۱۴۰۰ — ریدینگ خودروی برقی: درست/نادرست + تست + کامل کنید (ص۳۲۴-۳۲۵)", "آموزشی — ورود آزاد", s13),
    (261, "نهایی سراسری شهریور ۱۴۰۰ — ریدینگ راهنمای فرهنگ‌لغت: درست/نادرست + تست (ص۳۲۵)", "استاندارد", s14),
    (262, "نهایی سراسری شهریور ۱۴۰۰ — ریدینگ احترام به طبیعت: درست/نادرست (ص۳۲۵-۳۲۶)", "استاندارد", s15),
    (263, "نهایی سراسری شهریور ۱۴۰۰ — ریدینگ احترام به طبیعت: پرسش پاسخ (ص۳۲۶)", "آموزشی — ورود آزاد", s16),
    (264, "نهایی سراسری شهریور ۱۴۰۰ — کلمات ربط، کامل کنید (ص۳۲۶)", "آموزشی — ورود آزاد", s17),
    (265, "نهایی سراسری شهریور ۱۴۰۰ — جملهٔ مرکب با کلمهٔ ربط و تصویر، بنویسید (ص۳۲۶)", "آموزشی — ورود آزاد", s18),
]

# ================================================================ راستی‌آزماییِ OCR (وفاداریِ بدنه ص۳۲۲-۳۲۶)
SKIP_PREFIXES = ("با توجه به", "برای هر کلمهٔ", "جملهٔ")
for lid, _title, _level, qs in BANKS:
    for q in qs:
        if q["question"].startswith(SKIP_PREFIXES):
            pass  # دستورالعملِ فارسیِ درون‌اپ — الگوی r296-r303؛ گزینه‌ها/کلیدها جداگانه راستی‌آزمایی می‌شوند
        else:
            require(ocr_has_stem(q["question"]), f"stem not in OCR: {q['id']} :: {q['question'][:70]}")
        if q.get("kind") == "mcq" and q["options"] not in (["True", "False"],):
            for opt in q["options"]:
                require(ocr_has(opt), f"option not in OCR: {q['id']} :: {opt[:60]}")

# راهنمای پرانتزیِ چاپیِ (make an omelet) برای ۵۱ جداگانه راستی‌آزمایی می‌شود
require(ocr_has("(make an omelet)"), "body prints the (make an omelet) hint for item 51")

# ================================================================ کلیدهای راهنمای تصحیح (ص۳۲۷-۳۲۸) — راستی‌آزماییِ قطعه‌کلیدها
GUIDE_FRAGMENTS = [
    "1. False (b)", "2.True (a)", "3. False (b)", "4. True (a)",
    "5. (b)", "6. (a)", "7. (c)",
    "8. (b)", "9. (b)", "10. (a)", "11. (c)",
    "12. medicine", "13.history", "14. Persian", "15. life", "16. take",
    "17. (c)", "18. (a)", "19. (d)", "20. (e)",
    "21. variety", "22. arrange", "23. absorb",
    "24. (a)", "25. (d)", "26. (b)",
    "27. spoil",
    "28. (d)", "29. (a)", "30. (c)", "31. (c)",
    "32. had got/gotten",
    "36. (a) True", "37. (b) False", "38. (c)", "39. (b)", "40. portable device",
    "41. (b) False", "42. (a) True", "43. (b)", "44. (a)",
    "45. (b) False", "46. (a) True",
    "in your yard or in your favorite park",
    "you should remind your children",
    "that all living creatures are part",
    "of our world and are",
    "valuable in the natural environment",
    "49. or", "50. but",
    "and I make an omelet",
    # توضیحِ کلیدِ ۳۵ — راهنما «which» را با یادداشتِ توضیحی چاپ کرده (الگوی r299/r302/r303)
    "را به همراه یک جمله یا عبارت",
    "دارای فعل",
    "در ادامه بنویسد",
    # یادداشتِ نمرهٔ کاملِ ۵۱ با تصویر
    "در این بخش با انتخاب درست یکی از کلمات ربط",
    # سربرگِ رسمی
    "نوبت شهریور ماه سال1400",
    "http://aee.medu.ir",
    "24/06/1400",
    "کلیه رشته ها",
    "Audio file (MP3)",
    "Audio script (PDF)",
    # بخش ۱۸: بارمِ اصولیِ Topic sentenceها + بخش ۱۹: بارمِ اصولیِ پاراگراف + داده‌های چاپی
    "Topic Sentence",
    "سوالات52",
    "سوال55",
    "رعایت اصول پاراگراف نویسی",
    "In Yazd’s buildings",
    "Natural air cooling system",
    "Source of clean energy",
    "Wind towers",
]
for frag in GUIDE_FRAGMENTS:
    require(ocr_has(frag), f"guide fragment not in OCR: {frag[:60]}")
# گریدِ بهم‌ریختهٔ ۳۳/۳۴ در راهنما — همهٔ قطعات چاپی
for frag in ["went to the zoo", "had never seen", "Sara", "a bear", "before",
             "were at home", "would clean", "My sister", "her room"]:
    require(ocr_has(frag), f"scrambled grid fragment not in OCR: {frag}")
# غیبتِ صادقانهٔ ۵۲-۵۴: بارمِ اصولیِ Topic sentence — بدونِ نمونهٔ چاپی
require(ocr_has("رعایت اصول") and ocr_has("Topic Sentence"),
        "guide 18 prints principle-only Topic sentence bar for items 52-54")

# ================================================================ داوریِ دومِ مستقل (معناییِ کلیدها — مستقل از گذرِ نخست)
SECOND = [
    ("g12-fin1400shr-l1tf1", "b", True), ("g12-fin1400shr-l1tf2", "a", True),
    ("g12-fin1400shr-l1tf3", "b", True), ("g12-fin1400shr-l1tf4", "a", True),
    ("g12-fin1400shr-l2m1", "b", ocr_has("b) picnic")),
    ("g12-fin1400shr-l2m2", "a", ocr_has("a) taken some photographs")),
    ("g12-fin1400shr-l2m3", "c", ocr_has("c) flew kites")),
    ("g12-fin1400shr-l3m1", "b", ocr_has("b) trouble")),
    ("g12-fin1400shr-l3m2", "b", ocr_has("b) mobile phone")),
    ("g12-fin1400shr-l3m3", "a", ocr_has("a) secret")),
    ("g12-fin1400shr-l3m4", "c", ocr_has("c) help")),
    ("g12-fin1400shr-pic1", "c", ocr_has("c. Oil, coal and natural gas are three common fossil fuels")),
    ("g12-fin1400shr-pic2", "a", ocr_has("a. My uncle went to his son and hugged him")),
    ("g12-fin1400shr-pic3", "d", ocr_has("d. Wind turbines are used to produce electricity from wind power")),
    ("g12-fin1400shr-pic4", "e", ocr_has("e. Mehran couldn’t figure out what the teacher was talking about")),
    ("g12-fin1400shr-def1", "a", ocr_has("a. the part at the beginning of a book")),
    ("g12-fin1400shr-def2", "d", ocr_has("d. in a way that is successful and achieves what you want")),
    ("g12-fin1400shr-def3", "b", ocr_has("b. a book in which you record your thoughts")),
    ("g12-fin1400shr-g1", "d", ocr_has("d) have you")),
    ("g12-fin1400shr-g2", "a", ocr_has("a) which")),
    ("g12-fin1400shr-g3", "c", ocr_has("c) should be called")),
    ("g12-fin1400shr-g4", "c", ocr_has("c) could ask")),
    ("g12-fin1400shr-r1tf1", "a", True), ("g12-fin1400shr-r1tf2", "b", True),
    ("g12-fin1400shr-r1m1", "c", ocr_has("c) stored on")),
    ("g12-fin1400shr-r1m2", "b", ocr_has("b) roll")),
    ("g12-fin1400shr-r2tf1", "b", True), ("g12-fin1400shr-r2tf2", "a", True),
    ("g12-fin1400shr-r2m1", "b", ocr_has("b) entry")),
    ("g12-fin1400shr-r2m2", "a", ocr_has("a) confusing")),
    ("g12-fin1400shr-r3tf1", "b", True), ("g12-fin1400shr-r3tf2", "a", True),
]
ALL_QS = [q for _lid, _t, _lv, qs in BANKS for q in qs]
for qid, letter, sem_ok in SECOND:
    require(sem_ok, f"second judgement failed: {qid} [{letter}]")
    q = next(x for x in ALL_QS if x["id"] == qid)
    pool = "ab" if q["options"] == ["True", "False"] else "abcde"
    require(q["answer"] == pool.index(letter), f"{qid}: answer {q['answer']} != guide letter {letter}")

# کلیدهای تایپی — هر accepted باید در OCR یا راهنما ریشهٔ چاپی داشته باشد
TYPED_KEYS = {
    "g12-fin1400shr-l4q1": ["medicine"], "g12-fin1400shr-l4q2": ["history"],
    "g12-fin1400shr-l4q3": ["Persian"], "g12-fin1400shr-l4q4": ["life"],
    "g12-fin1400shr-l4q5": ["take"],
    "g12-fin1400shr-pool1": ["variety"], "g12-fin1400shr-pool2": ["arrange"],
    "g12-fin1400shr-pool3": ["absorb"],
    "g12-fin1400shr-ok1": ["spoil"],
    "g12-fin1400shr-vf1": ["had gotten", "had got"],
    "g12-fin1400shr-ws1": ["Sara had never seen a bear before she went to the zoo."],
    "g12-fin1400shr-ws2": ["My sister would clean her room if she were at home."],
    "g12-fin1400shr-rel1": ["which"],
    "g12-fin1400shr-r1q1": ["portable device"],
    "g12-fin1400shr-r3q1": ["in your yard or in your favorite park"],
    "g12-fin1400shr-r3q2": ["You should remind your children that all living creatures are parts of our world and are valuable in the natural environment."],
    "g12-fin1400shr-conn1": ["or"], "g12-fin1400shr-conn2": ["but"],
    "g12-fin1400shr-cx1": ["and I make an omelet"],
}
for qid, keys in TYPED_KEYS.items():
    q = next(x for x in ALL_QS if x["id"] == qid)
    require(q["kind"] == "typed", f"{qid} must be typed")
    for k in keys:
        require(any(k in a for a in q["accepted"]), f"{qid}: accepted lacks printed key variant {k[:40]}")

# ================================================================ تزریق (idempotent — خروجیِ ناقصِ رانِ قبلی پاک می‌شود)
data = json.loads(BANK_PATH.read_text(encoding="utf-8"))
data["lessons"] = [l for l in data["lessons"] if l["lesson"] < 248]
data["source"].pop("final1400shr", None)
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

require(data["lessons"][-1]["lesson"] == 247, f"family tail is {data['lessons'][-1]['lesson']}, expected 247")
require([l["lesson"] for l in new_lessons] == list(range(248, 266)), "lesson numbers must be 248..265")
require(total_new == 51, f"total new items {total_new} != 51")

data["lessons"].extend(new_lessons)

data["source"]["final1400shr"] = {
    "pages": "322-326",
    "keyPages": "327-328",
    "titlePrinted": "آزمون نهایی انگلیسی دوازدهم — نوبت شهریور ماه سال ۱۴۰۰، رسمیِ سراسریِ کلیهٔ رشته‌ها، مرکز سنجش و پایش کیفیت آموزشی (aee.medu.ir)، تاریخ ۲۴/۰۶/۱۴۰۰، ۵ صفحه، جمع نمره ۴۰ — سیزدهمین نوبتِ خانواده، پنجمین نوبتِ منبعِ رسمی و نخستین شهریورِ منبعِ رسمی",
    "sections": 19,
    "banks": 18,
    "questions": 51,
    "keys": 51,
    "extractedRound": 304,
    "branchVariant": "سیزدهمین نوبتِ خانواده — نخستین شهریورِ منبعِ رسمی (بازگشتِ سربرگِ «کلیه رشته ها» پس از جفتِ رشته‌ایِ r302/r303): کلیدِ ۵۲ از ۵۵ (فقط ۵۲-۵۴ Topic و ۵۵ پاراگرافِ Wind towers بارمِ اصولی) + نخستین کلیدِ دومواریانتهٔ شکلِ فعل (had got/gotten) + سومین و چهارمین بانکِ شنیداریِ سه‌گزینه‌ای (۵-۷ و ۸-۱۱) + بازاستفادهٔ عمدی از تمرین‌های خرداد ۱۴۰۰ (پولِ عینِ r303 + جملهٔ Plants + ساقهٔ two-page introduction) + اضافهٔ تصویریِ دوم‌جایِ (b) عینِ r302.",
    "audioFilesAbsent": True,
    "openWritingAbsent": {"items": "۵۲/۵۳/۵۴ (Topic sentence برای Smoking/Hafez/Technology) و ۵۵ (پاراگرافِ Wind towers با داده‌های چاپی In Yazd’s buildings / Natural air cooling system / Source of clean energy)", "reason": "راهنما فقط بارمِ اصولی می‌دهد — الگوی r296-r303"},
    "receipts": [
        "پنجمین نوبتِ منبعِ رسمیِ مرکز سنجش (پس از r299/r301/r302/r303) و نخستین شهریورِ رسمی — سربرگِ «کلیه رشته ها» بازگشته در برابر رشته‌های محدودِ جفتِ خرداد ۱۴۰۰",
        "کلیدِ ۵۲ از ۵۵: چهار آیتمِ پایانیِ نوشتاری (۳ Topic sentence + ۱ پاراگرافِ داده‌دار) بارمِ اصولی — غیبتِ صادقانهٔ چهارتایی پس از تک‌آیتمی‌های r299/r302/r303",
        "نخستین کلیدِ دومواریانتهٔ شکلِ فعلِ خانواده: «had got/gotten» — راهنما هر دو واریانت را با اسلش چاپ کرده؛ درون‌اپ هر دو accepted",
        "سومین و چهارمین بانکِ شنیداریِ سه‌گزینه‌ای (پدر/پسر: b/a/c و Mehran/Bijan: b/b/a/c) — پس از رستورانِ r302 و شیلا/سمیرای r303؛ ساختارِ گزینه‌ها داده‌ای است نه قراردادی (درسِ r302)",
        "بازاستفادهٔ عمدی از تمرین‌های خرداد ۱۴۰۰ (r303): پولِ واژگانِ عیناً یکسان (absorb/variety/forgive/arrange)، جملهٔ «Plants … carbon dioxide» (۲۳) و ساقهٔ «two-page introduction» (۲۴) — امتحانِ شهریور تمرین‌های خرداد را بازیافته؛ گاردِ ساقه‌محورِ راندهای قدیمی به دورهٔ خودشان محدود است (درسِ r299/r295)",
        "اضافهٔ تصویری در (b) دوم‌جای (Hamid sits on the sofa) — عینِ r302؛ اضافهٔ تعریف‌ها (c) سوم‌جای (cry suddenly) — جایگاهِ سومِ متمایز در خانواده",
        "کلیدِ جمله‌کاملِ چاپیِ ۴۸ با چهار قطعهٔ RTL: «You should remind your children | that all living creatures are part|s | of our world and are | valuable in the natural environment» — بازسازی شد؛ کلیدِ زیرخط‌دارِ ۴۷ «in your yard or in your favorite park» با واریانتِ جمله‌کاملِ بدنه",
        "شکافِ حرفیِ «s - - - -» ضرب‌المثلِ too many cooks (کلید spoil) — الگوی c- -ی r303 و s----ی r302 ادامه دارد",
        "وفاداری‌های چاپی: «13.history» بدونِ فاصله در راهنما، «19.  (d)» دوفاصله، نقطهٔ دوگانهٔ «yesterday..» (۲۹)، «c)surprising» بدونِ فاصله (۴۴)، ویرگولِ فاصله‌دارِ «a lot ,» (۵۰)، «51..» دونقطه در راهنما، شکافِ دومَنفذِ «a …..…… ……….….» (۴۰)",
        "ضرب‌المثلِ سومِ خانواده با کلیدِ تک‌واریانته: easy come easy go (r303) / too many cooks spoil the broth (این راند) / actions speak louder (r302)",
        "پنج دکمهٔ شنیداری با فایلِ صوتیِ غایب — الگوی r292-r303 (ساقه‌های چاپیِ شنیداری قابلِ بازی‌اند، فایل نه)",
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
