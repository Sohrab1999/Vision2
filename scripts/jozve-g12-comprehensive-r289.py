#!/usr/bin/env python3
r"""jozve-g12-comprehensive-r289.py — آزمون جامع تشریحی درس اول (ص۵۵-۵۸، کلید ص۱۹۵-۱۹۶)

بزرگ‌ترین مسیرِ باقی‌ماندهٔ درس اول: آزمون جامع با ۱۴ بخش چاپی — A: واژگان (۱-۴)
/ B: گرامر (۵-۸) / C: نگارش (۹-۱۱) / D: کلوز (۱۲) / E: ریدینگ (۱۳-۱۴).

بخش‌بندیِ استخراج (۱۳ بانک / ۵۹ آیتم از ۶۳ آیتم چاپی):
- بخش ۱ «Match the pictures» (۴ آیتم) وابسته به تصویر است — غیبتِ صادقانه؛ کلید چاپی
  1.D/2.C/3.B/4.A فقط در رسیدِ source.comprehensive ثبت می‌شود (بانک ساخته نمی‌شود).
- بخش ۳ «ترکیب‌ها» ۵ گزینهٔ چاپی دارد (a-e) — وفادار به چاپ؛ انحرافِ مستند از ۴گزینه.
- بخش ۱۳ دو پرسشِ بازِ تایپی (کلید جملهٔ کامل ص۱۹۶) + یک متعرّف + دو درست/نادرست.
- S13-5 «All people feel…» کلید چاپی a=True محفوظ + رسیدِ تنشِ معنایی.

نکته‌های چاپی:
- داربستِ تایپی‌ها از استخرِ بستهٔ خودِ بخش است (بانک واژگان ۹تایی/۵تایی، تگ‌ها،
  مجهول‌ها، جمله‌ها، {and,or,but,so}، بانک کلوز ۶تایی) — هیچ داربست بیرون از استخر.
- fild placeholder (r289): راهنمای ورودیِ وابسته به بخش — بانک/تعریف/مجهول/جمله/مرتب‌سازی.
- بدنهٔ آزمون جامع ترجمهٔ چاپی ندارد — غیبتِ صادقانه.
خروجی: درس‌های ۲۴-۳۶ در public/jozve/grammar-g12-topic.json — خانواده: ۳۶ بانک / ۵۷۴ تست.
"""
import json
import re

ROOT = "/home/z/my-project"
TXT = f"{ROOT}/booklet-extract/g12.txt"
OUT = f"{ROOT}/public/jozve/grammar-g12-topic.json"

PERSIAN = re.compile(r"[\u0600-\u06FF]")
BLANK = "-" * 15

raw = open(TXT, encoding="utf-8").read()
pages = {}
for m in re.finditer(r"<<<PAGE (\d+)>>>\n", raw):
    start = m.end()
    nxt = re.search(r"<<<PAGE \d+>>>\n", raw[start:])
    end = start + nxt.start() if nxt else len(raw)
    pages[int(m.group(1))] = raw[start:end]


def norm(s: str) -> str:
    """نرمال‌سازیِ دوطرفه برای راستی‌آزماییِ حضورِ ساقه در OCR"""
    s = s.replace("’", "'").replace("‘", "'").replace("`", "'").replace("´", "'")
    s = re.sub(r"\(\s*\)", " ", s)          # خانهٔ پاسخِ چاپی «(     )»
    s = re.sub(r"\s+", " ", s)
    s = re.sub(r"\s+([.,?!:;])", r"\1", s)  # فاصلهٔ پیش از نقطه‌گذاری — آرتیفکت OCR
    s = re.sub(r"-{4,}", BLANK, s)          # خالی کانونی یکنواخت
    return s.strip()


EXAM_NORM = norm(" ".join(pages[p] for p in (55, 56, 57, 58)))
KEY_NORM = norm(" ".join(pages[p] for p in (195, 196)))
receipts = []


def ocr_has(text: str, where: str, label: str) -> None:
    assert text in where, f"[{label}] در {('OCR آزمون' if where is EXAM_NORM else 'OCR کلید')} یافت نشد:\n  {text[:120]}"


