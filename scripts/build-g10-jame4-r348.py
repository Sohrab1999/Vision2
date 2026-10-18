# -*- coding: utf-8 -*-
# r348 — ساختِ هفت بانکِ «آزمون جامع تشریحی درس چهارم» دهم (ص۱۶۴-۱۶۶، کلیدِ چاپیِ ص۲۹۳-۲۹۴)
# الگوی r342 (بانک به ازای خانوادهٔ سکشن) — ۵۹ آیتم برای ۶۰ جایِ کلیدِ چاپی (S9-Q1 دوجای‌خالی)
# کلیدِ زیرخطِ سرخِ دوبخشیِ S10 (دومین عضوِ خانوادهٔ کلیدِ رنگ‌نشانه‌ای بعد از r342-S11)
import json

PATH = "/home/z/my-project/public/jozve/tests-g10.json"

def typed(n, q, ans, ph, cat="vocab"):
    return {"id": f"g10-l{LESSON}-{n}", "n": n, "category": cat, "kind": "typed",
            "question": q, "options": [ans[0]], "answer": 0, "accepted": list(ans), "placeholder": ph}

def mcq(n, q, opts, a, cat="vocab"):
    return {"id": f"g10-l{LESSON}-{n}", "n": n, "category": cat,
            "question": q, "options": opts, "answer": a}

D26 = "-" * 26   # S2
D29 = "-" * 29   # S5 / S6-Q1
D25 = "-" * 25   # S8 / S9
banks = []

# ---------- بانک ۸۹ — S1+S2+S3 (۱۶ تایپی واژگان) ----------
LESSON = 89
q89 = [
    # S1 کلمات ناقص (پرانتزهای عینِ چاپ — سرمه‌ای/سبز در رندر)
    typed(1, "We should become (fam__li__r) with our destination before our trip.", ["familiar"], "complete the missing letters…"),
    typed(2, "You can check this booklet or may see our (w__bs__te).", ["website"], "complete the missing letters…"),
    typed(3, "We can leave our country (s__f__ly) and enjoy our trip.", ["safely"], "complete the missing letters…"),
    typed(4, "Around one (b__lli__n) people live in India.", ["billion"], "complete the missing letters…"),
]
BANK_TAG = "[bank: comfortably / seem / suitably / respect / choice / attractive / cultures / behavior / local]"
S2 = [
    (f"As a tourist, we should be careful about our {D26} in a foreign country.", "behavior"),
    (f"The man kept looking at Ali, but he didn’t {D26} to notice.", "seem"),
    (f"She was born in a small {D26} hospital 30 years ago.", "local"),
    (f"Ancient wind towers of Iran are {D26} for tourists.", "attractive"),
    (f"My little brother wasn’t {D26} dressed for a party.", "suitably"),
    (f"In some {D26} children have an important place.", "cultures"),
    (f"Everyone should {D26} other people’s culture.", "respect"),
    (f"We have enough money to live {D26}.", "comfortably"),
]
for i, (st, k) in enumerate(S2, start=5):
    q89.append(typed(i, f"{st} {BANK_TAG}", [k], "type a word from the bank…"))
S3 = [
    ("A person who travels to a holy place for religious reasons is a p _ _ _ _ _ _.", "pilgrim"),
    ("A person who works in a travel agency is a travel a _ _ _ _.", "agent"),
    ("Iran is a true p _ _ _ _ _ _ _ for people of the world.", "paradise"),
    ("D _ _ _ _ _ _ _ flights are cheaper than international flights.", "Domestic"),
]
for i, (st, k) in enumerate(S3, start=13):
    q89.append(typed(i, st, [k], "type the word (initial letter is given)…"))
banks.append({"lesson": 89, "title": "جامع چهارم — کلمات ناقص، بانک واژه و کلمهٔ مناسب (ص۱۶۴)",
              "level": "تشریحی — تایپی (ناقص/بانک/حرفِ اول)", "count": len(q89), "questions": q89})

