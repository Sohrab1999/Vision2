# -*- coding: utf-8 -*-
# r323 — استخراجِ «آزمون تشریحی واژگان درس اول» جزوهٔ دهم (ص۴۹-۵۱، کلید چاپی ص۲۴۲)
# به public/jozve/tests-g10.json — الگوی r311 (بانک‌های تشریحیِ tests-g11):
#   بانک ۱: جای خالی از بانک واژه (۱۶ تایپی) — بانک ۲: کلمه با حرف اول (۸ تایپی)
#   بانک ۳: تعریف‌ها، بنویسید (۸ تایپی) — بانک ۴: تست چهارگزینه‌ای (۲۵ MCQ)
# کلید: گریدِ چاپیِ خود جزوه ص۲۴۲ (۵۷/۵۷ با پیش‌پرکردنِ معنایی هم‌رأی — صفر واگرایی).
# ترجمه: غیبتِ صادقانه (جزوه ترجمهٔ این آزمون را چاپ نکرده).
# Idempotent: اجرای دوم NO-OP.
import json
import sys
from pathlib import Path

PATH = Path("public/jozve/tests-g10.json")

BANK_A = ["take care", "pay attention", "saved", "died out", "divided", "increase", "destroy", "choose", "protecting"]
BANK_B = ["recently", "amazing", "plain", "natural", "endangered", "instead", "future", "injured", "living"]
DEF_BANK = ["lake", "plan", "phrase", "zebra", "nature", "danger", "hope", "road", "whale"]

# کلیدِ چاپیِ ص۲۴۲ — بخش ۱ (۱۶)
B1_KEYS = [
    "saved", "protecting", "take care", "destroy", "choose", "died out", "pay attention", "increase",
    "natural", "injured", "amazing", "future", "living", "instead", "recently", "endangered",
]
B1_STEMS = [
    "My brother --------------- a little boy from falling into the water.",
    "--------------- the trees is helpful for endangered animals.",
    "If we --------------- of cheetahs, the number of them will increase.",
    "The workers want to --------------- the old house.",
    "There are a lot of restaurants to --------------- from.",
    "Did you know that the Persian lion --------------- many years ago?",
    "When your teacher is teaching, you must --------------- to him.",
    "We cannot hear you, --------------- the volume of your voice.",
    "It’s --------------- for parents to feel sad when their children leave home.",
    "School students will learn to help --------------- animals.",
    "His ability to write with his foot is ---------------.",
    "We need to plan for the ---------------.",
    "Humans need more places for ---------------, when their number increases.",
    "Now I can walk to work --------------- of going by car.",
    "Our teacher says that --------------- he cannot get enough sleep.",
    "Some places give good information about how to protect --------------- animals.",
]

# بخش ۲ — کلمه با حرف اول (۸) — شمارشِ حرفِ چاپ با کلید چاپ هم‌خوان است
B2_ITEMS = [
    ("The e _ _ _ _ goes round the sun once a year.", "earth"),
    ("An e _ _ _ _ _ _ _ is a very big wild animal from Africa or Asia.", "elephant"),
    ("A large piece of flat land is called p _ _ _ _.", "plain"),
    ("A h _ _ _ _ _ is a person who hunts wild animals for food or sport.", "hunter"),
    ("S _ _ _ _ _ is the first season of the year.", "spring"),
    ("Everest is the highest m _ _ _ _ _ _ _ in the world.", "mountain"),
    ("A big piece of land with a lot of trees is called f _ _ _ _.", "forest"),
    ("A v _ _ _ _ _ _ is a person who goes to see another person or a place for a short time.", "visitor"),
]

# بخش ۳ — تعریف‌ها (۸) — بانکِ ۹ کلمه‌ایِ چاپ (یک اضافه: danger)
B3_ITEMS = [
    ("Everything in the world that was not made by people:", "nature"),
    ("Something that you decide to do, and how to do it:", "plan"),
    ("A feeling of wanting something to happen and thinking that it will:", "hope"),
    ("The way from one place to another, where cars can go:", "road"),
    ("A big area of water with land all around it:", "lake"),
    ("A very big animal that lives in the sea and looks like a very big fish:", "whale"),
    ("An African wild animal like a horse, with black and white lines on its body:", "zebra"),
    ("A group of words that you use together as part of a sentence:", "phrase"),
]

