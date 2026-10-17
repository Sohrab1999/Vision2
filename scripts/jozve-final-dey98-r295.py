#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r295 — آزمون نهایی دی ۱۳۹۸ (Vision Three بخش چهارم، ص۲۵۱-۲۵۶؛ راهنمای تصحیح ص۲۵۷-۲۵۸)
چهارمین نوبت از دوازده نوبتِ «آزمون‌های نهایی دی ۹۷ تا شهریور ۱۴۰۱».
۱۲ بانک / ۴۶ آیتم از ۱۷ بخش چاپی؛ بخش ۱ (listening ۱-۶ بدونِ متنِ چاپی)، ساقه‌های ۱۰/۱۱،
بخش ۱۴ (جمله‌سازیِ topic برای ۴۴-۴۶ — پاسخِ باز با داوریِ اصولی)، بخش ۱۵ (پاراگرافِ بازِ ابوعلی‌سینا ۴۷) غیبتِ صادقانه — کلیدها/موضوع‌ها در رسید.
نوهای راند: نخستین کلوزِ حروف‌محورِ شش‌جمله‌ای (۴۳ «c/e/f/a/b/d» با گزینه‌های حرف‌دارِ چاپی a-f)؛
نخستین «پیدا کنید کدام با بقیه هماهنگی ندارد» (۲۵-۲۸)؛
نخستین کلیدِ دودوییِ گزینشیِ راهنما برای شنیداریِ تایپی (۹ «She lives in another neighborhood.») —
و بازسازیِ تکه‌به‌تکهٔ کلیدِ آشفتهٔ OCR (۵۰) با نشان‌های نمرهٔ چاپی (0/25)/(0/75).
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

# ================================================================ S2 — شنیداریِ متن‌چاپ: ۲ MCQ + ۱ تایپی (ص۲۵۱، آیتم ۷-۹؛ کلید ص۲۵۷)
LIS_MCQ = {
    1: ("Zohreh was upset because she couldn’t invite --------------- to her birthday.",
        ["Mina’s mother", "her close friend", "Maryam’s sister"], "b"),  # ۷
    2: ("Who isn’t available till next Wednesday?",
        ["Mina’s mother", "Zoheh’s mother", "Maryam’s sister"], "c"),     # ۸ — املای چاپیِ بدنه «Zoheh» وفادار
}
LIS_TYPED = {1: "Where does Mina live?"}  # ۹ — ساقهٔ چاپی؛ کلیدِ جمله‌کاملِ راهنما
K_LIS_TYPED = {1: "She lives in another neighborhood."}
LESSON_LIS = {
    "lesson": 93, "title": "نهایی دی ۹۸ — شنیداری: سوال‌های متن‌چاپ (ص۲۵۱)",
    "level": "استاندارد", "count": 3,
    "questions": [
        *[q_mcq(f"g12-fin98d-lis{i}", i, LIS_MCQ[i][0], LIS_MCQ[i][1], LIS_MCQ[i][2]) for i in LIS_MCQ],
        q_typed("g12-fin98d-lis3", 3, LIS_TYPED[1], [K_LIS_TYPED[1]], [K_LIS_TYPED[1]],
                "answer in a complete sentence…"),
    ],
}

# ================================================================ S5 — واژگان با تصویر: ۲ تایپی (ص۲۵۲، آیتم ۱۵-۱۶؛ کلید ص۲۵۷)
VOCPIC = {
    1: ("He is sitting in the b——————— and drinking tea.",
        ["balcony"], "start with the printed first letter b…"),    # ۱۵ — کلیدِ راهنما balcony
    2: ("My brother always uses a m——————— dictionary.",
        ["monolingual"], "start with the printed first letter m…"),  # ۱۶ — کلیدِ راهنما monolingual
}
LESSON_VOCPIC = {
    "lesson": 94, "title": "نهایی دی ۹۸ — واژگان با تصویر: کامل کنید، بنویسید (ص۲۵۲)",
    "level": "آموزشی — ورود آزاد", "count": 2,
    "questions": [q_typed(f"g12-fin98d-vocpic{i}", i, VOCPIC[i][0], VOCPIC[i][1], VOCPIC[i][1],
                          VOCPIC[i][2]) for i in VOCPIC],
}

# ================================================================ S6 — تعریف‌ها: ۵ گزینهٔ چاپی (ص۲۵۲، آیتم ۱۷-۲۰؛ کلید ص۲۵۷)
DEF_OPTIONS = ["a book in which you record",              # a — تعریفِ چاپیِ خط‌بریده (الگوی r291)
               "help somebody remember something",        # b
               "in a quiet way",                          # c
               "the rise and fall of the sea",            # d
               "to find a solution or arrive at an answer to"]  # e — عیناً چاپ
