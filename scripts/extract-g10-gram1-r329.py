# -*- coding: utf-8 -*-
# r329 — استخراجِ «آزمون تشریحی گرامر درس اول» جزوهٔ دهم (ص۵۹-۶۰، کلید چاپی ص۲۴۸)
# به public/jozve/tests-g10.json — چهار بانکِ ۱۳-۱۶ (۱۵ تایپی + ۷ تایپی + ۵ تایپی + ۱۰ MCQ = ۳۷ آیتم)
# الگو: r323/r326 (بانک تشریحیِ چهاربخشی: kind/accepted/placeholder + MCQ با کلید واژه‌ای).
# نرمال‌سازِ r285 (typed-answer.ts): اسلش→فاصله («are / going to») و حذفِ نقطه‌گذاریِ پایانی (جملات کامل) — طراحی‌شده عیناً برای این کلیدها.
# زوم‌های ۴۰۰۰-۵۰۰۰dpi: گزینهٔ c ساقهٔ ۹ («'m going o» — اراتوم چاپ)، گزینهٔ d ساقهٔ ۴ («willn't»)،
# ساقهٔ ۱۰ («camera؟» با علامت سؤال)، گریدِ کلید («are / going to» با فاصله‌دورِ اسلش).
# Idempotent: اجرای دوم NO-OP (مبنا = ۱۲ بانکِ r323-r328).
import json
from pathlib import Path

PATH = Path("public/jozve/tests-g10.json")

# —— بخش ۱: از will و یا be going to استفاده کرده و جاهای خالی را پر کنید (ص۵۹، ۱۵ آیتم)
# (ساقه، کلیدِ چاپیِ ص۲۴۸) — options[0] = کلید؛ باقی = خانوادهٔ فرم‌ها (داربستِ مرور)
S1 = [
    ("There is a good film on TV tonight. I --------------- watch it.", "am going to"),
    ("I feel terrible. I think I --------------- be sick.", "am going to"),
    ("Perhaps I --------------- visit Japan one day.", "will"),
    ("What time --------------- you --------------- leave tomorrow?", "are / going to"),
    ("Don’t touch that dog. It --------------- bite you.", "will"),
    ("Who --------------- win the next World Cup?", "will"),
    ("A: Your hands are very dirty.  B: Oh, I didn’t know. I --------------- wash them.", "will"),
    ("A: I’ve got a headache.  B: I --------------- get an aspirin for you.", "will"),
    ("A: Why are you filling that bucket with water?  B: I --------------- wash the car.", "am going to"),
    ("A: I can’t work out how to use this camera?  B: It’s very easy. I --------------- show you.", "will"),
    ("A: Did you post that letter for me?  B: Oh, I’m sorry. I --------------- do it now.", "will"),
    ("A: We need some bread for lunch.  B: Oh, do we? I --------------- go to the shop and get some.", "will"),
    ("A: Those clouds are very black, aren’t they?  B: I think it --------------- rain.", "is going to"),
    ("A: What would you like to drink, tea or coffee?  B: I --------------- have coffee, please.", "will"),
    ("A: Why do you want to sell your apartment?  B: We --------------- move to the countryside.", "are going to"),
]

# —— بخش ۲: با استفاده از کلمات داده شده جمله بسازید (ص۵۹، ۷ آیتم) — (کلماتِ به‌هم‌ریخته، جملهٔ کلید ص۲۴۸)
S2 = [
    ("going / a house / they / soon / to / are / buy?", "Are they going to buy a house soon?"),
    ("not / watch / tonight / are / we / TV / to / going .", "We are not going to watch TV tonight."),
    ("don’t / go out / I / I / tonight / will / think .", "I don’t think I will go out tonight."),
    ("will / be / next / where / year / you / this time?", "Where will you be this time next year?"),
    ("am / make / phone call / I / to / a / going .", "I am going to make a phone call."),
    ("going / a museum / are / this / they / weekend / visit / to?", "Are they going to visit a museum this weekend?"),
    ("family / next / will / buy / a / our / year / car / new?", "Will our family buy a new car next year?"),
]

# —— بخش ۳: با استفاده از کلمات داخل پرانتز به سؤالات زیر جواب دهید (ص۶۰، ۵ آیتم)
S3 = [
    ("Where are they going to eat lunch? ( restaurant )", "They are going to eat lunch in a restaurant."),
    ("What are you going to do? ( wash my car )", "I am going to wash my car."),
    ("How will your father travel to Paris next week? ( plane )", "He will travel to Paris by plane next week."),
    ("When are the students going to play volleyball? ( tomorrow )", "They are going to play volleyball tomorrow."),
    ("Where will the tourists visit next summer? ( Yazd )", "They will visit Yazd next summer."),
]

