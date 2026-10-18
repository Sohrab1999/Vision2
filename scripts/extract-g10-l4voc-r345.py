# -*- coding: utf-8 -*-
# r345 — استخراجِ «آزمون تشریحی واژگان درس چهارم» جزوهٔ دهم (ص۱۴۸-۱۵۰، کلید چاپی ص۲۸۷)
# به public/jozve/tests-g10.json — عینِ الگوی r323/r326/r338 (بانک‌های ۷۷-۸۰):
#   بانک ۷۷: جای خالی از بانک واژه (۱۶ تایپی، دو بانکِ ۹کلمه‌ای چاپ — اضافه‌ها: embassy / journey)
#   بانک ۷۸: کلمه با حرف اول (۸ تایپی — هر ۸ زیرخطِ چاپ دقیقاً هم‌طولِ کلید — برخلافِ درس سوم)
#   بانک ۷۹: تعریف‌ها، بنویسید (۸ تایپی — اضافهٔ بانک: traveler)
#   بانک ۸۰: تست چهارگزینه‌ای (۲۵ MCQ — Q10 جای‌خالیِ کوتاهِ ۲۱تیره‌ایِ چاپ؛ Q18 دیالوگِ A/B)
# کلید: چهار گریدِ ص۲۸۷ «پاسخنامه آزمون تشریحی واژگان درس چهارم (آزمون: صفحه ۱۴۸ تا ۱۵۰)»
# (۵۷/۵۷ با پیش‌پرکردنِ معنایی هم‌رأی — صفر واگرایی). سبکِ گریدِ سکشن‌۱-۳ «1. holidays» با فاصله
# بعدِ نقطه vs سکشن‌۴ «1.illness» بدونِ فاصله. جعبهٔ «Note:» خالیِ خط‌چینِ بنفش (الگوی r334/r338).
# لایهٔ OCR: «تسی یچ» (نهمین تجزیهٔ تشریحی — رندر ۱۲۰۰dpi «تشریحی» تمیز) + «جمالت/اضاقن یم/نوشی ن/بهی ین».
# کوئیرک‌های عینِ چاپ: بخش۱-Q5 «------------------in my ear.» جای‌خالیِ چسبیده به واژه (همچنین Q9/Q11)؛
# بخش۲ نقطهٔ فاصله‌دار «) .» در Q2-Q7 vs چسبیده در Q1/Q8؛ MCQ-Q3 «in all over the world»؛
# MCQ-Q18 گپِ سه‌فاصله‌ایِ «do?   B:»؛ پاصفحهٔ ص۱۵۰ بدونِ خطِ Telegram.
# Idempotent: اجرای دوم NO-OP (مبنا = ۷۶ بانکِ r323-r344 / ۹۶۵ آیتم).
import json
from pathlib import Path

PATH = Path("public/jozve/tests-g10.json")

BL = "-" * 18  # جای خالیِ استانداردِ خانوادهٔ تشریحی (r323/r326/r338)

BANK_A = ["illness", "international", "behavior", "quietly", "attractions", "embassy", "historical", "holidays", "anything"]
BANK_B = ["pilgrims", "range", "junk", "souvenir", "means", "journey", "located", "generously", "destination"]
DEF_BANK = ["range", "domestic", "traveler", "continent", "price", "rule", "journey", "local", "prefer"]

# کلیدِ چاپیِ ص۲۸۷ — بخش ۱ (۱۶): دو زیربانکِ ۸تایی (اضافه‌ها: embassy / journey)
B1_KEYS = [
    "holidays", "anything", "international", "historical", "quietly", "illness", "attractions", "behavior",
    "junk", "destination", "means", "range", "located", "generously", "pilgrims", "souvenir",
]
B1_STEMS = [
    "We need to make plans for the ------------------.",
    "I was hungry but there wasn’t ------------------ to eat.",
    "English is the ------------------ language in all over the world.",
    "Our country has many ------------------ sites and an amazing nature.",
    "Because we were in the library, he spoke very ------------------in my ear.",
    "My father was in the hospital for three weeks because of his ------------------.",
    "Each year, a lot of people from all parts of the world visit Iran’s ------------------.",
    "Your good ------------------ in a foreign country gives a good image of your culture.",
    "Why is your child eating ------------------food? It’s not good for his health.",
    "Our baggage was checked all the way through to our final ------------------.",
    "People usually go to different places by different ------------------of travel.",
    "The age ------------------ of the children is between eight and twelve.",
    "Most tall buildings are ------------------ in the north of Tehran.",
    "The people of the town ------------------ helped poor people.",
    "The ------------------ came to Imam Reza Holy Shrine.",
    "I bought the ring as a ------------------ of Mashhad.",
]