DEF_HEADS = {
    1: "calmly",       # ۱۷
    2: "tide",         # ۱۸
    3: "figure out",   # ۱۹
    4: "remind",       # ۲۰
}
K_DEF = {1: "c", 2: "d", 3: "e", 4: "b"}  # a اضافهٔ چاپی
LESSON_DEF = {
    "lesson": 95, "title": "نهایی دی ۹۸ — واژگان: تعریف‌ها، ۵ گزینهٔ چاپی (ص۲۵۲)",
    "level": "استاندارد", "count": 4,
    "questions": [q_mcq(f"g12-fin98d-def{i}", i, DEF_HEADS[i], DEF_OPTIONS, K_DEF[i]) for i in range(1, 5)],
}

# ================================================================ S7 — بانک واژگان: ۴ تایپی (ص۲۵۲، آیتم ۲۱-۲۴؛ کلید ص۲۵۷)
BANK_PRINTED = ["shared", "cooling", "radiation", "effectively", "replaced"]  # radiation اضافهٔ چاپی
BANK_STEMS = {
    1: "He played his role very ---------------.",                       # ۲۱
    2: "My sister --------------- her food among the poor children.",    # ۲۲
    3: "My mother carefully --------------- the China plate on the shelf.",  # ۲۳
    4: "Wind towers are natural air --------------- systems and can be used instead of electrical air conditioners.",  # ۲۴
}
K_BANK = {1: "effectively", 2: "shared", 3: "replaced", 4: "cooling"}
LESSON_BANK = {
    "lesson": 96, "title": "نهایی دی ۹۸ — واژگان: جای خالی از بانک، بنویسید (ص۲۵۲)",
    "level": "آموزشی — ورود آزاد", "count": 4,
    "questions": [q_typed(f"g12-fin98d-bank{i}", i, BANK_STEMS[i], BANK_PRINTED, [K_BANK[i]],
                          "fill in the blank with the missing word…") for i in BANK_STEMS],
}

# ================================================================ S8 — نخستین «پیدا کنید کدام با بقیه هماهنگی ندارد»: ۴ MCQ (ص۲۵۳، آیتم ۲۵-۲۸؛ کلید ص۲۵۷)
ODD = {
    1: (["water", "tree", "coal", "sun"], "c"),          # ۲۵ — منبعِ تجدیدناپذیر در میانِ تجدیدپذیرها
    2: (["pollution", "waste", "garbage", "resource"], "d"),  # ۲۶
    3: (["effective", "useful", "confusing", "helpful"], "c"),  # ۲۷
    4: (["generate", "use up", "absorb", "digest"], "a"),  # ۲۸
}
LESSON_ODD = {
    "lesson": 97, "title": "نهایی دی ۹۸ — واژگان: کدام با بقیه هماهنگی ندارد؟ (ص۲۵۳)",
    "level": "استاندارد", "count": 4,
    "questions": [q_mcq(f"g12-fin98d-odd{i}", i,
                        "Find the word which does not go with the other three.",
                        ODD[i][0], ODD[i][1]) for i in ODD],
}

# ================================================================ S9 — شکل صحیح فعل: ۴ تایپی (ص۲۵۳، آیتم ۲۹-۳۲؛ کلید ص۲۵۷)
VF_STEMS = {
    1: "I think Mina --------------- a new mobile phone, hasn’t she? (to buy)",       # ۲۹
    2: "Three people --------------- in the car accident last week. (to kill)",       # ۳۰
    3: "Before my brother moved to China, he --------------- Chinese. (to learn)",    # ۳۱
    4: "The letter must --------------- to the company immediately. (to send)",       # ۳۲
}
VF_ACCEPTED = {
    1: ["has bought"],
    2: ["were killed"],
    3: ["had learned", "had learnt"],   # کلیدِ دودوییِ چاپ «had learned /learnt»
    4: ["be sent"],
}
LESSON_VF = {
    "lesson": 98, "title": "نهایی دی ۹۸ — شکل صحیح فعل، بنویسید (ص۲۵۳)",
    "level": "آموزشی — ورود آزاد", "count": 4,
    "questions": [q_typed(f"g12-fin98d-vf{i}", i, VF_STEMS[i], [VF_ACCEPTED[i][0]], VF_ACCEPTED[i],
                          "write the correct form of the verb…") for i in VF_STEMS],
}