# ---------- بانک ۹۰ — S4+S5+S6 (۱۲ چهارگزینه‌ای) ----------
LESSON = 90
q90 = [
    mcq(1, "کدام گزینه با سایر گزینه‌ها متفاوت است؟ (۱) — Asia / Africa / Egypt / Europe",
        ["Asia", "Africa", "Egypt", "Europe"], 2),
    mcq(2, "کدام گزینه با سایر گزینه‌ها متفاوت است؟ (۲) — journey / tourist / trip / travel",
        ["journey", "tourist", "trip", "travel"], 1),
    mcq(3, "کدام گزینه با سایر گزینه‌ها متفاوت است؟ (۳) — late / well / slowly / real",
        ["late", "well", "slowly", "real"], 3),
    mcq(4, "کدام گزینه با سایر گزینه‌ها متفاوت است؟ (۴) — Beijing / Peru / Brazil / Chile",
        ["Beijing", "Peru", "Brazil", "Chile"], 0),
    mcq(5, f"We want to change the {D29} of our city and attract more international tourists.",
        ["embassy", "desert", "point", "image"], 3),
    mcq(6, f"If you want to learn about the {D29} of a country, you can travel there.",
        ["choice", "culture", "souvenir", "vacation"], 1),
    mcq(7, f"I was surprised that nobody checked my {D29} when we arrived in France.",
        ["ceremony", "passport", "respect", "flight"], 1),
    mcq(8, f"The school uses both modern and {D29} ways for teaching grammar.",
        ["traditional", "entertainment", "domestic", "probable"], 0),
    mcq(9, f"Mobile phones are not allowed in this museum. We {D29} take them inside.",
        ["may", "can’t", "should", "must"], 1, "grammar"),
    mcq(10, f"Listen to my advice. You {'-' * 23} do your homework more carefully if you want to be successful.",
        ["should", "must", "may", "can"], 0, "grammar"),
    mcq(11, f"We were sitting {'-' * 20} the floor {'-' * 19} the TV when our father came home.",
        ["at / on", "in / next to", "on/ at", "on / in front of"], 3, "grammar"),
    mcq(12, f"I was born {'-' * 20} ten o’clock {'-' * 20} the morning {'-' * 20} Friday 23th August 1998.",
        ["at / on / in", "in / on / at", "at / in / on", "on / at / in"], 0, "grammar"),
]
banks.append({"lesson": 90, "title": "جامع چهارم — چهارگزینه‌ای واژگان و گرامر (ص۱۶۴-۱۶۵)",
              "level": "تشریحی — چهارگزینه‌ای", "count": len(q90), "questions": q90})

# ---------- بانک ۹۱ — S7+S8+S9 (۱۳ تایپی گرامر) ----------
LESSON = 91
q91 = [
    # S7 جمله‌سازی (الگوی بانک ۸۶ — گزینه‌های انحرافی + پذیرشِ جملهٔ کلید)
    typed(1, "careful / this / be / you / knife / must / with.",
          ["You must be careful with this knife."], "make a sentence with the given words…", "grammar"),
    typed(2, "should / you / you / the ball / when / watch / play / always / tennis.",
          ["You should always watch the ball when you play tennis."], "make a sentence with the given words…", "grammar"),
]
S8 = [
    ("They are waiting patient for the bus.", "patiently", "patient"),
    ("Ali’s father can speaks three foreign languages.", "speak", "speaks"),
    ("Our English teacher speaks English good.", "well", "good"),
    ("I live on a city, but I’d like to live in the country.", "in", "on"),
    ("The police stopped my car in front on the bank.", "of", "on"),
    ("My friend may not comes to see me on Friday.", "come", "comes"),
]
for i, (st, fix, wrong) in enumerate(S8, start=3):
    q91.append(typed(i, f"{st} ({D25})", [fix], "write the correction…", "grammar"))
S9 = [
    (f"Can you {D25} (speak) a little louder? We can’t {D25} (hear) you.", ["speak / hear"],
     "complete both blanks (use / between the two answers)…"),
    (f"Our teacher came {D25} (early) to the class this morning.", ["early"], "type your answer…"),
    (f"Should your brother {D25} (help) you with your lessons?", ["help"], "type your answer…"),
    (f"Some companies pay their workers very {D25} (bad).", ["badly"], "type your answer…"),
    (f"The children asked a lot of questions {D25} (polite).", ["politely"], "type your answer…"),
]
for i, (st, ans, ph) in enumerate(S9, start=9):
    q91.append(typed(i, st, ans, ph, "grammar"))
