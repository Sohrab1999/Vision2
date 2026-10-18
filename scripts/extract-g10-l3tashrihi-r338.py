# -*- coding: utf-8 -*-
# r338 — استخراجِ «آزمون تشریحی واژگان درس سوم» جزوهٔ دهم (ص۱۲۰-۱۲۲، کلید چاپی ص۲۷۴)
# به public/jozve/tests-g10.json — عینِ الگوی r323/r326 (بانک‌های ۵۳-۵۶):
#   بانک ۵۳: جای خالی از بانک واژه (۱۶ تایپی، دو بانکِ ۹کلمه‌ای چاپ — اضافه‌ها: situation / interview)
#   بانک ۵۴: کلمه با حرف اول (۸ تایپی — زیرخطِ چاپ در ۶ آیتم کوتاه‌تر از کلید است! سکشنِ r323-Q7)
#   بانک ۵۵: تعریف‌ها، بنویسید (۸ تایپی — اضافهٔ بانک: description)
#   بانک ۵۶: تست چهارگزینه‌ای (۲۵ MCQ — Q9 دوجای‌خالیِ اسلش‌دار؛ Q23 گزینه‌های b/c/d سایه‌دارِ چاپ)
# کلید: گریدِ واژه‌ایِ چاپ ص۲۷۴ «آزمون تشریحی واژگان درس سوم (آزمون صفحه: ۱۲۰ تا ۱۲۲)»
# (۵۷/۵۷ با پیش‌پرکردنِ معنایی هم‌رأی — صفر واگرایی). چاپ‌غلطِ گریدِ کلید: «1.Experimentig»
# (بدونِ n — گزینهٔ سؤال «Experimenting» تمیز است؛ کلید = گزینهٔ c).
# کوئیرکِ ساقه: MCQ-6 «Could you mind my bag» (عینِ چاپ — Would انتظار می‌رفت).
# لایهٔ OCR: «تسی یچ» (پنجمین تکرار — رندر ۶۰۰dpi «تشریحی» تمیز) + «جمالت/اضاقن یم» (جملات/اضافه می).
# زیرخطِ سکشن‌۲ (شمارشِ لایه + رندر ۶۰۰dpi): Q1 i+7=inventor✓ Q3 t+8=telephone✓؛
# Q2 c+4 (camera=۶) Q4 p+5 (patient=۷) Q5 b+2 (bulb=۴) Q6 e+7 (energetic=۹) Q7 a+5 (airplane=۸ — دو تیره کم!) Q8 w+4 (winter=۶).
# Idempotent: اجرای دوم NO-OP (مبنا = ۵۲ بانکِ r323-r337 / ۶۷۷ آیتم).
import json
from pathlib import Path

PATH = Path("public/jozve/tests-g10.json")

BL = "-" * 18  # جای خالیِ استانداردِ خانوادهٔ تشریحی (r323/r326)

BANK_A = ["developed", "inventions", "try", "possible", "lives", "experiments", "situation", "fortunately", "medicines"]
BANK_B = ["inventors", "passed", "solve", "thousands", "interview", "knowledge", "cradle", "published", "translate"]
DEF_BANK = ["quit", "careless", "thinker", "description", "value", "experiment", "translator", "noise", "weak"]

# کلیدِ چاپیِ ص۲۷۴ — بخش ۱ (۱۶): دو زیربانکِ ۸تایی
B1_KEYS = [
    "fortunately", "inventions", "medicines", "lives", "try", "developed", "experiments", "possible",
    "translate", "knowledge", "published", "passed", "thousands", "cradle", "solve", "inventors",
]
B1_STEMS = [
    "------------------, we got home before it started to rain.",
    "Is it right to say that ------------------ make people famous?",
    "This antibiotic should not be taken with other ------------------.",
    "We can learn a lot of things about our scientists’ ------------------.",
    "If your brother wants to learn English, he must ------------------ hard.",
    "In 1879, Edison ------------------ the first successful electric light bulb.",
    "Some people believe that ------------------ on animals should be stopped.",
    "Will it be ------------------ for human beings to live on other planets some day in future?",
    "We were asked to ------------------ a list of sentences.",
    "Her ------------------ of English grammar is very good.",
    "She was only 19 when her first novel was ------------------.",
    "She’s upset because her father ------------------ away last week.",
    "They spent ------------------ of dollars trying to fix the problem.",
    "He lived in the same village from the ------------------ to the grave.",
    "I really hope this report will help to ------------------ those problems.",
    "Edison was one of the most important scientists and ------------------ of the past two centuries.",
]