# ================= دادهٔ وفادار به چاپ — راستی‌آزمایی‌شده با OCR + داوری معنایی =================

# --- بخش ۲ (درس ۲۴): بانک ۹تایی، calmly اضافه ---
S2_BANK = ["boosts", "forgive", "failures", "calmly", "advice", "honored", "temperature", "dedicated", "shared"]
S2_STEMS = {
    1: "Our parents have a lot to share with us like their experiences and ---------------.",
    2: "I believe he was an honorable man, --------------- to the people and his union.",
    3: "I may --------------- myself for the accident, but it is very difficult to forget.",
    4: "It is believed that hugging your child --------------- the level of happiness.",
    5: "Taking people's --------------- can help them fight the corona virus.",
    6: "Listening to the --------------- of older people improves our lives.",
    7: "My sister --------------- her food among the poor children.",
    8: "Elders feel --------------- when we appreciate them.",
}
S2_KEYS = {1: "failures", 2: "dedicated", 3: "forgive", 4: "boosts",
           5: "temperature", 6: "advice", 7: "shared", 8: "honored"}

# --- بخش ۳ (درس ۲۵): ۵ گزینهٔ چاپی a-e — کلید c/e/a/b؛ d.meal اضافه ---
S3_STEMS = {1: "fast", 2: "strong", 3: "native", 4: "take"}
S3_OPTIONS = ["speakers", "temperature", "food", "meal", "wind"]  # a..e به ترتیب چاپ
S3_KEYS = {1: "c", 2: "e", 3: "a", 4: "b"}  # fast food / strong wind / native speakers / take temperature

# --- بخش ۴ (درس ۲۶): بانک ۵تایی، regard اضافه ---
S4_STEMS = {
    1: "To hold someone close to your body with your arms, usually to show that you like, love, or value them:",
    2: "A long, soft seat with a back and usually arms, on which more than one person can sit at the same time:",
    3: "A book in which you record your thoughts or feelings or what has happened each day:",
    4: "Used to describe a respected and admired person, or their work:",
}
S4_KEYS = {1: "hug", 2: "sofa", 3: "diary", 4: "distinguished"}

# --- بخش ۵ (درس ۲۷): MCQ مجهول — کلید a/b/d/a ---
S5 = [
    ("There was a fire at the hotel last week. Two of the rooms ---------------.",
     ["were damaged", "have damaged", "was damaged", "were damaging"], 0),
    ("My little brothers --------------- to school by my mother every day.",
     ["take", "are taken", "have taken", "was taken"], 1),
    ("He --------------- to use the car whenever he needs to do his business.",
     ["allows", "allowed", "is allowing", "is allowed"], 3),
    ("There is a new building in the neighborhood. The workers --------------- it very well.",
     ["have built", "are built", "were built", "have been built"], 0),
]

# --- بخش ۶ (درس ۲۸): تگ — کلید چاپی ص۱۹۵ ---
S6_STEMS = {
    1: "Your father won't sell his car, ---------------?",
    2: "The woman was weaving a rug, ---------------?",
    3: "He never speaks Persian in our class, ---------------?",
    4: "His sister has passed her driver's test, ---------------?",
}
S6_KEYS = {1: "will he", 2: "wasn't she", 3: "does he", 4: "hasn't she"}

# --- بخش ۷ (درس ۲۹): مجهول‌سازی سه‌زمان با فعل راهنما ---
S7_STEMS = {
    1: "Penicillin --------------- by Alexander Fleming. (discover)",
    2: "My car ---------------! I'm going to call the police. (steal)",
    3: "Emotions and ethics --------------- in Ghazals a lot. (use)",
    4: "The windows --------------- by them last night. (break)",
}
S7_KEYS = {1: "was discovered", 2: "has been stolen", 3: "are used", 4: "were broken"}

# --- بخش ۸ (درس ۳۰): جمله‌سازی معلوم/مجهول از کلمات بهم‌ریخته — دو جفت ---
S8_SCRAMBLES = {1: "makes / morning / pancakes / my mother / every / .",
                2: "repaired / the mechanics / the cars / have / ."}
