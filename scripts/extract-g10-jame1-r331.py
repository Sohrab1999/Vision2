# -*- coding: utf-8 -*-
# r331 — استخراجِ «آزمون جامع تشریحی درس اول» جزوهٔ دهم (ص۶۸-۷۱، کلید ص۲۵۲-۲۵۳)
# به public/jozve/tests-g10.json — هفت بانکِ جدید (lessons 18-24): ۶۷ آیتم
#   L18 کلمات ناقص+بانک واژه+تعریف‌ها (۱۶ تایپی) | L19 چهارگزینه‌ای واژگان/گرامر (۱۲)
#   L20 جمله‌سازی+سؤال‌سازی (۶ تایپی) | L21 تصویر+شکل افعال (۷ تایپی)
#   L22 آهنگ افتان+دسته‌بندی (۱۴ MCQ) | L23 کلوز استرالیا (۶) | L24 درک مطلب دلفین (۶: ۴ T/F + ۲ تایپی)
# کلید چاپی: 67/67 هم‌رأی با پیش‌پرکردنِ معنایی — صفر واگرایی.
# داوری‌ها: سربرگ «تشریحی» (رندر ۲۴۰۰-۳۶۰۰dpi حاکم بر لایهٔ «تسی یچ»)؛ z+۸ خط‌تیره = zookeeper؛
# زیرخط‌های S8: tomorrow/They/play football/will visit Qom؛ S13 ردیف‌های بولدِ ناهماهنگ.
# Idempotent: اجرای دوم NO-OP (مبنا = ۱۷ بانکِ r323-r330 / ۳۳۱ آیتم).
import json
from pathlib import Path

PATH = Path("public/jozve/tests-g10.json")

BANK_WORDS = "increasing / divided / killed / hunt / protecting / take care / hurt / injured / save"

# ——— L18: S1 (کلمات ناقص) + S2 (بانک واژه) + S3 (تعریف با حرف اول) — ۱۶ تایپی
# (ساقه، accepted، گزینه‌های بازبینی، placeholder، بانک‌واژه؟)
L18 = [
    ("Mr. Azadi works in a m__s__um.", ["museum"],
     ["museum", "destroying", "endangered", "attention"], "complete the missing letters…", False),
    ("They are d__stro__ing the jungle.", ["destroying"],
     ["destroying", "museum", "endangered", "attention"], "complete the missing letters…", False),
    ("Today, there are some end__nge__ed animals on Earth.", ["endangered"],
     ["endangered", "museum", "destroying", "attention"], "complete the missing letters…", False),
    ("All humans must pay at__en__ion to wildlife.", ["attention"],
     ["attention", "museum", "destroying", "endangered"], "complete the missing letters…", False),
    ("My friend had an accident last night. He was --------------- badly.", ["injured"],
     ["injured", "hurt", "killed", "save"], "fill in the blank with a bank word…", True),
    ("My little brother --------------- his hand when he was playing with a hammer.", ["hurt"],
     ["hurt", "injured", "hunt", "save"], "fill in the blank with a bank word…", True),
    ("The hunters --------------- the leopard and destroyed its home.", ["killed"],
     ["killed", "hurt", "divided", "hunt"], "fill in the blank with a bank word…", True),
    ("What are you going to do to --------------- nature?", ["save"],
     ["save", "take care", "protecting", "hunt"], "fill in the blank with a bank word…", True),
    ("We --------------- the work between us.", ["divided"],
     ["divided", "increasing", "killed", "take care"], "fill in the blank with a bank word…", True),
    ("We need to save animals and plants and --------------- of them.", ["take care"],
     ["take care", "save", "hunt", "injured"], "fill in the blank with a bank word…", True),
    ("The number of women who go to work is ---------------.", ["increasing"],
     ["increasing", "divided", "hurt", "save"], "fill in the blank with a bank word…", True),
    ("We mustn’t let the people --------------- the birds and other animals.", ["hunt"],
     ["hunt", "killed", "hurt", "take care"], "fill in the blank with a bank word…", True),
    ("It’s a wild animal of the Asian cat family. It’s a t _ _ _ _ .", ["tiger"],
     ["tiger", "zookeeper", "future", "died"], "type the word (first letter is given)…", False),
    ("A person who works in a zoo, taking care of the animals is a z _ _ _ _ _ _ _ _ .", ["zookeeper"],
     ["zookeeper", "tiger", "future", "died"], "type the word (first letter is given)…", False),
    ("Everyone needs to plan for the f _ _ _ _ _ .", ["future"],
     ["future", "tiger", "zookeeper", "died"], "type the word (first letter is given)…", False),
    ("Dinosaurs d _ _ _ out millions of years ago.", ["died"],
     ["died", "tiger", "zookeeper", "future"], "type the word (first letter is given)…", False),
]

