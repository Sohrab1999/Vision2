# -*- coding: utf-8 -*-
# r342 — استخراجِ «آزمون جامع تشریحی درس سوم» جزوهٔ دهم (ص۱۳۵-۱۳۷، کلیدِ چاپیِ ص۲۸۱-۲۸۲)
# به public/jozve/tests-g10.json — هفت بانکِ ۶۷-۷۳ (الگوی r336 — بانک به ازای خانوادهٔ سکشن):
#   ۶۷ تایپیِ ۱۶ (S1 کلماتِ ناقصِ ۴ + S2 بانکِ ۸واژه‌ایِ ۸ با [bank:] + S3 کلمهٔ مناسبِ حرف‌اولِ ۴) /
#   ۶۸ چهارگزینه‌ایِ ۱۲ (S4 متعلقِ متفاوتِ ۴ + S5 واژگانِ ۴ + S6 گرامرِ ۴) /
#   ۶۹ تایپیِ ۹ (S7 جمله‌سازیِ ۲ + S8 دانشِ گرامریِ ۴ + S9 ضمایرِ تأکیدیِ ۳) /
#   ۷۰ تایپیِ ۵ (S10 شکلِ افعال — دوجای‌خالیِ اسلش‌دار) /
#   ۷۱ تایپیِ ۲ (S11 تأکیدِ تلفظ — کلیدِ چاپی واژهٔ قرمزِ درونِ دیالوگ: I / red) /
#   ۷۲ کلوزِ تایپیِ ۶ (طاهره صفارزاده، [bank:]) /
#   ۷۳ کلوزِ تایپیِ ۷ (دانش قدرت است، [bank:] — جای‌های ۵و۶ در یک جمله → یک آیتمِ اسلش‌دار r337-D)
# = ۵۷ آیتم برای ۵۸ کلیدِ چاپی (S13 یک آیتم دو کلید را می‌پوشاند) — صفر واگرایی با پیش‌پرکردنِ معنایی.
# داوری‌های رندر (۳۰۰dpi کامل ×۵ صفحه + ۶۰۰-۱۲۰۰dpi برش‌ها):
#   - سربرگِ ص۱۳۵ (۶۰۰dpi): «"آزمون جامع تشریحی درس سوم"» + «(پاسخنامه صفحه: ۲۸۱ و ۲۸۲)» — ارقامِ فارسی با «و»
#     (هفتمین «تسی یچ»ِ لایه؛ برخلافِ r339 لاتین و r340 فارسیِ «۲۷۷ - ۲۷۸» — اینجا واصفِ «و» نه تیره)
#   - سربرگِ کلیدِ ص۲۸۱ (۶۰۰dpi): «"پاسخنامه آزمون جامع تشریحی درس سوم"» + «(آزمون: صفحه ۱۳۵ تا ۱۳۷)» — فارسی با «تا»
#   - S2: دستورِ چاپ «(یک کلمه اضافه می باشد)» اما بانک دقیقاً ۸ واژه دارد و کلید هر ۸ را مصرف می‌کند —
#     ناسازگاریِ درونیِ چاپ (برخلافِ r336: ۹واژه/۸جای‌خالی با «heavens» اضافیِ واقعی)
#   - S6-Q3 گزینه‌ها (رندرِ ۹۰۰dpi): a. yourself / b. herself / c. myself / d. himself — لایه به‌هم‌ریخته بود
#   - S11 کلید (رندرِ ۱۲۰۰dpi ص۲۸۲): پاسخ با رنگِ قرمزِ درونِ دیالوگِ تکرارشده: Q1 «No, I was.» با I قرمز /
#     Q2 «No, my pencil is red.» با red قرمز — نخستین کلیدِ رنگ‌نشانه‌ایِ این خانواده
#   - S13 کوئیرک‌های عینِ چاپ: «stay up to dated» (تایپو) و «the most powerful kinds on earth»
# Idempotent: اجرای دوم NO-OP (مبنا = ۶۶ بانکِ r323-r341 / ۸۴۸ آیتم).
import json
from pathlib import Path