S8_KEYS = {1: "My mother makes pancakes every morning.",
           2: "Pancakes are made every morning.",
           3: "The mechanics have repaired the cars.",
           4: "The cars have been repaired."}

# --- بخش ۹ (درس ۳۱): کلمات ربط — کلید but/and/so/or ---
S9_STEMS = {
    1: "My sister has a beautiful dress, --------------- she never wears it.",
    2: "I get up early in the morning, --------------- I make an omelet myself.",
    3: "Ahmad didn't study hard for the exam, --------------- he didn't pass it.",
    4: "You should wash the dishes, --------------- you should do your homework.",
}
S9_KEYS = {1: "but", 2: "and", 3: "so", 4: "or"}

# --- بخش ۱۰ (درس ۳۲): جفت‌سازی دو ستون — کلید c/d/a/b ---
S10_STEMS = {
    1: "You can use mobile dictionary, or ---------------",
    2: "The roads were covered with ice, so ---------------",
    3: "I wanted to call you, but ---------------",
    4: "I went to the window, and ---------------",
}
S10_OPTIONS = ["I didn't have your number.", "I looked out.", "you can buy a pocket one.", "it was not safe to drive."]
S10_KEYS = {1: "c", 2: "d", 3: "a", 4: "b"}

# --- بخش ۱۱ (درس ۳۳): مرتب‌کردن کلمات — کلید جملهٔ کامل ص۱۹۶ ---
S11 = {
    1: ("went / my brother / to the library / at all / he / didn't / but / study / , / .",
        "My brother went to the library, but he didn't study at all."),
    2: ("shirt / it / comfortable / so / wear / not / I / this / is / rarely / , / .",
        "This shirt is not comfortable, so I rarely wear it."),
    3: ("expensive / I / it / that book / so / buy / can't / is / , / .",
        "That book is expensive, so I can't buy it."),
    4: ("it / like / spaghetti / hates / my mother / I / but / , / .",
        "I like spaghetti, but my mother hates it."),
}

# --- بخش ۱۲ (درس ۳۴): متن ۶خالی حسن عمیدزاده — بانک ۶تایی ---
S12_BANK = ["brought", "injuries", "fight", "dedicated", "burnt", "caught"]
S12_WINDOWS = {
    1: "In the February of 1997, the school where he was teaching (---1---) fire.",
    2: "The (---2---) teacher saved thirty students",
    3: "where he himself was (---3---) in the face and around his head.",
    4: "He (---4---) the students out one by one when the door was closed",
    5: "he had to (---5---) a lot to take himself out of the room.",
    6: "His (---6---) were so hard and finally he died on July 18, 2012.",
}
S12_KEYS = {1: "caught", 2: "dedicated", 3: "burnt", 4: "brought", 5: "fight", 6: "injuries"}

# --- بخش ۱۳ (درس ۳۵): ریدینگ — ۲ باز + ۱ متعرّف + ۲ درست/نادرست ---
S13_OPEN = {
    1: ("What can it lead to when you see the impacts on those you are helping?",
        "It can lead not only to great personal happiness but also to respect from others who appreciate the work you do."),
    2: ("What is the important point in helping others?",
        "The important point is that we continue to give to those who are more in need than ourselves."),
}
S13_SYNONYM = ("What is the closest synonym for the word “benefit”?",
               ["experience", "advantage", "choice", "effect"], 1)
S13_TF = {
    4: ("Helping people in bad environmental events has the global importance.", 0),
    5: ("All people feel great personal happiness when they help others.", 0),  # کلید چاپی a=True + رسیدِ تنش
}

# --- بخش ۱۴ (درس ۳۶): ریدینگ MCQ — کلید d/c/b/a ---
S14 = [
    ("When we grow up, ---------------.",
     ["our ears will not change in size", "our ears will be the same size", "our ears will get colder", "our ears will not change in shape"], 3),
    ("If someone's ears are red, it means ---------------.",
     ["he/she is a kind person", "he/she is very happy", "he/she may get angry easily", "he/she drinks a lot"], 2),
    ("If you look at someone's ears, the right way to see ---------------.",
     ["his face, ears and nose", "the size, color and shape", "his mouth, eyes and nose", "the hair, eyes and color"], 1),
    ("How can we find out a person has a nervous character through his/her ears?",
     ["When they are cold.", "When they are medium-size.", "When they are not white color.", "When they are musical."], 0),
]

