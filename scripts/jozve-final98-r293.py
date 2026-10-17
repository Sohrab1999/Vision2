#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r293 — آزمون نهایی خرداد ۱۳۹۸ (Vision Three بخش چهارم، ص۲۳۷-۲۴۱؛ راهنمای تصحیح ص۲۴۲-۲۴۳)
دومین نوبت از دوازده نوبتِ «آزمون‌های نهایی دی ۹۷ تا شهریور ۱۴۰۱».
۱۲ بانک / ۵۱ آیتم از ۱۶ بخش چاپی؛ بخش ۱ (listening ۱-۶ بدون متنِ چاپی) و بخش ۱۳
(پاراگراف‌نویسیِ باز «save our Earth» آیتم ۴۱) غیبتِ صادقانه — کلیدها/موضوع‌ها در رسید.
نوهای راند: نخستین بانکِ شنیداریِ متن‌چاپ (۷-۱۴ با ساقه/گزینه/کلیدِ کاملِ چاپی)؛
نخستین کلیدِ دودوییِ جمله‌کاملِ مرتب‌کردن (۳۵/۳۶ دو واریانتِ چاپی)؛
نخستین گزینش‌گرِ دانش‌خودیِ حرف‌نخست‌دار (۲۴-۲۶)؛ NFKC برای فونتِ presentation-forms.
"""
import json, re, sys, unicodedata
from pathlib import Path

ROOT = Path("/home/z/my-project")
BANK_PATH = ROOT / "public/jozve/grammar-g12-topic.json"
OCR_PATH = ROOT / "booklet-extract/g12.txt"

OCR = OCR_PATH.read_text(encoding="utf-8")

def norm(s: str) -> str:
    # NFKC: فونتِ presentation-formsِ نوبتِ خرداد ۹۸ (سربرگ‌ها و کلیدِ فارسیِ راهنما) → نویسهٔ استاندارد
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
    """ساقه با خالیِ میانی: هر نیمه جداگانه راستی‌آزمایی می‌شود (خالیِ چاپی BLNK است)"""
    if ocr_has(stem):
        return True
    parts = [p.strip(" .") for p in stem.split("---------------")]
    parts = [p for p in parts if p]
    return bool(parts) and all(ocr_has(p) for p in parts)

failures: list[str] = []
def require(cond: bool, msg: str) -> None:
    if not cond:
        failures.append(msg)

def q_typed(qid: str, n: int, question: str, options: list[str], accepted: list[str], placeholder: str | None = None) -> dict:
    q = {"id": qid, "n": n, "category": "grammar", "kind": "typed",
         "question": question, "options": options, "answer": 0, "accepted": accepted}
    if placeholder:
        q["placeholder"] = placeholder
    return q

def q_mcq(qid: str, n: int, question: str, options: list[str], key_letter: str, letters: str | None = None) -> dict:
    if letters is None:
        letters = "abcde"[: len(options)]
    return {"id": qid, "n": n, "category": "grammar",
            "question": question, "options": options, "answer": letters.index(key_letter)}

# ================================================================ S2 — شنیداریِ متن‌چاپ: ۱ تایپی + ۷ MCQ (ص۲۳۷، آیتم ۷-۱۴؛ کلید ص۲۴۲)
LIS_TYPED = {1: "Which one is clean energy? Wind or Coal? ---------------"}  # آیتم چاپی ۷
K_LIS_TYPED = {1: "wind"}
LIS_MCQ = {
    2: ("Scientists try to use clean energy because ---------------.",
        ["do not pollute the earth", "are harmful to the environment", "cannot be replaced", "cannot be turned into other forms of energy"], "a"),  # ۸
    3: ("When renewable energy is used, the demand for fossil fuels ---------------.",
        ["is produced", "is made", "is reduced", "is provided"], "c"),  # ۹
    4: ("Bijan didn't tell Mehran about the problem because ---------------.",
        ["it was an emergency", "it was a secret", "he didn't need any money", "he had no mobile phone"], "b"),  # ۱۰
    5: ("Why has Bijan saved some money?",
        ["to buy a new pair of shoes", "to solve his friend's problem", "to help Mehran", "to buy a new mobile phone"], "d"),  # ۱۱
    6: ("Ali is doing research on ---------------.",
        ["heart attack", "human's life", "air pollution"], "c"),  # ۱۲ — سه‌گزینه‌ایِ چاپ
    7: ("Where does air pollution mostly happen?",
        ["big cities", "roads", "highways"], "a"),  # ۱۳ — سه‌گزینه‌ایِ چاپ
    8: ("Polluted air causes different --------------- to human.",
        ["reasons", "diseases", "ways"], "b"),  # ۱۴ — سه‌گزینه‌ایِ چاپ
}
LESSON_LIS = {
    "lesson": 69, "title": "نهایی خرداد ۹۸ — شنیداری: سوال‌های متن‌چاپ (ص۲۳۷)",
    "level": "استاندارد", "count": 8,
    "questions": [
        q_typed("g12-fin98-lis1", 1, LIS_TYPED[1], ["wind", "coal"], [K_LIS_TYPED[1]],
                "fill in the blank with the missing word…"),
        *[q_mcq(f"g12-fin98-lis{i}", i, LIS_MCQ[i][0], LIS_MCQ[i][1], LIS_MCQ[i][2]) for i in LIS_MCQ],
    ],
}

# ================================================================ S3 — واژگان تصویری: ۲ تایپی (ص۲۳۸، آیتم ۱۵-۱۶)
VOCPIC = {
    1: ("We have to speak louder, because my grandfather is --------------- of hearing.",
        ["hard"]),                                  # آیتم چاپی ۱۵ — کلید: hard
    2: ("In opposite to fans, --------------- (s) use wind to generate electricity.",
        ["wind turbines", "turbines"]),             # آیتم چاپی ۱۶ — کلید دودوییِ چاپ «Wind turbines/ turbines»
}
LESSON_VOCPIC = {
    "lesson": 70, "title": "نهایی خرداد ۹۸ — واژگان با تصویر: کامل کنید، بنویسید (ص۲۳۸)",
    "level": "آموزشی — ورود آزاد", "count": 2,
    "questions": [q_typed(f"g12-fin98-vocpic{i}", i, VOCPIC[i][0], VOCPIC[i][1], VOCPIC[i][1],
                          "fill in the blank with the missing word…") for i in VOCPIC],
}

# ================================================================ S4 — تعریف‌ها: ۵ گزینهٔ چاپی (ص۲۳۸، آیتم ۱۷-۲۰)
DEF_OPTIONS = ["the rise and fall of the sea", "in a quiet way",
               "a book in which you record your thoughts and feelings",
               "to change in form or character",
               "in a way that is successful and achieves what you want"]  # a..e عیناً چاپ
DEF_HEADS = {
    1: "There are some helpful tips on how to use a dictionary more effectively.",  # ۱۷
    2: "She agreed some parts of her personal diary to be published.",              # ۱۸
    3: "Strong tides make swimming dangerous.",                                     # ۱۹
    4: "We can convert some sofas into a bed.",                                     # ۲۰
}
K_DEF = {1: "e", 2: "c", 3: "a", 4: "d"}  # b اضافهٔ چاپی
LESSON_DEF = {
    "lesson": 71, "title": "نهایی خرداد ۹۸ — واژگان: تعریف‌ها، ۵ گزینهٔ چاپی (ص۲۳۸)",
    "level": "استاندارد", "count": 4,
    "questions": [q_mcq(f"g12-fin98-def{i}", i, DEF_HEADS[i], DEF_OPTIONS, K_DEF[i]) for i in range(1, 5)],
}

# ================================================================ S5 — بانک واژگان: ۳ تایپی (ص۲۳۸، آیتم ۲۱-۲۳)
BANK_PRINTED = ["combination", "compile", "dedicated", "consume"]
K_BANK = {1: "consume", 2: "combination", 3: "dedicated"}  # compile اضافهٔ چاپی
BANK_STEMS = {
    1: "Nowadays the new light bulbs --------------- less electricity.",
    2: "As a great artist, he has used a --------------- of paints in his works.",
    3: "Dr. Gharib was regarded as a --------------- physician and he spared no pains to help sick people.",
}

def bank_scaffold(key: str) -> list[str]:
    return [key] + [w for w in BANK_PRINTED if w != key]

LESSON_BANK = {
    "lesson": 72, "title": "نهایی خرداد ۹۸ — واژگان: جای خالی از بانک، بنویسید (ص۲۳۸)",
    "level": "آموزشی — ورود آزاد", "count": 3,
    "questions": [q_typed(f"g12-fin98-bank{i}", i, BANK_STEMS[i], bank_scaffold(K_BANK[i]), [K_BANK[i]],
                          "fill in the blank with the word bank…") for i in range(1, 4)],
}

# ================================================================ S6 — دانش‌خودیِ حرف‌نخست‌دار: ۳ تایپی (ص۲۳۸، آیتم ۲۴-۲۶)
KNOW = {
    1: ("Plants a--------------- carbon dioxide from the air.", ["absorb"]),           # ۲۴ — کلید: absorb
    2: ("H is the chemical s --------------- for hydrogen.", ["symbol", "sign"]),      # ۲۵ — کلید دودوییِ چاپ «symbol /sign»
    3: ("In Germany people usually h--------------- each other when they meet.", ["hug"]),  # ۲۶ — کلید چاپی «hu» بریده — رسید
}
KNOW_POOL = ["absorb", "symbol", "sign", "hug"]

def know_scaffold(key: str) -> list[str]:
    return [key] + [w for w in KNOW_POOL if w not in key.split(",") and w != key]

LESSON_KNOW = {
    "lesson": 73, "title": "نهایی خرداد ۹۸ — واژگان: کامل‌کردن از دانش خود، بنویسید (ص۲۳۸)",
    "level": "آموزشی — ورود آزاد", "count": 3,
    "questions": [q_typed(f"g12-fin98-know{i}", i, KNOW[i][0], know_scaffold(KNOW[i][1][0]), KNOW[i][1],
                          "complete with a suitable word from your own knowledge…") for i in KNOW],
}

# ================================================================ S7 — شکل صحیح فعل در مکالمه: ۴ تایپی (ص۲۳۹، آیتم ۲۷-۳۰)
VF_STEMS = {
    1: "It --------------- rather cold today, doesn't it? (to seem)",
    2: "I --------------- to go swimming before I left home. (to decide)",
    3: "If it were fine, We --------------- swimming today. (to go)",
    4: "OK. I know a restaurant in which a variety of sea foods ---------------. (to serve)",
}
K_VF = {1: "seems", 2: "had decided", 3: "would go", 4: "are served"}
VF_DUAL = {3: ["would go", "could go"]}  # کلید چاپی «would/ could go»
VF_POOL = ["seems", "had decided", "would go", "are served"]

def vf_scaffold(key: str) -> list[str]:
    return [key] + [w for w in VF_POOL if w != key]

def vf_accepted(i: int) -> list[str]:
    return VF_DUAL.get(i, [K_VF[i]])

LESSON_VF = {
    "lesson": 74, "title": "نهایی خرداد ۹۸ — شکل صحیح فعل در مکالمه، بنویسید (ص۲۳۹)",
    "level": "آموزشی — ورود آزاد", "count": 4,
    "questions": [q_typed(f"g12-fin98-vf{i}", i, VF_STEMS[i], vf_scaffold(K_VF[i]), vf_accepted(i),
                          "write the correct form of the verb…") for i in range(1, 5)],
}

# ================================================================ S8 — گرامر: ۴ MCQ با چاپِ وارونه (ص۲۳۹، آیتم ۳۱-۳۴)
G_STEMS = {
    1: "The train --------------- he catches early in the morning is not very crowded.",
    2: "Some dangerous gases --------------- when we burn garbage.",
    3: "The old man wasn't very --------------- and kept to himself.",
    4: "I did not read the introduction and jumped --------------- the next part.",
}
G_OPTIONS = {
    1: ["whom", "which", "who", "whose"],                       # چاپ وارونه d,c,b,a — رسید
    2: ["was produced", "produce", "may produce", "may be produced"],
    3: ["communicate", "communication", "communicative", "to communicate"],
    4: ["into", "on", "up", "over"],
}
K_G = {1: "b", 2: "d", 3: "c", 4: "a"}  # کلیدهای چاپی راهنما: b/which، d/may be produced، c/communicative، a/into
LESSON_G = {
    "lesson": 75, "title": "نهایی خرداد ۹۸ — گرامر: تست چهارگزینه‌ای (ص۲۳۹)",
    "level": "استاندارد", "count": 4,
    "questions": [q_mcq(f"g12-fin98-g{i}", i, G_STEMS[i], G_OPTIONS[i], K_G[i]) for i in range(1, 5)],
}

# ================================================================ S9 — مرتب‌کردن کلمات: ۲ تایپی با کلیدِ دودوییِ جمله‌کامل (ص۲۳۹، آیتم ۳۵-۳۶)
WO_SCRAMBLES = {
    1: "rained / brown / for months / everything / because / hadn't / in the garden / was / it.",
    2: "famous / lives / the woman / professor / next door / is / who / a.",
}
K_WO = {
    1: ["Everything in the garden was brown because it hadn't rained for months.",
        "Everything is brown in the garden because it hadn't rained for months."],
    2: ["The woman who lives next door is a famous professor.",
        "The woman who is a famous professor lives next door."],
}
LESSON_WO = {
    "lesson": 76, "title": "نهایی خرداد ۹۸ — مرتب‌کردن کلمات، بنویسید (ص۲۳۹)",
    "level": "آموزشی — ورود آزاد", "count": 2,
    "questions": [q_typed(f"g12-fin98-wo{i}", i, WO_SCRAMBLES[i], K_WO[i], K_WO[i],
                          "write the complete sentence…") for i in range(1, 3)],
}

# ================================================================ S10 — کلمات ربط: ۴ تایپی (ص۲۳۹، آیتم ۳۷-۴۰)
CONN_STEMS = {
    1: "The early bird catches the worm, --------------- if you want to succeed, wake up and start work early.",
    2: "He bought a house, found a job, --------------- chose a school for his children last year.",
    3: "The glass fell down to the floor, --------------- it didn't break.",
    4: "You can pay now, --------------- when I finish your painting.",
}
K_CONN = {1: "so", 2: "and", 3: "but", 4: "or"}
CONN_POOL = ["and", "or", "but", "so"]  # ترتیب چاپیِ پرانتز

def conn_scaffold(key: str) -> list[str]:
    return [key] + [w for w in CONN_POOL if w != key]

LESSON_CONN = {
    "lesson": 77, "title": "نهایی خرداد ۹۸ — کلمات ربط، کامل کنید (ص۲۳۹)",
    "level": "آموزشی — ورود آزاد", "count": 4,
    "questions": [q_typed(f"g12-fin98-conn{i}", i, CONN_STEMS[i], conn_scaffold(K_CONN[i]), [K_CONN[i]],
                          "complete with and / or / but / so…") for i in range(1, 5)],
}

# ================================================================ S14 — نقش‌های پاراگراف آب: ۶ MCQ سه‌گزینه‌ای (ص۲۴۰، آیتم ۴۲-۴۷؛ کلید ص۲۴۳)
ROLE_OPTIONS = ["Topic sentence", "Supporting sentence", "Concluding sentence"]
ROLE_STEMS = {
    1: "We cannot think of life without water.",                                              # ۴۲
    2: "So, water is also essential for animals, birds, insects, etc.",                       # ۴۳
    3: "Water is the most essential element in our life.",                                    # ۴۴
    4: "Thus, water is very important to our life and our planet.",                           # ۴۵
    5: "We need huge resources of water to generate electricity on a large and commercial scale.",  # ۴۶
    6: "Besides, No living-being can exist for long without water, the most valuable liquid.",      # ۴۷ — املأ بدنهٔ چاپ
}
K_ROLE = {1: 1, 2: 1, 3: 0, 4: 2, 5: 1, 6: 1}  # abc — کلید جدول ص۲۴۳: Supporting×۴ / Topic=۴۴ / Concluding=۴۵
LESSON_ROLE = {
    "lesson": 78, "title": "نهایی خرداد ۹۸ — نقش‌های پاراگراف آب: تست (ص۲۴۰)",
    "level": "استاندارد", "count": 6,
    "questions": [q_mcq(f"g12-fin98-role{i}", i, ROLE_STEMS[i], ROLE_OPTIONS, "abc"[K_ROLE[i]], "abc")
                  for i in range(1, 7)],
}

# ================================================================ S15 — ریدینگ نیکوکاری: ۲ تایپی + ۱ هم‌معنی + ۲ درست/نادرست (ص۲۴۰، آیتم ۴۸-۵۲)
RD1_TYPED = {
    1: ("What can it lead to when you see the impacts on those you are helping?",
        "It can lead not only to great personal happiness but also to respect from others who appreciate the work you do."),
    2: ("What is the important point in helping others?",
        "The important point is that we continue to give to those who are more in need than ourselves."),
}
RD1_MCQ = {
    3: ("What is the closest synonym for the word \"benefit\"?",
        ["experience", "advantage", "choice", "effect"], "b"),  # ۵۰
}
RD1_TF = {
    4: ("Helping people in bad environmental events has the global importance.", "a"),  # ۵۱ True
    5: ("All people feel great personal happiness when they help others.", "a"),        # ۵۲ True — تنشِ کلیدِ چاپی — رسید (الگوی r289)
}
LESSON_RD1 = {
    "lesson": 79, "title": "نهایی خرداد ۹۸ — ریدینگ نیکوکاری: پرسش پاسخ + تست (ص۲۴۰)",
    "level": "استاندارد", "count": 5,
    "questions": [
        *[q_typed(f"g12-fin98-rd1-{i}", i, RD1_TYPED[i][0], [RD1_TYPED[i][1]], [RD1_TYPED[i][1]],
                  "answer in a complete sentence…") for i in range(1, 3)],
        *[q_mcq(f"g12-fin98-rd1-{i}", i, RD1_MCQ[i][0], RD1_MCQ[i][1], RD1_MCQ[i][2]) for i in RD1_MCQ],
        *[q_mcq(f"g12-fin98-rd1-{i}", i, RD1_TF[i][0], ["True", "False"], RD1_TF[i][1], "ab") for i in RD1_TF],
    ],
}

# ================================================================ S16 — ریدینگ دیکشنری: ۳ تایپی + ۲ MCQ + ۱ درست/نادرست (ص۲۴۱، آیتم ۵۳-۵۸)
RD2_TYPED = {
    1: ("How can a talking dictionary help us?",
        "By using a talking dictionary, we are able to look the words up in a few minutes."),
    2: ("What is the use of example sentences?",
        "Seeing specific words used in a sentence can provide more context and help you better understand proper usage."),
    3: ("When is a dictionary a great help for us?",
        "When reading or writing a story, an essay, a paragraph or even a sentence, using a dictionary is a great help."),
}
RD2_MCQ = {
    4: ("What does the pronoun (it) in line 7 refer to?",
        ["pronunciation", "spelling", "part of speech", "example sentence"], "c"),  # ۵۶
    5: ("What is the opposite of the underlined word \"available\"?",
        ["out of reach", "valuable", "repetitive", "accessible"], "a"),             # ۵۷
}
RD2_TF = {
    6: ("Learning a word's part of speech helps us better understand proper usage of it.", "b"),  # ۵۸ False
}
LESSON_RD2 = {
    "lesson": 80, "title": "نهایی خرداد ۹۸ — ریدینگ دیکشنری: پرسش پاسخ + تست (ص۲۴۱)",
    "level": "استاندارد", "count": 6,
    "questions": [
        *[q_typed(f"g12-fin98-rd2-{i}", i, RD2_TYPED[i][0], [RD2_TYPED[i][1]], [RD2_TYPED[i][1]],
                  "answer in a complete sentence…") for i in RD2_TYPED],
        *[q_mcq(f"g12-fin98-rd2-{i}", i, RD2_MCQ[i][0], RD2_MCQ[i][1], RD2_MCQ[i][2]) for i in RD2_MCQ],
        *[q_mcq(f"g12-fin98-rd2-{i}", i, RD2_TF[i][0], ["True", "False"], RD2_TF[i][1], "ab") for i in RD2_TF],
    ],
}

NEW_LESSONS = [LESSON_LIS, LESSON_VOCPIC, LESSON_DEF, LESSON_BANK, LESSON_KNOW,
               LESSON_VF, LESSON_G, LESSON_WO, LESSON_CONN, LESSON_ROLE, LESSON_RD1, LESSON_RD2]

# ================================================================ داوری دوم — معناییِ مستقل
EXPECTED = {
    "lis": {1: "wind", 2: "a", 3: "c", 4: "b", 5: "d", 6: "c", 7: "a", 8: "b"},
    "vocpic": {1: "hard", 2: "turbines"},
    "def": {1: "e", 2: "c", 3: "a", 4: "d"},
    "bank": {1: "consume", 2: "combination", 3: "dedicated"},
    "know": {1: "absorb", 2: "symbol", 3: "hug"},
    "vf": {1: "seems", 2: "had decided", 3: "would go", 4: "are served"},
    "g": {1: "b", 2: "d", 3: "c", 4: "a"},
    "wo": {1: ["Everything in the garden was brown because it hadn't rained for months.",
               "Everything is brown in the garden because it hadn't rained for months."],
           2: ["The woman who lives next door is a famous professor.",
               "The woman who is a famous professor lives next door."]},
    "conn": {1: "so", 2: "and", 3: "but", 4: "or"},
    "role": {1: "Supporting", 2: "Supporting", 3: "Topic", 4: "Concluding", 5: "Supporting", 6: "Supporting"},
    "rd1mcq": {3: "b"},
    "rd1tf": {4: "True", 5: "True"},
    "rd2mcq": {4: "c", 5: "a"},
    "rd2tf": {6: "False"},
}
got = {
    "lis": {**K_LIS_TYPED, **{i: LIS_MCQ[i][2] for i in LIS_MCQ}},
    "vocpic": {i: VOCPIC[i][1][-1] for i in VOCPIC},
    "def": K_DEF, "bank": K_BANK,
    "know": {i: KNOW[i][1][0] for i in KNOW},
    "vf": K_VF, "g": K_G, "wo": K_WO, "conn": K_CONN,
    "role": {i: ROLE_OPTIONS[K_ROLE[i]].replace(" sentence", "") for i in K_ROLE},
    "rd1mcq": {i: RD1_MCQ[i][2] for i in RD1_MCQ},
    "rd1tf": {i: ("True" if RD1_TF[i][1] == "a" else "False") for i in RD1_TF},
    "rd2mcq": {i: RD2_MCQ[i][2] for i in RD2_MCQ},
    "rd2tf": {i: ("True" if RD2_TF[i][1] == "a" else "False") for i in RD2_TF},
}
for fam in EXPECTED:
    require(got[fam] == EXPECTED[fam], f"داوری دوم ناهمسان در {fam}: {got[fam]}")
# کلیدهای دودویی چاپی
require(VOCPIC[2][1] == ["wind turbines", "turbines"], "کلید دودویی ۱۶ ناهمسان")
require(KNOW[2][1] == ["symbol", "sign"], "کلید دودویی ۲۵ ناهمسان")
require(VF_DUAL[3] == ["would go", "could go"], "کلید دودویی ۲۹ ناهمسان")
# پاسخ‌های تاییدیِ ریدینگ — عین کلید چاپی ص۲۴۳
require(RD1_TYPED[1][1].startswith("It can lead not only to great personal happiness"), "کلید ۴۸ ناهمسان")
require(RD1_TYPED[2][1].startswith("The important point is that"), "کلید ۴۹ ناهمسان")
require(RD2_TYPED[1][1].startswith("By using a talking dictionary"), "کلید ۵۳ ناهمسان")
require(RD2_TYPED[2][1].startswith("Seeing specific words used in a sentence"), "کلید ۵۴ ناهمسان")
require(RD2_TYPED[3][1].startswith("When reading or writing a story"), "کلید ۵۵ ناهمسان")

# ================================================================ راستی‌آزمایی حضورِ OCR — بدنه
for stem in LIS_TYPED.values():
    require(ocr_has("Which one is clean energy? Wind or Coal"), f"OCR ساقهٔ LIS-7 نیافت")
for i, (stem, opts, key) in LIS_MCQ.items():
    require(ocr_has_stem(stem), f"OCR ساقهٔ LIS-{i} نیافت")
    for o in opts:
        require(ocr_has(o), f"OCR گزینهٔ LIS-{i} نیافت: {o}")
require(ocr_has("8. a/ do not pollute the earth"), "OCR کلید ۸ نیافت")
require(ocr_has("9. c/ is reduced"), "OCR کلید ۹ نیافت")
require(ocr_has("it was a secret"), "OCR کلید ۱۰ نیافت")
require(ocr_has("11. d/ to buy a new mobile phone"), "OCR کلید ۱۱ نیافت")
require(ocr_has("12. c/ air pollution"), "OCR کلید ۱۲ نیافت")
require(ocr_has("13. a/ big cities"), "OCR کلید ۱۳ نیافت")
require(ocr_has("14. b/ diseases"), "OCR کلید ۱۴ نیافت")
for i, (stem, acc) in VOCPIC.items():
    require(ocr_has("of hearing") if i == 1 else ocr_has("(s) use wind to generate electricity"),
            f"OCR ساقهٔ VOCPIC-{i} نیافت")
    require(ocr_has("We have to speak louder, because my grandfather is") if i == 1
            else ocr_has("In opposite to fans,"), f"OCR بدنهٔ VOCPIC-{i} نیافت")
    for a in acc:
        require(ocr_has(a), f"OCR کلید VOCPIC-{i} نیافت: {a}")
require(ocr_has("15. hard"), "OCR کلید ۱۵ نیافت")
require(ocr_has("16. Wind turbines/ turbines"), "OCR کلید ۱۶ نیافت")
for h in DEF_HEADS.values():
    require(ocr_has(h), f"OCR سرِ تعریف نیافت: {h[:40]}")
for o in DEF_OPTIONS:
    require(ocr_has(o), f"OCR گزینهٔ تعریف {o[:30]} نیافت")
require(ocr_has("17.    ( e )"), "OCR کلید ۱۷ نیافت")
require(ocr_has("18. ( c )"), "OCR کلید ۱۸ نیافت")
require(ocr_has("19. (  a  )"), "OCR کلید ۱۹ نیافت")
require(ocr_has("20. ( d  )"), "OCR کلید ۲۰ نیافت")
for w in BANK_PRINTED:
    require(ocr_has(w), f"OCR واژهٔ بانک {w} نیافت")
for i, stem in BANK_STEMS.items():
    require(ocr_has_stem(stem), f"OCR ساقهٔ BANK-{i} نیافت")
require(ocr_has("21.  consume"), "OCR کلید ۲۱ نیافت")
require(ocr_has("22. combination"), "OCR کلید ۲۲ نیافت")
require(ocr_has("23. dedicated"), "OCR کلید ۲۳ نیافت")
require(ocr_has("24. absorb"), "OCR کلید ۲۴ نیافت")
require(ocr_has("25. symbol /sign"), "OCR کلید ۲۵ نیافت")
require(ocr_has("carbon dioxide from the air"), "OCR بدنهٔ ۲۴ نیافت")
require(ocr_has("H is the chemical s"), "OCR بدنهٔ ۲۵ نیافت")
require(ocr_has("for hydrogen"), "OCR دنبالهٔ ۲۵ نیافت")
require(ocr_has("In Germany people usually h"), "OCR بدنهٔ ۲۶ نیافت")
require(ocr_has("each other when they meet"), "OCR دنبالهٔ ۲۶ نیافت")
require(ocr_has("hug"), "OCR لنگرِ واژه‌نامه‌ایِ hug نیافت")
for i, stem in VF_STEMS.items():
    require(ocr_has_stem(stem), f"OCR ساقهٔ VF-{i} نیافت")
    require(ocr_has(stem.split("(")[1].rstrip(")")), f"OCR راهنمای فعل VF-{i} نیافت")
require(ocr_has("rather cold today, doesn't it?"), "OCR دنبالهٔ ۲۷ نیافت")
require(ocr_has("to go swimming before I left home"), "OCR دنبالهٔ ۲۸ نیافت")
require(ocr_has("If it were fine,"), "OCR بدنهٔ ۲۹ نیافت")
require(ocr_has("swimming today"), "OCR دنبالهٔ ۲۹ نیافت")
require(ocr_has("a variety of sea foods"), "OCR بدنهٔ ۳۰ نیافت")
require(ocr_has("27. seems"), "OCR کلید ۲۷ نیافت")
require(ocr_has("28. had decided"), "OCR کلید ۲۸ نیافت")
require(ocr_has("29. would/ could go"), "OCR کلید ۲۹ نیافت")
require(ocr_has("30. are served"), "OCR کلید ۳۰ نیافت")
for i, stem in G_STEMS.items():
    require(ocr_has_stem(stem), f"OCR ساقهٔ G-{i} نیافت")
for i in G_OPTIONS:
    for o in G_OPTIONS[i]:
        require(ocr_has(o), f"OCR گزینهٔ G-{i} نیافت: {o}")
require(ocr_has("31. b/ which"), "OCR کلید ۳۱ نیافت")
require(ocr_has("32. d/ may be produced"), "OCR کلید ۳۲ نیافت")
require(ocr_has("33. c/ communicative"), "OCR کلید ۳۳ نیافت")
require(ocr_has("34. a/ into"), "OCR کلید ۳۴ نیافت")
for i, scr in WO_SCRAMBLES.items():
    for tok in [t.strip() for t in scr.split("/") if t.strip() not in (".", "")]:
        require(ocr_has(tok), f"OCR توکن WO-{i} نیافت: {tok}")
require(ocr_has("Everything in the garden was brown"), "OCR تکهٔ کلید WO-1a نیافت")
require(ocr_has("because it hadn't rained for months"), "OCR تکهٔ کلید WO-1b نیافت")
require(ocr_has("everything is brown in the garden"), "OCR تکهٔ واریانت دوم WO-1 نیافت")
require(ocr_has("The woman who lives next door"), "OCR تکهٔ کلید WO-2a نیافت")
require(ocr_has("is a famous professor"), "OCR تکهٔ کلید WO-2b نیافت")
require(ocr_has("The woman who is a famous professor"), "OCR تکهٔ واریانت دوم WO-2 نیافت")
for i, stem in CONN_STEMS.items():
    require(ocr_has_stem(stem), f"OCR ساقهٔ CONN-{i} نیافت")
require(ocr_has("37.  so"), "OCR کلید ۳۷ نیافت")
require(ocr_has("38. and"), "OCR کلید ۳۸ نیافت")
require(ocr_has("39. but"), "OCR کلید ۳۹ نیافت")
require(ocr_has("40. or"), "OCR کلید ۴۰ نیافت")
# پاراگراف‌نویسی باز ۴۱ — رسیدِ غیبت
require(ocr_has("save our Earth"), "OCR عنوان ۴۱ نیافت")
for prompt in ["Plant trees", "Use less fossil fuels", "Increase the use of solar and wind energy",
               "Change waste to energy"]:
    require(ocr_has(prompt), f"OCR موضوعِ ۴۱ نیافت: {prompt}")
# نقش‌های پاراگراف — ساقه‌ها + جدولِ کلیدِ ص۲۴۳
for i, stem in ROLE_STEMS.items():
    require(ocr_has(stem), f"OCR ساقهٔ ROLE-{i} نیافت")
require(ocr_has("Water is the most essential element in our life. 44"), "OCR سطرِ جدول Topic=۴۴ نیافت")
require(ocr_has("We cannot think of life without water. 42"), "OCR سطرِ جدول ۴۲ نیافت")
require(ocr_has("So, water is also essential for animals, birds, insects, etc. 43"), "OCR سطرِ جدول ۴۳ نیافت")
require(ocr_has("Thus, water is very important to our life and our planet. 45"), "OCR سطرِ جدول ۴۵ نیافت")
require(ocr_has("We need huge resources of water to generate electricity on a large and commercial scale. 46"),
        "OCR سطرِ جدول ۴۶ نیافت")
require(ocr_has("Besides, no living being can exist for long without water, the most valuable liquid. 47"),
        "OCR سطرِ جدول ۴۷ نیافت")
require(ocr_has("Topic"), "OCR برچسب Topic نیافت")
require(ocr_has("Concluding"), "OCR برچسب Concluding نیافت")
# ریدینگ نیکوکاری
require(ocr_has("Some people prefer to provide help and support directly to those in need"),
        "OCR بدنهٔ ریدینگ ۱ نیافت")
for i, (stem, acc) in RD1_TYPED.items():
    require(ocr_has(stem), f"OCR ساقهٔ RD1-{i} نیافت")
    for frag in ([acc[:46], acc.split(" but also to ")[1][:40]] if i == 1 else [acc[:30], acc.split(" than ")[1][:40]]):
        require(ocr_has(frag), f"OCR کلید RD1-{i} نیافت: {frag[:40]}")
for i, (stem, opts, key) in RD1_MCQ.items():
    require(ocr_has(stem.rstrip("?").replace("\"benefit\"", "benefit")), f"OCR ساقهٔ RD1-{i} نیافت")
    for o in opts:
        require(ocr_has(o), f"OCR گزینهٔ RD1-{i} نیافت: {o}")
require(ocr_has("50. b/ advantage"), "OCR کلید ۵۰ نیافت")
for i, (stem, key) in RD1_TF.items():
    require(ocr_has(stem), f"OCR ساقهٔ RD1-TF-{i} نیافت")
require(ocr_has("51. (a) True"), "OCR کلید ۵۱ نیافت")
require(ocr_has("52. (a) True"), "OCR کلید ۵۲ نیافت")
# ریدینگ دیکشنری
require(ocr_has("A dictionary is a collection of words ranging from letters A-Z"), "OCR بدنهٔ ریدینگ ۲ نیافت")
for i, (stem, acc) in RD2_TYPED.items():
    require(ocr_has(stem), f"OCR ساقهٔ RD2-{i} نیافت")
    require(ocr_has(acc[:34]), f"OCR کلید RD2-{i} نیافت: {acc[:34]}")
require(ocr_has("we are able to look the words up in a few minutes"), "OCR دنبالهٔ کلید ۵۳ نیافت")
require(ocr_has("text and help you better"), "OCR دنبالهٔ کلید ۵۴ (آشفتگیِ سطرِ OCR) نیافت")
require(ocr_has("understand proper usage"), "OCR دنبالهٔ کلید ۵۴ نیافت")
require(ocr_has("using a dictionary is a great help"), "OCR دنبالهٔ کلید ۵۵ نیافت")
for i, (stem, opts, key) in RD2_MCQ.items():
    require(ocr_has(stem.rstrip("?")), f"OCR ساقهٔ RD2-{i} نیافت")
    for o in opts:
        require(ocr_has(o), f"OCR گزینهٔ RD2-{i} نیافت: {o}")
require(ocr_has("56. c/ part of speech"), "OCR کلید ۵۶ نیافت")
require(ocr_has("57. a / out of reach"), "OCR کلید ۵۷ نیافت")
require(ocr_has("Learning a word's part of speech helps us better understand proper usage of it"),
        "OCR ساقهٔ ۵۸ نیافت")
require(ocr_has("58. b / False"), "OCR کلید ۵۸ نیافت")
# کلیدهای شنیداریِ بدونِ متن (رسیدِ غیبتِ بخش ۱)
for frag in ["1. take temperature", "2. Dr. Gharib", "3. Solar power", "5. Natural gas, oil",
             "6. I would take a photo"]:
    require(ocr_has(frag), f"OCR کلید listening نیافت: {frag}")
require(ocr_has("کافی است"), "OCR یادداشتِ فارسیِ کلید ۵ نیافت (NFKC)")
# سربرگ‌های چاپی و یادداشتِ صوت
for h in ["Vocabulary", "Grammar", "Writing", "Reading"]:
    require(ocr_has(h), f"OCR سربرگ {h} نیافت")
require(ocr_has("Audio file (MP3)"), "OCR یادداشتِ صوت نیافت")
require(ocr_has("Audio script (PDF)"), "OCR یادداشتِ متنِ صوت نیافت")

if failures:
    print("FAIL — راستی‌آزمایی/داوری:")
    for f in failures:
        print("  ✗", f)
    sys.exit(1)

# ================================================================ تزریق به بانک
data = json.loads(BANK_PATH.read_text(encoding="utf-8"))
existing_ids = [q["id"] for l in data["lessons"] for q in l["questions"]]
existing_set = set(existing_ids)
new_ids = [q["id"] for l in NEW_LESSONS for q in l["questions"]]
dup = [i for i in new_ids if i in existing_set] + [i for i in new_ids if new_ids.count(i) > 1]
if dup:
    print("FAIL — شناسهٔ تکراری:", sorted(set(dup)))
    sys.exit(1)

next_lesson = max(l["lesson"] for l in data["lessons"]) + 1
require(next_lesson == 69, f"شمارهٔ درسِ بعدی {next_lesson} است نه ۶۹")
for l in NEW_LESSONS:
    if l["lesson"] != next_lesson:
        print(f"FAIL — ترتیب درس: انتظار {next_lesson}، یافت {l['lesson']}")
        sys.exit(1)
    if l["count"] != len(l["questions"]):
        print(f"FAIL — شمارِ درس {l['lesson']} ناهمسان")
        sys.exit(1)
    data["lessons"].append(l)
    next_lesson += 1

data["source"]["final98"] = {
    "pages": "237-241",
    "keyPages": "242-243",
    "titlePrinted": "آزمون نهایی انگلیسی دوازدهم — نوبت خرداد ۱۳۹۸ (تاریخ امتحان 13/3/1398، مدت ۱۲۰ دقیقه، داوطلبان آزاد و بزرگسال سراسر کشور — بخش چهارم: آزمون‌های نهایی دی ۹۷ تا شهریور ۱۴۰۱) — «Vision Three»",
    "sections": 16,
    "banks": 12,
    "questions": 51,
    "keys": 51,
    "extractedRound": 293,
    "audioAbsent": {
        "section": "1 (listening ۱-۶ بدونِ متنِ چاپی)", "items": 6,
        "printedKey": "1. take temperature / 2. Dr. Gharib / 3. Solar power / 4. English / 5. Natural gas, oil, and coal (ذکر دو مورد کافی است) / 6. I would take a photo / photos",
        "note": "بدنهٔ چاپی ندارد (فقط کلیدِ کوتاهِ راهنمای تصحیح ص۲۴۲) — بانک ساخته نشد؛ بخش ۲ (۷-۱۴) متنِ چاپیِ کامل دارد و در بانک ۶۹ آمد؛ یادداشتِ چاپیِ خودِ برگه: «Audio file (MP3) / Audio script (PDF)»",
    },
    "openWritingAbsent": {
        "section": "13 (پاراگراف‌نویسی «save our Earth» آیتم ۴۱)", "items": 1,
        "note": "پاسخِ باز با داوریِ اصولیِ تصحیح‌کننده (کلید ص۲۴۳: رعایت اصول topic/supporting/concluding و عباراتِ داده‌شده) — بانک صادقانه ساخته نشد؛ موضوع‌های چاپی: Plant trees / Use less fossil fuels / Increase the use of solar and wind energy / Change waste to energy",
    },
    "receipts": [
        {"item": "7-14", "field": "section", "printed": "«به فایل صوتی به دقت گوش دهید» + Audio file (MP3)",
         "note": "بخش ۲ رسماً شنیداری است اما ساقه/گزینه/کلیدِ چاپیِ کامل دارد — نخستین بانکِ شنیداریِ متن‌چاپ؛ آیتم‌های ۱۰-۱۲ وابسته به داستانِ صوتیِ نامشنیدهٔ Bijan/Mehran — با کلیدِ چاپیِ راهنما حاکم"},
        {"item": "12,13,14", "field": "options", "printed": "سه‌گزینه‌ایِ چاپ (a/b/c)",
         "note": "برخلاف ۸-۱۱ چهارگزینه‌ای — عین چاپ"},
        {"item": "26", "field": "accepted", "printed": "کلیدِ چاپی «26. hu» — بریدهٔ OCR",
         "note": "تکمیل به hug: حرفِ نخستِ چاپیِ ساقه (h…) + پیشوندِ چاپی (hu) + حضورِ hug در واژه‌نامهٔ خود جزوه — دریافت شد"},
        {"item": "31-34", "field": "options", "printed": "چاپ وارونه d,c,b,a (از d به a)",
         "note": "به ترتیب طبیعی a-d بازنگاشت شد — الگوی r290/r291؛ کلیدهای حرفیِ راهنما (b/d/c/a) عین چاپ حاکم"},
        {"item": "35", "field": "accepted", "printed": "«Everything in the garden was brown or everything is brown in the garden…»",
         "note": "نخستین کلیدِ دودوییِ جمله‌کامل؛ واریانت دوم چاپی «is» دارد در حالی‌که بهم‌ریخته فقط «was» — وفادار به هر دو واریانتِ راهنما؛ رسید ثبت شد"},
        {"item": "36", "field": "accepted", "printed": "دو واریانتِ چاپیِ راهنما",
         "note": "«The woman who lives next door is a famous professor» / «The woman who is a famous professor lives next door»"},
        {"item": "16", "field": "accepted", "printed": "«Wind turbines/ turbines»", "note": "کلید دودوییِ چاپ"},
        {"item": "25", "field": "accepted", "printed": "«symbol /sign»", "note": "کلید دودوییِ چاپ"},
        {"item": "29", "field": "accepted", "printed": "«would/ could go»", "note": "کلید دودوییِ چاپ"},
        {"item": "47", "field": "stem", "printed": "بدنه: «No living-being» / جدولِ کلید: «no living being»",
         "note": "املأ بدنهٔ برگهٔ سؤال حاکم؛ واریانسِ راهنما ثبت شد"},
        {"item": "52", "field": "answer", "printed": "کلید چاپی (a) True",
         "note": "تنشِ معناییِ «All people» — الگوی r289 («All people») و r289-receipt؛ کلید چاپی حاکم"},
        {"item": "44", "field": "answer", "printed": "جدولِ ص۲۴۳",
         "note": "Topic جملهٔ نخستِ پاراگراف نیست (۴۲ اول است) — جدولِ Descriptor صریح: Topic=۴۴؛ «ترتیب جملات Supporting مهم نیست»"},
        {"item": "54", "field": "accepted", "printed": "کلیدِ OCR با آشفتگیِ سطر (can provide more con / text and help you better / understand proper usage)",
         "note": "بازمونتاژ شد؛ تکه‌ها جداگانه راستی‌آزمایی شدند"},
        {"item": "55", "field": "accepted", "printed": "«story,an essay,a paragraph» بدونِ فاصلهٔ پس از ویرگول",
         "note": "فاصله‌گذاریِ ویرگولِ OCR یکدست شد؛ عبارت عین چاپ"},
        {"item": "3", "field": "printedKey", "printed": "«5. Natural gas, oil ,and coal (ذکر دو مورد کافی است)»",
         "note": "یادداشتِ بخششِ نمرهٔ چاپیِ راهنما در رسیدِ غیبتِ شنیداری محفوظ است"},
        {"item": "15,16", "field": "section", "printed": "«با توجه به تصاویر داده شده»",
         "note": "ساقه و کلید از متنِ چاپی کامل است — تصویر صرفاً تزئینی؛ بانک تایپی ساخته شد"},
        {"item": "passages", "field": "—", "printed": "p240-241",
         "note": "متنِ دو ریدینگ درون‌اپ حمل نشد (الگوی r289-r292) — تصویر صفحه در کتابخانهٔ جزوه در دسترس است"},
    ],
}

BANK_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(l["count"] for l in data["lessons"])
print(f"OK — lessons now {len(data['lessons'])}, family total {total} (added 51)")
print("ids:", ", ".join(new_ids[:5]), "…", new_ids[-1])