PATH = Path("public/jozve/tests-g10.json")

BL10 = "-" * 10   # تیرهٔ نمایشیِ S2/S8 (چاپ ۱۴-۲۶ متغیر — الگوی r336: طولِ تیره محتوایی نیست)
BL19 = "-" * 19   # تیرهٔ S8 (لایه: ۱۹)
BL15 = "-" * 15   # تیرهٔ S9 (لایه: ۱۵-۲۲)
BL15V = "-" * 15  # تیرهٔ S10 (لایه ۹-۲۲ متغیر)
BL6 = "-" * 6     # تیرهٔ S5/S6 (چاپ ۲۶ — نمایشیِ کوتاه‌تر برای ساقه‌های چهارگزینه‌ای — الگوی r336 BL10)

BANK2 = "ashamed / strongly / possible / thousands / weak / sense / energetic / invented"
BANK12 = "hard / reciting / passed / published / translator / first"
BANK13 = "strong / success / skills / power / action / develop / fast / useful"

PH_MISS = "complete the missing letters…"
PH_BANK = "type a word from the bank…"
PH_INIT = "type the word (initial letter is given)…"
PH_SENT = "make a sentence with the given words…"
PH_REF = "complete the answer (emphatic pronoun)…"
PH_DUAL = "complete both blanks (use / between the two answers)…"
PH_STRESS = "type the word with the stronger stress…"
PH_PLAIN = "type your answer…"


def typed(bank, n, cat, q, key, distractors, accepted=None, bank_str=None, ph=PH_PLAIN):
    return {
        "id": f"g10-l{bank}-{n}", "n": n, "category": cat, "kind": "typed",
        "question": q + (f" [bank: {bank_str}]" if bank_str else ""),
        "options": [key] + distractors, "answer": 0,
        "accepted": accepted or [key], "placeholder": ph,
    }


def mcq(bank, n, cat, q, opts, key):
    return {"id": f"g10-l{bank}-{n}", "n": n, "category": cat, "question": q, "options": opts, "answer": key}


# ———— سکشن ۱: کلمات ناقص — ۴ (Q2 دوجای‌خالی با کلیدِ اسلش‌دارِ چاپی؛ «up» بیرونِ پرانتز است)
S1 = [
    ("Some (s__ient__sts) become very famous and rich.",
     "scientists", ["scientist", "sciences", "scientific"], PH_MISS, None),
    ("When children (gr__w) up their (person__lity) changes.",
     "grow up / personality", ["grew up / personal", "grow up / personally", "grew / personality"], PH_DUAL,
     ["grow up / personality", "grow / personality"]),
    ("This book can (d__v__lop) your speaking well.",
     "develop", ["development", "developing", "developed"], PH_MISS, None),
    ("My sister (t__i__s) hard to learn English.",
     "tries", ["tried", "trying", "tries hard"], PH_MISS, None),
]

# ———— سکشن ۲: بانکِ ۸واژه‌ای — ۸ (دستورِ چاپ «یک کلمه اضافه می باشد» اما بانک ۸واژه/۸جای‌خالی است!)
S2 = [
    (f"Dogs have a good {BL10} of smell.",
     "sense", ["scent", "sensible", "sentence"]),
    (f"The World Wide Web was {BL10} in 1989.",
     "invented", ["invited", "invention", "inventor"]),
    (f"She was {BL10} to ask her brother for money.",
     "ashamed", ["ashame", "shamed", "surprised"]),
    (f"He’s very {BL10}, isn’t he, for a man of his age?",
     "energetic", ["energy", "energetically", "active"]),
    (f"The team has a strong attack, but its defense is {BL10}.",
     "weak", ["week", "weakness", "strongly"]),
    (f"With today’s technology almost anything seems {BL10}.",
     "possible", ["possibly", "impossible", "possibility"]),
    (f"They {BL10} believe their children should make choices for themselves.",
     "strongly", ["strong", "strength", "stronger"]),
    (f"Edison was famous for doing {BL10} of experiments to find answers to problems.",
     "thousands", ["thousand", "thousandth", "hundreds"]),
]

