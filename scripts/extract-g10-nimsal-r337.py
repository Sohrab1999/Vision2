# -*- coding: utf-8 -*-
# r337 — استخراجِ «آزمون نیمسال اول ۹۸-۹۹ — بوکان» جزوهٔ دهم (ص۱۰۸-۱۱۱؛ ص۱۱۲ برگهٔ Noteٔ خالی)
# به public/jozve/tests-g10.json — چهارده بانکِ ۳۹-۵۲ (الگوی r331/r336 — بانک به ازای خانوادهٔ سکشن):
# A تایپی با بانک واژه ۸ / B متعلقِ متفاوت ۶ / C حرفِ اول ۶ / D مفرد-جمعِ اسلش‌دار ۳ /
# E آهنگ ۴ / F واژگان ۶ / G وصلِ کردنی ۶ (۷ ستون) / H تصویر ۱ / I شکلِ صحیح ۴ (Q43 اسلش‌دار) /
# J گرامر ۶ / K جمله‌سازی ۲ / L کلوزِ دیالوگ با بانک واژه ۸ / M کلوزِ مریخ ۶ / N مخلوط ۶ = ۷۲ آیتم (۷۶ اسلات).
# نخستین آزمونِ بی‌کلیدِ چاپیِ این خانواده — «توجه: این آزمون پاسخنامه ندارد» — خودکلیدیِ کاملِ ۷۲/۷۲
# با دو گذرِ مستقل (پیش‌پرکردنِ معنایی + داوریِ گرامریِ مستقل) — الگویِ r300-r307 (آزمون‌های رسمیِ دوازدهم).
# اسلات‌ها: ۷۶ (D سه جمله دوجای‌خالی + I-43 دوجای‌خالی) — آیتم‌ها: ۷۲ (هر جمله/سؤال یک آیتم).
# داوری‌های رندر (۶۰۰-۹۰۰dpi):
# سربرگِ رسمی ص۱۰۸: «ماده درسی : زبان انگلیسی دهم» + «اداره کل آموزش و پرورش آذربایجان غربی /
# آموزش و پرورش شهرستان بوکان» + «مدت آزمون : ۷۰ دقیقه» + «آزمون نیمسال اول / سال تحصیلی ۹۸-۹۹» +
# «تعداد سؤال: A - N» + «تعداد صفحه: ۴ صفحه» + نوارِ زردِ «شرح سؤالات (توجه: این آزمون پاسخنامه ندارد)».
# سربرگِ H: «look at the picture and then answer the fallowing question:» — چاپِ «fallowing» (۹۰۰x — عینِ چاپ).
# Q21: «four--------------» چسبیده (بدون فاصله) برخلاف «a ---» فاصله‌دار. Q49: «as-----------------» چسبیده —
# «as» اول در ساقه، گزینهٔ c «deep as» دومین as را می‌دهد. Q71: «find safe place» بدونِ «a». Q70-c «find» بدونِ s.
# بانکِ L: آخرین جداکننده «die out — increasing» با em-dash برخلاف بقیه (hyphen). K: توکنِ پایانی «is / ?» و «going to / .».
# Idempotent: اجرای دوم NO-OP (مبنا = ۳۸ بانکِ r323-r336 / ۶۰۵ آیتم).
import json
from pathlib import Path

PATH = Path("public/jozve/tests-g10.json")

BL = "-" * 24  # جای خالیِ بلندِ استاندارد (تیره‌های چاپ ۱۶-۳۰ متغیر — نمایشیِ یکنواخت)

BANK_A = "future - famous - moon - hunters - breakfast - collects - instead - carry - microscope"
BANK_L = "plains - protect - alive - cheetahs - destroy - endangered - visit - die out - increasing"

def typed(i, n, cat, q, key, distractors, accepted=None, bank=False, ph="type your answer…"):
    item = {
        "id": f"g10-l{39 + i}-{n}", "n": n, "category": cat, "kind": "typed",
        "question": q + (f" [bank: {BANK_L if i == 11 else BANK_A}]" if bank else ""),
        "options": [key] + distractors, "answer": 0,
        "accepted": accepted or [key], "placeholder": ph,
    }
    return item

