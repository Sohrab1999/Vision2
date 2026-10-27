#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r298 — آزمون نهایی شهریور ۱۳۹۹ (Vision Three بخش چهارم، ص۲۷۷-۲۸۲؛ Answer key درون‌چاپی ص۲۸۳-۲۸۴)
هفتمین نوبتِ «آزمون‌های نهایی دی ۹۷ تا شهریور ۱۴۰۱» — سربرگِ مواجِ OCR (پروبِ r297: شهریور ۹۹ از PAGE 277).
نوهای راند:
(۱) نخستین نوبتِ خانواده با کلیدِ چاپیِ درون‌جزوهٔ «Answer key» (دو صفحهٔ انتهاییِ خودِ امتحان) به‌جای «راهنمای تصحیح» — پوششِ کاملِ ۵۲/۵۲ آیتمِ شماره‌دار؛ کامل‌ترین نوبتِ خانواده.
(۲) ۵۸ از ۵۲ — شش جملهٔ حرف‌دارِ پاراگرافِ آب (a-f) با نقش‌های جدولِ کلید (c=Topic / a=Concluding / b,d,e,f=Supporting) — دومین راندِ فراتر از شماره‌گذاری (الگوی r296).
(۳) غیبتِ صادقانه: پاراگرافِ بازِ Dr.Mohamad Gharib (کارتِ دادهٔ چاپی) بدونِ کلید — الگوی r296/r297.
(۴) لغزشِ چاپیِ کلیدِ ۲۸ «unseccessfully» (گزینهٔ b بدنه «unsuccessfully» صحیح است) — رسید.
(۵) مکالمهٔ Jack/Kevin (۳۱-۳۴) عینِ خرداد ۹۸ (r293) با دو تفاوت: «special seafood → is served» (مفرد) و کلیدِ تک‌واریانتهٔ «would go» (r293 دودوییِ would/could بود).
(۶) PAGE 285+ امتحانِ رسمیِ سراسریِ دیگری است (aee.medu.ir، تاریخ ۱۳/۰۶/۹۹، OCR تمیز) — نوبتِ راندِ بعدی.
۱۶ بانک / ۵۸ آیتم — خانوادهٔ موضوعی هفدهم: ۹۸۴ + ۵۸ = ۱۰۴۲ تست در ۱۵۳ بانک.
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
    """ساقه با خالیِ میانی: هر نیمه جداگانه راستی‌آزمایی می‌شود (خالیِ درون‌اپ --------------- است)"""
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