# ================= راستی‌آزماییِ حضور در OCR (دو داوری: متن آزمون + متن کلید) =================
for n, s in S2_STEMS.items():
    ocr_has(norm(s), EXAM_NORM, f"S2-Q{n}")
for n, s in S4_STEMS.items():
    ocr_has(norm(s), EXAM_NORM, f"S4-Q{n}")
for stem, _, _ in S5:
    ocr_has(norm(stem), EXAM_NORM, f"S5 «{stem[:40]}»")
for n, s in S6_STEMS.items():
    ocr_has(norm(s), EXAM_NORM, f"S6-Q{n}")
for n, s in S7_STEMS.items():
    ocr_has(norm(s), EXAM_NORM, f"S7-Q{n}")
for n, sc in S8_SCRAMBLES.items():
    ocr_has(norm(sc), EXAM_NORM, f"S8-scramble{n}")
    ocr_has("Active:", EXAM_NORM, "S8-Active")
    ocr_has("Passive:", EXAM_NORM, "S8-Passive")
for n, s in S9_STEMS.items():
    ocr_has(norm(s), EXAM_NORM, f"S9-Q{n}")
for n, s in S10_STEMS.items():
    ocr_has(norm(s).replace(" " + BLANK, ""), EXAM_NORM, f"S10-Q{n}")  # خانهٔ پاسخِ چاپی «( )» است نه خط‌تیره
for n, (sc, _) in S11.items():
    ocr_has(norm(sc), EXAM_NORM, f"S11-scramble{n}")
for n, s in S12_WINDOWS.items():
    ocr_has(s, EXAM_NORM, f"S12-window{n}")  # نشانگر (---N---) چاپی — بدونِ نرمال‌سازیِ خط‌تیره
for n, (s, _) in S13_OPEN.items():
    ocr_has(norm(s), EXAM_NORM, f"S13-open{n}")
ocr_has(norm(S13_SYNONYM[0]), EXAM_NORM, "S13-synonym")
for n, (s, _) in S13_TF.items():
    ocr_has(norm(s), EXAM_NORM, f"S13-tf{n}")
for stem, _, _ in S14:
    ocr_has(norm(stem), EXAM_NORM, f"S14 «{stem[:40]}»")
receipts.append("OCR آزمون: ۴۱ ساقه/پنجرهٔ verbatim همگی یافت شدند (ص۵۵-۵۸)")

# کلیدها از صفحات کلید — برشِ لنگر-محور per بخش، مقایسه با EXPECTED
key_text = " ".join(pages[p] for p in (195, 196))
key_norm = norm(key_text)


def key_region(start_anchor: str, end_anchor: str) -> str:
    a = key_norm.find(start_anchor)
    assert a >= 0, f"لنگر کلید یافت نشد: {start_anchor}"
    b = key_norm.find(end_anchor, a + len(start_anchor))
    assert b >= 0, f"لنگر پایان کلید یافت نشد: {end_anchor}"
    return key_norm[a:b]


def parse_letter_keys(region: str, n_items: int) -> dict:
    pairs = re.findall(r"(\d{1,2})\s*\.\s*([a-e])\b", region)
    out = {}
    for n, k in pairs:
        n = int(n)
        assert n not in out, f"کلید تکراری {n}"
        out[n] = k
    assert sorted(out) == list(range(1, n_items + 1)), f"کلیدهای ناقص: {sorted(out)} != 1..{n_items}"
    return out


def parse_word_keys(region: str, n_items: int) -> dict:
    pairs = re.findall(r"(\d{1,2})\s*\.\s*([a-z][a-z'-]*)", region)
    out = {}
    for n, k in pairs:
        n = int(n)
        assert n not in out
        out[n] = k
    assert sorted(out) == list(range(1, n_items + 1)), f"کلیدهای ناقص: {sorted(out)}"
    return out


