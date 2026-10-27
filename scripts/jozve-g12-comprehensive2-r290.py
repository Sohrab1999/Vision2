#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r290 — آزمون جامع تشریحی درس دوم (Vision Three جزوهٔ دوازدهم، ص۱۰۹-۱۱۳؛ کلید ص۲۱۳)
الگوی کامل r289: ۱۰ بانک / ۵۱ آیتم از ۱۲ بخش چاپی؛ بخش ۱ (تصویری) و بخش ۹ (topic sentence بدون کلید
به‌ازای آیتم) غیبتِ صادقانه با رسید در source.comprehensive2.
- هر ساقه/گزینه با راستی‌آزماییِ حضورِ OCR (نرمال‌سازی خط‌تیره/آپاستروف/فاصله)
- دو داوریِ کامل: PRINTED_KEY (عیناً ص۲۱۳) و EXPECTED (داوریِ معنایی مستقل) — باید برابر باشند
- داربست تایپی: کلید در اندیس ۰ + ۳ یا ۱ یا ۲ مزاحمِ یکتا از استخرِ تعریف‌شده
- یکتایی شناسه در کل خانواده (۵۷۴ موجود + ۵۱ نو)
"""
import json, re, sys, unicodedata
from pathlib import Path

ROOT = Path("/home/z/my-project")
BANK_PATH = ROOT / "public/jozve/grammar-g12-topic.json"
OCR_PATH = ROOT / "booklet-extract/g12.txt"

BLANK = "---------------"  # ۱۵ خط‌تیره — قرارداد بانک‌های جامع r289

# ---------------------------------------------------------------- OCR load & normalize
OCR = OCR_PATH.read_text(encoding="utf-8")

def norm(s: str) -> str:
    s = unicodedata.normalize("NFC", s)
    s = s.replace("’", "'").replace("‘", "'").replace("`", "'").replace("´", "'")
    s = s.replace("“", '"').replace("”", '"').replace("«", '"').replace("»", '"')
    s = re.sub(r"[-‐‑‒–—―]{2,}", " BLNK ", s)   # هر رشتهٔ خط‌تیرهٔ ۲تایی+ → نشانگر خالی
    s = re.sub(r"[-‐‑‒–—―]+", " ", s)            # خط‌تیره‌های تکی → فاصله
    s = re.sub(r"\s+", " ", s).strip().lower()
    return s

OCR_N = norm(OCR)

def ocr_has(fragment: str) -> bool:
    """حضورِ تکهٔ verbatim در OCR — با تحملِ شکستِ خط و خالی."""
    return norm(fragment) in OCR_N

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
        letters = "abcde" if len(options) == 5 else "abcd"
    return {"id": qid, "n": n, "category": "grammar",
            "question": question, "options": options, "answer": letters.index(key_letter)}

# ================================================================ S2 — واژگان: بانک ۹واژه‌ای، ۸ تایپی (ص۱۰۹)
VOC_BANK_PRINTED = ["recommend", "jumped", "respect", "wonder", "compile", "advanced", "suppose", "arrange", "combine"]
K_VOC = {1: "combine", 2: "arrange", 3: "compile", 4: "advanced", 5: "jumped", 6: "recommend", 7: "respect", 8: "suppose"}
# داوری دوم — معناییِ مستقل
EXPECTED_VOC = K_VOC  # پایین با داوریِ جمله‌به‌جمله مقایسه می‌شود

VOC_STEMS = {
    1: f"Two atoms of hydrogen {BLANK} with one atom of oxygen to form a molecule of water.",
    2: f"I'm trying to {BLANK} my work so that I can have a couple of days off next week.",
    3: f"It often takes five or six years of hard work to {BLANK} a good dictionary.",
    4: f"Without more training or {BLANK} technical skills, they'll lose their jobs.",
    5: f"My father didn't read the introduction and {BLANK} into the next part.",
    6: f"I {BLANK} that you avoid processed foods whenever possible.",
    7: f"My brothers and I {BLANK} our parents all the time.",
    8: f"Getting a visa isn't as simple as you might {BLANK}.",
}

def voc_scaffold(key: str) -> list[str]:
    i = VOC_BANK_PRINTED.index(key)
    others = [VOC_BANK_PRINTED[(i + k) % len(VOC_BANK_PRINTED)] for k in (1, 2, 3)]
    return [key] + others

LESSON_VOC = {
    "lesson": 37, "title": "جامع درس دوم — واژگان: جای خالی از بانک، بنویسید (ص۱۰۹)",
    "level": "آموزشی — ورود آزاد", "count": 8,
    "questions": [q_typed(f"g12-comp2-v{i}", i, VOC_STEMS[i], voc_scaffold(K_VOC[i]), [K_VOC[i]],
                          "fill in the blank with the word bank…") for i in range(1, 9)],
}

# ================================================================ S3 — ترکیب‌ها: ۵ گزینهٔ چاپی (ص۱۰۹)
COL_OPTIONS = ["dictionary", "symbol", "tips", "words", "attack"]  # a..e عیناً چاپ
K_COL = {1: "c", 2: "e", 3: "d", 4: "a"}
COL_HEADS = {1: "helpful", 2: "word", 3: "complicated", 4: "bilingual"}
LESSON_COL = {
    "lesson": 38, "title": "جامع درس دوم — واژگان: ترکیب‌ها، ۵ گزینهٔ چاپی (ص۱۰۹)",
    "level": "استاندارد", "count": 4,
    "questions": [q_mcq(f"g12-comp2-col{i}", i, COL_HEADS[i], COL_OPTIONS, K_COL[i]) for i in range(1, 5)],
}

# ================================================================ S4 — تعریف‌ها: بانک ۵واژه‌ای، ۴ تایپی (ص۱۰۹)
DEF_BANK = ["symbol", "entry", "effective", "jump into", "figure out"]
K_DEF = {1: "effective", 2: "symbol", 3: "jump into", 4: "figure out"}
DEF_STEMS = {
    1: "Successful or achieving the results that you want:",
    2: "Something that stands for something else:",
    3: "To suddenly decide to do something:",
    4: "To understand or solve something:",
}

def def_scaffold(key: str) -> list[str]:
    others = [w for w in DEF_BANK if w != key][:3]
    return [key] + others

LESSON_DEF = {
    "lesson": 39, "title": "جامع درس دوم — واژگان: تعریف‌ها، بنویسید (ص۱۰۹)",
    "level": "آموزشی — ورود آزاد", "count": 4,
    "questions": [q_typed(f"g12-comp2-def{i}", i, DEF_STEMS[i], def_scaffold(K_DEF[i]), [K_DEF[i]],
                          "write the word from the bank…") for i in range(1, 5)],
}

# ================================================================ S5 — گرامر: ۸ MCQ (ص۱۱۰)
G_STEMS = {
    1: f"He is not very {BLANK}, thus he doesn't feel comfortable to talk to people.",
    2: f"The team had a football match, but it finished {BLANK}.",
    3: f"We went out to play football, but it started to rain {BLANK}.",
    4: f"Scientists believe that hot weather is often {BLANK} the crops.",
    5: f"{BLANK} you {BLANK} to the movie theatre with me tonight if you didn't work?",
    6: f"Where would you like to travel if you {BLANK} an astronaut?",
    7: f"What was the name of the horse {BLANK} won the race?",
    8: f"My father spoke to the man {BLANK} was standing next to him.",
}
G_OPTIONS = {
    1: ["communicatively", "communicative", "communication", "communicate"],
    2: ["success", "unsuccessfully", "succeed", "unsuccessful"],
    3: ["unexpectedly", "expected", "expectation", "unexpected"],
    4: ["endanger", "endangering", "endangered", "dangers"],
    5: ["Would / go", "Would / went", "Will / go", "Will / went"],
    6: ["would be", "are", "might be", "were"],
    7: ["whom", "which", "who", "whose"],
    8: ["where", "who", "which", "whom"],
}
K_GRAM = {1: "b", 2: "b", 3: "a", 4: "b", 5: "a", 6: "d", 7: "b", 8: "b"}
LESSON_GRAM = {
    "lesson": 40, "title": "جامع درس دوم — گرامر: تست چهارگزینه‌ای (ص۱۱۰)",
    "level": "استاندارد", "count": 8,
    "questions": [q_mcq(f"g12-comp2-g{i}", i, G_STEMS[i], G_OPTIONS[i], K_GRAM[i]) for i in range(1, 9)],
}

# ================================================================ S6 — who/which: ۴ تایپی، استخرِ بسته (ص۱۱۰)
REL_STEMS = {
    1: f"Summer holidays, {BLANK} are starting soon, are the best period to learn languages.",
    2: f"This is the pocket dictionary {BLANK} my brother bought last week.",
    3: f"The old lady {BLANK} was here yesterday has gone to England.",
    4: f"The child {BLANK} is crying loudly is my little sister.",
}
K_REL = {1: "which", 2: "which", 3: "who", 4: "who"}
LESSON_REL = {
    "lesson": 41, "title": "جامع درس دوم — ضمایر موصولی who/which، بنویسید (ص۱۱۰)",
    "level": "آموزشی — ورود آزاد", "count": 4,
    "questions": [q_typed(f"g12-comp2-rel{i}", i, REL_STEMS[i], [K_REL[i], "who" if K_REL[i] == "which" else "which"],
                          [K_REL[i]], "fill in the blank… (who / which)") for i in range(1, 5)],
}

# ================================================================ S7 — شکل فعل شرطی: ۴ تایپی (ص۱۱۰)
VF_STEMS = {
    1: f"If I {BLANK} my job, I might go abroad for a while. (lose)",
    2: f"They {BLANK} healthier if they didn't live in a crowded city. (be)",
    3: f"If he {BLANK} me to his birth day party, I wouldn't come. (not / invite)",
    4: f"If the questions were easy enough, everyone {BLANK} the test. (pass)",
}
K_VF = {1: "lost", 2: "would be", 3: "didn't invite", 4: "would pass"}
VF_POOL = [K_VF[i] for i in range(1, 5)]

def vf_scaffold(key: str) -> list[str]:
    return [key] + [w for w in VF_POOL if w != key]

LESSON_VF = {
    "lesson": 42, "title": "جامع درس دوم — شکل صحیح فعل شرطی، بنویسید (ص۱۱۰)",
    "level": "آموزشی — ورود آزاد", "count": 4,
    "questions": [q_typed(f"g12-comp2-vf{i}", i, VF_STEMS[i], vf_scaffold(K_VF[i]), [K_VF[i]],
                          "write the correct verb form…") for i in range(1, 5)],
}

# ================================================================ S8 — مرتب‌کردن کلمات: ۴ تایپی (ص۱۱۰)
UN_SCRAMBLES = {
    1: "which / detective story / read / I / the book / a / yesterday / was / .",
    2: "a / would / enough / I / buy / car / had / I / money / if / modern / .",
    3: "didn't / you / you / any / what / teeth / do / have / would / if / ?",
    4: "jokes / his / who / a woman / loves / is / wife / .",
}
K_UN = {
    1: "The book which I read yesterday was a detective story.",
    2: "If I had enough money, I would buy a modern car.",
    3: "What would you do if you didn't have any teeth?",
    4: "His wife is a woman who loves jokes.",
}
UN_POOL = [K_UN[i] for i in range(1, 5)]

def un_scaffold(key: str) -> list[str]:
    return [key] + [s for s in UN_POOL if s != key]

LESSON_UN = {
    "lesson": 43, "title": "جامع درس دوم — مرتب‌کردن کلمات، بنویسید (ص۱۱۰)",
    "level": "آموزشی — ورود آزاد", "count": 4,
    "questions": [q_typed(f"g12-comp2-un{i}", i, UN_SCRAMBLES[i], un_scaffold(K_UN[i]), [K_UN[i]],
                          "write the complete sentence…") for i in range(1, 5)],
}

# ================================================================ S10 — کلوز ۵خالی: مغز دوزبانه‌ها (ص۱۱۱)
CLZ_WINDOWS = {
    1: "People who speak two languages may have brains that are more efficient at language processing and other tasks. Brain scans showed that people (---1---) spoke only one language had to work harder to focus on a single word",
    2: "according to the study (---2---) on Nov. 12 in the journal Brain and Language.",
    3: "People who are (---3---) are constantly activating both languages in their brain",
    4: "choosing which to use and (---4---) to ignore, said study leader Viorica Marian, a linguistic psychologist at Northwestern University.",
    5: "Bilingual people were no faster at performing the task than (---5---).",
}
CLZ_OPTIONS = {
    1: ["who", "which", "whose", "whom"],
    2: ["transmitted", "surrounded", "published", "supported"],
    3: ["sweet", "superhuman", "right", "bilingual"],
    4: ["which", "whose", "what", "who"],
    5: ["monolinguals", "jumps", "designs", "disconnections"],
}
K_CLZ = {1: "a", 2: "c", 3: "d", 4: "a", 5: "a"}
LESSON_CLZ = {
    "lesson": 44, "title": "جامع درس دوم — متن ۵خالی: مغز دوزبانه‌ها (ص۱۱۱)",
    "level": "استاندارد", "count": 5,
    "questions": [q_mcq(f"g12-comp2-clz{i}", i, CLZ_WINDOWS[i], CLZ_OPTIONS[i], K_CLZ[i]) for i in range(1, 6)],
}

# ================================================================ S11 — ریدینگ انیشتین: ۲ MCQ + ۲ درست/نادرست + ۲ تایپی (ص۱۱۱-۱۱۲)
K_EIN_OPEN = {
    5: "The Nobel Prize was awarded to Einstein for physics in 1921.",
    6: "He wrote a letter to President Roosevelt expressing his worry about the atomic bomb.",
}
LESSON_RD = {
    "lesson": 45, "title": "جامع درس دوم — ریدینگ انیشتین: تست + پرسش پاسخ (ص۱۱۱-۱۱۲)",
    "level": "آموزشی — ورود آزاد", "count": 6,
    "questions": [
        q_mcq("g12-comp2-rd1", 1,
              f"Before the World War II, Einstein left Germany and became a/an {BLANK}.",
              ["president", "American citizen", "physicist", "student"], "b"),
        q_mcq("g12-comp2-rd2", 2, f"He died because of his {BLANK}.",
              ["Relativity Theory", "scientific research", "health problems", "academic studies"], "c"),
        q_mcq("g12-comp2-rd3", 3, "His job helped him to think about his theory.", ["True", "False"], "a"),
        q_mcq("g12-comp2-rd4", 4, "He found a job easily after graduation.", ["True", "False"], "b"),
        q_typed("g12-comp2-rd5", 5, "When was the Nobel Prize awarded to Einstein?",
                [K_EIN_OPEN[5], K_EIN_OPEN[6]], [K_EIN_OPEN[5]]),
        q_typed("g12-comp2-rd6", 6, "What did Einstein do for expressing his fear of the atomic bomb?",
                [K_EIN_OPEN[6], K_EIN_OPEN[5]], [K_EIN_OPEN[6]]),
    ],
}

# ================================================================ S12 — ریدینگ لئوناردو: ۴ MCQ (ص۱۱۲-۱۱۳)
LESSON_RM = {
    "lesson": 46, "title": "جامع درس دوم — ریدینگ لئوناردو: تست چهارگزینه‌ای (ص۱۱۲-۱۱۳)",
    "level": "استاندارد", "count": 4,
    "questions": [
        q_mcq("g12-comp2-rm1", 1, "What does paragraph 3 mainly discuss?",
              ["What were the subjects that Leonardo wanted to learn",
               "Leonardo's art and invention talent",
               "The role of Leonardo in the invention of the airplane",
               "most famous painting"], "b"),
        # گزینه‌های چاپی به ترتیب معکوس حرف چاپ شده‌اند (d→a) — نگاشت وفادار: a=nearly/b=sadly/c=anxiously/d=bravely
        q_mcq("g12-comp2-rm2", 2,
              "The word “eagerly” in paragraph 2 is closest in meaning to ----------------------------.",
              ["nearly", "sadly", "anxiously", "bravely"], "c"),
        q_mcq("g12-comp2-rm3", 3, "According to the passage, which of the following statements is true?",
              ["Verrocchio, the famous master painter who was taught by Leonardo.",
               "Leonardo started to draw everything after he known as a talented artist.",
               "Once Leonardo succeeded in making a glider flight.",
               "A pump worked by water-power to bring water from a stream to a house was invented by Leonardo."], "d"),
        q_mcq("g12-comp2-rm4", 4, "The passage provides enough information to answer which of the following questions?",
              ["How did Verrocchio accept Leonardo as his student in Italy?",
               "Where is one of the most Leonardo's famous paintings now?",
               "Why did the glider flight was not successful enough to be tried again?",
               "What were Leonardo's plans for a submarine?"], "b"),
    ],
}

NEW_LESSONS = [LESSON_VOC, LESSON_COL, LESSON_DEF, LESSON_GRAM, LESSON_REL,
               LESSON_VF, LESSON_UN, LESSON_CLZ, LESSON_RD, LESSON_RM]

# ================================================================ داوری دوم — معناییِ مستقل
EXPECTED = {
    "voc": {1: "combine", 2: "arrange", 3: "compile", 4: "advanced", 5: "jumped", 6: "recommend", 7: "respect", 8: "suppose"},
    "col": {1: "c", 2: "e", 3: "d", 4: "a"},
    "def": {1: "effective", 2: "symbol", 3: "jump into", 4: "figure out"},
    "gram": {1: "b", 2: "b", 3: "a", 4: "b", 5: "a", 6: "d", 7: "b", 8: "b"},
    "rel": {1: "which", 2: "which", 3: "who", 4: "who"},
    "vf": {1: "lost", 2: "would be", 3: "didn't invite", 4: "would pass"},
    "un": K_UN,
    "clz": {1: "a", 2: "c", 3: "d", 4: "a", 5: "a"},
    "rd": {1: "b", 2: "c", 3: "a", 4: "b"},
    "rm": {1: "b", 2: "c", 3: "d", 4: "b"},
}
PRINTED = {
    "voc": K_VOC, "col": K_COL, "def": K_DEF, "gram": K_GRAM, "rel": K_REL,
    "vf": {1: "lost", 2: "would be", 3: "didn't invite", 4: "would pass"}, "un": K_UN,
    "clz": K_CLZ, "rd": {1: "b", 2: "c", 3: "a", 4: "b"}, "rm": {1: "b", 2: "c", 3: "d", 4: "b"},
}
for fam in PRINTED:
    require(PRINTED[fam] == EXPECTED[fam], f"داوری دوم ناهمسان در {fam}")

# ================================================================ راستی‌آزمایی حضورِ OCR
for i, stem in VOC_STEMS.items():
    require(ocr_has(stem), f"OCR ساقهٔ VOC-{i} نیافت")
for i, stem in DEF_STEMS.items():
    require(ocr_has(stem), f"OCR ساقهٔ DEF-{i} نیافت")
for i, stem in G_STEMS.items():
    require(ocr_has(stem), f"OCR ساقهٔ GRAM-{i} نیافت")
for i, stem in REL_STEMS.items():
    require(ocr_has(stem), f"OCR ساقهٔ REL-{i} نیافت")
for i, stem in VF_STEMS.items():
    require(ocr_has(stem), f"OCR ساقهٔ VF-{i} نیافت")
for i, scr in UN_SCRAMBLES.items():
    require(ocr_has(scr), f"OCR بهم‌ریختهٔ UN-{i} نیافت")
    require(ocr_has(K_UN[i]), f"OCR کلید جملهٔ UN-{i} نیافت")
for i, w in CLZ_WINDOWS.items():
    require(ocr_has(w), f"OCR پنجرهٔ CLZ-{i} نیافت")
    require(w.count("(---") == 1, f"پنجرهٔ CLZ-{i} بیش از یک خالی دارد")
for s in K_EIN_OPEN.values():
    require(ocr_has(s), f"OCR کلید ریدینگِ باز نیافت: {s[:40]}")
require(ocr_has("Before the World War II, Einstein left Germany and became a/an"), "OCR ساقهٔ RD-1 نیافت")
require(ocr_has("He died because of his"), "OCR ساقهٔ RD-2 نیافت")
require(ocr_has("His job helped him to think about his theory."), "OCR ساقهٔ RD-3 نیافت")
require(ocr_has("He found a job easily after graduation."), "OCR ساقهٔ RD-4 نیافت")
require(ocr_has("What does paragraph 3 mainly discuss?"), "OCR ساقهٔ RM-1 نیافت")
require(ocr_has("is closest in meaning to"), "OCR ساقهٔ RM-2 نیافت")
require(ocr_has("According to the passage, which of the following statements is true?"), "OCR ساقهٔ RM-3 نیافت")
require(ocr_has("The passage provides enough information to answer which of the following questions?"), "OCR ساقهٔ RM-4 نیافت")
# گزینه‌های نمونه‌ای
for w in ["communicatively", "unsuccessfully", "unexpectedly", "endangering", "would be", "might be", "whom", "monolinguals", "disconnections", "superhuman"]:
    require(ocr_has(w), f"OCR گزینهٔ {w} نیافت")
require(ocr_has("A pump worked by water-power to bring water from a stream to a house was invented by Leonardo."), "OCR گزینهٔ RM-3d نیافت")
require(ocr_has("Where is one of the most Leonardo's famous paintings now?"), "OCR گزینهٔ RM-4b نیافت")
# سربرگ‌های چاپی بخش‌ها و کلید
require(ocr_has("A: Vocabulary:"), "OCR سربرگ A نیافت")
require(ocr_has("B: Grammar:"), "OCR سربرگ B نیافت")
require(ocr_has("C: Writing:"), "OCR سربرگ C نیافت")
require(ocr_has("D: Cloze Test:"), "OCR سربرگ D نیافت")
require(ocr_has("E: Reading:"), "OCR سربرگ E نیافت")
require(norm("در این بخش با توجه به رعایت") in OCR_N or ocr_has("topic sentence"), "OCR یادداشتِ S9 نیافت")

# کلید تصویری S1 در OCR ص۲۱۳ — رسیدِ غیبت
require(bool(re.search(r"1\.\s*D\s*\n\s*2\.\s*B\s*\n\s*3\.\s*C\s*\n\s*4\.\s*A", OCR)), "OCR گرید کلید تصویری S1 نیافت")

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
require(not dup, f"شناسهٔ تکراری: {sorted(set(dup))}")
if failures:
    print("FAIL — شناسه:")
    for f in failures:
        print("  ✗", f)
    sys.exit(1)

next_lesson = max(l["lesson"] for l in data["lessons"]) + 1
require(next_lesson == 37, f"شمارهٔ درسِ بعدی {next_lesson} است نه ۳۷")
for l in NEW_LESSONS:
    require(l["lesson"] == next_lesson, f"ترتیب درس: انتظار {next_lesson}، یافت {l['lesson']}")
    require(l["count"] == len(l["questions"]), f"شمارِ درس {l['lesson']} ناهمسان")
    data["lessons"].append(l)
    next_lesson += 1

data["source"]["comprehensive2"] = {
    "pages": "109-113",
    "keyPages": "213",
    "titlePrinted": "آزمون تشریحی درس دوم (پاسخنامه صفحه: 213) — «Vision Three»",
    "sections": 12,
    "banks": 10,
    "questions": 51,
    "keys": 51,
    "extractedRound": 290,
    "visualAbsent": {
        "section": 1, "items": 4, "printedKey": "1.D / 2.B / 3.C / 4.A",
        "note": "وابسته به تصویر — بانک ساخته نشد؛ کلید چاپی ص۲۱۳ همین‌جا محفوظ است (الگوی r289)",
    },
    "openEndedNoPrintedKey": {
        "section": 9, "items": 8, "topics": ["sport", "writing", "forest", "smoking", "firefighters", "Avicenna", "clean energy", "Persian Gulf"],
        "printedNote": "در این بخش با توجه به رعایت «topic sentence» جملات متفاوتی می‌توان نوشت",
        "note": "کلید چاپی به‌ازای هر آیتم ندارد؛ صداقتِ داده — بانک جعل نشد",
    },
    "fiveOptions": {
        "section": 3,
        "note": "۵ گزینهٔ چاپی (a-e) وفادار ماند؛ extra چاپی: b.symbol — ترکیب چاپی «word attack» واقعی است",
    },
    "leonardoReversed": {
        "section": 12, "item": 2,
        "note": "گزینه‌های چاپی به ترتیب معکوس حرف چاپ شده‌اند (d→a)؛ نگاشت وفادار: a=nearly/b=sadly/c=anxiously/d=bravely — کلید چاپی c=anxiously",
    },
    "receipts": [
        {"item": "S7-3", "field": "stem", "printed": "birth day", "note": "غلط چاپی خود جزوه — دوواژه‌ای؛ وفادار ماندیم"},
        {"item": "S12-3b", "field": "options.b", "printed": "after he known as", "note": "غلط چاپی خود جزوه؛ وفادار ماندیم"},
        {"item": "S12-4c", "field": "options.c", "printed": "Why did the glider flight was not successful enough", "note": "غلط چاپی خود جزوه؛ وفادار ماندیم"},
        {"item": "S12-2", "field": "options", "printed": "eagerly → anxiously", "note": "تنشِ معناییِ جزئی؛ کلید چاپی حاکم است (الگوی tfReceipt r289)"},
    ],
}

BANK_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(l["count"] for l in data["lessons"])
print(f"OK — lessons now {len(data['lessons'])}, family total {total} (added 51)")
print("ids:", ", ".join(new_ids[:5]), "…", new_ids[-1])