# بخش ۴ — ۲۵ MCQ: (ساقه، گزینه‌ها، کلیدِ واژه‌ایِ چاپ ص۲۴۲)
B4_ITEMS = [
    ("The Iranian cheetah is --------------- endangered animals.",
     ["anymore", "among", "wildlife", "common"], "among"),
    ("After the Second World War, Germany was --------------- into two separate countries.",
     ["identified", "hoped", "underlined", "divided"], "divided"),
    ("I’m not --------------- in reading long stories.",
     ["take care", "attention", "hopeful", "interested"], "interested"),
    ("We just had soup --------------- of a full meal.",
     ["such", "instead", "enough", "appropriate"], "instead"),
    ("The car is very small, --------------- if you have children.",
     ["recently", "naturally", "especially", "normally"], "especially"),
    ("My brother brought the --------------- bird into the room and took care of it.",
     ["injured", "endangered", "natural", "relative"], "injured"),
    ("There is a --------------- wall round the garden.",
     ["proper", "marker", "low", "boring"], "low"),
    ("I called the firefighters to ---------------  the fire in the city center.",
     ["put out", "cut down", "turn off", "pay attention"], "put out"),
    ("There are lots of things in that shop, for ---------------, games toys, and flowers.",
     ["different", "future", "example", "recently"], "example"),
    ("I think they should --------------- the number of the buses.",
     ["hurt", "choose", "destroy", "increase"], "increase"),
    ("When you --------------- your family, you try to help them.",
     ["match", "protect", "take care", "hear"], "protect"),
    ("We had to change our --------------- because the bus arrived late.",
     ["plain", "report", "information", "schedule"], "schedule"),
    ("Endangered animals need --------------- and attention.",
     ["protection", "hope", "enough", "intonation"], "protection"),
    ("I --------------- a terrible noise last night. Do you know what it was?",
     ["filled", "heard", "chose", "increased"], "heard"),
    ("In the past, many hunters didn’t --------------- attention to wildlife.",
     ["take", "pay", "hurt", "save"], "pay"),
    ("I bought some material and a/an --------------- to make a new dress.",
     ["phrase", "idea", "marker", "pattern"], "pattern"),
    ("The building was completely --------------- by fire.",
     ["identified", "divided", "destroyed", "increased"], "destroyed"),
    ("---------------, we will arrive before dark.",
     ["Recently", "Hopefully", "Especially", "Orally"], "hopefully"),
    ("I ---------------  my pocket money in the street yesterday.",
     ["destroyed", "put out", "paid", "lost"], "lost"),
    ("I like to see the --------------- home of some animals.",
     ["natural", "human", "correct", "plural"], "natural"),
    ("I am free tonight. I’m going to read some ---------------.",
     ["dangers", "types", "poems", "plains"], "poems"),
    ("One of our relatives is a --------------- in Tehran.",
     ["passage", "zookeeper", "schedule", "spring"], "zookeeper"),
    ("I saw some --------------- in the street yesterday.",
     ["natural", "human", "mice", "plural"], "mice"),
    ("Do you know the --------------- way to shut the machine down?",
     ["correct", "low", "falling", "blank"], "correct"),
    ("Many homes, schools, mosques and offices were damaged and thousands of --------------- people were taken to hospitals.",
     ["hopeful", "injured", "dangerous", "endangered"], "injured"),
]

PH_BANK = "fill in the blank with the bank word…"
PH_FIRST = "complete the word (first letter is given)…"
PH_DEF = "type the word for the definition…"


def rotated(seq, k):
    n = len(seq)
    return [seq[(i + k) % n] for i in range(n)]


def typed_q(bank_id, n, question, answer_word, options, placeholder):
    return {
        "id": f"g10-l{bank_id}-{n}",
        "n": n,
        "category": "vocab",
        "kind": "typed",
        "question": question,
        "options": options,
        "answer": 0,
        "accepted": [answer_word],
        "placeholder": placeholder,
    }