def parse_phrase_keys(region: str, n_items: int) -> dict:
    """کلیدهای چندواژه‌ای (تگ/مجهول) — خط به خط N. متن"""
    pairs = re.findall(r"(\d{1,2})\s*\.\s*([a-z][^0-9]+?)(?=\s\d{1,2}\s*\.|$)", region)
    out = {}
    for n, k in pairs:
        n = int(n)
        k = k.strip(" .")
        k = re.sub(r"-{4,}.*$", "", k).strip(" .")  # جداکنندهٔ خط‌تیرهٔ چاپی پس از آخرین کلید
        if n in out or not k:
            continue
        out[n] = re.sub(r"\s+", " ", k)
    assert sorted(out) == list(range(1, n_items + 1)), f"کلیدهای ناقص: {sorted(out)}"
    return out


# K2 واژگان
r = key_region("2- Fill in the blanks with the proper words", "3- Make collocations")
k2 = parse_word_keys(r, 8)
assert k2 == S2_KEYS, f"K2 ناسازگار: {k2}"
# K3 حروف
r = key_region("3- Make collocations", "4- Match the definitions")
k3 = parse_letter_keys(r, 4)
assert k3 == S3_KEYS, f"K3 ناسازگار: {k3}"
# K4 واژگان
r = key_region("4- Match the definitions", "5- Choose the best item")
k4 = parse_word_keys(r, 4)
assert k4 == S4_KEYS, f"K4 ناسازگار: {k4}"
# K5 حروف
r = key_region("5- Choose the best item", "6- Write the correct tag")
k5 = parse_letter_keys(r, 4)
assert k5 == {1: "a", 2: "b", 3: "d", 4: "a"}, f"K5 ناسازگار: {k5}"
# K6 تگ‌ها
r = key_region("6- Write the correct tag", "7- Write the passive form")
k6raw = parse_phrase_keys(r, 4)
k6 = {n: k.replace("’", "'") for n, k in k6raw.items()}
assert k6 == S6_KEYS, f"K6 ناسازگار: {k6}"
# K7 مجهول
r = key_region("7- Write the passive form", "8- Make active and passive")
k7 = parse_phrase_keys(r, 4)
assert k7 == S7_KEYS, f"K7 ناسازگار: {k7}"
# K8 جمله‌ها — Active/Passive
r = key_region("8- Make active and passive", "9- Fill in the blanks")
assert "My mother makes pancakes every morning" in r and "Pancakes are made every morning" in r
assert "The mechanics have repaired the cars" in r and "The cars have been repaired" in r
# K9 کلمات ربط
r = key_region("9- Fill in the blanks. Use “and, or, but or so”", "10- Match two columns")  # کوتیشنِ خمیدهٔ چاپی
k9 = parse_word_keys(r, 4)
assert k9 == S9_KEYS, f"K9 ناسازگار: {k9}"
# K10 حروف
r = key_region("10- Match two columns", "11- Put the words in correct order")
k10 = parse_letter_keys(r, 4)
assert k10 == S10_KEYS, f"K10 ناسازگار: {k10}"
# K11 جمله‌ها
r = key_region("11- Put the words in correct order", "12- Read the passage")
for n, (_, key) in S11.items():
    assert norm(key) in norm(r), f"K11-Q{n}: کلید جمله یافت نشد"
# K12 کلوز
r = key_region("12- Read the passage and then fill in the blanks", "13- Read the passage and then answer")
k12 = parse_word_keys(r, 6)
assert k12 == S12_KEYS, f"K12 ناسازگار: {k12}"
# K13 دو جملهٔ باز + سه حرف
r = key_region("13- Read the passage and then answer", "14- Read the passage and then choose")
for n, (_, key) in S13_OPEN.items():
    assert norm(key) in norm(r), f"K13-open{n}"