# بخش ۲ — حرف اول (۸): هر ۸ زیرخطِ چاپ دقیقاً هم‌طولِ کلید (i+12=international … f+3=fall)
B2_ITEMS = [
    ("English is used a lot in (i _ _ _ _ _ _ _ _ _ _ _ _) business.", "international"),
    ("A person who visits a place on holiday is a (t _ _ _ _ _ _) .", "traveler"),
    ("I cannot hear you. Please, speak (l _ _ _ _ _) .", "louder"),
    ("If you want to catch a plane, you go to the (a _ _ _ _ _ _) .", "airport"),
    ("The time in the morning when the sun comes up is called (s _ _ _ _ _ _) .", "sunrise"),
    ("The time in the evening when the sun goes down is called (s _ _ _ _ _) .", "sunset"),
    ("Egypt is famous for its wonderful (p _ _ _ _ _ _ _) .", "pyramids"),
    ("The part of the year between summer and winter is called (f _ _ _).", "fall"),
]

# بخش ۳ — تعریف‌ها (۸): (تعریف، کلید) — اضافهٔ بانک: traveler
B3_ITEMS = [
    ("Something that tells you what you must or must not do:", "rule"),
    ("One of the seven big pieces of land in the world:", "continent"),
    ("How much money you pay to buy something:", "price"),
    ("Like one thing or person better than another:", "prefer"),
    ("Going from one place to another:", "journey"),
    ("Relating to one country:", "domestic"),
    ("A set of similar things:", "range"),
    ("Of a place near you:", "local"),
]

