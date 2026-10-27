#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r296 — آزمون نهایی خرداد ۱۳۹۹ (Vision Three بخش چهارم، ص۲۵۹-۲۶۵؛ راهنمای تصحیح ص۲۶۶-۲۶۷)
پنجمین نوبت از دوازده نوبتِ «آزمون‌های نهایی دی ۹۷ تا شهریور ۱۴۰۱».
۱۵ بانک / ۶۳ آیتم از ۱۷ بخش چاپی (۶۰ آیتمِ چاپی → ۶۳ آیتمِ قابلِ بازی: بخش ۱۵ هر دو بخشِ الف/ب و
بخش ۱۶ هر دو واریانتِ a/b استخراج شدند)؛ آیتم ۳۰ (موصولِ باز — کلیدِ راهنما فقط معیارِ «which + عبارتِ دارای فعل»
بدونِ نمونهٔ چاپی)، آیتم‌های ۵۳/۵۴ (topic sentence با بارمِ صرفاً اصولی) و بخش ۱۷ (انتخابیِ ج/د —
topic sentence تصویری + پاراگرافِ بازِ شهید فهمیده) غیبتِ صادقانه — کلیدها/داده‌ها در رسید.
نوهای راند: نخستین استخراجِ موازیِ هر دو شاخهٔ انتخابیِ آزمون (۱۵ الف تعریف‌ها + ۱۵ ب ضرب‌المثل‌ها به‌عنوانِ دو بانک)؛
نخستین مرتب‌کردنِ چهارواریانته از دو آیتمِ انتخابی a/b (۵۹-۶۰)؛ دومین کلیدِ سه‌واریانته (۳۴ might/would/could)؛
نخستین کلیدِ چندمنبعیِ بازمونتاژشده (۴۵ «streams and rivers/oceans/water» → سه واریانتِ جمله‌کامل)؛
بازمونتاژِ کلیدِ آشفتهٔ OCRِ ۱۰ با لنگرهای چندگانه («No, he doesn`t appreciate the woman`s job.») — الگوی r294.
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

TF = ["True", "False"]

# ================================================================ S1 — شنیداری فایل ۱: ۲ درست/نادرست + ۲ تایپی (ص۲۵۹، آیتم ۱-۴؛ کلید ص۲۶۶)
L1_TF = {
    1: ("The man has taken the laptop to the computer shop.", "b"),   # ۱ False
    2: ("She wants to hit someone in the head.", "b"),                # ۲ False
}
L1_TYPED = {
    3: ("The woman would buy a new laptop if --------------- .",
        ["she had the money."]),                                       # ۳ — کلیدِ چاپیِ راهنما (املای چاپیِ کوچک‌نویس وفادار)
    4: ("Why does the woman want to throw the laptop out the window? Because ---------------.",
        ["Because it is so slow."]),                                   # ۴
}
LESSON_L1 = {
    "lesson": 105, "title": "نهایی خرداد ۹۹ — شنیداری فایل ۱: درست/نادرست + پرسش پاسخ (ص۲۵۹)",
    "level": "استاندارد", "count": 4,
    "questions": [
        *[q_mcq(f"g12-fin99k-l1tf{i}", i, L1_TF[i][0], TF, L1_TF[i][1], "ab") for i in L1_TF],
        *[q_typed(f"g12-fin99k-l1t{i}", i, L1_TYPED[i][0], L1_TYPED[i][1], L1_TYPED[i][1],
                  "answer in a complete sentence…") for i in L1_TYPED],
    ],
}

# ================================================================ S2 — شنیداری فایل ۲: ۲ MCQ + ۲ درست/نادرست + ۲ تایپی (ص۲۵۹، آیتم ۵-۱۰؛ کلید ص۲۶۶)
L2_MCQ = {
    1: ("What is the woman doing?",
        ["She is trying to imagine.", "She is trying to invite somebody.",
         "She is working on her invention.", "She is cooking food."], "c"),   # ۵
    2: ("Which one is not mentioned in the dialog you heard?",
        ["energy source", "fuel", "coal", "renewable energy"], "c"),          # ۶
}
L2_TF = {
    3: ("The woman thinks recycling unwanted food to fuel will happen in the future.", "a"),  # ۷ True
    4: ("The man thinks that the woman is doing something new.", "b"),                        # ۸ False
}
L2_TYPED = {
    5: ("Does the man like the smell?",
        ["No, he doesn`t like it."]),                                          # ۹
    6: ("Does the man appreciate the woman’s job?",
        ["No, he doesn`t appreciate the woman`s job."]),                       # ۱۰ — بازمونتاژِ کلیدِ آشفتهٔ OCR با لنگرهای چندگانه
}
LESSON_L2 = {
    "lesson": 106, "title": "نهایی خرداد ۹۹ — شنیداری فایل ۲: تست + درست/نادرست + پرسش پاسخ (ص۲۵۹)",
    "level": "استاندارد", "count": 6,
    "questions": [
        *[q_mcq(f"g12-fin99k-l2m{i}", i, L2_MCQ[i][0], L2_MCQ[i][1], L2_MCQ[i][2]) for i in L2_MCQ],
        *[q_mcq(f"g12-fin99k-l2t{i}", i, L2_TF[i][0], TF, L2_TF[i][1], "ab") for i in L2_TF],
        *[q_typed(f"g12-fin99k-l2w{i}", i, L2_TYPED[i][0], L2_TYPED[i][1], L2_TYPED[i][1],
                  "answer in a complete sentence…") for i in L2_TYPED],
    ],
}

# ================================================================ S3 — شنیداری فایل ۳: ۲ درست/نادرست + ۳ تایپی (ص۲۵۹، آیتم ۱۱-۱۵؛ کلید ص۲۶۶)
L3_TF = {
    1: ("The man is working alone now.", "b"),        # ۱۱ False
    2: ("The man likes the new environment.", "a"),   # ۱۲ True
}
L3_TYPED = {
    3: ("According to the speaker, Delilah is the --------------- member in the team.",
        ["creative"], "fill in the blank with one word…"),   # ۱۳ — راهنما: هر واژهٔ اشاره‌گر صحیح است؛ کلیدِ چاپی حاکم
    4: ("The key to their success in working together is that they --------------- .",
        ["respect each other`s abilities."], "answer in a complete sentence…"),   # ۱۴
    5: ("What was his idea about working in a team environment a year ago?",
        ["He didn`t enjoy working in a team environment a year ago."], "answer in a complete sentence…"),  # ۱۵
}
LESSON_L3 = {
    "lesson": 107, "title": "نهایی خرداد ۹۹ — شنیداری فایل ۳: درست/نادرست + کامل کنید (ص۲۵۹)",
    "level": "استاندارد", "count": 5,
    "questions": [
        *[q_mcq(f"g12-fin99k-l3t{i}", i, L3_TF[i][0], TF, L3_TF[i][1], "ab") for i in L3_TF],
        *[q_typed(f"g12-fin99k-l3w{i}", i, L3_TYPED[i][0], L3_TYPED[i][1], L3_TYPED[i][1],
                  L3_TYPED[i][2]) for i in L3_TYPED],
    ],
}

