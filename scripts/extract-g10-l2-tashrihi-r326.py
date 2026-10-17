# -*- coding: utf-8 -*-
# r326 — استخراجِ «آزمون تشریحی واژگان درس دوم» جزوهٔ دهم (ص۸۴-۸۶، کلید چاپی ص۲۵۸)
# به public/jozve/tests-g10.json — عینِ الگوی r323 (بانک‌های ۷-۱۰):
#   بانک ۷: جای خالی از بانک واژه (۱۶ تایپی) — بانک ۸: کلمه با حرف اول (۸ تایپی)
#   بانک ۹: تعریف‌ها، بنویسید (۸ تایپی) — بانک ۱۰: تست چهارگزینه‌ای (۲۵ MCQ)
# کلید: گریدِ واژه‌ایِ چاپ ص۲۵۸ «پاسخنامه آزمون تشریحی واژگان درس دوم (آزمون: صفحه ۸۴ تا ۸۶)»
# (۵۷/۵۷ با پیش‌پرکردنِ معنایی هم‌رأی — صفر واگرایی). ترجمه: غیبتِ صادقانه (چاپ نشده).
# کوئیرکِ چاپیِ ساقه: Q5 «to keeps us alive» (زوم ۴۰۰۰dpi).
# Idempotent: اجرای دوم NO-OP (مبنا = ۶ بانکِ r323-r325).
import json
from pathlib import Path

PATH = Path("public/jozve/tests-g10.json")

BANK_A = ["compare", "strong", "important", "ugly", "suitable", "disease", "exercise", "strange", "blood"]
BANK_B = ["worst", "healthy", "element", "drop", "lost", "orbits", "without", "abroad", "carry"]
DEF_BANK = ["gift", "planet", "war", "collect", "pepper", "daily", "heart", "sky", "village"]

# کلیدِ چاپیِ ص۲۵۸ — بخش ۱ (۱۶)
B1_KEYS = [
    "exercise", "strange", "ugly", "important", "blood", "strong", "compare", "suitable",
    "healthy", "worst", "drop", "carry", "lost", "orbits", "without", "abroad",
]
B1_STEMS = [
    "------------------ keeps us safe from some injuries.",
    "He was looking at me in a very ------------------ way.",
    "She is beautiful, but her younger sister is really ------------------.",
    "Bacteria and viruses are two ------------------ types of microbes.",
    "The heart pumps ------------------ round the body to keeps us alive.",
    "My brother has a very ------------------ body because he does a lot of exercise.",
    "We want to ------------------ the prices of all the cars before deciding which one to buy.",
    "Some children have to do work that is not ------------------ for them and they often do not like it.",
    "We should have a ------------------ breakfast because it gives us a lot of energy.",
    "He’s a very bad student. Actually, he is the ------------------ student in our class.",
    "There are millions of red blood cells in one small ------------------ of blood.",
    "The injured man was too heavy for me to ------------------.",
    "I was very sad when I ------------------ my watch in a store.",
    "Planets go around the Sun in different ------------------.",
    "Can we see all planets ------------------ a telescope?",
    "I’m not interested in working ------------------.",
]

# بخش ۲ — حرف اول (۸): (ساقه، کلید) — شمارشِ زیرخطِ چاپ با طولِ کلید هم‌خوان است (بدونِ استثنا)
B2_ITEMS = [
    ("Gold is the most expensive m _ _ _ _ of the world.", "metal"),
    ("A c _ _ _ _ can live without water for a long time.", "camel"),
    ("It’s a f _ _ _ that Earth goes around the Sun.", "fact"),
    ("This problem is not easy. It’s very d _ _ _ _ _ _ _ _ .", "difficult"),
    ("Plants and animals need o _ _ _ _ _ to live.", "oxygen"),
    ("A person or thing that is h _ _ _ _ _ _ gives help.", "helpful"),
    ("It is p _ _ _ _ _ to say please when you ask for something.", "polite"),
    ("White blood cells d _ _ _ _ _ body against diseases.", "defend"),
]

# بخش ۳ — تعریف‌ها (۸): (تعریف، کلید) — اضافهٔ بانک: pepper
B3_ITEMS = [
    ("A small place where people live:", "village"),
    ("To go and get someone or something:", "collect"),
    ("That happens or comes every day or once a day:", "daily"),
    ("Something that you give to or get from somebody:", "gift"),
    ("The space above the earth where you can see the sun:", "sky"),
    ("A large round thing in space that moves around the sun:", "planet"),
    ("Fighting between countries or between groups of people:", "war"),
    ("The part of a person’s or animal’s body that makes the blood go around inside:", "heart"),
]