# ———— سکشن ۳: کلمهٔ مناسب با حروفِ راهنما — ۴
S3 = [
    ("My brother has the flu and feels (w _ _ _).",
     "weak", ["wake", "weakly", "weaker"], PH_INIT),
    ("A person who translates is a (t _ _ _ _ _ _ _ _).",
     "translator", ["translate", "translation", "translating"], PH_INIT),
    ("If you want to find an answer to a problem, you must (s _ _ _ _) it.",
     "solve", ["sold", "solved", "solution"], PH_INIT),
    ("A book that tells a story about people and things that are not real is a (n _ _ _ _).",
     "novel", ["noval", "newel", "noun"], PH_INIT),
]

# ———— سکشن ۴: متعلقِ متفاوت — ۴ (چهارگزینه‌ای با واژه‌ها)
S4 = [
    ("کدام گزینه با سایر گزینه‌ها متفاوت است؟ (۱) — winter / summer / holy / fall",
     ["winter", "summer", "holy", "fall"], 2),
    ("کدام گزینه با سایر گزینه‌ها متفاوت است؟ (۲) — patient / cradle / sick / ill",
     ["patient", "cradle", "sick", "ill"], 1),
    ("کدام گزینه با سایر گزینه‌ها متفاوت است؟ (۳) — inventor / hospital / library / laboratory",
     ["inventor", "hospital", "library", "laboratory"], 0),
    ("کدام گزینه با سایر گزینه‌ها متفاوت است؟ (۴) — hearing / smell / eyesight / emotion",
     ["hearing", "smell", "eyesight", "emotion"], 3),
]

# ———— سکشن ۵: بهترین گزینه (واژگان) — ۴
S5 = [
    ("The key to our -------------------------- is our hard work and belief in ourselves.",
     ["description", "behavior", "success", "language"], 2),
    ("Scientists find -------------------------- and invent things.",
     ["peace", "medicines", "facts", "situation"], 2),
    ("They are going to -------------------------- a laboratory in our school soon.",
     ["attend", "build", "become", "change into"], 1),
    ("I -------------------------- working to be at home with the kids.",
     ["emphasized", "meant", "noticed", "quitted"], 3),
]

# ———— سکشن ۶: بهترین گزینه (گرامر) — ۴ (ترتیبِ گزینه‌ها با رندرِ ۹۰۰dpi داوری شد)
S6 = [
    ("My parents -------------------------- lots of photographs of us when we were small.",
     ["took", "were taking", "take", "are taking"], 0),
    ("At 4 pm last Tuesday, I -------------------------- in the office.",
     ["am working", "was working", "worked", "work"], 1),
    ("She made -------------------------- a cup of tea and sat down in front of the television.",
     ["yourself", "herself", "myself", "himself"], 1),
    ("I -------------------------- the name of the street.",
     ["am not knowing", "wasn’t knowing", "knows", "don’t know"], 3),
]

# ———— سکشن ۷: جمله‌سازی — ۲
S7 = [
    ("glass / he / on the / himself / broken / cut.",
     "He cut himself on the broken glass.",
     ["He cut the broken glass on himself.", "He himself cut on the broken glass.", "The broken glass cut himself on he."], PH_SENT),
    ("to school / the accident / Lisa / she / when / saw / was going.",
     "Lisa saw the accident when she was going to school.",
     ["Lisa was going the accident when she saw to school.", "She saw Lisa when the accident was going to school.", "Lisa saw the accident when she was going school."], PH_SENT),
]