# ================================================================ S10 — گرامر: ۴ MCQ با چاپِ وارونهٔ d,c,b,a (ص۲۵۳، آیتم ۳۳-۳۶؛ کلید ص۲۵۷)
G_REVERSED = {
    1: ["would meet", "had met", "have meet", "meet"],       # ۳۳ — چاپ d,c,b,a؛ «have meet» غلطِ چاپیِ بدنه وفادار
    2: ["had", "may", "will", "would"],                      # ۳۴ — چاپ d,c,b,a
    3: ["whom", "which", "who", "whose"],                    # ۳۵ — چاپ d,c,b,a
    4: ["is collected", "collected", "collect", "should collect"],  # ۳۶ — چاپ d,c,b,a
}
G_NATURAL = {i: list(reversed(G_REVERSED[i])) for i in G_REVERSED}
G_STEMS = {
    1: "I was sure I --------------- him before.",
    2: "What --------------- you do if you were my father?",
    3: "The book --------------- you want isn’t available now.",
    4: "A: When do they collect the waste every night? B: The waste --------------- about at 9.",
}
K_G = {1: "c", 2: "a", 3: "c", 4: "d"}  # کلیدهای حرفیِ راهنما (c)(a)(c)(d) عین چاپ
LESSON_G = {
    "lesson": 99, "title": "نهایی دی ۹۸ — گرامر: تست چهارگزینه‌ای (ص۲۵۳)",
    "level": "استاندارد", "count": 4,
    "questions": [q_mcq(f"g12-fin98d-g{i}", i, G_STEMS[i], G_NATURAL[i], K_G[i]) for i in range(1, 5)],
}

# ================================================================ S11 — مرتب‌کردن کلمات: ۲ تایپی (ص۲۵۳، آیتم ۳۷-۳۸؛ کلید ص۲۵۷)
WO = {
    1: ("went/ my brother/ to the library/ at all/ he/ didn’t/ but/ study.",
        ["My brother went to the library, but he didn’t study at all."]),  # کلیدِ چاپی با نشان (0/5)(0/5)
    2: ("watching/ bought/ her father/ is/ the DVD/ has/ she/ that/.",
        ["She is watching the DVD that her father has bought.",
         "Her father is watching the DVD that she has bought."]),  # دو واریانتِ چاپیِ راهنما «her father/ She»
}
LESSON_WO = {
    "lesson": 100, "title": "نهایی دی ۹۸ — مرتب‌کردن کلمات، بنویسید (ص۲۵۳)",
    "level": "آموزشی — ورود آزاد", "count": 2,
    "questions": [q_typed(f"g12-fin98d-wo{i}", i, WO[i][0], [WO[i][1][0]], WO[i][1],
                          "write the full sentence in the correct order…") for i in WO],
}

# ================================================================ S12 — کلمات ربط: ۴ تایپی (ص۲۵۳، آیتم ۳۹-۴۲؛ کلید ص۲۵۸)
CONN_STEMS = {
    1: "He can buy the dictionary, --------------- he can borrow it from the library.",  # ۳۹
    2: "There was no bread at home, --------------- my mother went out to buy some.",    # ۴۰
    3: "My sister loves apples, --------------- she hates bananas.",                     # ۴۱
    4: "Ali bought a new coat, --------------- he wore it for two years .",              # ۴۲ — فاصلهٔ چاپی پیش از نقطه وفادار
}
K_CONN = {1: "or", 2: "so", 3: "but", 4: "and"}  # استخرِ چاپی {and, or, but, so}
CONNECTIVES = ["and", "or", "but", "so"]
LESSON_CONN = {
    "lesson": 101, "title": "نهایی دی ۹۸ — کلمات ربط، کامل کنید (ص۲۵۳)",
    "level": "آموزشی — ورود آزاد", "count": 4,
    "questions": [q_typed(f"g12-fin98d-conn{i}", i, CONN_STEMS[i], CONNECTIVES, [K_CONN[i]],
                          "connect the sentences with and, or, but, so…") for i in CONN_STEMS],
}

# ================================================================ S13 — نخستین کلوزِ حروف‌محورِ شش‌جمله‌ای: ۱ MCQ (ص۲۵۴، آیتم ۴۳؛ کلید ص۲۵۸)
TREE_SENTS = ["They also cause rain.",                            # a
              "The rain makes the air fresh and clean.",           # b
              "Trees are very valuable.",                          # c
              "Thus, trees play a big and important role in our life.",  # d
              "They supply us with many necessary things of everyday life.",  # e
              "For example, they take carbon dioxide from the atmosphere and fill it with oxygen."]  # f — عیناً چاپ
K_TREE = "c/e/f/a/b/d"  # کلیدِ چاپیِ راهنما «( c / e  / f / a  / b / d )»
TREE_OPTIONS = ["c / e / f / a / b / d", "c / f / e / a / b / d",
                "c / e / f / a / d / b", "e / c / f / a / b / d"]  # ترتیبِ درست نخستین گزینه — بقیه آشفتگی‌های منطقی
LESSON_TREE = {
    "lesson": 102, "title": "نهایی دی ۹۸ — مرتب‌کردن پاراگراف درخت‌ها: کلوزِ حروف‌محور (ص۲۵۴)",
    "level": "استاندارد", "count": 1,
    "questions": [q_mcq("g12-fin98d-tree1", 1,
                        "Order the six mixed-up sentences into a meaningful paragraph and write the correct letter order.",
                        TREE_OPTIONS, "a")],
}