# بخش ۲ — حرف اول (۸): (ساقهٔ عینِ چاپ با زیرخطِ کوتاهِ خودِ چاپ، کلیدِ گریدِ ص۲۷۴)
B2_ITEMS = [
    ("Someone who has invented something or whose job is to invent things is an (i _ _ _ _ _ _ _).", "inventor"),
    ("A device for taking photographs or making films is a (c _ _ _ _).", "camera"),
    ("We use a (t _ _ _ _ _ _ _ _) to talk with someone in another place.", "telephone"),
    ("A (p _ _ _ _ _ ) is a sick person that a doctor is looking after.", "patient"),
    ("A light (b _ _) gives us an easier life when there is no light.", "bulb"),
    ("If you are (e _ _ _ _ _ _ _ ), you have a lot of energy.", "energetic"),
    ("We use it for air travel. It is an (a _ _ _ _ _ ).", "airplane"),
    ("The coldest season of the year is (w _ _ _ _ ).", "winter"),
]

# بخش ۳ — تعریف‌ها (۸): (تعریف، کلید) — اضافهٔ بانک: description
B3_ITEMS = [
    ("A person whose job is changing words, especially written words, into a different language:", "translator"),
    ("A test done to learn something or to discover if something works or is true:", "experiment"),
    ("A sound or sounds, especially when it is unwanted, unpleasant, or loud:", "noise"),
    ("Someone who considers important subjects or produces new ideas:", "thinker"),
    ("The amount of money that can be received for something:", "value"),
    ("Not taking or showing enough care and attention:", "careless"),
    ("To stop doing something:", "quit"),
    ("Not physically strong:", "weak"),
]