# ———— سکشن ۸: دانشِ گرامری — ۴
S8 = [
    (f"It was funny. They {BL19} staying in the hotel next to ours.",
     "were", ["was", "are", "did"]),
    (f"Someone phoned him when he {BL19} working in his office.",
     "was", ["were", "is", "did"]),
    (f"They lost the match and were ashamed of {BL19}.",
     "themselves", ["them", "their", "they"]),
    (f"The door opens {BL19} when someone comes near it.",
     "itself", ["himself", "herself", "its"]),
]

# ———— سکشن ۹: ضمایر تأکیدی — ۳ (کلید = محتوای تیره؛ ساقه پیشوندِ «Nobody, I» را دارد)
S9 = [
    (f"Who bought you this umbrella? — Nobody, I {BL15}.",
     "myself bought it", ["myself bought them", "me bought it", "myself did bought it"], PH_REF),
    (f"Did you buy a newspaper for your brother? — No, he {BL15}.",
     "himself bought it", ["himself bought them", "him bought it", "hisself bought it"], PH_REF),
    (f"Did the guests wash the dishes last night? — No, my mother {BL15}.",
     "herself washed them", ["herself washed it", "her washed them", "herself wash them"], PH_REF),
]

# ———— سکشن ۱۰: شکلِ صحیحِ افعال داخل پرانتز — ۵ (Q1/Q2/Q4 دوجای‌خالیِ اسلش‌دار)
S10 = [
    (f"I {BL15V} (see) you in the park yesterday. You were sitting on the grass and you {BL15V} (read) a book.",
     "saw / were reading", ["was seeing / read", "saw / read", "seen / were reading"], PH_DUAL),
    (f"I {BL15V} (hurt) my back while I {BL15V} (work) in the garden.",
     "hurt / was working", ["was hurting / worked", "hurt / worked", "hurts / was working"], PH_DUAL),
    (f"The television was on, but nobody {BL15V} (watch) it.",
     "was watching", ["watched", "were watching", "is watching"], PH_PLAIN),
    (f"My sister {BL15V} (take) a photograph of me while I {BL15V} (not/look).",
     "took / wasn’t looking", ["was taking / didn’t look", "took / didn’t looked", "taken / wasn’t looking"], PH_DUAL),
    (f"When I was young, I {BL15V} (want) to be a doctor.",
     "wanted", ["was wanting", "want", "was wanted"], PH_PLAIN),
]

# ———— سکشن ۱۱: تأکیدِ تلفظ — ۲ (کلیدِ چاپی: واژهٔ قرمزِ درونِ دیالوگِ تکرارشده)
S11 = [
    ("A: Was your brother washing the dishes? — B: No, I was.",
     "I", ["was", "brother", "dishes"], PH_STRESS),
    ("A: Is it your pencil? — B: No, my pencil is red.",
     "red", ["pencil", "my", "is"], PH_STRESS),
]

# ———— سکشن ۱۲: کلوزِ طاهره صفارزاده — ۶
S12 = [
    ("Tahereh Saffarzadeh was an Iranian poet, writer, ---(1)--- and university professor.",
     "translator", ["translation", "translating", "translate"]),
    ("When she was a child, she learned reading and ---(2)--- the Holy Quran.",
     "reciting", ["recite", "recited", "recitation"]),
    ("She was working very ---(3)--- to learn new things.",
     "hard", ["hardly", "harder", "hardest"]),
    ("She ---(4)--- her translation of the Quran in Persian and English in 2001.",
     "published", ["publishing", "publisher", "passes"]),
    ("It is the ---(5)--- translation of the Quran into English by a woman.",
     "first", ["fast", "firstly", "worst"]),
    ("She ---(6)--- away in 2008 in Tehran.",
     "passed", ["passed away", "passing", "past"]),
]