# ================================================================ S16 — ریدینگ خودروی الکتریکی: ۲ تایپی + ۲ درست/نادرست (ص۲۵۵، آیتم ۴۸-۵۲؛ کلید ص۲۵۸)
RD1_TYPED = {
    1: ("Why don’t electric cars make the air dirty and unclean?",
        "They don’t make the air dirty and unclean because they don’t burn gasoline in the engine."),  # ۴۸
    2: ("When is usually the electric car plugged in?",
        "The electric car is usually plugged in at night."),  # ۴۹
}
RD1_MCQ = {
    3: ("Why do people use hybrid cars?",
        ["because hybrid cars combine the benefits of gasoline engines and electric motors",
         "because they are cheaper than electric cars",
         "because they burn more gasoline",
         "because they hold more energy"], "a"),  # ۵۰ — MCQ بازسازی‌شده از کلیدِ جمله‌کاملِ چاپی راهنما
}
RD1_TF = {
    4: ("Electric cars use both fossil fuel and electricity.", "b"),  # ۵۱ False
    5: ("Not all electric cars have batteries.", "b"),                # ۵۲ False
}
LESSON_RD1 = {
    "lesson": 103, "title": "نهایی دی ۹۸ — ریدینگ خودروی الکتریکی: پرسش پاسخ + تست (ص۲۵۵)",
    "level": "استاندارد", "count": 5,
    "questions": [
        *[q_typed(f"g12-fin98d-rd1-{i}", i, RD1_TYPED[i][0], [RD1_TYPED[i][1]], [RD1_TYPED[i][1]],
                  "answer in a complete sentence…") for i in RD1_TYPED],
        *[q_mcq(f"g12-fin98d-rd1-{i}", i, RD1_MCQ[i][0], RD1_MCQ[i][1], RD1_MCQ[i][2]) for i in RD1_MCQ],
        *[q_mcq(f"g12-fin98d-rd1-{i}", i, RD1_TF[i][0], ["True", "False"], RD1_TF[i][1], "ab") for i in RD1_TF],
    ],
}

# ================================================================ S17 — ریدینگ گوش‌ها: ۴ MCQ (ص۲۵۶، آیتم ۵۳-۵۶؛ کلید ص۲۵۸)
RD2_MCQ = {
    1: ("When we grow up, _____.",
        ["our ears will not change in size", "our ears will be the same size.",
         "our ears will get colder", "our ears will not change in shape."], "d"),  # ۵۳
    2: ("If someone’s ears are red, it means _____.",
        ["he/she is a kind person", "he/she is very happy",
         "he/she may get angry easily", "he/she drinks a lot"], "c"),  # ۵۴
    3: ("If you look at someone’s ears, the right way is to see _____.",
        ["his face, ears and nose", "the size, color and shape",
         "his mouth, eyes and nose", "the hair, eyes and color"], "b"),  # ۵۵
    4: ("How can we find out a person has a nervous character through his/her ears?",
        ["When they are cold", "When they are medium-size",
         "When they are not white color", "When they are musical"], "a"),  # ۵۶
}
LESSON_RD2 = {
    "lesson": 104, "title": "نهایی دی ۹۸ — ریدینگ گوش‌ها: تست (ص۲۵۶)",
    "level": "استاندارد", "count": 4,
    "questions": [q_mcq(f"g12-fin98d-rd2-{i}", i, RD2_MCQ[i][0], RD2_MCQ[i][1], RD2_MCQ[i][2])
                  for i in RD2_MCQ],
}

NEW_LESSONS = [LESSON_LIS, LESSON_VOCPIC, LESSON_DEF, LESSON_BANK, LESSON_ODD,
               LESSON_VF, LESSON_G, LESSON_WO, LESSON_CONN, LESSON_TREE, LESSON_RD1, LESSON_RD2]

# ================================================================ داوری دوم — معناییِ مستقل
EXPECTED = {
    "lis": {1: "b", 2: "c"},
    "vocpic": {1: "balcony", 2: "monolingual"},
    "def": {1: "c", 2: "d", 3: "e", 4: "b"},
    "bank": {1: "effectively", 2: "shared", 3: "replaced", 4: "cooling"},
    "odd": {1: "c", 2: "d", 3: "c", 4: "a"},
    "vf": {1: "has bought", 2: "were killed", 3: "had learned", 4: "be sent"},
    "g": {1: "c", 2: "a", 3: "c", 4: "d"},
    "wo": {1: "My brother went to the library, but he didn’t study at all.",
           2: "She is watching the DVD that her father has bought."},
    "conn": {1: "or", 2: "so", 3: "but", 4: "and"},
    "tree": "c/e/f/a/b/d",
    "rd1mcq": {3: "a"},
    "rd1tf": {4: "False", 5: "False"},
    "rd2mcq": {1: "d", 2: "c", 3: "b", 4: "a"},
}
got = {
    "lis": {i: LIS_MCQ[i][2] for i in LIS_MCQ},
    "vocpic": {i: VOCPIC[i][1][0] for i in VOCPIC},
    "def": K_DEF, "bank": K_BANK,
    "odd": {i: ODD[i][1] for i in ODD},
    "vf": {i: VF_ACCEPTED[i][0] for i in VF_ACCEPTED},
    "g": K_G, "wo": {i: WO[i][1][0] for i in WO}, "conn": K_CONN,
    "tree": K_TREE,
    "rd1mcq": {i: RD1_MCQ[i][2] for i in RD1_MCQ},
    "rd1tf": {i: ("True" if RD1_TF[i][1] == "a" else "False") for i in RD1_TF},
    "rd2mcq": {i: RD2_MCQ[i][2] for i in RD2_MCQ},
}
for fam in EXPECTED:
    require(got[fam] == EXPECTED[fam], f"داوری دوم ناهمسان در {fam}: {got[fam]}")