# ================================================================ S4 — واژگان با تصویر: ۴ MCQ از ۵ جملهٔ چاپی (ص۲۶۰، آیتم ۱۶-۱۹؛ کلید ص۲۶۶)
PIC_OPTIONS = ["Taking people’s temperature can help them fight the coronavirus.",   # a
               "If you focus the sun`s rays through a magnifying glass on a dry leaf, it will start to burn.",  # b
               "Teenagers who help others are more successful in life.",              # c — اضافهٔ چاپی
               "Wind tower is a type of natural air cooling system.",                 # d
               "John couldn’t figure out what the teacher was talking about."]        # e — عیناً چاپ
K_PIC = {1: "d", 2: "e", 3: "b", 4: "a"}  # ۱۶-۱۹ — کلیدهای حرفیِ راهنما؛ c اضافهٔ چاپی
LESSON_PIC = {
    "lesson": 108, "title": "نهایی خرداد ۹۹ — واژگان با تصویر: جملهٔ مناسب هر تصویر (ص۲۶۰)",
    "level": "استاندارد", "count": 4,
    "questions": [q_mcq(f"g12-fin99k-pic{i}", i,
                        "با توجه به تصاویر داده شده، جملهٔ مناسب برای هر تصویر را انتخاب کنید. (یک جمله اضافی است) — تصویر (16)" if i == 1
                        else f"با توجه به تصاویر داده شده، جملهٔ مناسب برای هر تصویر را انتخاب کنید. (یک جمله اضافی است) — تصویر ({15 + i})",
                        PIC_OPTIONS, K_PIC[i]) for i in K_PIC],
}

# ================================================================ S5 — بانک واژگان: ۳ تایپی (ص۲۶۰، آیتم ۲۰-۲۲؛ کلید ص۲۶۶)
VOCBANK_PRINTED = ["suppose", "honored", "demand", "overcome"]  # demand اضافهٔ چاپی
VOCBANK_STEMS = {
    1: "Elders feel --------------- when we appreciate them.",                                # ۲۰
    2: "People use hybrid cars to --------------- the problem of charging electric cars.",    # ۲۱
    3: "Let us --------------- for a moment that the news is really true.",                   # ۲۲
}
K_VOCBANK = {1: "honored", 2: "overcome", 3: "suppose"}
LESSON_VOCBANK = {
    "lesson": 109, "title": "نهایی خرداد ۹۹ — واژگان: جای خالی از بانک (ص۲۶۰)",
    "level": "آموزشی — ورود آزاد", "count": 3,
    "questions": [q_typed(f"g12-fin99k-vb{i}", i, VOCBANK_STEMS[i], VOCBANK_PRINTED, [K_VOCBANK[i]],
                          "fill in the blank with the missing word…") for i in VOCBANK_STEMS],
}

# ================================================================ S6 — دانش واژگانی: ۳ تایپیِ حرف‌نخست‌دار (ص۲۶۰، آیتم ۲۳-۲۵؛ کلید ص۲۶۶)
OK_STEMS = {
    1: ("Dictionaries are usually in three levels: elementary, i --------------- and advanced.",
        ["intermediate"], "start with the printed first letter i…"),   # ۲۳
    2: ("The factory could r --------------- most of its workers with robots two years ago.",
        ["replace"], "start with the printed first letter r…"),        # ۲۴
    3: ("The two words at the top of each page of a dictionary are called g --------------- words.",
        ["guide"], "start with the printed first letter g…"),          # ۲۵
}
LESSON_OK = {
    "lesson": 110, "title": "نهایی خرداد ۹۹ — واژگان: کامل‌کردن از دانش خود (ص۲۶۰)",
    "level": "آموزشی — ورود آزاد", "count": 3,
    "questions": [q_typed(f"g12-fin99k-ok{i}", i, OK_STEMS[i][0], OK_STEMS[i][1], OK_STEMS[i][1],
                          OK_STEMS[i][2]) for i in OK_STEMS],
}

# ================================================================ S7 — گرامر: ۴ MCQ با چاپِ طبیعی a-d (ص۲۶۰-۲۶۱، آیتم ۲۶-۲۹؛ کلید ص۲۶۶)
G_STEMS = {
    1: "She was the person --------------- everyone regarded as trustworthy.",        # ۲۶
    2: "Scientists believe that hot weather is often --------------- the corps.",     # ۲۷ — «the corps» غلطِ چاپیِ بدنه وفادار (crops)
    3: "Zhila never says a word when she is sad,---------------?",                    # ۲۸
    4: "My father might buy a new car if some more dollars--------------- by the family.",  # ۲۹
}
G_OPTIONS = {
    1: ["which", "when", "whom", "whose"],                     # چاپِ طبیعی a-d
    2: ["endanger", "endangering", "endangered", "dangers"],
    3: ["isn’t  she", "did she", "doesn't she", "does she"],   # فاصلهٔ چاپیِ «isn’t  she» وفادار
    4: ["could  save", "were saved", "had saved", "were saving"],  # فاصلهٔ چاپیِ «could  save» وفادار
}
K_G = {1: "c", 2: "b", 3: "d", 4: "b"}  # کلیدهای حرفیِ راهنما (c)(b)(d)(b) عین چاپ
LESSON_G = {
    "lesson": 111, "title": "نهایی خرداد ۹۹ — گرامر: تست چهارگزینه‌ای (ص۲۶۰-۲۶۱)",
    "level": "استاندارد", "count": 4,
    "questions": [q_mcq(f"g12-fin99k-g{i}", i, G_STEMS[i], G_OPTIONS[i], K_G[i]) for i in range(1, 5)],
}

# ================================================================ S9 — شکل صحیح فعل در مکالمه: ۴ تایپی (ص۲۶۱، آیتم ۳۱-۳۴؛ کلید ص۲۶۶)
VF_STEMS = {
    1: ("Do you know Javid’s birthday is this Friday? You (31) --------------- (invite) to his birthday party, haven`t you?",
        ["have been invited"]),   # ۳۱
    2: ("No, nothing (32) --------------- (say) about it while I was talking to him.",
        ["was said"]),            # ۳۲
    3: ("He always (33) --------------- (decide) to do things at the last moment, doesn’t he?",
        ["decides"]),             # ۳۳
    4: ("But if he told us sooner we (34) --------------- (choose) a better gift to buy.",
        ["might choose", "would choose", "could choose"]),  # ۳۴ — دومین کلیدِ سه‌واریانتهٔ خانواده «might/would /could choose»
}
LESSON_VF = {
    "lesson": 112, "title": "نهایی خرداد ۹۹ — شکل صحیح فعل در مکالمه (ص۲۶۱)",
    "level": "آموزشی — ورود آزاد", "count": 4,
    "questions": [q_typed(f"g12-fin99k-vf{i}", i, VF_STEMS[i][0], [VF_STEMS[i][1][0]], VF_STEMS[i][1],
                          "write the correct form of the verb…") for i in VF_STEMS],
}