k13 = parse_letter_keys(r, 3)
assert k13 == {1: "b", 2: "a", 3: "a"}, f"K13 حروف ناسازگار: {k13}"
# K14 حروف
r = key_region("14- Read the passage and then choose", "Note")
k14 = parse_letter_keys(r, 4)
assert k14 == {1: "d", 2: "c", 3: "b", 4: "a"}, f"K14 ناسازگار: {k14}"
receipts.append("OCR کلید: ۱۳ بخش از صفحات ۱۹۵-۱۹۶ با لنگر-محور برش خورد و با داوریِ مستقل EXPECTED موافق شد (کلمه به کلمه)")
receipts.append("S13-5: کلید چاپی a=True محفوظ + رسیدِ تنشِ معنایی در source.comprehensive.tfReceipt")

# ================= مونتاژ درس‌های ۲۴-۳۶ =================
LET = {"a": 0, "b": 1, "c": 2, "d": 3, "e": 4}


def q_typed(qid, n, question, key, pool, placeholder=None):
    """داربستِ استخرِ بسته: options=[کلید] + تا سه واژهٔ دیگر؛ درست در اندیس ۰ (الگوی r285/r288).
    پرسش‌های بازِ بدون بانک (S13) با داربستِ حداقلیِ دوگزینه‌ای — جعلِ گزینه ممنوع."""
    others = [w for w in pool if w != key]
    assert len(others) >= 1, f"{qid}: استخر کوچک است"
    opts = [key] + others[:3]
    q = {"id": qid, "n": n, "category": "grammar", "kind": "typed", "question": question,
         "options": opts, "answer": 0, "accepted": [key]}
    if placeholder:
        q["placeholder"] = placeholder
    return q


def q_mcq(qid, n, question, options, answer):
    return {"id": qid, "n": n, "category": "grammar", "question": question,
            "options": options, "answer": answer}


lessons = []

# درس ۲۴ — بخش ۲
qs = [q_typed(f"g12-comp-v{i}", i, S2_STEMS[i], S2_KEYS[i], S2_BANK,
              "fill in the blank with the word bank…") for i in range(1, 9)]
lessons.append({"lesson": 24, "title": "جامع — واژگان: جای خالی از بانک، بنویسید (ص۵۵)",
                "level": "آموزشی — ورود آزاد", "count": len(qs), "questions": qs})

# درس ۲۵ — بخش ۳ (۵ گزینهٔ چاپی)
qs = [q_mcq(f"g12-comp-col{i}", i, S3_STEMS[i], S3_OPTIONS, LET[S3_KEYS[i]]) for i in range(1, 5)]
lessons.append({"lesson": 25, "title": "جامع — واژگان: ترکیب‌ها، ۵ گزینهٔ چاپی (ص۵۵)",
                "level": "استاندارد", "count": len(qs), "questions": qs})

# درس ۲۶ — بخش ۴
qs = [q_typed(f"g12-comp-def{i}", i, S4_STEMS[i], S4_KEYS[i], S4_KEYS.values(),
              "write the word from the bank…") for i in range(1, 5)]
lessons.append({"lesson": 26, "title": "جامع — واژگان: تعریف‌ها، بنویسید (ص۵۵)",
                "level": "آموزشی — ورود آزاد", "count": len(qs), "questions": qs})

# درس ۲۷ — بخش ۵
qs = [q_mcq(f"g12-comp-mcq{i}", i, stem, opts, ans) for i, (stem, opts, ans) in enumerate(S5, 1)]
lessons.append({"lesson": 27, "title": "جامع — تست چهارگزینه‌ای مجهول (ص۵۶)",
                "level": "استاندارد", "count": len(qs), "questions": qs})

# درس ۲۸ — بخش ۶ (داربست = سه کلید دیگر)
qs = [q_typed(f"g12-comp-tag{i}", i, S6_STEMS[i], S6_KEYS[i], list(S6_KEYS.values())) for i in range(1, 5)]
lessons.append({"lesson": 28, "title": "جامع — عبارات الحاق، بنویسید (ص۵۶)",
                "level": "آموزشی — ورود آزاد", "count": len(qs), "questions": qs})

