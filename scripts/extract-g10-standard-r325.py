# -*- coding: utf-8 -*-
# r325 — استخراجِ «تست واژگان درس اول — بخش دوم، سطح استاندارد» جزوهٔ دهم (ص۵۴-۵۵)
# به public/jozve/tests-g10.json — بانک ششم (۴۰ MCQ) + ترجمه‌های چاپیِ «ترجمه تست»
# کلید: ص۲۴۵-۲۴۷ «پاسخنامه تستی تستهای واژگان — درس اول، سطح تستها استاندارد» (۴۰/۴۰ هم‌رأی — صفر واگرایی).
# الگو: r324 (ترجمهٔ چاپ‌محور) + r311/r323 (بانک درس‌محور) + r320/r321 (عینِ چاپ با کوئیرکِ مستند).
# زوم‌های ۲۶۰۰-۸۰۰۰dpi برای نقاط سرنوشت‌ساز: تاریــخ/واکسنهایی/کرونایی/مرضی/انقراض/خوبی/بلا بیرم/
# از خود از خودش/میز پشتی/را دوبل/به طور با دقت/گرفته اند/از بین برده.
# Idempotent: اجرای دوم NO-OP (مبنا = ۵ بانکِ r323/r324).
import json
from pathlib import Path

PATH = Path("public/jozve/tests-g10.json")