# ================================================================ S10 — ریدینگ زبان‌ها: ۲ MCQ + ۲ درست/نادرست + ۲ تایپی (ص۲۶۱-۲۶۲، آیتم ۳۵-۴۰؛ کلید ص۲۶۶)
R1_MCQ = {
    1: ("The word “it” in paragraph 2 line 4 refers to --------------- .",
        ["learning first language", "second language", "difference of languages", "Chinese language"], "b"),  # ۳۵
    2: ("Hardness of learning a language can depend on --------------- .",
        ["how different it is from one’s mother tongue", "whether it is French or English",
         "whether you are learning Japanese or Chinese", "how long it takes to master pronunciation"], "a"),  # ۳۶
}
R1_TF = {
    3: ("Being familiar with writing system of the second language makes it harder to learn.", "b"),  # ۳۷ False
    4: ("The reason behind learning a language can slow down or speed up learning.", "a"),            # ۳۸ True
}
R1_TYPED = {
    5: ("Which language is easier for French people to learn, English or Chinese? Why?",
        ["English is easier for French people to learn because it is very similar to French."]),  # ۳۹ — کلید با نشانِ (0/5)(0/5)
    6: ("Why does a Japanese speaker find the Chinese writing system less difficult?",
        ["Because they already use Chinese letters in their own language."]),                     # ۴۰
}
LESSON_R1 = {
    "lesson": 113, "title": "نهایی خرداد ۹۹ — ریدینگ زبان‌ها: تست + درست/نادرست + پرسش پاسخ (ص۲۶۱-۲۶۲)",
    "level": "استاندارد", "count": 6,
    "questions": [
        *[q_mcq(f"g12-fin99k-r1m{i}", i, R1_MCQ[i][0], R1_MCQ[i][1], R1_MCQ[i][2]) for i in R1_MCQ],
        *[q_mcq(f"g12-fin99k-r1t{i}", i, R1_TF[i][0], TF, R1_TF[i][1], "ab") for i in R1_TF],
        *[q_typed(f"g12-fin99k-r1w{i}", i, R1_TYPED[i][0], R1_TYPED[i][1], R1_TYPED[i][1],
                  "answer in a complete sentence…") for i in R1_TYPED],
    ],
}

# ================================================================ S11 — ریدینگ انرژی: ۲ MCQ + ۲ درست/نادرست + ۲ تایپی (ص۲۶۲-۲۶۳، آیتم ۴۱-۴۶؛ کلید ص۲۶۶-۲۶۷)
R2_MCQ = {
    1: ("Which is the best title for this passage?",
        ["The use of waste products for energy", "The search for new sources of energy",
         "Effective ways of producing hydropower", "New discoveries in geothermal power"], "b"),  # ۴۱
    2: ("Which of the following is not offered in the passage as a source of energy?",
        ["Electrical power", "Clean energy", "Nuclear energy", "Hydroelectric power"], "c"),      # ۴۲
}
R2_TF = {
    3: ("Changing waste products to gas or oil is an expensive way to generate energy, but it is very effective.", "b"),  # ۴۳ False — متن: cheap way
    4: ("Geothermal power is the heat from the Earth.", "a"),                                                            # ۴۴ True
}
R2_TYPED = {
    5: ("What is hydroelectric power produced from?",
        ["It is produced from streams and rivers.", "It is produced from oceans.", "It is produced from water."]),  # ۴۵ — کلیدِ چندمنبعیِ بازمونتاژشده
    6: ("What will happen if the nations of the world use clean sources of energy?",
        ["It will keep the environment clean."]),  # ۴۶ — شمارهٔ چاپیِ کلید در OCR «٦٤» است (لغزشِ چاپ برای ۴۶)
}
LESSON_R2 = {
    "lesson": 114, "title": "نهایی خرداد ۹۹ — ریدینگ انرژی: تست + درست/نادرست + پرسش پاسخ (ص۲۶۲-۲۶۳)",
    "level": "استاندارد", "count": 6,
    "questions": [
        *[q_mcq(f"g12-fin99k-r2m{i}", i, R2_MCQ[i][0], R2_MCQ[i][1], R2_MCQ[i][2]) for i in R2_MCQ],
        *[q_mcq(f"g12-fin99k-r2t{i}", i, R2_TF[i][0], TF, R2_TF[i][1], "ab") for i in R2_TF],
        *[q_typed(f"g12-fin99k-r2w{i}", i, R2_TYPED[i][0], R2_TYPED[i][1], R2_TYPED[i][1],
                  "answer in a complete sentence…") for i in R2_TYPED],
    ],
}

# ================================================================ S12 — کلمات ربط: ۴ تایپی (ص۲۶۳، آیتم ۴۷-۵۰؛ کلید ص۲۶۷)
CONN_STEMS = {
    1: "Teachers work hard every day to make sure you have learnt your lessons, --------------- they deserve your respect.",   # ۴۷
    2: "You should know their values, --------------- tell them that you are grateful to them for their help.",                # ۴۸
    3: "You may sometimes forget their kindness, --------------- you need to remember that they shape your lives like your parents.",  # ۴۹
    4: "Treat them well when they are still around, --------------- you will be sorry one day.",                               # ۵۰
}
K_CONN = {1: "so", 2: "and", 3: "but", 4: "or"}  # استخرِ چاپی (but, and, so, or)
CONNECTIVES = ["but", "and", "so", "or"]
LESSON_CONN = {
    "lesson": 115, "title": "نهایی خرداد ۹۹ — کلمات ربط: معلمان (ص۲۶۳)",
    "level": "آموزشی — ورود آزاد", "count": 4,
    "questions": [q_typed(f"g12-fin99k-conn{i}", i, CONN_STEMS[i], CONNECTIVES, [K_CONN[i]],
                          "connect the sentences with and, or, but, so…") for i in CONN_STEMS],
}