# کلیدهای چندواریانته چاپی
require(VF_ACCEPTED[3] == ["had learned", "had learnt"], "کلید دودویی ۳۱ ناهمسان")
require(WO[2][1] == ["She is watching the DVD that her father has bought.",
                     "Her father is watching the DVD that she has bought."], "کلید دودویی ۳۸ ناهمسان")
# راستی‌آزماییِ معناییِ odd-one-out (داوریِ سوم)
require(ODD[1][0][2] == "coal" and ODD[2][0][3] == "resource" and ODD[3][0][2] == "confusing"
        and ODD[4][0][0] == "generate", "جای گزینه‌های odd ناهمسان")

# ================================================================ راستی‌آزمایی حضورِ OCR — بدنه
# شنیداری
for i, (stem, opts, key) in LIS_MCQ.items():
    require(ocr_has_stem(stem), f"OCR ساقهٔ LIS-{i} نیافت")
    for o in opts:
        require(ocr_has(o), f"OCR گزینهٔ LIS-{i} نیافت: {o}")
require(ocr_has("7. b"), "OCR کلید ۷ نیافت")
require(ocr_has("8. c"), "OCR کلید ۸ نیافت")
require(ocr_has("Where does Mina live?"), "OCR ساقهٔ LIS-9 نیافت")
require(ocr_has("9. She lives in another neighborhood."), "OCR کلید ۹ نیافت")
# کلیدهای شنیداریِ بدونِ متن (رسیدِ غیبتِ بخش ۱)
for frag in ["1. do exercise", "2. dishwasher", "3. renewable energy", "4. at the top of each page",
             "5. sun or sunshine", "6. You can carry it everywhere."]:
    require(ocr_has(frag), f"OCR کلید listeningِ نیافت: {frag}")
require(ocr_has("10. He studied in Canada."), "OCR کلید ۱۰ نیافت")
require(ocr_has("11. They are interested in soccer."), "OCR کلید ۱۱ نیافت")
require(ocr_has("or they are crazy about soccer."), "OCR واریانتِ دومِ کلید ۱۱ نیافت")
# واژگان با تصویر
require(ocr_has("He is sitting in the b"), "OCR بدنهٔ ۱۵ نیافت")
require(ocr_has("and drinking tea."), "OCR دنبالهٔ ۱۵ نیافت")
require(ocr_has("My brother always uses a m"), "OCR بدنهٔ ۱۶ نیافت")
require(ocr_has("dictionary."), "OCR دنبالهٔ ۱۶ نیافت")
require(ocr_has("15. balcony"), "OCR کلید ۱۵ نیافت")
require(ocr_has("16. monolingual"), "OCR کلید ۱۶ نیافت")
require(ocr_has("با توجه به تصاویر"), "OCR سربرگِ تصویری نیافت (NFKC)")
# تعریف‌ها
for h in DEF_HEADS.values():
    require(ocr_has(h), f"OCR سرِ تعریف نیافت: {h}")
for o in DEF_OPTIONS:
    require(ocr_has(o), f"OCR گزینهٔ تعریف {o[:30]} نیافت")
require(ocr_has("17.    ( c )"), "OCR کلید ۱۷ نیافت")
require(ocr_has("18. ( d )"), "OCR کلید ۱۸ نیافت")
require(ocr_has("19. (  e  )"), "OCR کلید ۱۹ نیافت")
require(ocr_has("20. ( b  )"), "OCR کلید ۲۰ نیافت")
# بانک واژگان
for w in BANK_PRINTED:
    require(ocr_has(w), f"OCR واژهٔ بانک {w} نیافت")
for i, stem in BANK_STEMS.items():
    require(ocr_has_stem(stem), f"OCR ساقهٔ BANK-{i} نیافت")
