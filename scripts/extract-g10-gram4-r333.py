# -*- coding: utf-8 -*-
# r333 — استخراجِ «آزمون تشریحی گرامر درس دوم (انواع صفات)» جزوهٔ دهم (ص۹۷-۹۸، کلیدِ ص۲۶۴)
# به public/jozve/tests-g10.json — چهار بانکِ ۲۶-۲۹: S1 شکلِ صفات (۱۵ تایپی) + S2 جمله‌سازی (۷ تایپی)
# + S3 کامل‌کردنِ دوجای‌خالی (۱۰ تایپی) + S4 چهارگزینه‌ای (۱۲) — عینِ الگوی r329 (تشریحیِ گرامرِ درس اول).
# کلیدِ چاپی: 44/44 هم‌رأی — صفر واگرایی. داوری‌های ۲۲۰۰-۲۶۰۰dpi:
# سربرگ «تشریحی» (لایه «تسی یچ» — سومین تکرارِ درسِ r318/r331، هر دو سربرگ با یک زوم)؛
# S3-Q1 لایه دو جمله را جابه‌جا داده بود (چاپ: «I am 20… My brother is 25»)؛
# S4-Q2 ترتیبِ a/b در لایه جابه‌جا (چاپ: a=hotter/hottest → کلید a)؛
# S4-Q7 «as» اول در لایه غایب؛ Q6 «20th» با th بالانویس؛ کلیدهای «than»-دار (Q7/14/15) برخلافِ Q1/4/8/11/12.
# Idempotent: اجرای دوم NO-OP (مبنا = ۲۵ بانکِ r323-r332 / ۴۳۸ آیتم).
import json
from pathlib import Path

PATH = Path("public/jozve/tests-g10.json")

D39 = "-" * 39      # خطِ تیرهٔ S1 (مجموعِ جعبه‌های لایه)
D18 = "-" * 18      # S3/S4
D17 = "-" * 17

# —— S1: شکل صحیح صفات داخل پرانتز (تفضیلی یا عالی) را بنویسید — ۱۵ تایپی (ص۹۷)
S1 = [
    (f"Rain in the wet season is {D39} (heavy) than during the rest of the year.", "heavier"),
    (f"Oh fine, it was raining yesterday but today the weather is {D39} (good).", "better"),
    (f"Kish island is {D39} (interesting) island I have ever visited.", "the most interesting"),
    (f"Travelling by plane is {D39} (fast) than travelling by train.", "faster"),
    (f"She thinks that Chinese is {D39} (difficult) than English.", "more difficult"),
    (f"A: Do you feel better today?  B: No, I feel {D39} (bad).", "worse"),
    (f"Ali is 8 and Reza is 10. Ali is {D39} (young) Reza.", "younger than"),
    (f"Chile has a {D39} (small) population than China.", "smaller"),
    (f"Greenland is {D39} (large) island in the world.", "the largest"),
    (f"Don’t write a letter. It’s {D39} (easy) to call.", "easier"),
    (f"The Amazon is {D39} (wide) than the Nile.", "wider"),
    (f"Jamaica is {D39} (sunny) than Norway.", "sunnier"),
    (f"Speak {D39} (loud), I can’t hear you.", "louder"),
    (f"The school is {D39} (far) the bank.", "farther than"),
    (f"Canada is {D39} (big) France.", "bigger than"),
]
S1_BASE = ["heavy", "good", "interesting", "fast", "difficult", "bad", "young",
           "small", "large", "easy", "wide", "sunny", "loud", "far", "big"]

# —— S2: با استفاده از کلمات داده شده جمله بسازید — ۷ تایپی (ص۹۷)
S2 = [
    ("beautiful / is / than / more / this scarf / in the window / the one.",
     "This scarf is more beautiful than the one in the window."),
    ("year / season / winter / coldest / of / the / the / is.",
     "Winter is the coldest season of the year."),
    ("was / for years / the best / had / he / I / friend.",
     "He was the best friend I had for years."),
    ("walks / brother / she / her / faster / than.",
     "She walks faster than her brother."),
    ("are / the shirt / than / cheaper / the gloves ?",
     "Are the gloves cheaper than the shirt?"),
    ("river / the / in / what / world / longest / is / the?",
     "What is the longest river in the world?"),
    ("hotel / are / worst / they / going to / the / not.",
     "They are not going to the worst hotel."),
]