# ================================================================ S13 — ادامهٔ جمله با تصویر: ۲ تایپی (ص۲۶۳، آیتم ۵۱-۵۲؛ کلید ص۲۶۷)
CONT_TYPED = {
    1: ("Many people are still becoming sick because of the COVID 19, so --------------- .",
        ["they should stay at home."]),   # ۵۱ — کلیدِ چاپیِ کوچک‌نویس وفادار
    2: ("Jimmy seems very tired, but --------------- .",
        ["he has to do his homework."]),  # ۵۲
}
LESSON_CONT = {
    "lesson": 116, "title": "نهایی خرداد ۹۹ — ادامهٔ جمله با تصویر (ص۲۶۳)",
    "level": "آموزشی — ورود آزاد", "count": 2,
    "questions": [q_typed(f"g12-fin99k-cont{i}", i, CONT_TYPED[i][0], CONT_TYPED[i][1], CONT_TYPED[i][1],
                          "complete the sentence…") for i in CONT_TYPED],
}

# ================================================================ S15-الف — تعریف‌های ستون B: ۴ MCQ از ۵ تعریفِ چاپی (ص۲۶۴، آیتم ۵۵-۵۸؛ کلید ص۲۶۷)
DEFB_OPTIONS = ["to make water, air, etc. dirty",            # a
                "lack of success in doing something",        # b
                "have something inside",                     # c
                "an arrangement in a particular order",      # d — اضافهٔ چاپی
                "many different types of things or people"]  # e
K_DEFB = {1: "b", 2: "e", 3: "a", 4: "c"}  # (الف): ۵۵b/۵۶e/۵۷a/۵۸c
DEFB_STEMS = {
    1: "Our parents have a lot to share with us like their experiences and failures.",   # ۵۵
    2: "I really like the variety the store has to offer.",                              # ۵۶
    3: "The factory polluted the river.",                                                # ۵۷
    4: "Try to avoid foods that contain a lot of fat.",                                  # ۵۸
}
LESSON_DEFB = {
    "lesson": 117, "title": "نهایی خرداد ۹۹ — واژگان: تعریف‌های ستون B، بخش الف (ص۲۶۴)",
    "level": "استاندارد", "count": 4,
    "questions": [q_mcq(f"g12-fin99k-defb{i}", i, DEFB_STEMS[i], DEFB_OPTIONS, K_DEFB[i]) for i in K_DEFB],
}

# ================================================================ S15-ب — ضرب‌المثل‌های ستون B: ۴ MCQ از ۵ معنای چاپی (ص۲۶۴، آیتم ۵۵-۵۸؛ کلید ص۲۶۷)
PRVB_OPTIONS = ["Just saying that you will do something doesn`t mean much. Actually, doing it is harder.",  # f
                "Don`t just wait for good things to happen to you. Work hard to achieve your goals.",       # g
                "Someone who has experienced some kind of negative situation will try to avoid making the same mistake.",  # h
                "People like to spend time with others who are similar to them.",                           # i — اضافهٔ چاپی
                "When two people cooperate with each other, they come up with better idea."]                # j — «better idea» غلطِ چاپی وفادار
K_PRVB = {1: "g", 2: "j", 3: "f", 4: "h"}  # (ب): ۵۵g/۵۶j/۵۷f/۵۸h
PRVB_STEMS = {
    1: "God helps those who help themselves",   # ۵۵
    2: "Two heads are better than one",         # ۵۶
    3: "Action speak louder than words",        # ۵۷ — «Action speak» غلطِ چاپیِ بدنه وفادار
    4: "A burnt child dreads the fire",         # ۵۸
}
LESSON_PRVB = {
    "lesson": 118, "title": "نهایی خرداد ۹۹ — ضرب‌المثل‌ها: ستون B، بخش ب (ص۲۶۴)",
    "level": "استاندارد", "count": 4,
    "questions": [q_mcq(f"g12-fin99k-prvb{i}", i, PRVB_STEMS[i], PRVB_OPTIONS, K_PRVB[i], "fghij") for i in K_PRVB],
}

# ================================================================ S16 — مرتب‌کردن کلمات: ۴ تایپی از دو آیتمِ انتخابی a/b (ص۲۶۵، آیتم ۵۹-۶۰؛ کلید ص۲۶۷)
WO = {
    1: ("more free time / Mina / would / had / help / you / if / she / with your homework /.",
        ["Mina would help you with your homework if she had more free time."]),   # ۵۹ الف
    2: ("was / because / he / my mother / hadn’t / angry / my brother / washed / with / his hands /.",
        ["My mother was angry with my brother because he hadn`t washed his hands."]),  # ۵۹ ب
    3: ("bought / the students / which / their teacher / some / useful / suggested / books /.",
        ["The students bought some useful books which their teacher suggested."]),     # ۶۰ الف
    4: ("cold weather / into / converted / water / in / ice / be / can / ?",
        ["Can water be converted into ice in cold weather?"]),                         # ۶۰ ب — پرسشی
}
LESSON_WO = {
    "lesson": 119, "title": "نهایی خرداد ۹۹ — مرتب‌کردن کلمات: هر دو بخش الف/ب (ص۲۶۵)",
    "level": "آموزشی — ورود آزاد", "count": 4,
    "questions": [q_typed(f"g12-fin99k-wo{i}", i, WO[i][0], [WO[i][1][0]], WO[i][1],
                          "write the full sentence in the correct order…") for i in WO],
}

NEW_LESSONS = [LESSON_L1, LESSON_L2, LESSON_L3, LESSON_PIC, LESSON_VOCBANK, LESSON_OK,
               LESSON_G, LESSON_VF, LESSON_R1, LESSON_R2, LESSON_CONN, LESSON_CONT,
               LESSON_DEFB, LESSON_PRVB, LESSON_WO]