# ———— سکشن ۱۳: کلوزِ «دانش قدرت است» — ۷ آیتم برای ۸ جای خالی (۵و۶ در یک جمله — الگوی r337-D)
S13 = [
    ("Knowledge is power. Without knowledge humans cannot ---(1)---.",
     "develop", ["developing", "development", "developed"], PH_PLAIN),
    ("It is very important to stay up to dated. Knowledge is important to improve and get ---(2)--- in life.",
     "success", ["successful", "succeed", "successfully"], PH_PLAIN),
    ("We get knowledge not only by reading books but also by ---(3)--- experience in life.",
     "useful", ["use", "useless", "usefully"], PH_PLAIN),
    ("One can get anything in life with the ---(4)--- of knowledge.",
     "power", ["powerful", "powered", "powder"], PH_PLAIN),
    ("Humans are not as ---(5)--- as tigers or cannot run as ---(6)--- as horses nor can they fly as birds, yet they are the most powerful kinds on earth because of knowledge.",
     "strong / fast", ["strongly / fastly", "strong / fastly", "strongly / fast"], PH_DUAL),
    ("Knowledge helps us change our ideas into ---(7)---.",
     "action", ["act", "active", "actively"], PH_PLAIN),
    ("Humans can get, learn, understand, analyze, experiment, research, perform, share and multiply their ---(8)--- and knowledge.",
     "skills", ["skilled", "skillful", "skill"], PH_PLAIN),
]

SECTIONS = [
    (67, "کلمات ناقص، بانک واژه و کلمهٔ مناسب (ص۱۳۵)", "تشریحی — تایپی (ناقص/بانک/حرفِ اول)", "vocab"),
    (68, "چهارگزینه‌ای واژگان و گرامر (ص۱۳۵-۱۳۶)", "تشریحی — چهارگزینه‌ای", None),
    (69, "جمله‌سازی، دانش گرامری و ضمایر تأکیدی (ص۱۳۶)", "تشریحی — تایپی", "grammar"),
    (70, "شکل صحیح افعال داخل پرانتز (ص۱۳۶)", "تشریحی — تایپیِ دوجای‌خالیِ اسلش‌دار", "grammar"),
    (71, "تأکید تلفظ (ص۱۳۷)", "تشریحی — تایپیِ تأکیدِ تلفظ", "grammar"),
    (72, "کلوز — طاهره صفارزاده (ص۱۳۷)", "تشریحی — تایپیِ کلوزِ بانک‌واژه", "vocab"),
    (73, "کلوز — دانش قدرت است (ص۱۳۷)", "تشریحی — تایپیِ کلوزِ بانک‌واژه", "vocab"),
]

# کلیدهای چاپیِ ص۲۸۱-۲۸۲ (رونویسیِ رندر — قفلِ مستقلِ گارد؛ S13-5 دو کلیدِ چاپیِ ۵و۶ را می‌پوشاند)
PRINTED_KEYS = {
    67: ["scientists", "grow up / personality", "develop", "tries",
         "sense", "invented", "ashamed", "energetic", "weak", "possible", "strongly", "thousands",
         "weak", "translator", "solve", "novel"],
    68: ["holy", "cradle", "inventor", "emotion",
         "success", "facts", "build", "quitted",
         "took", "was working", "herself", "don’t know"],
    69: ["He cut himself on the broken glass.", "Lisa saw the accident when she was going to school.",
         "were", "was", "themselves", "itself",
         "myself bought it", "himself bought it", "herself washed them"],
    70: ["saw/were reading", "hurt/was working", "was watching", "took/wasn’t looking", "wanted"],
    71: ["I", "red"],
    72: ["translator", "reciting", "hard", "published", "first", "passed"],
    73: ["develop", "success", "useful", "power", "strong/fast", "action", "skills"],
}


def norm(s: str) -> str:
    # بازسازیِ نرمال‌سازیِ موتورِ تایپی (src/lib/typed-answer.ts): کوچک‌سازی + آپاستروف + اسلش→فاصله
    return " ".join(
        s.lower().replace("’", "'").replace("/", " ").split()
    )