# —— بخش ۴: بهترین گزینه را انتخاب کنید (ص۶۰، ۱۰ MCQ) — کلیدِ واژه‌ایِ ص۲۴۸ → اندیس
S4 = [
    ("A: When does your father arrive?  B: He is going --------------- in the afternoon.",
     ["arrive", "arriving", "to arrive", "arrives"], 2, "to arrive"),
    ("The man can’t see where he is going. He --------------- into the hole.",
     ["is falling", "falls", "will fall", "is going to fall"], 3, "is going to fall"),
    ("Her situation is getting worse. The doctors think that she --------------- die.",
     ["is going to", "will", "goes to", "will go to"], 0, "is going to"),
    ("Look! The barometer is falling, perhaps the weather --------------- be nice at the weekend.",
     ["won’t go to", "isn’t going to", "won’t", "willn’t"], 2, "won’t"),
    ("A: Why are you wearing your best suit?  B: I --------------- have lunch with my biggest customer.",
     ["will", "'m going to", "go to", "will to"], 1, "'m going to"),
    ("If he passes his exam, he --------------- stay in England for a year. His aim is to speak English fluently.",
     ["is going", "want to", "go to", "will"], 3, "will"),
    ("There isn’t any butter left. I --------------- go to the grocer’s and get some.",
     ["'m going to", "will", "will to", "wants to"], 1, "will"),
    ("A: Why are your children dressed like that?  B: They --------------- to wash the car.",
     ["are going to", "will go", "go", "are going"], 3, "are going"),
    ("A: This box is very heavy.  B: Don’t worry. I --------------- carry it for you.",
     ["will to", "would", "'m going o", "will"], 3, "will"),
    ("A: Do you want to borrow my car?  B: Thanks, I --------------- bring it back tonight.",
     ["'m going to", "will", "would", "was going to"], 1, "will"),
]

QUIRKS = [
    "بخش۱-Q4: کلید چاپ «are / going to» دوبلانک است (گرید ص۲۴۸ با فاصله‌دورِ اسلش — زوم ۵۰۰۰dpi)؛ نرمال‌سازِ r285 اسلش→فاصله می‌کند و «are going to» تایپی می‌پذیرد",
    "بخش۱-Q10: ساقه چاپ «...how to use this camera?» با علامت سؤال نه نقطه (زوم ۴۰۰۰dpi — عین چاپ)",
    "بخش۱-Q7/۸/۹/۱۰/۱۱/۱۲/۱۳/۱۴/۱۵: دیالوگ A/B در چاپ دوستونه — رونویسی درونخطی با دو فاصله",
    "بخش۲-Q2: کلمات داده با «going .» پایانی (نقطه با فاصله — عین چاپ)",
    "بخش۲-Q3: دو «I» در کلمات داده (عین چاپ — جملهٔ کلید «I don't think I will go out tonight» هر دو را می‌خواهد)",
    "بخش۴-Q9 گزینهٔ c: چاپ «'m going o» بدون t (زوم ۵۰۰۰dpi — اراتوم چاپ؛ عین چاپ ذخیره شد، کلیدِ (d) will دست‌نخورده)",
    "بخش۴-Q4 گزینهٔ d: چاپ «willn't» (عین چاپ — حاشیهٔ حواس‌پرت‌کن)؛ گزینهٔ a «won't go to»",
    "بخش۴-Q9 گزینهٔ a: چاپ «will to» (عین چاپ)",
    "کلیدِ بخش ۴ واژه‌ای است نه حرفی («۱. to arrive ...») — نگاشتِ واژه→اندیس با پیش‌پرکردنِ معنایی ۱۰/۱۰ هم‌رأی (صفر واگرایی)",
    "ص۲۴۸ سربرگ: «پاسخنامه آزمون تشریحی گرامر درس اول (آزمون: صفحه ۵۹ و ۶۰)» — سربرگ نشانیِ کلید را خودش می‌گوید (درسِ r318)",
    "آپاستروف‌های چاپ راست‌خمیده (’) — رونویسی با ’؛ نرمال‌ساز r285 به ' راست تبدیل می‌کند",
    "ص۶۱ درسِ «نکات درس یکم — انواع اسم» را آغاز می‌کند — آزمون در ص۶۰ بسته می‌شود",
]


def family_opts(key, family):
    """options[0] = کلید؛ باقی = سه فرمِ دیگر (داربستِ مرور — هرگز رندر نمی‌شود)"""
    rest = [f for f in family if f != key]
    return [key] + rest[:3]


FAMILY = ["will", "am going to", "is going to", "are going to"]