# ================================================================ داوری دوم — معناییِ مستقل
EXPECTED = {
    "l1tf": {1: "b", 2: "b"},
    "l1typed": {3: "she had the money.", 4: "Because it is so slow."},
    "l2mcq": {1: "c", 2: "c"},
    "l2tf": {3: "a", 4: "b"},
    "l2typed": {5: "No, he doesn`t like it.", 6: "No, he doesn`t appreciate the woman`s job."},
    "l3tf": {1: "b", 2: "a"},
    "l3typed": {3: "creative", 4: "respect each other`s abilities.",
                5: "He didn`t enjoy working in a team environment a year ago."},
    "pic": {1: "d", 2: "e", 3: "b", 4: "a"},
    "vocbank": {1: "honored", 2: "overcome", 3: "suppose"},
    "ok": {1: "intermediate", 2: "replace", 3: "guide"},
    "g": {1: "c", 2: "b", 3: "d", 4: "b"},
    "vf": {1: "have been invited", 2: "was said", 3: "decides", 4: "might choose"},
    "r1mcq": {1: "b", 2: "a"},
    "r1tf": {3: "b", 4: "a"},
    "r1typed": {5: "English is easier for French people to learn because it is very similar to French.",
                6: "Because they already use Chinese letters in their own language."},
    "r2mcq": {1: "b", 2: "c"},
    "r2tf": {3: "b", 4: "a"},
    "r2typed45": ["It is produced from streams and rivers.", "It is produced from oceans.",
                  "It is produced from water."],
    "r2typed46": "It will keep the environment clean.",
    "conn": {1: "so", 2: "and", 3: "but", 4: "or"},
    "cont": {1: "they should stay at home.", 2: "he has to do his homework."},
    "defb": {1: "b", 2: "e", 3: "a", 4: "c"},
    "prvb": {1: "g", 2: "j", 3: "f", 4: "h"},
    "wo": {1: "Mina would help you with your homework if she had more free time.",
           2: "My mother was angry with my brother because he hadn`t washed his hands.",
           3: "The students bought some useful books which their teacher suggested.",
           4: "Can water be converted into ice in cold weather?"},
}
LET = "abcde"
got = {
    "l1tf": {i: L1_TF[i][1] for i in L1_TF},
    "l1typed": {i: L1_TYPED[i][1][0] for i in L1_TYPED},
    "l2mcq": {i: L2_MCQ[i][2] for i in L2_MCQ},
    "l2tf": {i: L2_TF[i][1] for i in L2_TF},
    "l2typed": {i: L2_TYPED[i][1][0] for i in L2_TYPED},
    "l3tf": {i: L3_TF[i][1] for i in L3_TF},
    "l3typed": {i: L3_TYPED[i][1][0] for i in L3_TYPED},
    "pic": K_PIC,
    "vocbank": K_VOCBANK,
    "ok": {i: OK_STEMS[i][1][0] for i in OK_STEMS},
    "g": K_G,
    "vf": {i: VF_STEMS[i][1][0] for i in VF_STEMS},
    "r1mcq": {i: R1_MCQ[i][2] for i in R1_MCQ},
    "r1tf": {i: R1_TF[i][1] for i in R1_TF},
    "r1typed": {i: R1_TYPED[i][1][0] for i in R1_TYPED},
    "r2mcq": {i: R2_MCQ[i][2] for i in R2_MCQ},
    "r2tf": {i: R2_TF[i][1] for i in R2_TF},
    "r2typed45": R2_TYPED[5][1],
    "r2typed46": R2_TYPED[6][1][0],
    "conn": K_CONN,
    "cont": {i: CONT_TYPED[i][1][0] for i in CONT_TYPED},
    "defb": K_DEFB,
    "prvb": K_PRVB,
    "wo": {i: WO[i][1][0] for i in WO},
}
for fam in EXPECTED:
    require(got[fam] == EXPECTED[fam], f"داوری دوم ناهمسان در {fam}: {got[fam]}")
# کلیدهای چندواریانتهٔ چاپی
require(VF_STEMS[4][1] == ["might choose", "would choose", "could choose"], "کلید سه‌واریانتهٔ ۳۴ ناهمسان")
require(R2_TYPED[5][1] == ["It is produced from streams and rivers.", "It is produced from oceans.",
                           "It is produced from water."], "کلید چندمنبعیِ ۴۵ ناهمسان")
# داوریِ سوم — معنایی
require(PIC_OPTIONS[3].startswith("Wind tower") and K_PIC[1] == "d", "تصویر ۱۶ باید برج بادی باشد")
require(DEFB_OPTIONS[1] == "lack of success in doing something" and K_DEFB[1] == "b", "۵۵الف: failures ← b")
require(PRVB_OPTIONS[4].endswith("better idea.") and K_PRVB[2] == "j", "۵۶ب: Two heads ← j")
require(WO[4][1][0].endswith("?"), "۶۰ب باید پرسشی باشد")

# ================================================================ راستی‌آزمایی حضورِ OCR — بدنه
# سربرگ‌های چاپی
for h in ["نوبت خرداد ماه سال1399", "05", "99", "Listening", "Grammar", "Writing", "Reading",
          "True / False", "Good luck", "Audio file (MP3)", "Audio script (PDF)"]:
    require(ocr_has(h), f"OCR سربرگ نیافت: {h}")
require(ocr_has("Vocabula"), "OCR سربرگ Vocabulary (بریدهٔ چاپ «Vocabula/ry») نیافت")
# شنیداری فایل ۱
for i, (stem, key) in L1_TF.items():
    require(ocr_has(stem), f"OCR ساقهٔ L1TF-{i} نیافت")
require(ocr_has("1. False ( b)"), "OCR کلید ۱ نیافت")
require(ocr_has("2. False ( b)"), "OCR کلید ۲ نیافت")
for i, (stem, acc) in L1_TYPED.items():
    require(ocr_has_stem(stem), f"OCR ساقهٔ L1T-{i} نیافت")
require(ocr_has("3. she had the  money."), "OCR کلید ۳ نیافت")
require(ocr_has("4. Because it is so  slow."), "OCR کلید ۴ نیافت")
# شنیداری فایل ۲
for i, (stem, opts, key) in L2_MCQ.items():
    require(ocr_has(stem), f"OCR ساقهٔ L2M-{i} نیافت")
    for o in opts:
        require(ocr_has(o), f"OCR گزینهٔ L2M-{i} نیافت: {o}")
for i, (stem, key) in L2_TF.items():
    require(ocr_has(stem), f"OCR ساقهٔ L2T-{i} نیافت")
require(ocr_has("5. (c)"), "OCR کلید ۵ نیافت")
require(ocr_has("6. (c)"), "OCR کلید ۶ نیافت")
require(ocr_has("7. True (a)"), "OCR کلید ۷ نیافت")
require(ocr_has("8. False (b)"), "OCR کلید ۸ نیافت")
for i, (stem, acc) in L2_TYPED.items():
    require(ocr_has(stem), f"OCR ساقهٔ L2W-{i} نیافت")
require(ocr_has("9. No,  he doesn`t like it."), "OCR کلید ۹ نیافت")
# کلید ۱۰ — آشفتهٔ OCR: بازمونتاژ با لنگرهای چندگانه (رسید)
for anchor in ["he doesn", "t appreciate the woman", "s job", "No"]:
    require(ocr_has(anchor), f"OCR لنگرِ کلید ۱۰ نیافت: {anchor}")
# شنیداری فایل ۳
for i, (stem, key) in L3_TF.items():
    require(ocr_has(stem), f"OCR ساقهٔ L3T-{i} نیافت")
require(ocr_has("11. False ( b)"), "OCR کلید ۱۱ نیافت")
require(ocr_has("12. True (a)"), "OCR کلید ۱۲ نیافت")
for i, (stem, acc, ph) in L3_TYPED.items():
    require(ocr_has_stem(stem), f"OCR ساقهٔ L3W-{i} نیافت")
require(ocr_has("13. creative"), "OCR کلید ۱۳ نیافت")
require(ocr_has("14.  respect each other`s abilities."), "OCR کلید ۱۴ نیافت")
require(ocr_has("15. He didn`t enjoy working in a team environment a year ago."), "OCR کلید ۱۵ نیافت")
# واژگان با تصویر
for o in PIC_OPTIONS:
    require(ocr_has(o), f"OCR گزینهٔ تصویری نیافت: {o[:40]}")