# درس ۲۹ — بخش ۷
qs = [q_typed(f"g12-comp-pass{i}", i, S7_STEMS[i], S7_KEYS[i], list(S7_KEYS.values()),
              "write the passive form…") for i in range(1, 5)]
lessons.append({"lesson": 29, "title": "جامع — مجهول‌سازی سه‌زمان، بنویسید (ص۵۶)",
                "level": "آموزشی — ورود آزاد", "count": len(qs), "questions": qs})

# درس ۳۰ — بخش ۸
qs = []
for i in range(1, 5):
    scramble = S8_SCRAMBLES[1 if i <= 2 else 2]
    form = "Active" if i % 2 == 1 else "Passive"
    stem = f"{scramble} — {form}: ---------------"
    qs.append(q_typed(f"g12-comp-sent{i}", i, stem, S8_KEYS[i], list(S8_KEYS.values()),
                      "write the full sentence…"))
lessons.append({"lesson": 30, "title": "جامع — جمله‌سازی معلوم/مجهول، بنویسید (ص۵۶)",
                "level": "آموزشی — ورود آزاد", "count": len(qs), "questions": qs})

# درس ۳۱ — بخش ۹
qs = [q_typed(f"g12-comp-conn{i}", i, S9_STEMS[i], S9_KEYS[i], ["and", "or", "but", "so"]) for i in range(1, 5)]
lessons.append({"lesson": 31, "title": "جامع — کلمات ربط، کامل کنید (ص۵۶)",
                "level": "آموزشی — ورود آزاد", "count": len(qs), "questions": qs})

# درس ۳۲ — بخش ۱۰
qs = [q_mcq(f"g12-comp-mtch{i}", i, S10_STEMS[i], S10_OPTIONS, LET[S10_KEYS[i]]) for i in range(1, 5)]
lessons.append({"lesson": 32, "title": "جامع — جفت‌سازی دو ستون (ص۵۷)",
                "level": "استاندارد", "count": len(qs), "questions": qs})

# درس ۳۳ — بخش ۱۱
qs = [q_typed(f"g12-comp-wo{i}", i, S11[i][0], S11[i][1], [S11[j][1] for j in S11],
              "write the complete sentence…") for i in range(1, 5)]
lessons.append({"lesson": 33, "title": "جامع — مرتب‌کردن کلمات، بنویسید (ص۵۷)",
                "level": "آموزشی — ورود آزاد", "count": len(qs), "questions": qs})

# درس ۳۴ — بخش ۱۲
qs = [q_typed(f"g12-comp-clz{i}", i, S12_WINDOWS[i], S12_KEYS[i], S12_BANK) for i in range(1, 7)]
lessons.append({"lesson": 34, "title": "جامع — متن ۶خالی حسن عمیدزاده، بنویسید (ص۵۷)",
                "level": "آموزشی — ورود آزاد", "count": len(qs), "questions": qs})

# درس ۳۵ — بخش ۱۳
qs = []
for i in range(1, 3):
    stem, key = S13_OPEN[i]
    qs.append(q_typed(f"g12-comp-rd{i}", i, stem, key,
                      [S13_OPEN[1][1], S13_OPEN[2][1]]))  # داربستِ حداقلی: دو کلیدِ چاپی
stem, opts, ans = S13_SYNONYM
qs.append(q_mcq("g12-comp-rd3", 3, stem, opts, ans))
for n in (4, 5):
    stem, ans = S13_TF[n]
    qs.append(q_mcq(f"g12-comp-rd{n}", n, stem, ["True", "False"], ans))
lessons.append({"lesson": 35, "title": "جامع — ریدینگ: پرسش پاسخ + درست/نادرست (ص۵۷-۵۸)",
                "level": "آموزشی — ورود آزاد", "count": len(qs), "questions": qs})

# درس ۳۶ — بخش ۱۴
qs = [q_mcq(f"g12-comp-rm{i}", i, stem, opts, ans) for i, (stem, opts, ans) in enumerate(S14, 1)]
lessons.append({"lesson": 36, "title": "جامع — ریدینگ: تست چهارگزینه‌ای گوش‌ها (ص۵۸)",
                "level": "استاندارد", "count": len(qs), "questions": qs})