# (ساقه، گزینه‌ها، کلیدِ حرفیِ چاپ، ترجمهٔ چاپی) — رونویسیِ رندرِ ۳۰۰dpi + داوریِ ۱۴۰۰-۸۰۰۰dpi
ITEMS = [
    ("The accident seemed to have completely --------------- his confidence.",
     ["built", "destroyed", "stayed", "considered"], "b",
     "به نظر میرسید که تصادف به طور کامل اعتماد به نفس او را از بین برده بود."),
    ("---------------, we’ll be able to rearrange the dates of our holiday.",
     ["Hopefully", "Usually", "Really", "Angrily"], "a",
     "اگر بشود، ما می توانیم دوباره تاریخ های تعطیلاتمان را بچینیم."),
    ("He picked up a piece of --------------- and wrote the answer on the blackboard.",
     ["pattern", "air", "chalk", "graph"], "c",
     "یک تکه گچ برداشت و جواب را روی تخته نوشت."),
    ("The vaccines such as “COViran Barekat” are known to prevent a COVID infection from resulting in --------------- illness or death.",
     ["singular", "simple", "serious", "special"], "c",
     "واکسنهایی مثل \"کوایران برکت\" شناخته شده اند که از آلودگی کرونایی که منجر به مرضی جدی یا مرگ میشود، جلوگیری کنند."),
    ("Since retiring from the company, she has done --------------- work for a charity.",
     ["natural", "voluntary", "plural", "recent"], "b",
     "از وقتی از شرکت بازنشسته شده، کارهای داوطلبانه برای خیریه کرده است."),
    ("The --------------- will be closed and go under if a generous donor isn’t found within the next few months.",
     ["charity", "plant", "world", "weather"], "a",
     "خیریه بسته و ورشکسته خواهد شد اگر یک اهدا کننده بخشنده در ماه های بعد پیدا نشود."),
    ("At the end of the lecture, I’d like all the students to --------------- small discussion groups.",
     ["put out", "divide into", "check out", "take off"], "b",
     "در پایان سخنرانی، دوست دارم دانش آموزان به گروه های مکالمه کوچک تقسیم بشوند."),
    ("If everything goes according to ---------------, work will be complete in December.",
     ["phrase", "schedule", "forest", "intonation"], "b",
     "اگر همه چیز طبق برنامه پیش برود، کار تا دسامبر تمام خواهد شد."),
    ("All you have to do to win is --------------- the words here to find four names of birds.",
     ["considering", "unscrambling", "cleaning", "beginning"], "b",
     "تنها کاری که باید برای بردن بکنید این است که کلمات اینجا را مرتب کنید تا چهار اسم پرنده پیدا کنید."),
    ("We’re not doing enough to --------------- the environment from pollution.",
     ["protect", "break", "donate", "interview"], "a",
     "ما به اندازه کافی تلاش نمی کنیم که محیط زیست را از آلودگی حفظ کنیم."),
    ("The working life of most vehicles can be increased if they are serviced ---------------.",
     ["recently", "carelessly", "originally", "regularly"], "d",
     "مدت زمان کار کردن اکثر وسایل نقلیه میتواند افزایش پیدا کند اگر به طور منظم سرویس شوند."),
    ("Even the smallest baby can --------------- its mother by her voice.",
     ["imagine", "decrease", "identify", "save"], "c",
     "حتی کوچک ترین بچه ها میتوانند که مادرشان را از صدایش تشخیص بدهند."),
    ("I didn’t feel that this was an --------------- time to mention the subject of money.",
     ["different", "appropriate", "excellent", "generous"], "b",
     "اینطور فکر کردم که زمان مناسبی برای اشاره کردن به موضوع پول نبود."),
    ("--------------- animals and plants need to be kept secure from poachers.",
     ["International", "Endangered", "possible", "cultural"], "b",
     "حیوانات و گیاهان در معرض خطر انقراض نیاز دارند که در مقابل شکارچیان حفاظت شوند."),
    ("---------------, the construction will be finished before school reopens in September. The students will feel great about this.",
     ["Naturally", "Hopefully", "Carefully", "Hardly"], "b",
     "اگر بشود، کار ساخت و ساز قبل از این که مدارس دوباره در سپتامبر باز بشوند تمام خواهد شد. دانش آموزان خیلی احساس خوبی در این باره خواهند داشت."),
    ("What a --------------- sight it was to see so many beautiful boats on the lake at the same time.",
     ["simple", "irregular", "religious", "wonderful"], "d",
     "دیدن قایق های زیبای زیادی روی دریاچه به طور همزمان چه صحنه فوق العاده ای بود."),
    ("The management was forced to --------------- salaries for many of the workers.",
     ["introduce", "sneeze", "increase", "suggest"], "c",
     "مدیریت مجبور شد که حقوق ها را برای کارگران زیادی افزایش دهد."),
    ("It is important to separate learning English --------------- from learning English by reading books.",
     ["slowly", "orally", "averagely", "quickly"], "b",
     "مهم است که یاد گرفتن انگلیسی به طور شفاهی را از یادگیری انگلیسی به وسیله خواندن کتاب را از هم جدا کنیم."),
    ("The role of scientists is to observe and --------------- the world, not to try to control it.",
     ["describe", "leave", "decide", "account"], "a",
     "نقش دانشمندان مشاهده و توصیف کردن جهان است، نه سعی کردن برای کنترل آن."),
    ("The leader --------------- them that they should leave the country immediately.",
     ["interested", "advised", "hired", "attended"], "b",
     "رهبر به آن ها توصیه کرد که به سرعت کشور را ترک کنند."),
    ("There was an --------------- article about vegetarianism in the newspaper yesterday.",
     ["plural", "selfish", "interesting", "polite"], "c",
     "یک مقاله جالب درباره گیاه خواری در روزنامه دیروز بود."),
    ("In the past eight years, the elephant --------------- in Africa has been halved.",
     ["population", "facilities", "attention", "wonders"], "a",
     "در هشت سال گذشته، جمعیت فیل ها در آفریقا نصف شده است."),
    ("While I was in the crowd, I had to --------------- my voice to make myself heard over the noise.",
     ["divide", "keep", "put", "raise"], "d",
     "وقتی توی شلوغی بودم، مجبور شدم صدایم رو بلا بیرم تا صدایم شنیده بشود."),
    ("A self-protecting system will defend itself from --------------- damages and external attacks.",
     ["hopeful", "oral", "accidental", "important"], "c",
     "یک سیستم دفاع از خود از خودش در برابر صدمات تصادفی و حملات بیرونی دفاع می کند."),
    ("A: “So how was the party last night?”      B: “Oh, it was ---------------, - we had a fantastic time!”",
     ["brilliant", "common", "painful", "different"], "a",
     "الف: \"مهمانی دییشب چطور بود؟\" ب: \"اوه عالی بود، خیلی خوش گذشت!\""),
    ("After world war, many countries --------------- to have a great army to protect themselves.",
     ["guessed", "decided", "left", "completed"], "b",
     "بعد از جنگ جهانی، کشورهای زیادی تصمیم گرفتند یک ارتش عالی داشته باشند تا از خودشان محافظت کنند؟"),
    ("The people at the table behind us were --------------- someone’s birthday.",
     ["suggesting", "hoping", "celebrating", "destroying"], "c",
     "آدم های میز پشتی ما داشتند تولد یکی را جشن می گرفتند."),
    ("A dangerous amount of radioactivity was released into the --------------- last month.",
     ["environment", "point", "mirror", "history"], "a",
     "مقدار خطرناک رادیواکتیو ماه پیش در محیط زیست رها شد."),
    ("A leg injury is stopping him from active --------------- in the sport matches.",
     ["description", "information", "participation", "location"], "c",
     "یک مصدومیت از ناحیه پا، اجازه حضور فعالی را به او در مسابقات ورزشی نمی دهد."),
    ("Each room has books, toys, and games that are --------------- to that specific age group.",
     ["suitable", "actual", "interested", "possible"], "a",
     "هر اتاق یک سری کتاب، اسباب بازی و بازی دارد که مناسب آن سن خاص هستند."),
    ("We are planning a dinner to celebrate the 50th --------------- of the founding of the company.",
     ["charity", "account", "anniversary", "personality"], "c",
     "ما داریم یک شام را برنامه ریزی میکنیم تا پنجاهمین سالگرد تاسیس کمپانی را جشن بگیریم."),
    ("He repeated his country’s desire and interest for --------------- relations with all neighboring countries.",
     ["friendly", "selfish", "voluntary", "religious"], "a",
     "او میل و علاقه کشورش را برای روابط دوستانه با تمام کشور های همسایه را بازگو کرد."),
    ("Australia has its own ---------------, which is very different from that of Britain.",
     ["information", "conversation", "culture", "course"], "c",
     "استرالیا فرهنگ خود را دارد، که خیلی متفاوت از فرهنگ بریتانیا است."),
    ("Lots of people always say time changes things, but you --------------- have to change them yourself.",
     ["carefully", "politely", "actually", "hardly"], "c",
     "خیلی از مردم همیشه میگویند که زمان اوضاع را عوض میکند، اما خود شما در واقع باید آن ها عوض کنید."),
    ("I went to several libraries to gather information about a book about --------------- animals.",
     ["careful", "endangered", "serious", "wonderful"], "b",
     "به چندین کتابخانه رفتم تا اطلاعات درباره یک کتاب درباره حیوانات در معرض خطر انقراض جمع کنم."),
    ("The --------------- in the number of bicycles and cars might give rise to another new set of environmental problems.",
     ["military", "information", "injury", "decrease"], "d",
     "کاهش در تعداد دوچرخه ها و ماشین ها ممکن است تا مشکلات محیط زیستی جدیدی را به وجود بیاورد."),
    ("Parents of young children often become depressed, and this is --------------- true of single parents.",
     ["especially", "naturally", "really", "internationally"], "a",
     "والدین فرزندان جوان و کوچک اغلب افسرده میشوند، و این موضوع مخصوصاً درباره پدر ها و مادر های مجرد (آن ها که طلاق گرفته اند) واقعیت دارد."),
    ("If you compare house prices in the two towns, it’s quite --------------- how different they are.",
     ["pleasant", "possible", "serious", "amazing"], "d",
     "اگر قیمت های خانه را در دو شهر مقایسه کنید، این که چقدر با هم متفاوت هستند کاملاً شگفت انگیز است."),
    ("--------------- is to do something to show that you remember and respect someone important or an important event in the past.",
     ["injures", "commemorates", "unscrambles", "identifies"], "b",
     "بزرگداشت یعنی انجام دادن کاری برای اینکه شما، شخص مهم و یا رویداد مهمی در گذشته را به یاد بیاورید یا احترامشان را نشان دهید."),
    ("The average human --------------- in the developed countries has increased over the last hundred years.",
     ["lifespan", "schedule", "nature", "interest"], "a",
     "طول عمر متوسط انسان در کشورهای توسعه یافته در صد سال گذشته افزایش یافته است."),
]