require(ocr_has("21.  effectively"), "OCR کلید ۲۱ نیافت")
require(ocr_has("22. shared"), "OCR کلید ۲۲ نیافت")
require(ocr_has("23. replaced"), "OCR کلید ۲۳ نیافت")
require(ocr_has("24. cooling"), "OCR کلید ۲۴ نیافت")
# odd-one-out
require(ocr_has("25. c/ coal"), "OCR کلید ۲۵ نیافت")
require(ocr_has("26. d/ resource"), "OCR کلید ۲۶ نیافت")
require(ocr_has("27. c/ confusing"), "OCR کلید ۲۷ نیافت")
require(ocr_has("28. a / generate"), "OCR کلید ۲۸ نیافت")
for i, (opts, key) in ODD.items():
    for o in opts:
        require(ocr_has(o), f"OCR گزینهٔ ODD-{i} نیافت: {o}")
# شکل فعل
for i, stem in VF_STEMS.items():
    require(ocr_has_stem(stem), f"OCR ساقهٔ VF-{i} نیافت")
    require(ocr_has(stem.split("(")[1].rstrip(" )")), f"OCR راهنمای فعل VF-{i} نیافت")
require(ocr_has("29. has bought"), "OCR کلید ۲۹ نیافت")
require(ocr_has("30. were killed"), "OCR کلید ۳۰ نیافت")
require(ocr_has("31. had learned /learnt"), "OCR کلید ۳۱ (دودوییِ چاپ) نیافت")
require(ocr_has("32. be sent"), "OCR کلید ۳۲ نیافت")
# گرامر
for i, stem in G_STEMS.items():
    require(ocr_has_stem(stem), f"OCR ساقهٔ G-{i} نیافت")
    for o in G_REVERSED[i]:
        require(ocr_has(o), f"OCR گزینهٔ G-{i} نیافت: {o}")
require(ocr_has("33. ( c )"), "OCR کلید ۳۳ نیافت")
require(ocr_has("34. (a)"), "OCR کلید ۳۴ نیافت")
require(ocr_has("35. (c)"), "OCR کلید ۳۵ نیافت")
require(ocr_has("36. (d)"), "OCR کلید ۳۶ نیافت")
# مرتب‌کردن
for i, (stem, acc) in WO.items():
    require(ocr_has(stem), f"OCR ساقهٔ WO-{i} نیافت")
require(ocr_has("My brother went to the library     , but he didn’t study at all."), "OCR کلید ۳۷ نیافت")
require(ocr_has("She/ Her father is watching the DVD   that her father/ She has bought."), "OCR کلید ۳۸ نیافت")
# کلمات ربط
for i, stem in CONN_STEMS.items():
    require(ocr_has_stem(stem), f"OCR ساقهٔ CONN-{i} نیافت")
require(ocr_has("39.  or"), "OCR کلید ۳۹ نیافت")
require(ocr_has("40. so"), "OCR کلید ۴۰ نیافت")
require(ocr_has("41. but"), "OCR کلید ۴۱ نیافت")
require(ocr_has("42. and"), "OCR کلید ۴۲ نیافت")
# کلوز درخت‌ها — بدنه و کلید
for s in TREE_SENTS:
    require(ocr_has(s), f"OCR جملهٔ TREE نیافت: {s[:36]}")
require(ocr_has("43.  ( c / e  / f / a  / b / d )"), "OCR کلید ۴۳ (شش‌جمله‌ای) نیافت")
# ریدینگ خودروی الکتریکی
require(ocr_has("Many countries now think that cars that burn fossil fuels should be replaced by electric cars."),
        "OCR بدنهٔ ریدینگ ۱ نیافت")
require(ocr_has("Hybrid cars combine the benefits of gasoline engines and electric motors."),
        "OCR بدنهٔ ریدینگ ۱ (جملهٔ هیبرید) نیافت")
for i, (stem, acc) in RD1_TYPED.items():
    require(ocr_has(stem), f"OCR ساقهٔ RD1-{i} نیافت")
for i, (stem, opts, key) in RD1_MCQ.items():
    require(ocr_has(stem), f"OCR ساقهٔ RD1-{i} نیافت")
require(ocr_has("48. They don’t make the air dirty and unclean because they don’t burn gasoline in the engine."),
        "OCR کلید ۴۸ نیافت")
require(ocr_has("49. The electric car is usually plugged in      at night."), "OCR کلید ۴۹ نیافت")
require(ocr_has("50. people use hybrid cars  because    Hybrid cars combine the benefits of gasoline engines"),
        "OCR کلید ۵۰ (تکهٔ نخست) نیافت")
require(ocr_has("and electric motors."), "OCR دنبالهٔ کلید ۵۰ نیافت")
require(ocr_has("51. False"), "OCR کلید ۵۱ نیافت")
require(ocr_has("52. False"), "OCR کلید ۵۲ نیافت")
# ریدینگ گوش‌ها
require(ocr_has("The size and shape of your ears show your character more than any other part of the face."),
        "OCR بدنهٔ ریدینگ ۲ نیافت")