# ================= ادغام در JSON خانواده =================
bank = json.load(open(OUT, encoding="utf-8"))
assert len(bank["lessons"]) == 23, f"وضعیت خانواده غیرمنتظره: {len(bank['lessons'])} بانک"
existing_ids = {q["id"] for l in bank["lessons"] for q in l["questions"]}
new_ids = [q["id"] for l in lessons for q in l["questions"]]
assert len(new_ids) == 59, f"شمار آیتم: {len(new_ids)}"
assert len(set(new_ids)) == 59, "شناسهٔ تکراری"
assert not (existing_ids & set(new_ids)), "برخورد شناسه"

# برخورد ساقهٔ نو با خانواده (نرمال‌سازیِ هم‌خوان با گارد)
def stem_key(q):
    s = q["question"]
    s = re.sub(r"\(---\d---\)", " ", s)
    s = re.sub(r"-+", " ", s)
    return re.sub(r"\s+", " ", s).strip().lower()


old_stems = {}
for l in bank["lessons"]:
    for q in l["questions"]:
        old_stems.setdefault(stem_key(q), []).append(q["id"])
collisions = []
for l in lessons:
    for q in l["questions"]:
        if stem_key(q) in old_stems:
            collisions.append((q["id"], old_stems[stem_key(q)]))
assert not collisions, f"برخورد ساقهٔ نو: {collisions}"

bank["lessons"].extend(lessons)
bank["source"]["comprehensive"] = {
    "pages": "55-58",
    "topic": "آزمون جامع تشریحی درس اول — ۱۴ بخش چاپی (واژگان + گرامر + نگارش + کلوز + ریدینگ)",
    "questions": "59 آیتم از ۶۳ آیتم چاپی در ۱۳ بانک (درس‌های ۲۴-۳۶)",
    "keyType": "کلید کامل ص۱۹۵-۱۹۶ («کلید آزمون تشریحی جامع درس اول» صفحه: 55 تا 58) — حروف گرید / واژه / جملهٔ کامل",
    "visualAbsent": "بخش ۱ «Match the pictures» (۴ آیتم) وابسته به تصویر است و بدونِ داراییِ تصویری قابل استخراج نیست — کلید چاپی 1.D/2.C/3.B/4.A فقط در همین رسید ثبت شد (غیبتِ صادقانه)",
    "fiveOptions": "بخش ۳ «ترکیب‌ها» ۵ گزینهٔ چاپی دارد (a-e؛ d.meal اضافه) — وفادار به چاپ ماندیم؛ انحرافِ مستند از قراردادِ ۴گزینهٔ خانواده",
    "tfReceipt": "S13-5 «All people feel great personal happiness…» کلید چاپی a=True محفوظ — داوری معنایی: «all people» بیش‌گویی است و False منطقی‌تر می‌نماید؛ الگوی خانواده: کلید چاپی حاکم + رسیدِ تنش",
    "translations": "بدنهٔ آزمون جامع ترجمهٔ چاپی ندارد — غیبتِ صادقانه",
    "placeholders": "فیلد اختیاری placeholder در QuizQuestion (r289) — راهنمای ورودیِ وابسته به بخش: بانک واژگان/تعریف/مجهول/جملهٔ کامل/مرتب‌سازی؛ بانک‌های تگ/ربط/کلوز از استنتاجِ خودکارِ شکل (r288) بهره می‌برند",
    "extractedRound": 289,
}
json.dump(bank, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

print("=== رسید r289 ===")
for r in receipts:
    print("•", r)
print(f"• خانواده: {len(bank['lessons'])} بانک / {sum(l['count'] for l in bank['lessons'])} تست")
for l in lessons:
    kinds = {}
    for q in l["questions"]:
        kinds[q.get("kind", "mcq")] = kinds.get(q.get("kind", "mcq"), 0) + 1
    print(f"  درس {l['lesson']}: {l['count']} آیتم {kinds} — {l['title']}")
print("OK — نوشته شد:", OUT)