def build():
    banks = {}
    # بانک ۶۷: S1(4) + S2(8 با bank) + S3(4)
    qs = []
    for i, entry in enumerate(S1, 1):
        q, key, dist, ph, extra = entry
        qs.append(typed(67, i, "vocab", q, key, dist, accepted=extra, ph=ph))
    for i, (q, key, dist) in enumerate(S2, 5):
        qs.append(typed(67, i, "vocab", q, key, dist, bank_str=BANK2, ph=PH_BANK))
    for i, (q, key, dist, ph) in enumerate(S3, 13):
        qs.append(typed(67, i, "vocab", q, key, dist, ph=ph))
    banks[67] = qs
    # بانک ۶۸: S4(4) + S5(4) + S6(4) — MCQ
    qs = []
    for i, (q, opts, key) in enumerate(S4, 1):
        qs.append(mcq(68, i, "vocab", q, opts, key))
    for i, (q, opts, key) in enumerate(S5, 5):
        qs.append(mcq(68, i, "vocab", q, opts, key))
    for i, (q, opts, key) in enumerate(S6, 9):
        qs.append(mcq(68, i, "grammar", q, opts, key))
    banks[68] = qs
    # بانک ۶۹: S7(2) + S8(4) + S9(3)
    qs = []
    for i, (q, key, dist, ph) in enumerate(S7, 1):
        qs.append(typed(69, i, "grammar", q, key, dist, ph=ph))
    for i, (q, key, dist) in enumerate(S8, 3):
        qs.append(typed(69, i, "grammar", q, key, dist, ph=PH_PLAIN))
    for i, (q, key, dist, ph) in enumerate(S9, 7):
        qs.append(typed(69, i, "grammar", q, key, dist, ph=ph))
    banks[69] = qs
    # بانک ۷۰: S10(5)
    banks[70] = [typed(70, i, "grammar", q, key, dist, ph=ph) for i, (q, key, dist, ph) in enumerate(S10, 1)]
    # بانک ۷۱: S11(2)
    banks[71] = [typed(71, i, "grammar", q, key, dist, ph=ph) for i, (q, key, dist, ph) in enumerate(S11, 1)]
    # بانک ۷۲: S12(6) با bank
    banks[72] = [typed(72, i, "vocab", q, key, dist, bank_str=BANK12, ph=PH_BANK)
                 for i, (q, key, dist) in enumerate(S12, 1)]
    # بانک ۷۳: S13(7) با bank
    banks[73] = [typed(73, i, "vocab", q, key, dist, bank_str=BANK13, ph=ph)
                 for i, (q, key, dist, ph) in enumerate(S13, 1)]
    return banks


def main():
    data = json.loads(PATH.read_text(encoding="utf-8"))
    existing = [l for l in data["lessons"] if l["lesson"] >= 67]
    if existing:
        print(f"lessons 67+ already present ({sum(l['count'] for l in existing)} items) — NO-OP")
        if data["source"].get("jame3") is None:
            data["source"]["jame3"] = RECEIPT
            PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print("source.jame3 refreshed")
        return
    assert len(data["lessons"]) == 66, f"baseline mismatch: {len(data['lessons'])} banks"
    assert sum(l["count"] for l in data["lessons"]) == 848, "baseline item count mismatch"

    banks = build()
    for lesson, title, level, cat in SECTIONS:
        qs = banks[lesson]
        assert len(qs) == {67: 16, 68: 12, 69: 9, 70: 5, 71: 2, 72: 6, 73: 7}[lesson], f"bank {lesson} shape"
        # قفلِ کلیدِ چاپی: norm(accepted[0]) == norm(printed)
        printed = PRINTED_KEYS[lesson]
        assert len(printed) == len(qs), f"bank {lesson}: {len(printed)} printed keys vs {len(qs)} items"
        for i, q in enumerate(qs):
            if "kind" in q:  # typed
                acc = q["accepted"]
                assert norm(acc[0]) == norm(printed[i]), \
                    f"bank {lesson} Q{i+1}: accepted[0]={acc[0]!r} != printed {printed[i]!r}"
            else:  # mcq — کلیدِ واژه‌ای باید با گزینهٔ نشانه‌شده هم‌ارز باشد
                assert norm(printed[i]) == norm(q["options"][q["answer"]]), \
                    f"bank {lesson} Q{i+1}: printed {printed[i]!r} != option {q['options'][q['answer']]!r}"
        data["lessons"].append({
            "lesson": lesson, "title": title, "level": level,
            "count": len(qs), "questions": qs,
        })

    data["source"]["jame3"] = RECEIPT

    assert len(data["lessons"]) == 73, f"post mismatch: {len(data['lessons'])} banks"
    total = sum(l["count"] for l in data["lessons"])
    assert total == 905, f"total {total} != 905"
    ids = [q["id"] for l in data["lessons"] for q in l["questions"]]
    assert len(ids) == len(set(ids)) == 905

    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"OK: banks 67-73 added — {total} items in {len(data['lessons'])} banks")
    for lesson, title, level, cat in SECTIONS:
        print(f"  bank {lesson}: {title} — {len(banks[lesson])}")