# گزینه‌های انحرافیِ S7 (الگوی بانک ۸۶: گزینهٔ نخست = جملهٔ کلید)
q91[0]["options"] = [
    "You must be careful with this knife.",
    "You must be this careful with knife.",
    "You must careful be with this knife.",
    "This knife must be careful with you.",
]
q91[1]["options"] = [
    "You should always watch the ball when you play tennis.",
    "You should watch always the ball when you play tennis.",
    "You should always play the ball when you watch tennis.",
    "The ball should always watch you when you play tennis.",
]
banks.append({"lesson": 91, "title": "جامع چهارم — جمله‌سازی، تصحیح خطا و شکل افعال (ص۱۶۵)",
              "level": "تشریحی — تایپی (جمله‌سازی/اصلاح/شکلِ فعل)", "count": len(q91), "questions": q91})

# ---------- بانک ۹۲ — S10 تلفظ (۲ تایپی — کلیدِ زیرخطِ سرخِ دوبخشی) ----------
LESSON = 92
q92 = [
    typed(1, "Which one should I read? The newspaper or the magazine?",
          ["The newspaper / the magazine"],
          "type the words with the stronger stress (use / between the two answers)…", "grammar"),
    typed(2, "Is the Statue of Liberty in New York or Los Angeles?",
          ["New York / Los Angeles"],
          "type the words with the stronger stress (use / between the two answers)…", "grammar"),
]
banks.append({"lesson": 92, "title": "جامع چهارم — تأکید تلفظ (ص۱۶۵)",
              "level": "تشریحی — تایپی (کلیدِ زیرخطِ سرخ)", "count": len(q92), "questions": q92})

# ---------- بانک ۹۳ — S11 مرتبط‌کردن (۴ چهارگزینه‌ای) ----------
LESSON = 93
DEFS = ["like one thing or person better than another", "between different countries",
        "different things of the same kind", "relating to one country"]
q93 = [
    mcq(1, "کلمات را با تعاریف داده شده مرتبط کنید — range", DEFS, 2),
    mcq(2, "کلمات را با تعاریف داده شده مرتبط کنید — domestic", DEFS, 3),
    mcq(3, "کلمات را با تعاریف داده شده مرتبط کنید — international", DEFS, 1),
    mcq(4, "کلمات را با تعاریف داده شده مرتبط کنید — prefer", DEFS, 0),
]
banks.append({"lesson": 93, "title": "جامع چهارم — مرتبط‌کردن کلمات با تعاریف (ص۱۶۶)",
              "level": "تشریحی — وصلِ تعریف", "count": len(q93), "questions": q93})

# ---------- بانک ۹۴ — S12 کلوزِ حروف اضافهٔ زمان (۶ تایپی) ----------
LESSON = 94
SHARED = "(---2---) Thursdays and Fridays, I sleep most of the day and wake up a little before nine (---3---) the evening, usually (---4---) 8:45 or 8:50."
S12 = [
    ("I work (---1---) night on weekends.", "at"),
    (SHARED, "On"),
    (SHARED, "in"),
    (SHARED, "at"),
    ("I watch TV until eleven o’clock, and then start work (---5---) midnight.", "at"),
    ("Early (---6---) the morning, usually around 5:00 A.M., I leave work, have a little snack, go home, go to bed, and sleep late.", "in"),
]
q94 = [typed(i + 1, st, [k], "fill in with a time preposition…", "grammar") for i, (st, k) in enumerate(S12)]
banks.append({"lesson": 94, "title": "جامع چهارم — کلوز حروف اضافهٔ زمان (ص۱۶۶)",
              "level": "تشریحی — تایپی (کلوز)", "count": len(q94), "questions": q94})

# ---------- بانک ۹۵ — S13 درک مطلب (۶ دونگزینه‌ایِ True/False) ----------
LESSON = 95
S13 = [
    ("In the United States: Some young adults share apartments with roommates.", 0),
    ("In the United States: Nearly all young adults live with their parents.", 1),
    ("In the United States: Very few students live in university housing.", 1),
    ("In Hong Kong: Few young people live alone.", 0),
    ("In Hong Kong: Not many university students live with their parents.", 1),
    ("In Hong Kong: Most young married couples have enough money to live in their own apartments.", 1),
]
q95 = []
for i, (st, a) in enumerate(S13, start=1):
    q95.append({"id": f"g10-l{LESSON}-{i}", "n": i, "category": "vocab",
                "question": st, "options": ["True", "False"], "answer": a})