# —— S3: جملات زیر را با استفاده از دانش گرامری خود کامل کنید — ۱۰ تایپی دوجای‌خالی (ص۹۸)
S3 = [
    (f"I am 20 years old. My brother is 25 years old. I am {D17} him. He is {D17} than me.",
     "younger than / older"),
    (f"We have a poor family. They have a rich family. They have {D18} money {D18} us.",
     "more / than"),
    (f"Ali is 170 cm. Reza is 175 cm. Hamid is 180 cm. Actually, Hamid is {D18} of all.",
     "the tallest"),
    (f"Neptune is the eighth and {D18} known planet from the Sun in the Solar System.",
     "the farthest"),
    (f"A village is very small. A town is {D18} a village, but {D18} than a city.",
     "bigger than / smaller"),
    (f"Mercury is {D18} planet in the Solar System and {D18} to the Sun.",
     "the smallest / the closest"),
    (f"Jupiter is the fifth planet from the Sun and {D18} in the Solar System.",
     "the largest"),
    (f"My parents are 60 years old. My father is {D17} my mother.",
     "as old as"),
    (f"My uncle is very {D18}. He’s about 2 meters.",
     "tall"),
    (f"Summer is {D18} season of the year.",
     "the hottest"),
]

# —— S4: بهترین گزینه را انتخاب کنید — ۱۲ MCQ (ص۹۸)
S4 = [
    (f"The Eiffel tower is {D18} the Statue of Liberty.",
     ["the highest", "higher than", "highest", "higher"], 1),
    (f"Spring is {D18} than fall, but summer is the {D18} of all.",
     ["hotter / hottest", "hottest / hotter", "hotter / hotter", "the hottest / hottest"], 0),
    (f"These tomatoes don’t taste very good. The other ones tasted {D18}.",
     ["worse", "good", "better", "bad"], 2),
    (f"People today aren’t very polite. In the past, they were {D18}.",
     ["polite", "more polite", "the most polite", "as polite as"], 1),
    (f"They’ve got {D18} money than they need.",
     ["the most", "much", "more", "many"], 2),
    (f"Einstein was {D18} man of the 20th century.",
     ["intelligent", "more intelligent", "most intelligent", "the most intelligent"], 3),
    (f"Tigers are as {D18} as lions.",
     ["more dangerous", "the most dangerous", "dangerous", "most dangerous"], 2),
    (f"Sharks are {D18} dangerous animals of the sea.",
     ["more", "much", "many", "the most"], 3),
    (f"Your parents are {D18} friends for you.",
     ["better", "good", "the best", "worse"], 2),
    (f"She told me the {D18} story I had ever heard.",
     ["strangest", "stranger than", "the strangest", "strange"], 0),
    (f"I know he is not very good at math but David is {D18}.",
     ["worse than", "bad", "worst", "worse"], 3),
    (f"The turtle is {D18} animal I have ever known.",
     ["slowest", "slower", "the slowest", "slower than"], 2),
]