# ---------------------------------------------------------------- S1 شنیداری فایل ۱: تست (ص۲۷۷)
s1 = [
    q_mcq("g12-fin99sh-l1m1", 1,
          "The girl doesn't need --------------- because she had bought some before.",
          ["pencils", "dictionaries", "notebooks", "pens"], 3),
    q_mcq("g12-fin99sh-l1m2", 2,
          "The present was a --------------- .",
          ["pen", "pencil", "dictionary"], 2),
    q_mcq("g12-fin99sh-l1m3", 3,
          "The girl got a gift because she had gotten a good --------------- .",
          ["score", "dictionary", "scarf"], 0),
    q_mcq("g12-fin99sh-l1m4", 4,
          "The man thinks the girl is a --------------- student.",
          ["lazy", "busy", "clever", "funny"], 2),
]
# ---------------------------------------------------------------- S2 شنیداری متن‌چاپ: سوپرهیومن (ص۲۷۷) — Part B با شمارهٔ چاپیِ خالی‌ها
s2 = [
    q_typed("g12-fin99sh-pb1", 1,
            "It is said that superhuman has (5) --------------- abilities",
            ["wonderful"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99sh-pb2", 2,
            "He can fly or read people's (6) ---------------",
            ["minds"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99sh-pb3", 3,
            "He may become (7) --------------- or sometimes very strong to help others.",
            ["invisible"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99sh-pb4", 4,
            "Do you like to (8) --------------- a superhuman?",
            ["visit"], "fill in the blank with the missing word…"),
]
# ---------------------------------------------------------------- S3 شنیداری: خودروهای برقی (ص۲۷۷) — Part C
s3 = [
    q_typed("g12-fin99sh-pc1", 1,
            "The needs for Electric cars are increasing in many --------------- countries.",
            ["developed"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99sh-pc2", 2,
            "Electricity is stored in --------------- on the electric cars.",
            ["batteries"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99sh-pc3", 3,
            "Hybrid cars combine the --------------- of gasoline engines and electric motors.",
            ["benefit"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99sh-pc4", 4,
            "Hybrid cars are designed to meet different --------------- , such as better fuel economy or more power.",
            ["goals"], "fill in the blank with the missing word…"),
]
# ---------------------------------------------------------------- S4 واژگان با تصویر (ص۲۷۸) — چهار جملهٔ چاپیِ ۱۳-۱۶، کلیدِ حروفِ تصویر c/b/d/a
PIC_OPTS = [
    "I always use monolingual dictionary to learn vocabulary.",                    # ۱۳ → تصویر c
    "My grandfather feeds the pigeons in the park every morning.",                 # ۱۴ → تصویر b
    "In the opposite of fans, wind turbines use wind to generate electricity.",    # ۱۵ → تصویر d
    "Today some people use shiny panels on the roofs to collect heat.",            # ۱۶ → تصویر a
]
PIC_LETTERS = {1: "c", 2: "b", 3: "d", 4: "a"}  # کلیدِ چاپی: 13.c / 14.b / 15.d / 16.a — بدونِ جملهٔ اضافی
s4 = [
    q_mcq(f"g12-fin99sh-pic{i}", i,
          f"با توجه به تصاویر داده شده، جملهٔ مناسب برای هر تصویر را انتخاب کنید — تصویر ({letter})",
          PIC_OPTS, i - 1)
    for i, letter in PIC_LETTERS.items()
]
# ---------------------------------------------------------------- S5 واژگان: تعریف‌های ستون B (ص۲۷۸) — c اضافهٔ چاپی
DEFB_OPTS = [
    "To put things in a useful order",                    # a
    "To cry suddenly",                                    # b
    "To take something in",                               # c — اضافهٔ چاپی
    "Many different types of things or people",           # d
    "Birds of a feather flock together",                  # e
]
DEFB_STEMS = {
    1: "The people of this city come from a variety of different background.",                     # ۱۷ → d
    2: "People like to spend time with others who are similar to them.",                           # ۱۸ → e
    3: "His books are neatly arranged in alphabetical order.",                                     # ۱۹ → a
    4: "The children burst into tears on hearing of the death of their grandfather.",              # ۲۰ → b
}
DEFB_KEYS = {1: 3, 2: 4, 3: 0, 4: 1}
s5 = [
    q_mcq(f"g12-fin99sh-defb{i}", i, DEFB_STEMS[i], DEFB_OPTS, DEFB_KEYS[i])
    for i in DEFB_STEMS
]
# ---------------------------------------------------------------- S6 واژگان: جای خالی از بانک (ص۲۷۹) — forgive اضافهٔ چاپی
VB_POOL = ["forgive", "cooling", "dedicated", "combination"]
s6 = [
    q_typed("g12-fin99sh-vb1", 1,
            "Wind towers are natural air --------------- systems and can be used instead of electrical air conditioners.",
            ["cooling"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99sh-vb2", 2,
            "Ghasem Soleimani is regarded as a --------------- person because he spared no pains to help people.",
            ["dedicated"], "fill in the blank with the missing word…"),
    q_typed("g12-fin99sh-vb3", 3,
            "As a great artist, he has used a --------------- of paints in his works.",
            ["combination"], "fill in the blank with the missing word…"),
]
for q in s6:
    q["options"] = list(VB_POOL)  # داربست = بانکِ کاملِ چاپی (الگوی r296/r297)
# ---------------------------------------------------------------- S7 واژگان: کامل‌کردن از دانش خود (ص۲۷۹) — حرفِ اولِ چاپی
s7 = [
    q_typed("g12-fin99sh-ok1", 1,
            "A book which you record your thoughts or feelings or what has happened every day is called ad --------------- .",
            ["diary"], "start with the printed first letter d…"),
    q_typed("g12-fin99sh-ok2", 2,
            "Nowadays d --------------- for organic food is increasing.",
            ["demand"], "start with the printed first letter d…"),
    q_typed("g12-fin99sh-ok3", 3,
            "Plants a --------------- carbon dioxide from the air.",
            ["absorb"], "start with the printed first letter a…"),
]
# ---------------------------------------------------------------- S8 گرامر: تست چهارگزینه‌ای (ص۲۷۹)
s8 = [
    q_mcq("g12-fin99sh-g1", 1,
          "The police caught the one --------------- was entering into my flat.",
          ["which", "when", "who", "whose"], 2),
    q_mcq("g12-fin99sh-g2", 2,
          "The team had a football match, but it finished --------------- .",
          ["success", "unsuccessfully", "succeed", "unsuccessful"], 1),
    q_mcq("g12-fin99sh-g3", 3,
          "Alcohol --------------- by an Iranian scientist called Razi many years ago.",
          ["was discovering", "was discovered", "has discovered", "had discovered"], 1),
    q_mcq("g12-fin99sh-g4", 4,
          "My parents bought a ball for my brother because he --------------- his in the park.",
          ["to lose", "had lost", "was lost", "would lose"], 1),
]
# ---------------------------------------------------------------- S9 شکل صحیح فعل در مکالمه (ص۲۷۹) — عینِ مکالمهٔ خرداد ۹۸ (r293) با دو تفاوت
VF_POOL = ["seems", "had decided", "would go", "is served"]
VF_STEMS = {
    1: ("It (31) --------------- rather cold today, doesn't it? (to seem)", "seems"),
    2: ("I (32) --------------- to go swimming before I left home. (to decide)", "had decided"),
    3: ("If it were fine, we (33) --------------- swimming today. (to go)", "would go"),
    4: ("I know a restaurant in which special seafood (34) --------------- (to serve)", "is served"),
}
s9 = []
for i, (stem, key) in VF_STEMS.items():
    q = q_typed(f"g12-fin99sh-vf{i}", i, stem, [key], "write the correct form of the verb…")
    q["options"] = [key] + [w for w in VF_POOL if w != key]  # سرِ accepted نخست (الگوی r293)
    s9.append(q)
# ---------------------------------------------------------------- S10 مرتب‌کردن کلمات (ص۲۸۰)
s10 = [
    q_typed("g12-fin99sh-wo1", 1,
            "if/ could / he / a car/ my uncle /his driving test / passed/ drive.",
            ["If my uncle passed his driving test, he could drive a car."],
            "write the full sentence in the correct order…"),
    q_typed("g12-fin99sh-wo2", 2,
            "my mother/ this / the golden watch / is / which/ to buy/ wants/.",
            ["My mother wants to buy this, which is the golden watch."],
            "write the full sentence in the correct order…"),
]
# ---------------------------------------------------------------- S11 ریدینگ محیط‌زیست: تست + درست/نادرست (ص۲۸۰)
s11 = [
    q_mcq("g12-fin99sh-rd1m1", 1,
          "The main idea of this passage is ....",
          ["a number of animals and plants are becoming extinct",
           "animals and plants extinction are happening at very high speed",
           "an increase in most forms of environmental population",
           "extinction is happening at a much higher rate, not the number that people think"], 2),
    q_mcq("g12-fin99sh-rd1m2", 2,
          "The scientists who wrote the book 'The limits to Growth' believed that energy and other natural resources --------------- .",
          ["are endless", "would soon be used", "are more than they were in the past", "disappear quickly"], 2),
    q_tf("g12-fin99sh-rd1tf1", 3,
         "According to environmentalists, energy and natural resources are not disappearing.", 1),
    q_tf("g12-fin99sh-rd1tf2", 4,
         "Scientists believe that animals and plants are becoming extinct at lower rate.", 0),
]
# ---------------------------------------------------------------- S12 ریدینگ محیط‌زیست: پرسش پاسخ (ص۲۸۰)
s12 = [
    q_typed("g12-fin99sh-rd1t1", 1, "What do environmentalists think about the world?",
            ["They think that the world seems to be getting worse."],
            "answer in a complete sentence…"),
    q_typed("g12-fin99sh-rd1t2", 2, "What do the scientists believe about energy and natural resources?",
            ["They believe that energy and natural resources have become more than they were in the past."],
            "answer in a complete sentence…"),
]
# ---------------------------------------------------------------- S13 ریدینگ نوزاد: تست + درست/نادرست (ص۲۸۱)
s13 = [
    q_mcq("g12-fin99sh-rd2m1", 1,
          "The only way of communication for a newborn baby is --------------- .",
          ["his facial expressions", "crying", "saying difficult words", "gestures"], 1),
    q_mcq("g12-fin99sh-rd2m2", 2,
          "The word \"act\" is closest in meaning to --------------- .",
          ["remind", "copy", "change", "respect"], 1),
    q_tf("g12-fin99sh-rd2tf1", 3, "The first child's words are very simple.", 0),
    q_tf("g12-fin99sh-rd2tf2", 4, "Parents' gestures are also difficult to practice.", 1),
]
# ---------------------------------------------------------------- S14 ریدینگ نوزاد: پرسش پاسخ (ص۲۸۱)
s14 = [
    q_typed("g12-fin99sh-rd2t1", 1, "How can a baby show his feelings?",
            ["A baby can show his feeling by crying."],
            "answer in a complete sentence…"),
    q_typed("g12-fin99sh-rd2t2", 2, "What does a child do when he gets older?",
            ["When he gets older he can choose proper words and expressions to say what he wants."],
            "answer in a complete sentence…"),
]
# ---------------------------------------------------------------- S15 کلمات ربط (ص۲۸۲) — استخرِ بستهٔ چهارکلیدی {and, so, or, but}
CONN_POOL = ["and", "so", "or", "but"]
CONN_KEYS = {1: "and", 2: "so", 3: "or", 4: "but"}  # کلید چاپی: 49. and / 50. so / 51. or / 52. but
s15 = [
    q_typed(f"g12-fin99sh-conn{i}", i, stem, [CONN_KEYS[i]],
            "connect the sentences with and, or, but, so…")
    for i, stem in enumerate((
        "They went to the park yesterday, --------------- they had a wonderful time.",   # ۴۹
        "These shoes aren't comfortable, --------------- I rarely wear them.",           # ۵۰
        "You can buy a car, --------------- you can save your money.",                   # ۵۱
        "She loves apples, --------------- she hates bananas.",                          # ۵۲
    ), start=1)
]
for q in s15:
    q["options"] = list(CONN_POOL)  # داربست = استخرِ بستهٔ چهارکلیدی (الگوی r293-r296)
# ---------------------------------------------------------------- S16 نقش‌های پاراگراف آب (ص۲۸۲) — شش جملهٔ حرف‌دار a-f با جدولِ کلید
ROLE_OPTIONS = ["Topic sentence", "Supporting sentence", "Concluding sentence"]
ROLE_SENTS = {
    1: "Thus, water is very important to our life and our planet.",                                    # a → Concluding
    2: "But also the wild life is going to extinct without it.",                                       # b → Supporting
    3: "Water is the most essential element in our life.",                                             # c → Topic
    4: "We need water to drink, to wash, to cook and to grow vegetables and fruits.",                  # d → Supporting
    5: "Not only human will die without water.",                                                       # e → Supporting
    6: "Water is also essential for animals, birds, insects, etc",                                     # f → Supporting
}
K_ROLE = {1: 2, 2: 1, 3: 0, 4: 1, 5: 1, 6: 1}  # جدولِ کلید ص۲۸۴: c=Topic / a=Concluding / b,d,e,f=Supporting
s16 = [
    q_mcq(f"g12-fin99sh-role{i}", i, ROLE_SENTS[i], ROLE_OPTIONS, K_ROLE[i])
    for i in ROLE_SENTS
]

BANKS = [
    (138, "نهایی شهریور ۹۹ — شنیداری فایل ۱: تست (ص۲۷۷)", "استاندارد", s1),
    (139, "نهایی شهریور ۹۹ — شنیداری متن‌چاپ: سوپرهیومن، کامل کنید (ص۲۷۷)", "آموزشی — ورود آزاد", s2),
    (140, "نهایی شهریور ۹۹ — شنیداری: خودروهای برقی، کامل کنید (ص۲۷۷)", "آموزشی — ورود آزاد", s3),
    (141, "نهایی شهریور ۹۹ — واژگان با تصویر: جملهٔ مناسب هر تصویر (ص۲۷۸)", "استاندارد", s4),
    (142, "نهایی شهریور ۹۹ — واژگان: تعریف‌های ستون B (ص۲۷۸)", "استاندارد", s5),
    (143, "نهایی شهریور ۹۹ — واژگان: جای خالی از بانک (ص۲۷۹)", "آموزشی — ورود آزاد", s6),
    (144, "نهایی شهریور ۹۹ — واژگان: کامل‌کردن از دانش خود (ص۲۷۹)", "آموزشی — ورود آزاد", s7),
    (145, "نهایی شهریور ۹۹ — گرامر: تست چهارگزینه‌ای (ص۲۷۹)", "استاندارد", s8),
    (146, "نهایی شهریور ۹۹ — شکل صحیح فعل در مکالمه (ص۲۷۹)", "آموزشی — ورود آزاد", s9),
    (147, "نهایی شهریور ۹۹ — مرتب‌کردن کلمات، بنویسید (ص۲۸۰)", "آموزشی — ورود آزاد", s10),
    (148, "نهایی شهریور ۹۹ — ریدینگ محیط‌زیست: تست + درست/نادرست (ص۲۸۰)", "استاندارد", s11),
    (149, "نهایی شهریور ۹۹ — ریدینگ محیط‌زیست: پرسش پاسخ (ص۲۸۰)", "آموزشی — ورود آزاد", s12),
    (150, "نهایی شهریور ۹۹ — ریدینگ نوزاد: تست + درست/نادرست (ص۲۸۱)", "استاندارد", s13),
    (151, "نهایی شهریور ۹۹ — ریدینگ نوزاد: پرسش پاسخ (ص۲۸۱)", "آموزشی — ورود آزاد", s14),
    (152, "نهایی شهریور ۹۹ — کلمات ربط، کامل کنید (ص۲۸۲)", "آموزشی — ورود آزاد", s15),
    (153, "نهایی شهریور ۹۹ — نقش‌های پاراگراف آب: تست (ص۲۸۲)", "استاندارد", s16),
]

# قطعات OCR ویژه (ساقه‌هایی که بازسازیِ تمیز دارند — رسید در source)
s_special_ocr = {
    "g12-fin99sh-g3": ["Alcohol", "by an Iranian scientist called Razi many years ago"],  # نقطهٔ سرگردانِ چاپِ «Alcohol.» حذف شد
    "g12-fin99sh-vb3": ["As a great artist, he has used a", "of paints in his works"],    # «.As» و « .» چاپی حذف شد
}

# ================================================================ راستی‌آزماییِ OCR (وفاداریِ بدنه)
for lid, _title, _level, qs in BANKS:
    for q in qs:
        if q["id"] in s_special_ocr:
            for frag in s_special_ocr[q["id"]]:
                require(ocr_has(frag), f"fragment not in OCR: {q['id']} :: {frag[:60]}")
        elif q["question"].startswith("با توجه به"):
            pass  # دستورالعملِ فارسیِ درون‌اپ — الگوی r296/r297؛ گزینه‌ها جداگانه راستی‌آزمایی می‌شوند
        elif q["id"].startswith("g12-fin99sh-role"):
            require(ocr_has(q["question"]), f"OCR جملهٔ ROLE {q['id']} نیافت")  # گزینه‌های نقش، برچسبِ درون‌اپ‌اند (الگوی r294)
        else:
            require(ocr_has_stem(q["question"]), f"stem not in OCR: {q['id']} :: {q['question'][:70]}")
        if q.get("kind") == "mcq" and q["options"] not in (["True", "False"],) and not q["id"].startswith("g12-fin99sh-role"):
            for opt in q["options"]:
                require(ocr_has(opt), f"option not in OCR: {q['id']} :: {opt[:60]}")

# کلیدهای چاپیِ «Answer key» (ص۲۸۳-۲۸۴) — راستی‌آزماییِ قطعه‌کلیدها
GUIDE_FRAGMENTS = [
    "1. d", "2. c", "3. a", "4. c",
    "5. wonderful", "6. minds", "7. invisible", "8. visit",
    "9. developed", "10. batteries", "11. benefit", "12. goals",
    "13. c", "14. b", "15. d", "16. a",
    "17. d", "18. e", "19. a", "20. b",
    "21. cooling", "22. dedicated", "23. combination",
    "24. diary", "25. demand", "26. absorb",
    "27. who", "28. unseccessfully", "29. was discovered", "30. had lost",
    "31. seems", "32. had decided", "33. would go", "34. is served",
    "35. If my uncle passed his driving test, he could drive a car.",
    "36. My mother wants to buy this, which is the golden watch.",
    "37. c", "38. c", "39. False", "40. True",
    "41. They think that the world seems to be getting worse.",
    "42. They believe that energy and natural resources have become more than",
    "43. b", "44. b", "45. True", "46. False",
    "47. A baby can show his feeling by crying.",
    "48. When he gets older he can choose proper words and expressions to say",
    "49. and", "50. so", "51. or", "52. but",
    "c: Topic sentence", "d: supporting", "e: supporting", "f: supporting", "b: supporting", "a: concluding",
]
for frag in GUIDE_FRAGMENTS:
    require(ocr_has(frag), f"answer-key fragment not in OCR: {frag[:60]}")

# رسیدهای لغزشِ چاپ و غیبتِ صادقانه
require(ocr_has("unseccessfully"), "guard: key 28 prints the typo 'unseccessfully' (body option b 'unsuccessfully' is the correct spelling)")
require(ocr_has("special seafood"), "anchor: singular 'special seafood' → is served (contrast with r293 'a variety of sea foods → are served')")
require(ocr_has("Dr.Mohamad Gharib"), "absence receipt: Dr.Mohamad Gharib data card has no printed key")
require(ocr_has("Good Luck"), "anchor: 'Good Luck' ends the exam at p282")
require(ocr_has("topic sentence, supporting sentences,"), "anchor: water-paragraph role instruction (p282)")

# ================================================================ داوریِ دومِ مستقل (معناییِ کلیدها — مستقل از گذرِ نخست)
SECOND = [
    ("g12-fin99sh-l1m1", "d", ocr_has("d) pens")),
    ("g12-fin99sh-l1m2", "c", ocr_has("c) dictionary")),
    ("g12-fin99sh-l1m3", "a", ocr_has("a) score")),
    ("g12-fin99sh-l1m4", "c", ocr_has("c) clever")),
    ("g12-fin99sh-pb1", "wonderful", ocr_has("5. wonderful")),
    ("g12-fin99sh-pb2", "minds", ocr_has("6. minds")),
    ("g12-fin99sh-pb3", "invisible", ocr_has("7. invisible")),
    ("g12-fin99sh-pb4", "visit", ocr_has("8. visit")),
    ("g12-fin99sh-pc1", "developed", ocr_has("9. developed")),
    ("g12-fin99sh-pc2", "batteries", ocr_has("10. batteries")),
    ("g12-fin99sh-pc3", "benefit", ocr_has("11. benefit")),
    ("g12-fin99sh-pc4", "goals", ocr_has("12. goals")),
    ("g12-fin99sh-pic1", "c", ocr_has("13. c")),
    ("g12-fin99sh-pic2", "b", ocr_has("14. b")),
    ("g12-fin99sh-pic3", "d", ocr_has("15. d")),
    ("g12-fin99sh-pic4", "a", ocr_has("16. a")),
    ("g12-fin99sh-defb1", "d", ocr_has("17. d")),
    ("g12-fin99sh-defb2", "e", ocr_has("18. e")),
    ("g12-fin99sh-defb3", "a", ocr_has("19. a")),
    ("g12-fin99sh-defb4", "b", ocr_has("20. b")),
    ("g12-fin99sh-vb1", "cooling", ocr_has("21. cooling")),
    ("g12-fin99sh-vb2", "dedicated", ocr_has("22. dedicated")),
    ("g12-fin99sh-vb3", "combination", ocr_has("23. combination")),
    ("g12-fin99sh-ok1", "diary", ocr_has("24. diary")),
    ("g12-fin99sh-ok2", "demand", ocr_has("25. demand")),
    ("g12-fin99sh-ok3", "absorb", ocr_has("26. absorb")),
    ("g12-fin99sh-g1", "c", ocr_has("27. who")),
    ("g12-fin99sh-g2", "b", ocr_has("28. unseccessfully")),
    ("g12-fin99sh-g3", "b", ocr_has("29. was discovered")),
    ("g12-fin99sh-g4", "b", ocr_has("30. had lost")),
    ("g12-fin99sh-vf1", "seems", ocr_has("31. seems")),
    ("g12-fin99sh-vf2", "had decided", ocr_has("32. had decided")),
    ("g12-fin99sh-vf3", "would go", ocr_has("33. would go")),
    ("g12-fin99sh-vf4", "is served", ocr_has("34. is served")),
    ("g12-fin99sh-wo1", "If my uncle passed his driving test, he could drive a car.", ocr_has("35. If my uncle passed his driving test, he could drive a car.")),
    ("g12-fin99sh-wo2", "My mother wants to buy this, which is the golden watch.", ocr_has("36. My mother wants to buy this, which is the golden watch.")),
    ("g12-fin99sh-rd1m1", "c", ocr_has("37. c")),
    ("g12-fin99sh-rd1m2", "c", ocr_has("38. c")),
    ("g12-fin99sh-rd1tf1", "b", ocr_has("39. False")),
    ("g12-fin99sh-rd1tf2", "a", ocr_has("40. True")),
    ("g12-fin99sh-rd1t1", "They think that the world seems to be getting worse.", ocr_has("41. They think that the world seems to be getting worse.")),
    ("g12-fin99sh-rd1t2", "They believe that energy and natural resources have become more than they were in the past.", ocr_has("42. They believe that energy and natural resources have become more than")),
    ("g12-fin99sh-rd2m1", "b", ocr_has("43. b")),
    ("g12-fin99sh-rd2m2", "b", ocr_has("44. b")),
    ("g12-fin99sh-rd2tf1", "a", ocr_has("45. True")),
    ("g12-fin99sh-rd2tf2", "b", ocr_has("46. False")),
    ("g12-fin99sh-rd2t1", "A baby can show his feeling by crying.", ocr_has("47. A baby can show his feeling by crying.")),
    ("g12-fin99sh-rd2t2", "When he gets older he can choose proper words and expressions to say what he wants.", ocr_has("48. When he gets older he can choose proper words and expressions to say")),
    ("g12-fin99sh-conn1", "and", ocr_has("49. and")),
    ("g12-fin99sh-conn2", "so", ocr_has("50. so")),
    ("g12-fin99sh-conn3", "or", ocr_has("51. or")),
    ("g12-fin99sh-conn4", "but", ocr_has("52. but")),
    ("g12-fin99sh-role3", "Topic", ocr_has("c: Topic sentence")),
    ("g12-fin99sh-role1", "Concluding", ocr_has("a: concluding")),
    ("g12-fin99sh-role2", "Supporting", ocr_has("b: supporting")),
    ("g12-fin99sh-role4", "Supporting", ocr_has("d: supporting")),
    ("g12-fin99sh-role5", "Supporting", ocr_has("e: supporting")),
    ("g12-fin99sh-role6", "Supporting", ocr_has("f: supporting")),
]
ALL_QS = [q for _lid, _t, _lv, qs in BANKS for q in qs]
ROLE_LABELS = {"Topic": 0, "Supporting": 1, "Concluding": 2}
PIC_MAP = {"g12-fin99sh-pic1": "c", "g12-fin99sh-pic2": "b", "g12-fin99sh-pic3": "d", "g12-fin99sh-pic4": "a"}
for qid, letter, sem_ok in SECOND:
    require(sem_ok, f"second judgement failed: {qid} [{letter}]")
    q = next(x for x in ALL_QS if x["id"] == qid)
    if qid in PIC_MAP:
        require(PIC_MAP[qid] == letter, f"{qid}: picture letter {PIC_MAP[qid]} != guide {letter}")  # حروفِ تصویرند نه گزینه
    elif qid.startswith("g12-fin99sh-role"):
        require(q["answer"] == ROLE_LABELS[letter], f"{qid}: answer {q['answer']} != role label {letter}")
    elif q["kind"] == "mcq":
        require(q["answer"] == "abcde".index(letter), f"{qid}: answer {q['answer']} != guide letter {letter}")
    else:
        require(q["accepted"][0].lower() == letter.lower(), f"{qid}: accepted {q['accepted'][0][:40]!r} != key {letter!r}")

# ================================================================ تزریق (idempotent — خروجیِ ناقصِ رانِ قبلی پاک می‌شود)
data = json.loads(BANK_PATH.read_text(encoding="utf-8"))
data["lessons"] = [l for l in data["lessons"] if l["lesson"] < 138]
data["source"].pop("final99sh", None)
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

require(data["lessons"][-1]["lesson"] == 137, f"family tail is {data['lessons'][-1]['lesson']}, expected 137")
require([l["lesson"] for l in new_lessons] == list(range(138, 154)), "lesson numbers must be 138..153")
require(total_new == 58, f"total new items {total_new} != 58")

data["lessons"].extend(new_lessons)

data["source"]["final99sh"] = {
    "pages": "277-282",
    "keyPages": "283-284 (Answer key درون‌چاپیِ دو صفحهٔ انتهاییِ خودِ امتحان)",
    "titlePrinted": "آزمون نهایی انگلیسی دوازدهم — نوبت شهریورماه ۱۳۹۹ (Vision Three؛ سربرگِ مواجِ OCR — تاریخِ امتحان بازخوانی‌ناپذیر است) — هفتمین نوبتِ خانواده",
    "sections": 14,
    "banks": 16,
    "questions": 58,
    "keys": 58,
    "extractedRound": 298,
    "inlineAnswerKey": "نخستین نوبتِ خانواده با کلیدِ چاپیِ درون‌جزوهٔ «Answer key» به‌جای «راهنمای تصحیح» — پوششِ کاملِ ۵۲/۵۲ آیتمِ شماره‌دار + جدولِ نقشِ پاراگرافِ آب (a-f) — کامل‌ترین نوبتِ خانواده",
    "beyondNumbering": "۵۸ از ۵۲: شش جملهٔ حرف‌دارِ پاراگرافِ آب با نقش‌های جدولِ کلید (الگوی r296 — دومین راندِ فراتر از شماره‌گذاری)",
    "audioAbsent": {"files": "سه فایلِ صوتیِ چاپی (Audio file MP3/PDF)", "reason": "فایل صوتی در جزوه نیست — اما هر ۱۲ آیتمِ شنیداری ساقهٔ چاپیِ کامل دارند (سومین نوبتِ متوالی — الگوی r296/r297)"},
    "openWritingAbsent": {"items": "پاراگرافِ بازِ Dr.Mohamad Gharib — کارتِ دادهٔ چاپی Name: Dr.Mohamad Gharib / Born: July 5, 1909, Tehran / Died: January 20, 1975, Tehran / Nationality: Iranian / Education: University of Paris / Job: Physician, university professor + «Good Luck» (ص۲۸۲)", "reason": "بدونِ کلیدِ چاپی در Answer key — الگوی r296 بخش ۱۷ / r297 بخش ۱۶د"},
    "receipts": [
        "لغزشِ چاپیِ کلیدِ ۲۸ «unseccessfully» — غلطِ املاییِ چاپ؛ گزینهٔ b بدنه «unsuccessfully» صحیح است و کلیدِ حاکم همان است — رسیدِ لغزش",
        "مکالمهٔ Jack/Kevin (۳۱-۳۴) عینِ مکالمهٔ خرداد ۹۸ (r293) است — سرِ ساقه تکراریِ عمدی (گاردِ برخورد شناسه‌محور، درس r295)؛ دو تفاوت: «special seafood → is served» (مفرد؛ r293 «a variety of sea foods → are served») و کلیدِ تک‌واریانتهٔ «would go» (r293 دودوییِ would/could بود — کلیدِ چاپیِ این نوبت حاکم است)",
        "نقطهٔ سرگردانِ چاپِ ۲۹ («Alcohol. …») و «.As» / « .» چاپیِ ۲۳ در ساقهٔ درون‌اپ حذف شد — رسیدِ بازسازیِ تمیز",
        "ساقهٔ ۲۴ «is called ad ……» = حرفِ تعریفِ «a» + حرفِ اولِ چاپیِ «d» — درون‌اپ وفادار ماند («is called ad ---------------»)",
        "املای چاپیِ وفادار: «come from a variety of different background» (مفرد، ۱۷)، «In the opposite of fans» (۱۵)، «The needs for Electric cars» (E بزرگ، ۹)، «meet different --------------- , such as» (فاصلهٔ پیش از ویرگول، ۱۲)، «at lower rate» (۴۰)، «the wild life is going to extinct» (جملهٔ b آب)، «his feeling» مفرد در کلیدِ ۴۷، «extinction is happening at a much higher rate, not the number that people think» (گزینهٔ d آیتم ۳۷)",
        "«environmental population» در متن و گزینهٔ ۳۷ عینِ چاپ است (خطای چاپیِ «pollution») — وفادار",
        "استخرِ کلمات ربط بستهٔ چهارکلیدی {and, so, or, but} — دستورالعملِ فارسیِ بدنه مواج است؛ کلیدها: ۴۹. and / ۵۰. so / ۵۱. or / ۵۲. but",
        "پاراگرافِ آب: جدولِ کلید (c: Topic sentence / d,f,e,b: supporting / a: concluding) — ترتیبِ درون‌اپ natural a-f است؛ ترتیبِ چاپِ جدول (c/d/f/e/b/a) در رسید محفوظ",
        "واژگان تصویری ۱۳-۱۶: چهار جمله با چهار تصویر، بدونِ جملهٔ اضافی — کلیدِ حروفِ تصویر c/b/d/a (r297 پنج‌گزینه‌ای با اضافهٔ c بود)",
        "تاریخِ امتحان در سربرگِ مواجِ OCR بازخوانی‌ناپذیر است — هویتِ نوبت از پروبِ سربرگِ r297 حاکم است (شهریور ۹۹ از PAGE 277)",
        "PAGE 285+ امتحانِ رسمیِ سراسریِ دیگری است (مرکز سنجش aee.medu.ir، در نوبت شهریورماه ۱۳۹۹، تاریخ ۱۳/۰۶/۹۹، همهٔ رشته‌ها، ۶ صفحه، OCR تمیز) — واریانتِ رسمیِ همان شهریور ۹۹ و نوبتِ راندِ بعدی",
        "متنِ دو ریدینگ (محیط‌زیست/نوزاد) درون‌اپ حمل نشد (الگوی r289-r297) — تصویر صفحه در کتابخانهٔ جزوه در دسترس است؛ ساقه‌ها خودبسنده‌اند",
        "پیوستِ شنیداری: زیرنویسِ «Audio file (MP3) / Audio file (PDF) / Audio script (PDF)» در ص۲۷۷ و ۲۸۵ چاپ شده — فایل‌ها در جزوه نیستند",
    ],
}

BANK_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

print(f"injected {len(new_lessons)} banks / {total_new} items; family now {len(data['lessons'])} banks / {sum(l['count'] for l in data['lessons'])} tests")
if failures:
    print("FAILURES:")
    for f in failures:
        print(" -", f)
    sys.exit(1)
print("all OCR fidelity + second-judgement checks passed")