QUIRKS = [
    "Q1: چاپ «میرسید» چسبیده (بدون ZWNJ) و «از بین برده بود» برای destroyed — مترادفِ چاپ (گزینهٔ «نابود کردن» لفظاً در ترجمه نیست)؛ رندر ۴۰۰۰dpi",
    "Q2: چاپ «تاریــخ» با کشیده (tatweel)؛ رونویسی «تاریخ» — «می توانیم/تاریخ های» جدای چاپ (زوم ۴۰۰۰dpi)",
    "Q4: «واکسنهایی» چسبیده چاپ + «کوایران برکت» املای چاپ برای COViran Barekat + «کرونایی» + «مرضی جدی» (لایه «مرییص» نویز — رندر ۴۰۰۰dpi حاکم)",
    "Q9: گزینهٔ ۴ چاپ «شروع کردن» است (لایه «رسی وع کردن» — نویزِ کامل لایه؛ رندر ۱۴۰۰dpi حاکم)",
    "Q14: «در معرض خطر انقراض» بدون یِ پایانی در ترجمه (زوم ۴۰۰۰dpi؛ لایه «فرهنکی» = فرهنگی)",
    "Q15: «احساس خوبی» با ی (زوم ۴۰۰۰dpi)؛ «سپتامبر» (لایه «سپتامی» نویز)",
    "Q23: چاپ «بلا بیرم» (املای چاپ برای «بالا ببرم»؛ زوم ۴۰۰۰dpi؛ گزینهٔ ۴ خود چاپ «بالا بردن» درست دارد) + «شنیده بشود»",
    "Q24: چاپ «یک سیستم دفاع از خود از خودش ... دفاع می کند» — تکرار «از خود از خودش» عینِ چاپ (زوم ۴۰۰۰dpi)",
    "Q25: چاپ «دییشب» با یِ دوبل",
    "Q26: «؟» در پایانِ جملهٔ خبری چاپ («...محافظت کنند؟»)",
    "Q27: چاپ «میز پشتی» با یِ پایانی (زوم ۸۰۰۰dpi؛ لایه «میر» بی‌نقطه و واژهٔ دوم را حذف کرده بود) + ترتیبِ چاپ «داشتند تولد یکی را جشن می گرفتند»",
    "Q29: ترتیبِ چاپ «اجازه حضور فعالی را به او در مسابقات ورزشی نمی دهد» عینِ چاپ؛ «مصدومیت/ورزشی» (لایه: ورزیس)",
    "Q30: چاپ «یک سری کتاب» (لایه «رسی» نویز)",
    "Q32: «را» دوبلِ چاپ («کشورش را ... همسایه را بازگو کرد»)",
    "Q34: گزینهٔ ۱ «به طور با دقت» و گزینهٔ ۲ «با ادبانه» — املای چاپ",
    "Q37: «گرفته اند» با د (زوم ۸۰۰۰dpi؛ خوانشِ نخستِ ۱۴۰۰dpi «ان» رد شد؛ لایه «طالق» = طلاق)",
    "فاصله‌ها: «میشود/میشوند/میکند/میتواند/میتوانند/میکنیم/میگویند» چسبیده چاپ؛ «می کند/می دهد/می توانیم/می گرفتند/می شنویم» جدای چاپ — هر آیتم عینِ چاپ (الگوی r320/r324)",
]