require(ocr_has("16. ( d )"), "OCR کلید ۱۶ نیافت")
require(ocr_has("17. ( e )"), "OCR کلید ۱۷ نیافت")
require(ocr_has("18. ( b )"), "OCR کلید ۱۸ نیافت")
require(ocr_has("19. ( a )"), "OCR کلید ۱۹ نیافت")
require(ocr_has("با توجه به تصاویر داده شده"), "OCR سربرگِ تصویری نیافت (NFKC)")
# بانک واژگان
require(ocr_has("suppose, honored, demand, overcome"), "OCR بانکِ ۴واژه‌ای نیافت")
for i, stem in VOCBANK_STEMS.items():
    require(ocr_has_stem(stem), f"OCR ساقهٔ VOCBANK-{i} نیافت")
require(ocr_has("20. honored"), "OCR کلید ۲۰ نیافت")
require(ocr_has("21. overcome"), "OCR کلید ۲۱ نیافت")
require(ocr_has("22. suppose"), "OCR کلید ۲۲ نیافت")
# دانش واژگانی — حرف‌نخست‌دار
for i, (stem, acc, ph) in OK_STEMS.items():
    require(ocr_has_stem(stem), f"OCR ساقهٔ OK-{i} نیافت")
require(ocr_has("23. intermediate"), "OCR کلید ۲۳ نیافت")
require(ocr_has("24. replace"), "OCR کلید ۲۴ نیافت")
require(ocr_has("25. guide"), "OCR کلید ۲۵ نیافت")
# گرامر
for i, stem in G_STEMS.items():
    require(ocr_has_stem(stem), f"OCR ساقهٔ G-{i} نیافت")
for i, opts in G_OPTIONS.items():
    for o in opts:
        require(ocr_has(o), f"OCR گزینهٔ G-{i} نیافت: {o}")
require(ocr_has("26. ( c )"), "OCR کلید ۲۶ نیافت")
require(ocr_has("27. ( b )"), "OCR کلید ۲۷ نیافت")
require(ocr_has("28. ( d )"), "OCR کلید ۲۸ نیافت")
require(ocr_has("29. ( b)"), "OCR کلید ۲۹ نیافت")
# آیتم ۳۰ — غیبتِ صادقانه (کلیدِ بازِ راهنما بدونِ نمونهٔ چاپی)
require(ocr_has("A pigeon is a bird"), "OCR بدنهٔ ۳۰ نیافت")
require(ocr_has("whom, who"), "OCR سربرگِ موصولِ ۳۰ نیافت")
# شکل فعل در مکالمه
for i, (stem, acc) in VF_STEMS.items():
    require(ocr_has_stem(stem), f"OCR ساقهٔ VF-{i} نیافت")
require(ocr_has("31. have been invited"), "OCR کلید ۳۱ نیافت")
require(ocr_has("32. was said"), "OCR کلید ۳۲ نیافت")
require(ocr_has("33. decides"), "OCR کلید ۳۳ نیافت")
require(ocr_has("34. might/would /could choose"), "OCR کلید ۳۴ (سه‌واریانتهٔ چاپ) نیافت")
# ریدینگ زبان‌ها
require(ocr_has("There are many languages in the world"), "OCR بدنهٔ ریدینگ ۱ نیافت")
require(ocr_has("first Language can affect learning a second language."), "OCR بدنهٔ ریدینگ ۱ (جملهٔ محوری) نیافت")
require(ocr_has("Teachers and the conditions in which the language is learned"), "OCR بدنهٔ ریدینگ ۱ (بند ۳) نیافت")
for i, (stem, opts, key) in R1_MCQ.items():
    require(ocr_has(stem), f"OCR ساقهٔ R1M-{i} نیافت")
    for o in opts:
        require(ocr_has(o), f"OCR گزینهٔ R1M-{i} نیافت: {o}")
for i, (stem, key) in R1_TF.items():
    require(ocr_has(stem), f"OCR ساقهٔ R1T-{i} نیافت")
require(ocr_has("35. (b)"), "OCR کلید ۳۵ نیافت")
require(ocr_has("36. (a)"), "OCR کلید ۳۶ نیافت")
require(ocr_has("37. ( b) False"), "OCR کلید ۳۷ نیافت")
require(ocr_has("38. (a) True"), "OCR کلید ۳۸ نیافت")
for i, (stem, acc) in R1_TYPED.items():
    require(ocr_has(stem), f"OCR ساقهٔ R1W-{i} نیافت")
require(ocr_has("39. English is easier for French people to learn  because it is very similar to French"),
        "OCR کلید ۳۹ نیافت")
require(ocr_has("40. Because they already use Chinese letters in their own language."), "OCR کلید ۴۰ نیافت")
# ریدینگ انرژی
require(ocr_has("The research for new sources of energy has led into various ways."), "OCR بدنهٔ ریدینگ ۲ نیافت")
require(ocr_has("electricity has been produced with giant wind turbines."), "OCR بدنهٔ ریدینگ ۲ (توربین) نیافت")
require(ocr_has("Geothermal power or the heat from the earth is also being tested to produce energy."), "OCR بدنهٔ ریدینگ ۲ (زمین‌گرمایی) نیافت")
require(ocr_has("Not only changing unwanted products to gas or oil is a cheap way to produce energy"), "OCR بدنهٔ ریدینگ ۲ (cheap way) نیافت")
require(ocr_has("hydroelectric power provided one-third of the electricity"), "OCR بدنهٔ ریدینگ ۲ (برق‌آبی) نیافت")
require(ocr_has("The oceans are another possible source of energy."), "OCR بدنهٔ ریدینگ ۲ (اقیانوس) نیافت")
require(ocr_has("Clean energy resources are vastly respected"), "OCR بدنهٔ ریدینگ ۲ (پاک) نیافت")
for i, (stem, opts, key) in R2_MCQ.items():
    require(ocr_has(stem), f"OCR ساقهٔ R2M-{i} نیافت")
    for o in opts:
        require(ocr_has(o), f"OCR گزینهٔ R2M-{i} نیافت: {o}")
for i, (stem, key) in R2_TF.items():
    require(ocr_has(stem), f"OCR ساقهٔ R2T-{i} نیافت")
require(ocr_has("41. ( b )"), "OCR کلید ۴۱ نیافت")
require(ocr_has("42. (c)"), "OCR کلید ۴۲ نیافت")
require(ocr_has("43. (b) False"), "OCR کلید ۴۳ نیافت")
require(ocr_has("44. (a) True"), "OCR کلید ۴۴ نیافت")
for i, (stem, acc) in R2_TYPED.items():
    require(ocr_has(stem), f"OCR ساقهٔ R2W-{i} نیافت")