# بخش ۴ — ۲۵ MCQ: (ساقه، گزینه‌ها، کلیدِ واژه‌ایِ چاپ ص۲۵۸)
B4_ITEMS = [
    ("My father went to the hospital and --------------- blood yesterday.",
     ["attacked", "pumped", "defended", "donated"], "donated"),
    ("I think that it’s --------------- to climb a mountain in bad weather.",
     ["important", "dangerous", "comparative", "suitable"], "dangerous"),
    ("A --------------- is the organ inside the head of a human or an animal that thinks and feels.",
     ["sign", "blood", "brain", "hint"], "brain"),
    ("The school bus --------------- the students each morning.",
     ["collects", "checks", "completes", "compares"], "collects"),
    ("You should ask your doctor’s --------------- before you start an exercise program.",
     ["element", "interest", "opinion", "quality"], "opinion"),
    ("I couldn’t find the right words to --------------- my feelings for her.",
     ["defend", "describe", "happen", "create"], "describe"),
    ("Plasma is a --------------- and yellow liquid and carries red and white cells.",
     ["cheap", "fresh", "wonder", "clear"], "clear"),
    ("What --------------- if nobody comes to the party?",
     ["happens", "describes", "creates", "crosses"], "happens"),
    ("A special building for studying stars, planets, weather, etc. is called a/an ---------------.",
     ["superlative", "observatory", "abroad", "telescope"], "observatory"),
    ("The white cells in our blood are like --------------- that defend the body against microbes.",
     ["peppers", "soldiers", "arrows", "wonders"], "soldiers"),
    ("The bed was hard, but it was --------------- than nothing.",
     ["better", "more", "worse", "farther"], "better"),
    ("You shouldn’t drive for more than two hours --------------- taking a break.",
     ["without", "even", "extra", "round"], "without"),
    ("The hole is so ---------------, you can’t see the bottom.",
     ["dangerous", "deep", "clear", "real"], "deep"),
    ("We can thank Allah by keeping our body ---------------.",
     ["downward", "wonderful", "healthy", "interested"], "healthy"),
    ("We live in a/an --------------- world. All around us there are amazing things.",
     ["upward", "famous", "important", "wonderful"], "wonderful"),
    ("The --------------- of the picture on our television isn’t very good.",
     ["details", "opinion", "quality", "nation"], "quality"),
    ("I can’t go into much ---------------, but I’ve been having some health problems recently.",
     ["interest", "detail", "term", "hint"], "detail"),
    ("I have to be in London on Friday for a/an --------------- meeting.",
     ["important", "dangerous", "powerful", "cloudy"], "important"),
    ("Heart --------------- is the most important reason of death in many Western countries.",
     ["blood", "disease", "plasma", "liquid"], "disease"),
    ("Telescopes and microscopes are --------------- machines for working on different creations.",
     ["interesting", "delicious", "dangerous", "useful"], "useful"),
    ("For the first few months the babies looked so --------------- I couldn’t tell which was which.",
     ["alike", "ugly", "beautiful", "rising"], "alike"),
    ("My father is going to --------------- some computers to our school.",
     ["laugh", "happen", "describe", "donate"], "donate"),
    ("A chemical element that is a gas with no smell or color is called ---------------.",
     ["heavens", "oxygen", "silver", "plasma"], "oxygen"),
    ("--------------- if you take a taxi, you’ll still miss your train.",
     ["Fact", "Even", "Such", "Without"], "even"),
    ("All she needed to --------------- her happiness was a baby.",
     ["complete", "attack", "pump", "donate"], "complete"),
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


def build_lessons(base_lessons):
    # بانک ۷ — ۱۶ تایپی از دو بانک ۹کلمه‌ای چاپ (اضافه‌ها: disease / element)
    qs7 = []
    for i, stem in enumerate(B1_STEMS):
        n = i + 1
        bank = BANK_A if n <= 8 else BANK_B
        bank_label = "A" if n <= 8 else "B"
        key = B1_KEYS[i]
        assert key in bank, f"B1-Q{n} key {key!r} not in bank {bank_label}"
        q = typed_q(7, n, f"{stem} [bank: {' / '.join(bank)}]", key, rotated(bank, n), PH_BANK)
        qs7.append(q)
    base_lessons.append({
        "lesson": 7,
        "title": "تشریحی درس دوم — جای خالی از بانک واژه (ص۸۴)",
        "level": "تشریحی — تایپی",
        "count": len(qs7),
        "questions": qs7,
    })

    # بانک ۸ — ۸ تایپیِ حرف اول؛ گزینه‌ها = ۸ واژهٔ کلیدِ خودِ بانک (الگوی r323/g11-l26)
    b2_words = [w for _, w in B2_ITEMS]
    qs8 = []
    for i, (stem, key) in enumerate(B2_ITEMS):
        n = i + 1
        # شمارشِ زیرخطِ چاپ = طولِ کلید (بدونِ استثنای r323-Q7 این بار)
        assert key not in ("forest",)  # نگهبانِ حافظهٔ الگو
        q = typed_q(8, n, stem, key, rotated(b2_words, i), PH_FIRST)
        qs8.append(q)
    base_lessons.append({
        "lesson": 8,
        "title": "تشریحی درس دوم — کلمه با حرف اول (ص۸۴)",
        "level": "تشریحی — تایپی",
        "count": len(qs8),
        "questions": qs8,
    })

    # بانک ۹ — ۸ تایپیِ تعریف‌ها؛ گزینه‌ها = بانکِ ۹کلمه‌ایِ چاپ (یک اضافه: pepper)
    qs9 = []
    for i, (definition, key) in enumerate(B3_ITEMS):
        n = i + 1
        assert key in DEF_BANK
        q = typed_q(9, n, definition, key, rotated(DEF_BANK, i), PH_DEF)
        qs9.append(q)
    base_lessons.append({
        "lesson": 9,
        "title": "تشریحی درس دوم — تعریف‌ها، بنویسید (ص۸۵)",
        "level": "تشریحی — تایپی",
        "count": len(qs9),
        "questions": qs9,
    })

    # بانک ۱۰ — ۲۵ MCQ
    qs10 = []
    for i, (stem, options, key_word) in enumerate(B4_ITEMS):
        n = i + 1
        idx = next((j for j, o in enumerate(options) if o.lower() == key_word.lower()), None)
        assert idx is not None, f"B4-Q{n}: key word {key_word!r} not among options {options}"
        qs10.append({
            "id": f"g10-l10-{n}",
            "n": n,
            "category": "vocab",
            "question": stem,
            "options": options,
            "answer": idx,
        })
    base_lessons.append({
        "lesson": 10,
        "title": "تشریحی درس دوم — تست چهارگزینه‌ای (ص۸۵-۸۶)",
        "level": "تشریحی — چهارگزینه‌ای",
        "count": len(qs10),
        "questions": qs10,
    })


def main():
    old = json.loads(PATH.read_text(encoding="utf-8"))
    # base = ۶ بانکِ r323-r325 (اگر راندِ قبل اجرا شده، چهار بانکِ درس دوم را کنار بگذار)
    if len(old["lessons"]) == 10:
        base_lessons = old["lessons"][:6]
    else:
        base_lessons = old["lessons"]
    assert old["grade"] == 10 and len(base_lessons) == 6, "unexpected base shape"
    assert sum(l["count"] for l in base_lessons) == 137, "unexpected base count"
    base_source = {k: v for k, v in old["source"].items() if k != "tashrihi2"}

    build_lessons(base_lessons)
    doc = {"grade": 10, "lessons": base_lessons, "source": dict(base_source)}
    doc["source"]["tashrihi2"] = {
        "exam": "آزمون تشریحی واژگان درس دوم (آزمون: ص۸۴ تا ۸۶)",
        "header": "«آزمون تشریحی واژگان درس دوم» (پاسخنامه صفحه: ۲۵۸)",
        "sections": {
            "1": "جای خالی از بانک واژه — دو بانک ۹ کلمه‌ای (یک کلمه اضافه: disease / element) — ۱۶ آیتم",
            "2": "کلمه با حرف اول — ۸ آیتم (شمارشِ زیرخطِ چاپ با طولِ کلید هم‌خوان — بدونِ استثنا)",
            "3": "تعریف‌ها، بنویسید — بانک ۹ کلمه‌ای (یک اضافه: pepper) — ۸ آیتم",
            "4": "تست چهارگزینه‌ای — ۲۵ آیتم",
        },
        "keyPages": "258",
        "keyVerification": "print key p258 «پاسخنامه آزمون تشریحی واژگان درس دوم (آزمون: صفحه ۸۴ تا ۸۶)» — 57/57 agree with semantic pre-fill, zero divergence",
        "extractedRound": "r326",
        "pattern": "r323 (بانک‌های تشریحیِ درس‌محور) + r311 — ۴ بانک / ۵۷ آیتم؛ typed-engine r285/r289",
        "translations": "برای این آزمون در جزوه چاپ نشده است (غیبتِ صادقانه — الگوی r323)",
        "printQuirks": [
            "Q5 بانک ۷: ساقهٔ چاپ «round the body to keeps us alive» — to keeps (خطای چاپ؛ زوم ۴۰۰۰dpi)؛ عینِ چاپ",
            "Q10 بانک ۱۰: «soldiers» جمع — استعارهٔ چاپ برای گلبول‌های سفید؛ عینِ چاپ",
            "Q24 بانک ۱۰: ساقه با جای خالی آغاز می‌شود («--------------- if you take a taxi…»)؛ عینِ چاپ",
        ],
    }

    total = sum(l["count"] for l in doc["lessons"])
    print(f"built: {len(doc['lessons'])} banks, {total} items (tashrihi2: 57)")
    if old == doc:
        print("identical content — NO-OP")
        return
    PATH.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"written: {PATH}")


if __name__ == "__main__":
    main()