require(ocr_has("Ears that are always red mean that a person may get angry easily."), "OCR بدنهٔ ریدینگ ۲ نیافت")
for i, (stem, opts, key) in RD2_MCQ.items():
    require(ocr_has(stem), f"OCR ساقهٔ RD2-{i} نیافت")
    for o in opts:
        require(ocr_has(o), f"OCR گزینهٔ RD2-{i} نیافت: {o}")
require(ocr_has("53. ( d )"), "OCR کلید ۵۳ نیافت")
require(ocr_has("54. ( c )"), "OCR کلید ۵۴ نیافت")
require(ocr_has("55. ( b )"), "OCR کلید ۵۵ نیافت")
require(ocr_has("56. (a )"), "OCR کلید ۵۶ نیافت")
# غیبت‌های صادقانه — topic sentenceها و پاراگرافِ باز
for frag in ["Doctors _____________________________________________________.",
             "Fruits ___________________________________________.",
             "Forests _____________________________________."]:
    require(ocr_has(frag), f"OCR بدنهٔ topic نیافت: {frag[:30]}")
require(ocr_has("Birth :"), "OCR سربرگِ ابوعلی‌سینا نیافت")
require(ocr_has("Ghanoon in medicine"), "OCR دادهٔ چاپیِ ابوعلی‌سینا نیافت")
# سربرگ‌های چاپی
for h in ["Vocabulary", "Grammar", "Writing", "Reading"]:
    require(ocr_has(h), f"OCR سربرگ {h} نیافت")
require(ocr_has("Audio file (MP3)"), "OCR یادداشتِ صوت نیافت")

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
require(next_lesson == 93, f"شمارهٔ درسِ بعدی {next_lesson} است نه ۹۳")
for l in NEW_LESSONS:
    if l["lesson"] != next_lesson:
        print(f"FAIL — ترتیب درس: انتظار {next_lesson}، یافت {l['lesson']}")
        sys.exit(1)
    if l["count"] != len(l["questions"]):
        print(f"FAIL — شمارِ درس {l['lesson']} ناهمسان")
        sys.exit(1)
    data["lessons"].append(l)
    next_lesson += 1

# برخوردِ شناسه — فقط با درس‌های پیشین (<۹۳)؛ سرِ ساقه در نوبت‌های نهایی عمداً تکراری است (الگوی تعریف‌ها/ربط‌ها)
# و گاردِ اختصاصی r295 قفلِ «صفر برخوردِ شناسه» را دارد.