banks.append({"lesson": 95, "title": "جامع چهارم — درک مطلب (ص۱۶۶)",
              "level": "تشریحی — درک مطلب (true/false)", "count": len(q95), "questions": q95})

# ---------- نوشتن ----------
doc = json.load(open(PATH))
assert len(doc["lessons"]) == 88, f"expected 88 banks, got {len(doc['lessons'])}"
existing = {b["lesson"] for b in doc["lessons"]}
for b in banks:
    assert b["lesson"] not in existing, f"lesson {b['lesson']} exists"
doc["lessons"].extend(banks)

total = sum(b["count"] for b in doc["lessons"])
assert total == 1189, f"total {total} != 1189"
ids = [q["id"] for b in doc["lessons"] for q in b["questions"]]
assert len(ids) == len(set(ids)) == 1189, "id collision"

doc["source"]["jame4"] = {
    "exam": "آزمون جامع تشریحی درس چهارم (ص۱۶۴-۱۶۶)",
    "header": "سربرگِ ص۱۶۴ (رندرِ ۱۲۰۰dpi): «\"آزمون جامع تشریحی درس چهارم\"» سرخِ گیومه‌دار روی باندِ سبز + «(پاسخنامه صفحه: ۲۹۳ - ۲۹۴)» — ارقامِ فارسی با دونقطه و تیره (الگوی r347 «۲۹۰»)؛ سربرگِ کلیدِ ص۲۹۳: «\"پاسخنامه آزمون جامع تشریحی درس چهارم\"» سرخِ گیومه‌دار + «(آزمون: صفحه ۱۶۴ تا ۱۶۶)» — فارسی با «تا» (الگوی jame3)؛ لایهٔ «تسی یچ» = هشتمین تحریفِ «تشریحی» (r318/r331/r333/r336/r338/r340/r342؛ رندر: تمیز)؛ ۱۳ سکشن / ۵۹ آیتم برای ۶۰ جایِ کلیدِ چاپی (S9-Q1 دوجای‌خالیِ «speak / hear»)؛ بارمِ چاپی: ۱+۲+۱+۱+۱+۱+۱+۱/۵+۱/۵+۱+۲+۳+۳ = ۲۰ نمره.",
    "keyPages": "293-294",
    "keyVerification": "کلیدِ چاپیِ کاملِ ص۲۹۳-۲۹۴ — ۵۹/۵۹ آیتم برای ۶۰ جایِ کلید با پیش‌پرکردنِ معنایی هم‌رأی — صفر واگرایی؛ S10: کلیدِ چاپی دو جمله را تکرار می‌کند و پاسخ را با زیرخطِ سرخِ دوبخشی نشان می‌دهد (Q1 «The newspaper» + «the magazine» / Q2 «New York» + «Los Angeles» — سؤالِ «کدام کلمات» جمع است و هر دو اسمِ محتوایی زیرخط دارند؛ get_drawings: چهار مستطیلِ سرخِ ۱.۲pt-ارتفاع) — دومین کلیدِ رنگ‌نشانه‌ایِ این خانواده بعد از r342-S11؛ S8: واژهٔ غلطِ سرخِ زیرخط‌دار درونِ جمله + اصلاحِ سرخِ پرانتزی («(patiently)»...)؛ S9 سطرِ ۱ = «speak / hear»؛ S12-Q2 با «On» سرکوته (تنها کلیدِ سرکوته‌دارِ سکشن)؛ S1 جدولِ ۲×۲ با شماره‌های سرخ؛ S4 واژه‌ایِ ساده (Egypt/tourist/real/Beijing)؛ S13 شش true/false.",
    "extractedRound": "r348",
    "pattern": "r342/r336 — بانک به ازای خانوادهٔ سکشن: تایپیِ ناقص/بانک/حرفِ اول ۱۶ + چهارگزینه‌ایِ ۱۲ + جمله‌سازی/تصحیحِ خطا/شکلِ افعال ۱۳ + تأکیدِ تلفظ ۲ (زیرخطِ سرخِ دوبخشی) + وصلِ تعریف ۴ + کلوزِ حروفِ اضافهٔ زمان ۶ + درکِ مطلب ۶",
    "printQuirks": [
        "S6-Q4 «Friday 23th August 1998» — چاپ‌غلطِ ترتیبی (باید 23rd باشد) عینِ چاپ حفظ شد",
        "S6-Q3 گزینهٔ «c. on/ at» بدونِ فاصله پس از اسلش — ناسازگاریِ فاصله‌گذاریِ خودِ چاپ (a/b/d با « / » استاندارد)",
        "S2 این بار واژهٔ اضافهٔ واقعی دارد: ۹ واژه / ۸ جای‌خالی و «choice» بیرون می‌ماند — برخلافِ jame3 که دستورِ «یک کلمه اضافه» داشت اما ۸/۸ بود",
        "S7-Q2 گروهِ کلمات «you» را دوبار دارد («should / you / you / the ball / ...» — ۹ واژه برای ۸ واژهٔ جملهٔ کلید) — عینِ چاپ",
        "کلیدِ S10 زیرخطِ سرخِ دوبخشی — هر دو عبارتِ اسمی (نه یکی) — دومین کلیدِ رنگ‌نشانه‌ایِ خانواده",
        "کلیدِ S8 واژهٔ غلطِ سرخِ زیرخط‌دار درونِ جمله + اصلاحِ سرخِ پرانتزی — غنی‌تر از الگوی r347 (فقط پرانتز)",
        "کلیدِ S9 سطرِ ۱ دوجای‌خالیِ «speak / hear» — ۵۹ آیتم برای ۶۰ جایِ کلید",
        "کلیدِ S12-Q2 «On» سرکوته — یگانه سرکوته در شش کلیدِ حروفِ اضافه",
        "سربرگِ آزمون «(پاسخنامه صفحه: ۲۹۳ - ۲۹۴)» با دونقطه و تیره؛ سربرگِ کلید «(آزمون: صفحه ۱۶۴ تا ۱۶۶)» با «تا» — دوگانگیِ آدرس‌دهیِ چاپ (الگوی r346/r347)",
        "دستورهای بخش با ارقامِ فارسیِ «(۱ نمره)/(۲ نمره)/(۱/۵ نمره)/(۳ نمره)» — بارمِ کسری با اسلشِ فارسیِ ۱/۵",
        "پاسخ‌نوارهٔ S12: شش پرانتزِ ۸تیره‌ای در یک سطر («1. (--------) 2. (--------) ...»)",
        "جاهای خالیِ سبزِ خط‌چین (S2/S5/S6/S7/S8/S9) + underscoreهای سبزِ S3 + واژه‌های ناقصِ سرمه‌ایِ S1 + گزینه‌های ایتالیکِ سرمه‌ای در چیپ‌های زرد (S4/S5/S6)",
        "S13 برچسبِ چاپیِ «(true or false)» پس از هر جمله — به الگوی بانکِ ۲۴ حذف شد (options=[True,False] نمایندهٔ آن است) و پیشوندِ کشور («In the United States:»/«In Hong Kong:») برای استنادِ صحیح به متن اضافه شد",
        "جعبهٔ «Note:» خالیِ پایانِ کلیدِ ص۲۹۴ با خط‌چین‌های بنفشِ ۷۰۳۰a0 — عضوِ خانوادهٔ r346/r347",
        "دستورِ S1 لایهٔ «امالب» = تجزیهٔ «املایی» (رندر: «از لحاظ املایی کامل کنید») — دستورِ S2 لایهٔ «اضاقن یم باشد» = «اضافی می باشد»",
        "لایهٔ سربرگِ کلید «1۶4 تا1۶۶» = ترکیبِ لاتین/فارسیِ تجزیه‌شده — رندر: همه فارسی «۱۶۴ تا ۱۶۶»",
    ],
}

json.dump(doc, open(PATH, "w"), ensure_ascii=False, indent=2)
print("OK — banks:", len(doc["lessons"]), "items:", total)
for b in banks:
    print(f"  B{b['lesson']}: {b['count']:2d} — {b['title']}")