# ——— L19: S4 (متفاوت) + S5 + S6 (چهارگزینه‌ای) — ۱۲ MCQ
L19 = [
    ("کدام گزینه با سایر گزینه‌ها متفاوت است؟ — duck / lion / wolf / leopard",
     ["duck", "lion", "wolf", "leopard"], 0),
    ("کدام گزینه با سایر گزینه‌ها متفاوت است؟ — save / protect / hurt / take care of",
     ["save", "protect", "hurt", "take care of"], 2),
    ("کدام گزینه با سایر گزینه‌ها متفاوت است؟ — school / college / road / university",
     ["school", "college", "road", "university"], 2),
    ("کدام گزینه با سایر گزینه‌ها متفاوت است؟ — farmer / danger / teacher / hunter",
     ["farmer", "danger", "teacher", "hunter"], 1),
    ("Firefighters soon --------------- the fire out.",
     ["take", "put", "turn", "make"], 1),
    ("I really like to be a --------------- because I enjoy visiting different places in the world.",
     ["hunter", "pilot", "tourist", "zookeeper"], 2),
    ("This is a --------------- mountain, but those mountains are low.",
     ["high", "long", "short", "thin"], 0),
    ("Humans cut down trees and destroy lakes. They make homes and roads ---------------.",
     ["natural", "instead", "forest", "future"], 1),
    ("A: Let’s have a party?  B: That’s a great idea. We --------------- invite lots of people.",
     ["are going to", "will to", "are going", "will"], 3),
    ("I think I --------------- be sick because I feel terrible now.",
     ["go to", "will", "am going to", "going to"], 2),
    ("I think Sarah --------------- like the present we bought for her.",
     ["will", "is going to", "goes to like", "will be"], 0),
    ("A: Why are you turning on the television?  B: I --------------- watch the news.",
     ["was going to", "wanted to", "will", "am going to"], 3),
]

# ——— L20: S7 (جمله‌سازی) + S8 (سؤال‌سازی با زیرخط) — ۶ تایپی
L20 = [
    ("tonight / I / late / will / home / be / probably.", ["I will probably be home late tonight."],
     ["I will probably be home late tonight.", "I will be home late probably tonight.",
      "Tonight probably I will be home late.", "I will late home be probably tonight."],
     "make a sentence with the given words…"),
    ("are / travel / week / we / to / next / going / by train.", ["We are going to travel by train next week."],
     ["We are going to travel by train next week.", "We are going to travel next week by the train.",
      "We go to travel by train next week.", "Next week we are traveling by train."],
     "make a sentence with the given words…"),
    ("My father is going to buy a new car tomorrow. (underlined: tomorrow)",
     ["When is your father going to buy a new car?"],
     ["When is your father going to buy a new car?", "What is your father going to buy tomorrow?",
      "Where is your father going to buy a new car?", "Who is going to buy a new car tomorrow?"],
     "make a question about the underlined phrase…"),
    ("They will go to a restaurant tonight. (underlined: They)",
     ["Who will go to a restaurant tonight?"],
     ["Who will go to a restaurant tonight?", "What will they do tonight?",
      "Where will they go tonight?", "When will they go to a restaurant?"],
     "make a question about the underlined phrase…"),
    ("The children are going to play football next week. (underlined: play football)",
     ["What are the children going to do next week?"],
     ["What are the children going to do next week?", "Who is going to play football next week?",
      "When are the children going to play football?", "What do the children play next week?"],
     "make a question about the underlined phrase…"),
    ("The students will visit Qom next summer. (underlined: will visit Qom)",
     ["Where will the students visit next summer?"],
     ["Where will the students visit next summer?", "Who will visit Qom next summer?",
      "When will the students visit Qom?", "What will the students do next summer?"],
     "make a question about the underlined phrase…"),
]