data["source"]["final98d"] = {
    "pages": "251-256",
    "keyPages": "257-258",
    "titlePrinted": "آزمون نهایی انگلیسی دوازدهم — نوبت دی ۱۳۹۸ (تاریخ امتحان 22/10/98، مدت ۱۲۰ دقیقه، ۶ صفحه، داوطلبان آزاد و بزرگسال سراسر کشور — بخش چهارم: آزمون‌های نهایی دی ۹۷ تا شهریور ۱۴۰۱) — «Vision Three»",
    "sections": 17,
    "banks": 12,
    "questions": 46,
    "keys": 46,
    "extractedRound": 295,
    "audioAbsent": {
        "section": "1 (listening ۱-۶ بدونِ متنِ چاپی) + ساقه‌های چاپی‌ناداشتهٔ ۱۰/۱۱", "items": 8,
        "printedKey": "1. do exercise / 2. dishwasher / 3. renewable energy / 4. at the top of each page / 5. sun or sunshine / 6. You can carry it everywhere. / 10. He studied in Canada. / 11. They are interested in soccer. (واریانتِ دومِ چاپی: or they are crazy about soccer.)",
        "note": "بخش ۱ بدنهٔ چاپی ندارد؛ آیتم‌های ۱۰/۱۱ ساقهٔ چاپی ندارند (فقط کلیدِ راهنمای تصحیح ص۲۵۷) — بانک‌های ۱۰/۱۱ ساخته نشدند؛ یادداشتِ چاپیِ خودِ برگه: «Audio file (MP3) / Audio script (PDF)»",
    },
    "openWritingAbsent": {
        "section": "14 (جمله‌سازیِ topic برای ۴۴-۴۶) + 15 (پاراگرافِ بازِ ابوعلی‌سینا ۴۷)", "items": 4,
        "note": "پاسخِ باز با داوریِ اصولیِ تصحیح‌کننده (کلید ص۲۵۸ فقط معیارِ بارم: «با توجه به رعایت topic sentence نمره لحاظ گردد») — بانک صادقانه ساخته نشد؛ بدنهٔ کاملِ چاپیِ سه پاراگرافِ Doctors/Fruits/Forests و داده‌های چاپیِ ابوعلی‌سینا (Birth: 359 Shamsi, Bokhara / Job: scientist, physician, philosopher / Books: Ghanoon in medicine, Shafa in philosophy / Death: 419 Shamsi, Hamedan) در رسید محفوظ است",
    },
    "receipts": [
        {"item": "7,8", "field": "options", "printed": "سه‌گزینه‌ایِ چاپ (a/b/c)",
         "note": "ساقه/گزینه/کلیدِ چاپیِ کامل — بانکِ شنیداریِ متن‌چاپ ادامه دارد (الگوی r293/r294)؛ املای چاپیِ بدنهٔ ۸ «Zoheh» وفادار ماند"},
        {"item": "9", "field": "typed", "printed": "ساقهٔ چاپی «Where does Mina live?»",
         "note": "کلیدِ جمله‌کاملِ راهنما «She lives in another neighborhood.» — بدونِ گزینهٔ چاپی؛ بانک تایپی"},
        {"item": "15,16", "field": "stem", "printed": "حرفِ نخستِ چاپی چسبیده (b………... / m……………)",
         "note": "الگوی r293/r294 — کلیدِ راهنما balcony/monolingual؛ تصویرِ گمشده با ساقه/کلیدِ کامل جبران شد"},
        {"item": "17-20", "field": "key", "printed": "c/d/e/b — a اضافهٔ چاپی",
         "note": "نخستین سرِ تعریفِ تک‌واژه‌ایِ خانواده (calmly/tide/figure out/remind) — سرها عین چاپ"},
        {"item": "21-24", "field": "key", "printed": "effectively/shared/replaced/cooling — radiation اضافهٔ چاپی",
         "note": "بانکِ ۵واژه‌ایِ چاپ؛ آیتم ۲۴ کلوزِ دوجمله‌ایِ پیوسته است با یک خالیِ قابلِ بازی (نیمهٔ دوم توضیحی)"},
        {"item": "25-28", "field": "section", "printed": "«کلمه‌ای که با سه گزینهٔ دیگر هماهنگی ندارد را پیدا کنید.»",
         "note": "نخستین odd-one-outِ خانواده — کلیدهای حرفیِ راهنما c/d/c/a؛ داوریِ معناییِ مستقل (منبعِ تجدیدناپذیر/منبعِ مطلوب/صفتِ منفی/فعلِ تولید) تأیید"},
        {"item": "33-36", "field": "options", "printed": "چاپ وارونه d,c,b,a (از d به a)",
         "note": "به ترتیب طبیعی a-d بازنگاشت شد — الگوی r290/r291/r293/r294؛ کلیدهای حرفیِ راهنما (c/a/c/d) عین چاپ؛ «have meet» غلطِ چاپیِ گزینهٔ بدنه وفادار"},
        {"item": "38", "field": "accepted", "printed": "«She/ Her father is watching the DVD that her father/ She has bought.»",
         "note": "کلیدِ دودوییِ جمله‌کامل با بازمونتاژِ اسلش‌های راهنما: دو واریانتِ کامل — «She is watching…father has bought» / «Her father is watching…she has bought»"},
        {"item": "42", "field": "stem", "printed": "«he wore it for two years .» فاصلهٔ چاپی پیش از نقطه",
         "note": "وفادار به چاپ؛ پارسر نرمال‌سازی نمی‌کند"},
        {"item": "43", "field": "answer", "printed": "«( c / e  / f / a  / b / d )»",
         "note": "نخستین کلوزِ حروف‌محورِ شش‌جمله‌ای — گزینه‌های حرف‌دارِ چاپی a-f؛ MCQ با گزینهٔ درستِ عینِ کلیدِ راهنما + سه آشفتگیِ منطقی (باندها)"},
        {"item": "50", "field": "answer", "printed": "«people use hybrid cars because Hybrid cars combine…» (تکه‌های OCR با نشان (0/25)/(0/75))",
         "note": "سؤالِ بازِ چاپ راست‌چین است؛ درون‌اپ به MCQ چهارگزینه‌ای بازسازی شد — گزینهٔ درست عینِ کلیدِ چاپیِ راهنما؛ رسیدِ بازسازی"},
        {"item": "51,52", "field": "answer", "printed": "هر دو False کلید چاپی",
         "note": "تنشِ معناییِ ۵۲ («Not all») با کلیدِ چاپی حاکم — الگوی r289"},
        {"item": "53-56", "field": "key", "printed": "(d)(c)(b)(a)",
         "note": "کلیدهای حرفیِ راهنمای ص۲۵۸ عین چاپ؛ بدنهٔ کاملِ ریدینگ گوش‌ها با پرانتزِ فارسیِ «نرمه گوش» وفادار"},
        {"item": "passages", "field": "—", "printed": "p255-256",
         "note": "متنِ دو ریدینگ درون‌اپ حمل نشد (الگوی r289-r294) — تصویر صفحه در کتابخانهٔ جزوه در دسترس است"},
    ],
}

BANK_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(l["count"] for l in data["lessons"])
print(f"OK — lessons now {len(data['lessons'])}, family total {total} (added 46)")
print("ids:", ", ".join(new_ids[:5]), "…", new_ids[-1])