PRINT_QUIRKS = [
    "سربرگِ ص۹۷ و ص۲۶۴ هر دو با یک زومِ ۲۶۰۰dpi حاکم شدند: «آزمون تشریحی گرامر درس دوم» — لایه «تسی یچ» سومین تکرارِ درسِ r318/r331 است (سربرگ‌های رنگی این جزوه در لایه بی‌اعتماد)؛ کلید: «(آزمون: صفحه ۹۷ و ۹۸)»",
    "TOCِ ص۷۵ این آزمون را «آزمون تشریحی گرامر «انواع صفات»» می‌نامید — سربرگِ چاپی خود آزمون «تشریحی گرامر درس دوم» است؛ عنوانِ TOC حاکم نشد چون سربرگِ خودِ آزمون ملاک است (درسِ r318)",
    "S1 دستورِ بخش: «شکل صحیح صفات داخل پرانتز (تفضیلی یا عالی) را بنویسید.» — لایه «تفضییل یا عایل» نویز؛ صفت‌های داخل پرانتز با رنگِ آبی و بولد چاپ شده‌اند",
    "S1 کلیدهای Q7/14/15 با «than» هستند (younger than/farther than/bigger than) در حالی که Q1/4/8/11/12 «than» را درونِ ساقه دارند — ناهماهنگیِ خودِ چاپ؛ Q13 کلید «louder» بدون than (Speak --- (loud),)",
    "S1-Q2: «Oh fine, it was raining yesterday…» — «Oh fine,» آغازِ غیرمعمول، عینِ چاپ",
    "S1-Q6: «A: Do you feel better today?  B: No, I feel --- (bad).» — دو فاصله بین A و B",
    "S3-Q1: لایه دو جمله را جابه‌جا داده بود («My brother is 20… I am 25») — رندرِ ۲۲۰۰dpi حاکم: «I am 20 years old. My brother is 25 years old.» → کلید «younger than / older» با ترتیبِ جای خالی‌ها هم‌راستا شد",
    "S3-Q2: «They have --- money --- us.» — دو جای خالی ۱۸تایی؛ کلید «more / than»",
    "S3-Q9: لایه «------------- -----» شکسته — یک جای خالیِ ۱۸تایی؛ کلید «tall» (صفتِ مثبت — تنها مورد)",
    "S4-Q2: ترتیبِ گزینه‌های a/b در لایه جابه‌جا بود — چاپ: a. hotter / hottest | b. hottest / hotter | c. hotter / hotter | d. the hottest / hottest → کلید «hotter / hottest» = a؛ «the» درونِ ساقه پیش از جای خالی دوم است",
    "S4-Q6: «20th» با th بالانویس چاپ؛ گزینه‌ها a. intelligent b. more intelligent c. most intelligent d. the most intelligent",
    "S4-Q7: لایه «as» نخست را حذف کرده بود — چاپ: «Tigers are as --- as lions.»",
    "S4-Q10: لایه گزینه‌ها را «a. strangest b. stranger than c. the strangest d. strange» — عینِ چاپ؛ کلید a (strangest) — «the» در ساقه",
    "S4-Q11: گزینه‌ها a. worse than b. bad c. worst d. worse — کلید d (worse)",
    "S4 گزینه‌ها در قاب‌های زردِ حاشیه‌دار با a/b/c/d ایتالیکِ آبی — سبکِ MCQِ این جزوه",
    "دستورِ S4: «بهترین گزینه را انتخاب کنید ..» — لایه «بهی ین» نویز",
    "S2 bank 5: «the gloves ?» فاصله پیش از ؟؛ bank 6: «the?» چسبیده — ناهماهنگیِ خودِ چاپ",
    "جدول‌های کلید (S1/S3) با شماره‌های قرمز و ردیف‌های خاکستریِ یک‌درمیان؛ S2 کلیدها جمله‌کامل زیر هم",
    "S2-Q3 کلید: «He was the best friend I had for years.» — از بانک «was / for years / the best / had / he / I / friend.»",
    "بدونِ ترجمهٔ چاپی در کلید (تشریحیِ واژه‌محور — مثل r329)؛ جعبهٔ Note در این آزمون دیده نشد",
]

RECEIPT = {
    "exam": "آزمون تشریحی گرامر درس دوم — انواع صفات (ص۹۷-۹۸)",
    "header": "«آزمون تشریحی گرامر درس دوم» (پاسخنامه صفحه: ۲۶۴) — ۴ بخش: ۱ شکلِ صحیحِ صفات (۱۵) + ۲ جمله‌سازی (۷) + ۳ کامل‌کردنِ دوجای‌خالی (۱۰) + ۴ چهارگزینه‌ای (۱۲) = ۴۴ آیتم در ۴ بانک",
    "keyPages": "264",
    "keyVerification": "print key p264 «آزمون تشریحی گرامر درس دوم — (آزمون: صفحه ۹۷ و ۹۸)» — 44/44 agree with semantic pre-fill (S1 گریدِ ۱۵تایی + S2 جمله‌های کامل + S3 گریدِ اسلش‌دار + S4 واژه→اندیس), zero divergence",
    "extractedRound": "r333",
    "pattern": "r329 (تشریحیِ گرامرِ درس‌محور: تایپی با options[0]=کلیدِ چاپ + MCQ با نگاشتِ واژه→اندیس) + r333 (رندرِ حاکم بر لایه در S3/S4)",
    "printQuirks": PRINT_QUIRKS,
}