def build():
    lessons = []

    # بانک ۱ — ۱۶ تایپی
    qs1 = []
    for i, stem in enumerate(B1_STEMS):
        n = i + 1
        bank = BANK_A if n <= 8 else BANK_B
        bank_label = "A" if n <= 8 else "B"
        key = B1_KEYS[i]
        assert key in bank, f"B1-Q{n} key {key!r} not in bank {bank_label}"
        q = typed_q(1, n, f"{stem} [bank: {' / '.join(bank)}]", key, rotated(bank, n), PH_BANK)
        qs1.append(q)
    lessons.append({
        "lesson": 1,
        "title": "تشریحی — جای خالی از بانک واژه (ص۴۹)",
        "level": "تشریحی — تایپی",
        "count": len(qs1),
        "questions": qs1,
    })

    # بانک ۲ — ۸ تایپیِ حرف اول؛ گزینه‌ها = ۸ واژهٔ کلیدِ خودِ بانک (الگوی g11-l26)
    b2_words = [w for _, w in B2_ITEMS]
    qs2 = []
    for i, (stem, key) in enumerate(B2_ITEMS):
        n = i + 1
        q = typed_q(2, n, stem, key, rotated(b2_words, i), PH_FIRST)
        qs2.append(q)
    lessons.append({
        "lesson": 2,
        "title": "تشریحی — کلمه با حرف اول (ص۴۹)",
        "level": "تشریحی — تایپی",
        "count": len(qs2),
        "questions": qs2,
    })

    # بانک ۳ — ۸ تایپیِ تعریف‌ها؛ گزینه‌ها = بانکِ ۹ کلمه‌ایِ چاپ (یک اضافه: danger)
    qs3 = []
    for i, (definition, key) in enumerate(B3_ITEMS):
        n = i + 1
        assert key in DEF_BANK
        q = typed_q(3, n, definition, key, rotated(DEF_BANK, i), PH_DEF)
        qs3.append(q)
    lessons.append({
        "lesson": 3,
        "title": "تشریحی — تعریف‌ها، بنویسید (ص۵۰)",
        "level": "تشریحی — تایپی",
        "count": len(qs3),
        "questions": qs3,
    })

    # بانک ۴ — ۲۵ MCQ
    qs4 = []
    for i, (stem, options, key_word) in enumerate(B4_ITEMS):
        n = i + 1
        # کلیدِ واژه‌ایِ چاپ → اندیسِ گزینه (مقایسهٔ بی‌حس‌وحروف‌بزرگ)
        idx = next((j for j, o in enumerate(options) if o.lower() == key_word.lower()), None)
        assert idx is not None, f"B4-Q{n}: key word {key_word!r} not among options {options}"
        qs4.append({
            "id": f"g10-l4-{n}",
            "n": n,
            "category": "vocab",
            "question": stem,
            "options": options,
            "answer": idx,
        })
    lessons.append({
        "lesson": 4,
        "title": "تشریحی — تست چهارگزینه‌ای (ص۵۰-۵۱)",
        "level": "تشریحی — چهارگزینه‌ای",
        "count": len(qs4),
        "questions": qs4,
    })

    doc = {
        "grade": 10,
        "lessons": lessons,
        "source": {
            "file": "جزوه جامع دهم .pdf",
            "exam": "آزمون تشریحی واژگان درس اول (آزمون: ص۴۹ تا ۵۱)",
            "sections": {
                "1": "جای خالی از بانک واژه — دو بانک ۹ کلمه‌ای (یک کلمه اضافه) — ۱۶ آیتم",
                "2": "کلمه با حرف اول — ۸ آیتم (شمارشِ حرفِ چاپ با کلید هم‌خوان؛ استثنا: Q7 «f _ _ _ _» برای forest شش‌حرفی — زیرخطِ کمِ چاپ، کلیدِ ص۲۴۲ حاکم)",
                "3": "تعریف‌ها، بنویسید — بانک ۹ کلمه‌ای (یک اضافه: danger) — ۸ آیتم",
                "4": "تست چهارگزینه‌ای — ۲۵ آیتم",
            },
            "keyPages": "242",
            "keyVerification": "print key p242 «پاسخنامه آزمون تشریحی واژگان درس اول» — 57/57 agree with semantic pre-fill, zero divergence",
            "extractedRound": "r323",
            "pattern": "r311 (tests-g11 تشریحی) — ۴ بانک / ۵۷ آیتم؛ typed-engine r285/r289",
            "translations": "برای این آزمون در جزوه چاپ نشده است (غیبتِ صادقانه)",
        },
    }
    return doc


def main():
    doc = build()
    total = sum(l["count"] for l in doc["lessons"])
    print(f"built: {len(doc['lessons'])} banks, {total} items")
    if PATH.exists():
        old = json.loads(PATH.read_text(encoding="utf-8"))
        if old == doc:
            print("identical content — NO-OP")
            return
    PATH.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"written: {PATH}")


if __name__ == "__main__":
    main()
