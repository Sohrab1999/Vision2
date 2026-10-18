# -*- coding: utf-8 -*-
# r336 — استخراجِ «آزمون جامع تشریحی درس دوم» جزوهٔ دهم (ص۱۰۵-۱۰۷، کلیدِ چاپیِ ص۲۷۲-۲۷۳)
# به public/jozve/tests-g10.json — هفت بانکِ ۳۲-۳۸ (الگوی کاملِ r331): S1+S2+S3 تایپی (۱۶) +
# S4+S5+S6 چهارگزینه‌ای (۱۲) + S7+S8 تایپی (۵) + S9+S10 تایپی (۷) + S11 آهنگِ خیزان (۴) +
# S12 کلوزِ یوزپلنگ (۶) + S13 درک مطلبِ منظومهٔ شمسی (۸ = ۴ تایپی + ۴ درست/نادرست) = ۵۸ آیتم.
# داوری‌های رندر:
# سربرگِ آزمون ص۱۰۵: «"آزمون جامع تشریحی درس دوم" (پاسخنامه صفحه: ۲۷۲ - ۲۷۳)» — ششمین «تسی یچ»ِ لایه (چاپ: تشریحی)؛
# سربرگِ کلید ص۲۷۲: «"پاسخنامه آزمون جامع تشریحی درس دوم" (آزمون صفحه: ۱۰۵ تا ۱۰۷)» — تشریحیِ تمیز؛
# عنوانِ S11: «آهنگ کدام جمله خیزان است؟ (Rising Intonation) (نمره ۰/۵)» — لایه «ر ن / خیان» = scramblingِ «خیزان»؛
# عنوانِ S9: «از کلمات داخل پرانتز استفاده کنید و به سؤالات زیر پاسخ کامل دهید. (نمره ۱/۵)» — لایه «پر ن/انی» = «پرانتز»؛
# بانکِ S2 (۹ واژه/۸ جای خالی): «wonder / expensive / compare / interested / heavens / suitable / happened /
# microscope / healthy» — «heavens» واژهٔ اضافیِ چاپی (رندر ۱۲x) — عینِ چاپ.
# کلید: ۵۸/۵۸ هم‌رأی با پیش‌پرکردنِ معنایی — صفر واگرایی. S9 مدخل‌های ۱/۳ دو واریانتِ چاپی دارند (هر دو در accepted).
# مرزها: ص۱۰۸-۱۱۲ آزمونِ واقعیِ سرخ‌شدهٔ «آزمون نیمسال اول ۹۸-۹۹» است («این آزمون پاسخنامه ندارد») — مادهٔ راندِ بعد.
# Idempotent: اجرای دوم NO-OP (مبنا = ۳۱ بانکِ r323-r335 / ۵۴۷ آیتم).
import json
from pathlib import Path

PATH = Path("public/jozve/tests-g10.json")

BL = "-" * 10  # جای خالیِ بلندِ S2/S8 (لایه: ۲۶ تیره — نمایشی)

BANK2 = "wonder / expensive / compare / interested / heavens / suitable / happened / microscope / healthy"

def typed(i, n, cat, q, key, distractors, accepted=None, bank=None, ph="type your answer…"):
    item = {
        "id": f"g10-l{32 + i}-{n}", "n": n, "category": cat, "kind": "typed",
        "question": q + (f" [bank: {BANK2}]" if bank else ""),
        "options": [key] + distractors, "answer": 0,
        "accepted": accepted or [key], "placeholder": ph,
    }
    return item

def mcq(i, n, cat, q, opts, key):
    return {"id": f"g10-l{32 + i}-{n}", "n": n, "category": cat, "question": q, "options": opts, "answer": key}

data = json.loads(PATH.read_text(encoding="utf-8"))
existing = [l for l in data["lessons"] if l["lesson"] >= 32]
if existing:
    print(f"lessons 32+ already present ({sum(l['count'] for l in existing)} items) — NO-OP")