# ——— L21: S9 (پاسخ با تصویر) + S10 (شکل صحیح فعل) — ۷ تایپی
L21 = [
    ("( help / injured ) — What is he going to do?", ["He is going to help the injured bird."],
     ["He is going to help the injured bird.", "He is going to hurt the bird.",
      "He is helping the injured cheetah.", "He was going to help the bird."],
     "answer using the picture cues…"),
    ("( put out / fire ) — What are they doing?", ["They are putting out the fire."],
     ["They are putting out the fire.", "They are putting the fire out of home.",
      "They put out fires yesterday.", "They are going to fire the put."],
     "answer using the picture cues…"),
    ("( take care of / cheetah ) — What must we do?", ["We must take care of cheetahs.", "You must take care of cheetahs."],
     ["We (You) must take care of cheetahs.", "We must take care of the injured bird.",
      "They must put out the cheetahs.", "We must hunt the cheetahs."],
     "answer using the picture cues…"),
    ("People need more places for living when their number --------------- (increase).", ["increases"],
     ["increases", "increasing", "to increase", "increased"],
     "write the correct form of the verb…"),
    ("Look at those black clouds. It is going --------------- (rain).", ["to rain"],
     ["to rain", "rains", "raining", "rain"],
     "write the correct form of the verb…"),
    ("Where will they --------------- (visit) next year?", ["visit"],
     ["visit", "to visit", "visiting", "will visit"],
     "write the correct form of the verb…"),
    ("There’s no need to take an umbrella with you. It won’t --------------- (rain).", ["rain"],
     ["rain", "to rain", "rains", "raining"],
     "write the correct form of the verb…"),
]

# ——— L22: S11 (آهنگ افتان — بازسازی per-sentence) + S12 (دسته‌بندی) — ۱۴ MCQ
L22 = [
    ("آهنگ کدام جمله افتان است؟ (۱) — What are you going to do to save nature?",
     ["falling", "rising"], 0),
    ("آهنگ کدام جمله افتان است؟ (۲) — Are there lots of beautiful zebras living in this plain?",
     ["falling", "rising"], 1),
    ("آهنگ کدام جمله افتان است؟ (۳) — Students are interested in protecting nature.",
     ["falling", "rising"], 0),
    ("آهنگ کدام جمله افتان است؟ (۴) — Will they go to the mountain?",
     ["falling", "rising"], 1),
    ("اسامی داده شده را در ستون مناسب بنویسید — pain", ["person", "animal", "place", "thing", "idea"], 4),
    ("اسامی داده شده را در ستون مناسب بنویسید — goat", ["person", "animal", "place", "thing", "idea"], 1),
    ("اسامی داده شده را در ستون مناسب بنویسید — street", ["person", "animal", "place", "thing", "idea"], 2),
    ("اسامی داده شده را در ستون مناسب بنویسید — orange", ["person", "animal", "place", "thing", "idea"], 3),
    ("اسامی داده شده را در ستون مناسب بنویسید — attention", ["person", "animal", "place", "thing", "idea"], 4),
    ("اسامی داده شده را در ستون مناسب بنویسید — human", ["person", "animal", "place", "thing", "idea"], 0),
    ("اسامی داده شده را در ستون مناسب بنویسید — lake", ["person", "animal", "place", "thing", "idea"], 2),
    ("اسامی داده شده را در ستون مناسب بنویسید — aunt", ["person", "animal", "place", "thing", "idea"], 0),
    ("اسامی داده شده را در ستون مناسب بنویسید — ant", ["person", "animal", "place", "thing", "idea"], 1),
    ("اسامی داده شده را در ستون مناسب بنویسید — desk", ["person", "animal", "place", "thing", "idea"], 3),
]

# ——— L23: S13 کلوز استرالیا — ۶ MCQ (ساقه = جملهٔ بافت‌دارِ حاوی بلنک شماره‌دار)
L23 = [
    ("Australia is a country and is the sixth biggest country in the ---(1)---.",
     ["plain", "wildlife", "world", "nature"], 2),
    ("Australia is ---(2)--- to many animals that can be found nowhere else on Earth.",
     ["home", "land", "place", "plain"], 0),
    ("People first ---(3)--- in Australia more than 50000 years ago or even earlier.",
     ["left", "arrived", "took", "paid"], 1),
    ("For the first few years they didn’t have much ---(4)---, and life was very hard.",
     ["idea", "food", "thing", "pain"], 1),
    ("They lived by ---(5)--- and fishing.",
     ["increasing", "reading", "falling", "hunting"], 3),
    ("Australia is a very big country, but much of the ---(6)--- is very dry.",
     ["forest", "danger", "land", "pattern"], 2),
]