require(ocr_has("45. It is produced from streams and rivers/oceans/water."), "OCR کلید ۴۵ (چندمنبعیِ چاپ) نیافت")
require(ocr_has("It will keep the environment clean."), "OCR کلید ۴۶ نیافت")
# کلمات ربط — پاراگرافِ معلمان
require(ocr_has("Teachers work hard every day to make sure you have learnt your lessons"), "OCR بدنهٔ ربط نیافت")
require(ocr_has("they deserve your respect."), "OCR دنبالهٔ ۴۷ نیافت")
require(ocr_has("You should know their values"), "OCR بدنهٔ ۴۸ نیافت")
require(ocr_has("grateful to them for their help."), "OCR دنبالهٔ ۴۸ نیافت")
require(ocr_has("You may sometimes forget their kindness"), "OCR بدنهٔ ۴۹ نیافت")
require(ocr_has("they shape your lives like your parents."), "OCR دنبالهٔ ۴۹ نیافت")
require(ocr_has("Treat them well when they are still around"), "OCR بدنهٔ ۵۰ نیافت")
require(ocr_has("you will be sorry one day."), "OCR دنبالهٔ ۵۰ نیافت")
require(ocr_has("47.  so"), "OCR کلید ۴۷ نیافت")
require(ocr_has("48.  and"), "OCR کلید ۴۸ نیافت")
require(ocr_has("49.  but"), "OCR کلید ۴۹ نیافت")
require(ocr_has("50. or"), "OCR کلید ۵۰ نیافت")
require(ocr_has("کلمات ربطbut, and, so, or"), "OCR سربرگِ ربط نیافت (NFKC)")
# ادامهٔ جمله
require(ocr_has("Many people are still becoming sick because of the COVID 19, so"), "OCR بدنهٔ ۵۱ نیافت")
require(ocr_has("Jimmy seems very tired, but"), "OCR بدنهٔ ۵۲ نیافت")
require(ocr_has("51. …they should stay at home."), "OCR کلید ۵۱ نیافت")
require(ocr_has("52. ..he has to do his homework."), "OCR کلید ۵۲ نیافت")
# ستون A/B — هر دو بخشِ الف/ب
for s in DEFB_STEMS.values():
    require(ocr_has(s), f"OCR ساقهٔ DEFB نیافت: {s[:36]}")
for o in DEFB_OPTIONS:
    require(ocr_has(o), f"OCR تعریفِ ستون B نیافت: {o[:36]}")
for s in PRVB_STEMS.values():
    require(ocr_has(s), f"OCR ساقهٔ PRVB نیافت: {s[:36]}")
for o in PRVB_OPTIONS:
    require(ocr_has(o), f"OCR معنای ستون B نیافت: {o[:36]}")
require(ocr_has("55. b g 56. e j 57. a f 58. c h"), "OCR بلوکِ ستونیِ کلیدهای ۵۵-۵۸ (الف/ب) نیافت")
require(ocr_has("Our parents have a lot to share with us like their experiences and failures."), "OCR بدنهٔ ۵۵الف نیافت")
# مرتب‌کردن ۵۹-۶۰ — هر دو واریانت
for i, (stem, acc) in WO.items():
    require(ocr_has(stem), f"OCR بهم‌ریختهٔ WO-{i} نیافت")
require(ocr_has("59. (a) Mina would help you with your homework if she had more free time."), "OCR کلید ۵۹الف نیافت")
require(ocr_has("(b) My mother was angry with my brother because he hadn`t washed his hands."), "OCR کلید ۵۹ب نیافت")
require(ocr_has("60. (a) The students bought some useful books which their teacher suggested."), "OCR کلید ۶۰الف نیافت")
require(ocr_has("(b) Can water be converted into ice in cold weather?"), "OCR کلید ۶۰ب نیافت")
# غیبت‌های صادقانه — بخش ۱۷ (انتخابی ج/د)
require(ocr_has("Mohammad Hossein Fahmideh"), "OCR سربرگِ فهمیده نیافت")
require(ocr_has("Birth: May 6, 1967, Qom"), "OCR دادهٔ چاپیِ فهمیده نیافت")
require(ocr_has("Tahereh"), "OCR عنوانِ سافارزاده نیافت")
require(ocr_has("Perspolis (Takht- e-"), "OCR عنوانِ پرسپولیس نیافت")
require(ocr_has("Damavand"), "OCR عنوانِ دماوند نیافت")
require(ocr_has("topic sentence"), "OCR سربرگِ topic sentenceِ ۵۳-۵۴ نیافت")

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
require(next_lesson == 105, f"شمارهٔ درسِ بعدی {next_lesson} است نه ۱۰۵")
for l in NEW_LESSONS:
    if l["lesson"] != next_lesson:
        print(f"FAIL — ترتیب درس: انتظار {next_lesson}، یافت {l['lesson']}")
        sys.exit(1)
    if l["count"] != len(l["questions"]):
        print(f"FAIL — شمارِ درس {l['lesson']} ناهمسان")
        sys.exit(1)
    data["lessons"].append(l)
    next_lesson += 1