def build_gram1():
    lessons = []

    qs1 = []
    for i, (stem, key) in enumerate(S1):
        qs1.append({
            "id": f"g10-l13-{i+1}", "n": i + 1, "category": "grammar",
            "kind": "typed",
            "question": stem,
            "options": family_opts(key, FAMILY),
            "answer": 0,
            "accepted": [key],
            "placeholder": "fill in the blank with will or be going to…",
        })
    lessons.append({
        "lesson": 13, "title": "تشریحی گرامر — جای خالی با will یا be going to (ص۵۹)",
        "level": "تشریحی — جای خالی", "count": len(qs1), "questions": qs1,
    })

    qs2 = []
    for i, (jumble, sentence) in enumerate(S2):
        others = [s for j, s in S2 if j != jumble]
        qs2.append({
            "id": f"g10-l14-{i+1}", "n": i + 1, "category": "grammar",
            "kind": "typed",
            "question": jumble,
            "options": [sentence] + others[:3],
            "answer": 0,
            "accepted": [sentence],
            "placeholder": "make a sentence with the given words…",
        })
    lessons.append({
        "lesson": 14, "title": "تشریحی گرامر — جمله‌سازی با کلمات داده شده (ص۵۹)",
        "level": "تشریحی — جمله‌سازی", "count": len(qs2), "questions": qs2,
    })

    qs3 = []
    for i, (qq, answer) in enumerate(S3):
        others = [a for q, a in S3 if q != qq]
        qs3.append({
            "id": f"g10-l15-{i+1}", "n": i + 1, "category": "grammar",
            "kind": "typed",
            "question": qq,
            "options": [answer] + others[:3],
            "answer": 0,
            "accepted": [answer],
            "placeholder": "answer the question using the word in parentheses…",
        })
    lessons.append({
        "lesson": 15, "title": "تشریحی گرامر — پاسخ به سؤالات با پرانتز (ص۶۰)",
        "level": "تشریحی — پاسخ کوتاه", "count": len(qs3), "questions": qs3,
    })

    qs4 = []
    for i, (stem, options, idx, key_word) in enumerate(S4):
        # پیش‌داوریِ معنایی: کلیدِ واژه‌ای چاپ باید با گزینهٔ انتخابی سازگار باشد
        assert options[idx] == key_word.replace("’", "’"), (i, options[idx], key_word)
        qs4.append({
            "id": f"g10-l16-{i+1}", "n": i + 1, "category": "grammar",
            "question": stem,
            "options": options,
            "answer": idx,
        })
    lessons.append({
        "lesson": 16, "title": "تشریحی گرامر — تست چهارگزینه‌ای (ص۶۰)",
        "level": "تشریحی — چهارگزینه‌ای", "count": len(qs4), "questions": qs4,
    })

    return lessons


def main():
    old = json.loads(PATH.read_text(encoding="utf-8"))
    base_lessons = old["lessons"][:12] if len(old["lessons"]) == 16 else old["lessons"]
    assert old["grade"] == 10 and len(base_lessons) == 12, "unexpected base shape"
    assert sum(l["count"] for l in base_lessons) == 274, "unexpected base count"
    base_source = {k: v for k, v in old["source"].items() if k != "gram1"}

    new_lessons = build_gram1()
    doc = {"grade": 10, "lessons": base_lessons + new_lessons, "source": dict(base_source)}
    doc["source"]["gram1"] = {
        "exam": "آزمون تشریحی گرامر درس اول — will / be going to (سؤالات: ص۵۹ و ۶۰)",
        "header": "«آزمون تشریحی گرامر درس اول» (پاسخنامه صفحه: ۲۴۸) — بخش ۱ جای خالی (۱۵) + بخش ۲ جمله‌سازی (۷) + بخش ۳ پاسخ کوتاه (۵) + بخش ۴ چهارگزینه‌ای (۱۰)",
        "keyPages": "248",
        "keyVerification": "print key p248 «پاسخنامه آزمون تشریحی گرامر درس اول (آزمون: صفحه ۵۹ و ۶۰)» — 37/37 agree with semantic pre-fill (S1/S2/S3 sentence keys verbatim; S4 word-keys mapped to letters, 10/10 semantic), zero divergence",
        "extractedRound": "r329",
        "pattern": "r323/r326 (بانک تشریحی چهاربخشی) + r285/r289 (kind/accepted/placeholder + نرمال‌سازِ اسلش→فاصله) + r309/r321 (کلید دست‌نخورده، اراتوم مستند)",
        "printQuirks": QUIRKS,
    }

    total = sum(l["count"] for l in doc["lessons"])
    print(f"built: {len(doc['lessons'])} banks, {total} items (gram1: {sum(l['count'] for l in new_lessons)})")
    if old == doc:
        print("identical content — NO-OP")
        return
    PATH.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"written: {PATH}")


if __name__ == "__main__":
    main()