else:
    assert len(data["lessons"]) == 31, f"baseline mismatch: {len(data['lessons'])} banks"

    # ———— بانک ۳۲ (S1+S2+S3): تایپی — ۱۶
    b32 = []
    for j, (q, key, d1, d2, d3) in enumerate([
        ("An obs__rvat__ry is a building from which scientists can watch the planets and the stars.",
         "observatory", "observation", "observer", "observe"),
        ("School days are said to be the h__pp__est days of your life.",
         "happiest", "happy", "happier", "happiness"),
        ("I have a t__ous__nd things to do before we go away.",
         "thousand", "thought", "through", "though"),
        ("Do you have any info__mat__on about train times?",
         "information", "inform", "informative", "informational"),
    ], 1):
        b32.append(typed(0, j, "vocab", q, key, [d1, d2, d3]))
    for j, (q, key, d1, d2, d3) in enumerate([
        ("I was looking for a birthday present for my mother but I didn’t find anything --------------------------.",
         "suitable", "wonder", "compare", "healthy"),
        ("If you -------------------------- house prices in the two areas, it’s amazing how different they are.",
         "compare", "wonder", "suitable", "happened"),
        ("It just -------------------------- that we went to see that new film last night.",
         "happened", "compare", "interested", "expensive"),
        ("Eating fruit and vegetables is part of a -------------------------- lifestyle.",
         "healthy", "happened", "microscope", "wonder"),
        ("He wasn’t very -------------------------- in what his father was saying.",
         "interested", "expensive", "suitable", "compare"),
        ("They looked at the blood samples under the --------------------------.",
         "microscope", "interested", "healthy", "heavens"),
        ("If you didn’t study, no -------------------------- you failed the test.",
         "wonder", "microscope", "suitable", "happened"),
        ("A large house like this must be -------------------------- to heat.",
         "expensive", "wonder", "interested", "compare"),
    ], 1):
        b32.append(typed(0, 4 + j, "vocab", q, key, [d1, d2, d3], bank=True))
    for j, (q, key, d1, d2, d3) in enumerate([
        ("A s _ _ _ _ is a big fish that lives in the sea and is very dangerous.",
         "shark", "whale", "seal", "dolphin"),
        ("You use it to look at things that are a long way from you. It is a t _ _ _ _ _ _ _ _ .",
         "telescope", "microscope", "telescopic", "periscope"),
        ("The red liquid that is sent around the body by the heart is b _ _ _ _ .",
         "blood", "brain", "heart", "breath"),
        ("The Sun is a star but the Earth is a p _ _ _ _ _ .",
         "planet", "plant", "plane", "plastic"),
    ], 1):
        b32.append(typed(0, 12 + j, "vocab", q, key, [d1, d2, d3]))
    bank32 = {"lesson": 32, "title": "کلمات ناقص، بانک واژه و تعریف‌ها (ص۱۰۵)", "level": "تشریحی — تایپی", "count": len(b32), "questions": b32}

    # ———— بانک ۳۳ (S4+S5+S6): چهارگزینه‌ای — ۱۲
    b33 = [
        mcq(1, 1, "vocab", "کدام گزینه با سایر گزینه‌ها متفاوت است؟ (۱) — Uranus / Mercury / Oxygen / Saturn",
            ["Uranus", "Mercury", "Oxygen", "Saturn"], 2),
        mcq(1, 2, "vocab", "کدام گزینه با سایر گزینه‌ها متفاوت است؟ (۲) — heart / moon / blood / brain",
            ["heart", "moon", "blood", "brain"], 1),
        mcq(1, 3, "vocab", "کدام گزینه با سایر گزینه‌ها متفاوت است؟ (۳) — rocky / wooden / boring / silk",
            ["rocky", "wooden", "boring", "silk"], 2),
        mcq(1, 4, "vocab", "کدام گزینه با سایر گزینه‌ها متفاوت است؟ (۴) — cloudy / sunny / rainy / funny",
            ["cloudy", "sunny", "rainy", "funny"], 3),
        mcq(1, 5, "vocab", "I was standing just ----------------- enough to hear what they were saying.",
            ["far", "even", "near", "such"], 2),
        mcq(1, 6, "vocab", "Red blood cells carry oxygen round the body and ----------------- carbon dioxide from body parts.",
            ["donate", "collect", "lose", "create"], 1),
        mcq(1, 7, "vocab", "If you need any ----------------- help, just call me.",
            ["without", "round", "drop", "extra"], 3),
        mcq(1, 8, "vocab", "We can keep our body ----------------- by doing daily exercises.",
            ["upward", "difficult", "dangerous", "healthy"], 3),
        mcq(1, 9, "grammar", "It was ----------------- holiday than the one we had last year.",
            ["a long", "a longer", "longest", "the longest"], 1),
        mcq(1, 10, "grammar", "This food is ----------------- than the food we had yesterday.",
            ["better much", "much better", "the best", "good"], 1),
        mcq(1, 11, "grammar", "They have three boys. Ali is the ----------------- and Reza is the -----------------.",
            ["oldest / youngest", "older / younger", "tall / short", "taller / shorter"], 0),
        mcq(1, 12, "grammar", "Which sentence is wrong?",
            ["That is a really ugly wooden chair.", "I carried a very small black suitcase.",
             "They have some old French paintings.", "She was wearing a red new silk dress."], 3),
    ]
    bank33 = {"lesson": 33, "title": "چهارگزینه‌ای واژگان و گرامر (ص۱۰۵-۱۰۶)", "level": "تشریحی — چهارگزینه‌ای", "count": len(b33), "questions": b33}

    # ———— بانک ۳۴ (S7+S8): تایپی — ۵
    b34 = [
        typed(2, 1, "grammar", "the cheapest / in China / is / what / of travelling / way?",
              "What is the cheapest way of travelling in China?",
              ["What is a cheapest way of travelling in China?", "What is the most cheap way of travelling in China?", "What is cheaper way of travelling in China?"],
              accepted=["What is the cheapest way of travelling in China?"]),
        typed(2, 2, "grammar", "in music / am / sport / I / interested / than / more.",
              "I am more interested in music than sport.",
              ["I am more interested in sport than music.", "I am interested in music more than sport.", "I am the most interested in music than sport."],
              accepted=["I am more interested in music than sport."]),
        typed(2, 3, "grammar", "Gold is expensive. Gold is ----------------- silver. Gold is ----------------- metal of the world.",
              "more expensive than / the most expensive",
              ["more expensive / the most expensive", "the most expensive than / more expensive", "more expensive than / the more expensive"],
              accepted=["more expensive than / the most expensive"], ph="type both blanks separated by / …"),
        typed(2, 4, "grammar", "My handwriting is bad. Your handwriting is worse ----------------- my handwriting.",
              "than", ["then", "that", "as"],
              accepted=["than"]),
        typed(2, 5, "grammar", "Neptune is ----------------- planet from the Sun in our solar system.",
              "the farthest", ["farthest", "the farther", "farther"],
              accepted=["the farthest"]),
    ]
    bank34 = {"lesson": 34, "title": "جمله‌سازی و کامل‌سازی گرامری (ص۱۰۶)", "level": "تشریحی — تایپی", "count": len(b34), "questions": b34}

    # ———— بانک ۳۵ (S9+S10): تایپی — ۷
    b35 = [
        typed(3, 1, "grammar", "Is your mother older than your father? (no)",
              "No, my father is older than my mother.",
              ["No, my mother is older than my father.", "No, my father is younger than my mother.", "Yes, my mother is younger than my father."],
              accepted=["No, my father is older than my mother.", "No, my mother is younger than my father."]),
        typed(3, 2, "grammar", "Are tigers more dangerous than lions? (as)",
              "No, tigers are as dangerous as lions.",
              ["No, tigers are more dangerous as lions.", "No, tigers are as more dangerous as lions.", "Yes, tigers are as dangerous as lions."],
              accepted=["No, tigers are as dangerous as lions."]),
        typed(3, 3, "grammar", "Is Europe bigger than Asia? (no)",
              "No, Asia is bigger than Europe.",
              ["No, Europe is bigger than Asia.", "No, Asia is smaller than Europe.", "Yes, Europe is bigger than Asia."],
              accepted=["No, Asia is bigger than Europe.", "No, Europe is smaller than Asia."]),
        typed(3, 4, "grammar", "He is as ----------------- as his cousin. He also takes care of things. (careful)",
              "careful", ["carefully", "care", "careless"], accepted=["careful"]),
        typed(3, 5, "grammar", "Why don’t you call the doctor? He looks ----------------- than last night. (bad)",
              "worse", ["worst", "bad", "badder"], accepted=["worse"]),
        typed(3, 6, "grammar", "A cat is big, a dog is bigger, an elephant is ----------------- of all. (big)",
              "the biggest", ["biggest", "bigger", "the bigger"], accepted=["the biggest"]),
        typed(3, 7, "grammar", "He always goes shopping on Fridays and he buys his clothes in ----------------- shops. (expensive)",
              "the most expensive", ["most expensive", "more expensive", "the more expensive"], accepted=["the most expensive"]),
    ]
    bank35 = {"lesson": 35, "title": "پاسخ کامل و شکل صفات (ص۱۰۶)", "level": "تشریحی — تایپی", "count": len(b35), "questions": b35}

    # ———— بانک ۳۶ (S11): آهنگِ خیزان — ۴
    b36 = [
        mcq(4, 1, "grammar", "آهنگ کدام جمله خیزان است؟ (۱) — Is this city the smallest city in the world?",
            ["falling", "rising"], 1),
        mcq(4, 2, "grammar", "آهنگ کدام جمله خیزان است؟ (۲) — He is the best student in our school.",
            ["falling", "rising"], 0),
        mcq(4, 3, "grammar", "آهنگ کدام جمله خیزان است؟ (۳) — Your dress is awful darling!",
            ["falling", "rising"], 1),
        mcq(4, 4, "grammar", "آهنگ کدام جمله خیزان است؟ (۴) — What’s your favorite season of the year?",
            ["falling", "rising"], 0),
    ]
    bank36 = {"lesson": 36, "title": "آهنگ خیزان (ص۱۰۷)", "level": "تشریحی — چهارگزینه‌ای", "count": len(b36), "questions": b36}

    # ———— بانک ۳۷ (S12): کلوزِ یوزپلنگ — ۶
    b37 = [
        mcq(5, 1, "vocab", "A cheetah is a large cat that lives in Africa. It is the fastest ---(1)--- animal and can run up to 112 kilometers per hour for a short time.",
            ["past", "future", "land", "sea"], 2),
        mcq(5, 2, "vocab", "Most cheetahs live in Africa. There are a ---(2)--- in Asia.",
            ["much", "lot", "few", "many"], 2),
        mcq(5, 3, "vocab", "Cheetahs are active during the day, and hunt in the early morning or late evening. When the cheetah hunts, it ---(3)--- and secretly moves toward its prey.",
            ["recently", "carelessly", "hardly", "slowly"], 3),
        mcq(5, 4, "vocab", "When it is close to the prey (about 10–30 meters), it ---(4)--- after it very quickly.",
            ["sleeps", "protects", "helps", "runs"], 3),
        mcq(5, 5, "vocab", "Hunters may or may not kill their prey ---(5)--- eating them. But the act of hunting always causes the death of its prey.",
            ["during", "before", "between", "after"], 1),
        mcq(5, 6, "vocab", "The cheetah cannot ---(6)--- itself against lions that would take the cheetah's prey away.",
            ["hear", "defend", "move", "carry"], 1),
    ]
    bank37 = {"lesson": 37, "title": "کلوز — یوزپلنگ (ص۱۰۷)", "level": "تشریحی — چهارگزینه‌ای", "count": len(b37), "questions": b37}

    # ———— بانک ۳۸ (S13): درک مطلبِ منظومهٔ شمسی — ۸ (۴ تایپی + ۴ درست/نادرست)
    b38 = [
        typed(6, 1, "vocab", "The Solar System is the Sun and all the objects in orbit around it. […] From closest to farthest from the Sun, they are: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus and Neptune. […] — Which planet is the closest from the Sun?",
              "Mercury", ["Venus", "Earth", "Mars"], accepted=["Mercury"]),
        typed(6, 2, "vocab", "Which planet is the farthest from the Sun?",
              "Neptune", ["Uranus", "Saturn", "Jupiter"], accepted=["Neptune"]),
        typed(6, 3, "vocab", "Which planet is the sixth planet from the Sun?",
              "Saturn", ["Jupiter", "Uranus", "Neptune"], accepted=["Saturn"]),
        typed(6, 4, "vocab", "Which planet is the fourth planet from the Sun?",
              "Mars", ["Earth", "Venus", "Mercury"], accepted=["Mars"]),
        mcq(6, 5, "vocab", "Mars is a red planet because it isn’t rocky and cold.", ["True", "False"], 1),
        mcq(6, 6, "vocab", "The temperatures on Earth are warmer than on Mars.", ["True", "False"], 0),
        mcq(6, 7, "vocab", "Mars has two small moons, called Phobos and Deimos.", ["True", "False"], 0),
        mcq(6, 8, "vocab", "The Sun is a planet because the other objects are pulled into orbit around it.", ["True", "False"], 1),
    ]
    bank38 = {"lesson": 38, "title": "درک مطلب — منظومهٔ شمسی (ص۱۰۷)", "level": "تشریحی — درست/نادرست و تایپی", "count": len(b38), "questions": b38}

    for b in [bank32, bank33, bank34, bank35, bank36, bank37, bank38]:
        data["lessons"].append(b)

    data["source"]["jame2"] = {
        "exam": "آزمون جامع تشریحی درس دوم (ص۱۰۵-۱۰۷)",
        "header": "سربرگِ چاپیِ ص۱۰۵: «\"آزمون جامع تشریحی درس دوم\" (پاسخنامه صفحه: ۲۷۲ - ۲۷۳)» — ششمین «تسی یچ»ِ لایه (رندرِ ۱۰x: تشریحی تمیز)؛ سربرگِ کلیدِ ص۲۷۲: «\"پاسخنامه آزمون جامع تشریحی درس دوم\" (آزمون صفحه: ۱۰۵ تا ۱۰۷)» — ۱۳ سکشن / ۵۸ آیتم (۴+۸+۴+۴+۴+۴+۲+۳+۳+۴+۴+۶+۸)",
        "keyPages": "272-273",
        "keyVerification": "print key pp272-273 «پاسخنامه آزمون جامع تشریحی درس دوم» — گریدهای ۱۳ سکشن — 58/58 agree with semantic pre-fill, zero divergence؛ S9 مدخل‌های ۱/۳ دو واریانتِ چاپی دارند (هر دو در accepted: «No, my father is older than my mother.» / «No, my mother is younger than my father.» و «No, Asia is bigger than Europe.» / «No, Europe is smaller than Asia.»)؛ S11 کلیدِ دوگانهٔ ۱و۳ = خیزان (باقی افتان)",
        "extractedRound": "r336",
        "pattern": "r331 (جامعِ مخلوط — بانک به ازای خانوادهٔ سکشن) + r311/r323 (تایپی) + r329 (options[0]=کلید چاپ) + r333-S3 (کلیدِ اسلش‌دارِ دوجای‌خالی) + r322-l22 (آهنگ با کلیدِ دوگانهٔ چاپ) + r318 (سربرگِ رندر حاکم) + r303",
        "printQuirks": [
            "سربرگِ آزمون: «\"آزمون جامع تشریحی درس دوم\" (پاسخنامه صفحه: ۲۷۲ - ۲۷۳)» — لایه «تسی یچ» = scramblingِ «تشریحی» (ششمین تکرارِ درسِ r318/r331/r333/r334)؛ رندرِ ۱۰x هر دو سربرگِ ص۱۰۵ و ص۲۷۲",
            "S11 عنوان: «آهنگ کدام جمله خیزان است؟ (Rising Intonation) (نمره ۰/۵)» — لایه «ر ن / خیان» = scramblingِ «خیزان» (رندرِ ۱۲x)؛ درسِ r331 «افتان» بود",
            "S9 عنوان: «از کلمات داخل پرانتز استفاده کنید و به سؤالات زیر پاسخ کامل دهید. (نمره ۱/۵)» — لایه «پر ن/انی» = «پرانتز» + «سؤاالت» = تجزیهٔ لایگِچرِ «سؤالات» (رندر ۱۲x)",
            "بانکِ واژهٔ S2: «wonder / expensive / compare / interested / heavens / suitable / happened / microscope / healthy» — ۹ واژه برای ۸ جای خالی؛ «heavens» واژهٔ اضافیِ چاپی (رندر ۱۲x: h-e-a-v-e-n-s) — عینِ چاپ",
            "S6-Q3 گزینه‌ها با فرمِ «a. oldest / youngest» (اسلشِ داخلِ گزینه) — چاپِ ردیفِ فشرده در لایه، محتوا تمیز",
            "S7 دو تمرین با ساختارِ «واژه‌ها + خطِ پاسخِ شماره‌دار» — کلیدِ چاپیِ جمله‌ها در ص۲۷۲: «What is the cheapest way of travelling in China?» و «I am more interested in music than sport.»",
            "S8-1 دوجای‌خالی با کلیدِ اسلش‌دارِ چاپی «more expensive than / the most expensive» (الگوی r333-S3)",
            "S9-1/3 کلیدِ دوواریانته: ص۲۷۳ هر دو فرم را چاپ کرده («No, my father is older than my mother.» یا «No, my mother is younger than my father.» / «No, Asia is bigger than Europe.» یا «No, Europe is smaller than Asia.») — هر دو در accepted؛ نخستین مدخلِ دوواریانتهٔ کاملِ این خانواده",
            "S12 متنِ کلوزِ یوزپلنگ با نشانگرهای چاپیِ «---(N)---» + بازهٔ «(about 10–30 meters)» با خطِ تیرهٔ en؛ گزینه‌ها در جدولِ ۶ردیفیِ زیرِ متن",
            "S13 ریدینگِ منظومهٔ شمسی — ۴ پرسشِ کوتاه‌نویس با پرانتزِ پاسخِ سبزِ «(-----------------)» + ۴ درست/نادرست با «(True or False)» — الگوی r331-l24",
            "پرانتزهای پاسخِ سبزِ S13: «(-----------------)» ۱۷ تیره — عینِ چاپ در صورتِ سؤال‌ها نیست (فقط جایگاه)؛ سؤال‌ها عیناً از لایه",
            "مرزِ پایانی: ص۱۰۸ سربرگِ «آزمون نیمسال اول ۹۸-۹۹» (آزمونِ واقعیِ آموزش‌وپرورشِ بوکان — «بررسی سؤالات (توجه: این آزمون پاسخنامه ندارد)»، سؤال‌های A-N) است — خارج از محتوای این راند؛ مادهٔ راندِ بعد (کلیدِ چاپی ندارد — نیازمندِ خودکلیدیِ کامل)",
            "جعبهٔ Note خالی در ص۱۱۲ (الگوی r330/r334)",
        ],
    }

    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = sum(l["count"] for l in data["lessons"])
    print(f"added lessons 32-38: {sum(l['count'] for l in [bank32,bank33,bank34,bank35,bank36,bank37,bank38])} items → banks={len(data['lessons'])}, total={total}")