# ——— L24: S14 درک مطلب دلفین — ۴ True/False + ۲ تایپی
L24_TF = [
    ("A few dolphins live in salt water oceans.", 1),
    ("A dolphin is a mammal.", 0),
    ("Dolphins never fight off sharks.", 1),
    ("A dolphin has a hard skin.", 1),
]
L24_TYPED = [
    ("Where is a dolphin’s nose?", ["A dolphin’s nose is on top of his head."],
     ["A dolphin’s nose is on top of his head.", "A dolphin’s nose is on his back.",
      "A dolphin’s nose is under the water.", "A dolphin has no nose."],
     "answer the question about the reading…"),
    ("Are they among clever animals?", ["Yes, they are among clever animals."],
     ["Yes, they are among clever animals.", "No, they are not clever animals.",
      "Yes, they are among sea hunters.", "No, dolphins are fish."],
     "answer the question about the reading…"),
]

PRINT_QUIRKS = [
    "عنوان چاپی «آزمون جامع تشریحی درس اول» — رندرِ ۲۴۰۰-۳۶۰۰dpi روی ص۶۸ و ص۲۵۲ حاکم: «تشریحی» (لایه «تسی یچ» scramblingِ OCR)؛ آزمون با وجود عنوان «تشریحی» بخش‌های چهارگزینه‌ای هم دارد — جامعِ ترکیبی؛ سربرگِ آزمون و سربرگِ کلید هر دو «تشریحی»",
    "بخش۱-۲: «d__stro__ing» با ing نمایان (y و e حذف) — عین چاپ؛ «m__s__um»/«end__nge__ed»/«at__en__ion» خط‌تیره‌های تزئینیِ چاپ؛ کلیدها مستقل از شمارش خط‌تیره",
    "بخش۲: بانکِ ۹ کلمه‌ای با «protecting» اضافه (کلید هر ۸ بقیه را مصرف می‌کند)؛ سؤال ۴ «What are you going to do to --- nature?» یک بلنک (لایه دو توکن خط‌چین = یک بلنک)",
    "بخش۳: «z _ _ _ _ _ _ _ _» هشت خط‌تیره (۳۰۰۰dpi) = zookeeper نُه‌حرفی — هم‌خوان با کلید؛ «t _ _ _ _»/«f _ _ _ _ _»/«d _ _ _» نیز هم‌خوان",
    "بخش۵-۴: کلید «instead» — قرینهٔ destroy/make (در عوض خانه و جاده می‌سازند)؛ کلید چاپ حاکم",
    "بخش۶-۱: turn A «Let’s have a party?» با علامت سؤال (عین چاپ)؛ کلید will (تصمیمِ لحظهٔ گفتگو) — هم‌خوان با pedagogy درس",
    "بخش۷: فهرست کلمات با نقطهٔ پایانی («probably.» / «by train.») — عین چاپ (کوئیرکِ r329)",
    "بخش۸: زیرخط‌ها با رندر ۱۶۰۰dpi: «tomorrow» (Q1→When)، «They» (Q2→Who)، «play football» (Q3→What)، «will visit Qom» (Q4→Where) — هر چهار با کلید چاپ هم‌خوان",
    "بخش۹: جفت‌سازیِ نشانه‌ها با تصاویر به ترتیب ۱-۲-۳ (پرندهٔ زخمی در دستان/آتش‌نشانان/یوزپلنگ)؛ کلیدِ سوم «We (You) must take care of cheetahs.» با پرانتزِ مشترک — accepted دو واریانت We/You",
    "بخش۱۰-۲: «It is going --- (rain).» کلید «to rain» — پرانتزِ فعلِ پایه چاپ؛ «won’t --- (rain)» کلید «rain»",
    "بخش۱۱: سربرگ «آهنگ کدام جمله افتان است؟» مفرد ولی کلیدِ چاپ دو جمله را می‌دهد (۱ و ۳)؛ مدل‌سازیِ per-sentence با گزینه‌های falling/rising (برچسب چاپی بخش «( falling intonation )») — «rising» چاپ نیست، مقابلِ مفهومیِ درس؛ مستند در رسید",
    "بخش۱۲: جدول ۵ ستونه (person/animal/place/thing/idea) با ۲ ردیف خالی = ۱۰ اسلات برای ۱۰ واژه — مدل‌سازی per-word با پنج گزینهٔ سرستونِ چاپی",
    "بخش۱۳: جدول گزینه‌ها — ردیف‌های ۲/۴/۶ بولد و ۱/۳/۵ معمولی (بولدِ ناهماهنگِ چاپ — نه نشانهٔ کلید، کلِ ردیف بولد است)؛ «50000» بدون کاما؛ «else  on Earth.» دو فاصله — عین چاپ",
    "بخش۱۴-۱: «A few dolphins live in salt water oceans» کلید false در حالی که متن «Most live in salt water oceans» می‌گوید (most منطقاً few را نفی نمی‌کند) — کلید چاپ حاکم، عین چاپ",
    "کلیدِ بخش۱۴-۶ «Yes, they are among clever animals .» با فاصلهٔ پیش از نقطه (عین چاپ)؛ accepted شکل تمیز",
    "پایان ص۷۱: کانال تلگرام «@PracticalEnglishInKonkour»؛ پاسخنامه ص۲۵۳ با «Note:» و سطرهای خط‌دارِ خالی — خارج از محتوا",
]