# بخش ۴ — ۲۵ MCQ: (ساقه، گزینه‌ها، کلیدِ واژه‌ایِ چاپ ص۲۸۷)
B4_ITEMS = [
    ("My friend couldn’t come to the meeting because of ------------------.",
     ["souvenir", "destination", "entertainment", "illness"], "illness"),
    ("Sometimes fast food is called ------------------ food because it’s not always good for you.",
     ["easy", "junk", "ready", "high"], "junk"),
    ("He was late for work, so he walked quickly to the train ------------------.",
     ["shrine", "ceremony", "station", "ancient"], "station"),
    ("In my ------------------, very few people really understand the problem.",
     ["experience", "activity", "suggestion", "choice"], "experience"),
    ("If you look at these two carpets carefully, you will see that the patterns are very ------------------.",
     ["generous", "similar", "homemade", "wide"], "similar"),
    ("We must take our shoes off before entering a mosque or other ------------------ places.",
     ["comfortable", "main", "local", "holy"], "holy"),
    ("When you are traveling in the ------------------, you should take a lot of water.",
     ["culture", "desert", "range", "paradise"], "desert"),
    ("The north of Iran is a ------------------ holiday destination.",
     ["probable", "hospitable", "historical", "popular"], "popular"),
    ("Do you know anything about the ------------------ space station?",
     ["embassy", "tourism", "international", "traditional"], "international"),
    ("Since ------------------ times, people have dreamed of leaving our planet and knowing about other worlds.",
     ["ancient", "possible", "across", "similar"], "ancient"),
    ("You will show ------------------ to your host if you wear formal clothes.",
     ["behavior", "image", "respect", "domestic"], "respect"),
    ("Nobody knows ------------------ what happened on the night my uncle died.",
     ["bravely", "quietly", "rudely", "exactly"], "exactly"),
    ("Asia is the largest ------------------ in the world.",
     ["paradise", "continent", "country", "ceremony"], "continent"),
    ("I’d like to hear your ------------------ for ways of improving English.",
     ["suggestion", "preposition", "attraction", "entertainment"], "suggestion"),
    ("I was ------------------ the net looking for information on pop music.",
     ["respecting", "locating", "choosing", "surfing"], "surfing"),
    ("If you eat less sugar, you may feel ------------------.",
     ["obligation", "healthier", "similar", "more popular"], "healthier"),
    ("I wouldn’t want to be a teacher because I’m not very ------------------.",
     ["traditional", "cruel", "patient", "hospitable"], "patient"),
    ("A: What are you going to do?   B: I don’t know. I ------------------ won’t go anywhere.",
     ["probably", "exactly", "wonderfully", "suitably"], "probably"),
    ("There aren’t enough buses. We need more public ------------------.",
     ["attraction", "vacation", "destination", "transportation"], "transportation"),
    ("Camels can travel through the ------------------ for long distances.",
     ["booklet", "embassy", "desert", "pyramid"], "desert"),
    ("He gave up smoking for ------------------ reasons.",
     ["familiar", "health", "loud", "culture"], "health"),
    ("Some countries are famous for their ------------------ history and amazing nature.",
     ["ancient", "domestic", "homemade", "contrastive"], "ancient"),
    ("We should respect the languages and ------------------ of other countries.",
     ["ranges", "suggestions", "cultures", "activities"], "cultures"),
    ("We had wonderful weather when we were on ------------------.",
     ["continent", "paradise", "vacation", "experience"], "vacation"),
    ("It is ------------------ that the disease has a genetic element.",
     ["obligation", "probable", "popular", "comfortable"], "probable"),
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
    # بانک ۷۷ — ۱۶ تایپی از دو بانک ۹کلمه‌ای چاپ (اضافه‌ها: embassy / journey)
    qs77 = []
    for i, stem in enumerate(B1_STEMS):
        n = i + 1
        bank = BANK_A if n <= 8 else BANK_B
        key = B1_KEYS[i]
        assert key in bank, f"B1-Q{n} key {key!r} not in bank"
        q = typed_q(77, n, f"{stem} [bank: {' / '.join(bank)}]", key, rotated(bank, n), PH_BANK)
        qs77.append(q)
    base_lessons.append({
        "lesson": 77,
        "title": "تشریحی درس چهارم — جای خالی از بانک واژه (ص۱۴۸)",
        "level": "تشریحی — تایپی",
        "count": len(qs77),
        "questions": qs77,
    })

    # بانک ۷۸ — ۸ تایپیِ حرف اول؛ گزینه‌ها = ۸ واژهٔ کلیدِ خودِ بانک (الگوی r326/r338)؛
    # زیرخطِ چاپ در Q2 کوتاه‌تر از کلید است (t+6 در برابرِ traveler=۸ — ۳۰۰۰dpi، عینِ r323-Q7/r338)؛
    # بقیهٔ ۷ آیتم دقیقاً هم‌طولِ کلید — قیدِ تطبیق در گارد
    b2_words = [w for _, w in B2_ITEMS]
    for i, (stem, key) in enumerate(B2_ITEMS):
        first, n_underscores = stem.split("(")[1][0], stem.count("_")
        word = key
        if i == 1:
            assert len(word) == 2 + n_underscores, f"B2-Q{i+1}: expected SHORT track (t+6), got {1+n_underscores}"
            assert word[0] == first
        else:
            assert len(word) == 1 + n_underscores, f"B2-Q{i+1}: hint length {1+n_underscores} != {len(word)} for {word!r}"
            assert word[0] == first, f"B2-Q{i+1}: first letter {first!r} != {word[0]!r}"
    qs78 = []
    for i, (stem, key) in enumerate(B2_ITEMS):
        n = i + 1
        q = typed_q(78, n, stem, key, rotated(b2_words, i), PH_FIRST)
        qs78.append(q)
    base_lessons.append({
        "lesson": 78,
        "title": "تشریحی درس چهارم — کلمه با حرف اول (ص۱۴۸)",
        "level": "تشریحی — تایپی",
        "count": len(qs78),
        "questions": qs78,
    })

    # بانک ۷۹ — ۸ تایپیِ تعریف‌ها؛ گزینه‌ها = بانکِ ۹کلمه‌ایِ چاپ (یک اضافه: traveler)
    qs79 = []
    for i, (definition, key) in enumerate(B3_ITEMS):
        n = i + 1
        assert key in DEF_BANK
        q = typed_q(79, n, definition, key, rotated(DEF_BANK, i), PH_DEF)
        qs79.append(q)
    base_lessons.append({
        "lesson": 79,
        "title": "تشریحی درس چهارم — تعریف‌ها، بنویسید (ص۱۴۹)",
        "level": "تشریحی — تایپی",
        "count": len(qs79),
        "questions": qs79,
    })

    # بانک ۸۰ — ۲۵ MCQ
    qs80 = []
    for i, (stem, options, key_word) in enumerate(B4_ITEMS):
        n = i + 1
        idx = next((j for j, o in enumerate(options) if o.lower() == key_word.lower()), None)
        assert idx is not None, f"B4-Q{n}: key word {key_word!r} not among options {options}"
        qs80.append({
            "id": f"g10-l80-{n}",
            "n": n,
            "category": "vocab",
            "question": stem,
            "options": options,
            "answer": idx,
        })
    base_lessons.append({
        "lesson": 80,
        "title": "تشریحی درس چهارم — تست چهارگزینه‌ای (ص۱۴۹-۱۵۰)",
        "level": "تشریحی — چهارگزینه‌ای",
        "count": len(qs80),
        "questions": qs80,
    })


RECEIPT = {
    "exam": "آزمون تشریحی واژگان درس چهارم (ص۱۴۸-۱۵۰)",
    "header": "سربرگِ ص۱۴۸ (رندرِ ۱۲۰۰dpi): «آزمون تشریحی واژگان درس چهارم» سرخ در گیومه (پاسخنامه صفحه: ۲۸۷) — لایهٔ OCR «تسی یچ» (نهمین تکرارِ لایه‌غلطِ تشریحی: r318/r331/r333/r336/r338/r340/r342/r344 — رندر حاکم: تمیز)؛ دستورِ سکشن‌۱ «با استفاده از کلمات داده شده، جملات زیر را کامل کنید. (یک کلمه اضافه می باشد)» (لایه «جمالت/اضاقن یم» = جملات/اضافه می)؛ سکشن‌۲ «جملات زیر را با نوشتن یک کلمه مناسب کامل کنید.» (لایه «نوشی ن» = نوشتن)؛ سکشن‌۳ «کلمات زیر را با تعاریف داده شده مطابقت دهید. (یک کلمه اضافه می باشد)»؛ سکشن‌۴ «بهترین گزینه را انتخاب کنید.» (لایه «بهی ین» = بهترین)؛ زیرخطِ سبزِ خط‌چین در سکشن‌۱ و حرفِ اولِ سرمه‌ایِ توپُر در سکشن‌۲؛ گزینه‌های MCQ در سلول‌های زردِ ایتالیکِ سرمه‌ای؛ پاصفحهٔ ص۱۵۰ بدونِ خطِ Telegram (برخلافِ ص۱۲۲ خانوادهٔ درس سوم)",
    "keyPages": "287",
    "extractedRound": "r345",
    "keyVerification": "چهار گریدِ چاپِ ص۲۸۷ «پاسخنامه آزمون تشریحی واژگان درس چهارم (آزمون: صفحه ۱۴۸ تا ۱۵۰)» — ارقامِ فارسیِ ۱۴۸/۱۵۰ با واصفِ «تا» (لایه لاتین 148/150 داده بود — رندر ۱۲۰۰dpi حاکم)؛ گریدِ سکشن‌۱ (۴×۴، «1. holidays» با فاصله بعدِ نقطه) + سکشن‌۲ (۴×۲) + سکشن‌۳ (۴×۲) + سکشن‌۴ (۳×۸+۱، «1.illness» بدونِ فاصله بعدِ نقطه — ناسازگاریِ سبکِ خودِ چاپ) — ۱۶+۸+۸+۲۵ کلید که همگی با واژه‌های سؤال‌ها می‌خوانند — ۵۷/۵۷ با پیش‌پرکردنِ معنایی هم‌رأی، صفر واگرایی؛ جعبهٔ «Note:» خالیِ خط‌چینِ بنفش در پایینِ ص۲۸۷ (الگوی r334/r338)",
    "pattern": "r323/r326/r338 — چهار بانک به ازای چهار سکشن: بانک‌واژه ۱۶ تایپی از دو زیربانکِ ۹کلمه‌ای چاپ + حرفِ اول ۸ تایپی + تعریف‌ها ۸ تایپی + ۲۵ MCQ",
    "printQuirks": [
        "بخش ۱ — جای‌خالیِ چسبیده به واژهٔ بعدی بدونِ فاصله: Q5 «------------------in my ear.»، Q9 «------------------food?»، Q11 «------------------of travel.» — عینِ چاپ (رندر ۶۰۰dpi)؛ بقیهٔ جای‌خالی‌ها فاصله‌دار",
        "بخش ۱ Q3 «language in all over the world» — «in» از نظرِ دستورِ انگلیسی اضافه اما عینِ چاپ",
        "بخش ۲ — نقطهٔ فاصله‌دار «) .» در Q2 تا Q7 در برابرِ نقطهٔ چسبیده در Q1 (به business.) و Q8 («(f _ _ _).») — ناسازگاریِ میکروی خودِ چاپ؛ حفظِ عینِ چاپ",
        "بخش ۲ — زیرخطِ چاپ در Q2 کوتاه‌تر از کلید است: (t + ۶ تیره) در برابرِ traveler هشت‌حرفی (رندرِ ۳۰۰۰dpi حاکم — عینِ r323-Q7/r338)؛ ساقه عینِ چاپ، کلید از گریدِ ص۲۸۷؛ بقیهٔ ۷ آیتم دقیقاً هم‌طول‌اند: i+12=international، l+5=louder، a+6=airport، s+6=sunrise، s+5=sunset، p+7=pyramids، f+3=fall",
        "بخش ۴ Q10 جای‌خالیِ کوتاهِ ۲۱تیره‌ای («Since --------------------- times») در برابرِ ۳۱تیرهٔ بقیه — ناهماهنگیِ خودِ چاپ؛ نرمال‌شده به تیرهٔ استانداردِ خانواده (قاعدهٔ r338-MCQ14)",
        "بخش ۴ Q18 دیالوگِ A/B با گپِ سه‌فاصله‌ایِ چاپ («do?   B:») — عینِ چاپ",
        "بخش ۴ Q16 گزینهٔ d دوسخت‌واژه‌ایِ «more popular» — عینِ چاپ",
        "تیره‌شماریِ لایه: بخش ۱ = ۱۶ جای‌خالی ×۲۶ تیره (۳ لایه-شکسته: Q3/Q9/Q14 به‌صورت ۸+۱۸)؛ بخش ۳ = ۸ پرانتز ×۲۴ (Q2/Q7 شکسته، Q8 چندسطری)؛ بخش ۴ = ۲۳×۳۱ + Q2 شکسته (۱۱+۲۰) + Q10×۲۱ — جمعِ سه صفحه ۱۴۹۸ تیره",
        "اضافه‌های بانک‌واژه (یک کلمه اضافه می باشد): بخش ۱ زیربانکِ اول = embassy، زیربانکِ دوم = journey، بخش ۳ = traveler",
        "پاصفحهٔ ص۱۵۰ بدونِ خطِ «Telegram Channel: @PracticalEnglishInKonkour» — برخلافِ پاصفحهٔ ص۱۲۲ خانوادهٔ درس سوم (r338)",
        "جعبهٔ «Note:» خالیِ خط‌چینِ بنفش در پایینِ ص۲۸۷ — همان الگویِ r334/r338",
    ],
}


def main():
    old = json.loads(PATH.read_text(encoding="utf-8"))
    existing = [l for l in old["lessons"] if l["lesson"] >= 77]
    if existing:
        print(f"lessons 77+ already present ({sum(l['count'] for l in existing)} items) — NO-OP")
        if old["source"].get("tashrihi4") != RECEIPT:
            old["source"]["tashrihi4"] = RECEIPT
            PATH.write_text(json.dumps(old, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print("source.tashrihi4 refreshed")
        return
    assert len(old["lessons"]) == 76, f"baseline mismatch: {len(old['lessons'])} banks"
    assert sum(l["count"] for l in old["lessons"]) == 965, "baseline item count mismatch"

    data = json.loads(PATH.read_text(encoding="utf-8"))
    build_lessons(data["lessons"])
    data["source"]["tashrihi4"] = RECEIPT

    # راستی‌آزماییِ نهایی: ۸۰ بانک / ۱۰۲۲ آیتم / id یگانه
    assert len(data["lessons"]) == 80
    total = sum(l["count"] for l in data["lessons"])
    assert total == 1022, f"total {total} != 1022"
    ids = [q["id"] for l in data["lessons"] for q in l["questions"]]
    assert len(ids) == len(set(ids)) == 1022

    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"OK: banks 77-80 added — {total} items in {len(data['lessons'])} banks")
    for l in data["lessons"][-4:]:
        print(f"  bank {l['lesson']}: {l['title']} — {l['count']}")


if __name__ == "__main__":
    main()