data = json.loads(PATH.read_text(encoding="utf-8"))

existing = [l for l in data["lessons"] if l["lesson"] == 26]
if existing:
    print(f"lesson 26 already present ({existing[0]['count']} items) — NO-OP")
else:
    assert len(data["lessons"]) == 25, f"baseline mismatch: {len(data['lessons'])} banks"

    banks = []

    # S1 — ۱۵ تایپی؛ options[0]=کلیدِ چاپ + سه حواس‌پرتیِ فرم‌محور
    s1_q = []
    for i, ((stem, key), base) in enumerate(zip(S1, S1_BASE)):
        comp = key.split(" than ")[0]
        if key.startswith("the most "):
            distr = [base, "more " + base, "most " + base]
        elif key.endswith(" than"):
            distr = [base, comp, "the most " + base]
        else:
            distr = [base, "the most " + base, "as " + base + " as"]
        opts = [key] + distr
        s1_q.append({
            "id": f"g10-l26-{i + 1}", "n": i + 1, "category": "grammar",
            "kind": "typed", "question": stem, "options": opts, "answer": 0,
            "accepted": [key],
            "placeholder": "write the correct form of the adjective (comparative or superlative)…",
        })
    banks.append({
        "lesson": 26, "title": "تشریحی گرامر — شکل صحیح صفات داخل پرانتز (ص۹۷)",
        "level": "تشریحی — تایپی", "count": len(s1_q), "questions": s1_q,
    })

    # S2 — ۷ تایپی جمله‌سازی؛ options = کلیدِ خود + سه کلیدِ خواهر (الگوی r329-l14)
    s2_q = []
    keys2 = [k for _, k in S2]
    for i, (bank_line, key) in enumerate(S2):
        sib = [keys2[(i + j) % 7] for j in (1, 2, 3)]
        s2_q.append({
            "id": f"g10-l27-{i + 1}", "n": i + 1, "category": "grammar",
            "kind": "typed", "question": bank_line, "options": [key] + sib, "answer": 0,
            "accepted": [key],
            "placeholder": "make a sentence with the given words…",
        })
    banks.append({
        "lesson": 27, "title": "تشریحی گرامر — جمله‌سازی با کلمات داده شده (ص۹۷)",
        "level": "تشریحی — تایپی", "count": len(s2_q), "questions": s2_q,
    })

    # S3 — ۱۰ تایپی دوجای‌خالی؛ options = کلیدِ خود + سه کلیدِ خواهر
    s3_q = []
    keys3 = [k for _, k in S3]
    for i, (stem, key) in enumerate(S3):
        sib = [keys3[(i + j) % 10] for j in (1, 2, 3)]
        s3_q.append({
            "id": f"g10-l28-{i + 1}", "n": i + 1, "category": "grammar",
            "kind": "typed", "question": stem, "options": [key] + sib, "answer": 0,
            "accepted": [key],
            "placeholder": "complete both blanks (use / between the two answers)…",
        })
    banks.append({
        "lesson": 28, "title": "تشریحی گرامر — کامل کردن با دانش گرامری (ص۹۸)",
        "level": "تشریحی — تایپی دوجای‌خالی", "count": len(s3_q), "questions": s3_q,
    })

    # S4 — ۱۲ MCQ
    s4_q = []
    for i, (stem, opts, key) in enumerate(S4):
        s4_q.append({
            "id": f"g10-l29-{i + 1}", "n": i + 1, "category": "grammar",
            "question": stem, "options": opts, "answer": key,
        })
    banks.append({
        "lesson": 29, "title": "تشریحی گرامر — تست چهارگزینه‌ای (ص۹۸)",
        "level": "تشریحی — چهارگزینه‌ای", "count": len(s4_q), "questions": s4_q,
    })

    data["lessons"].extend(banks)
    data["source"]["gram4"] = RECEIPT
    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = sum(l["count"] for l in data["lessons"])
    print(f"added lessons 26-29: {[b['count'] for b in banks]} → banks={len(data['lessons'])}, total={total}")