def mcq(i, n, cat, q, opts, key):
    return {"id": f"g10-l{39 + i}-{n}", "n": n, "category": cat, "question": q, "options": opts, "answer": key}

data = json.loads(PATH.read_text(encoding="utf-8"))
existing = [l for l in data["lessons"] if l["lesson"] >= 39]
if existing:
    print(f"lessons 39+ already present ({sum(l['count'] for l in existing)} items) — NO-OP")
else:
    assert len(data["lessons"]) == 38, f"baseline mismatch: {len(data['lessons'])} banks"

    # ———— بانک ۳۹ (بخش A): تایپی با بانک واژه — ۸ (یک واژهٔ اضافی: future)
    b39 = []
    for j, (q, key, d1, d2, d3) in enumerate([
        ("A healthy ---------------- can give you more energy.",
         "breakfast", "future", "collects", "moon"),
        ("Monkeys ---------------- their babies all day long.",
         "carry", "collects", "famous", "future"),
        ("The school bus ---------------- the children each morning.",
         "collects", "carry", "famous", "moon"),
        ("Gahar Lake is ---------------- for its clear water.",
         "famous", "future", "moon", "carry"),
        ("The sky is cloudy. We cannot see the ---------------- tonight.",
         "moon", "breakfast", "famous", "future"),
        ("The ---------------- killed the tiger and destroyed its home.",
         "hunters", "collects", "future", "instead"),
        ("There’s no coffee. Would you like a cup of tea ----------------?",
         "instead", "famous", "hunters", "moon"),
        ("You need a powerful ---------------- to see something so small.",
         "microscope", "breakfast", "future", "famous"),
    ], 1):
        b39.append(typed(0, j, "vocab", q, key, [d1, d2, d3], bank=True))

    # ———— بانک ۴۰ (بخش B): متعلقِ متفاوت — ۶ MCQ
    b40 = [
        mcq(1, 1, "vocab", "کدام گزینه با سایر گزینه‌ها متفاوت است؟ (۱) — boring / amazing / wonderful / interesting",
            ["boring", "amazing", "wonderful", "interesting"], 0),
        mcq(1, 2, "vocab", "کدام گزینه با سایر گزینه‌ها متفاوت است؟ (۲) — heart / brain / blood / moon",
            ["heart", "brain", "blood", "moon"], 3),
        mcq(1, 3, "vocab", "کدام گزینه با سایر گزینه‌ها متفاوت است؟ (۳) — Mars / Saturn / Jupiter / Sun",
            ["Mars", "Saturn", "Jupiter", "Sun"], 3),
        mcq(1, 4, "vocab", "کدام گزینه با سایر گزینه‌ها متفاوت است؟ (۴) — zookeepers / lakes / teachers / farmers",
            ["zookeepers", "lakes", "teachers", "farmers"], 1),
        mcq(1, 5, "vocab", "کدام گزینه با سایر گزینه‌ها متفاوت است؟ (۵) — sheep / cat / lion / goat",
            ["sheep", "cat", "lion", "goat"], 0),
        mcq(1, 6, "vocab", "کدام گزینه با سایر گزینه‌ها متفاوت است؟ (۶) — hunt / kill / die out / live",
            ["hunt", "kill", "die out", "live"], 3),
    ]

    # ———— بانک ۴۱ (بخش C): تایپی با حرفِ اول — ۶
    b41 = []
    for j, (q, key, d1, d2, d3) in enumerate([
        ("A large and round body of rock or gas that moves around the Sun is (p _ _ _ _ _ ).",
         "planet", "plain", "place", "plate"),
        ("An (o _ _ _ _ _ _ _ _ _ _ ) is a place from which people can watch the planets and stars.",
         "observatory", "orbit", "observer", "office"),
        ("The fattiest organ inside your head that controls your body is your (b _ _ _ _ ).",
         "brain", "body", "blood", "bone"),
        ("Viruses usually (a _ _ _ _ _ ) your body and make you sick!",
         "attack", "appear", "argue", "arrive"),
        ("One easy way to protect wildlife is learning about endangered (a _ _ _ _ _ _ ).",
         "animals", "areas", "attacks", "amounts"),
        ("The brave soldiers (d _ _ _ _ _ ) our country in war.",
         "defend", "damage", "drop", "destroy"),
    ], 1):
        b41.append(typed(2, j, "vocab", q, key, [d1, d2, d3],
                         ph="complete the word (first letter is given)…"))

    # ———— بانک ۴۲ (بخش D): مفرد/جمعِ داخل پرانتز — ۳ تایپیِ دوجای‌خالیِ اسلش‌دار
    b42 = []
    for j, (q, key, d1, d2, d3) in enumerate([
        ("I saw a -------------- ( bag ) and four-------------- ( box ) on the table.",
         "bag / boxes", "bags / box", "bag / box", "bags / boxes"),
        ("We keep some -------------- ( wolf ) and -------------- ( lion ) in our zoo.",
         "wolves / lions", "wolfs / lions", "wolves / lion", "wolf / lion"),
        ("There are many -------------- ( tree ) in this -------------- ( city ).",
         "trees / city", "tree / city", "trees / citys", "tree / citys"),
    ], 1):
        b42.append(typed(3, j, "grammar", q, key, [d1, d2, d3],
                         ph="complete both blanks (use / between the two answers)…"))

    # ———— بانک ۴۳ (بخش E): آهنگِ افتان یا خیزان — ۴ MCQ
    b43 = [
        mcq(4, 1, "grammar", "لحن صدای جملهٔ زیر را مشخص کنید (۱) — His brother was injured in the car accident.",
            ["falling", "rising"], 0),
        mcq(4, 2, "grammar", "لحن صدای جملهٔ زیر را مشخص کنید (۲) — It is fantastic!",
            ["falling", "rising"], 0),
        mcq(4, 3, "grammar", "لحن صدای جملهٔ زیر را مشخص کنید (۳) — Will they go hunting next week?",
            ["falling", "rising"], 1),
        mcq(4, 4, "grammar", "لحن صدای جملهٔ زیر را مشخص کنید (۴) — What are you going to do this weekend?",
            ["falling", "rising"], 0),
    ]

    # ———— بانک ۴۴ (بخش F): چهارگزینه‌ای واژگان — ۶
    b44 = [
        mcq(5, 1, "vocab", "Pay attention! Don’t swim in this river. It’s very ------------------.",
            ["natural", "dangerous", "safe", "alive"], 1),
        mcq(5, 2, "vocab", "Everyone needs to ------------------- for the future.",
            ["cut", "destroy", "hurt", "plan"], 3),
        mcq(5, 3, "vocab", "Please wash your shirt. There are some --------------- on it.",
            ["events", "hills", "texts", "drops"], 3),
        mcq(5, 4, "vocab", "Some of our kind relatives --------------- their blood to those who need it.",
            ["pump", "draw", "decide", "donate"], 3),
        mcq(5, 5, "vocab", "--------------- always try to save people’s lives and put out the fire quickly.",
            ["zookeepers", "Firefighters", "doctors", "hunters"], 1),
        mcq(5, 6, "vocab", "If you pay ---------------- to your teacher in class, you will learn a lot.",
            ["attention", "hope", "danger", "future"], 0),
    ]

    # ———— بانک ۴۵ (بخش G): وصلِ ستون A به B (یک معنای اضافی) — ۶ MCQ با ۷ گزینه
    G_OPTS = [
        "the time after now",                                # a
        "in place of someone or something else",             # b
        "good for your body",                                # c
        "to protect somebody or something",                  # d  (اضافی)
        "not many; a small number of things or people",      # e
        "things that are true or that really happened",      # f
        "to go and get somebody or something",               # g
    ]
    b45 = []
    for j, (word, key) in enumerate([
        ("healthy", 2), ("collect", 6), ("fact", 5),
        ("a few", 4), ("instead", 1), ("future", 0),
    ], 1):
        b45.append(mcq(6, j, "vocab",
                       f"واژهٔ ستون A را به معنای درست آن در ستون B وصل کنید (یک معنا اضافی است) — {word}",
                       G_OPTS, key))

    # ———— بانک ۴۶ (بخش H): پاسخ با تصویر — ۱ تایپی
    b46 = [typed(7, 1, "grammar",
                 "( picture: two children playing football ) — What are the children going to do tomorrow?",
                 "They are going to play football.",
                 ["They are going to play volleyball.", "They are going to swim.", "They played football yesterday."],
                 accepted=["They are going to play football.", "They’re going to play football.",
                           "They are going to play football tomorrow.", "They’re going to play football tomorrow."],
                 ph="answer using the picture cues…")]

    # ———— بانک ۴۷ (بخش I): شکلِ صحیحِ واژه‌های پرانتز — ۴ تایپی (Q43 اسلش‌دار)
    b47 = [
        typed(8, 1, "grammar", f"Mr. Smith’s house is {BL} of all in the village. (beautiful)",
              "the most beautiful", ["more beautiful", "as beautiful as", "the more beautiful"]),
        typed(8, 2, "grammar", "My mother will ------------------ fish and rice tomorrow night. (to cook)",
              "cook", ["cooks", "cooking", "to cook"]),
        typed(8, 3, "grammar", "Where -------- the tourists ------------------ next Friday? (be going to / to visit)",
              "are going to / visit", ["is going to / visit", "are going to / visiting", "goes to / visit"],
              ph="complete both blanks (use / between the two answers)…"),
        typed(8, 4, "grammar", f"This city is {BL} city in the west of our country. (far)",
              "the farthest", ["farther than", "as far as", "the most far"],
              accepted=["the farthest", "the furthest"]),
    ]

    # ———— بانک ۴۸ (بخش J): چهارگزینه‌ای گرامر — ۶
    b48 = [
        mcq(9, 1, "grammar", "There are a lot of beautiful -------------- in the plains of Iran.",
            ["zebra", "a zebras", "an zebra", "zebras"], 3),
        mcq(9, 2, "grammar", "It’s Helen’s birthday next week. We are going --------------- her a gift.",
            ["give", "to give", "giving", "will give"], 1),
        mcq(9, 3, "grammar", "Now we know that Jupiter is the --------------- planet.",
            ["large", "larger than", "as large as", "largest"], 3),
        mcq(9, 4, "grammar", "Are sharks --------------- animals in the sea?",
            ["more dangerous", "dangerouser", "the most dangerous", "dangerous"], 2),
        mcq(9, 5, "grammar", "This part of the river is as----------------- that part.",
            ["deeper", "deep", "deep as", "the deepest"], 2),
        mcq(9, 6, "grammar", "That day was ------------------ day of the firefighter’s life.",
            ["the worst", "bad", "worse than", "as bad as"], 0),
    ]

    # ———— بانک ۴۹ (بخش K): مرتب‌سازیِ جمله‌ها — ۲ تایپی
    b49 = [
        typed(10, 1, "grammar", "the best / the class / his brother / in / student / is / ?",
              "Is his brother the best student in the class?",
              ["His brother the best student in the class is?",
               "Is the best his brother student in the class?",
               "His brother is the best in the class student?"],
              ph="make a sentence with the given words…"),
        typed(10, 2, "grammar", "in the bank / are / some money / save / they / going to / .",
              "They are going to save some money in the bank.",
              ["They are going to save in the bank some money.",
               "They going to are save some money in the bank.",
               "They are going to save some money on the bank."],
              ph="make a sentence with the given words…"),
    ]

    # ———— بانک ۵۰ (بخش L): کلوزِ دیالوگ با بانک واژه — ۸ تایپی (یک واژهٔ اضافی: destroy)
    b50 = []
    for j, (q, key, d1, d2, d3) in enumerate([
        ("Raman: Yeah! Well, my family and I are going to ---(53)--- a Museum of Nature and Wildlife on the weekend.",
         "visit", "protect", "destroy", "die out"),
        ("Raman: …and I really like to know more about ---(54)--- animals.",
         "endangered", "alive", "increasing", "plains"),
        ("Arshan: …for example, I watched a movie about Iranian ---(55)--- last night.",
         "cheetahs", "alive", "visit", "protect"),
        ("Raman: Nice! I heard that very few of them are ---(56)---.",
         "alive", "increasing", "protect", "cheetahs"),
        ("Arshan: Right, but their number is ---(57)--- because people are taking care of them.",
         "increasing", "die out", "alive", "visit"),
        ("Raman: We should learn to ---(58)--- them.",
         "protect", "destroy", "die out", "visit"),
        ("Raman: If we don’t pay attention to them, they will ---(59)---.",
         "die out", "protect", "increasing", "alive"),
        ("Raman: They live on the ---(60)--- of our country like Moghan.",
         "plains", "cheetahs", "destroy", "endangered"),
    ], 1):
        b50.append(typed(11, j, "vocab", q, key, [d1, d2, d3], bank=True))

    # ———— بانک ۵۱ (بخش M): کلوزِ مریخ — ۶ MCQ
    b51 = [
        mcq(12, 1, "vocab", "In the future people from different ---(61)--- such as Asia, Africa, or America can live on Mars.",
            ["nations", "churches", "offices", "planets"], 0),
        mcq(12, 2, "vocab", "But there are many ---(62)--- that make it hard to live there.",
            ["emergencies", "problems", "exercises", "attention"], 1),
        mcq(12, 3, "vocab", "For example, on Mars we don’t have ---(63)--- or water to live.",
            ["roads", "wars", "oxygen", "qualities"], 2),
        mcq(12, 4, "vocab", "And our blood can’t ---(64)--- around our body easily.",
            ["burn", "move", "collect", "protect"], 1),
        mcq(12, 5, "vocab", "There is no ---(65)--- on Mars so it is really dark.",
            ["cell", "microbe", "circle", "light"], 3),
        mcq(12, 6, "vocab", "And something really wonderful is the difference in your ---(66)--- on Mars: You are younger than that time on earth.",
            ["age", "heart", "fact", "part"], 0),
    ]

    # ———— بانک ۵۲ (بخش N): درک مطلبِ پنگوئن‌ها — ۸ مخلوط (۲ تایپی + ۲ MCQ + ۴ T-F)
    b52 = [
        typed(13, 1, "vocab", "Penguins are amazing birds. […] Hundreds of penguins get together and walk more than 100 kilometers. They walk to find a safe place for the mothers to lay eggs. Fathers take care of the eggs and mothers walk to the sea to find food for their chicks. […] — Why do mothers walk to the sea?",
              "To find food for their chicks.",
              ["To lay eggs in the sea.", "To take care of the eggs.", "To hatch the eggs."],
              accepted=["To find food for their chicks.",
                        "They walk to the sea to find food for their chicks.",
                        "To find food for the chicks.",
                        "Because they want to find food for their chicks."]),
        typed(13, 2, "vocab", "Penguins are amazing birds. They go on a very long trip every year. […] — Why do penguins make a long trip every year?",
              "To find a safe place for the mothers to lay eggs.",
              ["To find food for their chicks.", "To take care of the eggs.", "To walk more than 100 kilometers."],
              accepted=["To find a safe place for the mothers to lay eggs.",
                        "They walk to find a safe place for the mothers to lay eggs.",
                        "Because they want to find a safe place for the mothers to lay eggs.",
                        "They go on a very long trip to find a safe place for the mothers to lay eggs."]),
        mcq(13, 3, "vocab", "The underlined word “them” in line six refers to ---------------.",
            ["parents", "chicks", "penguins", "fathers"], 1),
        mcq(13, 4, "vocab", "When an egg hatches, a chick ---------------.",
            ["comes out", "leaves its parent", "find a safe place", "goes on a long trip"], 0),
        mcq(13, 5, "vocab", "Penguins walk to find safe place just to take care of their chicks.",
            ["True", "False"], 1),
        mcq(13, 6, "vocab", "Fathers keep the eggs on their feet because it’s too cold on the ice.",
            ["True", "False"], 0),
    ]

    bank39 = {"lesson": 39, "title": "بخش A — کلمات ناقص با بانک واژه (ص۱۰۸)", "level": "تشریحی — تایپی با بانک واژه", "count": len(b39), "questions": b39}
    bank40 = {"lesson": 40, "title": "بخش B — متعلقِ متفاوت (ص۱۰۸)", "level": "چهارگزینه‌ای — متعلقِ متفاوت", "count": len(b40), "questions": b40}
    bank41 = {"lesson": 41, "title": "بخش C — تعریف با حرفِ اول (ص۱۰۸)", "level": "تشریحی — تایپی با حرفِ اول", "count": len(b41), "questions": b41}
    bank42 = {"lesson": 42, "title": "بخش D — مفرد/جمعِ واژه‌های پرانتز (ص۱۰۸)", "level": "تشریحی — تایپی دوجای‌خالیِ اسلش‌دار", "count": len(b42), "questions": b42}
    bank43 = {"lesson": 43, "title": "بخش E — آهنگِ افتان یا خیزان (ص۱۰۸)", "level": "چهارگزینه‌ای — آهنگ", "count": len(b43), "questions": b43}
    bank44 = {"lesson": 44, "title": "بخش F — چهارگزینه‌ای واژگان (ص۱۰۹)", "level": "چهارگزینه‌ای — واژگان", "count": len(b44), "questions": b44}
    bank45 = {"lesson": 45, "title": "بخش G — وصلِ ستون A به B (ص۱۰۹)", "level": "چهارگزینه‌ای — وصلِ کردنی (۷ گزینه)", "count": len(b45), "questions": b45}
    bank46 = {"lesson": 46, "title": "بخش H — پاسخ با تصویر (ص۱۰۹)", "level": "تشریحی — تایپی با تصویر", "count": len(b46), "questions": b46}
    bank47 = {"lesson": 47, "title": "بخش I — شکلِ صحیحِ واژه‌های پرانتز (ص۱۰۹)", "level": "تشریحی — تایپی", "count": len(b47), "questions": b47}
    bank48 = {"lesson": 48, "title": "بخش J — چهارگزینه‌ای گرامر (ص۱۱۰)", "level": "چهارگزینه‌ای — گرامر", "count": len(b48), "questions": b48}
    bank49 = {"lesson": 49, "title": "بخش K — مرتب‌سازیِ جمله‌ها (ص۱۱۰)", "level": "تشریحی — تایپی جمله‌سازی", "count": len(b49), "questions": b49}
    bank50 = {"lesson": 50, "title": "بخش L — کلوزِ دیالوگ با بانک واژه (ص۱۱۰)", "level": "تشریحی — تایپی با بانک واژه", "count": len(b50), "questions": b50}
    bank51 = {"lesson": 51, "title": "بخش M — کلوزِ مریخ (ص۱۱۱)", "level": "چهارگزینه‌ای — کلوز", "count": len(b51), "questions": b51}
    bank52 = {"lesson": 52, "title": "بخش N — درک مطلبِ پنگوئن‌ها (ص۱۱۱)", "level": "مخلوط — تایپی + درست/نادرست", "count": len(b52), "questions": b52}

    for b in [bank39, bank40, bank41, bank42, bank43, bank44, bank45, bank46,
              bank47, bank48, bank49, bank50, bank51, bank52]:
        data["lessons"].append(b)

    data["source"]["nimsal"] = {
        "exam": "آزمون نیمسال اول ۹۸-۹۹ — آموزش‌وپرورش شهرستان بوکان (ص۱۰۸-۱۱۱؛ ص۱۱۲ برگهٔ Noteٔ خالیِ خط‌چین)",
        "header": "سربرگِ رسمیِ ص۱۰۸ (رندرِ ۶۰۰dpi): «ماده درسی : زبان انگلیسی دهم» + «اداره کل آموزش و پرورش آذربایجان غربی / آموزش و پرورش شهرستان بوکان» + «شعبه کلاس : تجربی / ریاضی / انسانی» + «مدت آزمون : ۷۰ دقیقه» + «آزمون نیمسال اول / سال تحصیلی ۹۸-۹۹» + «تعداد سؤال: A - N» + «تعداد صفحه: ۴ صفحه» + نوارِ زردِ «شرح سؤالات (توجه: این آزمون پاسخنامه ندارد)» — چهارده سکشنِ A تا N با بارمِ چاپیِ ۴+۳+۳+۳+۲+۳+۳+۱+۲+۳+۲+۴+۳+۴ = ۴۰ نمره («جمع بارم: 40 نمره» پاصفحهٔ ص۱۱۱ + «موفق و مؤید باشید»)",
        "keyPages": "—",
        "keyVerification": "هیچ کلیدِ چاپی وجود ندارد («توجه: این آزمون پاسخنامه ندارد» — نخستین آزمونِ بی‌کلیدِ خانوادهٔ دهم) — خودکلیدیِ کاملِ ۷۲/۷۲ آیتم (۷۶ اسلات) با دو گذرِ مستقل: (۱) پیش‌پرکردنِ معناییِ همهٔ اسلات‌ها، (۲) داوریِ گرامریِ مستقلِ به ازای هر آیتم با قاعده‌نویسیِ صریح — الگویِ r300-r307 (آزمون‌های رسمیِ دوازدهم)؛ واگراییِ بینِ دو گذر: صفر؛ بانکِ A و L هر دو ۹واژه‌ای با یک اضافی (future / destroy) — سازگار با تعدادِ اسلات‌ها؛ بارمِ چاپیِ هر سکشن در سربرگِ خودِ سکشن (مجموع ۴۰/۴۰)",
        "selfKeying": "A: ۸ اسلات از ۹ واژه — extra = future (تنها واژهٔ بی‌اسلات پس از پرکردنِ معناییِ همهٔ جمله‌ها: breakfast/carry/collects/famous/moon/hunters/instead/microscope)؛ B: استدلالِ هر ردیف — ۹: boring منفی در برابر ۳ صفتِ مثبت؛ ۱۰: moon غیرِ اندامِ بدن؛ ۱۱: Sun ستاره نه سیاره؛ ۱۲: lakes مکان نه شغل؛ ۱۳: sheep جمع (شکلِ بی‌تغییر) در برابر ۳ مفرد؛ ۱۴: live نقطهٔ مقابلِ hunt/kill/die out؛ C: تعریف‌های مستقیم با حرفِ اولِ چاپی سازگار (planet/observatory/brain/attack/animals/defend)؛ D: قاعدهٔ مفرد/جمعِ بعد از a/four/some/many/this؛ E: ۲۴ خبری→افتان، ۲۵ تعجبی→افتان، ۲۶ پرسشِ بله/خیر→خیزان، ۲۷ پرسشِ Wh→افتان؛ F: واژگانِ درسی؛ G: تطبیقِ معناییِ ۶ واژه از ۷ معنا — extra = d (to protect somebody or something)؛ H: تصویرِ دو کودک در حالِ فوتبال؛ I: عالیِ the most beautiful + will + مصدرِ ساده + are going to / visit + عالیِ the farthest (furthest نیز پذیرفته)؛ J: ۴۵ جمعِ zebra→zebras (a/an + جمعِ نادرست)؛ ۴۶ going + to + مصدر؛ ۴۷/۴۸ عالی؛ ۴۹ ساختارِ as…as (as اول در ساقه — گزینهٔ c دومین as را می‌دهد)؛ ۵۰ عالیِ the worst؛ K: مرتب‌سازی با نشانهٔ پایانی (؟/.→ پرسشِ Is…؟ و خبریِ They are…)؛ L: کلوزِ دیالوگ (visit/endangered/cheetahs/alive/increasing/protect/die out/plains — extra = destroy)؛ M: کلوزِ مریخ (nations/problems/oxygen/move/light/age)؛ N: پاسخِ کاملِ چرا (۶۷/۶۸) + ارجاعِ ضمیرِ them→chicks (متن: parents leave them to take care of themselves — مرجعِ نزدیکِ chicks) + comes out (hatch = جوجه از تخم درآمدن — واژه‌نامهٔ چاپی) + ۷۱ نادرست («just to take care of their chicks» عینِ متن نیست — هدفِ اصلی مکانِ امن برای تخم‌گذاری) + ۷۲ درست (عینِ جملهٔ متن)",
        "extractedRound": "r337",
        "pattern": "r331/r336 (بانک به ازای خانوادهٔ سکشن — ۱۴ بانک) + r300-r307 (خودکلیدیِ آزمون‌های رسمی) + r323/r326 (حرفِ اولِ تایپی) + r333-S3/r336-S8 (کلیدِ اسلش‌دارِ دوجای‌خالی) + r322-l22 (آهنگ) + r331-S12 (وصلِ ستونی با گزینه‌های ستون) + r331-S9 (تصویر) + r336-l38 (مخلوطِ T-F + تایپی) + r303",
        "printQuirks": [
            "سربرگِ رسمی: «تعداد سؤال: A - N» + «مدت آزمون : ۷۰ دقیقه» + «آزمون نیمسال اول / سال تحصیلی ۹۸-۹۹» + «آموزش و پرورش شهرستان بوکان» + نوارِ زردِ «شرح سؤالات (توجه: این آزمون پاسخنامه ندارد)» — نخستین آزمونِ بی‌کلیدِ این خانواده",
            "سربرگِ بخش H: «look at the picture and then answer the fallowing question:» — چاپِ «fallowing» (رندر ۹۰۰x — غلطِ تایپیِ چاپ برای following)؛ عینِ چاپ محفوظ ماند",
            "Q21: «four--------------» چسبیده به تیره‌ها (بدون فاصله) در حالی‌که «a ---» فاصله‌دار — ناهماهنگیِ فاصلهٔ چاپ؛ عینِ چاپ",
            "Q49: «as-----------------» چسبیده به تیره‌ها — «as» اول داخلِ ساقه است و گزینهٔ c «deep as» دومین as را می‌دهد — کلیدِ c",
            "Q71: «Penguins walk to find safe place just to take care of their chicks.» — «a» قبل از safe place چاپ نشده؛ عینِ چاپ؛ خودکلیدی = False (قیدِ just ادعای متن را نادرست می‌کند)",
            "Q70 گزینهٔ c: «find a safe place» بدونِ s (فعلِ سوم‌شخصِ ناهماهنگ) — عینِ چاپ",
            "بانکِ L: جداکنندهٔ آخر «die out — increasing» با خطِ تیرهٔ بلند (em-dash) برخلافِ بقیهٔ جداکننده‌ها (hyphen) — عینِ چاپ؛ واژهٔ اضافی = destroy",
            "K-51 توکنِ پایانی «is / ?» و K-52 «going to / .» — نشانهٔ پایانی بعد از اسلش، جدا از جمله — عینِ چاپ",
            "سربرگِ G: «there’s 1 extra meaning» با زیرخطِ زیرِ ۱ — هفت معنا برای شش واژه (ستون B حروفِ a-g دارد)",
            "پاصفحهٔ ص۱۱۱: «موفق و مؤید باشید» + «جمع بارم: 40 نمره» — و ص۱۱۲ تماماً برگهٔ «Note:» خالیِ خط‌چین (بدونِ سؤال)",
            "جغرافیای بومی: Gahar Lake (Q4) و Moghan (Q60) — همان رویکردِ بومی‌گرایِ جزوهٔ بوکان (قرینهٔ r336)؛ «zookeepers» جمع در Q12 (خانوادهٔ zookeeperِ r336)",
            "تیره‌های جای خالی ۱۶-۳۰ متغیر در چاپ؛ در بازسازی یکنواخت شد (BL) — طولِ تیره محتوایی نیست",
        ],
    }

    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    n_new = sum(b["count"] for b in [bank39, bank40, bank41, bank42, bank43, bank44, bank45, bank46,
                                     bank47, bank48, bank49, bank50, bank51, bank52])
    print(f"r337 done: 14 banks appended ({n_new} items); total banks={len(data['lessons'])}, items={sum(l['count'] for l in data['lessons'])}")