data["source"]["final99k"] = {
    "pages": "259-265",
    "keyPages": "266-267",
    "titlePrinted": "آزمون نهایی انگلیسی دوازدهم — نوبت خرداد ماه سال ۱۳۹۹ (تاریخ امتحان 05/04/99، ساعت ۸ صبح، مدت ۱۲۰ دقیقه، ۷ صفحه، دانش‌آموزان روزانه سراسر کشور — بخش چهارم: آزمون‌های نهایی دی ۹۷ تا شهریور ۱۴۰۱)",
    "sections": 17,
    "banks": 15,
    "questions": 63,
    "keys": 63,
    "extractedRound": 296,
    "openWritingAbsent": {
        "section": "8 (موصولِ باز ۳۰ «A pigeon is a bird…») + 14 (topic sentenceِ ۵۳ Reading / ۵۴ Nature) + 17 (انتخابیِ ج: topic sentenceِ تصویری Water/Damavand/Perspolis/Tahereh Saffarzadeh — د: پاراگرافِ بازِ شهید فهمیده)", "items": 8,
        "note": "کلیدِ راهنما فقط معیار است نه نمونهٔ چاپی: ۳۰ «باید which را به همراه یک عبارت دارای فعل بنویسد»؛ ۵۳/۵۴ «با توجه به رعایت Topic Sentence نمره لحاظ گردد (هر جمله 0/5)»؛ بخش ۱۷ «با توجه به رعایت Topic Sentence (هر جمله ۱) یا اصول پاراگراف‌نویسی (۴ نمره)» — بانک صادقانه ساخته نشد؛ داده‌های چاپیِ فهمیده (Birth: May 6, 1967, Qom / Death: Martyred October 30, 1980, Khorramshahr / Job: Student / War: Iran–Iraq War) در رسید محفوظ است",
    },
    "receipts": [
        {"item": "1-4", "field": "section", "printed": "شنیداریِ فایل ۱ با ساقهٔ چاپیِ کامل برای هر چهار آیتم",
         "note": "نخستین نوبتِ نهایی که ساقه‌های شنیداریِ ۱-۴ همگی چاپی‌اند (الگوی r293-r295 ادامه دارد) — کلیدهای ۳/۴ کوچک‌نویسِ چاپیِ راهنما وفادار («she had the  money.» با فاصلهٔ دوگانهٔ چاپ)"},
        {"item": "10", "field": "accepted", "printed": "کلیدِ آشفتهٔ OCR: «No, he doesn`t like it. / .s job / `t appreciate the woman / `he doesn, / No / .10»",
         "note": "بازمونتاژِ سطربه‌سطر: «No, he doesn`t appreciate the woman`s job.» با لنگرهای چندگانه (he doesn + t appreciate the woman + s job) — الگوی r294 آیتم ۴۹"},
        {"item": "13", "field": "accepted", "printed": "«13. creative» با تورمِ راهنما: «هر کلمه‌ای هم که به نوعی به پاسخ اشاره کند صحیح است»",
         "note": "کلیدِ چاپیِ حاکم (creative) قفل شد؛ حرمتِ راهنما در رسید — گاردِ اپ تک‌کلیدی است"},
        {"item": "16-19", "field": "section", "printed": "«با توجه به تصاویر داده شده… (یک جمله اضافی است)» — پنج جملهٔ چاپیِ a-e",
         "note": "تصویرِ گمشده با ساقه/کلیدِ کامل جبران شد (الگوی r293/r294) — کلیدهای حرفیِ راهنما d/e/b/a؛ c اضافهٔ چاپی؛ جملهٔ b با بک‌تیکِ چاپیِ «sun`s rays» وفادار"},
        {"item": "20-22", "field": "key", "printed": "honored/overcome/suppose — demand اضافهٔ چاپی",
         "note": "بانکِ ۴واژه‌ایِ چاپ با ترتیبِ عینِ چاپ «suppose, honored, demand, overcome»"},
        {"item": "23-25", "field": "stem", "printed": "حرفِ نخستِ چاپیِ درونِ ساقه (i - - - / r - - - - / g - - -)",
         "note": "حاملِ حرف در ساقه حفظ شد + placeholderِ «start with the printed first letter…» — الگوی دانش‌خودیِ r294"},
        {"item": "26-29", "field": "options", "printed": "چاپِ طبیعی a-d (نخستین نوبتِ نهایی بدونِ چاپِ وارونه از r290)",
         "note": "کلیدهای حرفیِ راهنما (c)(b)(d)(b) عین چاپ؛ «the corps» غلطِ چاپیِ بدنهٔ ۲۷ وفادار (crops)؛ فاصله‌های چاپیِ «isn’t  she» و «could  save» وفادار"},
        {"item": "34", "field": "accepted", "printed": "«might/would /could choose» — کلیدِ سه‌واریانتهٔ چاپ",
         "note": "دومین کلیدِ سه‌واریانتهٔ خانواده (الگوی r294 آیتم ۳۰) — accepted آرایه‌ایِ سه‌تایی؛ موتورِ accepted.some آماده بود"},
        {"item": "39", "field": "accepted", "printed": "«English is easier… because it is very similar to French» با نشان‌های (0/5)(0/5)",
         "note": "کلیدِ جمله‌کاملِ راهنما — دو نیمهٔ بارم‌دار در یک پاسخِ کامل"},
        {"item": "43", "field": "answer", "printed": "False کلید چاپی — تنش با بدنهٔ ریدینگ («a cheap way»)",
         "note": "ساقه می‌گوید expensive؛ متنِ چاپی می‌گوید cheap — تنشِ معنایی با کلیدِ چاپی حاکم (الگوی r289 «Not all»)"},
        {"item": "45", "field": "accepted", "printed": "«It is produced from streams and rivers/oceans/water.»",
         "note": "نخستین کلیدِ چندمنبعیِ بازمونتاژشده: سه واریانتِ جمله‌کامل از اسلش‌های راهنما — الگوی r295 آیتم ۳۸"},
        {"item": "46", "field": "answer", "printed": "شمارهٔ چاپیِ کلید در OCR «٦٤.» است (لغزشِ چاپ برای ۴۶)",
         "note": "کلیدِ جمله‌کاملِ چاپی حاکم؛ لغزشِ شماره‌گذاری در رسید"},
        {"item": "47-50", "field": "section", "printed": "پاراگرافِ پیوستهٔ «Teachers» با چهار خالیِ ربط",
         "note": "هر آیتم با جملهٔ زمینهٔ خودش ساقه شد — استخرِ چاپیِ بستهٔ (but, and, so, or)؛ کلیدهای so/and/but/or عین چاپ"},
        {"item": "55-58", "field": "section", "printed": "«در این قسمت فقط به یکی از بخش‌های (الف) یا (ب) به اختیار پاسخ دهید»",
         "note": "نخستین استخراجِ موازیِ هر دو شاخهٔ انتخابیِ آزمون: ۱۱۷ (تعریف‌ها: b/e/a/c — d اضافه) و ۱۱۸ (ضرب‌المثل‌ها: g/j/f/h — i اضافه) به‌عنوانِ دو بانک مستقل"},
        {"item": "57(ب)", "field": "stem", "printed": "«Action speak louder than words» غلطِ چاپیِ بدنه وفادار",
         "note": "همچنین «they come up with better idea» غلطِ چاپیِ گزینهٔ j وفادار"},
        {"item": "59-60", "field": "section", "printed": "«به دلخواه فقط یکی از بخش‌های (a) یا (b)…» — چهار بهم‌ریختهٔ چاپی",
         "note": "نخستین مرتب‌کردنِ چهارواریانته از دو آیتمِ انتخابی: ۵۹الف/۵۹ب/۶۰الف/۶۰ب — کلیدهای کامل با نشان‌های بارمِ (0/25)(0/25)(0/5) و (0/75)(0/25)؛ ۶۰ب پرسشی است"},
        {"item": "passages", "field": "—", "printed": "p261-262",
         "note": "متنِ دو ریدینگ درون‌اپ حمل نشد (الگوی r289-r295) — تصویر صفحه در کتابخانهٔ جزوه در دسترس است"},
    ],
}

BANK_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(l["count"] for l in data["lessons"])
print(f"OK — lessons now {len(data['lessons'])}, family total {total} (added 63)")
print("ids:", ", ".join(new_ids[:5]), "…", new_ids[-1])