RECEIPT = {
    "exam": "آزمون جامع تشریحی درس اول (آزمون: ص۶۸ تا ۷۱)",
    "header": "«آزمون جامع تشریحی درس اول» (پاسخنامه صفحه: ۲۵۲ و ۲۵۳) — ۱۴ بخش: ۱ کلمات ناقص (۴) + ۲ بانک واژه (۸) + ۳ تعریف با حرف اول (۴) + ۴ متفاوت (۴) + ۵ و ۶ چهارگزینه‌ای (۸) + ۷ جمله‌سازی (۲) + ۸ سؤال‌سازی با زیرخط (۴) + ۹ پاسخ با تصویر (۳) + ۱۰ شکل افعال (۴) + ۱۱ آهنگ افتان (۴) + ۱۲ دسته‌بندی ستونی (۱۰) + ۱۳ کلوز استرالیا (۶) + ۱۴ درک مطلب دلفین (۶) = ۶۷ آیتم در ۷ بانک",
    "keyPages": "252-253",
    "keyVerification": "print key pp252-253 «پاسخنامه آزمون جامع تشریحی درس اول (آزمون: صفحه ۶۸ تا ۷۱)» — 67/67 agree with semantic pre-fill (S1-S3 واژه‌ای، S4-S6/S11-S13/S14-TF اندیسی، S7-S10/S14-Q5-6 جمله‌ای), zero divergence",
    "extractedRound": "r331",
    "pattern": "r311/r323 (بانک تایپی درس‌محور) + r329 (options[0]=کلید چاپ برای بازبینی + placeholder) + r318 (سربرگِ رندر حاکم) + r303 (پروتکل git status)",
    "transformations": "S11 بازسازیِ per-sentence (کلید دوتاییِ چاپ ۱ و ۳ → چهار آیتم falling/rising)؛ S12 بازسازیِ per-word (جدول ستونی → ده آیتم با گزینه‌های سرستون)؛ S14 ترکیب ۴ True/False با گزینه‌های چاپی (True or False) و ۲ تایپی — بانکِ مختلط با kind per-item؛ S13 ساقه = جملهٔ بافت‌دارِ حاوی بلنکِ شماره‌دار (--(N)--) به‌جای تکرارِ متنِ کامل",
    "printQuirks": PRINT_QUIRKS,
}

data = json.loads(PATH.read_text(encoding="utf-8"))

existing = [l for l in data["lessons"] if l["lesson"] == 18]
if existing:
    print(f"lesson 18 already present ({existing[0]['count']} items) — NO-OP")
