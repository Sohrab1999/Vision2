#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r291 — آزمون جامع تشریحی درس سوم (Vision Three جزوهٔ دوازدهم، ص۱۵۶-۱۵۹؛ کلید ص۲۲۶)
الگوی کامل r289/r290: ۱۲ بانک / ۵۳ آیتم از ۱۳ بخش چاپی؛ بخش ۱ (تصویری) غیبتِ صادقانه.
نوهای راند: (۱) کلیدهای دوخالی چاپی «X / Y» با اسلش — نرمال‌سازیِ lib اکنون اسلش→فاصله؛
(۲) سه‌گزینه‌ایِ نقش‌های پاراگراف (S10) — طبیعتِ خودِ تمرین؛ (۳) سه کلوز با گزینه‌های
چاپیِ معکوس‌ترتیب (S11/S12/S13-4) با نگاشت وفادار a..d.
"""
import json, re, sys, unicodedata
from pathlib import Path

ROOT = Path("/home/z/my-project")
BANK_PATH = ROOT / "public/jozve/grammar-g12-topic.json"
OCR_PATH = ROOT / "booklet-extract/g12.txt"

BLANK = "---------------"

OCR = OCR_PATH.read_text(encoding="utf-8")

def norm(s: str) -> str:
    s = unicodedata.normalize("NFC", s)
    s = s.replace("’", "'").replace("‘", "'").replace("`", "'").replace("´", "'")
    s = s.replace("“", '"').replace("”", '"').replace("«", '"').replace("»", '"')
    s = re.sub(r"[-‐‑‒–—―]{2,}", " BLNK ", s)
    s = re.sub(r"[-‐‑‒–—―]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip().lower()
    return s

OCR_N = norm(OCR)

def ocr_has(fragment: str) -> bool:
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
        letters = "abcde"[: len(options)]
    return {"id": qid, "n": n, "category": "grammar",
            "question": question, "options": options, "answer": letters.index(key_letter)}

# ================================================================ S2 — واژگان: بانک ۹واژه‌ای، ۸ تایپی (ص۱۵۶)
VOC_BANK_PRINTED = ["demand", "blow", "generate", "pollute", "common", "absorb", "forever", "remind", "opposite"]
K_VOC = {1: "absorb", 2: "pollute", 3: "demand", 4: "remind", 5: "opposite", 6: "generate", 7: "blow", 8: "common"}
VOC_STEMS = {
    1: f"Solar cell can {BLANK} sunlight and convert it into electricity.",
    2: f"Factories are no longer allowed to {BLANK} the air with black smoke.",
    3: f"There's increasing {BLANK} for cars which are more economical on fuel.",
    4: f"I had to {BLANK} myself that being confident is not the same as being perfect!",
    5: f"In England you must drive on the {BLANK} side of the road to the rest of Europe.",
    6: f"The company should be able to {BLANK} business on the back of existing contracts.",
    7: f"The winds {BLANK} across the sea, pushing little waves into bigger and bigger ones.",
    8: f"The results of the research should be used for the {BLANK} good rather than for individual profit.",
}

def voc_scaffold(key: str) -> list[str]:
    i = VOC_BANK_PRINTED.index(key)
    others = [VOC_BANK_PRINTED[(i + k) % len(VOC_BANK_PRINTED)] for k in (1, 2, 3)]
    return [key] + others

LESSON_VOC = {
    "lesson": 47, "title": "جامع درس سوم — واژگان: جای خالی از بانک، بنویسید (ص۱۵۶)",
    "level": "آموزشی — ورود آزاد", "count": 8,
    "questions": [q_typed(f"g12-comp3-v{i}", i, VOC_STEMS[i], voc_scaffold(K_VOC[i]), [K_VOC[i]],
                          "fill in the blank with the word bank…") for i in range(1, 9)],
}

# ================================================================ S3 — ترکیب‌ها: ۵ گزینهٔ چاپی (ص۱۵۶)
COL_OPTIONS = ["instance", "balcony", "fuels", "energy", "sources"]  # a..e عیناً چاپ
K_COL = {1: "c", 2: "d", 3: "a", 4: "e"}
COL_HEADS = {1: "fossil", 2: "kinetic", 3: "for", 4: "main"}
LESSON_COL = {
    "lesson": 48, "title": "جامع درس سوم — واژگان: ترکیب‌ها، ۵ گزینهٔ چاپی (ص۱۵۶)",
    "level": "استاندارد", "count": 4,
    "questions": [q_mcq(f"g12-comp3-col{i}", i, COL_HEADS[i], COL_OPTIONS, K_COL[i]) for i in range(1, 5)],
}

# ================================================================ S4 — تعریف‌ها: بانک ۵واژه‌ای، ۴ تایپی (ص۱۵۶)
DEF_BANK = ["generation", "replace", "conversion", "consumption", "pollution"]
K_DEF = {1: "replace", 2: "consumption", 3: "pollution", 4: "generation"}
DEF_STEMS = {
    1: "To put something back in the right place:",
    2: "The act of using energy, food or materials:",
    3: "The process of making air, water, soil, etc. dirty:",
    4: "The production of something, especially electricity, heat, etc:",
}

def def_scaffold(key: str) -> list[str]:
    others = [w for w in DEF_BANK if w != key][:3]
    return [key] + others

LESSON_DEF = {
    "lesson": 49, "title": "جامع درس سوم — واژگان: تعریف‌ها، بنویسید (ص۱۵۶)",
    "level": "آموزشی — ورود آزاد", "count": 4,
    "questions": [q_typed(f"g12-comp3-def{i}", i, DEF_STEMS[i], def_scaffold(K_DEF[i]), [K_DEF[i]],
                          "write the word from the bank…") for i in range(1, 5)],
}

# ================================================================ S5 — گرامر: ۴ MCQ (ص۱۵۷)
G_STEMS = {
    1: f"The police reported that they finally {BLANK} the thief.",
    2: f"They didn't want to go to the cinema because they {BLANK} the film the week before.",
    3: f"They {BLANK} something about global warming, or some types of animals will die out.",
    4: f"A fish salad {BLANK} for dinner by the cook.",
}
G_OPTIONS = {
    1: ["had been captured", "had captured", "will be captured", "capture"],
    2: ["saw", "may be seen", "had been seen", "had seen"],
    3: ["should do", "had done", "should be done", "have to be done"],
    4: ["may make", "may be made", "had made", "have been made"],
}
K_GRAM = {1: "b", 2: "d", 3: "a", 4: "b"}
LESSON_GRAM = {
    "lesson": 50, "title": "جامع درس سوم — گرامر: تست چهارگزینه‌ای (ص۱۵۷)",
    "level": "استاندارد", "count": 4,
    "questions": [q_mcq(f"g12-comp3-g{i}", i, G_STEMS[i], G_OPTIONS[i], K_GRAM[i]) for i in range(1, 5)],
}

# ================================================================ S6 — مجهول‌سازی: ۴ تایپی (ص۱۵۷)
PASS_STEMS = {
    1: f"The bill {BLANK} (must / pay) before leaving the restaurant.",
    2: f"Some dangerous gases {BLANK} (may / produce) when garbage is burned.",
    3: f"It is important to know that not all types of waste {BLANK} (can / use) to produce fuel.",
    4: f"People {BLANK} (should / inform) of this danger and warned about the possible harms.",
}
K_PASS = {1: "must be paid", 2: "may be produced", 3: "can be used", 4: "should be informed"}
PASS_POOL = [K_PASS[i] for i in range(1, 5)]

def pass_scaffold(key: str) -> list[str]:
    return [key] + [w for w in PASS_POOL if w != key]

LESSON_PASS = {
    "lesson": 51, "title": "جامع درس سوم — مجهول‌سازی: بنویسید (ص۱۵۷)",
    "level": "آموزشی — ورود آزاد", "count": 4,
    "questions": [q_typed(f"g12-comp3-pass{i}", i, PASS_STEMS[i], pass_scaffold(K_PASS[i]), [K_PASS[i]],
                          "write the passive form…") for i in range(1, 5)],
}

# ================================================================ S7 — فعال/مجهول: ۲ بهم‌ریخته × ۲ صدا = ۴ تایپی (ص۱۵۷)
S7_SCRAMBLES = {1: "must / rules / the / obey / people / traffic / .", 2: "electricity / can / scientists / into / change / wind / ."}
S7_KEYS = {
    ("a", 1): "People must obey the traffic rules.",
    ("p", 1): "The traffic rules must be obeyed by people.",
    ("a", 2): "Scientists can change wind into electricity.",
    ("p", 2): "Wind can be changed into electricity.",
}
SENT_POOL = list(S7_KEYS.values())

def sent_scaffold(key: str) -> list[str]:
    return [key] + [s for s in SENT_POOL if s != key][:3]

LESSON_SENT = {
    "lesson": 52, "title": "جامع درس سوم — جمله‌سازی فعال/مجهول، بنویسید (ص۱۵۷)",
    "level": "آموزشی — ورود آزاد", "count": 4,
    "questions": [
        q_typed("g12-comp3-sent1", 1, f"{S7_SCRAMBLES[1]} — Active: ---------------",
                sent_scaffold(S7_KEYS[("a", 1)]), [S7_KEYS[("a", 1)]], "write the full sentence…"),
        q_typed("g12-comp3-sent2", 2, f"{S7_SCRAMBLES[1]} — Passive: ---------------",
                sent_scaffold(S7_KEYS[("p", 1)]), [S7_KEYS[("p", 1)]], "write the full sentence…"),
        q_typed("g12-comp3-sent3", 3, f"{S7_SCRAMBLES[2]} — Active: ---------------",
                sent_scaffold(S7_KEYS[("a", 2)]), [S7_KEYS[("a", 2)]], "write the full sentence…"),
        q_typed("g12-comp3-sent4", 4, f"{S7_SCRAMBLES[2]} — Passive: ---------------",
                sent_scaffold(S7_KEYS[("p", 2)]), [S7_KEYS[("p", 2)]], "write the full sentence…"),
    ],
}

# ================================================================ S8 — گذشته ساده/کامل: ۴ دوخالی تایپی، کلید چاپی اسلش‌دار (ص۱۵۷)
PT_STEMS = {
    1: f"The meeting was at nine o'clock. When I {BLANK} (arrive) at ten, the meeting {BLANK} (finish).",
    2: f"Sina had just got home when I {BLANK} (phone). He {BLANK} (be) at his mother's house.",
    3: f"We {BLANK} (have) the car for ten years before it {BLANK} (break) down.",
    4: f"We {BLANK} (play) chess after the children {BLANK} (go) to bed.",
}
K_PT = {1: "arrived / had finished", 2: "phoned / had been", 3: "had had / broke", 4: "played / had gone"}
PT_POOL = [K_PT[i] for i in range(1, 5)]

def pt_scaffold(key: str) -> list[str]:
    return [key] + [s for s in PT_POOL if s != key]

LESSON_PT = {
    "lesson": 53, "title": "جامع درس سوم — گذشته ساده/کامل: دوخالی، بنویسید (ص۱۵۷)",
    "level": "آموزشی — ورود آزاد", "count": 4,
    "questions": [q_typed(f"g12-comp3-pt{i}", i, PT_STEMS[i], pt_scaffold(K_PT[i]), [K_PT[i]],
                          "write both verb forms… (e.g. arrived / had finished)") for i in range(1, 5)],
}

# ================================================================ S9 — مرتب‌کردن کلمات: ۲ تایپی (ص۱۵۷)
WO_SCRAMBLES = {
    1: "already / at the party / my friends / I / when / gone / arrived / had / .",
    2: "possible / should / about / be / students / the / harms / informed / .",
}
K_WO = {
    1: "When I arrived at the party my friends had already gone.",
    2: "Students should be informed about the possible harms.",
}
WO_POOL = [K_WO[i] for i in range(1, 3)]

def wo_scaffold(key: str) -> list[str]:
    return [key] + [s for s in WO_POOL if s != key]

LESSON_WO = {
    "lesson": 54, "title": "جامع درس سوم — مرتب‌کردن کلمات، بنویسید (ص۱۵۷)",
    "level": "آموزشی — ورود آزاد", "count": 2,
    "questions": [q_typed(f"g12-comp3-wo{i}", i, WO_SCRAMBLES[i], wo_scaffold(K_WO[i]), [K_WO[i]],
                          "write the complete sentence…") for i in range(1, 3)],
}

# ================================================================ S10 — نقش‌های پاراگراف: ۴ MCQ سه‌گزینه‌ای (ص۱۵۸)
ROLE_OPTIONS = ["Topic sentence", "Supporting sentence", "Concluding sentence"]
ROLE_STEMS = {
    1: "We need water to drink, to wash our bodies and clothes, to cook our food and grow vegetables and fruits.",
    2: "Thus, water is very important to our life and planet.",
    3: "Water is the most essential element in our life.",
    4: "Water is also essential for animals, birds, insects, etc.",
}
K_ROLE = {1: 1, 2: 2, 3: 0, 4: 1}  # Supporting / Concluding / Topic / Supporting — کلید چاپی (3)/(1)/(4)/(2)
LESSON_ROLE = {
    "lesson": 55, "title": "جامع درس سوم — نقش‌های پاراگراف: تست (ص۱۵۸)",
    "level": "استاندارد", "count": 4,
    "questions": [q_mcq(f"g12-comp3-role{i}", i, ROLE_STEMS[i], ROLE_OPTIONS, "abc"[K_ROLE[i]], "abc")
                  for i in range(1, 5)],
}

# ================================================================ S11 — کلوز ۶خالی: ضرب‌المثل‌ها (ص۱۵۸؛ گزینه‌ها معکوس‌چاپ)
CLZ_WINDOWS = {
    1: "One of my favorite Persian (---1---) is “You cannot carry two watermelons in one hand.”",
    2: "(---2---) in English is “Don't bite off more than you can chew.”",
    3: "(---3---) like the first one better",
    4: "because it's a (---4---) metaphor.",
    5: "Whenever I have to decide about a new project, I (---5---) myself trying to carry two watermelons",
    6: "and I stop and think about (---6---) I can handle.",
}
# گزینه‌های چاپی به ترتیب معکوس چاپ شده‌اند (d→a) — نگاشت وفادار به a..d
CLZ_OPTIONS = {
    1: ["conversations", "proverbs", "abbreviations", "barbecues"],
    2: ["It is an equivalent", "Its equivalent", "It has an equivalent", "It's equivalent"],
    3: ["But I", "So I", "But", "So"],
    4: ["fantastic", "concluding", "similar", "confusing"],
    5: ["can be seen", "must be seen", "can see", "must see"],
    6: ["how many works", "how much works", "how many work", "how much work"],
}
K_CLZ = {1: "b", 2: "b", 3: "a", 4: "a", 5: "c", 6: "d"}
LESSON_CLZ = {
    "lesson": 56, "title": "جامع درس سوم — متن ۶خالی: ضرب‌المثل‌ها (ص۱۵۸)",
    "level": "استاندارد", "count": 6,
    "questions": [q_mcq(f"g12-comp3-clz{i}", i, CLZ_WINDOWS[i], CLZ_OPTIONS[i], K_CLZ[i]) for i in range(1, 7)],
}

# ================================================================ S12 — کلوز ۵خالی: انرژی باد (ص۱۵۸؛ گزینه‌ها معکوس‌چاپ)
WND_WINDOWS = {
    1: "Wind is a form of (---1---) energy.",
    2: "This wind flow, or motion energy, when “harvested” by modern wind turbines, (---2---) to generate electricity.",
    3: "Wind turbines (---3---) the kinetic energy in the wind into mechanical power.",
    4: "This (---4---) power can be used for specific tasks (such as grinding grain or pumping water)",
    5: "or a generator can convert this mechanical power into electricity to (---5---) homes, businesses, schools, and the like.",
}
WND_OPTIONS = {
    1: ["cool", "solar", "upset", "rich"],
    2: ["may use", "must be used", "used", "can be used"],
    3: ["present", "count", "convert", "apply"],
    4: ["mechanical", "cool", "solar", "excellent"],
    5: ["waste", "power", "warn", "use up"],
}
K_WND = {1: "b", 2: "d", 3: "c", 4: "a", 5: "b"}
LESSON_WND = {
    "lesson": 57, "title": "جامع درس سوم — متن ۵خالی: انرژی باد (ص۱۵۸)",
    "level": "استاندارد", "count": 5,
    "questions": [q_mcq(f"g12-comp3-wnd{i}", i, WND_WINDOWS[i], WND_OPTIONS[i], K_WND[i]) for i in range(1, 6)],
}

# ================================================================ S13 — ریدینگ دلفین‌ها: ۴ MCQ (ص۱۵۹؛ Q4 معکوس‌چاپ)
LESSON_RD = {
    "lesson": 58, "title": "جامع درس سوم — ریدینگ دلفین‌ها: تست چهارگزینه‌ای (ص۱۵۹)",
    "level": "استاندارد", "count": 4,
    "questions": [
        q_mcq("g12-comp3-rd1", 1, f"It is clear from the passage that dolphins {BLANK}.",
              ["are the most powerful creatures that live in the oceans",
               "don't want to be with us as much as we want to be with them",
               "are proven to be less intelligent than once thought",
               "have a reputation for being friendly to humans"], "d"),
        q_mcq("g12-comp3-rd2", 2,
              f"The fact that the writer of the passage thinks that man can kill dolphins more easily than they can kill us {BLANK}.",
              ["means that they are better adapted to their environment than we are",
               "shows that dolphins have a very sophisticated from of communication",
               "does not mean that we are superior to them",
               "proves that dolphins have linguistic skills far beyond what we previously thought"], "c"),
        q_mcq("g12-comp3-rd3", 3, f"One can understand from the passage that {BLANK}.",
              ["communication is the most fascinating aspect of the dolphins",
               "dolphins have skills that no other living creatures have, such as the ability to think",
               "it is not usual for dolphins to communicate with one another",
               "dolphins have some social traits that are similar to those of humans"], "d"),
        # گزینه‌های چاپی معکوس (d→a): a.complicated/b.strong/c.dedicated/d.reliable — کلید چاپی a
        q_mcq("g12-comp3-rd4", 4, f"In line 3, complex is the synonym of {BLANK}.",
              ["complicated", "strong", "dedicated", "reliable"], "a"),
    ],
}

NEW_LESSONS = [LESSON_VOC, LESSON_COL, LESSON_DEF, LESSON_GRAM, LESSON_PASS,
               LESSON_SENT, LESSON_PT, LESSON_WO, LESSON_ROLE, LESSON_CLZ, LESSON_WND, LESSON_RD]

# ================================================================ داوری دوم — معناییِ مستقل
EXPECTED = {
    "voc": {1: "absorb", 2: "pollute", 3: "demand", 4: "remind", 5: "opposite", 6: "generate", 7: "blow", 8: "common"},
    "col": {1: "c", 2: "d", 3: "a", 4: "e"},
    "def": {1: "replace", 2: "consumption", 3: "pollution", 4: "generation"},
    "gram": {1: "b", 2: "d", 3: "a", 4: "b"},
    "pass": {1: "must be paid", 2: "may be produced", 3: "can be used", 4: "should be informed"},
    "pt": {1: "arrived / had finished", 2: "phoned / had been", 3: "had had / broke", 4: "played / had gone"},
    "clz": {1: "b", 2: "b", 3: "a", 4: "a", 5: "c", 6: "d"},
    "wnd": {1: "b", 2: "d", 3: "c", 4: "a", 5: "b"},
    "rd": {1: "d", 2: "c", 3: "d", 4: "a"},
}
PRINTED = {
    "voc": K_VOC, "col": K_COL, "def": K_DEF, "gram": K_GRAM, "pass": K_PASS,
    "pt": {1: "arrived / had finished", 2: "phoned / had been", 3: "had had / broke", 4: "played / had gone"},
    "clz": K_CLZ, "wnd": K_WND, "rd": {1: "d", 2: "c", 3: "d", 4: "a"},
}
for fam in PRINTED:
    require(PRINTED[fam] == EXPECTED[fam], f"داوری دوم ناهمسان در {fam}")
# نقش‌ها — کلید چاپی: Topic(3) Supporting(1) Supporting(4) Concluding(2)
require([K_ROLE[i] for i in range(1, 5)] == [1, 2, 0, 1], "کلید نقش‌ها ناهمسان با چاپ ص۲۲۶")

# ================================================================ راستی‌آزمایی حضورِ OCR
for i, stem in VOC_STEMS.items():
    require(ocr_has(stem), f"OCR ساقهٔ VOC-{i} نیافت")
for i, stem in DEF_STEMS.items():
    require(ocr_has(stem), f"OCR ساقهٔ DEF-{i} نیافت")
for i, stem in G_STEMS.items():
    require(ocr_has(stem), f"OCR ساقهٔ GRAM-{i} نیافت")
for i, stem in PASS_STEMS.items():
    require(ocr_has(stem), f"OCR ساقهٔ PASS-{i} نیافت")
for i, scr in S7_SCRAMBLES.items():
    require(ocr_has(scr), f"OCR بهم‌ریختهٔ S7-{i} نیافت")
for s in S7_KEYS.values():
    require(ocr_has(s), f"OCR کلید S7 نیافت: {s[:40]}")
for i, stem in PT_STEMS.items():
    require(ocr_has(stem), f"OCR ساقهٔ PT-{i} نیافت")
for i, scr in WO_SCRAMBLES.items():
    require(ocr_has(scr), f"OCR بهم‌ریختهٔ WO-{i} نیافت")
for s in K_WO.values():
    require(ocr_has(s), f"OCR کلید WO نیافت: {s[:40]}")
for i, stem in ROLE_STEMS.items():
    require(ocr_has(stem), f"OCR ساقهٔ ROLE-{i} نیافت")
for i, w in CLZ_WINDOWS.items():
    require(ocr_has(w), f"OCR پنجرهٔ CLZ-{i} نیافت")
    require(w.count("(---") == 1, f"پنجرهٔ CLZ-{i} بیش از یک خالی دارد")
for i, w in WND_WINDOWS.items():
    require(ocr_has(w), f"OCR پنجرهٔ WND-{i} نیافت")
    require(w.count("(---") == 1, f"پنجرهٔ WND-{i} بیش از یک خالی دارد")
# گزینه‌های نمونه‌ای
for w in ["had been captured", "may be seen", "should be done", "may be made", "watermelons", "bite off more than you can chew",
          "kinetic energy in the wind", "grinding grain or pumping water", "have a reputation for being friendly to humans",
          "dolphins have some social traits that are similar to those of humans", "complicated", "reliable"]:
    require(ocr_has(w), f"OCR گزینه/تکهٔ {w[:30]} نیافت")
# سربرگ‌های چاپی
for h in ["A: Vocabulary:", "B: Grammar:", "C: Writing:", "D: Cloze Test:", "E: Reading:"]:
    require(ocr_has(h), f"OCR سربرگ {h} نیافت")
require(ocr_has("Topic sentence:"), "OCR سربرگ نقش‌ها نیافت")
require(ocr_has("Supporting sentence:"), "OCR سربرگ نقش‌ها (Supporting) نیافت")
require(ocr_has("Concluding sentence:"), "OCR سربرگ نقش‌ها (Concluding) نیافت")
# کلید تصویری S1 در OCR ص۲۲۶ — رسیدِ غیبت
require(bool(re.search(r"1\.\s*D\s*\n\s*2\.\s*A\s*\n\s*3\.\s*C\s*\n\s*4\.\s*B", OCR)), "OCR گرید کلید تصویری S1 نیافت")

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
require(next_lesson == 47, f"شمارهٔ درسِ بعدی {next_lesson} است نه ۴۷")
for l in NEW_LESSONS:
    if l["lesson"] != next_lesson:
        print(f"FAIL — ترتیب درس: انتظار {next_lesson}، یافت {l['lesson']}")
        sys.exit(1)
    if l["count"] != len(l["questions"]):
        print(f"FAIL — شمارِ درس {l['lesson']} ناهمسان")
        sys.exit(1)
    data["lessons"].append(l)
    next_lesson += 1

data["source"]["comprehensive3"] = {
    "pages": "156-159",
    "keyPages": "226",
    "titlePrinted": "آزمون جامع تشریحی درس سوم (پاسخنامه صفحه: 226) — «Vision Three»",
    "sections": 13,
    "banks": 12,
    "questions": 53,
    "keys": 53,
    "extractedRound": 291,
    "visualAbsent": {
        "section": 1, "items": 4, "printedKey": "1.D / 2.A / 3.C / 4.B",
        "note": "وابسته به تصویر — بانک ساخته نشد؛ کلید چاپی ص۲۲۶ همین‌جا محفوظ است (الگوی r289/r290)",
    },
    "threeRoles": {
        "section": 10, "items": 4,
        "note": "MCQ سه‌گزینه‌ای — سه نقشِ چاپیِ خودِ تمرین (Topic/Supporting/Concluding)؛ کلید چاپی: Topic(3) Supporting(1) Supporting(4) Concluding(2)",
    },
    "reversedPrint": {
        "sections": "11, 12, 13-4",
        "note": "گزینه‌های سه کلوز به ترتیب معکوس حرف چاپ شده‌اند (d→a)؛ نگاشت وفادار a..d — کلیدهای چاپی حاکم",
    },
    "slashKeys": {
        "section": 8,
        "note": "کلیدهای دوخالی چاپی با « / » — accepted عیناً وفادار به چاپ؛ normalizeTypedAnswer از این راند اسلش را به فاصله نرمال می‌کند",
    },
    "receipts": [
        {"item": "S2-1", "field": "stem", "printed": "Solar cell can", "note": "مفرد چاپی (cell نه cells) — وفادار ماندیم"},
        {"item": "S13-2b", "field": "options.b", "printed": "a very sophisticated from of communication", "note": "غلط چاپی خود جزوه — from به‌جای form؛ وفادار ماندیم"},
        {"item": "S13-2", "field": "stem", "printed": "…than they can kill us ----.", "note": "ساقهٔ دوسطری چاپی در یک خط نگه داشته شد"},
    ],
}

BANK_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(l["count"] for l in data["lessons"])
print(f"OK — lessons now {len(data['lessons'])}, family total {total} (added 53)")
print("ids:", ", ".join(new_ids[:5]), "…", new_ids[-1])