# بخش ۴ — ۲۵ MCQ: (ساقه، گزینه‌ها، کلیدِ واژه‌ایِ چاپ ص۲۷۴)
B4_ITEMS = [
    ("------------------ on mice can give us an idea of the effect of the disease in humans.",
     ["Thinking", "Describing", "Experimenting", "Developing"], "Experimenting"),
    ("They work ------------------ the night and sleep by day.",
     ["during", "while", "still", "at all"], "during"),
    ("A lot of people ------------------ in life after death.",
     ["invent", "relate", "guess", "believe"], "believe"),
    ("Ali got here at midday and Reza arrived soon ------------------.",
     ["at all", "after", "same", "rather"], "after"),
    ("He is the writer of two books on French ------------------.",
     ["invention", "history", "emphatic", "medicine"], "history"),
    ("Could you mind my bag for a/an ------------------ while I go to the toilet?",
     ["moment", "stress", "emphasis", "possible"], "moment"),
    ("The role of scientists is to ------------------ and describe the world, not to try to control it.",
     ["publish", "feel", "observe", "change into"], "observe"),
    ("The ------------------ of a sentence often depends on stress and intonation.",
     ["during", "peace", "history", "meaning"], "meaning"),
    ("Can we ------------------ that question ------------------ for now, and come back to it later?",
     ["be / after", "give / up", "put / aside", "grow / up"], "put / aside"),
    ("We tried to get tickets, but ------------------ they were already sold out.",
     ["strongly", "unfortunately", "finally", "suddenly"], "unfortunately"),
    ("It was snowing ------------------ when I had an accident.",
     ["fortunately", "finally", "heavily", "hopefully"], "heavily"),
    ("Like a lot of men, he finds it difficult to express his ------------------.",
     ["languages", "inventions", "medicines", "emotions"], "emotions"),
    ("I ------------------ him some sandwiches because I thought he might be hungry.",
     ["invented", "brought", "changed into", "noticed"], "brought"),
    ("The scientists feel ------------------ when they solve problems and find answers to their questions.",
     ["skillful", "careful", "successful", "careless"], "successful"),
    ("He started his working life as an engineer but later ------------------ a teacher.",
     ["believed", "became", "invented", "rang"], "became"),
    ("Mars is sometimes ------------------ the red planet because of its different color.",
     ["attended", "called", "behaved", "related"], "called"),
    ("He was a/an ------------------ businessman before becoming a writer.",
     ["situation", "invention", "knowledge", "successful"], "successful"),
    ("I’m ashamed to be seen with you when you ------------------ so badly!",
     ["bring", "behave", "guess", "solve"], "behave"),
    ("Would you ------------------ your job if you got lots of money?",
     ["quit", "express", "get around", "come in"], "quit"),
    ("They are very interested in starting work as soon as ------------------.",
     ["reflexive", "description", "possible", "together"], "possible"),
    ("They are doing some ------------------ on the language of dolphins.",
     ["research", "invention", "emphasis", "stress"], "research"),
    ("You need to state your arguments with greater ------------------.",
     ["creation", "cradle", "emphasis", "worth"], "emphasis"),
    ("Is there anything ------------------ that you’d like to do today?",
     ["hospital", "special", "moment", "thought"], "special"),
    ("After months of looking he ------------------ found a job.",
     ["strongly", "finally", "quickly", "unfortunately"], "finally"),
    ("His ------------------ in God gave him hope during difficult times.",
     ["belief", "growth", "behavior", "interview"], "belief"),
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
    # بانک ۵۳ — ۱۶ تایپی از دو بانک ۹کلمه‌ای چاپ (اضافه‌ها: situation / interview)
    qs53 = []
    for i, stem in enumerate(B1_STEMS):
        n = i + 1
        bank = BANK_A if n <= 8 else BANK_B
        key = B1_KEYS[i]
        assert key in bank, f"B1-Q{n} key {key!r} not in bank"
        q = typed_q(53, n, f"{stem} [bank: {' / '.join(bank)}]", key, rotated(bank, n), PH_BANK)
        qs53.append(q)
    base_lessons.append({
        "lesson": 53,
        "title": "تشریحی درس سوم — جای خالی از بانک واژه (ص۱۲۰)",
        "level": "تشریحی — تایپی",
        "count": len(qs53),
        "questions": qs53,
    })

    # بانک ۵۴ — ۸ تایپیِ حرف اول؛ گزینه‌ها = ۸ واژهٔ کلیدِ خودِ بانک (الگوی r326)
    b2_words = [w for _, w in B2_ITEMS]
    qs54 = []
    for i, (stem, key) in enumerate(B2_ITEMS):
        n = i + 1
        # زیرخطِ چاپ در Q2/Q4/Q5/Q6/Q7/Q8 کوتاه‌تر از کلید است (عینِ چاپ — r323-Q7 pattern)
        q = typed_q(54, n, stem, key, rotated(b2_words, i), PH_FIRST)
        qs54.append(q)
    base_lessons.append({
        "lesson": 54,
        "title": "تشریحی درس سوم — کلمه با حرف اول (ص۱۲۰)",
        "level": "تشریحی — تایپی",
        "count": len(qs54),
        "questions": qs54,
    })

    # بانک ۵۵ — ۸ تایپیِ تعریف‌ها؛ گزینه‌ها = بانکِ ۹کلمه‌ایِ چاپ (یک اضافه: description)
    qs55 = []
    for i, (definition, key) in enumerate(B3_ITEMS):
        n = i + 1
        assert key in DEF_BANK
        q = typed_q(55, n, definition, key, rotated(DEF_BANK, i), PH_DEF)
        qs55.append(q)
    base_lessons.append({
        "lesson": 55,
        "title": "تشریحی درس سوم — تعریف‌ها، بنویسید (ص۱۲۱)",
        "level": "تشریحی — تایپی",
        "count": len(qs55),
        "questions": qs55,
    })

    # بانک ۵۶ — ۲۵ MCQ
    qs56 = []
    for i, (stem, options, key_word) in enumerate(B4_ITEMS):
        n = i + 1
        idx = next((j for j, o in enumerate(options) if o.lower() == key_word.lower()), None)
        assert idx is not None, f"B4-Q{n}: key word {key_word!r} not among options {options}"
        qs56.append({
            "id": f"g10-l56-{n}",
            "n": n,
            "category": "vocab",
            "question": stem,
            "options": options,
            "answer": idx,
        })
    base_lessons.append({
        "lesson": 56,
        "title": "تشریحی درس سوم — تست چهارگزینه‌ای (ص۱۲۱-۱۲۲)",
        "level": "تشریحی — چهارگزینه‌ای",
        "count": len(qs56),
        "questions": qs56,
    })


RECEIPT = {
    "exam": "آزمون تشریحی واژگان درس سوم (ص۱۲۰-۱۲۲)",
    "header": "سربرگِ ص۱۲۰ (رندرِ ۶۰۰dpi): «آزمون تشریحی واژگان درس سوم» (پاسخنامه صفحه: ۲۷۴) — لایهٔ OCR «تسی یچ» (پنجمین تکرارِ لایه‌غلطِ تشریحی: r318/r331/r333/r336 — رندر حاکم: تمیز)؛ دستورِ سکشن‌۱ «با استفاده از کلمات داده شده، جملات زیر را کامل کنید. (یک کلمه اضافه می باشد)» (لایه «جمالت/اضاقن یم» = جملات/اضافه می)؛ سکشن‌۲ «جملات زیر را با نوشتن یک کلمه مناسب کامل کنید.»؛ سکشن‌۳ «کلمات زیر را با تعاریف داده شده مطابقت دهید. (یک کلمه اضافه می باشد)»؛ سکشن‌۴ «بهترین گزینه را انتخاب کنید.»؛ پاصفحهٔ ص۱۲۲: «Telegram Channel: @PracticalEnglishInKonkour»",
    "keyPages": "274",
    "extractedRound": "r338",
    "keyVerification": "گریدِ واژه‌ایِ چاپِ ص۲۷۴ «آزمون تشریحی واژگان درس سوم (آزمون صفحه: ۱۲۰ تا ۱۲۲)» — ۱۶ کلیدِ سکشن‌۱ + ۸ کلیدِ سکشن‌۲ + ۸ کلیدِ سکشن‌۳ + ۲۵ کلیدِ واژه‌ایِ سکشن‌۴ که همگی با حروفِ گزینه‌ها می‌خوانند — ۵۷/۵۷ با پیش‌پرکردنِ معنایی هم‌رأی، صفر واگرایی؛ گریدِ کلیدِ سکشن‌۴ بدونِ فاصله بعدِ عدد («1.Experimentig») و با سطرهای یک‌درمیانِ خاکستری",
    "pattern": "r323/r326 — چهار بانک به ازای چهار سکشن: بانک‌واژه ۱۶ تایپی از دو زیربانکِ ۹کلمه‌ای چاپ + حرفِ اول ۸ تایپی + تعریف‌ها ۸ تایپی + ۲۵ MCQ",
    "printQuirks": [
        "گریدِ کلیدِ ص۲۷۴ Q1: «1.Experimentig» بدونِ n — عینِ چاپ؛ گزینهٔ خودِ سؤال (ص۱۲۱، رندر ۶۰۰dpi) «Experimenting» تمیز است؛ کلید = گزینهٔ c هر دوصورت",
        "سکشن‌۲ — زیرخطِ چاپ در ۶ از ۸ آیتم کوتاه‌تر از طولِ کلید: Q2 c+4 (camera=۶)، Q4 p+5 (patient=۷)، Q5 b+2 (bulb=۴)، Q6 e+7 (energetic=۹)، Q7 a+5 (airplane=۸ — دو تیره کم!)، Q8 w+4 (winter=۶) — قاعدهٔ r323-Q7: ساقه عینِ چاپ، کلید از گریدِ ص۲۷۴؛ فقط Q1 (i+7=inventor) و Q3 (t+8=telephone) هم‌طولند",
        "MCQ-6 «Could you mind my bag for a/an …» — عینِ چاپ (Would انتظار می‌رفت)؛ «a/an» هم عینِ چاپ (همچنین Q17 و سکشن‌۲-۷ «an (a…»)",
        "MCQ-23: گزینه‌های b/c/d (special/moment/thought) در چاپ جعبهٔ خاکستریِ سایه‌دار دارند (a. hospital زرد) — آرتیفکتِ چاپ؛ کلید = b (special)",
        "MCQ-9: دوجای‌خالی با گزینه‌های اسلش‌دارِ چاپ («be / after»، «give / up»، «put / aside»، «grow / up») — کلیدِ گرید بدونِ فاصله «put/aside»؛ گزینه به عینِ چاپِ سؤال (فاصله‌دار) ذخیره شد",
        "MCQ-14: جای خالیِ چاپِ ساقه فقط ۴ تیره است («----») برخلافِ ۱۸-۲۵ تیرهٔ بقیه — ناهماهنگیِ خودِ چاپ؛ نرمال‌شده به تیرهٔ استانداردِ خانواده",
        "سکشن‌۱ Q1: کاما چسبیده به جای خالی («------------------, we got home») — عینِ چاپ",
        "جعبهٔ «Note:» خالیِ خط‌چین در پایینِ ص۲۷۴ (۴ خط — همان الگویِ r334)",
    ],
}

def main():
    old = json.loads(PATH.read_text(encoding="utf-8"))
    existing = [l for l in old["lessons"] if l["lesson"] >= 53]
    if existing:
        print(f"lessons 53+ already present ({sum(l['count'] for l in existing)} items) — NO-OP")
        # رسیدِ source همیشه بازنویسی می‌شود (idempotent)
        if old["source"].get("tashrihi3") != RECEIPT:
            old["source"]["tashrihi3"] = RECEIPT
            PATH.write_text(json.dumps(old, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print("source.tashrihi3 refreshed")
        return
    assert len(old["lessons"]) == 52, f"baseline mismatch: {len(old['lessons'])} banks"
    assert sum(l["count"] for l in old["lessons"]) == 677, "baseline item count mismatch"

    data = json.loads(PATH.read_text(encoding="utf-8"))
    build_lessons(data["lessons"])
    data["source"]["tashrihi3"] = RECEIPT

    # راستی‌آزماییِ نهایی: ۵۶ بانک / ۷۳۴ آیتم / id یگانه
    assert len(data["lessons"]) == 56
    total = sum(l["count"] for l in data["lessons"])
    assert total == 734, f"total {total} != 734"
    ids = [q["id"] for l in data["lessons"] for q in l["questions"]]
    assert len(ids) == len(set(ids)) == 734

    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"OK: banks 53-56 added — {total} items in {len(data['lessons'])} banks")
    for l in data["lessons"][-4:]:
        print(f"  bank {l['lesson']}: {l['title']} — {l['count']}")


if __name__ == "__main__":
    main()