def build_exam3():
    qs = []
    for i, (stem, options, key_letter, translation) in enumerate(ITEMS):
        n = i + 1
        idx = "abcd".index(key_letter)
        # پیش‌داوریِ معنایی: ترجمهٔ چاپ باید گزینهٔ کلید را تأیید کند (لفظی یا مترادف — Q1/Q10 مترادف)
        qs.append({
            "id": f"g10-l6-{n}",
            "n": n,
            "category": "vocab",
            "question": stem,
            "options": options,
            "answer": idx,
            "translation": translation,
        })
    return qs


def main():
    old = json.loads(PATH.read_text(encoding="utf-8"))
    # base = ۵ بانکِ r323/r324 (اگر راندِ قبل اجرا شده، بانک ششم را کنار بگذار)
    base_lessons = old["lessons"][:5] if len(old["lessons"]) == 6 else old["lessons"]
    assert old["grade"] == 10 and len(base_lessons) == 5, "unexpected base shape"
    assert sum(l["count"] for l in base_lessons) == 97, "unexpected base count"
    base_source = {k: v for k, v in old["source"].items() if k != "exam3"}

    qs = build_exam3()
    lesson6 = {
        "lesson": 6,
        "title": "استاندارد — تست واژگان درس اول (ص۵۴-۵۵)",
        "level": "استاندارد — چهارگزینه‌ای",
        "count": len(qs),
        "questions": qs,
    }

    doc = {"grade": 10, "lessons": base_lessons + [lesson6], "source": dict(base_source)}
    doc["source"]["exam3"] = {
        "exam": "تست واژگان درس اول — بخش دوم، سطح استاندارد (سؤالات: ص۵۴ و ۵۵)",
        "header": "سؤالات تستی واژگان درس: «اول» پایه: «دهم» (پاسخنامه صفحه: ۲۴۵ تا ۲۴۷) بخش: «دوم» سطح تستها: «استاندارد»",
        "keyPages": "245-247",
        "keyVerification": "print key pp245-247 «پاسخنامه تستی تستهای واژگان — درس اول، سطح تستها استاندارد» — 40/40 agree with semantic pre-fill (key option reflected in printed translation — lexical in 38, synonym in Q1/Q10), zero divergence",
        "extractedRound": "r325",
        "pattern": "r324 (ترجمهٔ چاپ‌محور) + r311/r323 (بانک درس‌محور) + r320/r321 (عینِ چاپ)",
        "translations": "۴۰ ترجمهٔ چاپی «ترجمه تست» به آیتم‌ها تزریق شد؛ ۱۳ نقطهٔ سرنوشت‌ساز با زومِ ۲۶۰۰-۸۰۰۰dpi داوری شد (تاریــخ/واکسنهایی/کرونایی/مرضی/انقراض/خوبی/بلا بیرم/از خود از خودش/میز پشتی/را دوبل/به طور با دقت/گرفته اند/از بین برده)",
        "printQuirks": QUIRKS,
    }

    total = sum(l["count"] for l in doc["lessons"])
    print(f"built: {len(doc['lessons'])} banks, {total} items (exam3: {lesson6['count']})")
    if old == doc:
        print("identical content — NO-OP")
        return
    PATH.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"written: {PATH}")


if __name__ == "__main__":
    main()