RECEIPT = {
    "exam": "آزمون جامع تشریحی درس سوم (ص۱۳۵-۱۳۷)",
    "header": "سربرگِ ص۱۳۵ (رندرِ ۶۰۰dpi): «\"آزمون جامع تشریحی درس سوم\"» + «(پاسخنامه صفحه: ۲۸۱ و ۲۸۲)» — ارقامِ فارسی با واصفِ «و» (برخلافِ r340 «۲۷۷ - ۲۷۸» با تیره)؛ سربرگِ کلیدِ ص۲۸۱: «\"پاسخنامه آزمون جامع تشریحی درس سوم\"» + «(آزمون: صفحه ۱۳۵ تا ۱۳۷)» — فارسی با «تا»؛ لایهٔ «تسی یچ» = هفتمین تحریفِ «تشریحی» (r318/r331/r333/r336/r338/r340؛ رندر: تمیز)؛ ۱۳ سکشن / ۵۷ آیتم برای ۵۸ کلیدِ چاپی (S13 جای‌های ۵و۶ در یک جمله → یک آیتمِ اسلش‌دار)؛ بارمِ چاپی: ۱+۲+۱+۱+۱+۱+۱+۱+۱/۵+۲+۰/۵+۳+۴ = ۲۰ نمره",
    "keyPages": "281-282",
    "keyVerification": "کلیدِ چاپیِ کاملِ ص۲۸۱-۲۸۲ — ۵۸/۵۸ کلید با پیش‌پرکردنِ معنایی هم‌رأی — صفر واگرایی؛ S11: کلیدِ چاپی پاسخ را با رنگِ قرمزِ درونِ دیالوگِ تکرارشده نشان می‌دهد (Q1 «No, I was.» با I قرمز / Q2 «No, my pencil is red.» با red قرمز) — نخستین کلیدِ رنگ‌نشانه‌ایِ این خانواده (رندرِ ۱۲۰۰dpi)؛ کلیدهای اسلش‌دارِ چاپ («saw/were reading»، «hurt/was working»، «took/wasn’t looking»، «grow up / personality»، «strong/fast») با فاصلهٔ یکنواختِ « / » بازسازی شدند (الگوی r337-D/r340-S1)؛ S1-Q2 «up» بیرونِ پرانتزِ چاپ است پس accepted دو شکلی است: کلیدِ چاپیِ «grow up / personality» + محتوای تیرهٔ «grow / personality»؛ S9 کلیدها فقط محتوای تیره‌اند («myself bought it» و غیره)",
    "pattern": "r336 (جامعِ مخلوط — بانک به ازای خانوادهٔ سکشن) + r337-D/r340-L58 (کلیدِ اسلش‌دارِ دوجای‌خالی و ادغامِ دو اسلاتِ هم‌جمله) + r336-L32 ([bank:] روی آیتم‌های بانک‌واژه) + r329 (options[0]=کلید چاپ) + r337-L39 (کلوزِ تایپیِ بانک‌واژه) + r303",
    "printQuirks": [
        "سربرگ‌ها با ارقامِ فارسی: «(پاسخنامه صفحه: ۲۸۱ و ۲۸۲)» با واصفِ «و» (یگانه در خانواده — r336 تیره داشت) و «(آزمون: صفحه ۱۳۵ تا ۱۳۷)» با «تا»",
        "دستورِ S2 ادعای «(یک کلمه اضافه می باشد)» دارد اما بانک دقیقاً ۸ واژه برای ۸ جای خالی دارد و کلید هر ۸ را مصرف می‌کند — ناسازگاریِ درونیِ چاپ (برخلافِ r336: ۹واژه/۸جای‌خالی با «heavens» اضافیِ واقعی)",
        "S1-Q2 «When children (gr__w) up their (person__lity) changes.» — «up» بیرونِ پرانتز اما کلیدِ چاپیِ «grow up / personality» عبارتِ کامل را می‌دهد — accepted دو شکل دارد",
        "S6-Q3 لایه گزینه‌ها را به‌هم‌ریخته می‌داد («. m yself c» و «imself d. h») — رندرِ ۹۰۰dpi: a. yourself / b. herself / c. myself / d. himself",
        "S9 ساقه‌ها خطِ پاسخِ شماره‌دارِ چاپ دارند («1. Nobody, I ---.») — در داده با فرمِ خانواده («— Nobody, I ---.») بازسازی شد؛ کلید = محتوای تیره",
        "S11 کلیدِ رنگ‌نشانه‌ای: دیالوگِ تکرارشده با واژهٔ قرمزِ پاسخ (I / red) — بدونِ هیچ گریدِ حرفی/واژه‌ای",
        "S12 دستور «با گزینه های داده شده» و S13 «با کلمات داده شده» — هر دو بانکِ کاملِ بی‌اضافی (۶/۶ و ۸/۸)؛ بانکِ S12 زیرخطِ ایتالیکِ بولدِ چاپ",
        "S13 کوئیرک‌های عینِ چاپ: «stay up to dated» (به‌جای up to date) و «the most powerful kinds on earth» (kinds نه kings) — تاییدِ رندرِ ۱۲۰۰dpi؛ نشانگرِ ---(4)--- در چاپ بینِ دو خط شکسته (with the --- / (4)---) — در داده پیوسته",
        "S13 جای‌های ۵و۶ در یک جمله‌اند («as --- as tigers … as --- as horses») با دو کلیدِ چاپیِ جداگانه (5. strong / 6. fast) — یک آیتمِ اسلش‌دارِ «strong / fast» (الگوی r337-D؛ ۷ آیتم برای ۸ اسلات)",
        "جعبه‌های پاسخِ S12 (۳+۳) و S13 (۴+۴) با پرانتزِ خط‌چینِ سبز — نمایشی (در داده نیستند)؛ لایهٔ S12 «15.» = چسبندگیِ «1».prefix با «5.» — آرتیفکتِ لایه",
        "جعبهٔ Noteٔ خالی در پاصفحهٔ ص۱۳۷ (۹ خطِ خط‌چین) و ص۲۸۲ (۱۲ خط) — الگوی r330/r334/r337",
        "لایهٔ «جمالت/خایل/بیشی/پرانی ن/س ؤ.االت» — تحریف‌های استانداردِ لایه؛ رندر همه را تمیز می‌کند؛ «سؤاالت» = تجزیهٔ لایگ‌چر (نهمین تکرار)",
        "سکشن‌های چاپ با ارقامِ فارسیِ سرمه‌ای در سربرگِ هلوئی (۱ تا ۱۳) و آیتم‌ها با ارقامِ قرمزِ لاتین؛ S6 با سربرگِ «۶.» فارسی و آیتم‌های 1-4 لاتین",
    ],
    "extractedRound": "r342",
}


if __name__ == "__main__":
    main()