else:
    assert len(data["lessons"]) == 17, f"baseline mismatch: {len(data['lessons'])} banks"
    assert sum(l["count"] for l in data["lessons"]) == 331, "baseline item count mismatch"

    def typed_q(lesson, i, stem, acc, opts, ph, bank=False):
        q = {
            "id": f"g10-l{lesson}-{i + 1}", "n": i + 1, "category": "vocab",
            "kind": "typed",
            "question": (stem + f" [bank: {BANK_WORDS}]") if bank else stem,
            "options": opts, "answer": 0, "accepted": acc, "placeholder": ph,
        }
        return q

    def mcq_q(lesson, i, stem, opts, key, cat="vocab"):
        return {"id": f"g10-l{lesson}-{i + 1}", "n": i + 1, "category": cat,
                "question": stem, "options": opts, "answer": key}

    # L18 — ۱۶ تایپی (S1+S3 vocab؛ S2 با بانک)
    q18 = []
    for i, (stem, acc, opts, ph, bank) in enumerate(L18):
        q18.append(typed_q(18, i, stem, acc, opts, ph, bank))
    # L19 — ۱۲ MCQ (S4+S5 vocab؛ S6 grammar)
    q19 = [mcq_q(19, i, s, o, k, "vocab" if i < 8 else "grammar") for i, (s, o, k) in enumerate(L19)]
    # L20 — ۶ تایپی grammar
    q20 = []
    for i, (stem, acc, opts, ph) in enumerate(L20):
        q = typed_q(20, i, stem, acc, opts, ph)
        q["category"] = "grammar"
        q20.append(q)
    # L21 — ۷ تایپی (S9 vocab-گرامری، S10 grammar)
    q21 = []
    for i, (stem, acc, opts, ph) in enumerate(L21):
        q = typed_q(21, i, stem, acc, opts, ph)
        q["category"] = "grammar" if i >= 3 else "vocab"
        q21.append(q)
    # L22 — ۱۴ MCQ (S11 grammar، S12 vocab)
    q22 = [mcq_q(22, i, s, o, k, "grammar" if i < 4 else "vocab") for i, (s, o, k) in enumerate(L22)]
    # L23 — ۶ MCQ vocab
    q23 = [mcq_q(23, i, s, o, k) for i, (s, o, k) in enumerate(L23)]
    # L24 — ۴ MCQ + ۲ تایپی
    q24 = []
    for i, (stem, key) in enumerate(L24_TF):
        q24.append(mcq_q(24, i, stem, ["True", "False"], key))
    for j, (stem, acc, opts, ph) in enumerate(L24_TYPED):
        q = typed_q(24, len(L24_TF) + j, stem, acc, opts, ph)
        q24.append(q)

    banks = [
        {"lesson": 18, "title": "کلمات ناقص، بانک واژه و تعریف‌ها (ص۶۸)", "level": "تشریحی — تایپی", "count": len(q18), "questions": q18},
        {"lesson": 19, "title": "چهارگزینه‌ای واژگان و گرامر (ص۶۸-۶۹)", "level": "تشریحی — چهارگزینه‌ای", "count": len(q19), "questions": q19},
        {"lesson": 20, "title": "جمله‌سازی و سؤال‌سازی با زیرخط (ص۶۹)", "level": "تشریحی — تایپی", "count": len(q20), "questions": q20},
        {"lesson": 21, "title": "پاسخ با تصویر و شکل افعال (ص۷۰)", "level": "تشریحی — تایپی", "count": len(q21), "questions": q21},
        {"lesson": 22, "title": "آهنگ افتان و دسته‌بندی واژگان (ص۷۰)", "level": "تشریحی — چهارگزینه‌ای", "count": len(q22), "questions": q22},
        {"lesson": 23, "title": "کلوز — استرالیا (ص۷۱)", "level": "تشریحی — چهارگزینه‌ای", "count": len(q23), "questions": q23},
        {"lesson": 24, "title": "درک مطلب — دلفین (ص۷۱)", "level": "تشریحی — درست/نادرست و تایپی", "count": len(q24), "questions": q24},
    ]
    total_new = sum(b["count"] for b in banks)
    assert total_new == 67, f"item count mismatch: {total_new}"
    data["lessons"].extend(banks)
    data["source"]["jame1"] = RECEIPT
    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = sum(l["count"] for l in data["lessons"])
    print(f"added lessons 18-24: {total_new} items → banks={len(data['lessons'])}, total={total}")
